<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";

header("Content-Type: application/json");

/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
|
| Uses the same Bearer-token authentication used elsewhere
| in CareerForge.
|
*/

function getAuthenticatedUser(PDO $pdo)
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
        WHERE t.token_hash = ?
          AND t.expires_at > NOW()
          AND u.status = 'active'
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        $tokenHash
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

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


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

try {

    /*
     * Use the existing database configuration.
     */
    if (!isset($pdo) || !($pdo instanceof PDO)) {
        sendResponse(
            false,
            "Database connection is unavailable.",
            null,
            500
        );
    }

    /*
     * Authenticate the current user.
     */
    $user = getAuthenticatedUser($pdo);

    $userId = (int) $user["id"];

    $method = strtoupper(
        $_SERVER["REQUEST_METHOD"]
    );


    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    |
    | Returns:
    | 1. All skills from the skills table
    | 2. The authenticated user's selected skill IDs
    |
    */

   if ($method === "GET") {

    try {

        $user = getAuthenticatedUser($pdo);

        if (!$user) {
            sendResponse(
                false,
                "Unauthorized. Please log in again.",
                null,
                401
            );
        }

        $userId = (int) $user["id"];

        /*
        |--------------------------------------------------------------------------
        | LOAD ALL SKILLS
        |--------------------------------------------------------------------------
        */

        $skillStmt = $pdo->prepare("
            SELECT
                id,
                skill_code,
                name,
                category,
                description
            FROM skills
            ORDER BY category ASC, name ASC
        ");

        $skillStmt->execute();

        $skills = $skillStmt->fetchAll(PDO::FETCH_ASSOC);

        /*
        |--------------------------------------------------------------------------
        | LOAD USER SELECTED SKILLS
        |--------------------------------------------------------------------------
        */

        $selectedStmt = $pdo->prepare("
            SELECT skill_id
            FROM user_skills
            WHERE user_id = ?
        ");

        $selectedStmt->execute([$userId]);

        $selectedSkillIds = $selectedStmt->fetchAll(
            PDO::FETCH_COLUMN
        );

        $selectedSkillIds = array_map(
            "intval",
            $selectedSkillIds
        );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        sendResponse(
            true,
            "Skills loaded successfully.",
            [
                "skills" => $skills,
                "selected_skill_ids" => $selectedSkillIds
            ]
        );

    } catch (Throwable $e) {

        error_log(
            "CareerForge skills GET error: " .
            $e->getMessage()
        );

        sendResponse(
            false,
            "Failed to load skills: " . $e->getMessage(),
            null,
            500
        );
    }
}


    /*
    |--------------------------------------------------------------------------
    | PUT
    |--------------------------------------------------------------------------
    |
    | Replaces the authenticated user's selected skills.
    |
    | Expected:
    |
    | {
    |     "skill_ids": [1, 4, 7, 12]
    | }
    |
    */

    if ($method === "PUT") {

        $rawInput =
            file_get_contents("php://input");

        $input = json_decode(
            $rawInput,
            true
        );

        if (!is_array($input)) {
            sendResponse(
                false,
                "Invalid JSON request.",
                null,
                400
            );
        }

        $skillIds =
            $input["skill_ids"]
            ?? null;

        if (!is_array($skillIds)) {
            sendResponse(
                false,
                "skill_ids must be an array.",
                null,
                400
            );
        }


        /*
         * Convert IDs to integers and remove duplicates.
         */
        $cleanSkillIds = [];

        foreach ($skillIds as $skillId) {

            if (
                !is_numeric($skillId) ||
                (int) $skillId <= 0
            ) {
                sendResponse(
                    false,
                    "Invalid skill ID supplied.",
                    null,
                    400
                );
            }

            $cleanSkillIds[] =
                (int) $skillId;
        }

        $cleanSkillIds =
            array_values(
                array_unique($cleanSkillIds)
            );


        /*
         * Make sure every supplied skill actually exists.
         */
        if (count($cleanSkillIds) > 0) {

            $placeholders = implode(
                ",",
                array_fill(
                    0,
                    count($cleanSkillIds),
                    "?"
                )
            );

            $validateSql = "
                SELECT id
                FROM skills
                WHERE id IN ($placeholders)
            ";

            $validateStmt =
                $pdo->prepare($validateSql);

            $validateStmt->execute(
                $cleanSkillIds
            );

            $validRows =
                $validateStmt->fetchAll(
                    PDO::FETCH_COLUMN
                );

            $validIds = array_map(
                "intval",
                $validRows
            );

            $invalidIds =
                array_diff(
                    $cleanSkillIds,
                    $validIds
                );

            if (count($invalidIds) > 0) {
                sendResponse(
                    false,
                    "One or more selected skills do not exist.",
                    [
                        "invalid_skill_ids" =>
                            array_values($invalidIds)
                    ],
                    400
                );
            }
        }


        /*
         * Save everything as one transaction.
         */
        try {

            $pdo->beginTransaction();


            /*
             * Remove the user's previous selections.
             */
            $deleteSql = "
                DELETE FROM user_skills
                WHERE user_id = ?
            ";

            $deleteStmt =
                $pdo->prepare($deleteSql);

            $deleteStmt->execute([
                $userId
            ]);


            /*
             * Insert the new selections.
             */
            if (count($cleanSkillIds) > 0) {

                $insertSql = "
                    INSERT INTO user_skills
                        (user_id, skill_id)
                    VALUES
                        (?, ?)
                ";

                $insertStmt =
                    $pdo->prepare($insertSql);

                foreach (
                    $cleanSkillIds
                    as $skillId
                ) {

                    $insertStmt->execute([
                        $userId,
                        $skillId
                    ]);
                }
            }


            $pdo->commit();


            sendResponse(
                true,
                "Skills saved successfully.",
                [
                    "selected_skill_ids" =>
                        $cleanSkillIds,
                    "count" =>
                        count($cleanSkillIds)
                ]
            );

        } catch (Throwable $error) {

            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            error_log(
                "Skills save error: " .
                $error->getMessage()
            );

            sendResponse(
                false,
                "Unable to save your skills.",
                null,
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | METHOD NOT ALLOWED
    |--------------------------------------------------------------------------
    */

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );


} catch (Throwable $error) {

    error_log(
        "Skills API error: " .
        $error->getMessage()
    );

    sendResponse(
        false,
        "An unexpected server error occurred.",
        null,
        500
    );
}
?>
