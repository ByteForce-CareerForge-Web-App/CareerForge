<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";

header('Content-Type: application/json');

function getAuthenticatedUserId($pdo)
{
    $authorization = '';

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authorization = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();

        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authorization = trim($value);
                break;
            }
        }
    }

    if (!$authorization || !preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
        return null;
    }

    $token = trim($matches[1]);

    if ($token === '') {
        return null;
    }

    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare("
        SELECT user_id
        FROM api_tokens
        WHERE token_hash = ?
          AND expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user ? (int)$user['user_id'] : null;
}


/*
|--------------------------------------------------------------------------
| Allowed experience types
|--------------------------------------------------------------------------
*/

$allowedExperienceTypes = [
    'internship',
    'projects',
    'volunteering',
    'work',
    'certifications',
    'extracurricular'
];


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

$userId = getAuthenticatedUserId($pdo);

if (!$userId) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please log in again.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    try {

        $stmt = $pdo->prepare("
            SELECT experience_type
            FROM user_experience
            WHERE user_id = ?
            ORDER BY experience_type ASC
        ");

        $stmt->execute([$userId]);

        $selectedExperienceTypes = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'data' => [
                'experience_types' => $allowedExperienceTypes,
                'selected_experience_types' => $selectedExperienceTypes
            ]
        ]);

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to load experience data.'
        ]);
    }

    exit;
}


/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid request data.'
        ]);

        exit;
    }

    $experienceTypes = $input['experience_types'] ?? [];

    if (!is_array($experienceTypes)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'experience_types must be an array.'
        ]);

        exit;
    }

    /*
     * Clean values
     */
    $experienceTypes = array_map(
        fn($value) => strtolower(trim((string)$value)),
        $experienceTypes
    );

    $experienceTypes = array_values(
        array_unique($experienceTypes)
    );


    /*
     * Validate values
     */
    foreach ($experienceTypes as $experienceType) {

        if (!in_array($experienceType, $allowedExperienceTypes, true)) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => "Invalid experience type: {$experienceType}"
            ]);

            exit;
        }
    }


    try {

        $pdo->beginTransaction();

        /*
         * Remove previous selections
         */
        $deleteStmt = $pdo->prepare("
            DELETE FROM user_experience
            WHERE user_id = ?
        ");

        $deleteStmt->execute([$userId]);


        /*
         * Insert new selections
         */
        if (!empty($experienceTypes)) {

            $insertStmt = $pdo->prepare("
                INSERT INTO user_experience
                    (user_id, experience_type)
                VALUES
                    (?, ?)
            ");

            foreach ($experienceTypes as $experienceType) {
                $insertStmt->execute([
                    $userId,
                    $experienceType
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Experience saved successfully.',
            'data' => [
                'selected_experience_types' => $experienceTypes
            ]
        ]);

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to save experience.'
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
    'success' => false,
    'message' => 'Method not allowed.'
]);