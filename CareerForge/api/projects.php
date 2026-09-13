<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

/*
|--------------------------------------------------------------------------
| AUTHENTICATE USER
|--------------------------------------------------------------------------
*/

try {

    $user = getAuthenticatedUser($pdo);

    $userId = (int) $user["id"];

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Authentication failed"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET PROJECTS
|--------------------------------------------------------------------------
|
| GET /projects.php
|
| Returns all projects belonging to the authenticated student.
|
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        $stmt = $pdo->prepare("
            SELECT
                id,
                user_id,
                title,
                description,
                technologies,
                github_url,
                project_url,
                completed_at,
                created_at,
                updated_at
            FROM projects
            WHERE user_id = ?
            ORDER BY
                CASE
                    WHEN completed_at IS NULL THEN 1
                    ELSE 0
                END ASC,
                completed_at DESC,
                created_at DESC
        ");

        $stmt->execute([$userId]);

        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => [
                "projects" => $projects
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to load projects"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| POST PROJECT
|--------------------------------------------------------------------------
|
| Creates a new project for the authenticated user.
|
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    try {

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

        $title = trim($data["title"] ?? "");
        $description = trim($data["description"] ?? "");
        $technologies = trim($data["technologies"] ?? "");
        $githubUrl = trim($data["github_url"] ?? "");
        $projectUrl = trim($data["project_url"] ?? "");
        $completedAt = trim($data["completed_at"] ?? "");


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($title === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Project title is required"
            ]);

            exit;
        }

        if ($description === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Project description is required"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | URL VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($githubUrl !== "" && !filter_var($githubUrl, FILTER_VALIDATE_URL)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid GitHub URL"
            ]);

            exit;
        }

        if ($projectUrl !== "" && !filter_var($projectUrl, FILTER_VALIDATE_URL)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid project URL"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | DATE VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($completedAt !== "") {

            $date = DateTime::createFromFormat(
                "Y-m-d",
                $completedAt
            );

            if (
                !$date ||
                $date->format("Y-m-d") !== $completedAt
            ) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Completion date must use YYYY-MM-DD format"
                ]);

                exit;
            }

        } else {

            $completedAt = null;
        }


        /*
        |--------------------------------------------------------------------------
        | INSERT PROJECT
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO projects
            (
                user_id,
                title,
                description,
                technologies,
                github_url,
                project_url,
                completed_at
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        ");

        $stmt->execute([
            $userId,
            $title,
            $description,
            $technologies !== "" ? $technologies : null,
            $githubUrl !== "" ? $githubUrl : null,
            $projectUrl !== "" ? $projectUrl : null,
            $completedAt
        ]);


        $projectId = (int) $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | RETURN CREATED PROJECT
        |--------------------------------------------------------------------------
        */

        $projectStmt = $pdo->prepare("
            SELECT
                id,
                user_id,
                title,
                description,
                technologies,
                github_url,
                project_url,
                completed_at,
                created_at,
                updated_at
            FROM projects
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
        ");

        $projectStmt->execute([
            $projectId,
            $userId
        ]);

        $project = $projectStmt->fetch(PDO::FETCH_ASSOC);


        echo json_encode([
            "success" => true,
            "message" => "Project added successfully",
            "data" => [
                "project" => $project
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to add project"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| PUT PROJECT
|--------------------------------------------------------------------------
|
| Updates an existing project.
|
| PUT /projects.php?id=1
|
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    try {

        $projectId = isset($_GET["id"])
            ? (int) $_GET["id"]
            : 0;

        if ($projectId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid project ID is required"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK PROJECT OWNERSHIP
        |--------------------------------------------------------------------------
        */

        $checkStmt = $pdo->prepare("
            SELECT id
            FROM projects
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
        ");

        $checkStmt->execute([
            $projectId,
            $userId
        ]);

        if (!$checkStmt->fetch()) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Project not found"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | READ REQUEST
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

        $title = trim($data["title"] ?? "");
        $description = trim($data["description"] ?? "");
        $technologies = trim($data["technologies"] ?? "");
        $githubUrl = trim($data["github_url"] ?? "");
        $projectUrl = trim($data["project_url"] ?? "");
        $completedAt = trim($data["completed_at"] ?? "");


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($title === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Project title is required"
            ]);

            exit;
        }

        if ($description === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Project description is required"
            ]);

            exit;
        }


        if ($githubUrl !== "" && !filter_var($githubUrl, FILTER_VALIDATE_URL)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid GitHub URL"
            ]);

            exit;
        }


        if ($projectUrl !== "" && !filter_var($projectUrl, FILTER_VALIDATE_URL)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid project URL"
            ]);

            exit;
        }


        if ($completedAt !== "") {

            $date = DateTime::createFromFormat(
                "Y-m-d",
                $completedAt
            );

            if (
                !$date ||
                $date->format("Y-m-d") !== $completedAt
            ) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Completion date must use YYYY-MM-DD format"
                ]);

                exit;
            }

        } else {

            $completedAt = null;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            UPDATE projects
            SET
                title = ?,
                description = ?,
                technologies = ?,
                github_url = ?,
                project_url = ?,
                completed_at = ?
            WHERE id = ?
              AND user_id = ?
        ");

        $stmt->execute([
            $title,
            $description,
            $technologies !== "" ? $technologies : null,
            $githubUrl !== "" ? $githubUrl : null,
            $projectUrl !== "" ? $projectUrl : null,
            $completedAt,
            $projectId,
            $userId
        ]);


        /*
        |--------------------------------------------------------------------------
        | RETURN UPDATED PROJECT
        |--------------------------------------------------------------------------
        */

        $projectStmt = $pdo->prepare("
            SELECT
                id,
                user_id,
                title,
                description,
                technologies,
                github_url,
                project_url,
                completed_at,
                created_at,
                updated_at
            FROM projects
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
        ");

        $projectStmt->execute([
            $projectId,
            $userId
        ]);

        $project = $projectStmt->fetch(PDO::FETCH_ASSOC);


        echo json_encode([
            "success" => true,
            "message" => "Project updated successfully",
            "data" => [
                "project" => $project
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to update project"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| DELETE PROJECT
|--------------------------------------------------------------------------
|
| DELETE /projects.php?id=1
|
*/

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

    try {

        $projectId = isset($_GET["id"])
            ? (int) $_GET["id"]
            : 0;

        if ($projectId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid project ID is required"
            ]);

            exit;
        }


        $stmt = $pdo->prepare("
            DELETE FROM projects
            WHERE id = ?
              AND user_id = ?
        ");

        $stmt->execute([
            $projectId,
            $userId
        ]);


        if ($stmt->rowCount() === 0) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Project not found"
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "message" => "Project deleted successfully"
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to delete project"
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

exit;