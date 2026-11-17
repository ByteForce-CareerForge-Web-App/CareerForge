<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

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
    | REQUEST METHOD
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method not allowed."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | READ REQUEST
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | POST DATA
    |--------------------------------------------------------------------------
    */

    $content = trim(
        (string)($input["content"] ?? "")
    );

    $imageUri = trim(
        (string)($input["image_uri"] ?? "")
    );


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if ($content === "" && $imageUri === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Post cannot be empty."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE POST
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO social_posts
        (
            user_id,
            content,
            image_uri
        )
        VALUES
        (
            :user_id,
            :content,
            :image_uri
        )
    ");

    $stmt->execute([
        ":user_id" => $user["id"],
        ":content" => $content !== ""
            ? $content
            : null,
        ":image_uri" => $imageUri !== ""
            ? $imageUri
            : null
    ]);

    $postId = $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Post created successfully.",
        "data" => [
            "id" => (int)$postId,
            "user_id" => (int)$user["id"],
            "content" => $content,
            "image_uri" => $imageUri !== ""
                ? $imageUri
                : null
        ]
    ]);

} catch (PDOException $e) {

    error_log(
        "create-post.php PDO error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error while creating post."
    ]);

} catch (Throwable $e) {

    error_log(
        "create-post.php error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to create post."
    ]);
}