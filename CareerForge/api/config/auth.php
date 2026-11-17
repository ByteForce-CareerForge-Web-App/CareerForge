<?php

function getAuthenticatedUser($pdo)
{
    $authorization = "";

    // Try the normal Authorization header
    $headers = getallheaders();

    foreach ($headers as $key => $value) {
        if (strtolower($key) === "authorization") {
            $authorization = $value;
            break;
        }
    }

    // Fallback for Apache/PHP
    if ($authorization === "" && isset($_SERVER["HTTP_AUTHORIZATION"])) {
        $authorization = $_SERVER["HTTP_AUTHORIZATION"];
    }

    if ($authorization === "") {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required"
        ]);

        exit;
    }

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid authorization header"
        ]);

        exit;
    }

    $token = trim($matches[1]);

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.status
        FROM api_tokens t
        INNER JOIN users u
            ON u.id = t.user_id
        WHERE t.token_hash = ?
          AND t.expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired authentication token"
        ]);

        exit;
    }

    if ($user["status"] !== "active") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "This account is not active"
        ]);

        exit;
    }

    return $user;

    function requireAdmin($pdo)
    {
        $user = getAuthenticatedUser($pdo);

        if ($user["role"] !== "admin") {
            http_response_code(403);

            echo json_encode([
                "success" => false,
                "message" => "Admin access is required"
            ]);

            exit;
        }

        return $user;
    }
}

