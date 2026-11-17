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
    |--------------------------------------------------------------------------
    | User statistics
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT
            COUNT(*) AS total_users,
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
            SUM(CASE WHEN role = 'alumni' THEN 1 ELSE 0 END) AS alumni,
            SUM(CASE WHEN role = 'business' THEN 1 ELSE 0 END) AS businesses
        FROM users
    ");

    $users = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | Opportunity statistics
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS opportunities
        FROM opportunities
    ");

    $opportunities = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | Pending business verifications
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS pending_business_verifications
        FROM business_profiles
        WHERE verification_status = 'pending'
    ");

    $businessVerification = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | Pending alumni verification requests
    |--------------------------------------------------------------------------
    |
    | verification_requests contains the documents submitted by users.
    | We count pending requests belonging to alumni.
    |
    */

    $stmt = $pdo->query("
        SELECT COUNT(*) AS pending_alumni_certificates
        FROM verification_requests vr
        INNER JOIN users u ON u.id = vr.user_id
        WHERE u.role = 'alumni'
        AND vr.status = 'pending'
    ");

    $alumniVerification = $stmt->fetch(PDO::FETCH_ASSOC);

    /*
    |--------------------------------------------------------------------------
    | Recent activity
    |--------------------------------------------------------------------------
    */

    $recentActivity = [];

    /*
    | Recent user registrations
    */

    $stmt = $pdo->query("
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.created_at
        FROM users u
        ORDER BY u.created_at DESC
        LIMIT 5
    ");

    $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recentUsers as $row) {
        $roleLabel = ucfirst($row["role"]);

        $recentActivity[] = [
            "type" => "registration",
            "title" => "New {$roleLabel} registration",
            "description" => $row["name"],
            "created_at" => $row["created_at"]
        ];
    }

    /*
    | Recent opportunities
    */

    $stmt = $pdo->query("
        SELECT
            o.id,
            o.title,
            o.created_at,
            bp.company_name
        FROM opportunities o
        LEFT JOIN business_profiles bp
            ON bp.id = o.business_id
        ORDER BY o.created_at DESC
        LIMIT 5
    ");

    $recentOpportunities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recentOpportunities as $row) {
        $recentActivity[] = [
            "type" => "opportunity",
            "title" => "New opportunity posted",
            "description" => $row["title"],
            "company_name" => $row["company_name"],
            "created_at" => $row["created_at"]
        ];
    }

    /*
    | Recent verification requests
    */

    $stmt = $pdo->query("
        SELECT
            vr.id,
            vr.status,
            vr.admin_decision,
            u.name,
            u.role
        FROM verification_requests vr
        INNER JOIN users u
            ON u.id = vr.user_id
        ORDER BY vr.id DESC
        LIMIT 5
    ");

    $recentVerifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recentVerifications as $row) {
        $roleLabel = ucfirst($row["role"]);

        $recentActivity[] = [
            "type" => "verification",
            "title" => "{$roleLabel} verification request",
            "description" => $row["name"],
            "status" => $row["status"],
            "admin_decision" => $row["admin_decision"]
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Sort all activity by date where available
    |--------------------------------------------------------------------------
    */

    usort($recentActivity, function ($a, $b) {
        $dateA = $a["created_at"] ?? "";
        $dateB = $b["created_at"] ?? "";

        return strtotime($dateB) <=> strtotime($dateA);
    });

    /*
    | Keep only the latest 5 activities
    */

    $recentActivity = array_slice($recentActivity, 0, 5);

    /*
    |--------------------------------------------------------------------------
    | Calculate attention items
    |--------------------------------------------------------------------------
    */

    $pendingBusiness = (int) ($businessVerification["pending_business_verifications"] ?? 0);
    $pendingAlumni = (int) ($alumniVerification["pending_alumni_certificates"] ?? 0);

    $attentionItems = $pendingBusiness + $pendingAlumni;

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,

        "stats" => [
            "total_users" => (int) ($users["total_users"] ?? 0),
            "students" => (int) ($users["students"] ?? 0),
            "alumni" => (int) ($users["alumni"] ?? 0),
            "businesses" => (int) ($users["businesses"] ?? 0),
            "opportunities" => (int) ($opportunities["opportunities"] ?? 0)
        ],

        "approvals" => [
            "business_verifications" => $pendingBusiness,
            "alumni_certificates" => $pendingAlumni,
            "total" => $attentionItems
        ],

        "platform" => [
            "uptime" => "99.9%",
            "active_sessions" => 0,
            "status" => "Fast"
        ],

        "recent_activity" => $recentActivity
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
        "message" => $e->getMessage()
    ]);
}