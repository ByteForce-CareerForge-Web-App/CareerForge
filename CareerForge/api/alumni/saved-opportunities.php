<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

function sendResponse(
    bool $success,
    string $message,
    $data = null,
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

function getAuthenticatedAlumni(PDO $pdo)
{
    $headers = getallheaders();

    $authorization =
        $headers["Authorization"]
        ?? $headers["authorization"]
        ?? "";

    if (!$authorization) {
        sendResponse(
            false,
            "Authentication token is required.",
            null,
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
            "Invalid authorization header.",
            null,
            401
        );
    }

    $token = trim($matches[1]);

    if ($token === "") {
        sendResponse(
            false,
            "Authentication token is required.",
            null,
            401
        );
    }

    $tokenHash = hash(
        "sha256",
        $token
    );

    $sql = "
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.status
        FROM api_tokens t
        INNER JOIN users u
            ON t.user_id = u.id
        INNER JOIN alumni_profiles ap
            ON ap.user_id = u.id
        WHERE t.token_hash = ?
          AND t.expires_at > NOW()
          AND u.role = 'alumni'
          AND u.status = 'active'
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        $tokenHash
    ]);

    $user = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$user) {
        sendResponse(
            false,
            "Invalid or expired authentication token.",
            null,
            401
        );
    }

    return $user;
}

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=careerforge;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE =>
                PDO::ERRMODE_EXCEPTION,

            PDO::ATTR_DEFAULT_FETCH_MODE =>
                PDO::FETCH_ASSOC,
        ]
    );

    $user =
        getAuthenticatedAlumni($pdo);

    $userId =
        (int) $user["id"];

    $method =
        strtoupper($_SERVER["REQUEST_METHOD"]);

    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    | Load all opportunities saved by the
    | currently authenticated alumni.
    */

    if ($method === "GET") {

        $sql = "
            SELECT
                so.id AS saved_id,
                so.saved_at,

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

                bp.company_name

            FROM saved_opportunities so

            INNER JOIN opportunities o
                ON so.opportunity_id = o.id

            INNER JOIN business_profiles bp
                ON o.business_id = bp.id

            WHERE so.user_id = ?

            ORDER BY so.saved_at DESC
        ";

        $stmt =
            $pdo->prepare($sql);

        $stmt->execute([
            $userId
        ]);

        $opportunities =
            $stmt->fetchAll();

        foreach (
            $opportunities
            as &$opportunity
        ) {

            $opportunity["id"] =
                (int) $opportunity["id"];

            $opportunity["saved_id"] =
                (int) $opportunity["saved_id"];

            $opportunity["positions"] =
                (int) $opportunity["positions"];

            /*
            |--------------------------------------------------------------------------
            | Format opportunity type
            |--------------------------------------------------------------------------
            */

            $type =
                strtolower(
                    trim(
                        $opportunity["type"] ?? ""
                    )
                );

            switch ($type) {

                case "internship":
                    $opportunity["type"] =
                        "Internship";
                    break;

                case "graduate_program":
                case "graduate programme":
                case "graduate program":
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

                default:
                    $opportunity["type"] =
                        "Other";
                    break;
            }

            /*
            |--------------------------------------------------------------------------
            | Salary
            |--------------------------------------------------------------------------
            |
            | The current opportunities table does not
            | have a confirmed salary field.
            |
            */

            $opportunity["salary"] =
                null;

            /*
            |--------------------------------------------------------------------------
            | Skills
            |--------------------------------------------------------------------------
            */

            $skillsSql = "
                SELECT
                    s.id,
                    s.name
                FROM opportunity_skills os
                INNER JOIN skills s
                    ON os.skill_id = s.id
                WHERE os.opportunity_id = ?
                ORDER BY s.name ASC
            ";

            $skillsStmt =
                $pdo->prepare(
                    $skillsSql
                );

            $skillsStmt->execute([
                $opportunity["id"]
            ]);

            $skills =
                $skillsStmt->fetchAll();

            $formattedSkills = [];

            foreach ($skills as $skill) {
                $formattedSkills[] =
                    $skill["name"];
            }

            $opportunity["skills"] =
                $formattedSkills;
        }

        unset($opportunity);

        sendResponse(
            true,
            "Saved opportunities loaded successfully.",
            $opportunities
        );
    }

    /*
    |--------------------------------------------------------------------------
    | POST
    |--------------------------------------------------------------------------
    | Save an opportunity.
    */

    if ($method === "POST") {

        $input =
            json_decode(
                file_get_contents("php://input"),
                true
            );

        if (!is_array($input)) {
            sendResponse(
                false,
                "Invalid request body.",
                null,
                400
            );
        }

        $opportunityId =
            $input["opportunity_id"]
            ?? $input["opportunityId"]
            ?? null;

        if (
            !is_numeric($opportunityId) ||
            (int) $opportunityId <= 0
        ) {
            sendResponse(
                false,
                "A valid opportunity ID is required.",
                null,
                400
            );
        }

        $opportunityId =
            (int) $opportunityId;

        /*
        |--------------------------------------------------------------------------
        | Confirm opportunity exists
        |--------------------------------------------------------------------------
        */

        $checkStmt =
            $pdo->prepare("
                SELECT
                    id,
                    title,
                    status
                FROM opportunities
                WHERE id = ?
                LIMIT 1
            ");

        $checkStmt->execute([
            $opportunityId
        ]);

        $opportunity =
            $checkStmt->fetch();

        if (!$opportunity) {
            sendResponse(
                false,
                "Opportunity not found.",
                null,
                404
            );
        }

        if (
            strtolower(
                $opportunity["status"] ?? ""
            ) !== "open"
        ) {
            sendResponse(
                false,
                "This opportunity is no longer open.",
                null,
                400
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Check whether already saved
        |--------------------------------------------------------------------------
        */

        $existingStmt =
            $pdo->prepare("
                SELECT
                    id
                FROM saved_opportunities
                WHERE user_id = ?
                  AND opportunity_id = ?
                LIMIT 1
            ");

        $existingStmt->execute([
            $userId,
            $opportunityId
        ]);

        $existing =
            $existingStmt->fetch();

        if ($existing) {
            sendResponse(
                true,
                "Opportunity is already saved.",
                [
                    "saved_id" =>
                        (int) $existing["id"]
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        */

        $insertStmt =
            $pdo->prepare("
                INSERT INTO saved_opportunities
                (
                    user_id,
                    opportunity_id
                )
                VALUES (?, ?)
            ");

        $insertStmt->execute([
            $userId,
            $opportunityId
        ]);

        $savedId =
            (int) $pdo->lastInsertId();

        sendResponse(
            true,
            "Opportunity saved successfully.",
            [
                "saved_id" =>
                    $savedId,

                "opportunity_id" =>
                    $opportunityId
            ],
            201
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    |
    | Supports:
    |
    | {
    |   "opportunity_id": 5
    | }
    |
    | or:
    |
    | {
    |   "saved_id": 3
    | }
    |
    | or:
    |
    | {
    |   "clear_all": true
    | }
    |
    */

    if ($method === "DELETE") {

        $input =
            json_decode(
                file_get_contents("php://input"),
                true
            );

        if (!is_array($input)) {
            $input = [];
        }

        /*
        |--------------------------------------------------------------------------
        | Clear all
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $input["clear_all"]
            )
        ) {

            $stmt =
                $pdo->prepare("
                    DELETE FROM saved_opportunities
                    WHERE user_id = ?
                ");

            $stmt->execute([
                $userId
            ]);

            sendResponse(
                true,
                "All saved opportunities cleared successfully."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete by saved ID
        |--------------------------------------------------------------------------
        */

        $savedId =
            $input["saved_id"]
            ?? $input["savedId"]
            ?? null;

        if (
            is_numeric($savedId) &&
            (int) $savedId > 0
        ) {

            $stmt =
                $pdo->prepare("
                    DELETE FROM saved_opportunities
                    WHERE id = ?
                      AND user_id = ?
                ");

            $stmt->execute([
                (int) $savedId,
                $userId
            ]);

            if (
                $stmt->rowCount() === 0
            ) {
                sendResponse(
                    false,
                    "Saved opportunity not found.",
                    null,
                    404
                );
            }

            sendResponse(
                true,
                "Opportunity removed from saved opportunities."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete by opportunity ID
        |--------------------------------------------------------------------------
        */

        $opportunityId =
            $input["opportunity_id"]
            ?? $input["opportunityId"]
            ?? null;

        if (
            is_numeric($opportunityId) &&
            (int) $opportunityId > 0
        ) {

            $stmt =
                $pdo->prepare("
                    DELETE FROM saved_opportunities
                    WHERE opportunity_id = ?
                      AND user_id = ?
                ");

            $stmt->execute([
                (int) $opportunityId,
                $userId
            ]);

            if (
                $stmt->rowCount() === 0
            ) {
                sendResponse(
                    false,
                    "Saved opportunity not found.",
                    null,
                    404
                );
            }

            sendResponse(
                true,
                "Opportunity removed from saved opportunities."
            );
        }

        sendResponse(
            false,
            "A valid saved opportunity ID or opportunity ID is required.",
            null,
            400
        );
    }

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );

} catch (PDOException $e) {

    error_log(
        "Alumni saved opportunities database error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "A database error occurred.",
        null,
        500
    );

} catch (Throwable $e) {

    error_log(
        "Alumni saved opportunities error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "An unexpected server error occurred.",
        null,
        500
    );
}

