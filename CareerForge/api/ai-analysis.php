<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";
require_once __DIR__ . "/config/gemini.php";

function sendResponse($success, $message, $data = null, $statusCode = 200)
{
    http_response_code($statusCode);

    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

try {

    $user = getAuthenticatedUser($pdo);

} catch (Throwable $e) {

    sendResponse(
        false,
        "Authentication failed.",
        null,
        401
    );
}


/*
|--------------------------------------------------------------------------
| STUDENT ONLY
|--------------------------------------------------------------------------
*/

if ($user["role"] !== "student") {

    sendResponse(
        false,
        "Only students can generate employability analyses.",
        null,
        403
    );
}


/*
|--------------------------------------------------------------------------
| METHOD
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    sendResponse(
        false,
        "Method not allowed. Use POST to generate an analysis.",
        null,
        405
    );
}


/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

$rawInput = file_get_contents("php://input");

$input = json_decode($rawInput, true);

if (!is_array($input)) {
    $input = [];
}

$targetRole = trim($input["target_role"] ?? "");

$hasSpecificTargetRole = ($targetRole !== "");

if (!$hasSpecificTargetRole) {
    $targetRole = "General Career Development";
}

/*
|--------------------------------------------------------------------------
| RECENT ANALYSIS PROTECTION
|--------------------------------------------------------------------------
|
| Prevent accidental repeated Gemini requests.
| If the same student already generated an analysis
| for the same target role within the last 60 seconds,
| return the saved analysis instead of calling Gemini again.
|
*/

try {

    $recentAnalysisStmt = $pdo->prepare("
        SELECT
            id,
            target_role,
            score,
            analysis,
            created_at
        FROM ai_assessments
        WHERE user_id = ?
          AND target_role = ?
          AND created_at >= DATE_SUB(NOW(), INTERVAL 60 SECOND)
        ORDER BY id DESC
        LIMIT 1
    ");

    $recentAnalysisStmt->execute([
        $user["id"],
        $targetRole
    ]);

    $recentAnalysis = $recentAnalysisStmt->fetch();

    if ($recentAnalysis) {

        $savedAnalysisData =
            json_decode(
                $recentAnalysis["analysis"],
                true
            );

        if (!is_array($savedAnalysisData)) {
            $savedAnalysisData = [];
        }

        sendResponse(
            true,
            "A recent AI analysis already exists. The saved analysis was returned.",
            [
                "assessment_id" =>
                    (int) $recentAnalysis["id"],

                "target_role" =>
                    $recentAnalysis["target_role"],

                "score" =>
                    (float) $recentAnalysis["score"],

                "employability" => [
                    "score" =>
                        (float) $recentAnalysis["score"],

                    "level" =>
                        $savedAnalysisData["employability_level"]
                        ?? "",

                    "score_factors" =>
                        $savedAnalysisData["score_factors"]
                        ?? [],

                    "overall_assessment" =>
                        $savedAnalysisData["ai"]["overall_assessment"]
                        ?? "",

                    "strengths" =>
                        $savedAnalysisData["ai"]["strengths"]
                        ?? [],

                    "weaknesses" =>
                        $savedAnalysisData["ai"]["weaknesses"]
                        ?? []
                ],

                "skill_gap" =>
                    $savedAnalysisData["skill_gap"]
                    ?? [],

                "opportunity_matches" =>
                    $savedAnalysisData["opportunity_matches"]
                    ?? [],

                "career_paths" =>
                    $savedAnalysisData["ai"]["career_paths"]
                    ?? [],

                "roadmap" =>
                    $savedAnalysisData["ai"]["roadmap"]
                    ?? [],

                "recommendations" =>
                    $savedAnalysisData["ai"]["recommendations"]
                    ?? []
            ]
        );
    }

} catch (Throwable $e) {

    error_log(
        "Recent analysis protection error: "
        . $e->getMessage()
    );

    // Continue with normal analysis generation.
}


/*
|--------------------------------------------------------------------------
| GEMINI CONFIGURATION
|--------------------------------------------------------------------------
*/

$geminiConfig = require __DIR__ . "/config/gemini.php";

$geminiApiKey = trim($geminiConfig["api_key"] ?? "");
$geminiModel = trim($geminiConfig["model"] ?? "gemini-3.6-flash");

if ($geminiApiKey === "") {

    sendResponse(
        false,
        "Gemini API key is not configured.",
        null,
        500
    );
}


/*
|--------------------------------------------------------------------------
| LEVEL HELPERS
|--------------------------------------------------------------------------
*/

$levelValues = [
    "beginner" => 25,
    "intermediate" => 50,
    "advanced" => 75,
    "expert" => 100
];

$levelOrder = [
    "beginner" => 1,
    "intermediate" => 2,
    "advanced" => 3,
    "expert" => 4
];


/*
|--------------------------------------------------------------------------
| LOAD STUDENT PROFILE
|--------------------------------------------------------------------------
*/

try {

    $profileStmt = $pdo->prepare("
        SELECT
            sp.id AS profile_id,
            sp.user_id,
            sp.student_number,
            sp.qualification,
            sp.year_of_study,
            sp.graduation_year,
            sp.campus,
            sp.bio,
            sp.current_company,
            sp.current_position,
            sp.employability_score,
            u.name,
            u.email
        FROM student_profiles sp
        INNER JOIN users u
            ON u.id = sp.user_id
        WHERE sp.user_id = ?
        LIMIT 1
    ");

    $profileStmt->execute([$user["id"]]);

    $studentProfile = $profileStmt->fetch();

    if (!$studentProfile) {

        sendResponse(
            false,
            "Student profile not found.",
            null,
            404
        );
    }


    /*
    |--------------------------------------------------------------------------
    | LOAD STUDENT SKILLS
    |--------------------------------------------------------------------------
    */

    $skillsStmt = $pdo->prepare("
        SELECT
            s.id,
            s.skill_code,
            s.name,
            s.category,
            us.level
        FROM user_skills us
        INNER JOIN skills s
            ON s.id = us.skill_id
        WHERE us.user_id = ?
        ORDER BY s.name ASC
    ");

    $skillsStmt->execute([$user["id"]]);

    $studentSkills = $skillsStmt->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | LOAD CAREER GOALS
    |--------------------------------------------------------------------------
    */

    $goalsStmt = $pdo->prepare("
        SELECT
            cg.id,
            cg.name
        FROM student_career_goals scg
        INNER JOIN career_goals cg
            ON cg.id = scg.career_goal_id
        WHERE scg.student_profile_id = ?
        ORDER BY cg.name ASC
    ");

    $goalsStmt->execute([
        $studentProfile["profile_id"]
    ]);

    $careerGoals = $goalsStmt->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | LOAD PROJECTS
    |--------------------------------------------------------------------------
    */

    $projectsStmt = $pdo->prepare("
        SELECT
            id,
            title,
            description,
            github_url
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
    ");

    $projectsStmt->execute([$user["id"]]);

    $projects = $projectsStmt->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | LOAD OPPORTUNITY REQUIREMENTS
    |--------------------------------------------------------------------------
    |
    | We use OPEN opportunities only.
    | These requirements come from the opportunity_skills table.
    |
    */

    $opportunitiesStmt = $pdo->prepare("
        SELECT
            o.id,
            o.title,
            o.type,
            o.location,
            o.description
        FROM opportunities o
        WHERE o.status = 'open'
        ORDER BY o.id ASC
    ");

    $opportunitiesStmt->execute();

    $opportunities = $opportunitiesStmt->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | LOAD REQUIREMENTS FOR ALL OPEN OPPORTUNITIES
    |--------------------------------------------------------------------------
    */

    $requirementsStmt = $pdo->prepare("
        SELECT
            os.opportunity_id,
            os.required_level,
            os.importance,
            s.id AS skill_id,
            s.skill_code,
            s.name AS skill_name,
            s.category
        FROM opportunity_skills os
        INNER JOIN skills s
            ON s.id = os.skill_id
        INNER JOIN opportunities o
            ON o.id = os.opportunity_id
        WHERE o.status = 'open'
        ORDER BY
            os.opportunity_id,
            CASE os.importance
                WHEN 'essential' THEN 1
                WHEN 'important' THEN 2
                WHEN 'nice_to_have' THEN 3
                ELSE 4
            END,
            s.name
    ");

    $requirementsStmt->execute();

    $allOpportunityRequirements = $requirementsStmt->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | ORGANISE REQUIREMENTS BY OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    $requirementsByOpportunity = [];

    foreach ($allOpportunityRequirements as $requirement) {

        $opportunityId = (int) $requirement["opportunity_id"];

        if (!isset($requirementsByOpportunity[$opportunityId])) {
            $requirementsByOpportunity[$opportunityId] = [];
        }

        $requirementsByOpportunity[$opportunityId][] = $requirement;
    }


    /*
    |--------------------------------------------------------------------------
    | STUDENT SKILLS LOOKUP
    |--------------------------------------------------------------------------
    */

    $studentSkillMap = [];

    foreach ($studentSkills as $skill) {

        $studentSkillMap[(int) $skill["id"]] = [
            "id" => (int) $skill["id"],
            "skill_code" => $skill["skill_code"],
            "name" => $skill["name"],
            "category" => $skill["category"],
            "level" => strtolower($skill["level"]),
            "level_score" => $levelValues[strtolower($skill["level"])] ?? 25
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | OPPORTUNITY SKILL MATCHING ENGINE
    |--------------------------------------------------------------------------
    */

    $opportunityMatches = [];

    foreach ($opportunities as $opportunity) {

        $opportunityId = (int) $opportunity["id"];

        $requirements =
            $requirementsByOpportunity[$opportunityId]
            ?? [];

        if (count($requirements) === 0) {
            continue;
        }

        $matchedSkills = [];
        $strongSkills = [];
        $skillsToImprove = [];
        $missingSkills = [];
        $prioritySkills = [];

        $weightedMatch = 0;
        $totalImportanceWeight = 0;

        foreach ($requirements as $requirement) {

            $skillId = (int) $requirement["skill_id"];

            $requiredLevel =
                strtolower($requirement["required_level"]);

            $importance =
                strtolower($requirement["importance"]);

            $requiredScore =
                $levelValues[$requiredLevel] ?? 50;

            $importanceWeight = match ($importance) {
                "essential" => 3,
                "important" => 2,
                "nice_to_have" => 1,
                default => 1
            };

            $totalImportanceWeight += $importanceWeight;

            /*
            |--------------------------------------------------------------------------
            | STUDENT HAS THIS SKILL
            |--------------------------------------------------------------------------
            */

            if (isset($studentSkillMap[$skillId])) {

                $studentSkill =
                    $studentSkillMap[$skillId];

                $studentLevel =
                    $studentSkill["level"];

                $studentScore =
                    $studentSkill["level_score"];

                /*
                |--------------------------------------------------------------------------
                | MATCH SCORE
                |--------------------------------------------------------------------------
                */

                if ($studentScore >= $requiredScore) {

                    $skillMatch = 100;

                    $matchedSkills[] = [
                        "skill_id" => $skillId,
                        "skill_code" => $requirement["skill_code"],
                        "skill" => $requirement["skill_name"],
                        "student_level" => $studentLevel,
                        "required_level" => $requiredLevel,
                        "importance" => $importance,
                        "match_percentage" => $skillMatch
                    ];

                    if (
                        ($levelOrder[$studentLevel] ?? 1)
                        >
                        ($levelOrder[$requiredLevel] ?? 1)
                    ) {

                        $strongSkills[] = [
                            "skill" => $requirement["skill_name"],
                            "student_level" => $studentLevel,
                            "required_level" => $requiredLevel,
                            "importance" => $importance
                        ];
                    }

                } else {

                    /*
                    |--------------------------------------------------------------------------
                    | BELOW REQUIRED LEVEL
                    |--------------------------------------------------------------------------
                    */

                    $skillMatch =
                        round(
                            ($studentScore / $requiredScore) * 100,
                            1
                        );

                    $skillsToImprove[] = [
                        "skill_id" => $skillId,
                        "skill_code" => $requirement["skill_code"],
                        "skill" => $requirement["skill_name"],
                        "student_level" => $studentLevel,
                        "required_level" => $requiredLevel,
                        "importance" => $importance,
                        "match_percentage" => $skillMatch
                    ];

                    if ($importance === "essential") {

                        $prioritySkills[] = [
                            "skill_id" => $skillId,
                            "skill_code" => $requirement["skill_code"],
                            "skill" => $requirement["skill_name"],
                            "current_level" => $studentLevel,
                            "required_level" => $requiredLevel,
                            "importance" => $importance,
                            "reason" =>
                                "Essential skill is below the required proficiency level."
                        ];
                    }
                }

                $weightedMatch +=
                    $skillMatch * $importanceWeight;

            } else {

                /*
                |--------------------------------------------------------------------------
                | STUDENT DOES NOT HAVE THIS SKILL
                |--------------------------------------------------------------------------
                */

                $skillMatch = 0;

                $missingSkills[] = [
                    "skill_id" => $skillId,
                    "skill_code" => $requirement["skill_code"],
                    "skill" => $requirement["skill_name"],
                    "required_level" => $requiredLevel,
                    "importance" => $importance,
                    "match_percentage" => 0
                ];

                /*
                |--------------------------------------------------------------------------
                | PRIORITY MISSING SKILLS
                |--------------------------------------------------------------------------
                */

                if ($importance === "essential") {

                    $prioritySkills[] = [
                        "skill_id" => $skillId,
                        "skill_code" => $requirement["skill_code"],
                        "skill" => $requirement["skill_name"],
                        "current_level" => null,
                        "required_level" => $requiredLevel,
                        "importance" => $importance,
                        "reason" =>
                            "Essential skill is currently missing from the student's profile."
                    ];
                }

                $weightedMatch +=
                    $skillMatch * $importanceWeight;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | OPPORTUNITY MATCH PERCENTAGE
        |--------------------------------------------------------------------------
        */

        $opportunityMatchPercentage = 0;

        if ($totalImportanceWeight > 0) {

            $opportunityMatchPercentage =
                round(
                    $weightedMatch / $totalImportanceWeight,
                    1
                );
        }

        $opportunityMatchPercentage =
            max(
                0,
                min(
                    100,
                    $opportunityMatchPercentage
                )
            );


        $opportunityMatches[] = [
            "opportunity_id" => $opportunityId,
            "title" => $opportunity["title"],
            "type" => $opportunity["type"],
            "location" => $opportunity["location"],
            "match_percentage" =>
                $opportunityMatchPercentage,
            "required_skill_count" =>
                count($requirements),
            "matched_skill_count" =>
                count($matchedSkills),
            "skills_to_improve_count" =>
                count($skillsToImprove),
            "missing_skill_count" =>
                count($missingSkills),
            "matched_skills" =>
                $matchedSkills,
            "strong_skills" =>
                $strongSkills,
            "skills_to_improve" =>
                $skillsToImprove,
            "missing_skills" =>
                $missingSkills,
            "priority_skills" =>
                $prioritySkills
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | DETERMINE BEST OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    usort(
        $opportunityMatches,
        function ($a, $b) {
            return
                $b["match_percentage"]
                <=>
                $a["match_percentage"];
        }
    );

    $bestOpportunity =
        $opportunityMatches[0]
        ?? null;


    /*
    |--------------------------------------------------------------------------
    | GENERAL SKILL GAP SUMMARY
    |--------------------------------------------------------------------------
    */

    $generalExistingSkills = [];
    $generalStrongSkills = [];
    $generalSkillsToImprove = [];
    $generalMissingSkills = [];
    $generalPrioritySkills = [];

    foreach ($opportunityMatches as $opportunityMatch) {

        foreach ($opportunityMatch["matched_skills"] as $skill) {

            $generalExistingSkills[$skill["skill_id"]] =
                $skill;
        }

        foreach ($opportunityMatch["strong_skills"] as $skill) {

            $generalStrongSkills[$skill["skill"]] =
                $skill;
        }

        foreach ($opportunityMatch["skills_to_improve"] as $skill) {

            $generalSkillsToImprove[$skill["skill_id"]] =
                $skill;
        }

        foreach ($opportunityMatch["missing_skills"] as $skill) {

            $generalMissingSkills[$skill["skill_id"]] =
                $skill;
        }

        foreach ($opportunityMatch["priority_skills"] as $skill) {

            $generalPrioritySkills[$skill["skill_id"]] =
                $skill;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PROFILE COMPLETENESS
    |--------------------------------------------------------------------------
    */

    $profileFields = [
        "name" =>
            $studentProfile["name"],
        "email" =>
            $studentProfile["email"],
        "qualification" =>
            $studentProfile["qualification"],
        "year_of_study" =>
            $studentProfile["year_of_study"],
        "graduation_year" =>
            $studentProfile["graduation_year"],
        "campus" =>
            $studentProfile["campus"],
        "bio" =>
            $studentProfile["bio"],
        "current_company" =>
            $studentProfile["current_company"],
        "current_position" =>
            $studentProfile["current_position"]
    ];

    $completedProfileFields = 0;
    $totalProfileFields = count($profileFields);

    foreach ($profileFields as $value) {

        if (
            $value !== null &&
            trim((string) $value) !== ""
        ) {
            $completedProfileFields++;
        }
    }

    $profileCompletionScore =
        $totalProfileFields > 0
            ? round(
                ($completedProfileFields / $totalProfileFields) * 100,
                1
            )
            : 0;


    /*
    |--------------------------------------------------------------------------
    | QUALIFICATION SCORE
    |--------------------------------------------------------------------------
    */

    $qualification =
        strtolower(
            trim(
                $studentProfile["qualification"] ?? ""
            )
        );

    $qualificationScore = 60;

    if (
        preg_match(
            '/\b(it|information technology|computer science|computer|computing|software engineering|software development|information systems|technology)\b/i',
            $qualification
        )
    ) {
        $qualificationScore = 100;
    }


    /*
    |--------------------------------------------------------------------------
    | PROJECT / EXPERIENCE SCORE
    |--------------------------------------------------------------------------
    */

    $projectCount = count($projects);

    if ($projectCount >= 3) {
        $projectScore = 100;
    } elseif ($projectCount === 2) {
        $projectScore = 80;
    } elseif ($projectCount === 1) {
        $projectScore = 60;
    } else {
        $projectScore = 0;
    }


    /*
    |--------------------------------------------------------------------------
    | CAREER ALIGNMENT
    |--------------------------------------------------------------------------
    */

    $careerAlignmentScore = null;

    if (
        $hasSpecificTargetRole &&
        !empty($careerGoals)
    ) {

        $careerAlignmentScore = 0;

        $targetRoleLower =
            strtolower($targetRole);

        foreach ($careerGoals as $goal) {

            $goalName =
                strtolower($goal["name"]);

            if (
                strpos(
                    $targetRoleLower,
                    "software"
                ) !== false &&
                (
                    strpos(
                        $goalName,
                        "career"
                    ) !== false ||
                    strpos(
                        $goalName,
                        "job"
                    ) !== false ||
                    strpos(
                        $goalName,
                        "skills"
                    ) !== false
                )
            ) {

                $careerAlignmentScore = 100;

                break;
            }

            if (
                strpos(
                    $targetRoleLower,
                    "developer"
                ) !== false &&
                (
                    strpos(
                        $goalName,
                        "career"
                    ) !== false ||
                    strpos(
                        $goalName,
                        "job"
                    ) !== false
                )
            ) {

                $careerAlignmentScore = 100;

                break;
            }

            if (
                strpos(
                    $goalName,
                    "internship"
                ) !== false
            ) {

                $careerAlignmentScore =
                    max(
                        $careerAlignmentScore,
                        80
                    );
            }

            if (
                strpos(
                    $goalName,
                    "job"
                ) !== false
            ) {

                $careerAlignmentScore =
                    max(
                        $careerAlignmentScore,
                        80
                    );
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYABILITY SCORE
    |--------------------------------------------------------------------------
    |
    | Skills                 = 35%
    | Practical Experience   = 30%
    | Qualification          = 15%
    | Profile Completion     = 5%
    | Career Alignment       = 15%
    |
    */

    $weights = [
        "skills" => 0.35,
        "projects" => 0.30,
        "qualification" => 0.15,
        "profile" => 0.05,
        "career_alignment" => 0.15
    ];

    /*
    |--------------------------------------------------------------------------
    | SKILLS SCORE
    |--------------------------------------------------------------------------
    |
    | When opportunity requirements exist, use the student's
    | best opportunity match as the skills-market score.
    |
    | Otherwise fall back to the student's average proficiency.
    |
    */

    if ($bestOpportunity !== null) {

        $skillsScore =
            $bestOpportunity["match_percentage"];

    } elseif (count($studentSkills) > 0) {

        $skillTotal = 0;

        foreach ($studentSkills as $skill) {

            $level =
                strtolower($skill["level"]);

            $skillTotal +=
                $levelValues[$level] ?? 25;
        }

        $skillsScore =
            round(
                $skillTotal / count($studentSkills),
                1
            );

    } else {

        $skillsScore = 0;
    }


    /*
    |--------------------------------------------------------------------------
    | CALCULATE WEIGHTED SCORE
    |--------------------------------------------------------------------------
    */

    $weightedTotal = 0;
    $totalWeight = 0;

    $weightedTotal +=
        $skillsScore *
        $weights["skills"];

    $totalWeight +=
        $weights["skills"];


    $weightedTotal +=
        $projectScore *
        $weights["projects"];

    $totalWeight +=
        $weights["projects"];


    $weightedTotal +=
        $qualificationScore *
        $weights["qualification"];

    $totalWeight +=
        $weights["qualification"];


    $weightedTotal +=
        $profileCompletionScore *
        $weights["profile"];

    $totalWeight +=
        $weights["profile"];


    if (
        $careerAlignmentScore !== null
    ) {

        $weightedTotal +=
            $careerAlignmentScore *
            $weights["career_alignment"];

        $totalWeight +=
            $weights["career_alignment"];
    }


    $employabilityScore = 0;

    if ($totalWeight > 0) {

        $employabilityScore =
            round(
                $weightedTotal / $totalWeight,
                1
            );
    }


    /*
    |--------------------------------------------------------------------------
    | SAFETY CLAMP
    |--------------------------------------------------------------------------
    */

    $employabilityScore =
        max(
            0,
            min(
                100,
                $employabilityScore
            )
        );


    /*
    |--------------------------------------------------------------------------
    | EMPLOYABILITY LEVEL
    |--------------------------------------------------------------------------
    */

    if ($employabilityScore >= 80) {

        $employabilityLevel =
            "Highly Employable";

    } elseif ($employabilityScore >= 65) {

        $employabilityLevel =
            "Strong Potential";

    } elseif ($employabilityScore >= 50) {

        $employabilityLevel =
            "Developing";

    } elseif ($employabilityScore >= 35) {

        $employabilityLevel =
            "Needs Improvement";

    } else {

        $employabilityLevel =
            "Early Career Development";
    }


    /*
    |--------------------------------------------------------------------------
    | SCORE FACTORS
    |--------------------------------------------------------------------------
    */

    $scoreFactors = [
        [
            "factor" => "Skills",
            "score" => $skillsScore,
            "explanation" =>
                $bestOpportunity
                    ? "Skills were compared against actual opportunity requirements."
                    : "Score is based on the proficiency levels of the student's selected skills."
        ],
        [
            "factor" => "Practical Experience",
            "score" => $projectScore,
            "explanation" =>
                "Based on projects currently recorded in the student's profile."
        ],
        [
            "factor" => "Qualification",
            "score" => $qualificationScore,
            "explanation" =>
                "Based on the relevance of the student's recorded qualification."
        ],
        [
            "factor" => "Profile Completion",
            "score" => $profileCompletionScore,
            "explanation" =>
                "Based on the completeness of the student's profile."
        ]
    ];

    if ($careerAlignmentScore !== null) {

        $scoreFactors[] = [
            "factor" => "Career Alignment",
            "score" => $careerAlignmentScore,
            "explanation" =>
                "Based on the student's career goals and selected target role."
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | DATA FOR GEMINI
    |--------------------------------------------------------------------------
    */

    $studentDataForAI = [
        "name" =>
            $studentProfile["name"],
        "qualification" =>
            $studentProfile["qualification"],
        "year_of_study" =>
            $studentProfile["year_of_study"],
        "graduation_year" =>
            $studentProfile["graduation_year"],
        "campus" =>
            $studentProfile["campus"],
        "bio" =>
            $studentProfile["bio"],
        "current_company" =>
            $studentProfile["current_company"],
        "current_position" =>
            $studentProfile["current_position"],
        "career_goals" =>
            array_map(
                function ($goal) {
                    return $goal["name"];
                },
                $careerGoals
            ),
        "skills" =>
            $studentSkills,
        "projects" =>
            $projects
    ];


    /*
    |--------------------------------------------------------------------------
    | GEMINI PROMPT
    |--------------------------------------------------------------------------
    */

    $prompt = "
You are CareerForge AI, an employability and career guidance engine.

You are analysing a real student's career profile.

IMPORTANT RULES:

1. Never invent skills, projects, qualifications, experience,
   certifications, achievements or career goals.

2. Only use information explicitly supplied in the student data.

3. The objective employability score calculated by CareerForge
   is authoritative. Do NOT change it.

4. Opportunity skill requirements are authoritative.
   Do not invent additional requirements.

5. Skill proficiency levels are:
   beginner = 25
   intermediate = 50
   advanced = 75
   expert = 100

6. Do not claim a student has a skill simply because they are
   studying a related qualification.

7. Clearly distinguish:
   - skills the student already has
   - skills where their level is below the requirement
   - skills that are completely missing
   - priority skills that should be developed first

TARGET ROLE:
{$targetRole}

OBJECTIVE EMPLOYABILITY SCORE:
{$employabilityScore}/100

EMPLOYABILITY LEVEL:
{$employabilityLevel}

SCORE FACTORS:
" . json_encode(
        $scoreFactors,
        JSON_PRETTY_PRINT
    ) . "

STUDENT DATA:
" . json_encode(
        $studentDataForAI,
        JSON_PRETTY_PRINT
    ) . "

OPPORTUNITY MATCH ANALYSIS:
" . json_encode(
        $opportunityMatches,
        JSON_PRETTY_PRINT
    ) . "

YOUR TASK:

Generate a concise but useful career analysis.

The analysis must explain:

1. The student's current employability position.
2. Their strongest evidence-based strengths.
3. Their most important skill gaps.
4. Which skills should be prioritised first.
5. How their skills compare with actual opportunities.
6. Practical next steps to improve employability.

If there are no projects, say that no projects are currently
recorded rather than inventing project experience.

If there are no opportunity requirements, say that opportunity
matching is currently unavailable.

Return ONLY valid JSON matching the required schema.
";


    /*
    |--------------------------------------------------------------------------
    | GEMINI REQUEST
    |--------------------------------------------------------------------------
    */

    $geminiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/"
        . urlencode($geminiModel)
        . ":generateContent?key="
        . urlencode($geminiApiKey);


    $responseSchema = [
        "type" => "OBJECT",
        "properties" => [

            "overall_assessment" => [
                "type" => "STRING"
            ],

            "strengths" => [
                "type" => "ARRAY",
                "items" => [
                    "type" => "STRING"
                ]
            ],

            "weaknesses" => [
                "type" => "ARRAY",
                "items" => [
                    "type" => "STRING"
                ]
            ],

            "recommendations" => [
                "type" => "ARRAY",
                "items" => [
                    "type" => "STRING"
                ]
            ],

            "career_paths" => [
                "type" => "ARRAY",
                "items" => [
                    "type" => "OBJECT",
                    "properties" => [
                        "title" => [
                            "type" => "STRING"
                        ],
                        "reason" => [
                            "type" => "STRING"
                        ],
                        "skills_needed" => [
                            "type" => "ARRAY",
                            "items" => [
                                "type" => "STRING"
                            ]
                        ]
                    ],
                    "required" => [
                        "title",
                        "reason",
                        "skills_needed"
                    ]
                ]
            ],

            "roadmap" => [
                "type" => "ARRAY",
                "items" => [
                    "type" => "OBJECT",
                    "properties" => [
                        "step" => [
                            "type" => "STRING"
                        ],
                        "description" => [
                            "type" => "STRING"
                        ],
                        "priority" => [
                            "type" => "STRING"
                        ]
                    ],
                    "required" => [
                        "step",
                        "description",
                        "priority"
                    ]
                ]
            ]
        ],

        "required" => [
            "overall_assessment",
            "strengths",
            "weaknesses",
            "recommendations",
            "career_paths",
            "roadmap"
        ]
    ];


    $geminiPayload = [
        "contents" => [
            [
                "role" => "user",
                "parts" => [
                    [
                        "text" => $prompt
                    ]
                ]
            ]
        ],

        "generationConfig" => [
            "temperature" => 0.2,
            "responseMimeType" => "application/json",
            "responseSchema" => $responseSchema
        ]
    ];


    $ch = curl_init($geminiUrl);

    curl_setopt_array(
        $ch,
        [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json"
            ],
            CURLOPT_POSTFIELDS =>
                json_encode($geminiPayload),
            CURLOPT_TIMEOUT => 60
        ]
    );

    $geminiResponse =
        curl_exec($ch);

    $geminiHttpCode =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

    $curlError =
        curl_error($ch);

    curl_close($ch);


    /*
    |--------------------------------------------------------------------------
    | GEMINI CURL ERROR
    |--------------------------------------------------------------------------
    */

    if ($geminiResponse === false) {

        sendResponse(
            false,
            "Unable to connect to Gemini: " . $curlError,
            null,
            502
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GEMINI HTTP ERROR
    |--------------------------------------------------------------------------
    */

    if (
        $geminiHttpCode < 200 ||
        $geminiHttpCode >= 300
    ) {
        $geminiError = json_decode($geminiResponse, true);

        $errorMessage =
            $geminiError["error"]["message"]
            ?? "Gemini returned HTTP {$geminiHttpCode}.";

        sendResponse(
            false,
            $errorMessage,
            [
                "http_code" => $geminiHttpCode,
                "gemini_error" => $geminiError
            ],
            502
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PARSE GEMINI RESPONSE
    |--------------------------------------------------------------------------
    */

    $geminiDecoded =
        json_decode(
            $geminiResponse,
            true
        );

    if (!is_array($geminiDecoded)) {

        sendResponse(
            false,
            "Gemini returned invalid JSON.",
            null,
            502
        );
    }


    $generatedText =
        $geminiDecoded["candidates"][0]["content"]["parts"][0]["text"]
        ?? "";


    if ($generatedText === "") {

        sendResponse(
            false,
            "Gemini did not return an analysis.",
            null,
            502
        );
    }


    $aiAnalysis =
        json_decode(
            $generatedText,
            true
        );


    if (!is_array($aiAnalysis)) {

        sendResponse(
            false,
            "Gemini analysis could not be parsed.",
            null,
            502
        );
    }


    /*
    |--------------------------------------------------------------------------
    | SAVE SCORE TO STUDENT PROFILE
    |--------------------------------------------------------------------------
    */

    $updateProfileStmt = $pdo->prepare("
        UPDATE student_profiles
        SET employability_score = ?
        WHERE user_id = ?
    ");

    $updateProfileStmt->execute([
        $employabilityScore,
        $user["id"]
    ]);


    /*
    |--------------------------------------------------------------------------
    | SAVE AI ASSESSMENT
    |--------------------------------------------------------------------------
    */

    $savedAnalysis = json_encode(
        [
            "objective_score" =>
                $employabilityScore,

            "employability_level" =>
                $employabilityLevel,

            "score_factors" =>
                $scoreFactors,

            "skill_gap" => [
                "existing_skills" =>
                    array_values(
                        $generalExistingSkills
                    ),

                "strong_skills" =>
                    array_values(
                        $generalStrongSkills
                    ),

                "skills_to_improve" =>
                    array_values(
                        $generalSkillsToImprove
                    ),

                "missing_skills" =>
                    array_values(
                        $generalMissingSkills
                    ),

                "priority_skills" =>
                    array_values(
                        $generalPrioritySkills
                    )
            ],

            "opportunity_matches" =>
                $opportunityMatches,

            "ai" =>
                $aiAnalysis
        ],
        JSON_UNESCAPED_UNICODE
    );


    $assessmentStmt = $pdo->prepare("
        INSERT INTO ai_assessments
            (
                user_id,
                target_role,
                score,
                analysis
            )
        VALUES
            (?, ?, ?, ?)
    ");

    $assessmentStmt->execute([
        $user["id"],
        $targetRole,
        $employabilityScore,
        $savedAnalysis
    ]);

    $assessmentId =
        $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | FINAL RESPONSE
    |--------------------------------------------------------------------------
    */

    sendResponse(
        true,
        "AI employability analysis generated successfully.",
        [
            "assessment_id" =>
                (int) $assessmentId,

            "target_role" =>
                $targetRole,

            "score" =>
                $employabilityScore,

            "employability" => [
                "score" =>
                    $employabilityScore,

                "level" =>
                    $employabilityLevel,

                "score_factors" =>
                    $scoreFactors,

                "overall_assessment" =>
                    $aiAnalysis["overall_assessment"]
                    ?? "",

                "strengths" =>
                    $aiAnalysis["strengths"]
                    ?? [],

                "weaknesses" =>
                    $aiAnalysis["weaknesses"]
                    ?? []
            ],

            "skill_gap" => [
                "existing_skills" =>
                    array_values(
                        $generalExistingSkills
                    ),

                "strong_skills" =>
                    array_values(
                        $generalStrongSkills
                    ),

                "skills_to_improve" =>
                    array_values(
                        $generalSkillsToImprove
                    ),

                "missing_skills" =>
                    array_values(
                        $generalMissingSkills
                    ),

                "priority_skills" =>
                    array_values(
                        $generalPrioritySkills
                    )
            ],

            "opportunity_matches" =>
                $opportunityMatches,

            "career_paths" =>
                $aiAnalysis["career_paths"]
                ?? [],

            "roadmap" =>
                $aiAnalysis["roadmap"]
                ?? [],

            "recommendations" =>
                $aiAnalysis["recommendations"]
                ?? []
        ]
    );


} catch (Throwable $e) {

    sendResponse(
        false,
        "AI analysis failed: " . $e->getMessage(),
        null,
        500
    );
}