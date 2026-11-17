<?php

require_once "../config/cors.php";
require_once "../config/database.php";
require_once "../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

$admin = requireAdmin($pdo);

echo json_encode([
    "success" => true,
    "message" => "Admin authentication successful",
    "admin" => [
        "id" => (int) $admin["id"],
        "name" => $admin["name"],
        "email" => $admin["email"],
        "role" => $admin["role"]
    ]
]);