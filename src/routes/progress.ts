import express from 'express';
import pool from '../lib/db.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query('SELECT * FROM progress WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const { lesson_id, lesson_name, completed, score } = req.body;
  const userId = req.user?.id;

  try {
    const existing = await pool.query(
      'SELECT id FROM progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lesson_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE progress SET completed = $1, score = $2, lesson_name = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
        [completed ?? false, score ?? null, lesson_name ?? null, existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO progress (user_id, lesson_id, lesson_name, completed, score) VALUES ($1, $2, $3, $4, $5)',
        [userId, lesson_id, lesson_name ?? null, completed ?? false, score ?? null]
      );
    }

    res.json({ msg: 'Progress updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
