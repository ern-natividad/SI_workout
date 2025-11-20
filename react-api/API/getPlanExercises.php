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
    if (!isset($_GET['plan_id'])) {
        throw new Exception('Plan ID is required');
    }

    $planId = intval($_GET['plan_id']);

    // Fetch all exercises for the workout plan
    $stmt = $conn->prepare("
        SELECT w.id, w.name, w.equipment, w.muscle_group as bodyPart, w.difficulty,
               pw.sets, pw.reps, pw.day_of_week
        FROM plan_workouts pw
        JOIN workouts w ON pw.workout_id = w.id
        WHERE pw.plan_id = ?
        ORDER BY pw.id ASC
    ");
    
    $stmt->bind_param("i", $planId);
    $stmt->execute();
    $result = $stmt->get_result();

    $exercises = [];
    while ($row = $result->fetch_assoc()) {
        $exercises[] = $row;
    }
    $stmt->close();

    $response['success'] = true;
    $response['message'] = 'Exercises retrieved successfully';
    $response['data'] = $exercises;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>
