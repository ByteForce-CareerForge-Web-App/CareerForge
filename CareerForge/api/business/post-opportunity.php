<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

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
        "message" => "Authentication token is required"
    ]);

    exit;
}

$token = trim($matches[1]);

if ($token === "") {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Authentication token is required"
    ]);

    exit;
}

$tokenHash = hash("sha256", $token);

try {

    /*
    |--------------------------------------------------------------------------
    | GET AUTHENTICATED BUSINESS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            u.id AS user_id,
            u.role,
            u.status,
            bp.id AS business_profile_id
        FROM api_tokens at
        INNER JOIN users u
            ON u.id = at.user_id
        INNER JOIN business_profiles bp
            ON bp.user_id = u.id
        WHERE at.token_hash = ?
          AND (
              at.expires_at IS NULL
              OR at.expires_at > NOW()
          )
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $business = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$business) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Your session has expired. Please log in again."
        ]);

        exit;
    }

    if (
        $business["role"] !== "business"
        || $business["status"] !== "active"
    ) {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Business account access is required."
        ]);

        exit;
    }

    $businessId = (int) $business["business_profile_id"];

    /*
    |--------------------------------------------------------------------------
    | READ REQUEST
    |--------------------------------------------------------------------------
    */

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid request data."
        ]);

        exit;
    }

    $title = trim($input["title"] ?? "");
    $type = trim($input["type"] ?? "");
    $description = trim($input["description"] ?? "");
    $location = trim($input["location"] ?? "");
    $workArrangement = trim(
        $input["work_arrangement"] ?? ""
    );
    $deadline = trim($input["deadline"] ?? "");
    $positions = (int) ($input["positions"] ?? 0);
    $minimumQualification = trim(
        $input["minimum_qualification"] ?? ""
    );

    $skillIds = $input["skill_ids"] ?? [];

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
        $title === ""
        || $type === ""
        || $description === ""
        || $location === ""
        || $workArrangement === ""
        || $deadline === ""
        || $positions <= 0
        || $minimumQualification === ""
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please complete all required fields."
        ]);

        exit;
    }

    $allowedTypes = [
        "internship",
        "graduate_program",
        "job",
        "learnership",
        "volunteer",
        "other"
    ];

    if (!in_array($type, $allowedTypes, true)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid opportunity type."
        ]);

        exit;
    }

    $allowedArrangements = [
        "on-site",
        "hybrid",
        "remote"
    ];

    if (
        !in_array(
            $workArrangement,
            $allowedArrangements,
            true
        )
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid work arrangement."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | DEADLINE VALIDATION
    |--------------------------------------------------------------------------
    */

    $deadlineDate = DateTime::createFromFormat(
        "Y-m-d",
        $deadline
    );

    if (
        !$deadlineDate
        || $deadlineDate->format("Y-m-d") !== $deadline
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid application deadline."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALISE SKILL IDS
    |--------------------------------------------------------------------------
    */

    if (!is_array($skillIds)) {
        $skillIds = [];
    }

    $skillIds = array_values(
        array_unique(
            array_map(
                "intval",
                $skillIds
            )
        )
    );

    if (count($skillIds) === 0) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Please select at least one required skill."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY SKILLS EXIST
    |--------------------------------------------------------------------------
    */

    $placeholders = implode(
        ",",
        array_fill(
            0,
            count($skillIds),
            "?"
        )
    );

    $stmt = $pdo->prepare("
        SELECT id
        FROM skills
        WHERE id IN ($placeholders)
    ");

    $stmt->execute($skillIds);

    $validSkillIds = array_map(
        "intval",
        $stmt->fetchAll(PDO::FETCH_COLUMN)
    );

    sort($validSkillIds);
    $sortedSubmittedSkillIds = $skillIds;
    sort($sortedSubmittedSkillIds);

    if ($validSkillIds !== $sortedSubmittedSkillIds) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "One or more selected skills are invalid."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO opportunities (
            business_id,
            title,
            description,
            type,
            location,
            work_arrangement,
            deadline,
            positions,
            minimum_qualification,
            status
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'open'
        )
    ");

    $stmt->execute([
        $businessId,
        $title,
        $description,
        $type,
        $location,
        $workArrangement,
        $deadline,
        $positions,
        $minimumQualification
    ]);

    $opportunityId = (int) $pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | LINK SKILLS
    |--------------------------------------------------------------------------
    */

    $skillStmt = $pdo->prepare("
        INSERT INTO opportunity_skills (
            opportunity_id,
            skill_id
        )
        VALUES (?, ?)
    ");

    foreach ($skillIds as $skillId) {
        $skillStmt->execute([
            $opportunityId,
            $skillId
        ]);
    }

    $pdo->commit();

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" => "Opportunity posted successfully.",
        "opportunity" => [
            "id" => $opportunityId,
            "business_id" => $businessId,
            "title" => $title,
            "description" => $description,
            "type" => $type,
            "location" => $location,
            "work_arrangement" => $workArrangement,
            "deadline" => $deadline,
            "positions" => $positions,
            "minimum_qualification" => $minimumQualification,
            "skill_ids" => $skillIds,
            "status" => "open"
        ]
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "CareerForge post opportunity error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to post the opportunity. Please try again."
    ]);
}
?>