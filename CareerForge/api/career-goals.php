<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

try {

    $stmt = $pdo->query("
        SELECT
            id,
            name
        FROM career_goals
        ORDER BY id ASC
    ");

    $goals = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "data" => $goals
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve career goals"
    ]);
}