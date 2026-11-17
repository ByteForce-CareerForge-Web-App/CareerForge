<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

header("Content-Type: application/json");

try {
    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required."
        ]);

        exit;
    }

    if ($user["role"] !== "admin") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Admin access required."
        ]);

        exit;
    }

    /*
     * ============================================================
     * GET
     * Return real pending/completed business and alumni approvals.
     * ============================================================
     */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $approvals = [];

        /*
         * --------------------------------------------------------
         * BUSINESS VERIFICATIONS
         * --------------------------------------------------------
         */

        $businessSql = "
            SELECT
                bp.id AS request_id,
                bp.user_id,
                bp.company_name,
                bp.registration_number,
                bp.industry,
                bp.description,
                bp.website,
                bp.verification_status,
                u.name,
                u.email,
                u.status AS user_status,
                u.created_at
            FROM business_profiles bp
            INNER JOIN users u
                ON u.id = bp.user_id
            WHERE bp.verification_status IN (
                'pending',
                'verified',
                'rejected'
            )
            ORDER BY
                CASE
                    WHEN bp.verification_status = 'pending' THEN 0
                    ELSE 1
                END,
                bp.id DESC
        ";

        $businessStmt = $pdo->prepare($businessSql);
        $businessStmt->execute();

        $businesses = $businessStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($businesses as $business) {

            $status = "Pending";

            if ($business["verification_status"] === "verified") {
                $status = "Approved";
            } elseif (
                $business["verification_status"] === "rejected"
            ) {
                $status = "Rejected";
            }

            $description = "Business registration and company verification";

            if (!empty($business["industry"])) {
                $description .=
                    " • " . $business["industry"];
            }

            $approvals[] = [
                "id" => "business-" . $business["request_id"],
                "request_id" => (int) $business["request_id"],
                "user_id" => (int) $business["user_id"],
                "name" => $business["company_name"] ?: $business["name"],
                "type" => "Business",
                "description" => $description,
                "date" => date(
                    "j F Y",
                    strtotime($business["created_at"])
                ),
                "status" => $status,
                "email" => $business["email"],
                "company_name" => $business["company_name"],
                "registration_number" =>
                    $business["registration_number"],
                "industry" => $business["industry"],
                "website" => $business["website"],
            ];
        }

        /*
         * --------------------------------------------------------
         * ALUMNI VERIFICATIONS
         * --------------------------------------------------------
         */

        $alumniSql = "
            SELECT
                vr.id AS request_id,
                vr.user_id,
                vr.document_path,
                vr.status AS verification_status,
                vr.ai_confidence,
                vr.admin_decision,
                u.name,
                u.email,
                u.status AS user_status,
                u.created_at,
                ap.qualification,
                ap.graduation_year,
                ap.company,
                ap.position,
                ap.verified
            FROM verification_requests vr
            INNER JOIN users u
                ON u.id = vr.user_id
            LEFT JOIN alumni_profiles ap
                ON ap.user_id = vr.user_id
            WHERE u.role = 'alumni'
            ORDER BY
                CASE
                    WHEN vr.status = 'pending' THEN 0
                    ELSE 1
                END,
                vr.id DESC
        ";

        $alumniStmt = $pdo->prepare($alumniSql);
        $alumniStmt->execute();

        $alumniRequests =
            $alumniStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($alumniRequests as $alumni) {

            $status = "Pending";

            if (
                $alumni["verification_status"] === "approved"
            ) {
                $status = "Approved";
            } elseif (
                $alumni["verification_status"] === "rejected"
            ) {
                $status = "Rejected";
            }

            $description =
                "Degree certificate verification";

            if (!empty($alumni["qualification"])) {
                $description .=
                    " • " . $alumni["qualification"];
            }

            $approvals[] = [
                "id" => "alumni-" . $alumni["request_id"],
                "request_id" => (int) $alumni["request_id"],
                "user_id" => (int) $alumni["user_id"],
                "name" => $alumni["name"],
                "type" => "Alumni",
                "description" => $description,
                "date" => date(
                    "j F Y",
                    strtotime($alumni["created_at"])
                ),
                "status" => $status,
                "email" => $alumni["email"],
                "qualification" =>
                    $alumni["qualification"],
                "graduation_year" =>
                    $alumni["graduation_year"],
                "company" => $alumni["company"],
                "position" => $alumni["position"],
                "document_path" =>
                    $alumni["document_path"],
                "ai_confidence" =>
                    $alumni["ai_confidence"],
                "admin_decision" =>
                    $alumni["admin_decision"],
            ];
        }

        /*
         * --------------------------------------------------------
         * SORT ALL REQUESTS
         *
         * Pending first, then newest requests.
         * --------------------------------------------------------
         */

        usort(
            $approvals,
            function ($a, $b) {

                if (
                    $a["status"] === "Pending" &&
                    $b["status"] !== "Pending"
                ) {
                    return -1;
                }

                if (
                    $a["status"] !== "Pending" &&
                    $b["status"] === "Pending"
                ) {
                    return 1;
                }

                $dateA = strtotime($a["date"]);
                $dateB = strtotime($b["date"]);

                return $dateB <=> $dateA;
            }
        );

        /*
         * --------------------------------------------------------
         * SUMMARY
         * --------------------------------------------------------
         */

        $pending = 0;
        $approved = 0;
        $rejected = 0;

        foreach ($approvals as $approval) {

            if ($approval["status"] === "Pending") {
                $pending++;
            } elseif ($approval["status"] === "Approved") {
                $approved++;
            } elseif ($approval["status"] === "Rejected") {
                $rejected++;
            }
        }

        echo json_encode([
            "success" => true,
            "approvals" => $approvals,
            "summary" => [
                "total" => count($approvals),
                "pending" => $pending,
                "approved" => $approved,
                "rejected" => $rejected
            ]
        ]);

        exit;
    }

    /*
     * ============================================================
     * POST
     * Approve or reject a verification request.
     * ============================================================
     */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(
            file_get_contents("php://input"),
            true
        );

        $type = $input["type"] ?? "";
        $requestId = isset($input["request_id"])
            ? (int) $input["request_id"]
            : 0;
        $status = $input["status"] ?? "";

        if (
            !in_array($type, ["Business", "Alumni"], true)
        ) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid approval type."
            ]);

            exit;
        }

        if ($requestId <= 0) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid request ID."
            ]);

            exit;
        }

        if (
            !in_array($status, ["Approved", "Rejected"], true)
        ) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Status must be Approved or Rejected."
            ]);

            exit;
        }

        $pdo->beginTransaction();

        /*
         * --------------------------------------------------------
         * BUSINESS
         * --------------------------------------------------------
         */

        if ($type === "Business") {

            $businessStmt = $pdo->prepare("
                SELECT
                    id,
                    user_id,
                    verification_status
                FROM business_profiles
                WHERE id = ?
                LIMIT 1
            ");

            $businessStmt->execute([$requestId]);

            $business = $businessStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$business) {

                $pdo->rollBack();

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Business verification request not found."
                ]);

                exit;
            }

            $newVerificationStatus =
                $status === "Approved"
                    ? "verified"
                    : "rejected";

            $newUserStatus =
                $status === "Approved"
                    ? "active"
                    : "inactive";

            $updateBusiness = $pdo->prepare("
                UPDATE business_profiles
                SET verification_status = ?
                WHERE id = ?
            ");

            $updateBusiness->execute([
                $newVerificationStatus,
                $requestId
            ]);

            $updateUser = $pdo->prepare("
                UPDATE users
                SET status = ?
                WHERE id = ?
            ");

            $updateUser->execute([
                $newUserStatus,
                $business["user_id"]
            ]);
        }

        /*
         * --------------------------------------------------------
         * ALUMNI
         * --------------------------------------------------------
         */

        if ($type === "Alumni") {

            $verificationStmt = $pdo->prepare("
                SELECT
                    id,
                    user_id,
                    status
                FROM verification_requests
                WHERE id = ?
                LIMIT 1
            ");

            $verificationStmt->execute([
                $requestId
            ]);

            $verification =
                $verificationStmt->fetch(
                    PDO::FETCH_ASSOC
                );

            if (!$verification) {

                $pdo->rollBack();

                http_response_code(404);

                echo json_encode([
                    "success" => false,
                    "message" =>
                        "Alumni verification request not found."
                ]);

                exit;
            }

            $newVerificationStatus =
                $status === "Approved"
                    ? "approved"
                    : "rejected";

            $newUserStatus =
                $status === "Approved"
                    ? "active"
                    : "inactive";

            $newVerified =
                $status === "Approved" ? 1 : 0;

            /*
             * Update verification request
             */

            $updateVerification = $pdo->prepare("
                UPDATE verification_requests
                SET
                    status = ?,
                    admin_decision = ?
                WHERE id = ?
            ");

            $updateVerification->execute([
                $newVerificationStatus,
                $status,
                $requestId
            ]);

            /*
             * Update alumni profile
             */

            $updateAlumni = $pdo->prepare("
                UPDATE alumni_profiles
                SET verified = ?
                WHERE user_id = ?
            ");

            $updateAlumni->execute([
                $newVerified,
                $verification["user_id"]
            ]);

            /*
             * Update user's login status
             */

            $updateUser = $pdo->prepare("
                UPDATE users
                SET status = ?
                WHERE id = ?
            ");

            $updateUser->execute([
                $newUserStatus,
                $verification["user_id"]
            ]);
        }

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" =>
                $type . " verification " .
                strtolower($status) .
                " successfully."
        ]);

        exit;
    }

    /*
     * ============================================================
     * METHOD NOT ALLOWED
     * ============================================================
     */

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);

} catch (Throwable $e) {

    if (
        isset($pdo) &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Server error while processing approvals.",
        "error" => $e->getMessage()
    ]);
}