<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false, 'message' => '', 'debug' => $_ENV['DEBUG'] ?? false];

try {
    // Log incoming request for debugging
    error_log('saveWorkoutPlan received: ' . json_encode($data));
    
    // Detailed validation
    if (!isset($data)) {
        throw new Exception('No data received');
    }
    if (!isset($data['user_id'])) {
        throw new Exception('User ID is missing from request');
    }
    if (!isset($data['exercises'])) {
        throw new Exception('Exercises array is missing from request');
    }
    if (empty($data['exercises'])) {
        throw new Exception('Exercises array is empty');
    }
    if (!is_array($data['exercises'])) {
        throw new Exception('Exercises must be an array');
    }

    $userId = $data['user_id'];
    $title = $data['title'] ?? 'My Workout Plan';
    $goal = $data['goal'] ?? 'Custom workout plan';

    // Ensure a default category exists for exercises (do this BEFORE transaction)
    $stmt = $conn->prepare("SELECT id FROM categories LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $categoryId = null;
    if ($result->num_rows > 0) {
        $categoryId = $result->fetch_assoc()['id'];
    } else {
        // Create a default category if none exists
        $stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES ('General', 'General exercises')");
        if (!$stmt->execute()) {
            throw new Exception('Failed to create default category: ' . $conn->error);
        }
        $categoryId = $conn->insert_id;
    }
    $stmt->close();
    
    error_log('Using category_id: ' . $categoryId);

    // Start transaction
    $conn->begin_transaction();

    // 1. Create a new workout plan
    $stmt = $conn->prepare("INSERT INTO workout_plans (user_id, title, goal) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $userId, $title, $goal);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create workout plan: ' . $conn->error);
    }
    
    $planId = $conn->insert_id;
    $stmt->close();

    // 2. Add exercises to the plan
    foreach ($data['exercises'] as $exercise) {
        // First, check if the exercise already exists
        $stmt = $conn->prepare("
            SELECT id FROM workouts 
            WHERE name = ? AND equipment = ? AND muscle_group = ?
        ");
        $muscleGroup = $exercise['bodyPart'];
        $stmt->bind_param("sss", 
            $exercise['name'], 
            $exercise['equipment'], 
            $muscleGroup
        );
        $stmt->execute();
        $result = $stmt->get_result();
        
        $workoutId = null;
        if ($result->num_rows > 0) {
            // Exercise exists, get its ID
            $workoutId = $result->fetch_assoc()['id'];
        } else {
            // Exercise doesn't exist, create it
            // Note: workouts table doesn't have 'target' column, so we skip it
            $stmt = $conn->prepare("
                INSERT INTO workouts (name, equipment, muscle_group, difficulty, category_id)
                VALUES (?, ?, ?, 'Beginner', ?)
            ") or die($conn->error);
            
            $stmt->bind_param("sssi", 
                $exercise['name'], 
                $exercise['equipment'],
                $muscleGroup,
                $categoryId
            );
            
            if (!$stmt->execute()) {
                throw new Exception('Failed to add exercise: ' . $conn->error);
            }
            $workoutId = $conn->insert_id;
        }
        $stmt->close();

        // Add exercise to plan_workouts
        $stmt = $conn->prepare("
            INSERT INTO plan_workouts (plan_id, workout_id, day_of_week, sets, reps)
            VALUES (?, ?, 'Monday', 3, 10)
        ") or die($conn->error);
        
        $stmt->bind_param("ii", $planId, $workoutId);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to add exercise to plan: ' . $conn->error);
        }
        $stmt->close();
    }

    // Commit transaction
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Workout plan saved successfully';
    $response['plan_id'] = $planId;

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollback();
    }
    $response['message'] = $e->getMessage();
    error_log('saveWorkoutPlan error: ' . $e->getMessage());
    http_response_code(400);
}

echo json_encode($response);
?>
