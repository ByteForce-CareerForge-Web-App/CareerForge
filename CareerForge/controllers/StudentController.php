<?php

$_POST['full_name'];
$_POST['email'];
$_POST['password'];
$_POST['student_number'];
$_POST['qualification'];
$_POST['year_of_study'];
$_POST['campus'];




?>

<?php

require_once "../database/database.php";
require_once "../models/Student.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit("Invalid request.");
}

if ($_POST["action"] !== "register") {
    exit("Invalid action.");
}

$fullName = trim($_POST["full_name"]);
$email = trim($_POST["email"]);
$password = $_POST["password"];
$confirmPassword = $_POST["confirm_password"];
$studentNumber = trim($_POST["student_number"]);
$qualification = trim($_POST["qualification"]);
$yearOfStudy = $_POST["year_of_study"];
$campus = trim($_POST["campus"]);

if ($password !== $confirmPassword) {
    exit("Passwords do not match.");
}

if (strlen($password) < 8) {
    exit("Password must be at least 8 characters.");
}

$database = new Database();
$db = $database->connect();

$student = new Student($db);

$result = $student->register(
    $fullName,
    $email,
    $password,
    $studentNumber,
    $qualification,
    $yearOfStudy,
    $campus
);

if ($result) {

    header("Location: ../../student-dashboard.html");
    exit();

} else {

    echo "Registration failed.";

}