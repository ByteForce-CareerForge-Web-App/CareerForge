<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";

$openaiConfig = require __DIR__ . "/config/openai.php";

$response = [
    "success" => false,
    "message" => ""
];

try {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    $headers = getallheaders();
    $authorization = $headers["Authorization"] ?? "";

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Authentication token is required."
        ]);

        exit;
    }

    $token = trim($matches[1]);
    $tokenHash = hash("sha256", $token);

    $tokenStmt = $pdo->prepare("
        SELECT user_id
        FROM api_tokens
        WHERE token_hash = ?
        AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
    ");

    $tokenStmt->execute([$tokenHash]);

    $tokenData = $tokenStmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenData) {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired authentication token."
        ]);

        exit;
    }

    $userId = (int) $tokenData["user_id"];


    /*
    |--------------------------------------------------------------------------
    | STUDENT CHECK
    |--------------------------------------------------------------------------
    */

    $studentStmt = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            sp.qualification,
            sp.year_of_study,
            sp.graduation_year,
            sp.campus,
            sp.bio,
            sp.current_company,
            sp.current_position
        FROM users u
        INNER JOIN student_profiles sp
            ON sp.user_id = u.id
        WHERE u.id = ?
        AND u.role = 'student'
        LIMIT 1
    ");

    $studentStmt->execute([$userId]);

    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Student profile could not be found."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | REQUEST DATA
    |--------------------------------------------------------------------------
    */

    $input = json_decode(file_get_contents("php://input"), true);

    $area = trim($input["area"] ?? "");

    $allowedAreas = [
        "personal",
        "summary",
        "skills",
        "education",
        "experience",
        "projects"
    ];

    if (!in_array($area, $allowedAreas, true)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid CV improvement area."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | GET STUDENT SKILLS
    |--------------------------------------------------------------------------
    */

    $skillsStmt = $pdo->prepare("
        SELECT
            s.name,
            us.level
        FROM user_skills us
        INNER JOIN skills s
            ON s.id = us.skill_id
        WHERE us.user_id = ?
        ORDER BY s.name ASC
    ");

    $skillsStmt->execute([$userId]);

    $skills = $skillsStmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | GET CAREER GOALS
    |--------------------------------------------------------------------------
    */

    $goalsStmt = $pdo->prepare("
        SELECT cg.name
        FROM student_career_goals scg
        INNER JOIN student_profiles sp
            ON sp.id = scg.student_profile_id
        INNER JOIN career_goals cg
            ON cg.id = scg.career_goal_id
        WHERE sp.user_id = ?
        ORDER BY cg.name ASC
    ");

    $goalsStmt->execute([$userId]);

    $goals = $goalsStmt->fetchAll(PDO::FETCH_COLUMN);


    /*
    |--------------------------------------------------------------------------
    | GET PROJECTS
    |--------------------------------------------------------------------------
    */

    $projectsStmt = $pdo->prepare("
        SELECT
            title,
            description,
            github_url
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
    ");

    $projectsStmt->execute([$userId]);

    $projects = $projectsStmt->fetchAll(PDO::FETCH_ASSOC);


    /*
    |--------------------------------------------------------------------------
    | CV AREA LABEL
    |--------------------------------------------------------------------------
    */

    $areaLabels = [
        "personal" => "Personal Information",
        "summary" => "Professional Summary",
        "skills" => "Skills",
        "education" => "Education",
        "experience" => "Experience",
        "projects" => "Projects & Achievements"
    ];

    $areaLabel = $areaLabels[$area];


    /*
    |--------------------------------------------------------------------------
    | OPENAI API KEY
    |--------------------------------------------------------------------------
    */

    $apiKey = trim($openaiConfig["api_key"] ?? "");
    $model = $openaiConfig["model"] ?? "gpt-5.6-luna";

    if ($apiKey === "") {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "OpenAI API key is not configured on the server."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | BUILD AI PROMPT
    |--------------------------------------------------------------------------
    */

    $studentData = json_encode([
        "name" => $student["name"],
        "qualification" => $student["qualification"],
        "year_of_study" => $student["year_of_study"],
        "graduation_year" => $student["graduation_year"],
        "campus" => $student["campus"],
        "bio" => $student["bio"],
        "current_company" => $student["current_company"],
        "current_position" => $student["current_position"],
        "skills" => $skills,
        "career_goals" => $goals,
        "projects" => $projects
    ], JSON_PRETTY_PRINT);


    $prompt = "
You are CareerForge AI, an expert graduate career and CV coach.

You are helping a university student improve one specific section of their CV.

CV SECTION TO IMPROVE:
{$areaLabel}

STUDENT INFORMATION:
{$studentData}

Your job is to provide practical, truthful and personalised CV guidance.

Important rules:

1. Do not invent qualifications, jobs, companies, achievements, projects or skills.
2. Only use information provided about the student.
3. If information is missing, explain what the student should add rather than making it up.
4. Keep the advice appropriate for a university student or recent graduate.
5. Make the suggested wording professional and suitable for a real CV.
6. Do not exaggerate the student's experience.
7. Focus specifically on the selected CV section.

Return ONLY valid JSON using exactly this structure:

{
    \"recommendation\": \"Short explanation of what should be improved.\",
    \"suggested_version\": \"A professional example the student could use or adapt.\",
    \"why_better\": \"Explain why this version is stronger.\",
    \"actionable_tips\": [
        \"Tip 1\",
        \"Tip 2\",
        \"Tip 3\"
    ]
}
";


    /*
    |--------------------------------------------------------------------------
    | CALL OPENAI RESPONSES API
    |--------------------------------------------------------------------------
    */

    $requestBody = [
        "model" => $model,
        "input" => $prompt,
        "store" => false
    ];

    $ch = curl_init("https://api.openai.com/v1/responses");

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer " . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($requestBody),
        CURLOPT_TIMEOUT => 60
    ]);

    $apiResponse = curl_exec($ch);

    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);


    if ($apiResponse === false || $curlError) {
        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" => "Unable to connect to the AI service."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | HANDLE OPENAI ERROR
    |--------------------------------------------------------------------------
    */

    $openaiData = json_decode($apiResponse, true);

    if ($httpCode < 200 || $httpCode >= 300) {

        $errorMessage =
            $openaiData["error"]["message"]
            ?? "The AI service returned an error.";

        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" => $errorMessage
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | EXTRACT OUTPUT TEXT
    |--------------------------------------------------------------------------
    */

    $outputText = "";

    if (isset($openaiData["output"]) && is_array($openaiData["output"])) {

        foreach ($openaiData["output"] as $outputItem) {

            if (
                isset($outputItem["content"])
                && is_array($outputItem["content"])
            ) {

                foreach ($outputItem["content"] as $contentItem) {

                    if (
                        isset($contentItem["type"])
                        && $contentItem["type"] === "output_text"
                        && isset($contentItem["text"])
                    ) {
                        $outputText .= $contentItem["text"];
                    }
                }
            }
        }
    }


    if ($outputText === "") {
        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" => "The AI service returned an empty response."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | PARSE AI JSON
    |--------------------------------------------------------------------------
    */

    $aiResult = json_decode(trim($outputText), true);

    if (!is_array($aiResult)) {

        $cleanText = trim($outputText);

        $cleanText = preg_replace('/^```json\s*/i', '', $cleanText);
        $cleanText = preg_replace('/\s*```$/', '', $cleanText);

        $aiResult = json_decode(trim($cleanText), true);
    }


    if (!is_array($aiResult)) {
        http_response_code(502);

        echo json_encode([
            "success" => false,
            "message" => "The AI returned an invalid response."
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "area" => $area,
        "area_label" => $areaLabel,
        "recommendation" => $aiResult["recommendation"] ?? "",
        "suggested_version" => $aiResult["suggested_version"] ?? "",
        "why_better" => $aiResult["why_better"] ?? "",
        "actionable_tips" => $aiResult["actionable_tips"] ?? []
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "An unexpected server error occurred."
    ]);
}
?>
