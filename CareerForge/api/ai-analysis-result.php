<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";

function sendResponse($success, $message, $data = null, $statusCode = 200)
{
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

try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    $user = getAuthenticatedUser($pdo);

    if ($user["role"] !== "student") {
        sendResponse(
            false,
            "Only students can access AI analysis.",
            null,
            403
        );
    }

    $userId = (int) $user["id"];


    /*
    |--------------------------------------------------------------------------
    | GET LATEST AI ANALYSIS
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            target_role,
            score,
            analysis,
            created_at
        FROM ai_assessments
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
    ");

    $stmt->execute([$userId]);

    $assessment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$assessment) {
        sendResponse(
            false,
            "No AI analysis has been generated for this student yet.",
            null,
            404
        );
    }


    /*
    |--------------------------------------------------------------------------
    | DECODE SAVED ANALYSIS
    |--------------------------------------------------------------------------
    */

    $analysis = json_decode(
        $assessment["analysis"],
        true
    );

    if (!is_array($analysis)) {
        sendResponse(
            false,
            "The saved AI analysis could not be decoded.",
            null,
            500
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RETURN ANALYSIS
    |--------------------------------------------------------------------------
    */

    $data = [
        "assessment_id" => (int) $assessment["id"],
        "target_role" => $assessment["target_role"],
        "score" => (float) $assessment["score"],
        "created_at" => $assessment["created_at"],

        "employability" => $analysis["employability"] ?? [
            "score" => (float) $assessment["score"],
            "level" => null,
            "overall_assessment" => "",
            "strengths" => [],
            "weaknesses" => [],
            "score_factors" => []
        ],

        "skill_gap" => $analysis["skill_gap"] ?? [
            "existing_skills" => [],
            "strong_skills" => [],
            "skills_to_improve" => [],
            "missing_skills" => [],
            "priority_skills" => []
        ],

        "career_paths" => $analysis["career_paths"] ?? [],

        "roadmap" => $analysis["roadmap"] ?? [],

        "recommendations" => $analysis["recommendations"] ?? []
    ];


    /*
    |--------------------------------------------------------------------------
    | FORCE OBJECTIVE SCORE
    |--------------------------------------------------------------------------
    |
    | The database score is the authoritative rule-based
    | employability score. This prevents the UI from displaying
    | an AI-generated score that differs from our actual calculation.
    |
    */

    $data["employability"]["score"] =
        (float) $assessment["score"];

    sendResponse(
        true,
        "Latest AI analysis retrieved successfully.",
        $data
    );


} catch (PDOException $e) {

    error_log(
        "AI Analysis Result Database Error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "A database error occurred while retrieving the AI analysis.",
        null,
        500
    );

} catch (Throwable $e) {

    error_log(
        "AI Analysis Result Error: " .
        $e->getMessage()
    );

    sendResponse(
        false,
        "An unexpected error occurred while retrieving the AI analysis.",
        null,
        500
    );
}

