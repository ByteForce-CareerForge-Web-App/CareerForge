<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

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
        FROM skills
        ORDER BY name ASC
    ");

    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedSkills = [];

    foreach ($skills as $skill) {
        $formattedSkills[] = [
            "id" => (int) $skill["id"],
            "name" => $skill["name"]
        ];
    }

    echo json_encode([
        "success" => true,
        "skills" => $formattedSkills
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to load skills."
    ]);
}
?>