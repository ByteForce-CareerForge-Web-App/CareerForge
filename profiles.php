<?php

header("Content-Type: application/json");

$profiles = [
    [
        "id" => 1,
        "name" => "Sarah Mokoena",
        "role" => "student",
        "programme" => "BSc Information Technology",
        "skills" => ["JavaScript", "PHP", "SQL"],
        "career_goal" => "Software Developer"
    ],
    [
        "id" => 2,
        "name" => "John Dlamini",
        "role" => "alumni",
        "programme" => "BSc Information Technology",
        "skills" => ["Java", "Python", "SQL"],
        "career_goal" => "Software Engineer"
    ]
];

echo json_encode([
    "success" => true,
    "data" => $profiles
]);

?>