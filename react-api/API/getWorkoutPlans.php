<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'db_connect.php';

$response = ['success' => false, 'message' => '', 'data' => []];

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('User ID is required');
    }

    $userId = intval($_GET['user_id']);

    // Fetch all workout plans for the user
    $stmt = $conn->prepare("
        SELECT id, title, goal, created_at 
        FROM workout_plans 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $plans = [];
    while ($row = $result->fetch_assoc()) {
        $plans[] = $row;
    }
    $stmt->close();

    $response['success'] = true;
    $response['message'] = 'Workout plans retrieved successfully';
    $response['data'] = $plans;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>
