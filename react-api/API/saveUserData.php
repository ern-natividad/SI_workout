<?php
// Includes the database connection ($conn) and sets CORS headers
include 'db_connect.php'; 

// --- Response Headers ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle OPTIONS request for preflight check
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🛑 Only proceed with POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Only POST is accepted.']);
    exit();
}

// Get the JSON data from the request body
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// 🔍 Validation and Data Retrieval
// NOTE: In a real app, you would get the user_id from a session or JWT token, not the POST body.
// We are expecting a user_id from the React app (or a placeholder for now).
if ($data === null || 
    !isset($data['height'], $data['weight'], $data['age'], $data['gender'])) {
    
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required fields (height, weight, age, gender).']);
    exit();
}

// --- TODO: REPLACE THIS WITH ACTUAL USER ID RETRIEVAL ---
// In a real application, you would ensure the user is logged in and retrieve their ID from a JWT or session.
// For this script to work now, we'll use a placeholder user_id=1.
$user_id = 1; 
if (isset($data['user_id'])) {
    $user_id = (int)$data['user_id'];
}
// --------------------------------------------------------

// Sanitize and validate data
$height = (int)$data['height'];
$weight = (float)$data['weight'];
$age    = (int)$data['age'];
$gender = $conn->real_escape_string($data['gender']); // Gender is fine as a string

// Final sanity check on values
if ($height <= 0 || $weight <= 0 || $age <= 0 || empty($gender) || $user_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid values provided for demographic data or user ID.']);
    exit();
}

// 6. UPDATE DATA IN MYSQL USING PREPARED STATEMENT
try {
    // SQL query to update the existing user's record
    $sql = "UPDATE users 
            SET height_cm = ?, weight_kg = ?, age = ?, gender = ? 
            WHERE id = ?";
            
    $stmt = $conn->prepare($sql);
    
    // Bind parameters: 'd' for float (weight_kg), 'i' for integer (height, age, id), 's' for string (gender)
    $stmt->bind_param("diisi", $weight, $height, $age, $gender, $user_id);

    if ($stmt->execute()) {
        // Check if a row was actually changed
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'User profile updated successfully.',
                'user_id' => $user_id
            ]);
        } else {
            // This case means the user_id exists but the data sent was identical, or the user_id did not exist.
             http_response_code(200); // Still 200, as the state is correct, but message reflects no change
            echo json_encode([
                'success' => true, 
                'message' => 'No changes made or user profile not found. User ID: ' . $user_id,
            ]);
        }
    } else {
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Database update failed: ' . $stmt->error]);
    }

    $stmt->close();

} catch (Exception $e) {
    error_log("SQL Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
}

$conn->close();
?>