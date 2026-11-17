<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

try {
    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }

    // Only alumni can use this endpoint
    if ($user['role'] !== 'alumni') {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Only alumni can manage professional experience."
        ]);

        exit;
    }

    $userId = (int) $user['id'];
    $method = $_SERVER['REQUEST_METHOD'];

    /*
     * GET
     * Return all experiences belonging to the logged-in alumni.
     */
    if ($method === 'GET') {

        $stmt = $pdo->prepare("
            SELECT
                id,
                job_title,
                company,
                start_year,
                end_year,
                description,
                created_at,
                updated_at
            FROM alumni_experiences
            WHERE user_id = ?
            ORDER BY start_year DESC, id DESC
        ");

        $stmt->execute([$userId]);

        $experiences = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedExperiences = array_map(function ($experience) {
            return [
                "id" => (string) $experience["id"],
                "jobTitle" => $experience["job_title"],
                "company" => $experience["company"],
                "startYear" => (string) $experience["start_year"],
                "endYear" => $experience["end_year"]
                    ? (string) $experience["end_year"]
                    : "Present",
                "description" => $experience["description"] ?? "",
                "createdAt" => $experience["created_at"],
                "updatedAt" => $experience["updated_at"]
            ];
        }, $experiences);

        echo json_encode([
            "success" => true,
            "message" => "Experiences retrieved successfully.",
            "data" => $formattedExperiences
        ]);

        exit;
    }

    /*
     * POST
     * Add a new professional experience.
     */
    if ($method === 'POST') {

        $input = json_decode(file_get_contents("php://input"), true);

        if (!is_array($input)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request body."
            ]);

            exit;
        }

        $jobTitle = trim($input['jobTitle'] ?? '');
        $company = trim($input['company'] ?? '');
        $startYear = trim((string) ($input['startYear'] ?? ''));
        $endYear = trim((string) ($input['endYear'] ?? ''));
        $description = trim($input['description'] ?? '');

        if ($jobTitle === '') {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Job title is required."
            ]);

            exit;
        }

        if ($company === '') {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Company name is required."
            ]);

            exit;
        }

        if ($startYear === '') {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Start year is required."
            ]);

            exit;
        }

        if (!preg_match('/^\d{4}$/', $startYear)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Start year must be a valid 4-digit year."
            ]);

            exit;
        }

        $currentYear = (int) date('Y');
        $startYearInt = (int) $startYear;

        if ($startYearInt < 1900 || $startYearInt > $currentYear + 1) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Please enter a valid start year."
            ]);

            exit;
        }

        $endYearValue = null;

        if ($endYear !== '') {

            if (!preg_match('/^\d{4}$/', $endYear)) {
                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "End year must be a valid 4-digit year."
                ]);

                exit;
            }

            $endYearInt = (int) $endYear;

            if ($endYearInt < $startYearInt) {
                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "End year cannot be before the start year."
                ]);

                exit;
            }

            if ($endYearInt > $currentYear + 1) {
                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Please enter a valid end year."
                ]);

                exit;
            }

            $endYearValue = $endYearInt;
        }

        $stmt = $pdo->prepare("
            INSERT INTO alumni_experiences
            (
                user_id,
                job_title,
                company,
                start_year,
                end_year,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $jobTitle,
            $company,
            $startYearInt,
            $endYearValue,
            $description !== '' ? $description : null
        ]);

        $experienceId = $pdo->lastInsertId();

        echo json_encode([
            "success" => true,
            "message" => "Experience added successfully.",
            "data" => [
                "id" => (string) $experienceId,
                "jobTitle" => $jobTitle,
                "company" => $company,
                "startYear" => $startYear,
                "endYear" => $endYear !== '' ? $endYear : "Present",
                "description" => $description
            ]
        ]);

        exit;
    }

    /*
     * DELETE
     * Delete one experience belonging to the logged-in alumni.
     */
    if ($method === 'DELETE') {

        $input = json_decode(file_get_contents("php://input"), true);

        $experienceId = $input['id'] ?? null;

        if (!$experienceId || !is_numeric($experienceId)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid experience ID is required."
            ]);

            exit;
        }

        $stmt = $pdo->prepare("
            DELETE FROM alumni_experiences
            WHERE id = ?
            AND user_id = ?
        ");

        $stmt->execute([
            (int) $experienceId,
            $userId
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Experience not found."
            ]);

            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Experience deleted successfully."
        ]);

        exit;
    }

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

} catch (PDOException $e) {

    error_log("Alumni experience database error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error while processing experience."
    ]);

} catch (Exception $e) {

    error_log("Alumni experience error: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "An unexpected error occurred."
    ]);
}