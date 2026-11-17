<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

try {
    $admin = getAuthenticatedUser($pdo);

    if (!$admin) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required.'
        ]);
        exit;
    }

    if ($admin['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Admin access required.'
        ]);
        exit;
    }

    /*
     * ---------------------------------------------------------
     * USER STATISTICS
     * ---------------------------------------------------------
     */

    $userStmt = $pdo->query("
        SELECT
            COUNT(*) AS total_users,
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
            SUM(CASE WHEN role = 'alumni' THEN 1 ELSE 0 END) AS alumni,
            SUM(CASE WHEN role = 'business' THEN 1 ELSE 0 END) AS businesses
        FROM users
        WHERE role IN ('student', 'alumni', 'business')
    ");

    $userStats = $userStmt->fetch(PDO::FETCH_ASSOC);

    $totalUsers = (int) ($userStats['total_users'] ?? 0);
    $students = (int) ($userStats['students'] ?? 0);
    $alumni = (int) ($userStats['alumni'] ?? 0);
    $businesses = (int) ($userStats['businesses'] ?? 0);

    /*
     * ---------------------------------------------------------
     * USER GROWTH
     * ---------------------------------------------------------
     */

    $currentMonthStmt = $pdo->query("
        SELECT COUNT(*)
        FROM users
        WHERE role IN ('student', 'alumni', 'business')
        AND created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
    ");

    $currentMonthUsers = (int) $currentMonthStmt->fetchColumn();

    $previousMonthStmt = $pdo->query("
        SELECT COUNT(*)
        FROM users
        WHERE role IN ('student', 'alumni', 'business')
        AND created_at >= DATE_FORMAT(
            DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH),
            '%Y-%m-01'
        )
        AND created_at < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
    ");

    $previousMonthUsers = (int) $previousMonthStmt->fetchColumn();

    if ($previousMonthUsers > 0) {
        $userGrowth = round(
            (($currentMonthUsers - $previousMonthUsers) / $previousMonthUsers) * 100
        );
    } else {
        $userGrowth = $currentMonthUsers > 0 ? 100 : 0;
    }

    /*
     * ---------------------------------------------------------
     * OPPORTUNITY STATISTICS
     * ---------------------------------------------------------
     */

    $opportunityStmt = $pdo->query("
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
        FROM opportunities
    ");

    $opportunityStats = $opportunityStmt->fetch(PDO::FETCH_ASSOC);

    $totalOpportunities = (int) ($opportunityStats['total'] ?? 0);
    $approvedOpportunities = (int) ($opportunityStats['approved'] ?? 0);
    $pendingOpportunities = (int) ($opportunityStats['pending'] ?? 0);
    $rejectedOpportunities = (int) ($opportunityStats['rejected'] ?? 0);

    $opportunityApprovalRate = $totalOpportunities > 0
        ? round(($approvedOpportunities / $totalOpportunities) * 100)
        : 0;

    /*
     * ---------------------------------------------------------
     * APPLICATION STATISTICS
     * ---------------------------------------------------------
     */

    $applicationStats = [
        'total' => 0,
        'under_review' => 0,
        'shortlisted' => 0,
        'successful' => 0
    ];

    try {
        $applicationStmt = $pdo->query("
            SELECT
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN LOWER(status) IN ('pending', 'under review', 'under_review', 'review')
                        THEN 1
                        ELSE 0
                    END
                ) AS under_review,
                SUM(
                    CASE
                        WHEN LOWER(status) IN ('shortlisted', 'shortlist')
                        THEN 1
                        ELSE 0
                    END
                ) AS shortlisted,
                SUM(
                    CASE
                        WHEN LOWER(status) IN ('successful', 'accepted', 'hired', 'approved')
                        THEN 1
                        ELSE 0
                    END
                ) AS successful
            FROM applications
        ");

        $applicationResult = $applicationStmt->fetch(PDO::FETCH_ASSOC);

        $applicationStats = [
            'total' => (int) ($applicationResult['total'] ?? 0),
            'under_review' => (int) ($applicationResult['under_review'] ?? 0),
            'shortlisted' => (int) ($applicationResult['shortlisted'] ?? 0),
            'successful' => (int) ($applicationResult['successful'] ?? 0)
        ];
    } catch (Exception $e) {
        // Keep analytics working even if application status values differ.
    }

    $applicationSuccessRate = $applicationStats['total'] > 0
        ? round(
            ($applicationStats['successful'] / $applicationStats['total']) * 100
        )
        : 0;

    /*
     * ---------------------------------------------------------
     * PROFILE COMPLETION
     * ---------------------------------------------------------
     *
     * A profile is considered completed when the main profile
     * fields contain useful information.
     */

    $profileCompletion = 0;

    try {
        $profileStmt = $pdo->query("
            SELECT
                COUNT(*) AS total_profiles,
                SUM(
                    CASE
                        WHEN
                            qualification IS NOT NULL
                            AND qualification <> ''
                            AND graduation_year IS NOT NULL
                            AND graduation_year <> ''
                            AND bio IS NOT NULL
                            AND bio <> ''
                        THEN 1
                        ELSE 0
                    END
                ) AS completed_profiles
            FROM student_profiles
        ");

        $profileResult = $profileStmt->fetch(PDO::FETCH_ASSOC);

        $totalProfiles = (int) ($profileResult['total_profiles'] ?? 0);
        $completedProfiles = (int) ($profileResult['completed_profiles'] ?? 0);

        if ($totalProfiles > 0) {
            $profileCompletion = round(
                ($completedProfiles / $totalProfiles) * 100
            );
        }
    } catch (Exception $e) {
        $profileCompletion = 0;
    }

    /*
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     */

    $activity = [];

    /*
     * Recent users
     */

    try {
        $recentUsersStmt = $pdo->query("
            SELECT
                name,
                role,
                created_at
            FROM users
            WHERE role IN ('student', 'alumni', 'business')
            ORDER BY created_at DESC
            LIMIT 3
        ");

        while ($row = $recentUsersStmt->fetch(PDO::FETCH_ASSOC)) {
            $role = strtolower($row['role']);

            if ($role === 'student') {
                $activity[] = [
                    'icon' => 'person-add-outline',
                    'title' => 'New student registered',
                    'description' => $row['name'] . ' joined the platform',
                    'created_at' => $row['created_at']
                ];
            } elseif ($role === 'business') {
                $activity[] = [
                    'icon' => 'business-outline',
                    'title' => 'New business registered',
                    'description' => $row['name'] . ' registered a business account',
                    'created_at' => $row['created_at']
                ];
            } else {
                $activity[] = [
                    'icon' => 'school-outline',
                    'title' => 'New alumni registered',
                    'description' => $row['name'] . ' joined the platform',
                    'created_at' => $row['created_at']
                ];
            }
        }
    } catch (Exception $e) {
        // Continue
    }

    /*
     * Recent opportunities
     */

    try {
        $recentOpportunitiesStmt = $pdo->query("
            SELECT
                o.title,
                o.created_at
            FROM opportunities o
            ORDER BY o.created_at DESC
            LIMIT 3
        ");

        while ($row = $recentOpportunitiesStmt->fetch(PDO::FETCH_ASSOC)) {
            $activity[] = [
                'icon' => 'briefcase-outline',
                'title' => 'New opportunity posted',
                'description' => $row['title'] . ' was submitted',
                'created_at' => $row['created_at']
            ];
        }
    } catch (Exception $e) {
        // Continue
    }

    /*
     * Recent applications
     */

    try {
        $recentApplicationsStmt = $pdo->query("
            SELECT
                a.created_at,
                o.title
            FROM applications a
            LEFT JOIN opportunities o
                ON o.id = a.opportunity_id
            ORDER BY a.created_at DESC
            LIMIT 2
        ");

        while ($row = $recentApplicationsStmt->fetch(PDO::FETCH_ASSOC)) {
            $opportunityTitle = $row['title'] ?? 'an opportunity';

            $activity[] = [
                'icon' => 'document-text-outline',
                'title' => 'Application submitted',
                'description' => 'A student applied for ' . $opportunityTitle,
                'created_at' => $row['created_at']
            ];
        }
    } catch (Exception $e) {
        // Continue
    }

    /*
     * Sort all activity by newest first.
     */

    usort($activity, function ($a, $b) {
        return strtotime($b['created_at']) <=> strtotime($a['created_at']);
    });

    $activity = array_slice($activity, 0, 5);

    /*
     * Convert timestamps into readable relative time.
     */

    foreach ($activity as &$item) {
        $timestamp = strtotime($item['created_at']);
        $difference = time() - $timestamp;

        if ($difference < 60) {
            $item['time'] = 'Just now';
        } elseif ($difference < 3600) {
            $minutes = floor($difference / 60);
            $item['time'] = $minutes . ' min ago';
        } elseif ($difference < 86400) {
            $hours = floor($difference / 3600);
            $item['time'] = $hours . ' hour' . ($hours !== 1 ? 's' : '') . ' ago';
        } else {
            $days = floor($difference / 86400);
            $item['time'] = $days . ' day' . ($days !== 1 ? 's' : '') . ' ago';
        }

        unset($item['created_at']);
    }

    unset($item);

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    echo json_encode([
        'success' => true,

        'users' => [
            'total' => $totalUsers,
            'students' => $students,
            'alumni' => $alumni,
            'businesses' => $businesses,
            'growth' => $userGrowth
        ],

        'opportunities' => [
            'total' => $totalOpportunities,
            'approved' => $approvedOpportunities,
            'pending' => $pendingOpportunities,
            'rejected' => $rejectedOpportunities,
            'approval_rate' => $opportunityApprovalRate
        ],

        'applications' => [
            'total' => $applicationStats['total'],
            'under_review' => $applicationStats['under_review'],
            'shortlisted' => $applicationStats['shortlisted'],
            'successful' => $applicationStats['successful'],
            'success_rate' => $applicationSuccessRate
        ],

        'performance' => [
            'profile_completion' => $profileCompletion,
            'opportunity_approval_rate' => $opportunityApprovalRate,
            'application_success_rate' => $applicationSuccessRate
        ],

        'activity' => $activity
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to load analytics.',
        'error' => $e->getMessage()
    ]);
}