<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/config/gemini.php";

/*
|--------------------------------------------------------------------------
| Helper: JSON response
|--------------------------------------------------------------------------
*/

function sendResponse($statusCode, $data)
{
    http_response_code($statusCode);

    echo json_encode($data);

    exit;
}


/*
|--------------------------------------------------------------------------
| Helper: Authenticate user
|--------------------------------------------------------------------------
*/

function getAuthenticatedUser($pdo)
{
    $headers = getallheaders();

    $authorization = $headers["Authorization"] ?? "";

    if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
        sendResponse(401, [
            "success" => false,
            "message" => "Authentication token is required"
        ]);
    }

    $token = trim($matches[1]);

    if ($token === "") {
        sendResponse(401, [
            "success" => false,
            "message" => "Authentication token is required"
        ]);
    }

    $tokenHash = hash("sha256", $token);

    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.status
        FROM api_tokens t
        INNER JOIN users u
            ON u.id = t.user_id
        WHERE t.token_hash = ?
          AND t.expires_at > NOW()
        LIMIT 1
    ");

    $stmt->execute([$tokenHash]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(401, [
            "success" => false,
            "message" => "Invalid or expired authentication token"
        ]);
    }

    if ($user["status"] !== "active") {
        sendResponse(403, [
            "success" => false,
            "message" => "This account is not active"
        ]);
    }

    return $user;
}


/*
|--------------------------------------------------------------------------
| Only POST is allowed
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(405, [
        "success" => false,
        "message" => "Method not allowed"
    ]);
}


/*
|--------------------------------------------------------------------------
| Read request
|--------------------------------------------------------------------------
*/

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    sendResponse(400, [
        "success" => false,
        "message" => "Invalid JSON request"
    ]);
}

$message = trim($input["message"] ?? "");

$area = trim($input["area"] ?? "");

if ($message === "") {
    sendResponse(400, [
        "success" => false,
        "message" => "Message is required"
    ]);
}


/*
|--------------------------------------------------------------------------
| Authenticate user
|--------------------------------------------------------------------------
*/

$user = getAuthenticatedUser($pdo);

$userId = (int) $user["id"];


/*
|--------------------------------------------------------------------------
| Only students should use the student AI assistant
|--------------------------------------------------------------------------
*/

if ($user["role"] !== "student") {
    sendResponse(403, [
        "success" => false,
        "message" => "The AI Career Assistant is currently available to students only"
    ]);
}


/*
|--------------------------------------------------------------------------
| Get student profile
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        qualification,
        year_of_study,
        graduation_year,
        campus,
        bio,
        current_company,
        current_position,
        employability_score
    FROM student_profiles
    WHERE user_id = ?
    LIMIT 1
");

$stmt->execute([$userId]);

$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    sendResponse(404, [
        "success" => false,
        "message" => "Student profile not found"
    ]);
}


/*
|--------------------------------------------------------------------------
| Get student's skills
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        s.name,
        us.level
    FROM user_skills us
    INNER JOIN skills s
        ON s.id = us.skill_id
    WHERE us.user_id = ?
    ORDER BY s.name ASC
");

$stmt->execute([$userId]);

$skills = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Get student's career goals
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        cg.name
    FROM student_career_goals scg
    INNER JOIN student_profiles sp
        ON sp.id = scg.student_profile_id
    INNER JOIN career_goals cg
        ON cg.id = scg.career_goal_id
    WHERE sp.user_id = ?
    ORDER BY cg.name ASC
");

$stmt->execute([$userId]);

$careerGoals = $stmt->fetchAll(PDO::FETCH_COLUMN);


/*
|--------------------------------------------------------------------------
| Get student's projects
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        title,
        description,
        github_url
    FROM projects
    WHERE user_id = ?
    ORDER BY id DESC
");

$stmt->execute([$userId]);

$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Prepare student context
|--------------------------------------------------------------------------
*/

$studentContext = [
    "name" => $user["name"],
    "qualification" => $profile["qualification"],
    "year_of_study" => $profile["year_of_study"],
    "graduation_year" => $profile["graduation_year"],
    "campus" => $profile["campus"],
    "bio" => $profile["bio"],
    "current_company" => $profile["current_company"],
    "current_position" => $profile["current_position"],
    "employability_score" => $profile["employability_score"],
    "career_goals" => $careerGoals,
    "skills" => $skills,
    "projects" => $projects
];

$studentJson = json_encode(
    $studentContext,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
);


/*
|--------------------------------------------------------------------------
| Determine AI context
|--------------------------------------------------------------------------
*/

$areaDescriptions = [
    "personal" => "Personal Information",
    "summary" => "Professional Summary",
    "skills" => "Skills",
    "education" => "Education",
    "experience" => "Experience",
    "projects" => "Projects & Achievements"
];

$areaContext = "";

if ($area !== "") {

    if (isset($areaDescriptions[$area])) {
        $areaContext = "
The student is currently working on this CV section:

" . $areaDescriptions[$area] . "

Give advice specifically relevant to this section.
";
    }
}


/*
|--------------------------------------------------------------------------
| Build AI prompt
|--------------------------------------------------------------------------
*/

$prompt = <<<PROMPT

You are CareerForgeAI, an AI-powered career assistant for university
students and graduates.

Your job is to provide practical, personalized career guidance based
on the student's actual CareerForge profile.

IMPORTANT RULES:

1. Use the student's actual information provided below.
2. Do NOT invent qualifications.
3. Do NOT invent skills.
4. Do NOT invent work experience.
5. Do NOT invent companies.
6. Do NOT invent projects or achievements.
7. If information is missing, clearly say that the student has not
   provided that information yet.
8. Do not claim that the student has an employability score if the
   database value is null.
9. Do not create a fake employability percentage.
10. Give practical advice that the student can actually act on.
11. Keep the response appropriate for a university student or recent
    graduate.
12. Do not provide unsafe, discriminatory, or inappropriate advice.

STUDENT PROFILE:

{$studentJson}

{$areaContext}

STUDENT'S QUESTION:

{$message}

Return your answer using exactly this JSON structure:

{
    "response": "Your main answer to the student.",
    "key_points": [
        "Important point 1",
        "Important point 2",
        "Important point 3"
    ],
    "next_steps": [
        "Action the student can take next",
        "Another useful action"
    ]
}

The "response" should be conversational and personalized.

The "key_points" array should contain concise important points.

The "next_steps" array should contain practical actions.

PROMPT;


/*
|--------------------------------------------------------------------------
| Gemini configuration
|--------------------------------------------------------------------------
*/

$geminiConfig = require __DIR__ . "/config/gemini.php";

$apiKey = trim($geminiConfig["api_key"] ?? "");
$model = trim($geminiConfig["model"] ?? "gemini-3.6-flash");

if ($apiKey === "") {
    sendResponse(500, [
        "success" => false,
        "message" => "Gemini API key is not configured"
    ]);
}


/*
|--------------------------------------------------------------------------
| Gemini API request
|--------------------------------------------------------------------------
*/

$url =
    "https://generativelanguage.googleapis.com/v1beta/models/"
    . urlencode($model)
    . ":generateContent";

$requestBody = [
    "contents" => [
        [
            "role" => "user",
            "parts" => [
                [
                    "text" => $prompt
                ]
            ]
        ]
    ],
    "generationConfig" => [
        "responseMimeType" => "application/json",
        "responseSchema" => [
            "type" => "OBJECT",
            "properties" => [
                "response" => [
                    "type" => "STRING"
                ],
                "key_points" => [
                    "type" => "ARRAY",
                    "items" => [
                        "type" => "STRING"
                    ]
                ],
                "next_steps" => [
                    "type" => "ARRAY",
                    "items" => [
                        "type" => "STRING"
                    ]
                ]
            ],
            "required" => [
                "response",
                "key_points",
                "next_steps"
            ]
        ]
    ]
];

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-goog-api-key: " . $apiKey
    ],
    CURLOPT_POSTFIELDS => json_encode($requestBody),
    CURLOPT_TIMEOUT => 60
]);

$geminiResponse = curl_exec($ch);

$curlError = curl_error($ch);

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


/*
|--------------------------------------------------------------------------
| Handle CURL errors
|--------------------------------------------------------------------------
*/

if ($geminiResponse === false || $curlError !== "") {
    sendResponse(502, [
        "success" => false,
        "message" => "Unable to connect to Gemini",
        "error" => $curlError
    ]);
}


/*
|--------------------------------------------------------------------------
| Decode Gemini response
|--------------------------------------------------------------------------
*/

$geminiData = json_decode(
    $geminiResponse,
    true
);

if ($httpCode < 200 || $httpCode >= 300) {

    $geminiMessage =
        $geminiData["error"]["message"]
        ?? "Gemini API request failed";

    sendResponse(502, [
        "success" => false,
        "message" => $geminiMessage,
        "http_code" => $httpCode
    ]);
}


/*
|--------------------------------------------------------------------------
| Extract generated text
|--------------------------------------------------------------------------
*/

$generatedText =
    $geminiData["candidates"][0]["content"]["parts"][0]["text"]
    ?? "";

if ($generatedText === "") {
    sendResponse(502, [
        "success" => false,
        "message" => "Gemini returned an empty response"
    ]);
}


/*
|--------------------------------------------------------------------------
| Decode structured AI response
|--------------------------------------------------------------------------
*/

$aiResponse = json_decode(
    $generatedText,
    true
);

if (!is_array($aiResponse)) {

    sendResponse(502, [
        "success" => false,
        "message" => "Gemini returned invalid JSON"
    ]);
}


/*
|--------------------------------------------------------------------------
| Return response to React Native
|--------------------------------------------------------------------------
*/

sendResponse(200, [
    "success" => true,
    "message" => "AI response generated successfully",
    "response" => $aiResponse["response"] ?? "",
    "key_points" => $aiResponse["key_points"] ?? [],
    "next_steps" => $aiResponse["next_steps"] ?? []
]);

?>