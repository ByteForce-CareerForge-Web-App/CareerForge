
<?php

header("Content-Type: application/json");

echo json_encode([
    "gemini_exists" => getenv("GEMINI_API_KEY") !== false,
    "gemini_empty" => empty(getenv("GEMINI_API_KEY")),
    "gemini_length" => strlen(getenv("GEMINI_API_KEY") ?: "")
]);

