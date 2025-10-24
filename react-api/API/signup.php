<?php
include 'db_connect.php'; 

// response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow POST request
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// kunin yung post data sa react signup.jsx
$data = json_decode(file_get_contents("php://input"), true);

// check if all required fields are present
if (!isset($data['username'], $data['email'], $data['password'], $data['age'], $data['gender'], $data['height_cm'], $data['weight_kg'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

// basic security
$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password_plain = $data['password']; 
$age = (int)$data['age'];
$gender = $conn->real_escape_string($data['gender']);
$height_cm = (float)$data['height_cm'];
$weight_kg = (float)$data['weight_kg'];

// hash password
$password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);

// sql insert statement
$stmt = $conn->prepare("INSERT INTO workout_app.users (username, email, password, age, gender, height_cm, weight_kg) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssisdd", $username, $email, $password_hashed, $age, $gender, $height_cm, $weight_kg);

if ($stmt->execute()) {
    // success response
    http_response_code(201); // created
    echo json_encode(["status" => "success", "message" => "User registered successfully!", "user_id" => $stmt->insert_id]);
} else {
    // error response 
    http_response_code(500); // Internal Server Error
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>