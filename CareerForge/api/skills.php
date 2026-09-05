<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";


/*
|--------------------------------------------------------------------------
| AUTHENTICATE USER
|--------------------------------------------------------------------------
*/

function getAuthenticatedUserId($pdo)
{
    $headers = getallheaders();

    $authorization =
        $headers["Authorization"]
        ?? $headers["authorization"]
        ?? "";

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required"
        ]);

        exit;
    }

    $token = trim($matches[1]);

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT user_id
        FROM api_tokens
        WHERE token_hash = ?
        AND expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired authentication token"
        ]);

        exit;
    }

    return (int) $user["user_id"];
}


/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

$userId = getAuthenticatedUserId($pdo);


/*
|--------------------------------------------------------------------------
| GET SKILLS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        /*
        |--------------------------------------------------------------
        | Get all available skills
        |--------------------------------------------------------------
        */

        $stmt = $pdo->query("
            SELECT
                id,
                skill_code,
                name,
                category,
                description
            FROM skills
            ORDER BY skill_code ASC
        ");

        $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------
        | Get skills selected by this user
        |--------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT skill_id
            FROM user_skills
            WHERE user_id = ?
        ");

        $stmt->execute([$userId]);

        $selectedSkillIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $selectedSkillIds = array_map(
            "intval",
            $selectedSkillIds
        );


        /*
        |--------------------------------------------------------------
        | Response
        |--------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "data" => [
                "skills" => $skills,
                "selected_skill_ids" => $selectedSkillIds
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to load skills"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| UPDATE USER SKILLS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    try {

        /*
        |--------------------------------------------------------------
        | Read JSON request
        |--------------------------------------------------------------
        */

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );


        /*
        |--------------------------------------------------------------
        | Validate request
        |--------------------------------------------------------------
        */

        if (
            !is_array($data) ||
            !isset($data["skill_ids"]) ||
            !is_array($data["skill_ids"])
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "skill_ids must be an array"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------
        | Clean skill IDs
        |--------------------------------------------------------------
        */

        $skillIds = array_values(
            array_unique(
                array_map(
                    "intval",
                    $data["skill_ids"]
                )
            )
        );


        /*
        |--------------------------------------------------------------
        | Make sure all skill IDs exist
        |--------------------------------------------------------------
        */

        if (count($skillIds) > 0) {

            $placeholders = implode(
                ",",
                array_fill(
                    0,
                    count($skillIds),
                    "?"
                )
            );

            $stmt = $pdo->prepare("
                SELECT id
                FROM skills
                WHERE id IN ($placeholders)
            ");

            $stmt->execute($skillIds);

            $validSkillIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $validSkillIds = array_map(
                "intval",
                $validSkillIds
            );


            /*
            |----------------------------------------------------------
            | Compare requested IDs with valid database IDs
            |----------------------------------------------------------
            */

            $requestedIds = $skillIds;

            sort($requestedIds);
            sort($validSkillIds);

            if ($requestedIds !== $validSkillIds) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "One or more selected skills are invalid"
                ]);

                exit;
            }
        }


        /*
        |--------------------------------------------------------------
        | Start database transaction
        |--------------------------------------------------------------
        */

        $pdo->beginTransaction();


        /*
        |--------------------------------------------------------------
        | Remove existing skills
        |--------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            DELETE FROM user_skills
            WHERE user_id = ?
        ");

        $stmt->execute([$userId]);


        /*
        |--------------------------------------------------------------
        | Add new skills
        |--------------------------------------------------------------
        */

        if (count($skillIds) > 0) {

            $stmt = $pdo->prepare("
                INSERT INTO user_skills
                (
                    user_id,
                    skill_id,
                    level
                )
                VALUES
                (
                    ?,
                    ?,
                    'beginner'
                )
            ");

            foreach ($skillIds as $skillId) {

                $stmt->execute([
                    $userId,
                    $skillId
                ]);
            }
        }


        /*
        |--------------------------------------------------------------
        | Commit transaction
        |--------------------------------------------------------------
        */

        $pdo->commit();


        echo json_encode([
            "success" => true,
            "message" => "Skills updated successfully"
        ]);

        exit;

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to update skills"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| METHOD NOT ALLOWED
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);