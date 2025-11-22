import express from 'express';
import pool from '../config/database.js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// GET /api/users/:id  -> return user details including profile_image
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id) || 0;
  if (!id) return res.status(400).json({ success: false, message: 'Invalid user id' });
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, age, gender, height_cm AS height, weight_kg AS weight, profile_image FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const user = rows[0];
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/:id  -> update user profile (height, weight, age, gender) and optional avatar (dataURL)
// Use multer to accept multipart/form-data file uploads (field name: 'avatar')
const uploadsDir = path.resolve(process.cwd(), '..', 'public', 'uploads', 'avatars');
try { fsSync.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const id = Number(req.params.id) || 'anon';
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `user_${id}_${Date.now()}${ext}`);
  }
});

const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || Math.floor(1.5 * 1024 * 1024);
const upload = multer({ storage, limits: { fileSize: maxBytes } });

router.post('/:id', verifyToken, upload.single('avatar'), async (req, res) => {
  const id = Number(req.params.id) || 0;
  if (!id) return res.status(400).json({ success: false, message: 'Invalid user id' });

  // Ensure the authenticated user may only update their own profile
  try {
    const authId = Number(req.user && req.user.id) || 0;
    if (!authId || authId !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
  } catch (e) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { height, weight, age, gender } = req.body || {};
  const { username, email, password } = req.body || {};

  let profileImagePath = null;
  if (req.file) {
    profileImagePath = `/uploads/avatars/${req.file.filename}`;
  }

  try {
    // If email is being changed, ensure it's not already used by another account
    if (email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [email, id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    // If password supplied, hash it before saving
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(String(password), 10);
    }
    // Build update query dynamically
    const fields = [];
    const values = [];
    if (username !== undefined) { fields.push('username = ?'); values.push(username || null); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email || null); }
    if (hashedPassword !== null) { fields.push('password = ?'); values.push(hashedPassword); }
    if (height !== undefined) { fields.push('height_cm = ?'); values.push(height || null); }
    if (weight !== undefined) { fields.push('weight_kg = ?'); values.push(weight || null); }
    if (age !== undefined) { fields.push('age = ?'); values.push(age || null); }
    if (gender !== undefined) { fields.push('gender = ?'); values.push(gender || null); }
    if (profileImagePath !== null) { fields.push('profile_image = ?'); values.push(profileImagePath); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows >= 0) {
      return res.json({ success: true, message: 'User updated', profile_image: profileImagePath });
    }

    res.status(500).json({ success: false, message: 'Update failed' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
