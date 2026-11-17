<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

header("Content-Type: application/json");

try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATE ADMIN
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
    | GET USERS
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        /*
         * Admin accounts are excluded from this list.
         * The Users screen manages students, alumni and businesses.
         */

        $stmt = $pdo->prepare("
            SELECT
                id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE role IN ('student', 'alumni', 'business')
            ORDER BY created_at DESC
        ");

        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $users = [];

        foreach ($rows as $row) {

            /*
             * Frontend uses:
             * Student / Alumni / Business
             */

            if ($row["role"] === "student") {
                $role = "Student";
            } elseif ($row["role"] === "alumni") {
                $role = "Alumni";
            } else {
                $role = "Business";
            }

            /*
             * Frontend currently uses Active / Suspended.
             *
             * Anything other than active is treated as suspended
             * for this management screen.
             *
             * This means inactive accounts created through rejection
             * will also appear as unavailable to the admin.
             */

            $status = strtolower($row["status"]) === "active"
                ? "Active"
                : "Suspended";

            /*
             * Format the database date for the existing UI.
             */

            $joined = "Unknown date";

            if (!empty($row["created_at"])) {

                $timestamp = strtotime($row["created_at"]);

                if ($timestamp !== false) {
                    $joined = date("j F Y", $timestamp);
                }
            }

            $users[] = [
                "id" => (string) $row["id"],
                "name" => $row["name"],
                "email" => $row["email"],
                "role" => $role,
                "status" => $status,
                "joined" => $joined,

                /*
                 * Keep the real database status available
                 * if it is useful later.
                 */
                "database_status" => $row["status"]
            ];
        }

        echo json_encode([
            "success" => true,
            "users" => $users,
            "summary" => [
                "total" => count($users),
                "students" => count(array_filter(
                    $users,
                    fn($user) => $user["role"] === "Student"
                )),
                "alumni" => count(array_filter(
                    $users,
                    fn($user) => $user["role"] === "Alumni"
                )),
                "businesses" => count(array_filter(
                    $users,
                    fn($user) => $user["role"] === "Business"
                )),
                "active" => count(array_filter(
                    $users,
                    fn($user) => $user["status"] === "Active"
                )),
                "suspended" => count(array_filter(
                    $users,
                    fn($user) => $user["status"] === "Suspended"
                ))
            ]
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE USER STATUS
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request body."
            ]);

            exit;
        }

        $userId = $input["user_id"] ?? null;
        $requestedStatus = $input["status"] ?? null;

        if (!$userId || !$requestedStatus) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "User ID and status are required."
            ]);

            exit;
        }

        /*
         * Frontend sends:
         * Active
         * Suspended
         *
         * Database uses:
         * active
         * suspended
         */

        if ($requestedStatus === "Active") {
            $databaseStatus = "active";
        } elseif ($requestedStatus === "Suspended") {
            $databaseStatus = "suspended";
        } else {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid user status."
            ]);

            exit;
        }

        /*
         * Prevent the admin from accidentally changing
         * another admin account through this endpoint.
         */

        $checkStmt = $pdo->prepare("
            SELECT id, name, email, role, status
            FROM users
            WHERE id = ?
            LIMIT 1
        ");

        $checkStmt->execute([$userId]);

        $user = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "User not found."
            ]);

            exit;
        }

        if ($user["role"] === "admin") {
            http_response_code(403);

            echo json_encode([
                "success" => false,
                "message" => "Admin accounts cannot be changed here."
            ]);

            exit;
        }

        /*
         * Update the actual users table.
         */

        $updateStmt = $pdo->prepare("
            UPDATE users
            SET status = ?
            WHERE id = ?
        ");

        $updateStmt->execute([
            $databaseStatus,
            $userId
        ]);

        echo json_encode([
            "success" => true,
            "message" =>
                $requestedStatus === "Active"
                    ? "User activated successfully."
                    : "User suspended successfully.",
            "user" => [
                "id" => (string) $user["id"],
                "name" => $user["name"],
                "email" => $user["email"],
                "role" => $user["role"],
                "status" => $requestedStatus
            ]
        ]);

        exit;
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

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error.",
        "error" => $e->getMessage()
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}