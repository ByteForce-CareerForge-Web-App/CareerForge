<?php

header("Content-Type: application/json");

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

try {

    /*
    |--------------------------------------------------------------------------
    | Authenticate Alumni
    |--------------------------------------------------------------------------
    */

    $user = getAuthenticatedUser($pdo);

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication required"
        ]);

        exit;
    }

    if (($user["role"] ?? "") !== "alumni") {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" =>
                "Only alumni can access the alumni AI analysis."
        ]);

        exit;
    }

    $userId = (int) $user["id"];

    /*
    |--------------------------------------------------------------------------
    | Get Latest Alumni Assessment
    |--------------------------------------------------------------------------
    |
    | ai_assessments is already linked to users through user_id.
    | We only retrieve the currently authenticated alumni's record.
    |
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

    $assessment = $stmt->fetch();

    /*
    |--------------------------------------------------------------------------
    | No Analysis Yet
    |--------------------------------------------------------------------------
    */

    if (!$assessment) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" =>
                "No alumni career analysis has been generated yet."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Decode Saved AI Analysis
    |--------------------------------------------------------------------------
    */

    $analysis = json_decode(
        $assessment["analysis"],
        true
    );

    if (
        !is_array($analysis) ||
        json_last_error() !== JSON_ERROR_NONE
    ) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "The saved alumni AI analysis is invalid."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Database Metadata
    |--------------------------------------------------------------------------
    */

    $analysis["assessment_id"] =
        (int) $assessment["id"];

    $analysis["target_role"] =
        $analysis["target_role"]
        ?? $assessment["target_role"];

    $analysis["score"] =
        isset($analysis["employability"]["score"])
            ? (float) $analysis["employability"]["score"]
            : (float) $assessment["score"];

    $analysis["created_at"] =
        $assessment["created_at"];

    /*
    |--------------------------------------------------------------------------
    | Ensure Required Structures Exist
    |--------------------------------------------------------------------------
    */

    if (!isset($analysis["employability"])) {
        $analysis["employability"] = [];
    }

    if (!isset($analysis["skill_gap"])) {
        $analysis["skill_gap"] = [];
    }

    if (!isset($analysis["career_paths"])) {
        $analysis["career_paths"] = [];
    }

    if (!isset($analysis["roadmap"])) {
        $analysis["roadmap"] = [];
    }

    if (!isset($analysis["recommendations"])) {
        $analysis["recommendations"] = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Safe Defaults
    |--------------------------------------------------------------------------
    */

    $analysis["employability"]["score"] =
        (float) (
            $analysis["employability"]["score"]
            ?? $assessment["score"]
            ?? 0
        );

    $analysis["employability"]["level"] =
        $analysis["employability"]["level"]
        ?? (
            $analysis["employability"]["score"] >= 80
                ? "Career Ready"
                : (
                    $analysis["employability"]["score"] >= 60
                        ? "Nearly Ready"
                        : "Developing"
                )
        );

    $analysis["employability"]["overall_assessment"] =
        $analysis["employability"]["overall_assessment"]
        ?? "";

    $analysis["employability"]["strengths"] =
        is_array(
            $analysis["employability"]["strengths"] ?? null
        )
            ? $analysis["employability"]["strengths"]
            : [];

    $analysis["employability"]["weaknesses"] =
        is_array(
            $analysis["employability"]["weaknesses"] ?? null
        )
            ? $analysis["employability"]["weaknesses"]
            : [];

    $analysis["employability"]["score_factors"] =
        is_array(
            $analysis["employability"]["score_factors"] ?? null
        )
            ? $analysis["employability"]["score_factors"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Skill Gap Defaults
    |--------------------------------------------------------------------------
    */

    $analysis["skill_gap"]["existing_skills"] =
        is_array(
            $analysis["skill_gap"]["existing_skills"] ?? null
        )
            ? $analysis["skill_gap"]["existing_skills"]
            : [];

    $analysis["skill_gap"]["strong_skills"] =
        is_array(
            $analysis["skill_gap"]["strong_skills"] ?? null
        )
            ? $analysis["skill_gap"]["strong_skills"]
            : [];

    $analysis["skill_gap"]["skills_to_improve"] =
        is_array(
            $analysis["skill_gap"]["skills_to_improve"] ?? null
        )
            ? $analysis["skill_gap"]["skills_to_improve"]
            : [];

    $analysis["skill_gap"]["missing_skills"] =
        is_array(
            $analysis["skill_gap"]["missing_skills"] ?? null
        )
            ? $analysis["skill_gap"]["missing_skills"]
            : [];

    $analysis["skill_gap"]["priority_skills"] =
        is_array(
            $analysis["skill_gap"]["priority_skills"] ?? null
        )
            ? $analysis["skill_gap"]["priority_skills"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Career Paths
    |--------------------------------------------------------------------------
    */

    $analysis["career_paths"] =
        is_array($analysis["career_paths"])
            ? $analysis["career_paths"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Roadmap
    |--------------------------------------------------------------------------
    */

    $analysis["roadmap"] =
        is_array($analysis["roadmap"])
            ? $analysis["roadmap"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Recommendations
    |--------------------------------------------------------------------------
    */

    $analysis["recommendations"] =
        is_array($analysis["recommendations"])
            ? $analysis["recommendations"]
            : [];

    /*
    |--------------------------------------------------------------------------
    | Return Result
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "message" =>
            "Alumni career analysis retrieved successfully.",
        "data" => $analysis
    ]);

} catch (PDOException $e) {

    error_log(
        "Alumni AI Result PDO Error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "A database error occurred while retrieving the alumni analysis."
    ]);

} catch (Throwable $e) {

    error_log(
        "Alumni AI Result Error: "
        . $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "An unexpected error occurred while retrieving the alumni analysis."
    ]);
}