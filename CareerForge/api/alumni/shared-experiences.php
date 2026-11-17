<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";


function sendResponse(
    bool $success,
    string $message,
    $data = null,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    $response = [
        "success" => $success,
        "message" => $message
    ];

    if ($data !== null) {
        $response["data"] = $data;
    }

    echo json_encode($response);
    exit;
}


try {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        sendResponse(
            false,
            "Authentication required.",
            null,
            401
        );
    }

    $currentUserId = (int) $user["id"];
    $currentRole = $user["role"];


    /*
    |--------------------------------------------------------------------------
    | Alumni-only access
    |--------------------------------------------------------------------------
    */

    if ($currentRole !== "alumni") {
        sendResponse(
            false,
            "Only alumni can access shared experiences.",
            null,
            403
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Read JSON body
    |--------------------------------------------------------------------------
    */

    $rawInput = file_get_contents("php://input");

    $input = [];

    if (!empty($rawInput)) {

        $decodedInput = json_decode(
            $rawInput,
            true
        );

        if (
            json_last_error() === JSON_ERROR_NONE &&
            is_array($decodedInput)
        ) {
            $input = $decodedInput;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    | Retrieve the logged-in alumni member's shared experiences.
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $stmt = $pdo->prepare("
            SELECT
                id,
                alumni_id,
                title,
                category,
                experience,
                advice,
                created_at,
                updated_at

            FROM alumni_shared_experiences

            WHERE alumni_id = :alumni_id

            ORDER BY created_at DESC, id DESC
        ");

        $stmt->execute([
            ":alumni_id" => $currentUserId
        ]);

        $experiences = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


        foreach ($experiences as &$item) {

            $item["id"] = (int) $item["id"];

            $item["alumni_id"] =
                (int) $item["alumni_id"];

            /*
             * These fields are useful for the existing UI.
             */
            $item["description"] =
                mb_substr(
                    trim($item["experience"]),
                    0,
                    150
                );

            if (
                mb_strlen(
                    trim($item["experience"])
                ) > 150
            ) {
                $item["description"] .= "...";
            }


            /*
             * Keep a simple display date.
             */
            if (!empty($item["updated_at"])) {

                $timestamp =
                    strtotime($item["updated_at"]);

                if ($timestamp !== false) {

                    $item["date"] =
                        date(
                            "j F Y",
                            $timestamp
                        );

                } else {

                    $item["date"] =
                        "Recently shared";
                }

            } else {

                $item["date"] =
                    "Recently shared";
            }
        }

        unset($item);


        sendResponse(
            true,
            "Shared experiences retrieved successfully.",
            [
                "experiences" => $experiences
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | POST
    |--------------------------------------------------------------------------
    | Create a new shared experience.
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $title =
            isset($input["title"])
                ? trim((string) $input["title"])
                : "";

        $category =
            isset($input["category"])
                ? trim((string) $input["category"])
                : "";

        $experience =
            isset($input["experience"])
                ? trim((string) $input["experience"])
                : "";

        $advice =
            isset($input["advice"])
                ? trim((string) $input["advice"])
                : "";


        /*
         * Validation
         */

        if ($title === "") {

            sendResponse(
                false,
                "Experience title is required.",
                null,
                400
            );
        }

        if ($category === "") {

            sendResponse(
                false,
                "Experience category is required.",
                null,
                400
            );
        }

        if ($experience === "") {

            sendResponse(
                false,
                "Career experience is required.",
                null,
                400
            );
        }

        if ($advice === "") {

            sendResponse(
                false,
                "Advice is required.",
                null,
                400
            );
        }


        /*
         * Insert
         */

        $stmt = $pdo->prepare("
            INSERT INTO alumni_shared_experiences (
                alumni_id,
                title,
                category,
                experience,
                advice
            )
            VALUES (
                :alumni_id,
                :title,
                :category,
                :experience,
                :advice
            )
        ");

        $stmt->execute([
            ":alumni_id" => $currentUserId,
            ":title" => $title,
            ":category" => $category,
            ":experience" => $experience,
            ":advice" => $advice
        ]);


        $experienceId =
            (int) $pdo->lastInsertId();


        sendResponse(
            true,
            "Experience published successfully.",
            [
                "id" => $experienceId,
                "title" => $title,
                "category" => $category,
                "experience" => $experience,
                "advice" => $advice
            ],
            201
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PUT
    |--------------------------------------------------------------------------
    | Update an existing experience belonging to this alumni member.
    */

    if ($_SERVER["REQUEST_METHOD"] === "PUT") {

        $experienceId =
            isset($input["id"])
                ? (int) $input["id"]
                : 0;


        if ($experienceId <= 0) {

            sendResponse(
                false,
                "A valid experience ID is required.",
                null,
                400
            );
        }


        /*
         * Check ownership
         */

        $checkStmt = $pdo->prepare("
            SELECT id
            FROM alumni_shared_experiences
            WHERE id = :id
              AND alumni_id = :alumni_id
            LIMIT 1
        ");

        $checkStmt->execute([
            ":id" => $experienceId,
            ":alumni_id" => $currentUserId
        ]);

        $existing =
            $checkStmt->fetch(PDO::FETCH_ASSOC);


        if (!$existing) {

            sendResponse(
                false,
                "Experience not found or you are not authorised to edit it.",
                null,
                404
            );
        }


        $title =
            isset($input["title"])
                ? trim((string) $input["title"])
                : "";

        $category =
            isset($input["category"])
                ? trim((string) $input["category"])
                : "";

        $experience =
            isset($input["experience"])
                ? trim((string) $input["experience"])
                : "";

        $advice =
            isset($input["advice"])
                ? trim((string) $input["advice"])
                : "";


        /*
         * Validation
         */

        if ($title === "") {

            sendResponse(
                false,
                "Experience title is required.",
                null,
                400
            );
        }

        if ($category === "") {

            sendResponse(
                false,
                "Experience category is required.",
                null,
                400
            );
        }

        if ($experience === "") {

            sendResponse(
                false,
                "Career experience is required.",
                null,
                400
            );
        }

        if ($advice === "") {

            sendResponse(
                false,
                "Advice is required.",
                null,
                400
            );
        }


        /*
         * Update
         */

        $updateStmt = $pdo->prepare("
            UPDATE alumni_shared_experiences

            SET
                title = :title,
                category = :category,
                experience = :experience,
                advice = :advice

            WHERE id = :id
              AND alumni_id = :alumni_id
        ");

        $updateStmt->execute([
            ":title" => $title,
            ":category" => $category,
            ":experience" => $experience,
            ":advice" => $advice,
            ":id" => $experienceId,
            ":alumni_id" => $currentUserId
        ]);


        sendResponse(
            true,
            "Experience updated successfully.",
            [
                "id" => $experienceId,
                "title" => $title,
                "category" => $category,
                "experience" => $experience,
                "advice" => $advice
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    | Delete an experience belonging to this alumni member.
    */

    if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

        $experienceId =
            isset($input["id"])
                ? (int) $input["id"]
                : 0;


        if ($experienceId <= 0) {

            sendResponse(
                false,
                "A valid experience ID is required.",
                null,
                400
            );
        }


        /*
         * Delete only if it belongs to the logged-in alumni.
         */

        $deleteStmt = $pdo->prepare("
            DELETE FROM alumni_shared_experiences

            WHERE id = :id
              AND alumni_id = :alumni_id
        ");

        $deleteStmt->execute([
            ":id" => $experienceId,
            ":alumni_id" => $currentUserId
        ]);


        if ($deleteStmt->rowCount() === 0) {

            sendResponse(
                false,
                "Experience not found or you are not authorised to delete it.",
                null,
                404
            );
        }


        sendResponse(
            true,
            "Experience deleted successfully.",
            [
                "id" => $experienceId
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported method
    |--------------------------------------------------------------------------
    */

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );


} catch (PDOException $e) {

    error_log(
        "Shared Experiences API PDO error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "A database error occurred while processing the shared experience.",
        null,
        500
    );


} catch (Throwable $e) {

    error_log(
        "Shared Experiences API error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "An unexpected server error occurred.",
        null,
        500
    );
}