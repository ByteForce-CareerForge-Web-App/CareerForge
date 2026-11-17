<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

header("Content-Type: application/json");

$user = getAuthenticatedUser($pdo);

if (!$user) {
    exit;
}

$userId = (int) $user["id"];


/*
|--------------------------------------------------------------------------
| Helper: Send JSON response
|--------------------------------------------------------------------------
*/

function sendResponse(
    bool $success,
    string $message,
    $data = null,
    int $statusCode = 200
) {
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
| Helper: Create notification
|--------------------------------------------------------------------------
*/

function createNotification(
    PDO $pdo,
    int $userId,
    string $type,
    string $message
) {
    $stmt = $pdo->prepare("
        INSERT INTO notifications (
            user_id,
            type,
            message
        )
        VALUES (?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $type,
        $message
    ]);
}


/*
|--------------------------------------------------------------------------
| GET
|
| Returns:
| - incoming connection requests
| - sent connection requests
| - accepted connections
| - people available to connect with
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        /*
        |--------------------------------------------------------------------------
        | Incoming Requests
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                c.id AS connection_id,
                c.requester_id AS user_id,
                u.name,
                u.email,
                u.role,
                u.status,
                c.status,
                c.created_at
            FROM connections c
            INNER JOIN users u
                ON u.id = c.requester_id
            WHERE c.receiver_id = ?
              AND c.status = 'pending'
            ORDER BY c.created_at DESC
        ");

        $stmt->execute([$userId]);

        $incomingRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Sent Requests
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                c.id AS connection_id,
                c.receiver_id AS user_id,
                u.name,
                u.email,
                u.role,
                u.status,
                c.status,
                c.created_at
            FROM connections c
            INNER JOIN users u
                ON u.id = c.receiver_id
            WHERE c.requester_id = ?
              AND c.status = 'pending'
            ORDER BY c.created_at DESC
        ");

        $stmt->execute([$userId]);

        $sentRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
|--------------------------------------------------------------------------
| Accepted Connections
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        c.id AS connection_id,

        CASE
            WHEN c.requester_id = ?
            THEN c.receiver_id
            ELSE c.requester_id
        END AS user_id,

        u.name,
        u.email,
        u.role,
        u.status,
        c.status,
        c.created_at

    FROM connections c

    INNER JOIN users u
        ON u.id = CASE
            WHEN c.requester_id = ?
            THEN c.receiver_id
            ELSE c.requester_id
        END

    WHERE (
        c.requester_id = ?
        OR c.receiver_id = ?
    )
    AND c.status = 'accepted'

    ORDER BY c.updated_at DESC
");

$stmt->execute([
    $userId,
    $userId,
    $userId,
    $userId
]);

$connections = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Add Profile Information To Accepted Connections
|--------------------------------------------------------------------------
*/

foreach ($connections as &$connection) {

    $connectionUserId = (int) $connection["user_id"];

    $profile = [
        "qualification" => null,
        "graduation_year" => null,
        "company" => null,
        "position" => null,
        "industry" => null
    ];


    /*
    |--------------------------------------------------------------------------
    | Student Profile
    |--------------------------------------------------------------------------
    */

    $profileStmt = $pdo->prepare("
        SELECT
            qualification,
            graduation_year,
            current_company AS company,
            current_position AS position
        FROM student_profiles
        WHERE user_id = ?
        LIMIT 1
    ");

    $profileStmt->execute([
        $connectionUserId
    ]);

    $studentProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

    if ($studentProfile) {
        $profile = array_merge(
            $profile,
            $studentProfile
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Alumni Profile
    |--------------------------------------------------------------------------
    */

    $profileStmt = $pdo->prepare("
        SELECT
            qualification,
            graduation_year,
            company,
            position
        FROM alumni_profiles
        WHERE user_id = ?
        LIMIT 1
    ");

    $profileStmt->execute([
        $connectionUserId
    ]);

    $alumniProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

    if ($alumniProfile) {
        $profile = array_merge(
            $profile,
            $alumniProfile
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Business Profile
    |--------------------------------------------------------------------------
    */

    $profileStmt = $pdo->prepare("
        SELECT
            company_name AS company,
            industry
        FROM business_profiles
        WHERE user_id = ?
        LIMIT 1
    ");

    $profileStmt->execute([
        $connectionUserId
    ]);

    $businessProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

    if ($businessProfile) {
        $profile = array_merge(
            $profile,
            $businessProfile
        );
    }


    $connection["qualification"] =
        $profile["qualification"];

    $connection["graduation_year"] =
        $profile["graduation_year"];

    $connection["company"] =
        $profile["company"];

    $connection["position"] =
        $profile["position"];

    $connection["industry"] =
        $profile["industry"];

    $connection["initials"] =
        getInitials($connection["name"]);
}

unset($connection);

        /*
        |--------------------------------------------------------------------------
        | People You May Know
        |
        | Excludes:
        | - current user
        | - existing connections
        | - pending incoming requests
        | - pending sent requests
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.role,
                u.status

            FROM users u

            WHERE u.id != ?
              AND u.status = 'active'

              AND NOT EXISTS (
                  SELECT 1
                  FROM connections c
                  WHERE
                    (
                        c.requester_id = ?
                        AND c.receiver_id = u.id
                    )
                    OR
                    (
                        c.requester_id = u.id
                        AND c.receiver_id = ?
                    )
                  AND c.status IN (
                      'pending',
                      'accepted',
                      'blocked'
                  )
              )

            ORDER BY u.name ASC
        ");

        $stmt->execute([
            $userId,
            $userId,
            $userId
        ]);

        $people = $stmt->fetchAll(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Add profile information where available
        |--------------------------------------------------------------------------
        */

        foreach ($people as &$person) {

            $personId = (int) $person["user_id"];

            $profile = [
                "qualification" => null,
                "graduation_year" => null,
                "company" => null,
                "position" => null,
                "industry" => null
            ];


            /*
            |--------------------------------------------------------------------------
            | Student Profile
            |--------------------------------------------------------------------------
            */

            $profileStmt = $pdo->prepare("
                SELECT
                    qualification,
                    graduation_year,
                    current_company AS company,
                    current_position AS position
                FROM student_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $profileStmt->execute([$personId]);

            $studentProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

            if ($studentProfile) {
                $profile = array_merge($profile, $studentProfile);
            }


            /*
            |--------------------------------------------------------------------------
            | Alumni Profile
            |--------------------------------------------------------------------------
            */

            $profileStmt = $pdo->prepare("
                SELECT
                    qualification,
                    graduation_year,
                    company,
                    position
                FROM alumni_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $profileStmt->execute([$personId]);

            $alumniProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

            if ($alumniProfile) {
                $profile = array_merge($profile, $alumniProfile);
            }


            /*
            |--------------------------------------------------------------------------
            | Business Profile
            |--------------------------------------------------------------------------
            */

            $profileStmt = $pdo->prepare("
                SELECT
                    company_name AS company,
                    industry
                FROM business_profiles
                WHERE user_id = ?
                LIMIT 1
            ");

            $profileStmt->execute([$personId]);

            $businessProfile = $profileStmt->fetch(PDO::FETCH_ASSOC);

            if ($businessProfile) {
                $profile = array_merge($profile, $businessProfile);
            }

            $person["qualification"] = $profile["qualification"];
            $person["graduation_year"] = $profile["graduation_year"];
            $person["company"] = $profile["company"];
            $person["position"] = $profile["position"];
            $person["industry"] = $profile["industry"];

            $person["initials"] = getInitials($person["name"]);
        }

        unset($person);


        /*
        |--------------------------------------------------------------------------
        | Add initials to requests/connections
        |--------------------------------------------------------------------------
        */

        foreach ($incomingRequests as &$request) {
            $request["initials"] = getInitials($request["name"]);
        }

        unset($request);

        foreach ($sentRequests as &$request) {
            $request["initials"] = getInitials($request["name"]);
        }

        unset($request);

        foreach ($connections as &$connection) {
            $connection["initials"] = getInitials($connection["name"]);
        }

        unset($connection);


        sendResponse(
            true,
            "Connections retrieved successfully",
            [
                "incoming_requests" => $incomingRequests,
                "sent_requests" => $sentRequests,
                "connections" => $connections,
                "people" => $people
            ]
        );

    } catch (PDOException $e) {

        error_log("Connections GET error: " . $e->getMessage());

        sendResponse(
            false,
            "Failed to retrieve connections",
            null,
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| POST
|
| Send a connection request
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $receiverId = (int) (
        $input["user_id"]
        ?? $input["receiver_id"]
        ?? 0
    );

    if ($receiverId <= 0) {
        sendResponse(
            false,
            "A valid user ID is required",
            null,
            400
        );
    }

    if ($receiverId === $userId) {
        sendResponse(
            false,
            "You cannot connect with yourself",
            null,
            400
        );
    }

    try {

        /*
        |--------------------------------------------------------------------------
        | Check receiver exists
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                id,
                name,
                role,
                status
            FROM users
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$receiverId]);

        $receiver = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$receiver) {
            sendResponse(
                false,
                "User not found",
                null,
                404
            );
        }

        if ($receiver["status"] !== "active") {
            sendResponse(
                false,
                "This user is not currently available for connections",
                null,
                400
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Check existing relationship
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                id,
                requester_id,
                receiver_id,
                status
            FROM connections
            WHERE
                (
                    requester_id = ?
                    AND receiver_id = ?
                )
                OR
                (
                    requester_id = ?
                    AND receiver_id = ?
                )
            LIMIT 1
        ");

        $stmt->execute([
            $userId,
            $receiverId,
            $receiverId,
            $userId
        ]);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);


        /*
        |--------------------------------------------------------------------------
        | Existing relationship
        |--------------------------------------------------------------------------
        */

        if ($existing) {

            if ($existing["status"] === "accepted") {
                sendResponse(
                    false,
                    "You are already connected with this user",
                    null,
                    409
                );
            }

            if ($existing["status"] === "pending") {

                sendResponse(
                    false,
                    "A connection request already exists",
                    null,
                    409
                );
            }

            if ($existing["status"] === "blocked") {

                sendResponse(
                    false,
                    "This connection is currently blocked",
                    null,
                    403
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Allow a rejected request to be sent again
            |--------------------------------------------------------------------------
            */

            if ($existing["status"] === "rejected") {

                $stmt = $pdo->prepare("
                    UPDATE connections
                    SET
                        requester_id = ?,
                        receiver_id = ?,
                        status = 'pending'
                    WHERE id = ?
                ");

                $stmt->execute([
                    $userId,
                    $receiverId,
                    $existing["id"]
                ]);

                createNotification(
                    $pdo,
                    $receiverId,
                    "connection_request",
                    $user["name"] . " sent you a connection request."
                );

                sendResponse(
                    true,
                    "Connection request sent",
                    [
                        "connection_id" => (int) $existing["id"],
                        "status" => "pending"
                    ]
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Create new request
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            INSERT INTO connections (
                requester_id,
                receiver_id,
                status
            )
            VALUES (?, ?, 'pending')
        ");

        $stmt->execute([
            $userId,
            $receiverId
        ]);

        $connectionId = (int) $pdo->lastInsertId();


        /*
        |--------------------------------------------------------------------------
        | Notify receiver
        |--------------------------------------------------------------------------
        */

        createNotification(
            $pdo,
            $receiverId,
            "connection_request",
            $user["name"] . " sent you a connection request."
        );


        sendResponse(
            true,
            "Connection request sent",
            [
                "connection_id" => $connectionId,
                "status" => "pending"
            ],
            201
        );

    } catch (PDOException $e) {

        error_log("Connections POST error: " . $e->getMessage());

        sendResponse(
            false,
            "Failed to send connection request",
            null,
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| PUT
|
| Actions:
| - accept
| - reject
| - cancel
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $connectionId = (int) (
        $input["connection_id"]
        ?? $input["id"]
        ?? 0
    );

    $action = strtolower(
        trim($input["action"] ?? "")
    );

    if ($connectionId <= 0) {
        sendResponse(
            false,
            "A valid connection ID is required",
            null,
            400
        );
    }

    if (!in_array($action, [
        "accept",
        "reject",
        "cancel"
    ], true)) {
        sendResponse(
            false,
            "Invalid connection action",
            null,
            400
        );
    }

    try {

        /*
        |--------------------------------------------------------------------------
        | Get connection
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            SELECT
                c.id,
                c.requester_id,
                c.receiver_id,
                c.status,
                requester.name AS requester_name,
                receiver.name AS receiver_name

            FROM connections c

            INNER JOIN users requester
                ON requester.id = c.requester_id

            INNER JOIN users receiver
                ON receiver.id = c.receiver_id

            WHERE c.id = ?

            LIMIT 1
        ");

        $stmt->execute([$connectionId]);

        $connection = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$connection) {
            sendResponse(
                false,
                "Connection request not found",
                null,
                404
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ACCEPT
        |--------------------------------------------------------------------------
        */

        if ($action === "accept") {

            if ((int) $connection["receiver_id"] !== $userId) {
                sendResponse(
                    false,
                    "Only the receiver can accept this request",
                    null,
                    403
                );
            }

            if ($connection["status"] !== "pending") {
                sendResponse(
                    false,
                    "This request is no longer pending",
                    null,
                    400
                );
            }

            $stmt = $pdo->prepare("
                UPDATE connections
                SET status = 'accepted'
                WHERE id = ?
            ");

            $stmt->execute([$connectionId]);


            /*
            |--------------------------------------------------------------------------
            | Notify requester
            |--------------------------------------------------------------------------
            */

            createNotification(
                $pdo,
                (int) $connection["requester_id"],
                "connection_accepted",
                $user["name"] . " accepted your connection request."
            );

            sendResponse(
                true,
                "Connection request accepted",
                [
                    "connection_id" => $connectionId,
                    "status" => "accepted"
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | REJECT
        |--------------------------------------------------------------------------
        */

        if ($action === "reject") {

            if ((int) $connection["receiver_id"] !== $userId) {
                sendResponse(
                    false,
                    "Only the receiver can reject this request",
                    null,
                    403
                );
            }

            if ($connection["status"] !== "pending") {
                sendResponse(
                    false,
                    "This request is no longer pending",
                    null,
                    400
                );
            }

            $stmt = $pdo->prepare("
                UPDATE connections
                SET status = 'rejected'
                WHERE id = ?
            ");

            $stmt->execute([$connectionId]);

            sendResponse(
                true,
                "Connection request rejected",
                [
                    "connection_id" => $connectionId,
                    "status" => "rejected"
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CANCEL
        |--------------------------------------------------------------------------
        */

        if ($action === "cancel") {

            if ((int) $connection["requester_id"] !== $userId) {
                sendResponse(
                    false,
                    "Only the requester can cancel this request",
                    null,
                    403
                );
            }

            if ($connection["status"] !== "pending") {
                sendResponse(
                    false,
                    "This request is no longer pending",
                    null,
                    400
                );
            }

            $stmt = $pdo->prepare("
                DELETE FROM connections
                WHERE id = ?
            ");

            $stmt->execute([$connectionId]);

            sendResponse(
                true,
                "Connection request cancelled",
                [
                    "connection_id" => $connectionId
                ]
            );
        }

    } catch (PDOException $e) {

        error_log("Connections PUT error: " . $e->getMessage());

        sendResponse(
            false,
            "Failed to update connection request",
            null,
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| DELETE
|
| Remove an accepted connection
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $connectionId = (int) (
        $input["connection_id"]
        ?? $input["id"]
        ?? 0
    );

    if ($connectionId <= 0) {
        sendResponse(
            false,
            "A valid connection ID is required",
            null,
            400
        );
    }

    try {

        $stmt = $pdo->prepare("
            SELECT
                id,
                requester_id,
                receiver_id,
                status
            FROM connections
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$connectionId]);

        $connection = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$connection) {
            sendResponse(
                false,
                "Connection not found",
                null,
                404
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Make sure current user belongs to connection
        |--------------------------------------------------------------------------
        */

        if (
            (int) $connection["requester_id"] !== $userId
            &&
            (int) $connection["receiver_id"] !== $userId
        ) {
            sendResponse(
                false,
                "You do not have permission to remove this connection",
                null,
                403
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Remove
        |--------------------------------------------------------------------------
        */

        $stmt = $pdo->prepare("
            DELETE FROM connections
            WHERE id = ?
        ");

        $stmt->execute([$connectionId]);

        sendResponse(
            true,
            "Connection removed successfully",
            [
                "connection_id" => $connectionId
            ]
        );

    } catch (PDOException $e) {

        error_log("Connections DELETE error: " . $e->getMessage());

        sendResponse(
            false,
            "Failed to remove connection",
            null,
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| Unsupported method
|--------------------------------------------------------------------------
*/

sendResponse(
    false,
    "Method not allowed",
    null,
    405
);


/*
|--------------------------------------------------------------------------
| Helper: Generate initials
|--------------------------------------------------------------------------
*/

function getInitials(string $name): string
{
    $name = trim($name);

    if ($name === "") {
        return "?";
    }

    $parts = preg_split(
        '/\s+/',
        $name
    );

    if (count($parts) === 1) {
        return strtoupper(
            substr($parts[0], 0, 2)
        );
    }

    return strtoupper(
        substr($parts[0], 0, 1)
        .
        substr($parts[count($parts) - 1], 0, 1)
    );
}