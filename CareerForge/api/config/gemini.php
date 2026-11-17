<?php

$apiKey = getenv("GEMINI_API_KEY");

return [
    "api_key" => $apiKey !== false ? trim($apiKey) : "",
    "model" => "gemini-3.6-flash",
];

?>

