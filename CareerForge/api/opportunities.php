<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

header("Content-Type: application/json");

/*
|--------------------------------------------------------------------------
| REQUEST METHOD
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

try {

    /*
    |--------------------------------------------------------------------------
    | GET AUTHENTICATED USER
    |--------------------------------------------------------------------------
    |
    | The authenticated user is needed so that the match percentage can
    | be calculated against the student's selected skills.
    |
    */

    $user = getAuthenticatedUser($pdo);

    if (!$user) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }

    $userId = (int) $user["id"];

    /*
    |--------------------------------------------------------------------------
    | OPPORTUNITY ID
    |--------------------------------------------------------------------------
    */

    $opportunityId = $_GET["id"] ?? null;

    /*
    |--------------------------------------------------------------------------
    | HELPER: GET REQUIRED SKILLS
    |--------------------------------------------------------------------------
    */

    $getSkills = function (int $id) use ($pdo) {

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

        $stmt->execute([$id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    };

    /*
    |--------------------------------------------------------------------------
    | HELPER: CALCULATE MATCH PERCENTAGE
    |--------------------------------------------------------------------------
    |
    | Match =
    |
    | student's matching required skills
    | --------------------------------- x 100
    | total required skills
    |
    */

    $calculateMatch = function (int $id, int $studentUserId) use ($pdo) {

        $stmt = $pdo->prepare("
            SELECT
                COUNT(DISTINCT os.skill_id) AS required_count,
                COUNT(
                    DISTINCT CASE
                        WHEN us.skill_id IS NOT NULL
                        THEN os.skill_id
                    END
                ) AS matched_count
            FROM opportunity_skills os
            LEFT JOIN user_skills us
                ON us.skill_id = os.skill_id
                AND us.user_id = ?
            WHERE os.opportunity_id = ?
        ");

        $stmt->execute([
            $studentUserId,
            $id
        ]);

        $matchData = $stmt->fetch(PDO::FETCH_ASSOC);

        $requiredCount = (int) ($matchData["required_count"] ?? 0);
        $matchedCount = (int) ($matchData["matched_count"] ?? 0);

        /*
        |--------------------------------------------------------------------------
        | NO REQUIRED SKILLS
        |--------------------------------------------------------------------------
        |
        | We do not claim a match when the opportunity has no required
        | skills.
        |
        */

        if ($requiredCount === 0) {
            return 0;
        }

        return (int) round(
            ($matchedCount / $requiredCount) * 100
        );
    };

    /*
    |--------------------------------------------------------------------------
    | GET SINGLE OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    if ($opportunityId !== null) {

        if (
            !is_numeric($opportunityId)
            || (int) $opportunityId <= 0
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity ID."
            ]);

            exit;
        }

        $id = (int) $opportunityId;

        $stmt = $pdo->prepare("
            SELECT
                o.id,
                o.business_id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.salary,
                o.work_arrangement,
                o.positions,
                o.minimum_qualification,
                o.qualification,
                o.deadline,
                o.status,
                o.created_at,
                b.company_name
            FROM opportunities o
            INNER JOIN business_profiles b
                ON b.id = o.business_id
            WHERE o.id = ?
              AND o.status = 'open'
            LIMIT 1
        ");

        $stmt->execute([$id]);

        $opportunity = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$opportunity) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found."
            ]);

            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | GET REQUIRED SKILLS
        |--------------------------------------------------------------------------
        */

        $opportunity["skills"] = $getSkills($id);

        /*
        |--------------------------------------------------------------------------
        | CALCULATE STUDENT MATCH
        |--------------------------------------------------------------------------
        */

        $opportunity["match_percentage"] =
            $calculateMatch(
                $id,
                $userId
            );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "data" => $opportunity
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL OPEN OPPORTUNITIES
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            o.id,
            o.business_id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.salary,
            o.work_arrangement,
            o.positions,
            o.minimum_qualification,
            o.qualification,
            o.deadline,
            o.status,
            o.created_at,
            b.company_name
        FROM opportunities o
        INNER JOIN business_profiles b
            ON b.id = o.business_id
        WHERE o.status = 'open'
        ORDER BY o.created_at DESC
    ");

    $stmt->execute();

    $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | ADD SKILLS + MATCH TO EACH OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    foreach ($opportunities as &$opportunity) {

        $id = (int) $opportunity["id"];

        $opportunity["skills"] =
            $getSkills($id);

        $opportunity["match_percentage"] =
            $calculateMatch(
                $id,
                $userId
            );
    }

    unset($opportunity);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "count" => count($opportunities),
        "data" => $opportunities
    ]);

} catch (Throwable $e) {

    error_log(
        "CareerForge opportunities error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve opportunities."
    ]);
}
?>