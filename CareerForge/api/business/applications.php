<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");


/*
|--------------------------------------------------------------------------
| AUTHENTICATE BUSINESS
|--------------------------------------------------------------------------
*/

function authenticateBusiness($pdo)
{
    $headers = getallheaders();

    $authorization =
        $headers["Authorization"]
        ?? $headers["authorization"]
        ?? "";

    if (
        !preg_match(
            '/Bearer\s+(.+)/i',
            $authorization,
            $matches
        )
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required."
        ]);

        exit;
    }

    $token = trim($matches[1]);

    if ($token === "") {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required."
        ]);

        exit;
    }

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT
            t.user_id,
            t.expires_at,
            u.role,
            u.status AS user_status,
            bp.id AS business_id,
            bp.company_name
        FROM api_tokens t
        INNER JOIN users u
            ON u.id = t.user_id
        INNER JOIN business_profiles bp
            ON bp.user_id = u.id
        WHERE t.token_hash = ?
        LIMIT 1
    ");

    $stmt->execute([
        $tokenHash
    ]);

    $business = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$business) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid authentication token."
        ]);

        exit;
    }

    if (
        !empty($business["expires_at"]) &&
        strtotime($business["expires_at"]) < time()
    ) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Your session has expired. Please log in again."
        ]);

        exit;
    }

    if ($business["role"] !== "business") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business access is required."
        ]);

        exit;
    }

    if ($business["user_status"] !== "active") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Your business account is not active."
        ]);

        exit;
    }

    return $business;
}


/*
|--------------------------------------------------------------------------
| FORMAT STATUS
|--------------------------------------------------------------------------
*/

function formatApplicationStatus($status)
{
    switch ($status) {

        case "submitted":
            return "Under Review";

        case "reviewing":
            return "Under Review";

        case "shortlisted":
            return "Shortlisted";

        case "interview":
            return "Interview";

        case "rejected":
            return "Rejected";

        case "accepted":
            return "Accepted";

        case "withdrawn":
            return "Withdrawn";

        default:
            return "Under Review";
    }
}


/*
|--------------------------------------------------------------------------
| FORMAT APPLICATION
|--------------------------------------------------------------------------
*/

function formatApplication($application)
{
    $name = trim($application["student_name"] ?? "");

    $initials = "";

    if ($name !== "") {

        $nameParts = preg_split(
            '/\s+/',
            $name
        );

        if (count($nameParts) >= 2) {

            $initials =
                strtoupper(
                    substr(
                        $nameParts[0],
                        0,
                        1
                    ) .
                    substr(
                        $nameParts[count($nameParts) - 1],
                        0,
                        1
                    )
                );

        } else {

            $initials =
                strtoupper(
                    substr(
                        $name,
                        0,
                        2
                    )
                );
        }
    }

    return [
        "id" => (int) $application["id"],

        "student_id" =>
            (int) $application["student_id"],

        "opportunity_id" =>
            (int) $application["opportunity_id"],

        "name" =>
            $name !== ""
                ? $name
                : "Unknown Candidate",

        "initials" =>
            $initials !== ""
                ? $initials
                : "??",

        "opportunity" =>
            $application["opportunity_title"]
            ?? "Opportunity",

        "qualification" =>
            $application["qualification"]
            ?? "Qualification not provided",

        "employability_score" =>
            $application["employability_score"] !== null
                ? (float) $application["employability_score"]
                : null,

        "email" =>
            $application["student_email"]
            ?? "",

        "status" =>
            $application["status"],

        "status_label" =>
            formatApplicationStatus(
                $application["status"]
            ),

        "applied_at" =>
            $application["applied_at"],
    ];
}


/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/

$method = $_SERVER["REQUEST_METHOD"];


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

try {

    $business = authenticateBusiness($pdo);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to authenticate business account."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET APPLICATIONS
|--------------------------------------------------------------------------
*/

if ($method === "GET") {

    try {

        $opportunityId =
            $_GET["opportunity_id"]
            ?? null;

        /*
        |--------------------------------------------------------------------------
        | Validate opportunity ID when supplied
        |--------------------------------------------------------------------------
        */

        if (
            $opportunityId !== null &&
            (
                !ctype_digit((string) $opportunityId) ||
                (int) $opportunityId <= 0
            )
        ) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity ID."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Only return applications belonging to this business.
        |--------------------------------------------------------------------------
        */

        $sql = "
            SELECT
                a.id,
                a.opportunity_id,
                a.student_id,
                a.status,
                a.applied_at,

                o.title AS opportunity_title,

                u.name AS student_name,
                u.email AS student_email,

                sp.qualification,
                sp.employability_score

            FROM applications a

            INNER JOIN opportunities o
                ON o.id = a.opportunity_id

            INNER JOIN users u
                ON u.id = a.student_id

            LEFT JOIN student_profiles sp
                ON sp.user_id = a.student_id

            WHERE o.business_id = ?
        ";

        $params = [
            $business["business_id"]
        ];


        /*
        |--------------------------------------------------------------------------
        | Filter by selected opportunity
        |--------------------------------------------------------------------------
        */

        if ($opportunityId !== null) {

            $sql .= "
                AND a.opportunity_id = ?
            ";

            $params[] =
                (int) $opportunityId;
        }


        $sql .= "
            ORDER BY a.applied_at DESC
        ";


        $stmt = $pdo->prepare($sql);

        $stmt->execute($params);

        $applications =
            $stmt->fetchAll(
                PDO::FETCH_ASSOC
            );


        /*
        |--------------------------------------------------------------------------
        | Format results
        |--------------------------------------------------------------------------
        */

        $formattedApplications = [];

        foreach ($applications as $application) {

            $formattedApplications[] =
                formatApplication(
                    $application
                );
        }


        echo json_encode([
            "success" => true,
            "applications" =>
                $formattedApplications
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to load applications."
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| UPDATE APPLICATION STATUS
|--------------------------------------------------------------------------
*/

if (
    $method === "PUT" ||
    $method === "PATCH"
) {

    try {

        $rawInput =
            file_get_contents("php://input");

        $input =
            json_decode(
                $rawInput,
                true
            );


        if (!is_array($input)) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Invalid request body."
            ]);

            exit;
        }


        $applicationId =
            $input["application_id"]
            ?? null;

        $status =
            strtolower(
                trim(
                    $input["status"]
                    ?? ""
                )
            );


        /*
        |--------------------------------------------------------------------------
        | Validate application ID
        |--------------------------------------------------------------------------
        */

        if (
            $applicationId === null ||
            !is_numeric($applicationId) ||
            (int) $applicationId <= 0
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Application ID is required."
            ]);

            exit;
        }

        $applicationId =
            (int) $applicationId;


        /*
        |--------------------------------------------------------------------------
        | Allowed database statuses
        |--------------------------------------------------------------------------
        */

        $allowedStatuses = [
            "submitted",
            "reviewing",
            "shortlisted",
            "interview",
            "rejected",
            "accepted",
            "withdrawn"
        ];

        if (
            !in_array(
                $status,
                $allowedStatuses,
                true
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Invalid application status."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | SECURITY:
        | Verify the application belongs to an opportunity
        | owned by the authenticated business.
        |--------------------------------------------------------------------------
        */

        $checkStmt = $pdo->prepare("
            SELECT
                a.id,
                a.status,
                o.business_id
            FROM applications a
            INNER JOIN opportunities o
                ON o.id = a.opportunity_id
            WHERE
                a.id = ?
                AND o.business_id = ?
            LIMIT 1
        ");

        $checkStmt->execute([
            $applicationId,
            $business["business_id"]
        ]);

        $application =
            $checkStmt->fetch(
                PDO::FETCH_ASSOC
            );


        if (!$application) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Application not found or access denied."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Update status
        |--------------------------------------------------------------------------
        */

        $updateStmt = $pdo->prepare("
            UPDATE applications
            SET status = ?
            WHERE id = ?
        ");

        $updateStmt->execute([
            $status,
            $applicationId
        ]);


        echo json_encode([
            "success" => true,
            "message" =>
                "Application status updated successfully.",
            "status" =>
                $status,
            "status_label" =>
                formatApplicationStatus(
                    $status
                )
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Unable to update application status."
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
    "message" => "Method not allowed."
]);

exit;
?>