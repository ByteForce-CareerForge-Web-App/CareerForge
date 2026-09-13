<?php

header("Content-Type: application/json");

$config = require_once __DIR__ . "/config/gemini.php";

$apiKey = $config["api_key"];
$model = $config["model"];

if (empty($apiKey)) {
    echo json_encode([
        "success" => false,
        "message" => "GEMINI_API_KEY is not available."
    ]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/"
    . $model
    . ":generateContent";

$data = [
    "contents" => [
        [
            "parts" => [
                [
                    "text" => "Say exactly: CareerForge Gemini connection successful."
                ]
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

    CURLOPT_POSTFIELDS => json_encode($data),

    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$curlError = curl_error($ch);

curl_close($ch);

if ($curlError) {

    echo json_encode([
        "success" => false,
        "message" => "cURL error",
        "error" => $curlError
    ]);

    exit;
}

$responseData = json_decode($response, true);

if ($httpCode >= 400) {

    echo json_encode([
        "success" => false,
        "http_code" => $httpCode,
        "gemini_response" => $responseData
    ]);

    exit;
}

$outputText = "";

if (isset($responseData["candidates"])) {

    foreach ($responseData["candidates"] as $candidate) {

        if (
            isset($candidate["content"]["parts"])
            && is_array($candidate["content"]["parts"])
        ) {

            foreach ($candidate["content"]["parts"] as $part) {

                if (isset($part["text"])) {
                    $outputText .= $part["text"];
                }
            }
        }
    }
}

echo json_encode([
    "success" => true,
    "http_code" => $httpCode,
    "model" => $model,
    "message" => $outputText
]);

