import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, age, gender, height, weight } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with optional fields
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, age, gender, height_cm, weight_kg) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, age || null, gender || null, height || null, weight || null]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user with all details
    const [users] = await pool.query(
      'SELECT id, username, password, age, gender, height_cm, weight_kg FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || '';
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set. Cannot issue tokens.');
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      username: user.username,
      token: token,
      user_id: user.id,
      weight: user.weight_kg,
      height: user.height_cm,
      age: user.age,
      gender: user.gender
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
