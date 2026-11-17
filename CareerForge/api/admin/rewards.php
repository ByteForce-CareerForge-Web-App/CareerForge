<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

header("Content-Type: application/json");

try {

    /*
    |--------------------------------------------------------------------------
    | Authenticate admin
    |--------------------------------------------------------------------------
    */

    $admin = getAuthenticatedUser($pdo);

    if (!$admin) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }

    if ($admin["role"] !== "admin") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Admin access required."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    | Actions:
    |
    | ?action=users
    | ?action=badges
    | ?action=all
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $action = $_GET["action"] ?? "all";


        /*
        |--------------------------------------------------------------------------
        | Load Badge Library
        |--------------------------------------------------------------------------
        */

        if ($action === "badges" || $action === "all") {

            $stmt = $pdo->query("
                SELECT
                    id,
                    name,
                    icon,
                    credits,
                    description,
                    created_at
                FROM badge_library
                ORDER BY id ASC
            ");

            $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($badges as &$badge) {
                $badge["id"] = (string) $badge["id"];
                $badge["credits"] = (int) $badge["credits"];
            }

            unset($badge);

        } else {

            $badges = [];
        }


        /*
        |--------------------------------------------------------------------------
        | Load Users + Credits + Badges
        |--------------------------------------------------------------------------
        */

        if ($action === "users" || $action === "all") {

            /*
            |----------------------------------------------------------------------
            | Load users
            |----------------------------------------------------------------------
            |
            | Admin is excluded because admin accounts do not participate
            | in the CareerForge reward system.
            |
            */

            $stmt = $pdo->query("
                SELECT
                    id,
                    name,
                    role
                FROM users
                WHERE role IN ('student', 'alumni', 'business')
                ORDER BY name ASC
            ");

            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);


            /*
            |----------------------------------------------------------------------
            | Load total Career Credits
            |----------------------------------------------------------------------
            |
            | career_credits stores credit transactions.
            | Positive points add credits.
            | Negative points remove credits.
            |
            */

            $creditStmt = $pdo->query("
                SELECT
                    user_id,
                    COALESCE(SUM(points), 0) AS total_credits
                FROM career_credits
                GROUP BY user_id
            ");

            $creditRows = $creditStmt->fetchAll(PDO::FETCH_ASSOC);

            $creditMap = [];

            foreach ($creditRows as $row) {

                $creditMap[(int) $row["user_id"]] =
                    max(0, (int) $row["total_credits"]);
            }


            /*
            |----------------------------------------------------------------------
            | Load earned badges
            |----------------------------------------------------------------------
            */

            $badgeStmt = $pdo->query("
                SELECT
                    ub.user_id,
                    bl.id AS badge_id,
                    bl.name AS badge_name,
                    bl.icon,
                    bl.credits,
                    bl.description
                FROM user_badges ub
                INNER JOIN badge_library bl
                    ON bl.id = ub.badge_id
                ORDER BY ub.awarded_at ASC
            ");

            $badgeRows = $badgeStmt->fetchAll(PDO::FETCH_ASSOC);

            $userBadgeMap = [];

            foreach ($badgeRows as $row) {

                $userId = (int) $row["user_id"];

                if (!isset($userBadgeMap[$userId])) {
                    $userBadgeMap[$userId] = [];
                }

                $userBadgeMap[$userId][] = [
                    "id" => (string) $row["badge_id"],
                    "name" => $row["badge_name"],
                    "icon" => $row["icon"],
                    "credits" => (int) $row["credits"],
                    "description" => $row["description"]
                ];
            }


            /*
            |----------------------------------------------------------------------
            | Format users for React Native
            |----------------------------------------------------------------------
            */

            $formattedUsers = [];

            foreach ($users as $user) {

                $userId = (int) $user["id"];

                $role = ucfirst(
                    strtolower($user["role"])
                );

                $earnedBadges =
                    $userBadgeMap[$userId] ?? [];

                $badgeNames = [];

                foreach ($earnedBadges as $badge) {
                    $badgeNames[] = $badge["name"];
                }

                $formattedUsers[] = [
                    "id" => (string) $userId,
                    "name" => $user["name"],
                    "role" => $role,
                    "credits" =>
                        $creditMap[$userId] ?? 0,
                    "badges" => $badgeNames,
                    "badge_details" => $earnedBadges
                ];
            }

            $users = $formattedUsers;

        } else {

            $users = [];
        }


        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $totalCredits = 0;
        $totalBadges = 0;

        $studentCount = 0;
        $alumniCount = 0;
        $businessCount = 0;

        foreach ($users as $user) {

            $totalCredits += (int) $user["credits"];

            $totalBadges += count(
                $user["badges"]
            );

            if ($user["role"] === "Student") {
                $studentCount++;
            }

            if ($user["role"] === "Alumni") {
                $alumniCount++;
            }

            if ($user["role"] === "Business") {
                $businessCount++;
            }
        }


        echo json_encode([
            "success" => true,
            "users" => $users,
            "badges" => $badges,
            "summary" => [
                "total_credits" => $totalCredits,
                "total_badges" => $totalBadges,
                "reward_users" => count($users),
                "students" => $studentCount,
                "alumni" => $alumniCount,
                "businesses" => $businessCount
            ]
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST
    |--------------------------------------------------------------------------
    | Actions:
    |
    | add_credits
    | remove_credits
    | award_badge
    | remove_badge
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {
            $input = [];
        }

        $action = $input["action"] ?? "";


        /*
        |--------------------------------------------------------------------------
        | ADD / REMOVE CREDITS
        |--------------------------------------------------------------------------
        */

        if (
            $action === "add_credits" ||
            $action === "remove_credits"
        ) {

            $userId = isset($input["user_id"])
                ? (int) $input["user_id"]
                : 0;

            $amount = isset($input["amount"])
                ? (int) $input["amount"]
                : 0;


            if ($userId <= 0) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "A valid user ID is required."
                ]);

                exit;
            }


            if ($amount <= 0) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Credit amount must be greater than zero."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Confirm user exists
            |----------------------------------------------------------------------
            */

            $userStmt = $pdo->prepare("
                SELECT
                    id,
                    name,
                    role
                FROM users
                WHERE id = ?
                AND role IN ('student', 'alumni', 'business')
                LIMIT 1
            ");

            $userStmt->execute([
                $userId
            ]);

            $user = $userStmt->fetch(PDO::FETCH_ASSOC);


            if (!$user) {

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" => "Reward user not found."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Prevent removing more credits than the user has
            |----------------------------------------------------------------------
            */

            $currentStmt = $pdo->prepare("
                SELECT
                    COALESCE(SUM(points), 0) AS total_credits
                FROM career_credits
                WHERE user_id = ?
            ");

            $currentStmt->execute([
                $userId
            ]);

            $currentCredits = max(
                0,
                (int) $currentStmt->fetchColumn()
            );


            if (
                $action === "remove_credits" &&
                $amount > $currentCredits
            ) {

                $amountToRemove = $currentCredits;

            } else {

                $amountToRemove = $amount;
            }


            $points =
                $action === "add_credits"
                    ? $amount
                    : -$amountToRemove;


            /*
            |----------------------------------------------------------------------
            | Store credit transaction
            |----------------------------------------------------------------------
            */

            $pdo->beginTransaction();

            try {

                $stmt = $pdo->prepare("
                    INSERT INTO career_credits
                    (
                        user_id,
                        action,
                        points
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                ");

                $creditAction =
                    $action === "add_credits"
                        ? "Admin Added Credits"
                        : "Admin Removed Credits";

                $stmt->execute([
                    $userId,
                    $creditAction,
                    $points
                ]);


                $pdo->commit();

            } catch (Exception $e) {

                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }

                throw $e;
            }


            /*
            |----------------------------------------------------------------------
            | Calculate new total
            |----------------------------------------------------------------------
            */

            $newTotalStmt = $pdo->prepare("
                SELECT
                    COALESCE(SUM(points), 0)
                FROM career_credits
                WHERE user_id = ?
            ");

            $newTotalStmt->execute([
                $userId
            ]);

            $newTotal = max(
                0,
                (int) $newTotalStmt->fetchColumn()
            );


            echo json_encode([
                "success" => true,
                "message" =>
                    $action === "add_credits"
                        ? "Credits added successfully."
                        : "Credits removed successfully.",
                "user_id" => $userId,
                "amount" =>
                    $action === "add_credits"
                        ? $amount
                        : $amountToRemove,
                "credits" => $newTotal
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | AWARD BADGE
        |--------------------------------------------------------------------------
        */

        if ($action === "award_badge") {

            $userId = isset($input["user_id"])
                ? (int) $input["user_id"]
                : 0;

            $badgeId = isset($input["badge_id"])
                ? (int) $input["badge_id"]
                : 0;


            if ($userId <= 0 || $badgeId <= 0) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "A valid user ID and badge ID are required."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Confirm user
            |----------------------------------------------------------------------
            */

            $userStmt = $pdo->prepare("
                SELECT
                    id,
                    name,
                    role
                FROM users
                WHERE id = ?
                AND role IN ('student', 'alumni', 'business')
                LIMIT 1
            ");

            $userStmt->execute([
                $userId
            ]);

            $user = $userStmt->fetch(PDO::FETCH_ASSOC);


            if (!$user) {

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" => "Reward user not found."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Confirm badge
            |----------------------------------------------------------------------
            */

            $badgeStmt = $pdo->prepare("
                SELECT
                    id,
                    name,
                    credits,
                    description
                FROM badge_library
                WHERE id = ?
                LIMIT 1
            ");

            $badgeStmt->execute([
                $badgeId
            ]);

            $badge = $badgeStmt->fetch(PDO::FETCH_ASSOC);


            if (!$badge) {

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" => "Badge not found."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Check duplicate
            |----------------------------------------------------------------------
            */

            $existingStmt = $pdo->prepare("
                SELECT id
                FROM user_badges
                WHERE user_id = ?
                AND badge_id = ?
                LIMIT 1
            ");

            $existingStmt->execute([
                $userId,
                $badgeId
            ]);

            if ($existingStmt->fetch()) {

                http_response_code(409);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        $user["name"] .
                        " already has the " .
                        $badge["name"] .
                        " badge."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Award badge and credits together
            |----------------------------------------------------------------------
            */

            $pdo->beginTransaction();

            try {

                $insertBadge = $pdo->prepare("
                    INSERT INTO user_badges
                    (
                        user_id,
                        badge_id
                    )
                    VALUES
                    (
                        ?,
                        ?
                    )
                ");

                $insertBadge->execute([
                    $userId,
                    $badgeId
                ]);


                /*
                |------------------------------------------------------------------
                | Award the badge's Career Credits
                |------------------------------------------------------------------
                */

                $creditStmt = $pdo->prepare("
                    INSERT INTO career_credits
                    (
                        user_id,
                        action,
                        points
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                ");

                $creditStmt->execute([
                    $userId,
                    "Badge Award: " . $badge["name"],
                    (int) $badge["credits"]
                ]);


                $pdo->commit();

            } catch (Exception $e) {

                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }

                throw $e;
            }


            /*
            |----------------------------------------------------------------------
            | Return success
            |----------------------------------------------------------------------
            */

            echo json_encode([
                "success" => true,
                "message" =>
                    $badge["name"] .
                    " awarded successfully.",
                "badge" => [
                    "id" => (string) $badge["id"],
                    "name" => $badge["name"],
                    "credits" => (int) $badge["credits"],
                    "description" => $badge["description"]
                ],
                "credits_added" =>
                    (int) $badge["credits"]
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | REMOVE BADGE
        |--------------------------------------------------------------------------
        */

        if ($action === "remove_badge") {

            $userId = isset($input["user_id"])
                ? (int) $input["user_id"]
                : 0;

            $badgeId = isset($input["badge_id"])
                ? (int) $input["badge_id"]
                : 0;


            if ($userId <= 0 || $badgeId <= 0) {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "A valid user ID and badge ID are required."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Find badge
            |----------------------------------------------------------------------
            */

            $badgeStmt = $pdo->prepare("
                SELECT
                    id,
                    name,
                    credits
                FROM badge_library
                WHERE id = ?
                LIMIT 1
            ");

            $badgeStmt->execute([
                $badgeId
            ]);

            $badge = $badgeStmt->fetch(PDO::FETCH_ASSOC);


            if (!$badge) {

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" => "Badge not found."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Confirm user has badge
            |----------------------------------------------------------------------
            */

            $existingStmt = $pdo->prepare("
                SELECT id
                FROM user_badges
                WHERE user_id = ?
                AND badge_id = ?
                LIMIT 1
            ");

            $existingStmt->execute([
                $userId,
                $badgeId
            ]);

            $userBadge = $existingStmt->fetch(
                PDO::FETCH_ASSOC
            );


            if (!$userBadge) {

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "This user does not have that badge."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Remove badge + reverse its credits
            |----------------------------------------------------------------------
            */

            $pdo->beginTransaction();

            try {

                $deleteStmt = $pdo->prepare("
                    DELETE FROM user_badges
                    WHERE id = ?
                ");

                $deleteStmt->execute([
                    $userBadge["id"]
                ]);


                /*
                |------------------------------------------------------------------
                | Reverse the credits originally awarded by the badge
                |------------------------------------------------------------------
                */

                $creditStmt = $pdo->prepare("
                    INSERT INTO career_credits
                    (
                        user_id,
                        action,
                        points
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                ");

                $creditStmt->execute([
                    $userId,
                    "Badge Removed: " . $badge["name"],
                    -(int) $badge["credits"]
                ]);


                $pdo->commit();

            } catch (Exception $e) {

                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }

                throw $e;
            }


            echo json_encode([
                "success" => true,
                "message" =>
                    $badge["name"] .
                    " removed successfully.",
                "credits_removed" =>
                    (int) $badge["credits"]
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Invalid action
        |--------------------------------------------------------------------------
        */

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid rewards action."
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
        "message" => "Method not allowed."
    ]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error."
    ]);
}

