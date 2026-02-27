import { Router, Request, Response } from 'express';
import pool from '../lib/db';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

/**
 * Save progress
 */
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get progress
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT * FROM progress WHERE user_id = $1',
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;