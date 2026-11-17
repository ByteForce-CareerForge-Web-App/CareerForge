<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

function sendResponse(
    bool $success,
    string $message,
    $data = null,
    int $statusCode = 200
) {
    http_response_code($statusCode);

    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED ALUMNI
|--------------------------------------------------------------------------
*/

function getAuthenticatedAlumni(PDO $pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"]
        ?? $headers["authorization"]
        ?? null;

    if (!$authorization) {
        sendResponse(
            false,
            "Authentication token is required.",
            null,
            401
        );
    }

    if (
        !preg_match(
            '/Bearer\s+(.+)/i',
            $authorization,
            $matches
        )
    ) {
        sendResponse(
            false,
            "Invalid authorization header.",
            null,
            401
        );
    }

    $token = trim($matches[1]);

    if ($token === "") {
        sendResponse(
            false,
            "Authentication token is required.",
            null,
            401
        );
    }

    $tokenHash = hash(
        "sha256",
        $token
    );

    $sql = "
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.status,
            ap.id AS alumni_profile_id,
            ap.qualification,
            ap.graduation_year,
            ap.company,
            ap.position,
            ap.verified
        FROM api_tokens t
        INNER JOIN users u
            ON t.user_id = u.id
        INNER JOIN alumni_profiles ap
            ON ap.user_id = u.id
        WHERE t.token_hash = ?
          AND t.expires_at > NOW()
          AND u.role = 'alumni'
          AND u.status = 'active'
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        $tokenHash
    ]);

    $alumni = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$alumni) {
        sendResponse(
            false,
            "Invalid or expired alumni authentication token.",
            null,
            401
        );
    }

    return $alumni;
}

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=careerforge;charset=utf8mb4",
        "root",
        ""
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );
} catch (PDOException $e) {
    sendResponse(
        false,
        "Database connection failed.",
        null,
        500
    );
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

$alumni = getAuthenticatedAlumni($pdo);

$alumniUserId = (int) $alumni["id"];

/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/

$method = $_SERVER["REQUEST_METHOD"];

/*
|--------------------------------------------------------------------------
| GET - ALUMNI APPLICATIONS
|--------------------------------------------------------------------------
|
| Returns applications belonging to the authenticated Alumni.
|
| IMPORTANT:
| The database column is called student_id, but its foreign key
| points to users.id. For the Alumni flow, we store the Alumni's
| users.id in this existing column.
|
|--------------------------------------------------------------------------
*/

if ($method === "GET") {
    try {
        $sql = "
            SELECT
                a.id,
                a.opportunity_id,
                a.status,
                a.cv_path,
                a.cover_letter,
                a.notes,
                a.applied_at,

                o.title,
                o.description,
                o.type,
                o.location,
                o.work_arrangement,
                o.positions,
                o.minimum_qualification,
                o.deadline,

                bp.company_name

            FROM applications a

            INNER JOIN opportunities o
                ON a.opportunity_id = o.id

            INNER JOIN business_profiles bp
                ON o.business_id = bp.id

            WHERE a.student_id = ?

            ORDER BY a.applied_at DESC
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            $alumniUserId
        ]);

        $applications = $stmt->fetchAll();

        foreach ($applications as &$application) {
            $application["id"] =
                (int) $application["id"];

            $application["opportunity_id"] =
                (int) $application["opportunity_id"];

            if (
                isset($application["positions"]) &&
                $application["positions"] !== null
            ) {
                $application["positions"] =
                    (int) $application["positions"];
            }

            /*
            |--------------------------------------------------------------------------
            | Format Opportunity Type
            |--------------------------------------------------------------------------
            */

            $type = strtolower(
                trim(
                    $application["type"] ?? ""
                )
            );

            switch ($type) {
                case "internship":
                    $application["type"] =
                        "Internship";
                    break;

                case "graduate_program":
                case "graduate programme":
                case "graduate_programme":
                    $application["type"] =
                        "Graduate Programme";
                    break;

                case "job":
                case "full-time":
                case "full_time":
                    $application["type"] =
                        "Full-time";
                    break;

                case "learnership":
                    $application["type"] =
                        "Learnership";
                    break;

                case "volunteer":
                    $application["type"] =
                        "Volunteer";
                    break;

                default:
                    $application["type"] =
                        "Other";
                    break;
            }
        }

        unset($application);

        sendResponse(
            true,
            "Alumni applications loaded successfully.",
            $applications
        );

    } catch (PDOException $e) {
        error_log(
            "Alumni GET applications error: " .
            $e->getMessage()
        );

        sendResponse(
            false,
            "Could not load alumni applications.",
            null,
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| POST - APPLY FOR OPPORTUNITY
|--------------------------------------------------------------------------
*/

if ($method === "POST") {
    try {
        $rawBody = file_get_contents("php://input");

        $body = json_decode(
            $rawBody,
            true
        );

        if (!is_array($body)) {
            sendResponse(
                false,
                "Invalid JSON request body.",
                null,
                400
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Accept opportunity_id
        |--------------------------------------------------------------------------
        */

        $opportunityId =
            $body["opportunity_id"]
            ?? $body["opportunityId"]
            ?? null;

        if (
            $opportunityId === null ||
            !is_numeric($opportunityId) ||
            (int) $opportunityId <= 0
        ) {
            sendResponse(
                false,
                "A valid opportunity_id is required.",
                null,
                400
            );
        }

        $opportunityId =
            (int) $opportunityId;

        /*
        |--------------------------------------------------------------------------
        | Verify Opportunity
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                id,
                title,
                status
            FROM opportunities
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $opportunityId
        ]);

        $opportunity =
            $stmt->fetch();

        if (!$opportunity) {
            sendResponse(
                false,
                "Opportunity not found.",
                null,
                404
            );
        }

        if (
            strtolower(
                $opportunity["status"]
            ) !== "open"
        ) {
            sendResponse(
                false,
                "This opportunity is no longer open for applications.",
                null,
                409
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Check Existing Application
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                id,
                status,
                applied_at
            FROM applications
            WHERE opportunity_id = ?
              AND student_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $opportunityId,
            $alumniUserId
        ]);

        $existingApplication =
            $stmt->fetch();

        if ($existingApplication) {
            sendResponse(
                false,
                "You have already applied to this opportunity.",
                [
                    "application_id" =>
                        (int) $existingApplication["id"],

                    "status" =>
                        $existingApplication["status"],

                    "applied_at" =>
                        $existingApplication["applied_at"]
                ],
                409
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Insert Application
        |--------------------------------------------------------------------------
        |
        | The existing database column is named student_id.
        | For Alumni applications it stores the authenticated
        | Alumni's users.id.
        |
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO applications (
                opportunity_id,
                student_id,
                status
            )
            VALUES (
                ?,
                ?,
                'submitted'
            )
        ");

        $stmt->execute([
            $opportunityId,
            $alumniUserId
        ]);

        $applicationId =
            (int) $pdo->lastInsertId();

        /*
        |--------------------------------------------------------------------------
        | Retrieve Created Application
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                a.id,
                a.opportunity_id,
                a.status,
                a.applied_at,
                o.title
            FROM applications a
            INNER JOIN opportunities o
                ON a.opportunity_id = o.id
            WHERE a.id = ?
              AND a.student_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $applicationId,
            $alumniUserId
        ]);

        $application =
            $stmt->fetch();

        if ($application) {
            $application["id"] =
                (int) $application["id"];

            $application["opportunity_id"] =
                (int) $application["opportunity_id"];
        }

        sendResponse(
            true,
            "Application submitted successfully.",
            $application,
            201
        );

    } catch (PDOException $e) {
        error_log(
            "Alumni POST application error: " .
            $e->getMessage()
        );

        sendResponse(
            false,
            "Could not submit application.",
            null,
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| DELETE - REMOVE APPLICATION
|--------------------------------------------------------------------------
|
| This is included because the existing Alumni My Applications UI
| already has a Remove Application function.
|
|--------------------------------------------------------------------------
*/

if ($method === "DELETE") {
    try {
        $rawBody = file_get_contents("php://input");

        $body = json_decode(
            $rawBody,
            true
        );

        if (!is_array($body)) {
            $body = [];
        }

        $applicationId =
            $body["application_id"]
            ?? $body["applicationId"]
            ?? null;

        /*
        |--------------------------------------------------------------------------
        | Clear All Applications
        |--------------------------------------------------------------------------
        */

        $clearAll =
            !empty($body["clear_all"]);

        if ($clearAll) {
            $stmt = $pdo->prepare("
                DELETE FROM applications
                WHERE student_id = ?
            ");

            $stmt->execute([
                $alumniUserId
            ]);

            sendResponse(
                true,
                "All alumni applications have been removed.",
                [
                    "deleted_count" =>
                        $stmt->rowCount()
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Remove One Application
        |--------------------------------------------------------------------------
        */

        if (
            $applicationId === null ||
            !is_numeric($applicationId) ||
            (int) $applicationId <= 0
        ) {
            sendResponse(
                false,
                "A valid application_id is required.",
                null,
                400
            );
        }

        $applicationId =
            (int) $applicationId;

        $stmt = $pdo->prepare("
            DELETE FROM applications
            WHERE id = ?
              AND student_id = ?
        ");

        $stmt->execute([
            $applicationId,
            $alumniUserId
        ]);

        if ($stmt->rowCount() === 0) {
            sendResponse(
                false,
                "Application not found.",
                null,
                404
            );
        }

        sendResponse(
            true,
            "Application removed successfully.",
            null
        );

    } catch (PDOException $e) {
        error_log(
            "Alumni DELETE application error: " .
            $e->getMessage()
        );

        sendResponse(
            false,
            "Could not remove application.",
            null,
            500
        );
    }
}

/*
|--------------------------------------------------------------------------
| UNSUPPORTED METHOD
|--------------------------------------------------------------------------
*/

sendResponse(
    false,
    "Method not allowed.",
    null,
    405
);

