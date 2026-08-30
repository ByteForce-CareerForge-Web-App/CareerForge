<?php
//showing whoever is calling the API that i am sending JSON
header("Content-Type: application/json");

//Creates temporary data ( here we just going to pretend as if it came from a database)
//the id title they create information about one opportunity so the database will contain this information
$opportunities = [
    [
        "id" => 1,
        "title" => "Junior Software Developer",
        "company" => "TechNova",
        "location" => "Johannesburg",
        "type" => "Full-time",
        "description" => "Entry-level software development position for recent graduates.",
        "skills" => ["JavaScript", "PHP", "SQL"]
    ],
    [
        "id" => 2,
        "title" => "Software Developer Intern",
        "company" => "Digital Solutions",
        "location" => "Pretoria",
        "type" => "Internship",
        "description" => "Software development internship for IT students and graduates.",
        "skills" => ["JavaScript", "Git", "HTML", "CSS"]
    ],
    [
        "id" => 3,
        "title" => "Junior Web Developer",
        "company" => "WebWorks",
        "location" => "Cape Town",
        "type" => "Full-time",
        "description" => "Junior role working on modern web applications.",
        "skills" => ["PHP", "JavaScript", "MySQL"]
    ]
];

//converts the php arrays into JSON 
echo json_encode([
    "success" => true,
    "data" => $opportunities
]);

?>