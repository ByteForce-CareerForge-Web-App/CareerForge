<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

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
        "message" => "Authorization token required"
    ]);

    exit;
}

$token = trim($matches[1]);

$tokenHash = hash(
    "sha256",
    $token
);

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.role
    FROM api_tokens t

    INNER JOIN users u
        ON t.user_id = u.id

    WHERE t.token_hash = ?
    AND (
        t.expires_at IS NULL
        OR t.expires_at > NOW()
    )
    AND u.status = 'active'

    LIMIT 1
");

$stmt->execute([$tokenHash]);

$user = $stmt->fetch();

if (!$user) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid or expired token"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| Only students can apply
|--------------------------------------------------------------------------
*/

if ($user["role"] !== "student") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only students can submit applications"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET APPLICATIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $pdo->prepare("
        SELECT
            a.id,
            a.opportunity_id,
            a.student_id,
            a.status,
            a.cv_path,
            a.cover_letter,
            a.notes,
            a.applied_at,

            o.title,
            o.type,
            o.location,

            b.company_name

        FROM applications a

        INNER JOIN opportunities o
            ON a.opportunity_id = o.id

        INNER JOIN business_profiles b
            ON o.business_id = b.id

        WHERE a.student_id = ?

        ORDER BY a.applied_at DESC
    ");

    $stmt->execute([
        $user["id"]
    ]);

    $applications =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "count" => count($applications),
        "data" => $applications
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| POST APPLICATION
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    /*
     * The CV request uses multipart/form-data,
     * so the values come from $_POST and $_FILES.
     */

    $opportunityId = filter_var(
        $_POST["opportunity_id"] ?? null,
        FILTER_VALIDATE_INT
    );

    $coverLetter =
        trim($_POST["cover_letter"] ?? "");

    $notes =
        trim($_POST["notes"] ?? "");


    /*
    |--------------------------------------------------------------------------
    | Validate opportunity ID
    |--------------------------------------------------------------------------
    */

    if (
        $opportunityId === false ||
        $opportunityId === null
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Opportunity ID is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Validate cover letter
    |--------------------------------------------------------------------------
    */

    if ($coverLetter === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Cover letter is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Check opportunity
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id
        FROM opportunities
        WHERE id = ?
        AND status = 'open'
        LIMIT 1
    ");

    $stmt->execute([
        $opportunityId
    ]);

    if (!$stmt->fetch()) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Opportunity not found or closed"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Check duplicate application
    |--------------------------------------------------------------------------
    */

    $duplicateStmt = $pdo->prepare("
        SELECT id
        FROM applications
        WHERE opportunity_id = ?
        AND student_id = ?
        LIMIT 1
    ");

    $duplicateStmt->execute([
        $opportunityId,
        $user["id"]
    ]);

    if ($duplicateStmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "You have already applied for this opportunity"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | CV Upload
    |--------------------------------------------------------------------------
    */

    $cvPath = null;

    if (
        isset($_FILES["cv"]) &&
        $_FILES["cv"]["error"] !== UPLOAD_ERR_NO_FILE
    ) {

        $cv = $_FILES["cv"];


        /*
        |--------------------------------------------------------------------------
        | Check upload error
        |--------------------------------------------------------------------------
        */

        if ($cv["error"] !== UPLOAD_ERR_OK) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "CV upload failed"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Maximum file size: 5 MB
        |--------------------------------------------------------------------------
        */

        if ($cv["size"] > 5 * 1024 * 1024) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "CV must be smaller than 5 MB"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Validate file type
        |--------------------------------------------------------------------------
        */

        $allowedTypes = [
            "application/pdf" =>
                "pdf",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" =>
                "docx"
        ];

        $finfo =
            finfo_open(FILEINFO_MIME_TYPE);

        $mimeType =
            finfo_file(
                $finfo,
                $cv["tmp_name"]
            );

        finfo_close($finfo);

        if (
            !isset(
                $allowedTypes[$mimeType]
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Only PDF and DOCX files are allowed"
            ]);

            exit;
        }

        $extension =
            $allowedTypes[$mimeType];


        /*
        |--------------------------------------------------------------------------
        | Create upload directory
        |--------------------------------------------------------------------------
        */

        $uploadDirectory =
            __DIR__ . "/../uploads/cvs/";

        if (
            !is_dir(
                $uploadDirectory
            )
        ) {

            mkdir(
                $uploadDirectory,
                0775,
                true
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Generate unique filename
        |--------------------------------------------------------------------------
        */

        $fileName =
            "cv_" .
            $user["id"] .
            "_" .
            uniqid() .
            "." .
            $extension;

        $destination =
            $uploadDirectory .
            $fileName;


        /*
        |--------------------------------------------------------------------------
        | Move uploaded file
        |--------------------------------------------------------------------------
        */

        if (
            !move_uploaded_file(
                $cv["tmp_name"],
                $destination
            )
        ) {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" => "CV could not be saved"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Store relative path
        |--------------------------------------------------------------------------
        */

        $cvPath =
            "uploads/cvs/" .
            $fileName;
    }


    /*
    |--------------------------------------------------------------------------
    | Create application
    |--------------------------------------------------------------------------
    */

    try {

        $stmt = $pdo->prepare("
            INSERT INTO applications
            (
                opportunity_id,
                student_id,
                status,
                cv_path,
                cover_letter,
                notes
            )
            VALUES
            (
                ?,
                ?,
                'submitted',
                ?,
                ?,
                ?
            )
        ");

        $stmt->execute([
            $opportunityId,
            $user["id"],
            $cvPath,
            $coverLetter,
            $notes
        ]);

        echo json_encode([
            "success" => true,
            "message" =>
                "Application submitted successfully",
            "application_id" =>
                (int) $pdo->lastInsertId()
        ]);

    } catch (PDOException $e) {

        /*
         * If the database insert fails after the CV
         * was uploaded, remove the uploaded file.
         */

        if (
            $cvPath &&
            file_exists(
                __DIR__ .
                "/../" .
                $cvPath
            )
        ) {

            unlink(
                __DIR__ .
                "/../" .
                $cvPath
            );
        }

        if ($e->getCode() === "23000") {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" =>
                    "You have already applied for this opportunity"
            ]);

            exit;
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Application could not be submitted"
        ]);
    }

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

?>
