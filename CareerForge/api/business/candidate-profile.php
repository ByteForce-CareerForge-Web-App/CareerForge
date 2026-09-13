<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

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
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

$headers = getallheaders();

$authorization =
    $headers["Authorization"]
    ?? $headers["authorization"]
    ?? "";

if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication token is required."
    ]);

    exit;
}

$token = trim($matches[1]);

if ($token === "") {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication token is required."
    ]);

    exit;
}

$tokenHash = hash("sha256", $token);

/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED BUSINESS
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        SELECT
            u.id AS user_id,
            u.name,
            u.email,
            u.role,
            u.status,
            bp.id AS business_id,
            bp.company_name
        FROM api_tokens at
        INNER JOIN users u
            ON u.id = at.user_id
        INNER JOIN business_profiles bp
            ON bp.user_id = u.id
        WHERE at.token_hash = ?
          AND at.expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $business = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$business) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Your session has expired. Please log in again."
        ]);

        exit;
    }

    if (
        $business["role"] !== "business" ||
        $business["status"] !== "active"
    ) {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business account access is required."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | APPLICATION ID
    |--------------------------------------------------------------------------
    */

    $applicationId = $_GET["application_id"] ?? null;

    if (
        $applicationId === null ||
        !ctype_digit((string) $applicationId) ||
        (int) $applicationId <= 0
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "A valid application ID is required."
        ]);

        exit;
    }

    $applicationId = (int) $applicationId;

    /*
    |--------------------------------------------------------------------------
    | LOAD APPLICATION + CANDIDATE + OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            a.id AS application_id,
            a.student_id,
            a.opportunity_id,
            a.status AS application_status,
            a.applied_at,

            o.title AS opportunity_title,
            o.description AS opportunity_description,

            u.name AS candidate_name,
            u.email AS candidate_email,

            sp.qualification,
            sp.year_of_study,
            sp.graduation_year,
            sp.campus,
            sp.bio,
            sp.current_company,
            sp.current_position,
            sp.employability_score

        FROM applications a

        INNER JOIN opportunities o
            ON o.id = a.opportunity_id

        INNER JOIN users u
            ON u.id = a.student_id

        LEFT JOIN student_profiles sp
            ON sp.user_id = a.student_id

        WHERE a.id = ?
          AND o.business_id = ?

        LIMIT 1
    ");

    $stmt->execute([
        $applicationId,
        $business["business_id"]
    ]);

    $candidate = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$candidate) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Candidate application not found."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT APPLICATION STATUS
    |--------------------------------------------------------------------------
    */

    $statusMap = [
        "submitted" => "Under Review",
        "reviewing" => "Under Review",
        "shortlisted" => "Shortlisted",
        "interview" => "Interview",
        "rejected" => "Rejected",
        "accepted" => "Accepted",
        "withdrawn" => "Withdrawn"
    ];

    $applicationStatus =
        $statusMap[$candidate["application_status"]]
        ?? "Under Review";

    /*
    |--------------------------------------------------------------------------
    | LOAD CANDIDATE SKILLS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            s.id,
            s.name
        FROM user_skills us
        INNER JOIN skills s
            ON s.id = us.skill_id
        WHERE us.user_id = ?
        ORDER BY s.name ASC
    ");

    $stmt->execute([
        $candidate["student_id"]
    ]);

    $candidateSkills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | LOAD REQUIRED OPPORTUNITY SKILLS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            s.id,
            s.name
        FROM opportunity_skills os
        INNER JOIN skills s
            ON s.id = os.skill_id
        WHERE os.opportunity_id = ?
        ORDER BY s.name ASC
    ");

    $stmt->execute([
        $candidate["opportunity_id"]
    ]);

    $requiredSkills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | CALCULATE CANDIDATE MATCH
    |--------------------------------------------------------------------------
    |
    | The match compares the candidate's selected skills against the
    | skills required by the opportunity.
    |
    | If the opportunity has no required skills, we fall back to the
    | student's employability score where available.
    |
    */

    $candidateSkillIds = [];

    foreach ($candidateSkills as $skill) {
        $candidateSkillIds[] = (int) $skill["id"];
    }

    $requiredSkillIds = [];

    foreach ($requiredSkills as $skill) {
        $requiredSkillIds[] = (int) $skill["id"];
    }

    $aiMatch = null;

    if (count($requiredSkillIds) > 0) {

        $matchedSkills = array_intersect(
            $requiredSkillIds,
            $candidateSkillIds
        );

        $aiMatch = round(
            (count($matchedSkills) / count($requiredSkillIds)) * 100
        );

    } elseif (
        $candidate["employability_score"] !== null &&
        is_numeric($candidate["employability_score"])
    ) {

        $aiMatch = round(
            (float) $candidate["employability_score"]
        );

    } else {

        $aiMatch = 0;
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT APPLIED DATE
    |--------------------------------------------------------------------------
    */

    $appliedDate = $candidate["applied_at"];

    if ($appliedDate) {
        $timestamp = strtotime($appliedDate);

        if ($timestamp !== false) {

            $difference =
                time() - $timestamp;

            if ($difference < 60) {
                $appliedText = "Just now";
            } elseif ($difference < 3600) {
                $minutes = floor($difference / 60);

                $appliedText =
                    $minutes . " "
                    . ($minutes === 1 ? "minute" : "minutes")
                    . " ago";
            } elseif ($difference < 86400) {
                $hours = floor($difference / 3600);

                $appliedText =
                    $hours . " "
                    . ($hours === 1 ? "hour" : "hours")
                    . " ago";
            } else {
                $days = floor($difference / 86400);

                if ($days < 7) {

                    $appliedText =
                        $days . " "
                        . ($days === 1 ? "day" : "days")
                        . " ago";

                } elseif ($days < 30) {

                    $weeks = floor($days / 7);

                    $appliedText =
                        $weeks . " "
                        . ($weeks === 1 ? "week" : "weeks")
                        . " ago";

                } else {

                    $appliedText =
                        date("d M Y", $timestamp);
                }
            }

        } else {
            $appliedText = date("d M Y", strtotime($appliedDate));
        }

    } else {
        $appliedText = "Not available";
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "data" => [
            "application_id" =>
                (int) $candidate["application_id"],

            "student_id" =>
                (int) $candidate["student_id"],

            "opportunity_id" =>
                (int) $candidate["opportunity_id"],

            "name" =>
                $candidate["candidate_name"],

            "email" =>
                $candidate["candidate_email"],

            "qualification" =>
                $candidate["qualification"]
                ?? "Not provided",

            "year_of_study" =>
                $candidate["year_of_study"],

            "graduation_year" =>
                $candidate["graduation_year"],

            "campus" =>
                $candidate["campus"],

            "bio" =>
                $candidate["bio"],

            "current_company" =>
                $candidate["current_company"],

            "current_position" =>
                $candidate["current_position"],

            "opportunity" =>
                $candidate["opportunity_title"],

            "applied" =>
                $appliedText,

            "applied_at" =>
                $candidate["applied_at"],

            "status" =>
                $applicationStatus,

            "skills" =>
                array_map(
                    function ($skill) {
                        return $skill["name"];
                    },
                    $candidateSkills
                ),

            "required_skills" =>
                array_map(
                    function ($skill) {
                        return $skill["name"];
                    },
                    $requiredSkills
                ),

            "ai_match" =>
                (int) $aiMatch,

            "employability_score" =>
                $candidate["employability_score"] !== null
                    ? (float) $candidate["employability_score"]
                    : null
        ]
    ]);

} catch (PDOException $e) {

    error_log(
        "Candidate profile API error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load candidate profile."
    ]);
}