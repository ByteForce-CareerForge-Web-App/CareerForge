<?php

header("Content-Type: application/json");

$key = getenv("OPENAI_API_KEY");

echo json_encode([
    "success" => true,
    "key_detected" => !empty($key),
    "key_length" => $key ? strlen($key) : 0
]);

