<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/database.php";

try {

    // Check if a specific profile ID was requested
    if (isset($_GET["id"])) {

        $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

        if ($id === false || $id === null) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid profile ID"
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                id,
                name,
                role,
                programme,
                career_goal
            FROM profiles
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        $profile = $stmt->fetch();

        if (!$profile) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Profile not found"
            ]);

            exit;
        }

        echo json_encode([
            "success" => true,
            "data" => $profile
        ]);

        exit;
    }


    // Get all profiles
    $stmt = $pdo->query("
        SELECT
            id,
            name,
            role,
            programme,
            career_goal
        FROM profiles
        ORDER BY id DESC
    ");

    $profiles = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($profiles),
        "data" => $profiles
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve profiles"
    ]);
}
?>