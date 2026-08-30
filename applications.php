<?php

header("Content-Type: application/json");

$applications = [
    [
        "id" => 1,
        "student_id" => 1,
        "opportunity_id" => 1,
        "status" => "pending"
    ],
    [
        "id" => 2,
        "student_id" => 1,
        "opportunity_id" => 3,
        "status" => "reviewed"
    ]
];

echo json_encode([
    "success" => true,
    "data" => $applications
]);

?>