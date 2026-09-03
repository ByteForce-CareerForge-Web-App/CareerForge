<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/database.php";

try {

    // Check if a specific opportunity ID was requested
    if (isset($_GET["id"])) {

        $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

        if ($id === false || $id === null) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity ID"
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                id,
                title,
                description,
                company,
                location,
                type,
                deadline
            FROM opportunities
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        $opportunity = $stmt->fetch();

        if (!$opportunity) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found"
            ]);

            exit;
        }

        echo json_encode([
            "success" => true,
            "data" => $opportunity
        ]);

        exit;
    }


    // Get all opportunities
    $stmt = $pdo->query("
        SELECT
            id,
            title,
            description,
            company,
            location,
            type,
            deadline
        FROM opportunities
        ORDER BY id DESC
    ");

    $opportunities = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($opportunities),
        "data" => $opportunities
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve opportunities"
    ]);
}
?>