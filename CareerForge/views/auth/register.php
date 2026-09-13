<?php

require_once __DIR__ . "/../../api/config/cors.php";
require_once __DIR__ . "/../../api/config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Input
|--------------------------------------------------------------------------
*/

$role = strtolower(
    trim($input["role"] ?? "student")
);

$name = trim(
    $input["name"] ?? ""
);

$email = trim(
    $input["email"] ?? ""
);

$password = $input["password"] ?? "";

$confirmPassword =
    $input["confirm_password"] ?? "";

$qualification = trim(
    $input["qualification"] ?? ""
);

$graduationYear =
    $input["graduation_year"] ?? null;

$currentCompany = trim(
    $input["current_company"] ?? ""
);

$currentPosition = trim(
    $input["current_position"] ?? ""
);

$careerGoals =
    $input["career_goals"] ?? [];

$termsAccepted =
    $input["terms_accepted"] ?? false;


/*
|--------------------------------------------------------------------------
| Validate Role
|--------------------------------------------------------------------------
*/

if (!in_array($role, ["student", "alumni"], true)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid registration role"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Basic Validation
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


/*
|--------------------------------------------------------------------------
| Password Validation
|--------------------------------------------------------------------------
*/

if (strlen($password) < 8) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 8 characters"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Graduation Year Validation
|--------------------------------------------------------------------------
*/

if (
    $graduationYear === null ||
    !filter_var(
        $graduationYear,
        FILTER_VALIDATE_INT
    )
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "A valid graduation year is required"
    ]);

    exit;
}

$graduationYear =
    (int) $graduationYear;

$currentYear =
    (int) date("Y");

if (
    $graduationYear < 1950 ||
    $graduationYear > $currentYear + 10
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid graduation year"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Student-specific Validation
|--------------------------------------------------------------------------
*/

if ($role === "student") {

    if (!$termsAccepted) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "You must accept the Terms of Service"
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
}


/*
|--------------------------------------------------------------------------
| Check Existing Email
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
        "message" =>
            "An account with this email already exists"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Create Account
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );


    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

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
        (?, ?, ?, ?, 'active')
    ");

    $stmt->execute([
        $name,
        $email,
        $passwordHash,
        $role
    ]);

    $userId =
        (int) $pdo->lastInsertId();


    /*
    |--------------------------------------------------------------------------
    | Student Profile
    |--------------------------------------------------------------------------
    */

    if ($role === "student") {

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
            $currentCompany !== ""
                ? $currentCompany
                : null,
            $currentPosition !== ""
                ? $currentPosition
                : null
        ]);

        $profileId =
            (int) $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | Save Student Career Goals
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
    }


    /*
    |--------------------------------------------------------------------------
    | Alumni Profile
    |--------------------------------------------------------------------------
    */

    if ($role === "alumni") {

        $stmt = $pdo->prepare("
            INSERT INTO alumni_profiles
            (
                user_id,
                qualification,
                graduation_year,
                company,
                position,
                verified
            )
            VALUES
            (?, ?, ?, ?, ?, 0)
        ");

        $stmt->execute([
            $userId,
            $qualification,
            $graduationYear,
            $currentCompany !== ""
                ? $currentCompany
                : null,
            $currentPosition !== ""
                ? $currentPosition
                : null
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Complete Transaction
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    http_response_code(201);

    echo json_encode([
        "success" => true,
        "message" =>
            "Account created successfully",

        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => $role
        ]
    ]);

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "Registration error: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Account creation failed"
    ]);
}
