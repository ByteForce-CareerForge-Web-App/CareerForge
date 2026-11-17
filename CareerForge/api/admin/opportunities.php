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
    | GET - Load opportunities
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $sql = "
            SELECT
                o.id,
                o.business_id,
                o.title,
                o.description,
                o.type,
                o.location,
                o.work_arrangement,
                o.positions,
                o.minimum_qualification,
                o.qualification,
                o.deadline,
                o.status,
                o.created_at,

                bp.company_name

            FROM opportunities o

            LEFT JOIN business_profiles bp
                ON o.business_id = bp.id

            ORDER BY
                CASE
                    WHEN o.status = 'pending' THEN 1
                    WHEN o.status = 'active' THEN 2
                    WHEN o.status = 'rejected' THEN 3
                    ELSE 4
                END,
                o.created_at DESC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $opportunities = [];

        foreach ($rows as $row) {

            /*
             * Convert database status to the labels
             * already used by the React Native UI.
             */
            if ($row["status"] === "active") {
                $displayStatus = "Approved";
            } elseif ($row["status"] === "rejected") {
                $displayStatus = "Rejected";
            } else {
                $displayStatus = "Pending";
            }

            /*
             * The current opportunities table does not contain
             * a category column.
             *
             * Use qualification when available so that the
             * existing Category section in the UI still has
             * useful information.
             */
            $category = "General";

            if (!empty($row["qualification"])) {
                $category = $row["qualification"];
            } elseif (!empty($row["minimum_qualification"])) {
                $category = $row["minimum_qualification"];
            }

            /*
             * Use work arrangement when available.
             * Otherwise fall back to the opportunity type.
             */
            $displayType = !empty($row["type"])
                ? $row["type"]
                : "Opportunity";

            if (!empty($row["work_arrangement"])) {
                $displayType .= " • " . $row["work_arrangement"];
            }

            /*
             * Format the created date for the existing UI.
             */
            $posted = "";

            if (!empty($row["created_at"])) {
                $timestamp = strtotime($row["created_at"]);

                if ($timestamp !== false) {
                    $posted = date("j M Y", $timestamp);
                }
            }

            $opportunities[] = [
                "id" => (string) $row["id"],
                "title" => $row["title"] ?? "Untitled Opportunity",
                "company" => $row["company_name"] ?? "Unknown Company",
                "category" => $category,
                "location" => $row["location"] ?? "Not specified",
                "type" => $displayType,
                "status" => $displayStatus,
                "posted" => $posted,
                "description" => $row["description"] ?? "",
                "business_id" => $row["business_id"],
                "deadline" => $row["deadline"],
                "positions" => $row["positions"],
                "qualification" => $row["qualification"],
                "minimum_qualification" => $row["minimum_qualification"],
                "work_arrangement" => $row["work_arrangement"]
            ];
        }

        /*
         * Summary statistics
         */

        $total = count($opportunities);
        $pending = 0;
        $approved = 0;
        $rejected = 0;

        foreach ($opportunities as $opportunity) {

            if ($opportunity["status"] === "Pending") {
                $pending++;
            } elseif ($opportunity["status"] === "Approved") {
                $approved++;
            } elseif ($opportunity["status"] === "Rejected") {
                $rejected++;
            }
        }

        echo json_encode([
            "success" => true,
            "opportunities" => $opportunities,
            "summary" => [
                "total" => $total,
                "pending" => $pending,
                "approved" => $approved,
                "rejected" => $rejected
            ]
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | POST - Update opportunity status
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $input = json_decode(file_get_contents("php://input"), true);

        $opportunityId = isset($input["opportunity_id"])
            ? (int) $input["opportunity_id"]
            : 0;

        $newStatus = $input["status"] ?? "";

        if ($opportunityId <= 0) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid opportunity ID is required."
            ]);

            exit;
        }

        if (!in_array($newStatus, ["Approved", "Rejected"], true)) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid opportunity status."
            ]);

            exit;
        }

        /*
         * Convert frontend status to database status.
         *
         * Approved = active
         * Rejected = rejected
         */
        $databaseStatus = $newStatus === "Approved"
            ? "active"
            : "rejected";

        /*
         * Confirm opportunity exists.
         */
        $checkStmt = $pdo->prepare("
            SELECT
                o.id,
                o.title,
                o.status,
                bp.company_name
            FROM opportunities o
            LEFT JOIN business_profiles bp
                ON o.business_id = bp.id
            WHERE o.id = ?
            LIMIT 1
        ");

        $checkStmt->execute([$opportunityId]);

        $opportunity = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$opportunity) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found."
            ]);

            exit;
        }

        /*
         * Update status.
         */
        $updateStmt = $pdo->prepare("
            UPDATE opportunities
            SET status = ?
            WHERE id = ?
        ");

        $updateStmt->execute([
            $databaseStatus,
            $opportunityId
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Opportunity " . strtolower($newStatus) . " successfully.",
            "opportunity" => [
                "id" => $opportunityId,
                "title" => $opportunity["title"],
                "company" => $opportunity["company_name"],
                "status" => $newStatus
            ]
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE - Remove opportunity
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

        $input = json_decode(file_get_contents("php://input"), true);

        $opportunityId = isset($input["opportunity_id"])
            ? (int) $input["opportunity_id"]
            : 0;

        if ($opportunityId <= 0) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "A valid opportunity ID is required."
            ]);

            exit;
        }

        /*
         * Confirm opportunity exists.
         */
        $checkStmt = $pdo->prepare("
            SELECT id, title
            FROM opportunities
            WHERE id = ?
            LIMIT 1
        ");

        $checkStmt->execute([$opportunityId]);

        $opportunity = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$opportunity) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Opportunity not found."
            ]);

            exit;
        }

        /*
         * Delete the opportunity.
         */
        $deleteStmt = $pdo->prepare("
            DELETE FROM opportunities
            WHERE id = ?
        ");

        $deleteStmt->execute([$opportunityId]);

        echo json_encode([
            "success" => true,
            "message" => "Opportunity removed successfully.",
            "opportunity_id" => $opportunityId
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
        "message" => "Database error.",
        "error" => $e->getMessage()
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error.",
        "error" => $e->getMessage()
    ]);
}