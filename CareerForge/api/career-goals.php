<?php

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";

header("Content-Type: application/json");

$response = [
    "success" => false,
    "message" => ""
];

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getAuthenticatedUser($pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"] ?? "";

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
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
            "message" => "Invalid authentication token."
        ]);

        exit;
    }

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role,
            u.status
        FROM api_tokens t
        INNER JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = ?
        AND t.expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired authentication token."
        ]);

        exit;
    }

    return $user;
}

/*
|--------------------------------------------------------------------------
| GET CAREER GOALS
|--------------------------------------------------------------------------
|
| Returns:
| - All available career goals
| - The goals selected by the authenticated student
|
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        $user = getAuthenticatedUser($pdo);

        if ($user["role"] !== "student") {
            http_response_code(403);

            echo json_encode([
                "success" => false,
                "message" => "Only students can access career goals."
            ]);

            exit;
        }

        /*
        |----------------------------------------------------------------------
        | Get student profile
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT id
            FROM student_profiles
            WHERE user_id = ?
            LIMIT 1
        ");

        $stmt->execute([$user["id"]]);

        $studentProfile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$studentProfile) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Student profile not found."
            ]);

            exit;
        }

        /*
        |----------------------------------------------------------------------
        | Get all available career goals
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->query("
            SELECT
                id,
                name
            FROM career_goals
            ORDER BY id ASC
        ");

        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);

        /*
        |----------------------------------------------------------------------
        | Get student's selected goals
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT career_goal_id
            FROM student_career_goals
            WHERE student_profile_id = ?
            ORDER BY career_goal_id ASC
        ");

        $stmt->execute([$studentProfile["id"]]);

        $selectedGoals = $stmt->fetchAll(PDO::FETCH_COLUMN);

        /*
        |----------------------------------------------------------------------
        | Convert IDs to integers
        |----------------------------------------------------------------------
        */

        $selectedGoals = array_map("intval", $selectedGoals);

        foreach ($goals as &$goal) {
            $goal["id"] = (int) $goal["id"];
        }

        /*
        |----------------------------------------------------------------------
        | Response
        |----------------------------------------------------------------------
        */

        echo json_encode([
            "success" => true,
            "data" => [
                "goals" => $goals,
                "selected_goal_ids" => $selectedGoals
            ]
        ]);

        exit;

    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Database error while loading career goals."
        ]);

        exit;
    }
}

/*
|--------------------------------------------------------------------------
| SAVE CAREER GOALS
|--------------------------------------------------------------------------
|
| Expected JSON:
|
| {
|     "goal_ids": [1, 3, 4]
| }
|
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    try {

        $user = getAuthenticatedUser($pdo);

        if ($user["role"] !== "student") {
            http_response_code(403);

            echo json_encode([
                "success" => false,
                "message" => "Only students can save career goals."
            ]);

            exit;
        }

        /*
        |----------------------------------------------------------------------
        | Read request body
        |----------------------------------------------------------------------
        */

        $input = json_decode(file_get_contents("php://input"), true);

        if (!is_array($input)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request body."
            ]);

            exit;
        }

        $goalIds = $input["goal_ids"] ?? [];

        if (!is_array($goalIds)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "goal_ids must be an array."
            ]);

            exit;
        }

        /*
        |----------------------------------------------------------------------
        | Clean goal IDs
        |----------------------------------------------------------------------
        */

        $goalIds = array_map("intval", $goalIds);

        $goalIds = array_values(
            array_unique(
                array_filter($goalIds, function ($id) {
                    return $id > 0;
                })
            )
        );

        /*
        |----------------------------------------------------------------------
        | Get student profile
        |----------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT id
            FROM student_profiles
            WHERE user_id = ?
            LIMIT 1
        ");

        $stmt->execute([$user["id"]]);

        $studentProfile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$studentProfile) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Student profile not found."
            ]);

            exit;
        }

        $studentProfileId = (int) $studentProfile["id"];

        /*
        |----------------------------------------------------------------------
        | Validate supplied career goal IDs
        |----------------------------------------------------------------------
        */

        if (count($goalIds) > 0) {

            $placeholders = implode(",", array_fill(0, count($goalIds), "?"));

            $stmt = $pdo->prepare("
                SELECT id
                FROM career_goals
                WHERE id IN ($placeholders)
            ");

            $stmt->execute($goalIds);

            $validGoalIds = array_map(
                "intval",
                $stmt->fetchAll(PDO::FETCH_COLUMN)
            );

            sort($validGoalIds);
            $submittedGoalIds = $goalIds;
            sort($submittedGoalIds);

            if ($validGoalIds !== $submittedGoalIds) {
                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "One or more career goal IDs are invalid."
                ]);

                exit;
            }
        }

        /*
        |----------------------------------------------------------------------
        | Save using a transaction
        |----------------------------------------------------------------------
        */

        $pdo->beginTransaction();

        /*
        | Delete previous selections
        */

        $stmt = $pdo->prepare("
            DELETE FROM student_career_goals
            WHERE student_profile_id = ?
        ");

        $stmt->execute([$studentProfileId]);

        /*
        | Insert new selections
        */

        if (count($goalIds) > 0) {

            $stmt = $pdo->prepare("
                INSERT INTO student_career_goals
                (
                    student_profile_id,
                    career_goal_id
                )
                VALUES
                (
                    ?,
                    ?
                )
            ");

            foreach ($goalIds as $goalId) {
                $stmt->execute([
                    $studentProfileId,
                    $goalId
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Career goals saved successfully.",
            "selected_goal_ids" => $goalIds
        ]);

        exit;

    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Unable to save career goals."
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
    "message" => "Method not allowed."
]);

exit;
?>
