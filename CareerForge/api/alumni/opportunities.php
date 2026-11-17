<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function sendResponse(
    bool $success,
    string $message,
    $data = [],
    int $statusCode = 200
) {
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
| GET AUTHENTICATED ALUMNI
|--------------------------------------------------------------------------
*/

function getAuthenticatedAlumni(PDO $pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"]
        ?? $headers["authorization"]
        ?? null;

    if (!$authorization) {
        sendResponse(
            false,
            "Authentication token is required",
            [],
            401
        );
    }

    if (
        !preg_match(
            '/Bearer\s+(.+)/i',
            $authorization,
            $matches
        )
    ) {
        sendResponse(
            false,
            "Invalid authentication token",
            [],
            401
        );
    }

    $token = trim($matches[1]);

    if ($token === "") {
        sendResponse(
            false,
            "Invalid authentication token",
            [],
            401
        );
    }

    $tokenHash = hash(
        "sha256",
        $token
    );

    try {
        $stmt = $pdo->prepare("
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.role,
                u.status,
                ap.id AS alumni_profile_id,
                ap.qualification,
                ap.graduation_year,
                ap.company,
                ap.position,
                ap.verified
            FROM api_tokens at
            INNER JOIN users u
                ON at.user_id = u.id
            INNER JOIN alumni_profiles ap
                ON ap.user_id = u.id
            WHERE at.token_hash = ?
              AND at.expires_at > NOW()
              AND u.role = 'alumni'
              AND u.status = 'active'
            LIMIT 1
        ");

        $stmt->execute([
            $tokenHash
        ]);

        $alumni = $stmt->fetch(
            PDO::FETCH_ASSOC
        );

        if (!$alumni) {
            sendResponse(
                false,
                "Invalid or expired authentication token",
                [],
                401
            );
        }

        return $alumni;

    } catch (PDOException $e) {

        error_log(
            "Alumni authentication error: " .
            $e->getMessage()
        );

        sendResponse(
            false,
            "Authentication error",
            [],
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| AUTHENTICATE REQUEST
|--------------------------------------------------------------------------
*/

$alumni = getAuthenticatedAlumni($pdo);


/*
|--------------------------------------------------------------------------
| ONLY GET IS CURRENTLY SUPPORTED
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    sendResponse(
        false,
        "Method not allowed",
        [],
        405
    );
}


/*
|--------------------------------------------------------------------------
| LOAD OPEN OPPORTUNITIES
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| opportunities.business_id references
| business_profiles.id
|
| NOT business_profiles.user_id.
|
| This matches the existing Business opportunities
| implementation, which uses:
|
|     bp.id AS business_id
|
| when creating/managing opportunities.
|
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        SELECT
            o.id,
            o.business_id,
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
            bp.company_name
        FROM opportunities o
        INNER JOIN business_profiles bp
            ON o.business_id = bp.id
        WHERE o.status = 'open'
        ORDER BY o.created_at DESC
    ");

    $stmt->execute();

    $opportunities = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    /*
    |--------------------------------------------------------------------------
    | LOAD REQUIRED SKILLS FOR EACH OPPORTUNITY
    |--------------------------------------------------------------------------
    */

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


    foreach ($opportunities as &$opportunity) {

        /*
        |----------------------------------------------------------------------
        | Load skills
        |----------------------------------------------------------------------
        */

        $skillStmt->execute([
            $opportunity["id"]
        ]);

        $skills = $skillStmt->fetchAll(
            PDO::FETCH_ASSOC
        );


        /*
        |----------------------------------------------------------------------
        | Format skills for the mobile app
        |----------------------------------------------------------------------
        */

        $formattedSkills = [];

            foreach ($skills as $skill) {
                $formattedSkills[] = $skill["name"];
        }

        $opportunity["skills"] = $formattedSkills;


        /*
        |----------------------------------------------------------------------
        | Format IDs and numeric values
        |----------------------------------------------------------------------
        */

        $opportunity["id"] =
            (int) $opportunity["id"];

        $opportunity["business_id"] =
            (int) $opportunity["business_id"];

        if (
            $opportunity["positions"] !== null &&
            $opportunity["positions"] !== ""
        ) {
            $opportunity["positions"] =
                (int) $opportunity["positions"];
        }


        /*
        |----------------------------------------------------------------------
        | Format opportunity type
        |----------------------------------------------------------------------
        */

        $type = strtolower(
            trim(
                (string) $opportunity["type"]
            )
        );

        switch ($type) {

            case "internship":
                $opportunity["type"] =
                    "Internship";
                break;

            case "graduate_program":
            case "graduate programme":
            case "graduate programme":
                $opportunity["type"] =
                    "Graduate Programme";
                break;

            case "job":
            case "full-time":
            case "full_time":
                $opportunity["type"] =
                    "Full-time";
                break;

            case "learnership":
                $opportunity["type"] =
                    "Learnership";
                break;

            case "volunteer":
                $opportunity["type"] =
                    "Volunteer";
                break;

            case "other":
                $opportunity["type"] =
                    "Other";
                break;

            default:
                $opportunity["type"] =
                    $opportunity["type"] ?: "Other";
                break;
        }


        /*
        |----------------------------------------------------------------------
        | Salary
        |--------------------------------------------------------------------------
        |
        | The current opportunities table does not provide
        | a confirmed salary field.
        |
        | Therefore we return null rather than inventing
        | salary information.
        |
        |--------------------------------------------------------------------------
        */

        $opportunity["salary"] = null;


        /*
        |----------------------------------------------------------------------
        | AI Match
        |--------------------------------------------------------------------------
        |
        | AI matching can be connected later.
        |
        | The current endpoint does not calculate a match
        | percentage, so return null rather than inventing
        | a percentage.
        |
        |--------------------------------------------------------------------------
        */

        $opportunity["match"] = null;
    }

    unset($opportunity);


    /*
    |--------------------------------------------------------------------------
    | RETURN SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

    sendResponse(
        true,
        "Alumni opportunities loaded successfully.",
        $opportunities
    );


} catch (PDOException $e) {

    error_log(
        "Alumni opportunities error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "Could not load alumni opportunities.",
        [],
        500
    );
}

