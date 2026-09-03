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

    if (isset($_GET["id"])) {

        $id = filter_var(
            $_GET["id"],
            FILTER_VALIDATE_INT
        );

        if ($id === false) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity ID"
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            SELECT
                o.id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.deadline,
                o.status,
                b.company_name
            FROM opportunities o
            INNER JOIN business_profiles b
                ON o.business_id = b.id
            WHERE o.id = ?
            AND o.status = 'open'
            LIMIT 1
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


    /*
    |--------------------------------------------------------------------------
    | Get all open opportunities
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT
            o.id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.deadline,
            o.status,
            b.company_name
        FROM opportunities o
        INNER JOIN business_profiles b
            ON o.business_id = b.id
        WHERE o.status = 'open'
        ORDER BY o.created_at DESC
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