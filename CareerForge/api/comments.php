<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
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


    /*
    |--------------------------------------------------------------------------
    | GET COMMENTS
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $postId = (int)(
            $_GET["post_id"] ?? 0
        );

        if ($postId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Post ID is required."
            ]);

            exit;
        }


        $stmt = $pdo->prepare("
            SELECT
                c.id,
                c.post_id,
                c.user_id,
                c.comment_text,
                c.created_at,
                u.name AS name,
                u.role
            FROM social_comments c
            INNER JOIN users u
                ON u.id = c.user_id
            WHERE c.post_id = :post_id
            ORDER BY c.created_at ASC
        ");

        $stmt->execute([
            ":post_id" => $postId
        ]);

        $comments = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


        /*
        |--------------------------------------------------------------------------
        | FORMAT COMMENTS
        |--------------------------------------------------------------------------
        */

        foreach ($comments as &$comment) {

            $comment["name"] =
                trim(
                    (string)(
                        $comment["name"]
                        ?? "CareerForge User"
                    )
                );

            if ($comment["name"] === "") {
                $comment["name"] =
                    "CareerForge User";
            }

            $comment["text"] =
                (string)(
                    $comment["comment_text"]
                    ?? ""
                );

            $comment["post_id"] =
                (int)$comment["post_id"];

            $comment["user_id"] =
                (int)$comment["user_id"];

            $comment["id"] =
                (int)$comment["id"];
        }

        unset($comment);


        echo json_encode([
            "success" => true,
            "data" => $comments
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE COMMENT
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request body."
            ]);

            exit;
        }


        $postId = (int)(
            $input["post_id"] ?? 0
        );

        $text = trim(
            (string)(
                $input["text"] ?? ""
            )
        );


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if ($postId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Post ID is required."
            ]);

            exit;
        }

        if ($text === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Comment cannot be empty."
            ]);

            exit;
        }


        if (mb_strlen($text) > 500) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Comment is too long."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK POST
        |--------------------------------------------------------------------------
        */

        $postCheck = $pdo->prepare("
            SELECT id
            FROM social_posts
            WHERE id = :post_id
            LIMIT 1
        ");

        $postCheck->execute([
            ":post_id" => $postId
        ]);

        if (!$postCheck->fetch()) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Post not found."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | INSERT COMMENT
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO social_comments
            (
                post_id,
                user_id,
                comment_text
            )
            VALUES
            (
                :post_id,
                :user_id,
                :comment_text
            )
        ");

        $stmt->execute([
            ":post_id" => $postId,
            ":user_id" => $user["id"],
            ":comment_text" => $text
        ]);

        $commentId = $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | GET COMMENT COUNT
        |--------------------------------------------------------------------------
        */

        $countStmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM social_comments
            WHERE post_id = :post_id
        ");

        $countStmt->execute([
            ":post_id" => $postId
        ]);

        $commentCount =
            (int)$countStmt->fetchColumn();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "message" => "Comment added successfully.",
            "data" => [
                "id" => (int)$commentId,
                "post_id" => $postId,
                "user_id" => (int)$user["id"],
                "text" => $text
            ],
            "comments_count" => $commentCount,
            "comment_count" => $commentCount
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

    error_log(
        "comments.php PDO error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error while handling comments."
    ]);

} catch (Throwable $e) {

    error_log(
        "comments.php error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to handle comments."
    ]);
}