<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

$headers = getallheaders();

$authorization = $headers["Authorization"]
    ?? $headers["authorization"]
    ?? "";

if (!preg_match(
    "/Bearer\s+(.+)/i",
    $authorization,
    $matches
)) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authorization token required"
    ]);

    exit;
}

$token = trim($matches[1]);

$tokenHash = hash(
    "sha256",
    $token
);

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.role
    FROM api_tokens t

    INNER JOIN users u
        ON t.user_id = u.id

    WHERE t.token_hash = ?
    AND (t.expires_at IS NULL OR t.expires_at > NOW())
    AND u.status = 'active'

    LIMIT 1
");

$stmt->execute([$tokenHash]);

$user = $stmt->fetch();

if (!$user) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid or expired token"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Only students can apply
|--------------------------------------------------------------------------
*/

if ($user["role"] !== "student") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only students can submit applications"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET APPLICATIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $pdo->prepare("
        SELECT
            a.id,
            a.status,
            a.applied_at,

            o.id AS opportunity_id,
            o.title,
            o.type,
            o.location,

            b.company_name

        FROM applications a

        INNER JOIN opportunities o
            ON a.opportunity_id = o.id

        INNER JOIN business_profiles b
            ON o.business_id = b.id

        WHERE a.student_id = ?

        ORDER BY a.applied_at DESC
    ");

    $stmt->execute([
        $user["id"]
    ]);

    $applications = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($applications),
        "data" => $applications
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| POST APPLICATION
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $opportunityId = filter_var(
        $input["opportunity_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    if ($opportunityId === false) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Opportunity ID is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Check opportunity
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM opportunities
        WHERE id = ?
        AND status = 'open'
        LIMIT 1
    ");

    $stmt->execute([
        $opportunityId
    ]);

    if (!$stmt->fetch()) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Opportunity not found or closed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Create application
    |--------------------------------------------------------------------------
    */

    try {

        $stmt = $pdo->prepare("
            INSERT INTO applications
            (
                opportunity_id,
                student_id,
                status
            )
            VALUES
            (?, ?, 'submitted')
        ");

        $stmt->execute([
            $opportunityId,
            $user["id"]
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Application submitted successfully",
            "application_id" => (int) $pdo->lastInsertId()
        ]);

    } catch (PDOException $e) {

        if ($e->getCode() === "23000") {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "You have already applied for this opportunity"
            ]);

            exit;
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Application could not be submitted"
        ]);
    }

    exit;
}


/*
|--------------------------------------------------------------------------
| Unsupported method
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);