<?php
// Include the database connection setup
include 'db_connect.php'; 

// Set headers (already done in db_connect.php, but good to ensure)
// ... headers for CORS ...

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Get the JSON data sent from the React app
$data = json_decode(file_get_contents("php://input"), true);

// Check if email and password are provided
if (!isset($data['email'], $data['password'])) {
    http_response_code(400); 
    echo json_encode(["status" => "error", "message" => "Missing email or password."]);
    exit();
}

// Sanitize input
$email = $conn->real_escape_string($data['email']);
$password_plain = $data['password']; 

// 2. Prepare the SQL query to fetch user by email
$stmt = $conn->prepare("SELECT id, username, password FROM workout_app.users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    $password_hashed = $user['password'];

    // 3. Verify the password hash
    if (password_verify($password_plain, $password_hashed)) {
        // Login successful
        http_response_code(200); // OK
        
        // **In a real application, you would generate a JWT token here.**
        // For simplicity, we'll return a basic 'token'.
        $token = bin2hex(random_bytes(16)); // Simple token generation 
        
        echo json_encode([
            "status" => "success", 
            "message" => "Login successful.", 
            "username" => $user['username'],
            "token" => $token,
            "user_id" => $user['id']
        ]);
    } else {
        // Password does not match
        http_response_code(401); // Unauthorized
        echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    }
} else {
    // No user found with that email
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
}

$stmt->close();
$conn->close();
?>