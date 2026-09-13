<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";


/*
|--------------------------------------------------------------------------
| STUDENT REGISTRATION
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    try {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!$data) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid JSON data"
            ]);

            exit;
        }

        $fullName = trim($data["fullName"] ?? "");
        $email = strtolower(trim($data["email"] ?? ""));
        $password = $data["password"] ?? "";
        $studentNumber = trim($data["studentNumber"] ?? "");
        $qualification = trim($data["qualification"] ?? "");
        $yearOfStudy = $data["yearOfStudy"] ?? null;
        $campus = trim($data["campus"] ?? "");


        if (
            $fullName === "" ||
            $email === "" ||
            $password === "" ||
            $studentNumber === "" ||
            $qualification === "" ||
            $yearOfStudy === null ||
            $campus === ""
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "All registration fields are required"
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


        $yearOfStudy = filter_var(
            $yearOfStudy,
            FILTER_VALIDATE_INT
        );

        if (
            $yearOfStudy === false ||
            $yearOfStudy < 1 ||
            $yearOfStudy > 6
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid year of study"
            ]);

            exit;
        }


        // Check email
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


        // Check student number
        $stmt = $pdo->prepare("
            SELECT id
            FROM student_profiles
            WHERE student_number = ?
            LIMIT 1
        ");

        $stmt->execute([$studentNumber]);

        if ($stmt->fetch()) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "This student number is already registered"
            ]);

            exit;
        }


        // Hash password
        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );


        $pdo->beginTransaction();


        // Create user
        $stmt = $pdo->prepare("
            INSERT INTO users (
                name,
                email,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, 'student', 'active')
        ");

        $stmt->execute([
            $fullName,
            $email,
            $hashedPassword
        ]);


        $userId = $pdo->lastInsertId();


        // Create student profile
        $stmt = $pdo->prepare("
            INSERT INTO student_profiles (
                user_id,
                student_number,
                qualification,
                year_of_study,
                campus
            )
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $studentNumber,
            $qualification,
            $yearOfStudy,
            $campus
        ]);


        $pdo->commit();


        http_response_code(201);

        echo json_encode([
            "success" => true,
            "message" => "Student account created successfully",
            "data" => [
                "user_id" => (int) $userId,
                "role" => "student"
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
            "message" => "Registration failed"
        ]);

        exit;
    }
}



/*
|--------------------------------------------------------------------------
| UPDATE STUDENT PROFILE
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    try {

        // ----------------------------------------------------------
        // Get Authorization header
        // ----------------------------------------------------------

        $headers = getallheaders();

        $authHeader = $headers["Authorization"]
            ?? $headers["authorization"]
            ?? null;

        if (
            !$authHeader ||
            !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)
        ) {

            http_response_code(401);

            echo json_encode([
                "success" => false,
                "message" => "Authorization token required"
            ]);

            exit;
        }

        $token = trim($matches[1]);

        // ----------------------------------------------------------
        // Hash token
        // ----------------------------------------------------------

        $tokenHash = hash("sha256", $token);

        // ----------------------------------------------------------
        // Find authenticated user
        // ----------------------------------------------------------

        $stmt = $pdo->prepare("
            SELECT user_id
            FROM api_tokens
            WHERE token_hash = ?
            AND expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([$tokenHash]);

        $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tokenData) {

            http_response_code(401);

            echo json_encode([
                "success" => false,
                "message" => "Invalid or expired token"
            ]);

            exit;
        }

        $userId = $tokenData["user_id"];

        // ----------------------------------------------------------
        // Read request data
        // ----------------------------------------------------------

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!$data) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request data"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Get fields
        // ----------------------------------------------------------

        $fullName = trim($data["fullName"] ?? "");
        $email = strtolower(trim($data["email"] ?? ""));
        $qualification = trim($data["qualification"] ?? "");
        $yearOfStudy = $data["yearOfStudy"] ?? null;
        $campus = trim($data["campus"] ?? "");
        $bio = trim($data["bio"] ?? "");
        $targetRole = trim($data["targetRole"] ?? "");

        // ----------------------------------------------------------
        // Validate required fields
        // ----------------------------------------------------------

        if (
            $fullName === "" ||
            $email === "" ||
            $qualification === "" ||
            $yearOfStudy === null ||
            $campus === ""
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Full name, email, qualification, year of study and campus are required"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Validate email
        // ----------------------------------------------------------

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid email address"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Convert year of study to integer
        // ----------------------------------------------------------

        $yearOfStudy = (int) $yearOfStudy;

        if ($yearOfStudy < 1 || $yearOfStudy > 6) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Year of study must be between 1 and 6"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Limit target role length
        // ----------------------------------------------------------

        if (strlen($targetRole) > 150) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Target career must not exceed 150 characters"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Check if email belongs to another user
        // ----------------------------------------------------------

        $stmt = $pdo->prepare("
            SELECT id
            FROM users
            WHERE email = ?
            AND id != ?
            LIMIT 1
        ");

        $stmt->execute([
            $email,
            $userId
        ]);

        if ($stmt->fetch()) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Email address is already in use"
            ]);

            exit;
        }

        // ----------------------------------------------------------
        // Update profile
        // ----------------------------------------------------------

        $pdo->beginTransaction();

        // Update users table
        $stmt = $pdo->prepare("
            UPDATE users
            SET name = ?,
                email = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $fullName,
            $email,
            $userId
        ]);

        // Update student_profiles table
        $stmt = $pdo->prepare("
            UPDATE student_profiles
            SET qualification = ?,
                year_of_study = ?,
                campus = ?,
                bio = ?,
                target_role = ?
            WHERE user_id = ?
        ");

        $stmt->execute([
            $qualification,
            $yearOfStudy,
            $campus,
            $bio !== "" ? $bio : null,
            $targetRole !== "" ? $targetRole : null,
            $userId
        ]);

        $pdo->commit();

        // ----------------------------------------------------------
        // Success response
        // ----------------------------------------------------------

        http_response_code(200);

        echo json_encode([
            "success" => true,
            "message" => "Student profile updated successfully"
        ]);

        exit;

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to update student profile"
        ]);

        exit;
    }
}



/*
|--------------------------------------------------------------------------
| GET LOGGED-IN STUDENT PROFILE
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

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
                "message" => "Authentication token required"
            ]);

            exit;
        }

        $token = trim($matches[1]);

        $tokenHash = hash(
            "sha256",
            $token
        );


        // Find token
        $stmt = $pdo->prepare("
            SELECT user_id
            FROM api_tokens
            WHERE token_hash = ?
            AND expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute([$tokenHash]);

        $tokenRecord = $stmt->fetch();

        if (!$tokenRecord) {

            http_response_code(401);

            echo json_encode([
                "success" => false,
                "message" => "Invalid or expired token"
            ]);

            exit;
        }


        $userId = $tokenRecord["user_id"];


        // Get student information
        $stmt = $pdo->prepare("
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                u.status,

                sp.student_number,
                sp.qualification,
                sp.year_of_study,
                sp.graduation_year,
                sp.campus,
                sp.bio,
                sp.current_company,
                sp.current_position,
                sp.target_role,
                sp.employability_score

            FROM users u

            INNER JOIN student_profiles sp
                ON sp.user_id = u.id

            WHERE u.id = ?
            AND u.role = 'student'

            LIMIT 1
        ");

        $stmt->execute([$userId]);

        $student = $stmt->fetch();

        if (!$student) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Student profile not found"
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "data" => [
                "id" => (int) $student["id"],
                "name" => $student["name"],
                "email" => $student["email"],
                "role" => $student["role"],
                "status" => $student["status"],

                "student_number" => $student["student_number"],
                "qualification" => $student["qualification"],
                "year_of_study" => (int) $student["year_of_study"],
                "graduation_year" => $student["graduation_year"],
                "campus" => $student["campus"],
                "bio" => $student["bio"],
                "current_company" => $student["current_company"],
                "current_position" => $student["current_position"],
                "target_role" => $student["target_role"],
                "employability_score" =>
                    $student["employability_score"]
            ]
        ]);

        exit;


    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to retrieve student profile"
        ]);

        exit;
    }
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

?>
