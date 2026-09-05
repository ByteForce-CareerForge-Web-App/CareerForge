<?php

require_once __DIR__ . "/../../api/config/cors.php";
require_once __DIR__ . "/../../api/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($email === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);

    exit;
}

$stmt = $pdo->prepare("
    SELECT
        id,
        name,
        email,
        password,
        role,
        status
    FROM users
    WHERE email = ?
    LIMIT 1
");

$stmt->execute([$email]);

$user = $stmt->fetch();

if (!$user) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit;
}

if (!password_verify($password, $user["password"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password"
    ]);

    exit;
}

if ($user["status"] !== "active") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "This account is not active"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Generate API token
|--------------------------------------------------------------------------
*/

$token = bin2hex(random_bytes(32));

$tokenHash = hash(
    "sha256",
    $token
);

$stmt = $pdo->prepare("
    INSERT INTO api_tokens
    (
        user_id,
        token_hash,
        expires_at
    )
    VALUES
    (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
");

$stmt->execute([
    $user["id"],
    $tokenHash
]);


/*
|--------------------------------------------------------------------------
| Return user information
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "message" => "Login successful",

    "token" => $token,

    "user" => [
        "id" => (int) $user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "role" => $user["role"]
    ]
]);