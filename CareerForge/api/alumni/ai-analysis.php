<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

try {

    /*
    |--------------------------------------------------------------------------
    | Authenticate Alumni
    |--------------------------------------------------------------------------
    */

    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required"
        ]);

        exit;
    }

    if (($user["role"] ?? "") !== "alumni") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Only alumni can use the alumni AI analysis."
        ]);

        exit;
    }

    $userId = (int) $user["id"];

    /*
    |--------------------------------------------------------------------------
    | Read Request
    |--------------------------------------------------------------------------
    */

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        $input = [];
    }

    $targetRole = trim(
        $input["target_role"] ?? ""
    );

    /*
    |--------------------------------------------------------------------------
    | Load Alumni Profile
    |--------------------------------------------------------------------------
    */

    $profileStmt = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,

            ap.qualification,
            ap.graduation_year,
            ap.company,
            ap.position,
            ap.verified

        FROM users u

        LEFT JOIN alumni_profiles ap
            ON ap.user_id = u.id

        WHERE u.id = ?

        LIMIT 1
    ");

    $profileStmt->execute([
        $userId
    ]);

    $profile = $profileStmt->fetch();

    if (!$profile) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Alumni profile not found."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Load Skills
    |--------------------------------------------------------------------------
    */

    $skillsStmt = $pdo->prepare("
        SELECT
            s.id,
            s.skill_code,
            s.name,
            s.category
        FROM user_skills us

        INNER JOIN skills s
            ON s.id = us.skill_id

        WHERE us.user_id = ?

        ORDER BY s.name ASC
    ");

    $skillsStmt->execute([
        $userId
    ]);

    $skills = $skillsStmt->fetchAll();

    $skillNames = [];

    foreach ($skills as $skill) {
        if (!empty($skill["name"])) {
            $skillNames[] = $skill["name"];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Professional Experience
    |--------------------------------------------------------------------------
    */

    $experience = [];

    try {

        $experienceStmt = $pdo->prepare("
            SELECT
                id,
                job_title,
                company,
                start_year,
                end_year,
                description
            FROM alumni_experiences
            WHERE user_id = ?
            ORDER BY start_year DESC, id DESC
        ");

        $experienceStmt->execute([
            $userId
        ]);

        $experience = $experienceStmt->fetchAll();

    } catch (PDOException $experienceError) {

        /*
         * Experience should not prevent the AI analysis from working
         * if the table is not available.
         */

        $experience = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Build Experience Summary
    |--------------------------------------------------------------------------
    */

    $experienceSummary = [];

    foreach ($experience as $item) {

        $experienceSummary[] = [
            "job_title" =>
                $item["job_title"] ?? "",

            "company" =>
                $item["company"] ?? "",

            "start_year" =>
                $item["start_year"] ?? "",

            "end_year" =>
                $item["end_year"] ?? "",

            "description" =>
                $item["description"] ?? ""
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Determine Experience Level
    |--------------------------------------------------------------------------
    */

    $experienceCount = count($experience);

    if ($experienceCount >= 5) {
        $experienceLevel = "Extensive";
    } elseif ($experienceCount >= 3) {
        $experienceLevel = "Strong";
    } elseif ($experienceCount >= 1) {
        $experienceLevel = "Developing";
    } else {
        $experienceLevel = "Limited";
    }

    /*
    |--------------------------------------------------------------------------
    | Gemini Configuration
    |--------------------------------------------------------------------------
    |
    | Keep the Gemini API key on the PHP backend.
    |
    */

    $geminiApiKey = getenv("GEMINI_API_KEY");

    /*
     * Support the project's config/gemini.php if it exists.
     */

    $geminiConfigPath =
        __DIR__ . "/../config/gemini.php";

    if (file_exists($geminiConfigPath)) {

        $geminiConfig = require $geminiConfigPath;

        if (is_array($geminiConfig)) {

            if (
                empty($geminiApiKey) &&
                !empty($geminiConfig["api_key"])
            ) {
                $geminiApiKey =
                    $geminiConfig["api_key"];
            }

            if (
                empty($geminiApiKey) &&
                !empty($geminiConfig["GEMINI_API_KEY"])
            ) {
                $geminiApiKey =
                    $geminiConfig["GEMINI_API_KEY"];
            }
        }
    }

    if (empty($geminiApiKey)) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Gemini API key is not configured on the server."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Build Alumni AI Prompt
    |--------------------------------------------------------------------------
    */

    $profileJson = json_encode(
        [
            "name" =>
                $profile["name"] ?? "",

            "qualification" =>
                $profile["qualification"] ?? "",

            "graduation_year" =>
                $profile["graduation_year"] ?? "",

            "current_company" =>
                $profile["company"] ?? "",

            "current_position" =>
                $profile["position"] ?? "",

            "verified" =>
                (bool) ($profile["verified"] ?? false),

            "skills" =>
                $skillNames,

            "experience_level" =>
                $experienceLevel,

            "professional_experience" =>
                $experienceSummary
        ],
        JSON_PRETTY_PRINT
    );

    $requestedRoleText =
        $targetRole !== ""
            ? $targetRole
            : "Use the alumni's profile to identify the most suitable career directions.";

    $prompt = <<<PROMPT
You are CareerForgeAI, an AI-powered career intelligence system.

You are analysing an ALUMNI / GRADUATE professional.

Your task is to evaluate the person's career readiness based ONLY on the information supplied in their profile.

Do not invent qualifications, skills, companies, job titles, experience or achievements.

The alumni should receive practical, personalised and realistic career guidance.

TARGET CAREER REQUEST:
{$requestedRoleText}

ALUMNI PROFILE:
{$profileJson}

Return ONLY valid JSON.

The JSON MUST follow this exact structure:

{
  "target_role": "string",
  "employability": {
    "score": 0,
    "level": "Career Ready",
    "overall_assessment": "string",
    "strengths": [
      "string"
    ],
    "weaknesses": [
      "string"
    ],
    "score_factors": [
      {
        "factor": "Profile Strength",
        "score": 0,
        "explanation": "string"
      }
    ]
  },
  "skill_gap": {
    "existing_skills": [
      "string"
    ],
    "strong_skills": [
      "string"
    ],
    "skills_to_improve": [
      "string"
    ],
    "missing_skills": [
      "string"
    ],
    "priority_skills": [
      {
        "skill": "string",
        "priority": "High",
        "reason": "string"
      }
    ]
  },
  "career_paths": [
    {
      "career": "string",
      "why_it_fits": "string",
      "readiness": "Ready",
      "important_skills": [
        "string"
      ],
      "missing_skills": [
        "string"
      ],
      "next_step": "string"
    }
  ],
  "roadmap": [
    {
      "step": 1,
      "title": "string",
      "description": "string"
    }
  ],
  "recommendations": [
    "string"
  ]
}

RULES:

1. employability.score MUST be a number from 0 to 100.

2. The score must reflect:
   - qualification
   - relevant skills
   - professional experience
   - career progression
   - profile completeness
   - relevance of skills to likely career paths

3. Do not automatically give a high score simply because the person has a qualification.

4. Alumni with meaningful professional experience should receive appropriate credit for that experience.

5. The analysis should distinguish between:
   - strong existing skills
   - skills that need improvement
   - genuinely missing skills

6. priority must be exactly one of:
   - High
   - Medium
   - Low

7. readiness must be a concise label such as:
   - Ready
   - Nearly Ready
   - Developing
   - Early Stage

8. Provide 3 to 5 realistic career paths.

9. Career paths must be related to the supplied qualification, skills and experience.

10. Do not recommend careers requiring completely unrelated qualifications unless clearly labelled as requiring additional education.

11. Provide 4 to 6 practical roadmap steps.

12. Provide 4 to 6 recommendations.

13. Recommendations should be actionable, such as:
   - improve a specific skill
   - obtain a relevant certification
   - build a portfolio project
   - improve CV
   - gain practical experience
   - network with professionals
   - apply for relevant opportunities

14. Keep explanations concise enough for a mobile application.

15. Return JSON only. Do not use markdown.
PROMPT;

    /*
    |--------------------------------------------------------------------------
    | Gemini Request
    |--------------------------------------------------------------------------
    */

    $endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/"
        . "gemini-3.6-flash:generateContent?key="
        . urlencode($geminiApiKey);

    $payload = [
        "contents" => [
            [
                "parts" => [
                    [
                        "text" => $prompt
                    ]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.3,
            "topK" => 32,
            "topP" => 0.9,
            "maxOutputTokens" => 5000
        ]
    ];

    $ch = curl_init($endpoint);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS =>
            json_encode($payload),

        CURLOPT_TIMEOUT => 60
    ]);

    $geminiResponse =
        curl_exec($ch);

    $curlError =
        curl_error($ch);

    $httpStatus =
        curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

    curl_close($ch);

    if ($geminiResponse === false || $curlError) {

        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to connect to the Gemini AI service.",
            "error" =>
                $curlError
        ]);

        exit;
    }

    $geminiData =
        json_decode(
            $geminiResponse,
            true
        );

    if (
        $httpStatus < 200 ||
        $httpStatus >= 300
    ) {

        $message =
            $geminiData["error"]["message"]
            ?? "Gemini AI returned an error.";

        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" => $message
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Gemini Text
    |--------------------------------------------------------------------------
    */

    $generatedText =
        $geminiData["candidates"][0]["content"]["parts"][0]["text"]
        ?? "";

    if (trim($generatedText) === "") {

        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" =>
                "Gemini returned an empty analysis."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Clean JSON Response
    |--------------------------------------------------------------------------
    */

    $generatedText =
        trim($generatedText);

    /*
     * Remove markdown code fences if Gemini
     * returns them despite the instruction.
     */

    $generatedText =
        preg_replace(
            "/^```(?:json)?\s*/i",
            "",
            $generatedText
        );

    $generatedText =
        preg_replace(
            "/\s*```$/",
            "",
            $generatedText
        );

    $generatedText =
        trim($generatedText);

    $analysis =
        json_decode(
            $generatedText,
            true
        );

    if (
        !is_array($analysis) ||
        json_last_error() !== JSON_ERROR_NONE
    ) {

        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" =>
                "Gemini returned an invalid analysis format."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Normalise Important Fields
    |--------------------------------------------------------------------------
    */

    $score =
        isset($analysis["employability"]["score"])
            ? (float) $analysis["employability"]["score"]
            : 0;

    $score =
        max(
            0,
            min(
                100,
                $score
            )
        );

    $analysis["employability"]["score"] =
        round($score, 2);

    $analysis["score"] =
        round($score, 2);

    $analysis["target_role"] =
        $analysis["target_role"]
        ?? $targetRole;

    $analysis["employability"]["level"] =
        $analysis["employability"]["level"]
        ?? (
            $score >= 80
                ? "Career Ready"
                : (
                    $score >= 60
                        ? "Nearly Ready"
                        : "Developing"
                )
        );

    $analysis["employability"]["overall_assessment"] =
        $analysis["employability"]["overall_assessment"]
        ?? "CareerForgeAI has analysed your professional profile.";

    $analysis["employability"]["strengths"] =
        is_array(
            $analysis["employability"]["strengths"] ?? null
        )
            ? $analysis["employability"]["strengths"]
            : [];

    $analysis["employability"]["weaknesses"] =
        is_array(
            $analysis["employability"]["weaknesses"] ?? null
        )
            ? $analysis["employability"]["weaknesses"]
            : [];

    $analysis["employability"]["score_factors"] =
        is_array(
            $analysis["employability"]["score_factors"] ?? null
        )
            ? $analysis["employability"]["score_factors"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Skill Gap Defaults
    |--------------------------------------------------------------------------
    */

    if (!isset($analysis["skill_gap"])) {
        $analysis["skill_gap"] = [];
    }

    $analysis["skill_gap"]["existing_skills"] =
        is_array(
            $analysis["skill_gap"]["existing_skills"] ?? null
        )
            ? $analysis["skill_gap"]["existing_skills"]
            : $skillNames;

    $analysis["skill_gap"]["strong_skills"] =
        is_array(
            $analysis["skill_gap"]["strong_skills"] ?? null
        )
            ? $analysis["skill_gap"]["strong_skills"]
            : [];

    $analysis["skill_gap"]["skills_to_improve"] =
        is_array(
            $analysis["skill_gap"]["skills_to_improve"] ?? null
        )
            ? $analysis["skill_gap"]["skills_to_improve"]
            : [];

    $analysis["skill_gap"]["missing_skills"] =
        is_array(
            $analysis["skill_gap"]["missing_skills"] ?? null
        )
            ? $analysis["skill_gap"]["missing_skills"]
            : [];

    $analysis["skill_gap"]["priority_skills"] =
        is_array(
            $analysis["skill_gap"]["priority_skills"] ?? null
        )
            ? $analysis["skill_gap"]["priority_skills"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Career Paths / Roadmap / Recommendations
    |--------------------------------------------------------------------------
    */

    $analysis["career_paths"] =
        is_array(
            $analysis["career_paths"] ?? null
        )
            ? $analysis["career_paths"]
            : [];

    $analysis["roadmap"] =
        is_array(
            $analysis["roadmap"] ?? null
        )
            ? $analysis["roadmap"]
            : [];

    $analysis["recommendations"] =
        is_array(
            $analysis["recommendations"] ?? null
        )
            ? $analysis["recommendations"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Save Assessment
    |--------------------------------------------------------------------------
    */

    $saveTargetRole =
        trim(
            $analysis["target_role"] ?? ""
        );

    if ($saveTargetRole === "") {
        $saveTargetRole =
            "Alumni Career Analysis";
    }

    $analysisJson =
        json_encode(
            $analysis,
            JSON_UNESCAPED_UNICODE
        );

    $insertStmt = $pdo->prepare("
        INSERT INTO ai_assessments
        (
            user_id,
            target_role,
            score,
            analysis
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?
        )
    ");

    $insertStmt->execute([
        $userId,
        $saveTargetRole,
        $score,
        $analysisJson
    ]);

    $assessmentId =
        (int) $pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | Return Result
    |--------------------------------------------------------------------------
    */

    $analysis["assessment_id"] =
        $assessmentId;

    $analysis["created_at"] =
        date("Y-m-d H:i:s");

    echo json_encode([
        "success" => true,
        "message" =>
            "Alumni career analysis generated successfully.",
        "data" => $analysis
    ]);

} catch (PDOException $e) {

    error_log(
        "Alumni AI Analysis PDO Error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "A database error occurred while generating the alumni analysis."
    ]);

} catch (Throwable $e) {

    error_log(
        "Alumni AI Analysis Error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "An unexpected error occurred while generating the alumni analysis."
    ]);
}