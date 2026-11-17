<?php

require_once __DIR__ . "/config/database.php";

$email = "thabo@nexatec.demo";
$password = "Demo@12345";

$stmt = $pdo->prepare("
    SELECT id, email, password, role, status
    FROM users
    WHERE email = ?
    LIMIT 1
");

$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

header("Content-Type: application/json");

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "user_id" => $user["id"],
    "email" => $user["email"],
    "role" => $user["role"],
    "status" => $user["status"],
    "password_matches" => password_verify($password, $user["password"])
]);