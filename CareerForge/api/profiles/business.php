<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";


/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/

$method = $_SERVER["REQUEST_METHOD"];


/*
|--------------------------------------------------------------------------
| BUSINESS REGISTRATION
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
    $companyDescription = trim(
        $input["companyDescription"] ?? ""
    );


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
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


    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid email address"
        ]);

        exit;
    }


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
    | CHECK EMAIL
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([
        $email
    ]);

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
    | CHECK BUSINESS REGISTRATION NUMBER
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM business_profiles
        WHERE registration_number = ?
        LIMIT 1
    ");

    $stmt->execute([
        $registrationNumber
    ]);

    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "This business registration number is already registered"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE BUSINESS ACCOUNT
    |--------------------------------------------------------------------------
    */

    try {

        $pdo->beginTransaction();


        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE USER
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
            (
                ?,
                ?,
                ?,
                'business',
                'active'
            )
        ");

        $stmt->execute([
            $fullName,
            $email,
            $hashedPassword
        ]);


        $userId = (int) $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | CREATE BUSINESS PROFILE
        |--------------------------------------------------------------------------
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
            (
                ?,
                ?,
                ?,
                ?,
                ?
            )
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
                "user_id" => $userId,
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
            "message" => "Business account could not be created"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| BUSINESS DASHBOARD
|--------------------------------------------------------------------------
*/

if ($method === "GET") {

    require_once __DIR__ . "/../config/auth.php";


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATE BUSINESS
    |--------------------------------------------------------------------------
    */

    $user = getAuthenticatedUser($pdo);


    if (!$user) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | ONLY BUSINESS ACCOUNTS
    |--------------------------------------------------------------------------
    */

    if ($user["role"] !== "business") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Only business accounts can access this resource"
        ]);

        exit;
    }


    try {

        $businessUserId = (int) $user["id"];


        /*
        |--------------------------------------------------------------------------
        | GET BUSINESS PROFILE
        |--------------------------------------------------------------------------
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
            $businessUserId
        ]);

        $business = $stmt->fetch(PDO::FETCH_ASSOC);


        if (!$business) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Business profile not found"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | BUSINESS PROFILE ID
        |--------------------------------------------------------------------------
        */

        $businessProfileId = (int) $business["profile_id"];


        /*
        |--------------------------------------------------------------------------
        | ACTIVE OPPORTUNITIES
        |--------------------------------------------------------------------------
        |
        | Active opportunities are opportunities belonging to this business
        | whose status is "open".
        |
        */

        $stmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM opportunities
            WHERE business_id = ?
            AND LOWER(status) = 'open'
        ");

        $stmt->execute([
            $businessProfileId
        ]);

        $activeOpportunities = (int) $stmt->fetchColumn();


        /*
        |--------------------------------------------------------------------------
        | TOTAL APPLICATIONS
        |--------------------------------------------------------------------------
        |
        | Applications are connected to the business through:
        |
        | applications
        |      ↓
        | opportunities
        |      ↓
        | business_id
        |
        */

        $stmt = $pdo->prepare("
            SELECT COUNT(*)

            FROM applications a

            INNER JOIN opportunities o
                ON a.opportunity_id = o.id

            WHERE o.business_id = ?
        ");

        $stmt->execute([
            $businessProfileId
        ]);

        $totalApplications = (int) $stmt->fetchColumn();


        /*
        |--------------------------------------------------------------------------
        | SHORTLISTED APPLICATIONS
        |--------------------------------------------------------------------------
        |
        | Supports the normal "shortlisted" status.
        |
        */

        $stmt = $pdo->prepare("
            SELECT COUNT(*)

            FROM applications a

            INNER JOIN opportunities o
                ON a.opportunity_id = o.id

            WHERE o.business_id = ?

            AND LOWER(a.status) IN (
                'shortlisted',
                'shortlist'
            )
        ");

        $stmt->execute([
            $businessProfileId
        ]);

        $shortlisted = (int) $stmt->fetchColumn();


        /*
        |--------------------------------------------------------------------------
        | INTERVIEWS
        |--------------------------------------------------------------------------
        |
        | Supports common interview status values so the dashboard remains
        | compatible if the application status is stored as "interview"
        | or "interviewed".
        |
        */

        $stmt = $pdo->prepare("
            SELECT COUNT(*)

            FROM applications a

            INNER JOIN opportunities o
                ON a.opportunity_id = o.id

            WHERE o.business_id = ?

            AND LOWER(a.status) IN (
                'interview',
                'interviewed'
            )
        ");

        $stmt->execute([
            $businessProfileId
        ]);

        $interviews = (int) $stmt->fetchColumn();


        /*
        |--------------------------------------------------------------------------
        | RECENT APPLICATIONS
        |--------------------------------------------------------------------------
        |
        | Gets the latest applications submitted to this business.
        |
        | We join:
        |
        | applications
        | opportunities
        | users
        | student_profiles
        |
        */

        $stmt = $pdo->prepare("
            SELECT

                a.id AS application_id,
                a.opportunity_id,
                a.status,
                a.cv_path,
                a.cover_letter,
                a.notes,
                a.applied_at,

                o.title AS opportunity_title,
                o.type AS opportunity_type,

                u.id AS student_id,
                u.name AS student_name,
                u.email AS student_email,

                sp.qualification,
                sp.graduation_year,
                sp.current_company,
                sp.current_position

            FROM applications a

            INNER JOIN opportunities o
                ON a.opportunity_id = o.id

            INNER JOIN users u
                ON a.student_id = u.id

            LEFT JOIN student_profiles sp
                ON sp.user_id = u.id

            WHERE o.business_id = ?

            ORDER BY a.applied_at DESC

            LIMIT 5
        ");

        $stmt->execute([
            $businessProfileId
        ]);

        $recentApplications = $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


        /*
        |--------------------------------------------------------------------------
        | FORMAT RECENT APPLICATIONS
        |--------------------------------------------------------------------------
        */

        foreach ($recentApplications as &$application) {

            $application["application_id"] =
                (int) $application["application_id"];

            $application["opportunity_id"] =
                (int) $application["opportunity_id"];

            $application["student_id"] =
                (int) $application["student_id"];
        }

        unset($application);


        /*
        |--------------------------------------------------------------------------
        | DASHBOARD DATA
        |--------------------------------------------------------------------------
        */

        $business["dashboard"] = [

            "stats" => [
                "active_opportunities" => $activeOpportunities,
                "total_applications" => $totalApplications,
                "shortlisted" => $shortlisted,
                "interviews" => $interviews
            ],

            "recent_applications" => $recentApplications

        ];


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "data" => $business
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to retrieve business dashboard"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| UNSUPPORTED METHOD
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);

exit;
?>

