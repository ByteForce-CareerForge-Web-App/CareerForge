<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| Authenticate User
|--------------------------------------------------------------------------
*/

$user = getAuthenticatedUser($pdo);

if (!$user) {
    exit;
}


/*
|--------------------------------------------------------------------------
| Check Alumni Role
|--------------------------------------------------------------------------
*/

if ($user["role"] !== "alumni") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Alumni access required"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET - Load Alumni Profile
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        $stmt = $pdo->prepare("
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                u.status,

                ap.id AS profile_id,
                ap.qualification,
                ap.graduation_year,
                ap.company,
                ap.position,
                ap.verified,
                ap.certificate_path

            FROM users u

            LEFT JOIN alumni_profiles ap
                ON ap.user_id = u.id

            WHERE u.id = ?

            LIMIT 1
        ");

        $stmt->execute([
            $user["id"]
        ]);

        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Alumni profile not found"
            ]);

            exit;
        }


        echo json_encode([
            "success" => true,
            "message" => "Alumni profile loaded successfully",

            "data" => [
                "id" => (int) $profile["id"],
                "profile_id" =>
                    $profile["profile_id"]
                        ? (int) $profile["profile_id"]
                        : null,

                "name" =>
                    $profile["name"] ?? "",

                "email" =>
                    $profile["email"] ?? "",

                "role" =>
                    $profile["role"] ?? "alumni",

                "status" =>
                    $profile["status"] ?? "",

                "qualification" =>
                    $profile["qualification"] ?? "",

                "graduation_year" =>
                    $profile["graduation_year"]
                        ? (int) $profile["graduation_year"]
                        : null,

                "company" =>
                    $profile["company"] ?? "",

                "position" =>
                    $profile["position"] ?? "",

                "verified" =>
                    (bool) $profile["verified"],

                "certificate_path" =>
                    $profile["certificate_path"] ?? null
            ]
        ]);

        exit;

    } catch (Exception $e) {

        error_log(
            "Alumni profile GET error: " .
            $e->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to load alumni profile"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| PUT - Update Alumni Profile
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

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


    $name = trim(
        $input["name"] ?? ""
    );

    $qualification = trim(
        $input["qualification"] ?? ""
    );

    $graduationYear =
        $input["graduation_year"] ?? null;

    $company = trim(
        $input["company"] ?? ""
    );

    $position = trim(
        $input["position"] ?? ""
    );


    /*
    |--------------------------------------------------------------------------
    | Validate
    |--------------------------------------------------------------------------
    */

    if (
        $name === "" ||
        $qualification === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Name and qualification are required"
        ]);

        exit;
    }


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
            "message" =>
                "A valid graduation year is required"
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
            "message" =>
                "Invalid graduation year"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    try {

        $pdo->beginTransaction();


        /*
        |----------------------------------------------------------------------
        | Update User Name
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            UPDATE users

            SET name = ?

            WHERE id = ?
        ");

        $stmt->execute([
            $name,
            $user["id"]
        ]);


        /*
        |----------------------------------------------------------------------
        | Update Alumni Profile
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            UPDATE alumni_profiles

            SET
                qualification = ?,
                graduation_year = ?,
                company = ?,
                position = ?

            WHERE user_id = ?
        ");

        $stmt->execute([
            $qualification,
            $graduationYear,

            $company !== ""
                ? $company
                : null,

            $position !== ""
                ? $position
                : null,

            $user["id"]
        ]);


        /*
        |----------------------------------------------------------------------
        | Commit
        |----------------------------------------------------------------------
        */

        $pdo->commit();


        echo json_encode([
            "success" => true,
            "message" =>
                "Alumni profile updated successfully"
        ]);

        exit;

    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        error_log(
            "Alumni profile PUT error: " .
            $e->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to update alumni profile"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| Unsupported Method
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);

exit;
