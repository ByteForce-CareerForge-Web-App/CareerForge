<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

/*
|--------------------------------------------------------------------------
| AUTHENTICATE USER
|--------------------------------------------------------------------------
*/

$user = getAuthenticatedUser($pdo);

if ($user["role"] !== "business") {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Only business accounts can manage opportunities"
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| GET BUSINESS PROFILE
|--------------------------------------------------------------------------
*/

try {

    $stmt = $pdo->prepare("
        SELECT id
        FROM business_profiles
        WHERE user_id = ?
        LIMIT 1
    ");

    $stmt->execute([$user["id"]]);

    $business = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$business) {
        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Business profile not found"
        ]);

        exit;
    }

    $businessId = (int) $business["id"];

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to load business profile"
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| GET — LOAD BUSINESS OPPORTUNITIES
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        /*
        | Load opportunities belonging ONLY to the
        | currently authenticated business.
        */

        $stmt = $pdo->prepare("
            SELECT
                o.id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.work_arrangement,
                o.positions,
                o.qualification,
                o.deadline,
                o.status,
                o.created_at,

                COUNT(DISTINCT a.id) AS applications,

                COUNT(
                    DISTINCT CASE
                        WHEN a.status = 'shortlisted'
                        THEN a.id
                    END
                ) AS shortlisted

            FROM opportunities o

            LEFT JOIN applications a
                ON a.opportunity_id = o.id

            WHERE o.business_id = ?

            GROUP BY
                o.id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.work_arrangement,
                o.positions,
                o.qualification,
                o.deadline,
                o.status,
                o.created_at

            ORDER BY o.created_at DESC
        ");

        $stmt->execute([$businessId]);

        $opportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | LOAD SKILLS FOR EACH OPPORTUNITY
        |--------------------------------------------------------------------------
        */

        $skillStmt = $pdo->prepare("
            SELECT
                s.id,
                s.skill_code,
                s.name,
                s.category,
                s.description
            FROM opportunity_skills os

            INNER JOIN skills s
                ON s.id = os.skill_id

            WHERE os.opportunity_id = ?

            ORDER BY s.skill_code ASC
        ");


        foreach ($opportunities as &$opportunity) {

            $skillStmt->execute([
                $opportunity["id"]
            ]);

            $skills = $skillStmt->fetchAll(
                PDO::FETCH_ASSOC
            );


            /*
            | The existing frontend expects:
            |
            | skills?: string
            |
            | So return a comma-separated string.
            */

            $skillNames = array_map(
                function ($skill) {
                    return $skill["name"];
                },
                $skills
            );


            /*
            |--------------------------------------------------------------------------
            | FORMAT VALUES FOR EXISTING FRONTEND
            |--------------------------------------------------------------------------
            */

            $opportunity["id"] =
                (string) $opportunity["id"];

            $opportunity["applications"] =
                (int) $opportunity["applications"];

            $opportunity["shortlisted"] =
                (int) $opportunity["shortlisted"];

            $opportunity["positions"] =
                (string) $opportunity["positions"];

            $opportunity["skills"] =
                implode(", ", $skillNames);

            /*
            | Frontend calls this field "arrangement".
            */

            $opportunity["arrangement"] =
                $opportunity["work_arrangement"];

            unset(
                $opportunity["work_arrangement"]
            );


            /*
            | Frontend expects Active / Closed.
            */

            $opportunity["status"] =
                strtolower($opportunity["status"]) === "open"
                    ? "Active"
                    : "Closed";


            /*
            | Frontend calls this createdAt.
            */

            $opportunity["createdAt"] =
                $opportunity["created_at"];

            unset(
                $opportunity["created_at"]
            );
        }

        unset($opportunity);


        echo json_encode([
            "success" => true,
            "data" => [
                "opportunities" => $opportunities
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to load opportunities"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| POST — CREATE OPPORTUNITY
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON request"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | READ FIELDS
    |--------------------------------------------------------------------------
    */

    $title =
        trim($data["title"] ?? "");

    $description =
        trim($data["description"] ?? "");

    $type =
        trim($data["type"] ?? "");

    $location =
        trim($data["location"] ?? "");

    $workArrangement =
        trim($data["work_arrangement"] ?? "");

    $deadline =
        trim($data["deadline"] ?? "");

    $qualification =
        trim($data["qualification"] ?? "");

    $positions =
        $data["positions"] ?? null;

    $skillIds =
        $data["skill_ids"] ?? null;


    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if ($title === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Title is required"
        ]);

        exit;
    }

    if ($description === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Description is required"
        ]);

        exit;
    }

    if ($type === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Opportunity type is required"
        ]);

        exit;
    }

    if ($location === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Location is required"
        ]);

        exit;
    }

    if ($workArrangement === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Work arrangement is required"
        ]);

        exit;
    }

    if ($deadline === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Deadline is required"
        ]);

        exit;
    }

    if ($qualification === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Qualification is required"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE TYPE
    |--------------------------------------------------------------------------
    */

    $allowedTypes = [
        "Job",
        "Internship",
        "Graduate Programme",
        "Learnership"
    ];

    if (!in_array(
        $type,
        $allowedTypes,
        true
    )) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid opportunity type"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE WORK ARRANGEMENT
    |--------------------------------------------------------------------------
    */

    $allowedArrangements = [
        "On-site",
        "Hybrid",
        "Remote"
    ];

    if (!in_array(
        $workArrangement,
        $allowedArrangements,
        true
    )) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid work arrangement"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE DEADLINE
    |--------------------------------------------------------------------------
    */

    $date = DateTime::createFromFormat(
        "Y-m-d",
        $deadline
    );

    if (
        !$date ||
        $date->format("Y-m-d") !== $deadline
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Deadline must be in YYYY-MM-DD format"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE POSITIONS
    |--------------------------------------------------------------------------
    */

    if (
        !is_numeric($positions) ||
        (int) $positions < 1
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Positions must be a positive number"
        ]);

        exit;
    }

    $positions = (int) $positions;


    /*
    |--------------------------------------------------------------------------
    | VALIDATE SKILLS
    |--------------------------------------------------------------------------
    */

    if (!is_array($skillIds)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "skill_ids must be an array"
        ]);

        exit;
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
            "message" => "At least one skill must be selected"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE SKILL IDS
    |--------------------------------------------------------------------------
    */

    try {

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

        $stmt->execute(
            $skillIds
        );

        $validSkillIds =
            $stmt->fetchAll(
                PDO::FETCH_COLUMN
            );

        $validSkillIds =
            array_map(
                "intval",
                $validSkillIds
            );

        $requestedIds =
            $skillIds;

        sort($requestedIds);
        sort($validSkillIds);

        if (
            $requestedIds !==
            $validSkillIds
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "One or more selected skills are invalid"
            ]);

            exit;
        }

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to validate skills"
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | INSERT OPPORTUNITY
    |--------------------------------------------------------------------------
    */

    try {

        $pdo->beginTransaction();


        $stmt = $pdo->prepare("
            INSERT INTO opportunities (
                business_id,
                title,
                description,
                type,
                location,
                work_arrangement,
                positions,
                qualification,
                deadline,
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
            $positions,
            $qualification,
            $deadline
        ]);


        $opportunityId =
            (int) $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | INSERT SKILLS
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO opportunity_skills (
                opportunity_id,
                skill_id
            )
            VALUES (
                ?,
                ?
            )
        ");

        foreach ($skillIds as $skillId) {

            $stmt->execute([
                $opportunityId,
                $skillId
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | GET CREATED OPPORTUNITY
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                o.id,
                o.business_id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.work_arrangement,
                o.positions,
                o.qualification,
                o.deadline,
                o.status,
                o.created_at,
                bp.company_name
            FROM opportunities o

            INNER JOIN business_profiles bp
                ON bp.id = o.business_id

            WHERE o.id = ?

            LIMIT 1
        ");

        $stmt->execute([
            $opportunityId
        ]);

        $opportunity =
            $stmt->fetch(
                PDO::FETCH_ASSOC
            );


        /*
        |--------------------------------------------------------------------------
        | GET SKILLS
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                s.id,
                s.skill_code,
                s.name,
                s.category,
                s.description
            FROM opportunity_skills os

            INNER JOIN skills s
                ON s.id = os.skill_id

            WHERE os.opportunity_id = ?

            ORDER BY s.skill_code ASC
        ");

        $stmt->execute([
            $opportunityId
        ]);

        $skills =
            $stmt->fetchAll(
                PDO::FETCH_ASSOC
            );


        $opportunity["skills"] =
            $skills;


        $pdo->commit();


        http_response_code(201);

        echo json_encode([
            "success" => true,
            "message" => "Opportunity posted successfully",
            "data" => $opportunity
        ]);

        exit;

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to post opportunity"
        ]);

        exit;

    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "An unexpected error occurred"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| PUT — CLOSE OPPORTUNITY
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON request"
        ]);

        exit;
    }


    $opportunityId =
        isset($data["id"])
            ? (int) $data["id"]
            : 0;


    if ($opportunityId <= 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "A valid opportunity ID is required"
        ]);

        exit;
    }


    try {

        /*
        | Make sure the opportunity belongs
        | to the authenticated business.
        */

        $stmt = $pdo->prepare("
            SELECT id, status
            FROM opportunities
            WHERE id = ?
              AND business_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $opportunityId,
            $businessId
        ]);

        $opportunity =
            $stmt->fetch(
                PDO::FETCH_ASSOC
            );


        if (!$opportunity) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found"
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | CLOSE OPPORTUNITY
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            UPDATE opportunities
            SET status = 'closed'
            WHERE id = ?
              AND business_id = ?
        ");

        $stmt->execute([
            $opportunityId,
            $businessId
        ]);


        echo json_encode([
            "success" => true,
            "message" => "Opportunity closed successfully"
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to close opportunity"
        ]);

        exit;
    }
}


/*
|--------------------------------------------------------------------------
| METHOD NOT ALLOWED
|--------------------------------------------------------------------------
*/

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);

