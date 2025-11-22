<?php
include 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user_id = 1;
if (isset($_GET['user_id'])) {
    $user_id = (int)$_GET['user_id'];
}

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user_id']);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT id, username, email, height_cm, weight_kg, age, gender FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}

$conn->close();
?>
