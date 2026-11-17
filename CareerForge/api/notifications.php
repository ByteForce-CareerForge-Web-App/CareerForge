<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

function sendResponse(
    bool $success,
    string $message,
    $data = null,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

try {
    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        sendResponse(
            false,
            "Authentication required.",
            null,
            401
        );
    }

    $userId = (int) $user["id"];

    /*
    |--------------------------------------------------------------------------
    | GET - Fetch notifications
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $stmt = $pdo->prepare("
            SELECT
                id,
                type,
                message,
                read_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY
                CASE
                    WHEN read_at IS NULL THEN 0
                    ELSE 1
                END ASC,
                id DESC
        ");

        $stmt->execute([$userId]);

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($notifications as &$notification) {
            $notification["id"] = (int) $notification["id"];
            $notification["is_read"] =
                !empty($notification["read_at"]);
        }

        unset($notification);

        $unreadStmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = ?
            AND read_at IS NULL
        ");

        $unreadStmt->execute([$userId]);

        $unreadCount = (int) $unreadStmt->fetchColumn();

        sendResponse(
            true,
            "Notifications retrieved successfully.",
            [
                "notifications" => $notifications,
                "unread_count" => $unreadCount
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PUT - Mark notification(s) as read
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "PUT") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {
            sendResponse(
                false,
                "Invalid request body.",
                null,
                400
            );
        }

        /*
         * Mark one notification as read
         */
        if (isset($input["notification_id"])) {

            $notificationId = (int) $input["notification_id"];

            if ($notificationId <= 0) {
                sendResponse(
                    false,
                    "Invalid notification ID.",
                    null,
                    400
                );
            }

            $stmt = $pdo->prepare("
                UPDATE notifications
                SET read_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND user_id = ?
            ");

            $stmt->execute([
                $notificationId,
                $userId
            ]);

            if ($stmt->rowCount() === 0) {
                sendResponse(
                    false,
                    "Notification not found.",
                    null,
                    404
                );
            }

            sendResponse(
                true,
                "Notification marked as read."
            );
        }

        /*
         * Mark all notifications as read
         */
        if (
            isset($input["action"]) &&
            $input["action"] === "mark_all_read"
        ) {

            $stmt = $pdo->prepare("
                UPDATE notifications
                SET read_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                AND read_at IS NULL
            ");

            $stmt->execute([$userId]);

            sendResponse(
                true,
                "All notifications marked as read."
            );
        }

        sendResponse(
            false,
            "No valid notification action supplied.",
            null,
            400
        );
    }

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );

} catch (PDOException $e) {

    error_log(
        "Notifications database error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "A database error occurred.",
        null,
        500
    );

} catch (Throwable $e) {

    error_log(
        "Notifications API error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "An unexpected server error occurred.",
        null,
        500
    );
}