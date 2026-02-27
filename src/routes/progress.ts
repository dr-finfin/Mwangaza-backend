import express, { Response } from 'express';
import pool from '../lib/db';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Save progress
 */
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { lesson_id, lesson_name, completed, score } = req.body;

    await pool.query(
      `
      INSERT INTO progress (user_id, lesson_id, lesson_name, completed, score)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, lesson_id, lesson_name, completed, score]
    );

    return res.json({ message: 'Progress saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get progress
 */
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT * FROM progress WHERE user_id = $1',
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;