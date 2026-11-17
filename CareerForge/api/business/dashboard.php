<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| Only GET is allowed
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Get Bearer token
|--------------------------------------------------------------------------
*/

$headers = getallheaders();

$authorization =
    $headers["Authorization"]
    ?? $headers["authorization"]
    ?? "";

if (
    !preg_match(
        '/Bearer\s+(.+)/i',
        $authorization,
        $matches
    )
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication token is required"
    ]);

    exit;
}

$token = trim($matches[1]);

if ($token === "") {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication token is required"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Hash token
|--------------------------------------------------------------------------
*/

$tokenHash = hash(
    "sha256",
    $token
);


/*
|--------------------------------------------------------------------------
| Authenticate business
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,

        bp.id AS business_profile_id,
        bp.company_name,
        bp.registration_number,
        bp.industry,
        bp.description,
        bp.verification_status

    FROM api_tokens at

    INNER JOIN users u
        ON u.id = at.user_id

    INNER JOIN business_profiles bp
        ON bp.user_id = u.id

    WHERE at.token_hash = ?

      AND (
          at.expires_at IS NULL
          OR at.expires_at > NOW()
      )

    LIMIT 1
");

$stmt->execute([
    $tokenHash
]);

$business = $stmt->fetch(PDO::FETCH_ASSOC);


if (!$business) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Your session has expired. Please log in again."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Make sure account is a business account
|--------------------------------------------------------------------------
*/

if (
    $business["role"] !== "business"
    || $business["status"] !== "active"
) {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Business account access is required"
    ]);

    exit;
}


$businessId =
    (int) $business["business_profile_id"];


/*
|--------------------------------------------------------------------------
| Active opportunities
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM opportunities
    WHERE business_id = ?
      AND status = 'open'
");

$stmt->execute([
    $businessId
]);

$activeOpportunities =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Total applications
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    WHERE o.business_id = ?
");

$stmt->execute([
    $businessId
]);

$totalApplications =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Shortlisted applications
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    WHERE o.business_id = ?
      AND a.status = 'shortlisted'
");

$stmt->execute([
    $businessId
]);

$shortlisted =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Interview applications
|--------------------------------------------------------------------------
|
| The application status now supports:
| submitted, reviewing, shortlisted, interview,
| rejected, accepted, withdrawn
|
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    WHERE o.business_id = ?
      AND a.status = 'interview'
");

$stmt->execute([
    $businessId
]);

$interviews =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Applications needing review
|--------------------------------------------------------------------------
|
| submitted = newly submitted
| reviewing = currently being reviewed
|
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    WHERE o.business_id = ?

      AND a.status IN (
          'submitted',
          'reviewing'
      )
");

$stmt->execute([
    $businessId
]);

$applicationsNeedingReview =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| New applications this week
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    WHERE o.business_id = ?

      AND a.applied_at >= DATE_SUB(
          NOW(),
          INTERVAL 7 DAY
      )
");

$stmt->execute([
    $businessId
]);

$newApplicationsThisWeek =
    (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Recent applications
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        a.id,
        a.opportunity_id,
        a.status,
        a.applied_at,

        o.title AS opportunity_title,
        o.type AS opportunity_type,

        u.name AS candidate_name

    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    INNER JOIN student_profiles sp
        ON sp.user_id = a.student_id

    INNER JOIN users u
        ON u.id = a.student_id

    WHERE o.business_id = ?

    ORDER BY a.applied_at DESC

    LIMIT 3
");

$stmt->execute([
    $businessId
]);

$recentApplications =
    $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Format recent applications
|--------------------------------------------------------------------------
*/

$formattedRecentApplications = [];

foreach ($recentApplications as $application) {

    $candidateName =
        trim($application["candidate_name"] ?? "");

    $initials = "";

    if ($candidateName !== "") {

        $parts = preg_split(
            '/\s+/',
            $candidateName
        );

        if (count($parts) >= 2) {

            $initials =
                strtoupper(
                    substr($parts[0], 0, 1)
                    .
                    substr(
                        $parts[count($parts) - 1],
                        0,
                        1
                    )
                );

        } else {

            $initials =
                strtoupper(
                    substr(
                        $candidateName,
                        0,
                        2
                    )
                );
        }
    }

    $formattedRecentApplications[] = [

        "id" =>
            (int) $application["id"],

        "opportunity_id" =>
            (int) $application["opportunity_id"],

        "candidate_name" =>
            $candidateName !== ""
                ? $candidateName
                : "Candidate",

        "initials" =>
            $initials !== ""
                ? $initials
                : "CA",

        "opportunity_title" =>
            $application["opportunity_title"]
            ?? "Opportunity",

        "opportunity_type" =>
            $application["opportunity_type"]
            ?? "other",

        "status" =>
            $application["status"],

        "applied_at" =>
            $application["applied_at"]
    ];
}


/*
|--------------------------------------------------------------------------
| AI Hiring Insight
|--------------------------------------------------------------------------
|
| This is a deterministic candidate-matching algorithm.
|
| It compares:
|
|   Candidate skills
|          VS
|   Required opportunity skills
|
| Match percentage:
|
|   matched required skills
|   ----------------------- x 100
|   total required skills
|
| If an opportunity has no required skills, the candidate's
| employability_score is used as a fallback.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get all applications belonging to this business
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        a.id AS application_id,
        a.student_id,
        a.opportunity_id,
        a.status,

        o.title AS opportunity_title,

        u.name AS candidate_name,

        sp.employability_score

    FROM applications a

    INNER JOIN opportunities o
        ON o.id = a.opportunity_id

    INNER JOIN users u
        ON u.id = a.student_id

    LEFT JOIN student_profiles sp
        ON sp.user_id = a.student_id

    WHERE o.business_id = ?

    ORDER BY a.applied_at DESC
");

$stmt->execute([
    $businessId
]);

$businessApplications =
    $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Prepare matching data
|--------------------------------------------------------------------------
*/

$applicationMatches = [];


/*
|--------------------------------------------------------------------------
| Process every application
|--------------------------------------------------------------------------
*/

foreach ($businessApplications as $application) {

    $studentId =
        (int) $application["student_id"];

    $opportunityId =
        (int) $application["opportunity_id"];


    /*
    |--------------------------------------------------------------------------
    | Get required skills for opportunity
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            os.skill_id

        FROM opportunity_skills os

        WHERE os.opportunity_id = ?
    ");

    $stmt->execute([
        $opportunityId
    ]);

    $requiredSkillRows =
        $stmt->fetchAll(PDO::FETCH_COLUMN);


    $requiredSkillIds = [];

    foreach ($requiredSkillRows as $skillId) {

        $requiredSkillIds[] =
            (int) $skillId;
    }


    /*
    |--------------------------------------------------------------------------
    | Get candidate skills
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            us.skill_id

        FROM user_skills us

        WHERE us.user_id = ?
    ");

    $stmt->execute([
        $studentId
    ]);

    $candidateSkillRows =
        $stmt->fetchAll(PDO::FETCH_COLUMN);


    $candidateSkillIds = [];

    foreach ($candidateSkillRows as $skillId) {

        $candidateSkillIds[] =
            (int) $skillId;
    }


    /*
    |--------------------------------------------------------------------------
    | Calculate match percentage
    |--------------------------------------------------------------------------
    */

    $matchPercentage = 0;


    if (count($requiredSkillIds) > 0) {

        $matchedSkills =
            array_intersect(
                $requiredSkillIds,
                $candidateSkillIds
            );

        $matchedCount =
            count($matchedSkills);

        $requiredCount =
            count($requiredSkillIds);

        $matchPercentage =
            round(
                ($matchedCount / $requiredCount) * 100
            );

    } else {

        /*
        |--------------------------------------------------------------------------
        | Fallback to employability score
        |--------------------------------------------------------------------------
        */

        if (
            $application["employability_score"] !== null
            && is_numeric(
                $application["employability_score"]
            )
        ) {

            $matchPercentage =
                round(
                    (float) $application["employability_score"]
                );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Keep percentage within 0–100
    |--------------------------------------------------------------------------
    */

    $matchPercentage =
        max(
            0,
            min(
                100,
                $matchPercentage
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Store result
    |--------------------------------------------------------------------------
    */

    $applicationMatches[] = [

        "application_id" =>
            (int) $application["application_id"],

        "student_id" =>
            $studentId,

        "opportunity_id" =>
            $opportunityId,

        "candidate_name" =>
            trim(
                $application["candidate_name"]
                ?? ""
            ) !== ""
                ? trim(
                    $application["candidate_name"]
                )
                : "Candidate",

        "opportunity_title" =>
            $application["opportunity_title"]
            ?? "Opportunity",

        "status" =>
            $application["status"],

        "match_percentage" =>
            $matchPercentage
    ];
}


/*
|--------------------------------------------------------------------------
| Count AI hiring categories
|--------------------------------------------------------------------------
*/

$strongMatches = 0;
$potentialMatches = 0;
$needReview = 0;


foreach ($applicationMatches as $match) {

    $percentage =
        (int) $match["match_percentage"];


    /*
    |--------------------------------------------------------------------------
    | Strong match
    |--------------------------------------------------------------------------
    */

    if ($percentage >= 80) {

        $strongMatches++;
    }


    /*
    |--------------------------------------------------------------------------
    | Potential match
    |--------------------------------------------------------------------------
    */

    elseif ($percentage >= 50) {

        $potentialMatches++;
    }


    /*
    |--------------------------------------------------------------------------
    | Needs review
    |--------------------------------------------------------------------------
    |
    | Only applications that have not yet been processed
    | are considered needing review.
    |
    */

    if (
        $match["status"] === "submitted"
        || $match["status"] === "reviewing"
    ) {

        $needReview++;
    }
}


/*
|--------------------------------------------------------------------------
| Determine top recommendation
|--------------------------------------------------------------------------
*/

$topRecommendation = null;

$highestMatch = -1;


foreach ($applicationMatches as $match) {

    $percentage =
        (int) $match["match_percentage"];


    if ($percentage > $highestMatch) {

        $highestMatch =
            $percentage;

        $topRecommendation = [

            "candidate_name" =>
                $match["candidate_name"],

            "opportunity_title" =>
                $match["opportunity_title"],

            "match_percentage" =>
                $percentage
        ];
    }
}


/*
|--------------------------------------------------------------------------
| AI insight availability
|--------------------------------------------------------------------------
*/

$aiAvailable =
    count($applicationMatches) > 0;


/*
|--------------------------------------------------------------------------
| AI insight message
|--------------------------------------------------------------------------
*/

if (!$aiAvailable) {

    $aiMessage =
        "AI candidate matching will appear here once applications are received.";

} elseif ($topRecommendation !== null) {

    $aiMessage =
        $topRecommendation["candidate_name"]
        . " has a "
        . $topRecommendation["match_percentage"]
        . "% match for the "
        . $topRecommendation["opportunity_title"]
        . " opportunity.";

} else {

    $aiMessage =
        "Candidate matching analysis is available.";
}


/*
|--------------------------------------------------------------------------
| Build AI insight response
|--------------------------------------------------------------------------
*/

$aiInsight = [

    "available" =>
        $aiAvailable,

    "strong_matches" =>
        $strongMatches,

    "potential_matches" =>
        $potentialMatches,

    "need_review" =>
        $needReview,

    "top_recommendation" =>
        $topRecommendation,

    "message" =>
        $aiMessage
];


/*
|--------------------------------------------------------------------------
| Return dashboard
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "message" =>
        "Business dashboard loaded successfully",

    "business" => [

        "user_id" =>
            (int) $business["id"],

        "business_profile_id" =>
            $businessId,

        "name" =>
            $business["name"],

        "email" =>
            $business["email"],

        "company_name" =>
            $business["company_name"],

        "registration_number" =>
            $business["registration_number"],

        "industry" =>
            $business["industry"],

        "description" =>
            $business["description"],

        "verification_status" =>
            $business["verification_status"]
    ],

    "stats" => [

        "active_opportunities" =>
            $activeOpportunities,

        "total_applications" =>
            $totalApplications,

        "shortlisted" =>
            $shortlisted,

        "interviews" =>
            $interviews,

        "new_applications_this_week" =>
            $newApplicationsThisWeek,

        "applications_needing_review" =>
            $applicationsNeedingReview
    ],

    "ai_insight" =>
        $aiInsight,

    "recent_applications" =>
        $formattedRecentApplications
]);
?>