<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";


/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function sendResponse(
    bool $success,
    string $message,
    $data = null,
    int $statusCode = 200
): void {
    http_response_code($statusCode);

    $response = [
        "success" => $success,
        "message" => $message
    ];

    if ($data !== null) {
        $response["data"] = $data;
    }

    echo json_encode($response);
    exit;
}


/*
|--------------------------------------------------------------------------
| NOTIFICATION HELPER
|--------------------------------------------------------------------------
*/

function createNotification(
    PDO $pdo,
    int $userId,
    string $type,
    string $message
): void {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (
                user_id,
                type,
                message
            )
            VALUES (
                :user_id,
                :type,
                :message
            )
        ");

        $stmt->execute([
            ":user_id" => $userId,
            ":type" => $type,
            ":message" => $message
        ]);

    } catch (Throwable $e) {

        /*
         * Notification failure should never cause the
         * main mentorship operation to fail.
         */
        error_log(
            "Mentorship notification error: " .
            $e->getMessage()
        );
    }
}


/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

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
    $currentRole = $user["role"];


    /*
    |--------------------------------------------------------------------------
    | READ JSON BODY
    |--------------------------------------------------------------------------
    */

    $rawInput = file_get_contents("php://input");

    $input = [];

    if (!empty($rawInput)) {

        $decodedInput = json_decode(
            $rawInput,
            true
        );

        if (
            json_last_error() === JSON_ERROR_NONE &&
            is_array($decodedInput)
        ) {
            $input = $decodedInput;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | GET
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {


        /*
        |--------------------------------------------------------------------------
        | ALUMNI GET
        |--------------------------------------------------------------------------
        |
        | Returns:
        | - Active students
        | - Skills
        | - Career goals
        | - Mentorship status
        | - Alumni's mentorship requests
        | - Statistics
        |
        */

        if ($currentRole === "alumni") {

            /*
            |--------------------------------------------------------------------------
            | STUDENTS
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            | career_goals uses `name`, not `title`.
            |
            */

            $studentsStmt = $pdo->prepare("
                SELECT
                    u.id,
                    u.name,
                    u.email,

                    sp.qualification,
                    sp.year_of_study,
                    sp.graduation_year,
                    sp.campus,
                    sp.bio,

                    COALESCE(
                        GROUP_CONCAT(
                            DISTINCT s.name
                            ORDER BY s.name
                            SEPARATOR ' • '
                        ),
                        ''
                    ) AS skills,

                    COALESCE(
                        GROUP_CONCAT(
                            DISTINCT cg.name
                            ORDER BY cg.name
                            SEPARATOR ' • '
                        ),
                        ''
                    ) AS career_goals,

                    (
                        SELECT mr.status
                        FROM mentorship_requests mr
                        WHERE mr.alumni_id = :alumni_id_status
                          AND mr.student_id = u.id
                        ORDER BY mr.id DESC
                        LIMIT 1
                    ) AS mentorship_status,

                    (
                        SELECT mr.id
                        FROM mentorship_requests mr
                        WHERE mr.alumni_id = :alumni_id_request
                          AND mr.student_id = u.id
                          AND mr.status = 'pending'
                        ORDER BY mr.id DESC
                        LIMIT 1
                    ) AS pending_request_id

                FROM users u

                INNER JOIN student_profiles sp
                    ON sp.user_id = u.id

                LEFT JOIN user_skills us
                    ON us.user_id = u.id

                LEFT JOIN skills s
                    ON s.id = us.skill_id

                LEFT JOIN student_career_goals scg
                    ON scg.student_profile_id = sp.id

                LEFT JOIN career_goals cg
                    ON cg.id = scg.career_goal_id

                WHERE u.role = 'student'
                  AND u.status = 'active'

                GROUP BY
                    u.id,
                    u.name,
                    u.email,
                    sp.qualification,
                    sp.year_of_study,
                    sp.graduation_year,
                    sp.campus,
                    sp.bio

                ORDER BY u.name ASC
            ");

            $studentsStmt->execute([
                ":alumni_id_status" => $currentUserId,
                ":alumni_id_request" => $currentUserId
            ]);

            $students = $studentsStmt->fetchAll(
                PDO::FETCH_ASSOC
            );


            /*
            |--------------------------------------------------------------------------
            | FORMAT STUDENTS
            |--------------------------------------------------------------------------
            */

            foreach ($students as &$student) {

                $student["id"] =
                    (int) $student["id"];

                $student["year_of_study"] =
                    $student["year_of_study"] !== null
                        ? (int) $student["year_of_study"]
                        : null;

                $student["graduation_year"] =
                    $student["graduation_year"] !== null
                        ? (int) $student["graduation_year"]
                        : null;

                $student["pending_request_id"] =
                    $student["pending_request_id"] !== null
                        ? (int) $student["pending_request_id"]
                        : null;


                /*
                 * Convert skills string into array.
                 */

                if (!empty($student["skills"])) {

                    $student["skills"] = array_values(
                        array_filter(
                            array_map(
                                "trim",
                                explode(
                                    " • ",
                                    $student["skills"]
                                )
                            )
                        )
                    );

                } else {

                    $student["skills"] = [];
                }


                /*
                 * Convert career goals string into array.
                 */

                if (!empty($student["career_goals"])) {

                    $student["career_goals"] = array_values(
                        array_filter(
                            array_map(
                                "trim",
                                explode(
                                    " • ",
                                    $student["career_goals"]
                                )
                            )
                        )
                    );

                } else {

                    $student["career_goals"] = [];
                }


                /*
                 * Return null when there is no mentorship request.
                 */

                if (
                    empty($student["mentorship_status"])
                ) {
                    $student["mentorship_status"] = null;
                }
            }

            unset($student);


            /*
            |--------------------------------------------------------------------------
            | ALUMNI MENTORSHIP REQUESTS
            |--------------------------------------------------------------------------
            */

            $requestsStmt = $pdo->prepare("
                SELECT
                    mr.id,
                    mr.alumni_id,
                    mr.student_id,
                    mr.status,
                    mr.created_at,
                    mr.updated_at,

                    u.name AS student_name,
                    u.email AS student_email,

                    sp.qualification,
                    sp.year_of_study,
                    sp.campus

                FROM mentorship_requests mr

                INNER JOIN users u
                    ON u.id = mr.student_id

                LEFT JOIN student_profiles sp
                    ON sp.user_id = u.id

                WHERE mr.alumni_id = :alumni_id

                ORDER BY
                    CASE mr.status
                        WHEN 'pending' THEN 1
                        WHEN 'accepted' THEN 2
                        WHEN 'rejected' THEN 3
                        WHEN 'cancelled' THEN 4
                        ELSE 5
                    END,
                    mr.created_at DESC
            ");

            $requestsStmt->execute([
                ":alumni_id" => $currentUserId
            ]);

            $requests = $requestsStmt->fetchAll(
                PDO::FETCH_ASSOC
            );


            /*
            |--------------------------------------------------------------------------
            | FORMAT REQUESTS
            |--------------------------------------------------------------------------
            */

            foreach ($requests as &$request) {

                $request["id"] =
                    (int) $request["id"];

                $request["alumni_id"] =
                    (int) $request["alumni_id"];

                $request["student_id"] =
                    (int) $request["student_id"];

                $request["year_of_study"] =
                    $request["year_of_study"] !== null
                        ? (int) $request["year_of_study"]
                        : null;
            }

            unset($request);


            /*
            |--------------------------------------------------------------------------
            | TOTAL ACTIVE STUDENTS
            |--------------------------------------------------------------------------
            */

            $studentCountStmt = $pdo->query("
                SELECT COUNT(*)
                FROM users
                WHERE role = 'student'
                  AND status = 'active'
            ");

            $totalStudents =
                (int) $studentCountStmt->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | PENDING REQUESTS
            |--------------------------------------------------------------------------
            */

            $pendingCountStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM mentorship_requests
                WHERE alumni_id = :alumni_id
                  AND status = 'pending'
            ");

            $pendingCountStmt->execute([
                ":alumni_id" => $currentUserId
            ]);

            $pendingRequests =
                (int) $pendingCountStmt->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | ACCEPTED MENTORSHIPS
            |--------------------------------------------------------------------------
            */

            $acceptedCountStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM mentorship_requests
                WHERE alumni_id = :alumni_id
                  AND status = 'accepted'
            ");

            $acceptedCountStmt->execute([
                ":alumni_id" => $currentUserId
            ]);

            $acceptedMentorships =
                (int) $acceptedCountStmt->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | SESSIONS
            |--------------------------------------------------------------------------
            |
            | There is currently no mentorship session table.
            |
            */

            $sessions = 0;


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            sendResponse(
                true,
                "Mentorship data retrieved successfully.",
                [
                    "students" => $students,

                    "requests" => $requests,

                    "stats" => [
                        "students" => $totalStudents,
                        "requests" => $pendingRequests,
                        "accepted" => $acceptedMentorships,
                        "sessions" => $sessions
                    ]
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT GET
        |--------------------------------------------------------------------------
        */

        if ($currentRole === "student") {

            $requestsStmt = $pdo->prepare("
                SELECT
                    mr.id,
                    mr.alumni_id,
                    mr.student_id,
                    mr.status,
                    mr.created_at,
                    mr.updated_at,

                    u.name AS alumni_name,
                    u.email AS alumni_email,

                    ap.qualification,
                    ap.graduation_year,
                    ap.company,
                    ap.position,
                    ap.verified

                FROM mentorship_requests mr

                INNER JOIN users u
                    ON u.id = mr.alumni_id

                LEFT JOIN alumni_profiles ap
                    ON ap.user_id = u.id

                WHERE mr.student_id = :student_id

                ORDER BY mr.created_at DESC
            ");

            $requestsStmt->execute([
                ":student_id" => $currentUserId
            ]);

            $requests = $requestsStmt->fetchAll(
                PDO::FETCH_ASSOC
            );


            /*
            |--------------------------------------------------------------------------
            | FORMAT STUDENT REQUESTS
            |--------------------------------------------------------------------------
            */

            foreach ($requests as &$request) {

                $request["id"] =
                    (int) $request["id"];

                $request["alumni_id"] =
                    (int) $request["alumni_id"];

                $request["student_id"] =
                    (int) $request["student_id"];

                $request["graduation_year"] =
                    $request["graduation_year"] !== null
                        ? (int) $request["graduation_year"]
                        : null;

                $request["verified"] =
                    (bool) $request["verified"];
            }

            unset($request);


            sendResponse(
                true,
                "Mentorship requests retrieved successfully.",
                [
                    "requests" => $requests
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | INVALID ROLE
        |--------------------------------------------------------------------------
        */

        sendResponse(
            false,
            "This role cannot access mentorship data.",
            null,
            403
        );
    }


    /*
    |--------------------------------------------------------------------------
    | POST — ALUMNI OFFERS MENTORSHIP
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        if ($currentRole !== "alumni") {

            sendResponse(
                false,
                "Only alumni can offer mentorship.",
                null,
                403
            );
        }


        $studentId =
            isset($input["student_id"])
                ? (int) $input["student_id"]
                : 0;


        if ($studentId <= 0) {

            sendResponse(
                false,
                "A valid student ID is required.",
                null,
                400
            );
        }


        if ($studentId === $currentUserId) {

            sendResponse(
                false,
                "You cannot offer mentorship to yourself.",
                null,
                400
            );
        }


        /*
        |--------------------------------------------------------------------------
        | VERIFY STUDENT
        |--------------------------------------------------------------------------
        */

        $studentStmt = $pdo->prepare("
            SELECT
                u.id,
                u.name
            FROM users u
            WHERE u.id = :student_id
              AND u.role = 'student'
              AND u.status = 'active'
            LIMIT 1
        ");

        $studentStmt->execute([
            ":student_id" => $studentId
        ]);

        $student = $studentStmt->fetch(
            PDO::FETCH_ASSOC
        );


        if (!$student) {

            sendResponse(
                false,
                "The selected student could not be found.",
                null,
                404
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK EXISTING REQUEST
        |--------------------------------------------------------------------------
        */

        $existingStmt = $pdo->prepare("
            SELECT
                id,
                status
            FROM mentorship_requests
            WHERE alumni_id = :alumni_id
              AND student_id = :student_id
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        ");

        $existingStmt->execute([
            ":alumni_id" => $currentUserId,
            ":student_id" => $studentId
        ]);

        $existingRequest =
            $existingStmt->fetch(PDO::FETCH_ASSOC);


        if ($existingRequest) {

            if (
                $existingRequest["status"] === "pending"
            ) {

                sendResponse(
                    false,
                    "You already have a pending mentorship request with this student.",
                    null,
                    409
                );
            }


            if (
                $existingRequest["status"] === "accepted"
            ) {

                sendResponse(
                    false,
                    "You are already mentoring this student.",
                    null,
                    409
                );
            }

            /*
             * Rejected/cancelled requests are allowed to
             * receive a new mentorship request.
             */
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

        $pdo->beginTransaction();

        try {

            $insertStmt = $pdo->prepare("
                INSERT INTO mentorship_requests (
                    alumni_id,
                    student_id,
                    status
                )
                VALUES (
                    :alumni_id,
                    :student_id,
                    'pending'
                )
            ");

            $insertStmt->execute([
                ":alumni_id" => $currentUserId,
                ":student_id" => $studentId
            ]);

            $requestId =
                (int) $pdo->lastInsertId();


            /*
            |--------------------------------------------------------------------------
            | ALUMNI NAME
            |--------------------------------------------------------------------------
            */

            $alumniNameStmt = $pdo->prepare("
                SELECT name
                FROM users
                WHERE id = :alumni_id
                LIMIT 1
            ");

            $alumniNameStmt->execute([
                ":alumni_id" => $currentUserId
            ]);

            $alumniName =
                $alumniNameStmt->fetchColumn();


            if (!$alumniName) {
                $alumniName = "An alumni member";
            }


            /*
            |--------------------------------------------------------------------------
            | NOTIFY STUDENT
            |--------------------------------------------------------------------------
            */

            createNotification(
                $pdo,
                $studentId,
                "mentorship",
                $alumniName .
                " has offered to mentor you through CareerForge."
            );


            $pdo->commit();


            sendResponse(
                true,
                "Mentorship request sent successfully.",
                [
                    "request_id" => $requestId,
                    "student_id" => $studentId,
                    "status" => "pending"
                ],
                201
            );

        } catch (Throwable $e) {

            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $e;
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PUT
    |--------------------------------------------------------------------------
    |
    | Alumni:
    | - cancel
    |
    | Student:
    | - accept
    | - reject
    |
    */

    if ($_SERVER["REQUEST_METHOD"] === "PUT") {

        $requestId =
            isset($input["request_id"])
                ? (int) $input["request_id"]
                : 0;

        $action =
            isset($input["action"])
                ? strtolower(trim($input["action"]))
                : "";


        if ($requestId <= 0) {

            sendResponse(
                false,
                "A valid mentorship request ID is required.",
                null,
                400
            );
        }


        if (
            !in_array(
                $action,
                ["accept", "reject", "cancel"],
                true
            )
        ) {

            sendResponse(
                false,
                "Invalid mentorship action.",
                null,
                400
            );
        }


        /*
        |--------------------------------------------------------------------------
        | FIND REQUEST
        |--------------------------------------------------------------------------
        */

        $requestStmt = $pdo->prepare("
            SELECT
                mr.id,
                mr.alumni_id,
                mr.student_id,
                mr.status
            FROM mentorship_requests mr
            WHERE mr.id = :request_id
            LIMIT 1
        ");

        $requestStmt->execute([
            ":request_id" => $requestId
        ]);

        $request = $requestStmt->fetch(
            PDO::FETCH_ASSOC
        );


        if (!$request) {

            sendResponse(
                false,
                "Mentorship request not found.",
                null,
                404
            );
        }


        $requestAlumniId =
            (int) $request["alumni_id"];

        $requestStudentId =
            (int) $request["student_id"];


        /*
        |--------------------------------------------------------------------------
        | ALUMNI CANCEL
        |--------------------------------------------------------------------------
        */

        if ($action === "cancel") {

            if (
                $currentRole !== "alumni" ||
                $requestAlumniId !== $currentUserId
            ) {

                sendResponse(
                    false,
                    "You are not authorised to cancel this request.",
                    null,
                    403
                );
            }


            if ($request["status"] !== "pending") {

                sendResponse(
                    false,
                    "Only pending mentorship requests can be cancelled.",
                    null,
                    409
                );
            }


            $updateStmt = $pdo->prepare("
                UPDATE mentorship_requests
                SET status = 'cancelled'
                WHERE id = :request_id
            ");

            $updateStmt->execute([
                ":request_id" => $requestId
            ]);


            /*
            |--------------------------------------------------------------------------
            | ALUMNI NAME
            |--------------------------------------------------------------------------
            */

            $alumniNameStmt = $pdo->prepare("
                SELECT name
                FROM users
                WHERE id = :alumni_id
                LIMIT 1
            ");

            $alumniNameStmt->execute([
                ":alumni_id" => $currentUserId
            ]);

            $alumniName =
                $alumniNameStmt->fetchColumn();


            if (!$alumniName) {
                $alumniName = "An alumni member";
            }


            /*
            |--------------------------------------------------------------------------
            | NOTIFY STUDENT
            |--------------------------------------------------------------------------
            */

            createNotification(
                $pdo,
                $requestStudentId,
                "mentorship",
                $alumniName .
                " cancelled their mentorship offer."
            );


            sendResponse(
                true,
                "Mentorship request cancelled successfully.",
                [
                    "request_id" => $requestId,
                    "status" => "cancelled"
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT ACCEPT / REJECT
        |--------------------------------------------------------------------------
        */

        if ($currentRole !== "student") {

            sendResponse(
                false,
                "Only the student receiving the request can accept or reject it.",
                null,
                403
            );
        }


        if ($requestStudentId !== $currentUserId) {

            sendResponse(
                false,
                "You are not authorised to update this request.",
                null,
                403
            );
        }


        if ($request["status"] !== "pending") {

            sendResponse(
                false,
                "Only pending mentorship requests can be updated.",
                null,
                409
            );
        }


        $newStatus =
            $action === "accept"
                ? "accepted"
                : "rejected";


        $updateStmt = $pdo->prepare("
            UPDATE mentorship_requests
            SET status = :status
            WHERE id = :request_id
        ");

        $updateStmt->execute([
            ":status" => $newStatus,
            ":request_id" => $requestId
        ]);


        /*
        |--------------------------------------------------------------------------
        | STUDENT NAME
        |--------------------------------------------------------------------------
        */

        $studentNameStmt = $pdo->prepare("
            SELECT name
            FROM users
            WHERE id = :student_id
            LIMIT 1
        ");

        $studentNameStmt->execute([
            ":student_id" => $currentUserId
        ]);

        $studentName =
            $studentNameStmt->fetchColumn();


        if (!$studentName) {
            $studentName = "A student";
        }


        /*
        |--------------------------------------------------------------------------
        | NOTIFY ALUMNI
        |--------------------------------------------------------------------------
        */

        if ($newStatus === "accepted") {

            createNotification(
                $pdo,
                $requestAlumniId,
                "mentorship",
                $studentName .
                " accepted your mentorship offer."
            );

            $message =
                "Mentorship request accepted successfully.";

        } else {

            createNotification(
                $pdo,
                $requestAlumniId,
                "mentorship",
                $studentName .
                " declined your mentorship offer."
            );

            $message =
                "Mentorship request declined.";
        }


        sendResponse(
            true,
            $message,
            [
                "request_id" => $requestId,
                "status" => $newStatus
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    |
    | Additional way for alumni to cancel a pending request.
    |
    */

    if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

        if ($currentRole !== "alumni") {

            sendResponse(
                false,
                "Only alumni can cancel mentorship requests.",
                null,
                403
            );
        }


        $requestId =
            isset($input["request_id"])
                ? (int) $input["request_id"]
                : 0;


        if ($requestId <= 0) {

            sendResponse(
                false,
                "A valid mentorship request ID is required.",
                null,
                400
            );
        }


        $requestStmt = $pdo->prepare("
            SELECT
                id,
                student_id,
                status
            FROM mentorship_requests
            WHERE id = :request_id
              AND alumni_id = :alumni_id
            LIMIT 1
        ");

        $requestStmt->execute([
            ":request_id" => $requestId,
            ":alumni_id" => $currentUserId
        ]);

        $request = $requestStmt->fetch(
            PDO::FETCH_ASSOC
        );


        if (!$request) {

            sendResponse(
                false,
                "Mentorship request not found.",
                null,
                404
            );
        }


        if ($request["status"] !== "pending") {

            sendResponse(
                false,
                "Only pending mentorship requests can be cancelled.",
                null,
                409
            );
        }


        $updateStmt = $pdo->prepare("
            UPDATE mentorship_requests
            SET status = 'cancelled'
            WHERE id = :request_id
              AND alumni_id = :alumni_id
        ");

        $updateStmt->execute([
            ":request_id" => $requestId,
            ":alumni_id" => $currentUserId
        ]);


        createNotification(
            $pdo,
            (int) $request["student_id"],
            "mentorship",
            "An alumni cancelled their mentorship offer."
        );


        sendResponse(
            true,
            "Mentorship request cancelled successfully.",
            [
                "request_id" => $requestId,
                "status" => "cancelled"
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | METHOD NOT ALLOWED
    |--------------------------------------------------------------------------
    */

    sendResponse(
        false,
        "Method not allowed.",
        null,
        405
    );


/*
|--------------------------------------------------------------------------
| DATABASE ERROR
|--------------------------------------------------------------------------
*/

} catch (PDOException $e) {

    error_log(
        "Mentorship API PDO error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "A database error occurred while processing the mentorship request.",
        null,
        500
    );


/*
|--------------------------------------------------------------------------
| GENERAL ERROR
|--------------------------------------------------------------------------
*/

} catch (Throwable $e) {

    error_log(
        "Mentorship API error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "An unexpected server error occurred.",
        null,
        500
    );
}