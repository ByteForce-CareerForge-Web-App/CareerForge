<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";


/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

function getAuthenticatedUserId($pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"]
        ?? $headers["authorization"]
        ?? "";

    if (!preg_match(
        "/Bearer\s+(.+)/i",
        $authorization,
        $matches
    )) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token required"
        ]);

        exit;
    }

    $token = trim($matches[1]);

    $tokenHash = hash(
        "sha256",
        $token
    );

    $stmt = $pdo->prepare("
        SELECT user_id
        FROM api_tokens
        WHERE token_hash = ?
        AND expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $tokenRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenRecord) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired token"
        ]);

        exit;
    }

    return (int) $tokenRecord["user_id"];
}


/*
|--------------------------------------------------------------------------
| GET SKILLS
|--------------------------------------------------------------------------
|
| Returns:
| 1. All available skills
| 2. Skills selected by the logged-in user
|
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        $userId = getAuthenticatedUserId($pdo);


        /*
        |--------------------------------------------------------------------------
        | Get all available skills
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                id,
                name
            FROM skills
            ORDER BY name ASC
        ");

        $stmt->execute();

        $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Get user's selected skills
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                us.skill_id,
                us.level,
                s.name
            FROM user_skills us
            INNER JOIN skills s
                ON s.id = us.skill_id
            WHERE us.user_id = ?
            ORDER BY s.name ASC
        ");

        $stmt->execute([$userId]);

        $userSkills = $stmt->fetchAll(PDO::FETCH_ASSOC);


        $selectedSkillIds = [];

        foreach ($userSkills as $userSkill) {

            $selectedSkillIds[] = (int) $userSkill["skill_id"];
        }


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "data" => [
                "skills" => array_map(
                    function ($skill) {

                        return [
                            "id" => (int) $skill["id"],
                            "name" => $skill["name"]
                        ];
                    },
                    $skills
                ),

                "selected_skill_ids" => $selectedSkillIds,

                "user_skills" => array_map(
                    function ($skill) {

                        return [
                            "skill_id" => (int) $skill["skill_id"],
                            "name" => $skill["name"],
                            "level" => $skill["level"]
                        ];
                    },
                    $userSkills
                )
            ]
        ]);

        exit;


    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to retrieve skills"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| SAVE USER SKILLS
|--------------------------------------------------------------------------
|
| Replaces the user's current skills with the submitted list.
|
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    try {

        $userId = getAuthenticatedUserId($pdo);


        /*
        |--------------------------------------------------------------------------
        | Read request
        |--------------------------------------------------------------------------
        */

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($data)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request data"
            ]);

            exit;
        }


        $skillIds = $data["skill_ids"] ?? [];


        if (!is_array($skillIds)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "skill_ids must be an array"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Clean skill IDs
        |--------------------------------------------------------------------------
        */

        $skillIds = array_map(
            "intval",
            $skillIds
        );

        $skillIds = array_values(
            array_unique($skillIds)
        );


        /*
        |--------------------------------------------------------------------------
        | Validate that all skill IDs exist
        |--------------------------------------------------------------------------
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

            $validSkillIds = array_map(
                "intval",
                $stmt->fetchAll(PDO::FETCH_COLUMN)
            );


            if (count($validSkillIds) !== count($skillIds)) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "One or more selected skills are invalid"
                ]);

                exit;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Save skills
        |--------------------------------------------------------------------------
        */

        $pdo->beginTransaction();


        /*
        | Remove old skills
        */

        $stmt = $pdo->prepare("
            DELETE FROM user_skills
            WHERE user_id = ?
        ");

        $stmt->execute([$userId]);


        /*
        | Insert new skills
        */

        if (count($skillIds) > 0) {

            $stmt = $pdo->prepare("
                INSERT INTO user_skills (
                    user_id,
                    skill_id,
                    level
                )
                VALUES (?, ?, 'beginner')
            ");

            foreach ($skillIds as $skillId) {

                $stmt->execute([
                    $userId,
                    $skillId
                ]);
            }
        }


        $pdo->commit();


        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "message" => "Skills updated successfully",
            "data" => [
                "selected_skill_ids" => $skillIds
            ]
        ]);

        exit;


    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to save skills"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Unsupported method
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);

?>