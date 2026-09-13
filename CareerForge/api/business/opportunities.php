<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| AUTHENTICATE BUSINESS
|--------------------------------------------------------------------------
*/

function getAuthenticatedBusiness($pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"] ?? "";

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required."
        ]);

        exit;
    }

    $token = trim($matches[1]);

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT
            u.id AS user_id,
            u.role,
            u.status,
            bp.id AS business_id,
            bp.company_name
        FROM api_tokens at
        INNER JOIN users u
            ON at.user_id = u.id
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
            "message" => "Invalid or expired authentication token."
        ]);

        exit;
    }

    if ($business["role"] !== "business") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business access required."
        ]);

        exit;
    }

    if ($business["status"] !== "active") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business account is not active."
        ]);

        exit;
    }

    return $business;
}


/*
|--------------------------------------------------------------------------
| GET BUSINESS OPPORTUNITIES
|--------------------------------------------------------------------------
*/

function getBusinessOpportunities($pdo, $businessId)
{
    $stmt = $pdo->prepare("
        SELECT
            o.id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.work_arrangement,
            o.positions,
            o.minimum_qualification,
            o.deadline,
            o.status,
            o.created_at,

            COUNT(DISTINCT a.id) AS applications,

            COUNT(
                DISTINCT CASE
                    WHEN a.status = 'shortlisted'
                    THEN a.id
                END
            ) AS shortlisted

        FROM opportunities o

        LEFT JOIN applications a
            ON a.opportunity_id = o.id

        WHERE o.business_id = ?

        GROUP BY
            o.id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.work_arrangement,
            o.positions,
            o.minimum_qualification,
            o.deadline,
            o.status,
            o.created_at

        ORDER BY o.created_at DESC
    ");

    $stmt->execute([$businessId]);

    $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | GET REQUIRED SKILLS
    |--------------------------------------------------------------------------
    */

    foreach ($opportunities as &$opportunity) {

        $skillStmt = $pdo->prepare("
            SELECT
                s.id,
                s.name
            FROM opportunity_skills os
            INNER JOIN skills s
                ON os.skill_id = s.id
            WHERE os.opportunity_id = ?
            ORDER BY s.name ASC
        ");

        $skillStmt->execute([
            $opportunity["id"]
        ]);

        $skills = $skillStmt->fetchAll(PDO::FETCH_ASSOC);

        $opportunity["skills"] = $skills;

        $opportunity["applications"] =
            (int) $opportunity["applications"];

        $opportunity["shortlisted"] =
            (int) $opportunity["shortlisted"];

        $opportunity["positions"] =
            (int) $opportunity["positions"];

        $opportunity["id"] =
            (int) $opportunity["id"];
    }

    unset($opportunity);

    return $opportunities;
}


/*
|--------------------------------------------------------------------------
| MAIN REQUEST
|--------------------------------------------------------------------------
*/

try {

    $business = getAuthenticatedBusiness($pdo);

    $method = $_SERVER["REQUEST_METHOD"];


    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    */

    if ($method === "GET") {

        $opportunities = getBusinessOpportunities(
            $pdo,
            $business["business_id"]
        );

        echo json_encode([
            "success" => true,
            "count" => count($opportunities),
            "data" => $opportunities
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PUT
    |--------------------------------------------------------------------------
    | Close an opportunity
    |--------------------------------------------------------------------------
    */

    if ($method === "PUT") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request data."
            ]);

            exit;
        }

        $opportunityId = filter_var(
            $input["opportunity_id"] ?? null,
            FILTER_VALIDATE_INT
        );

        $action = $input["action"] ?? "";


        if (!$opportunityId) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity ID is required."
            ]);

            exit;
        }


        if ($action !== "close") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity action."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | VERIFY OWNERSHIP
        |--------------------------------------------------------------------------
        */

        $checkStmt = $pdo->prepare("
            SELECT
                id,
                status
            FROM opportunities
            WHERE id = ?
            AND business_id = ?
            LIMIT 1
        ");

        $checkStmt->execute([
            $opportunityId,
            $business["business_id"]
        ]);

        $opportunity = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$opportunity) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found."
            ]);

            exit;
        }


        if ($opportunity["status"] === "closed") {

            echo json_encode([
                "success" => true,
                "message" => "Opportunity is already closed."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CLOSE OPPORTUNITY
        |--------------------------------------------------------------------------
        */

        $updateStmt = $pdo->prepare("
            UPDATE opportunities
            SET status = 'closed'
            WHERE id = ?
            AND business_id = ?
        ");

        $updateStmt->execute([
            $opportunityId,
            $business["business_id"]
        ]);


        echo json_encode([
            "success" => true,
            "message" => "Opportunity closed successfully."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | METHOD NOT ALLOWED
    |--------------------------------------------------------------------------
    */

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to process opportunities."
    ]);
}
?>

