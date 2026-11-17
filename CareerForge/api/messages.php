<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

/*
|--------------------------------------------------------------------------
| Response Helper
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

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

    $currentUserId = (int) $user["id"];

} catch (Exception $e) {

    sendResponse(
        false,
        "Authentication failed.",
        null,
        401
    );
}

/*
|--------------------------------------------------------------------------
| Request Information
|--------------------------------------------------------------------------
*/

$method = $_SERVER["REQUEST_METHOD"];

try {

    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    |
    | GET /messages.php
    |     Returns all conversations for the logged-in user.
    |
    | GET /messages.php?conversation_id=1
    |     Returns all messages inside conversation 1.
    |
    */

    if ($method === "GET") {

        $conversationId = isset($_GET["conversation_id"])
            ? (int) $_GET["conversation_id"]
            : 0;


        /*
        |--------------------------------------------------------------------------
        | GET SPECIFIC CONVERSATION MESSAGES
        |--------------------------------------------------------------------------
        */

        if ($conversationId > 0) {

            /*
            | Make sure the current user belongs to this conversation.
            */

            $participantStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM conversation_participants
                WHERE conversation_id = ?
                AND user_id = ?
            ");

            $participantStmt->execute([
                $conversationId,
                $currentUserId
            ]);

            if ((int) $participantStmt->fetchColumn() === 0) {

                sendResponse(
                    false,
                    "You do not have access to this conversation.",
                    null,
                    403
                );
            }


            /*
            | Get conversation participants.
            */

            $participantsStmt = $pdo->prepare("
                SELECT
                    cp.user_id,
                    u.name,
                    u.email,
                    u.role
                FROM conversation_participants cp
                INNER JOIN users u
                    ON u.id = cp.user_id
                WHERE cp.conversation_id = ?
                ORDER BY cp.user_id ASC
            ");

            $participantsStmt->execute([
                $conversationId
            ]);

            $participants = $participantsStmt->fetchAll(PDO::FETCH_ASSOC);


            /*
            | Get messages.
            */

            $messagesStmt = $pdo->prepare("
                SELECT
                    m.id,
                    m.conversation_id,
                    m.sender_id,
                    m.message,
                    m.created_at,
                    m.read_at,
                    u.name AS sender_name,
                    u.role AS sender_role
                FROM messages m
                INNER JOIN users u
                    ON u.id = m.sender_id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC, m.id ASC
            ");

            $messagesStmt->execute([
                $conversationId
            ]);

            $messages = $messagesStmt->fetchAll(PDO::FETCH_ASSOC);


            /*
            | Mark messages from other users as read.
            */

            $markReadStmt = $pdo->prepare("
                UPDATE messages
                SET read_at = CURRENT_TIMESTAMP
                WHERE conversation_id = ?
                AND sender_id != ?
                AND read_at IS NULL
            ");

            $markReadStmt->execute([
                $conversationId,
                $currentUserId
            ]);


            sendResponse(
                true,
                "Conversation loaded successfully.",
                [
                    "conversation_id" => $conversationId,
                    "participants" => $participants,
                    "messages" => $messages
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | GET ALL CONVERSATIONS
        |--------------------------------------------------------------------------
        */

        $conversationStmt = $pdo->prepare("
            SELECT
                c.id AS conversation_id,
                c.created_at,
                c.updated_at,

                other.id AS other_user_id,
                other.name AS other_name,
                other.email AS other_email,
                other.role AS other_role,

                last_message.message AS last_message,
                last_message.created_at AS last_message_time,

                (
                    SELECT COUNT(*)
                    FROM messages unread_messages
                    WHERE unread_messages.conversation_id = c.id
                    AND unread_messages.sender_id != ?
                    AND unread_messages.read_at IS NULL
                ) AS unread_count

            FROM conversations c

            INNER JOIN conversation_participants current_participant
                ON current_participant.conversation_id = c.id
                AND current_participant.user_id = ?

            INNER JOIN conversation_participants other_participant
                ON other_participant.conversation_id = c.id
                AND other_participant.user_id != ?

            INNER JOIN users other
                ON other.id = other_participant.user_id

            LEFT JOIN messages last_message
                ON last_message.id = (
                    SELECT m2.id
                    FROM messages m2
                    WHERE m2.conversation_id = c.id
                    ORDER BY m2.created_at DESC, m2.id DESC
                    LIMIT 1
                )

            ORDER BY
                COALESCE(last_message.created_at, c.updated_at) DESC,
                c.id DESC
        ");

        $conversationStmt->execute([
            $currentUserId,
            $currentUserId,
            $currentUserId
        ]);

        $conversations = $conversationStmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Add profile information
        |--------------------------------------------------------------------------
        |
        | This allows the frontend to display useful information such as:
        | Student • BSc IT
        | Alumni • Data Analyst
        | Business • Company
        |
        */

        foreach ($conversations as &$conversation) {

            $otherUserId = (int) $conversation["other_user_id"];

            $profile = [
                "qualification" => null,
                "company" => null,
                "position" => null,
                "industry" => null
            ];


            /*
            | Student profile
            */

            $studentStmt = $pdo->prepare("
                SELECT
                    qualification,
                    current_company,
                    current_position
                FROM student_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $studentStmt->execute([
                $otherUserId
            ]);

            $studentProfile = $studentStmt->fetch(PDO::FETCH_ASSOC);

            if ($studentProfile) {

                $profile["qualification"] =
                    $studentProfile["qualification"];

                $profile["company"] =
                    $studentProfile["current_company"];

                $profile["position"] =
                    $studentProfile["current_position"];
            }


            /*
            | Alumni profile
            */

            $alumniStmt = $pdo->prepare("
                SELECT
                    qualification,
                    company,
                    position
                FROM alumni_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $alumniStmt->execute([
                $otherUserId
            ]);

            $alumniProfile = $alumniStmt->fetch(PDO::FETCH_ASSOC);

            if ($alumniProfile) {

                $profile["qualification"] =
                    $alumniProfile["qualification"];

                $profile["company"] =
                    $alumniProfile["company"];

                $profile["position"] =
                    $alumniProfile["position"];
            }


            /*
            | Business profile
            */

            $businessStmt = $pdo->prepare("
                SELECT
                    company_name,
                    industry
                FROM business_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $businessStmt->execute([
                $otherUserId
            ]);

            $businessProfile = $businessStmt->fetch(PDO::FETCH_ASSOC);

            if ($businessProfile) {

                $profile["company"] =
                    $businessProfile["company_name"];

                $profile["industry"] =
                    $businessProfile["industry"];
            }


            $conversation["qualification"] =
                $profile["qualification"];

            $conversation["company"] =
                $profile["company"];

            $conversation["position"] =
                $profile["position"];

            $conversation["industry"] =
                $profile["industry"];
        }

        unset($conversation);


        sendResponse(
            true,
            "Conversations loaded successfully.",
            [
                "conversations" => $conversations
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | POST — SEND MESSAGE
    |--------------------------------------------------------------------------
    |
    | Expected JSON:
    |
    | {
    |     "recipient_id": 23,
    |     "message": "Hello!"
    | }
    |
    | OR
    |
    | {
    |     "conversation_id": 1,
    |     "message": "Hello!"
    | }
    |
    */

    if ($method === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {

            sendResponse(
                false,
                "Invalid JSON request.",
                null,
                400
            );
        }


        $recipientId = isset($input["recipient_id"])
            ? (int) $input["recipient_id"]
            : 0;

        $conversationId = isset($input["conversation_id"])
            ? (int) $input["conversation_id"]
            : 0;

        $messageText = trim(
            (string) ($input["message"] ?? "")
        );


        if ($messageText === "") {

            sendResponse(
                false,
                "Message cannot be empty.",
                null,
                400
            );
        }


        if (mb_strlen($messageText) > 5000) {

            sendResponse(
                false,
                "Message is too long. Maximum length is 5000 characters.",
                null,
                400
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Existing Conversation
        |--------------------------------------------------------------------------
        */

        if ($conversationId > 0) {

            $participantStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM conversation_participants
                WHERE conversation_id = ?
                AND user_id = ?
            ");

            $participantStmt->execute([
                $conversationId,
                $currentUserId
            ]);

            if ((int) $participantStmt->fetchColumn() === 0) {

                sendResponse(
                    false,
                    "You do not have access to this conversation.",
                    null,
                    403
                );
            }

        }


        /*
        |--------------------------------------------------------------------------
        | Find or Create Conversation From Recipient
        |--------------------------------------------------------------------------
        */

        else {

            if ($recipientId <= 0) {

                sendResponse(
                    false,
                    "Recipient is required.",
                    null,
                    400
                );
            }


            if ($recipientId === $currentUserId) {

                sendResponse(
                    false,
                    "You cannot send a message to yourself.",
                    null,
                    400
                );
            }


            /*
            | Check recipient exists and is active.
            */

            $recipientStmt = $pdo->prepare("
                SELECT id, name, role, status
                FROM users
                WHERE id = ?
                LIMIT 1
            ");

            $recipientStmt->execute([
                $recipientId
            ]);

            $recipient = $recipientStmt->fetch(PDO::FETCH_ASSOC);

            if (!$recipient) {

                sendResponse(
                    false,
                    "Recipient not found.",
                    null,
                    404
                );
            }


            if ($recipient["status"] !== "active") {

                sendResponse(
                    false,
                    "This user is not currently available for messaging.",
                    null,
                    403
                );
            }


            /*
            | Find an existing one-to-one conversation.
            */

            $existingConversationStmt = $pdo->prepare("
                SELECT c.id
                FROM conversations c

                INNER JOIN conversation_participants cp1
                    ON cp1.conversation_id = c.id
                    AND cp1.user_id = ?

                INNER JOIN conversation_participants cp2
                    ON cp2.conversation_id = c.id
                    AND cp2.user_id = ?

                WHERE (
                    SELECT COUNT(*)
                    FROM conversation_participants cp3
                    WHERE cp3.conversation_id = c.id
                ) = 2

                LIMIT 1
            ");

            $existingConversationStmt->execute([
                $currentUserId,
                $recipientId
            ]);

            $existingConversationId =
                $existingConversationStmt->fetchColumn();


            if ($existingConversationId) {

                $conversationId =
                    (int) $existingConversationId;

            } else {

                /*
                | Create new conversation.
                */

                $pdo->beginTransaction();

                try {

                    $createConversationStmt = $pdo->prepare("
                        INSERT INTO conversations
                            (created_at, updated_at)
                        VALUES
                            (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ");

                    $createConversationStmt->execute();

                    $conversationId =
                        (int) $pdo->lastInsertId();


                    /*
                    | Add current user.
                    */

                    $participantStmt = $pdo->prepare("
                        INSERT INTO conversation_participants
                            (conversation_id, user_id)
                        VALUES
                            (?, ?)
                    ");

                    $participantStmt->execute([
                        $conversationId,
                        $currentUserId
                    ]);


                    /*
                    | Add recipient.
                    */

                    $participantStmt->execute([
                        $conversationId,
                        $recipientId
                    ]);


                    $pdo->commit();

                } catch (Exception $e) {

                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }

                    throw $e;
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Insert Message
        |--------------------------------------------------------------------------
        */

        $pdo->beginTransaction();

        try {

            /*
            | Confirm sender belongs to conversation.
            */

            $senderCheckStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM conversation_participants
                WHERE conversation_id = ?
                AND user_id = ?
            ");

            $senderCheckStmt->execute([
                $conversationId,
                $currentUserId
            ]);

            if ((int) $senderCheckStmt->fetchColumn() === 0) {

                $pdo->rollBack();

                sendResponse(
                    false,
                    "You are not a participant in this conversation.",
                    null,
                    403
                );
            }


            /*
            | Insert message.
            */

            $messageStmt = $pdo->prepare("
                INSERT INTO messages
                    (
                        conversation_id,
                        sender_id,
                        message,
                        created_at
                    )
                VALUES
                    (
                        ?,
                        ?,
                        ?,
                        CURRENT_TIMESTAMP
                    )
            ");

            $messageStmt->execute([
                $conversationId,
                $currentUserId,
                $messageText
            ]);

            $messageId =
                (int) $pdo->lastInsertId();


            /*
            | Update conversation timestamp.
            */

            $updateConversationStmt = $pdo->prepare("
                UPDATE conversations
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");

            $updateConversationStmt->execute([
                $conversationId
            ]);


            /*
            | Get the newly created message.
            */

            $newMessageStmt = $pdo->prepare("
                SELECT
                    m.id,
                    m.conversation_id,
                    m.sender_id,
                    m.message,
                    m.created_at,
                    m.read_at,
                    u.name AS sender_name,
                    u.role AS sender_role
                FROM messages m
                INNER JOIN users u
                    ON u.id = m.sender_id
                WHERE m.id = ?
                LIMIT 1
            ");

            $newMessageStmt->execute([
                $messageId
            ]);

            $newMessage =
                $newMessageStmt->fetch(PDO::FETCH_ASSOC);


            /*
            | Create notification for the other participant.
            */

            $recipientForNotificationStmt = $pdo->prepare("
                SELECT user_id
                FROM conversation_participants
                WHERE conversation_id = ?
                AND user_id != ?
                LIMIT 1
            ");

            $recipientForNotificationStmt->execute([
                $conversationId,
                $currentUserId
            ]);

            $notificationUserId =
                $recipientForNotificationStmt->fetchColumn();


            if ($notificationUserId) {

                $notificationStmt = $pdo->prepare("
                    INSERT INTO notifications
                        (
                            user_id,
                            type,
                            message,
                            created_at
                        )
                    VALUES
                        (
                            ?,
                            'message',
                            ?,
                            CURRENT_TIMESTAMP
                        )
                ");

                $notificationMessage =
                    $user["name"] . " sent you a message.";

                $notificationStmt->execute([
                    (int) $notificationUserId,
                    $notificationMessage
                ]);
            }


            $pdo->commit();


            sendResponse(
                true,
                "Message sent successfully.",
                [
                    "conversation_id" => $conversationId,
                    "message" => $newMessage
                ],
                201
            );

        } catch (Exception $e) {

            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $e;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PUT — MARK MESSAGES AS READ
    |--------------------------------------------------------------------------
    |
    | Expected JSON:
    |
    | {
    |     "conversation_id": 1
    | }
    |
    */

    if ($method === "PUT") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        if (!is_array($input)) {

            sendResponse(
                false,
                "Invalid JSON request.",
                null,
                400
            );
        }


        $conversationId = isset($input["conversation_id"])
            ? (int) $input["conversation_id"]
            : 0;


        if ($conversationId <= 0) {

            sendResponse(
                false,
                "Conversation ID is required.",
                null,
                400
            );
        }


        /*
        | Confirm user is a participant.
        */

        $participantStmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM conversation_participants
            WHERE conversation_id = ?
            AND user_id = ?
        ");

        $participantStmt->execute([
            $conversationId,
            $currentUserId
        ]);

        if ((int) $participantStmt->fetchColumn() === 0) {

            sendResponse(
                false,
                "You do not have access to this conversation.",
                null,
                403
            );
        }


        /*
        | Mark incoming messages as read.
        */

        $markReadStmt = $pdo->prepare("
            UPDATE messages
            SET read_at = CURRENT_TIMESTAMP
            WHERE conversation_id = ?
            AND sender_id != ?
            AND read_at IS NULL
        ");

        $markReadStmt->execute([
            $conversationId,
            $currentUserId
        ]);


        sendResponse(
            true,
            "Messages marked as read.",
            [
                "conversation_id" => $conversationId,
                "messages_marked_read" =>
                    $markReadStmt->rowCount()
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported Method
    |--------------------------------------------------------------------------
    */

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );


} catch (PDOException $e) {

    sendResponse(
        false,
        $e->getMessage(),
        null,
        500
    );

} catch (Exception $e) {

    sendResponse(
        false,
        "An unexpected error occurred.",
        null,
        500
    );
}
?>