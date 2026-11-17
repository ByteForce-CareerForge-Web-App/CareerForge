<?php

require_once __DIR__ . "/../../api/config/cors.php";
require_once __DIR__ . "/../../api/config/database.php";

header("Content-Type: application/json; charset=UTF-8");

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
    $input["name"] ?? $input["fullName"] ?? ""
);

$email = trim(
    strtolower($input["email"] ?? "")
);

$password = $input["password"] ?? "";

$confirmPassword =
    $input["confirm_password"]
    ?? $input["confirmPassword"]
    ?? "";

$studentNumber = trim(
    $input["student_number"]
    ?? $input["studentNumber"]
    ?? ""
);

$qualification = trim(
    $input["qualification"] ?? ""
);

$otherQualification = trim(
    $input["other_qualification"]
    ?? $input["otherQualification"]
    ?? ""
);

$yearOfStudyRaw =
    $input["year_of_study"]
    ?? $input["yearOfStudy"]
    ?? null;

$studyMode = trim(
    $input["study_mode"]
    ?? $input["studyMode"]
    ?? ""
);

$campus = trim(
    $input["campus"] ?? ""
);

$personalEmail = trim(
    strtolower(
        $input["personal_email"]
        ?? $input["personalEmail"]
        ?? ""
    )
);

$graduationYear =
    $input["graduation_year"]
    ?? null;

$currentCompany = trim(
    $input["current_company"] ?? ""
);

$currentPosition = trim(
    $input["current_position"] ?? ""
);

$careerGoals =
    $input["career_goals"]
    ?? $input["careerGoals"]
    ?? [];

$termsAccepted =
    $input["terms_accepted"]
    ?? $input["termsAccepted"]
    ?? true;


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


/*
|--------------------------------------------------------------------------
| Email Validation
|--------------------------------------------------------------------------
*/

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email address"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Password Validation
|--------------------------------------------------------------------------
*/

if (!preg_match(
    '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/',
    $password
)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Password must contain at least 8 characters, including an uppercase letter, lowercase letter, number and special character"
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
| Qualification
|--------------------------------------------------------------------------
*/

if (
    strtolower($qualification) === "other"
    && $otherQualification === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Please specify your qualification"
    ]);

    exit;
}

if (
    strtolower($qualification) === "other"
    && $otherQualification !== ""
) {

    $qualification = $otherQualification;
}


/*
|--------------------------------------------------------------------------
| Student-specific validation
|--------------------------------------------------------------------------
*/

$yearOfStudy = null;

if ($role === "student") {

    /*
    |--------------------------------------------------------------------------
    | Year of Study
    |--------------------------------------------------------------------------
    */

    if (
        $yearOfStudyRaw === null ||
        $yearOfStudyRaw === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Please select your year of study"
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Convert Year of Study
    |--------------------------------------------------------------------------
    */

    if (is_numeric($yearOfStudyRaw)) {

        $yearOfStudy = (int) $yearOfStudyRaw;

    } else {

        $yearText = strtolower(
            trim((string) $yearOfStudyRaw)
        );

        if (preg_match(
            '/year\s*(\d+)/i',
            $yearText,
            $matches
        )) {

            $yearOfStudy = (int) $matches[1];

        } elseif (
            $yearText === "postgraduate"
            || $yearText === "postgraduate year"
        ) {

            $yearOfStudy = 5;

        } elseif ($yearText === "honours") {

            $yearOfStudy = 5;

        } elseif (
            $yearText === "master's"
            || $yearText === "masters"
        ) {

            $yearOfStudy = 6;
        }
    }

    if (
        $yearOfStudy === null ||
        $yearOfStudy < 1 ||
        $yearOfStudy > 6
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid year of study"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Campus
    |--------------------------------------------------------------------------
    */

    if (
        strtolower($studyMode) === "contact"
        && $campus === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Please select your campus"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Student Number
    |--------------------------------------------------------------------------
    */

    if (
        $studentNumber === ""
        || !preg_match(
            '/^[A-Za-z0-9-]{5,20}$/',
            $studentNumber
        )
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Please enter a valid student number"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Career Goals
    |--------------------------------------------------------------------------
    */

    if (!is_array($careerGoals)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Invalid career goals"
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
| Check Existing Student Number
|--------------------------------------------------------------------------
*/

if (
    $role === "student"
    && $studentNumber !== ""
) {

    $stmt = $pdo->prepare(
        "SELECT id
         FROM student_profiles
         WHERE student_number = ?
         LIMIT 1"
    );

    $stmt->execute([
        $studentNumber
    ]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" =>
                "This student number is already registered"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Create Account
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();


    /*
    |--------------------------------------------------------------------------
    | Password Hash
    |--------------------------------------------------------------------------
    */

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

        /*
        graduation_year is intentionally NULL because
        the new registration UI does not ask for it.
        */

        $stmt = $pdo->prepare("
            INSERT INTO student_profiles
            (
                user_id,
                student_number,
                qualification,
                year_of_study,
                graduation_year,
                campus,
                current_company,
                current_position,
                employability_score
            )
            VALUES
            (?, ?, ?, ?, NULL, ?, ?, ?, NULL)
        ");

        $stmt->execute([
            $userId,
            $studentNumber,
            $qualification,
            $yearOfStudy,
            $campus !== ""
                ? $campus
                : null,
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
        | Save Career Goals
        |--------------------------------------------------------------------------
        |
        | The new UI sends the database IDs after the
        | frontend mapping.
        |
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

            $insertedGoals = [];

            foreach ($careerGoals as $goalId) {

                $goalId = filter_var(
                    $goalId,
                    FILTER_VALIDATE_INT
                );

                if (
                    $goalId === false
                    || $goalId === null
                ) {
                    continue;
                }

                /*
                Prevent duplicate goal IDs.
                */

                if (
                    in_array(
                        $goalId,
                        $insertedGoals,
                        true
                    )
                ) {
                    continue;
                }

                $stmt->execute([
                    $profileId,
                    $goalId
                ]);

                $insertedGoals[] = $goalId;
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

