<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];


/*
|--------------------------------------------------------------------------
| POST - Business Registration
|--------------------------------------------------------------------------
*/

if ($method === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $fullName = trim($input["fullName"] ?? "");
    $email = trim($input["email"] ?? "");
    $password = $input["password"] ?? "";
    $companyName = trim($input["companyName"] ?? "");
    $registrationNumber = trim($input["registrationNumber"] ?? "");
    $industry = trim($input["industry"] ?? "");
    $companyDescription = trim($input["companyDescription"] ?? "");


    /*
    |----------------------------------------------------------------------
    | Validate required fields
    |----------------------------------------------------------------------
    */

    if (
        $fullName === "" ||
        $email === "" ||
        $password === "" ||
        $companyName === "" ||
        $registrationNumber === "" ||
        $industry === "" ||
        $companyDescription === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "All required fields must be completed"
        ]);

        exit;
    }


    /*
    |----------------------------------------------------------------------
    | Validate email
    |----------------------------------------------------------------------
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
    |----------------------------------------------------------------------
    | Check password
    |----------------------------------------------------------------------
    */

    if (strlen($password) < 8) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Password must contain at least 8 characters"
        ]);

        exit;
    }


    /*
    |----------------------------------------------------------------------
    | Check if email already exists
    |----------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

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
    |----------------------------------------------------------------------
    | Check registration number
    |----------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM business_profiles
        WHERE registration_number = ?
        LIMIT 1
    ");

    $stmt->execute([$registrationNumber]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "This company registration number is already registered"
        ]);

        exit;
    }


    /*
    |----------------------------------------------------------------------
    | Create account
    |----------------------------------------------------------------------
    */

    try {

        $pdo->beginTransaction();

        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );


        /*
        |------------------------------------------------------------------
        | Create user
        |------------------------------------------------------------------
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
            (?, ?, ?, 'business', 'active')
        ");

        $stmt->execute([
            $fullName,
            $email,
            $hashedPassword
        ]);

        $userId = $pdo->lastInsertId();


        /*
        |------------------------------------------------------------------
        | Create business profile
        |------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO business_profiles
            (
                user_id,
                company_name,
                registration_number,
                industry,
                description
            )
            VALUES
            (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $companyName,
            $registrationNumber,
            $industry,
            $companyDescription
        ]);


        $pdo->commit();


        http_response_code(201);

        echo json_encode([
            "success" => true,
            "message" => "Business account created successfully",
            "data" => [
                "user_id" => (int) $userId,
                "role" => "business"
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to create business account"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| GET - Business Dashboard Profile
|--------------------------------------------------------------------------
*/

if ($method === "GET") {

    require_once __DIR__ . "/../config/auth.php";

    $user = getAuthenticatedUser($pdo);


    /*
    |----------------------------------------------------------------------
    | Make sure this is a business account
    |----------------------------------------------------------------------
    */

    if ($user["role"] !== "business") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business account required"
        ]);

        exit;
    }


    /*
    |----------------------------------------------------------------------
    | Get business profile
    |----------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            u.id AS user_id,
            u.name,
            u.email,
            u.role,

            bp.id AS profile_id,
            bp.company_name,
            bp.registration_number,
            bp.website,
            bp.industry,
            bp.description,
            bp.verification_status

        FROM users u

        INNER JOIN business_profiles bp
            ON bp.user_id = u.id

        WHERE u.id = ?

        LIMIT 1
    ");

    $stmt->execute([
        $user["id"]
    ]);

    $business = $stmt->fetch();


    if (!$business) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Business profile not found"
        ]);

        exit;
    }


    echo json_encode([
        "success" => true,
        "message" => "Business profile retrieved successfully",
        "data" => $business
    ]);

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

exit;