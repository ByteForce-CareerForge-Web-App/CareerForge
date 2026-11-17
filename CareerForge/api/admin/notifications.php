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
    | GET - Load admin notifications
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $stmt = $pdo->query("
            SELECT
                id,
                type,
                title,
                message,
                read_at,
                created_at
            FROM admin_notifications
            ORDER BY created_at DESC
        ");

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Format notification time
        |--------------------------------------------------------------------------
        */

        foreach ($notifications as &$notification) {

            $created = new DateTime($notification["created_at"]);
            $now = new DateTime();

            $difference =
                $now->getTimestamp() -
                $created->getTimestamp();

            if ($difference < 60) {

                $notification["time"] = "Just now";

            } elseif ($difference < 3600) {

                $minutes = floor($difference / 60);

                $notification["time"] =
                    $minutes .
                    " minute" .
                    ($minutes === 1 ? "" : "s") .
                    " ago";

            } elseif ($difference < 86400) {

                $hours = floor($difference / 3600);

                $notification["time"] =
                    $hours .
                    " hour" .
                    ($hours === 1 ? "" : "s") .
                    " ago";

            } elseif ($difference < 604800) {

                $days = floor($difference / 86400);

                $notification["time"] =
                    $days .
                    " day" .
                    ($days === 1 ? "" : "s") .
                    " ago";

            } else {

                $notification["time"] =
                    $created->format("j M Y");
            }

            $notification["active"] =
                empty($notification["read_at"]);
        }

        unset($notification);


        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $total = count($notifications);

        $unread = 0;
        $read = 0;

        foreach ($notifications as $notification) {

            if (empty($notification["read_at"])) {
                $unread++;
            } else {
                $read++;
            }
        }


        echo json_encode([
            "success" => true,
            "notifications" => $notifications,
            "summary" => [
                "total" => $total,
                "unread" => $unread,
                "read" => $read
            ]
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | POST
    |--------------------------------------------------------------------------
    | Actions:
    | - create
    | - read
    | - unread
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
        | CREATE - Create a new admin notification
        |--------------------------------------------------------------------------
        */

        if ($action === "create") {

            $title = trim($input["title"] ?? "");
            $message = trim($input["message"] ?? "");
            $type = trim($input["type"] ?? "Platform");
            $active = $input["active"] ?? true;


            /*
            |----------------------------------------------------------------------
            | Validate title and message
            |----------------------------------------------------------------------
            */

            if ($title === "") {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Notification title is required."
                ]);

                exit;
            }

            if ($message === "") {

                http_response_code(400);

                echo json_encode([
                    "success" => false,
                    "message" => "Notification message is required."
                ]);

                exit;
            }


            /*
            |----------------------------------------------------------------------
            | Validate notification type
            |----------------------------------------------------------------------
            */

            $allowedTypes = [
                "Platform",
                "Users",
                "Opportunities",
                "Verification"
            ];

            if (!in_array($type, $allowedTypes, true)) {
                $type = "Platform";
            }


            /*
            |----------------------------------------------------------------------
            | Determine initial read state
            |----------------------------------------------------------------------
            |
            | active = true  -> unread -> read_at NULL
            | active = false -> read -> read_at NOW()
            |
            */

            $isActive = filter_var(
                $active,
                FILTER_VALIDATE_BOOLEAN
            );

            $readAt = $isActive ? null : date("Y-m-d H:i:s");


            /*
            |----------------------------------------------------------------------
            | Insert notification
            |----------------------------------------------------------------------
            */

            $stmt = $pdo->prepare("
                INSERT INTO admin_notifications
                (
                    type,
                    title,
                    message,
                    read_at
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?
                )
            ");

            $stmt->execute([
                $type,
                $title,
                $message,
                $readAt
            ]);


            $notificationId =
                (int) $pdo->lastInsertId();


            /*
            |----------------------------------------------------------------------
            | Return created notification
            |----------------------------------------------------------------------
            */

            echo json_encode([
                "success" => true,
                "message" => "Notification created successfully.",
                "notification_id" => $notificationId
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Notification ID for read/unread
        |--------------------------------------------------------------------------
        */

        $notificationId = isset($input["notification_id"])
            ? (int) $input["notification_id"]
            : 0;


        if ($notificationId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid notification ID is required."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | MARK AS READ
        |--------------------------------------------------------------------------
        */

        if ($action === "read") {

            $stmt = $pdo->prepare("
                UPDATE admin_notifications
                SET read_at = NOW()
                WHERE id = ?
            ");

            $stmt->execute([
                $notificationId
            ]);


            echo json_encode([
                "success" => true,
                "message" => "Notification marked as read."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | MARK AS UNREAD
        |--------------------------------------------------------------------------
        */

        if ($action === "unread") {

            $stmt = $pdo->prepare("
                UPDATE admin_notifications
                SET read_at = NULL
                WHERE id = ?
            ");

            $stmt->execute([
                $notificationId
            ]);


            echo json_encode([
                "success" => true,
                "message" => "Notification marked as unread."
            ]);

            exit;
        }


        /*
        |--------------------------------------------------------------------------
        | Invalid POST action
        |--------------------------------------------------------------------------
        */

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid notification action."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE - Delete notification
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {
            $input = [];
        }

        $notificationId = isset($input["notification_id"])
            ? (int) $input["notification_id"]
            : 0;


        if ($notificationId <= 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid notification ID is required."
            ]);

            exit;
        }


        $stmt = $pdo->prepare("
            DELETE FROM admin_notifications
            WHERE id = ?
        ");

        $stmt->execute([
            $notificationId
        ]);


        echo json_encode([
            "success" => true,
            "message" => "Notification deleted successfully."
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

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error."
    ]);
}

