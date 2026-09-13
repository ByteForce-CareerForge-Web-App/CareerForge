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

    /*
    |--------------------------------------------------------------------------
    | GET SINGLE OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    if (isset($_GET["id"])) {

        $id = filter_var(
            $_GET["id"],
            FILTER_VALIDATE_INT
        );

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
                o.id,
                o.business_id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.deadline,
                o.status,
                o.created_at,
                b.company_name
            FROM opportunities o
            INNER JOIN business_profiles b
                ON o.business_id = b.id
            WHERE o.id = ?
            AND o.status = 'open'
            LIMIT 1
        ");

        $stmt->execute([$id]);

        $opportunity = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$opportunity) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found"
            ]);

            exit;
        }

        /*
        |--------------------------------------------------------------------------
        | GET REQUIRED SKILLS
        |--------------------------------------------------------------------------
        */

        $skillStmt = $pdo->prepare("
            SELECT
                s.id,
                s.name
            FROM opportunity_skills os
            INNER JOIN skills s
                ON os.skill_id = s.id
            WHERE os.opportunity_id = ?
            ORDER BY s.name ASC
        ");

        $skillStmt->execute([$id]);

        $opportunity["skills"] =
            $skillStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $opportunity
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET ALL OPEN OPPORTUNITIES
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT
            o.id,
            o.business_id,
            o.title,
            o.description,
            o.type,
            o.location,
            o.deadline,
            o.status,
            o.created_at,
            b.company_name
        FROM opportunities o
        INNER JOIN business_profiles b
            ON o.business_id = b.id
        WHERE o.status = 'open'
        ORDER BY o.created_at DESC
    ");

    $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | GET REQUIRED SKILLS FOR EACH OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    foreach ($opportunities as &$opportunity) {

        $skillStmt = $pdo->prepare("
            SELECT
                s.id,
                s.name
            FROM opportunity_skills os
            INNER JOIN skills s
                ON os.skill_id = s.id
            WHERE os.opportunity_id = ?
            ORDER BY s.name ASC
        ");

        $skillStmt->execute([
            $opportunity["id"]
        ]);

        $opportunity["skills"] =
            $skillStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    unset($opportunity);


    /*
    |--------------------------------------------------------------------------
    | RETURN RESPONSE
    |--------------------------------------------------------------------------
    */

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
