<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

header("Content-Type: application/json; charset=UTF-8");


/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function socialFeedResponse(
    bool $success,
    array $data = [],
    string $message = "",
    int $statusCode = 200
): void {

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
*/

try {

    $user = getAuthenticatedUser($pdo);

    if (!$user) {

        socialFeedResponse(
            false,
            [],
            "Authentication required.",
            401
        );
    }


    /*
    |--------------------------------------------------------------------------
    | GET SOCIAL FEED
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $currentUserId = (int)$user["id"];


        $sql = "
            SELECT
                p.id,
                p.user_id,
                p.content,
                p.image_uri,
                p.created_at,

                u.name AS name,
                u.role AS role,

                (
                    SELECT COUNT(*)
                    FROM social_likes sl
                    WHERE sl.post_id = p.id
                ) AS likes_count,

                (
                    SELECT COUNT(*)
                    FROM social_comments sc
                    WHERE sc.post_id = p.id
                ) AS comments_count,

                EXISTS (
                    SELECT 1
                    FROM social_likes my_like
                    WHERE my_like.post_id = p.id
                    AND my_like.user_id = :current_user_id
                ) AS liked

            FROM social_posts p

            INNER JOIN users u
                ON u.id = p.user_id

            ORDER BY p.created_at DESC
        ";


        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":current_user_id" => $currentUserId
        ]);


        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($posts as &$post) {

            $name = trim(
                (string)($post["name"] ?? "")
            );

            $role = strtolower(
                trim(
                    (string)($post["role"] ?? "")
                )
            );


            /*
            |--------------------------------------------------------------------------
            | ROLE LABEL
            |--------------------------------------------------------------------------
            */

            switch ($role) {

                case "student":
                    $roleLabel = "Student • CareerForgeAI";
                    break;

                case "alumni":
                    $roleLabel = "Alumni • CareerForgeAI";
                    break;

                case "business":
                    $roleLabel = "Business • CareerForgeAI";
                    break;

                case "admin":
                    $roleLabel = "Admin • CareerForgeAI";
                    break;

                default:
                    $roleLabel = "CareerForgeAI Community";
                    break;
            }


            /*
            |--------------------------------------------------------------------------
            | INITIALS
            |--------------------------------------------------------------------------
            */

            $initials = "";

            if ($name !== "") {

                $nameParts = preg_split(
                    "/\s+/",
                    $name
                );

                if (count($nameParts) >= 2) {

                    $initials =
                        strtoupper(
                            substr($nameParts[0], 0, 1) .
                            substr(
                                $nameParts[count($nameParts) - 1],
                                0,
                                1
                            )
                        );

                } else {

                    $initials =
                        strtoupper(
                            substr($name, 0, 2)
                        );
                }
            }


            $post["name"] = $name;
            $post["role_label"] = $roleLabel;
            $post["initials"] = $initials;

            $post["likes_count"] =
                (int)$post["likes_count"];

            $post["comments_count"] =
                (int)$post["comments_count"];

            $post["liked"] =
                (bool)$post["liked"];
        }

        unset($post);


        socialFeedResponse(
            true,
            $posts,
            "Social feed loaded successfully."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | LIKE / UNLIKE POST
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );


        if (!is_array($input)) {

            socialFeedResponse(
                false,
                [],
                "Invalid request body.",
                400
            );
        }


        $action = trim(
            (string)($input["action"] ?? "")
        );

        $postId = (int)(
            $input["post_id"] ?? 0
        );


        if ($action !== "like") {

            socialFeedResponse(
                false,
                [],
                "Invalid action.",
                400
            );
        }


        if ($postId <= 0) {

            socialFeedResponse(
                false,
                [],
                "Invalid post ID.",
                400
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK POST EXISTS
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

            socialFeedResponse(
                false,
                [],
                "Post not found.",
                404
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK EXISTING LIKE
        |--------------------------------------------------------------------------
        */

        $likeCheck = $pdo->prepare("
            SELECT post_id
            FROM social_likes
            WHERE post_id = :post_id
            AND user_id = :user_id
            LIMIT 1
        ");

        $likeCheck->execute([
            ":post_id" => $postId,
            ":user_id" => (int)$user["id"]
        ]);


        $existingLike = $likeCheck->fetch(
            PDO::FETCH_ASSOC
        );


        /*
        |--------------------------------------------------------------------------
        | UNLIKE
        |--------------------------------------------------------------------------
        */

        if ($existingLike) {

            $deleteLike = $pdo->prepare("
                DELETE FROM social_likes
                WHERE post_id = :post_id
                AND user_id = :user_id
            ");

            $deleteLike->execute([
                ":post_id" => $postId,
                ":user_id" => (int)$user["id"]
            ]);

            $liked = false;

        }


        /*
        |--------------------------------------------------------------------------
        | LIKE
        |--------------------------------------------------------------------------
        */

        else {

            $insertLike = $pdo->prepare("
                INSERT INTO social_likes
                (
                    post_id,
                    user_id
                )
                VALUES
                (
                    :post_id,
                    :user_id
                )
            ");

            $insertLike->execute([
                ":post_id" => $postId,
                ":user_id" => (int)$user["id"]
            ]);

            $liked = true;
        }


        /*
        |--------------------------------------------------------------------------
        | GET UPDATED LIKE COUNT
        |--------------------------------------------------------------------------
        */

        $countStmt = $pdo->prepare("
            SELECT COUNT(*) AS likes_count
            FROM social_likes
            WHERE post_id = :post_id
        ");

        $countStmt->execute([
            ":post_id" => $postId
        ]);


        $likesCount = (int)(
            $countStmt->fetchColumn()
        );


        socialFeedResponse(
            true,
            [
                "post_id" => $postId,
                "liked" => $liked,
                "likes" => $likesCount,
                "likes_count" => $likesCount
            ],
            $liked
                ? "Post liked successfully."
                : "Post unliked successfully."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | METHOD NOT ALLOWED
    |--------------------------------------------------------------------------
    */

    socialFeedResponse(
        false,
        [],
        "Method not allowed.",
        405
    );


} catch (PDOException $e) {

    error_log(
        "social-feed.php PDO error: " .
        $e->getMessage()
    );


    socialFeedResponse(
        false,
        [],
        "DATABASE ERROR: " . $e->getMessage(),
        500
    );


} catch (Throwable $e) {

    error_log(
        "social-feed.php error: " .
        $e->getMessage()
    );


    socialFeedResponse(
        false,
        [],
        "SERVER ERROR: " . $e->getMessage(),
        500
    );
}

