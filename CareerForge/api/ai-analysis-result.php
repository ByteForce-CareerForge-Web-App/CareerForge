<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/auth.php";


/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
*/

function sendResponse(
    $success,
    $message,
    $data = null,
    $statusCode = 200
) {
    http_response_code($statusCode);

    $response = [
        "success" => $success,
        "message" => $message
    ];

    if ($data !== null) {
        $response["data"] = $data;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_UNICODE
    );

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
    | GET LATEST SAVED ANALYSIS
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

    $stmt->execute([
        $userId
    ]);

    $assessment = $stmt->fetch(
        PDO::FETCH_ASSOC
    );


    /*
    |--------------------------------------------------------------------------
    | NO ANALYSIS FOUND
    |--------------------------------------------------------------------------
    */

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
    | AI DATA
    |--------------------------------------------------------------------------
    |
    | ai-analysis.php stores Gemini-generated content
    | inside the "ai" object.
    |
    */

    $aiData = $analysis["ai"] ?? [];

    if (!is_array($aiData)) {
        $aiData = [];
    }


    /*
    |--------------------------------------------------------------------------
    | EMPLOYABILITY DATA
    |--------------------------------------------------------------------------
    |
    | The objective score comes from the database and remains
    | authoritative.
    |
    */

    $savedEmployability =
        $analysis["employability"]
        ?? [];

    if (!is_array($savedEmployability)) {
        $savedEmployability = [];
    }


    $employability = [

        "score" =>
            (float) $assessment["score"],

        "level" =>
            $analysis["employability_level"]
            ?? $savedEmployability["level"]
            ?? "",

        "overall_assessment" =>
            $aiData["overall_assessment"]
            ?? $savedEmployability["overall_assessment"]
            ?? "",

        "strengths" =>
            $aiData["strengths"]
            ?? $savedEmployability["strengths"]
            ?? [],

        "weaknesses" =>
            $aiData["weaknesses"]
            ?? $savedEmployability["weaknesses"]
            ?? [],

        "score_factors" =>
            $analysis["score_factors"]
            ?? $savedEmployability["score_factors"]
            ?? []
    ];


    /*
    |--------------------------------------------------------------------------
    | SKILL GAP
    |--------------------------------------------------------------------------
    */

    $skillGap = $analysis["skill_gap"] ?? [];

    if (!is_array($skillGap)) {
        $skillGap = [];
    }


    $skillGap = [

        "existing_skills" =>
            $skillGap["existing_skills"]
            ?? [],

        "strong_skills" =>
            $skillGap["strong_skills"]
            ?? [],

        "skills_to_improve" =>
            $skillGap["skills_to_improve"]
            ?? [],

        "missing_skills" =>
            $skillGap["missing_skills"]
            ?? [],

        "priority_skills" =>
            $skillGap["priority_skills"]
            ?? []
    ];


    /*
    |--------------------------------------------------------------------------
    | CAREER PATHS
    |--------------------------------------------------------------------------
    |
    | Support both the current saved structure and older
    | assessments that may have stored these at the root.
    |
    */

    $careerPaths =
        $analysis["career_paths"]
        ?? $aiData["career_paths"]
        ?? [];

    if (!is_array($careerPaths)) {
        $careerPaths = [];
    }


    /*
    |--------------------------------------------------------------------------
    | ROADMAP
    |--------------------------------------------------------------------------
    */

    $roadmap =
        $analysis["roadmap"]
        ?? $aiData["roadmap"]
        ?? [];

    if (!is_array($roadmap)) {
        $roadmap = [];
    }


    /*
    |--------------------------------------------------------------------------
    | RECOMMENDATIONS
    |--------------------------------------------------------------------------
    */

    $recommendations =
        $analysis["recommendations"]
        ?? $aiData["recommendations"]
        ?? [];

    if (!is_array($recommendations)) {
        $recommendations = [];
    }


    /*
    |--------------------------------------------------------------------------
    | OPPORTUNITY MATCHES
    |--------------------------------------------------------------------------
    */

    $opportunityMatches =
        $analysis["opportunity_matches"]
        ?? [];

    if (!is_array($opportunityMatches)) {
        $opportunityMatches = [];
    }


    /*
    |--------------------------------------------------------------------------
    | FINAL RESPONSE
    |--------------------------------------------------------------------------
    */

    $data = [

        "assessment_id" =>
            (int) $assessment["id"],

        "target_role" =>
            $assessment["target_role"],

        "score" =>
            (float) $assessment["score"],

        "created_at" =>
            $assessment["created_at"],

        "employability" =>
            $employability,

        "skill_gap" =>
            $skillGap,

        "opportunity_matches" =>
            $opportunityMatches,

        "career_paths" =>
            $careerPaths,

        "roadmap" =>
            $roadmap,

        "recommendations" =>
            $recommendations
    ];


    /*
    |--------------------------------------------------------------------------
    | FORCE DATABASE SCORE
    |--------------------------------------------------------------------------
    |
    | Never allow the frontend to display a different score
    | from the authoritative database score.
    |
    */

    $data["score"] =
        (float) $assessment["score"];

    $data["employability"]["score"] =
        (float) $assessment["score"];


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

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

