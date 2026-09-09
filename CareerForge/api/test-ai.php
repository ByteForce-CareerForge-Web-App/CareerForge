<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";
require_once __DIR__ . "/config/database.php";
$gemini = require __DIR__ . "/config/gemini.php";

$apiKey = $gemini["api_key"];
$model = $gemini["model"];

if (!$apiKey) {
    echo json_encode([
        "success" => false,
        "message" => "Gemini API key is missing."
    ]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/"
     . urlencode($model)
     . ":generateContent";

$data = [
    "contents" => [
        [
            "parts" => [
                [
                    "text" => "You are CareerForge AI. Give a short career tip to a university student."
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
                ]
            ],
            "required" => ["response"]
        ]
    ]
];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-goog-api-key: " . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($result === false) {
    echo json_encode([
        "success" => false,
        "message" => "cURL error: " . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$response = json_decode($result, true);

if ($httpCode !== 200) {
    echo json_encode([
        "success" => false,
        "http_code" => $httpCode,
        "gemini_response" => $response
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "http_code" => $httpCode,
    "gemini_response" => $response
]);