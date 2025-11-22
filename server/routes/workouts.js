import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Ensure `deleted_at` column exists on the `progress` table for soft-deletes
(async () => {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM progress LIKE 'deleted_at'");
    if (!cols || cols.length === 0) {
      await pool.query("ALTER TABLE progress ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
      console.log('Added deleted_at column to progress table');
    }
  } catch (err) {
    console.warn('Could not ensure deleted_at column on progress:', err.message);
  }
})();

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
// Public: Get all workout plans for a user (no auth required for dev)
router.get('/plans', async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Some DB dumps may not include the `end_at` column. Detect it and select accordingly.
    const [columns] = await pool.query("SHOW COLUMNS FROM workout_plans");
    const hasEndAt = columns.some((c) => c.Field === 'end_at');

    let plansQuery;
    if (hasEndAt) {
      plansQuery = 'SELECT id, title, goal, end_at, created_at FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC';
    } else {
      plansQuery = 'SELECT id, title, goal, created_at FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC';
    }

    const [plans] = await pool.query(plansQuery, [userId]);

    // Ensure each plan row has an `end_at` property for frontend compatibility
    if (!hasEndAt) {
      plans.forEach((p) => { p.end_at = null; });
    }

    res.json({ success: true, plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exercises for a specific plan (public for dev)
router.get('/exercises', async (req, res) => {
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

        // Link to plan (day_of_week is an enum in the DB; allow NULL when not provided)
        await connection.query(
          'INSERT INTO plan_workouts (plan_id, workout_id, sets, reps, day_of_week) VALUES (?, ?, ?, ?, ?)',
          [planId, workoutId, sets || 3, reps || 10, day_of_week || null]
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


// Record progress for a workout session. If `mark_plan_complete` is true the
// plan will be closed (end_at set). Otherwise only a progress row is inserted.
router.post('/complete', verifyToken, async (req, res) => {
  try {
    const { user_id, plan_id, completed_at, mark_plan_complete } = req.body;
    console.log('POST /api/workouts/complete called with:', { user_id, plan_id, mark_plan_complete });

    if (!user_id || !plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, plan_id'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Optionally close the plan when requested by the client
      if (mark_plan_complete) {
        await connection.query(
          'UPDATE workout_plans SET end_at = ? WHERE id = ?',
          [completed_at || new Date(), plan_id]
        );
      }

      // Save a single progress entry for this session (user_id, plan_id, completed_at, weight_kg, calories_burned, notes).
      const weightKg = req.body.weight_kg ?? null;
      const calories = req.body.calories_burned ?? null;
      const notes = req.body.notes ?? null;

      await connection.query(
        'INSERT INTO progress (user_id, plan_id, completed_at, weight_kg, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, plan_id, completed_at || new Date(), weightKg, calories, notes]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Workout progress recorded',
        plan_closed: Boolean(mark_plan_complete)
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

// Delete a progress entry (workout history)
// Example: DELETE /api/workouts/delete?id=123
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // Soft-delete: set deleted_at timestamp so row can be hidden but totals can still be calculated if needed
    const [result] = await pool.query('UPDATE progress SET deleted_at = NOW() WHERE id = ?', [id]);
    if (result.affectedRows && result.affectedRows > 0) {
      return res.json({ success: true, deleted: true });
    }

    res.json({ success: false, deleted: false });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

// Progress listing (returns progress records for a user)
// Example: GET /api/workouts/progress?user_id=3
router.get('/progress', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.user_id, p.plan_id, p.completed_at, p.weight_kg, p.calories_burned, p.notes, wp.title AS plan_title
       FROM progress p
       LEFT JOIN workout_plans wp ON p.plan_id = wp.id
       WHERE p.user_id = ? AND p.deleted_at IS NULL
       ORDER BY p.completed_at DESC`,
      [userId]
    );

    // Also compute aggregate calorie totals (including soft-deleted rows) so frontend can display totals that persist
    const [[totals]] = await pool.query(
      `SELECT COALESCE(SUM(calories_burned),0) AS total_calories_all,
              COALESCE(SUM(CASE WHEN completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN calories_burned ELSE 0 END),0) AS weekly_calories_all
       FROM progress WHERE user_id = ?`,
      [userId]
    );

    res.json({ success: true, progress: rows, totals });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
