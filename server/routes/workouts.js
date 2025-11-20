import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Middleware to verify auth token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token'
    });
  }

  req.token = authHeader.substring(7);
  next();
};

// Get all workout plans for a user
router.get('/plans', verifyToken, async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const [plans] = await pool.query(
      'SELECT id, title, goal, end_at, created_at FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exercises for a specific plan
router.get('/exercises', verifyToken, async (req, res) => {
  try {
    const planId = req.query.plan_id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'plan_id is required'
      });
    }

    const [exercises] = await pool.query(
      `SELECT w.id, w.name, w.equipment, w.muscle_group, w.difficulty, 
              pw.sets, pw.reps, pw.day_of_week
       FROM plan_workouts pw
       JOIN workouts w ON pw.workout_id = w.id
       WHERE pw.plan_id = ?
       ORDER BY pw.day_of_week`,
      [planId]
    );

    res.json({
      success: true,
      exercises: exercises
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Save a new workout plan
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { user_id, plan_title, goal, exercises } = req.body;
    
    console.log('Received workout save request:', {
      user_id,
      plan_title,
      goal,
      exercisesCount: exercises?.length,
      fullBody: req.body
    });

    // Validate each required field
    const missingFields = [];
    if (!user_id) missingFields.push('user_id');
    if (!plan_title) missingFields.push('plan_title');
    if (!exercises) missingFields.push('exercises');
    if (exercises && exercises.length === 0) missingFields.push('exercises (empty)');

    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create workout plan
      const [planResult] = await connection.query(
        'INSERT INTO workout_plans (user_id, title, goal) VALUES (?, ?, ?)',
        [user_id, plan_title, goal || 'General']
      );

      const planId = planResult.insertId;

      // Process each exercise
      for (const exercise of exercises) {
        const { name, equipment, bodyPart, difficulty, sets, reps, day_of_week, weight_type } = exercise;

        // Get or create category
        const categoryName = weight_type === 'bodyweight' ? 'Bodyweight' : 'Weighted';
        let [categories] = await connection.query(
          'SELECT id FROM categories WHERE name = ?',
          [categoryName]
        );

        let categoryId;
        if (categories.length === 0) {
          const [categoryResult] = await connection.query(
            'INSERT INTO categories (name) VALUES (?)',
            [categoryName]
          );
          categoryId = categoryResult.insertId;
        } else {
          categoryId = categories[0].id;
        }

        // Get or create workout (note: database uses muscle_group, not bodyPart)
        let [workouts] = await connection.query(
          'SELECT id FROM workouts WHERE name = ? AND equipment = ?',
          [name, equipment]
        );

        let workoutId;
        if (workouts.length === 0) {
          const [workoutResult] = await connection.query(
            'INSERT INTO workouts (name, equipment, muscle_group, difficulty, category_id) VALUES (?, ?, ?, ?, ?)',
            [name, equipment, bodyPart, difficulty, categoryId]
          );
          workoutId = workoutResult.insertId;
        } else {
          workoutId = workouts[0].id;
        }

        // Link to plan
        await connection.query(
          'INSERT INTO plan_workouts (plan_id, workout_id, sets, reps, day_of_week) VALUES (?, ?, ?, ?, ?)',
          [planId, workoutId, sets || 3, reps || 10, day_of_week || 1]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'Workout plan saved successfully',
        plan_id: planId
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Save plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// Mark workout as complete and create new plan
router.post('/complete', verifyToken, async (req, res) => {
  try {
    const { user_id, plan_id, completed_exercises, completed_at } = req.body;

    if (!user_id || !plan_id || !completed_exercises) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, plan_id, completed_exercises'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update plan status to completed with end_at timestamp
      await connection.query(
        'UPDATE workout_plans SET end_at = ? WHERE id = ?',
        [completed_at || new Date(), plan_id]
      );

      // Save exercise progress for each completed exercise
      for (const exercise of completed_exercises) {
        const { name, sets_completed } = exercise;

        // Find workout ID from name
        const [workouts] = await connection.query(
          'SELECT id FROM workouts WHERE name = ?',
          [name]
        );

        if (workouts.length > 0) {
          await connection.query(
            'INSERT INTO progress (user_id, workout_id, sets_completed, completed_at) VALUES (?, ?, ?, ?)',
            [user_id, workouts[0].id, sets_completed, completed_at || new Date()]
          );
        }
      }

      // Do not auto-create a new plan. The user should create new plans manually.

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Workout completed and new plan created!'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
