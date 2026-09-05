<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$name = trim($input["name"] ?? "");
$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";
$confirmPassword = $input["confirm_password"] ?? "";
$qualification = trim($input["qualification"] ?? "");
$graduationYear = $input["graduation_year"] ?? null;
$currentCompany = trim($input["current_company"] ?? "");
$currentPosition = trim($input["current_position"] ?? "");
$careerGoals = $input["career_goals"] ?? [];
$termsAccepted = $input["terms_accepted"] ?? false;


/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

if (
    $name === "" ||
    $email === "" ||
    $password === "" ||
    $confirmPassword === "" ||
    $qualification === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please complete all required fields"
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email address"
    ]);

    exit;
}

if ($password !== $confirmPassword) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Passwords do not match"
    ]);

    exit;
}

if (!$termsAccepted) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "You must accept the Terms of Service"
    ]);

    exit;
}

if (!is_array($careerGoals)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid career goals"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Check existing email
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id FROM users WHERE email = ? LIMIT 1"
);

$stmt->execute([$email]);

if ($stmt->fetch()) {

    http_response_code(409);

    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Create account
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $stmt = $pdo->prepare("
        INSERT INTO users
        (
            name,
            email,
            password,
            role,
            status
        )
        VALUES
        (?, ?, ?, 'student', 'active')
    ");

    $stmt->execute([
        $name,
        $email,
        $passwordHash
    ]);

    $userId = $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | Create student profile
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO student_profiles
        (
            user_id,
            qualification,
            graduation_year,
            current_company,
            current_position,
            employability_score
        )
        VALUES
        (?, ?, ?, ?, ?, NULL)
    ");

    $stmt->execute([
        $userId,
        $qualification,
        $graduationYear,
        $currentCompany !== "" ? $currentCompany : null,
        $currentPosition !== "" ? $currentPosition : null
    ]);

    $profileId = $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | Save career goals
    |--------------------------------------------------------------------------
    */

    if (!empty($careerGoals)) {

        $stmt = $pdo->prepare("
            INSERT INTO student_career_goals
            (
                student_profile_id,
                career_goal_id
            )
            VALUES (?, ?)
        ");

        foreach ($careerGoals as $goalId) {

            $goalId = filter_var(
                $goalId,
                FILTER_VALIDATE_INT
            );

            if ($goalId === false) {
                continue;
            }

            $stmt->execute([
                $profileId,
                $goalId
            ]);
        }
    }


    $pdo->commit();

    http_response_code(201);

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully",
        "user" => [
            "id" => (int) $userId,
            "name" => $name,
            "email" => $email,
            "role" => "student"
        ]
    ]);

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Account creation failed"
    ]);
}