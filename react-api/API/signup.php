<?php
// Include the database connection file (assuming it defines $conn)
include 'db_connect.php'; 

// --- Response Headers for CORS ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get post data from the React frontend (JSON format)
$data = json_decode(file_get_contents("php://input"), true);

// --- 1. Validation: Check only for the 3 required fields ---
if (!isset($data['username'], $data['email'], $data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Missing required fields (username, email, password)."]);
    exit();
}

// --- 2. Sanitize Data ---
$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password_plain = $data['password']; 
// Removed $age, $gender, $height_cm, $weight_kg

// --- 3. Security: Check if email already exists ---
// NOTE: Assuming your database name is 'workout_app' and table is 'users'
$check_stmt = $conn->prepare("SELECT id FROM workout_app.users WHERE email = ? LIMIT 1");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    // Email already in use
    http_response_code(409); // Conflict
    echo json_encode(["status" => "error", "message" => "This email is already registered."]);
    $check_stmt->close();
    $conn->close();
    exit();
}
$check_stmt->close();

// --- 4. Hash the password for storage ---
$password_hashed = password_hash($password_plain, PASSWORD_DEFAULT);

// --- 5. Insert New User into Database (CORRECTED SQL) ---
$stmt = $conn->prepare("INSERT INTO workout_app.users (username, email, password) VALUES (?, ?, ?)");

// 's' for string (3 strings: username, email, hashed password)
$stmt->bind_param("sss", $username, $email, $password_hashed);

if ($stmt->execute()) {
    // Success response
    http_response_code(201); // Created
    echo json_encode(["status" => "success", "message" => "User registered successfully!", "user_id" => $conn->insert_id]);
} else {
    // Error response 
    http_response_code(500); // Internal Server Error
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>