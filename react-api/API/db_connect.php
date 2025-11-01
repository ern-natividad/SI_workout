<?php
$host = "localhost";
$user = "root"; // Default XAMPP user
$password = ""; // Default XAMPP password (often empty)
$dbname = "workout_app"; // Your database name

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// Set headers to allow Cross-Origin Resource Sharing (CORS) from your React app
header("Access-Control-Allow-Origin: *"); 
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Remove the following line when you want to stop outputting connection status
// echo json_encode(["status" => "Database connected successfully"]);
?>