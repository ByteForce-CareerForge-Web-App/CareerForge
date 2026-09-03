<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/database.php";

try {

    // Check if a specific application ID was requested
    if (isset($_GET["id"])) {

        $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

        if ($id === false || $id === null) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid application ID"
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                a.id,
                a.user_id,
                a.opportunity_id,
                a.status,
                a.applied_at
            FROM applications a
            WHERE a.id = ?
        ");

        $stmt->execute([$id]);

        $application = $stmt->fetch();

        if (!$application) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Application not found"
            ]);

            exit;
        }

        echo json_encode([
            "success" => true,
            "data" => $application
        ]);

        exit;
    }


    // Get all applications
    $stmt = $pdo->query("
        SELECT
            a.id,
            a.user_id,
            a.opportunity_id,
            a.status,
            a.applied_at
        FROM applications a
        ORDER BY a.id DESC
    ");

    $applications = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($applications),
        "data" => $applications
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve applications"
    ]);
}
?>