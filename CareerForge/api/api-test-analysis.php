<?php

header("Content-Type: application/json");

require_once __DIR__ . "/config/cors.php";

$token = $_GET["token"] ?? "";

if ($token === "") {
    echo json_encode([
        "success" => false,
        "message" => "Add your login token as ?token=YOUR_TOKEN"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Forward the request to ai-analysis.php
|--------------------------------------------------------------------------
*/

$url = "http://localhost/CareerForge/api/ai-analysis.php";

$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,

    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer " . $token
    ],

    CURLOPT_POSTFIELDS => json_encode([
        "target_role" => "Software Developer"
    ]),

    CURLOPT_TIMEOUT => 60
]);

$response = curl_exec($ch);

$error = curl_error($ch);

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

if ($response === false) {

    echo json_encode([
        "success" => false,
        "message" => "Request failed.",
        "error" => $error
    ]);

    exit;
}

echo $response;