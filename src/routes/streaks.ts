import { Router, Request, Response } from 'express';
import pool from '../lib/db.js';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Get current streak info
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await pool.query(
      'SELECT current_streak, longest_streak, last_activity_date FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if streak is still active (activity today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;
    const daysSinceActivity = lastActivity
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // If more than 1 day since last activity, streak is broken
    if (daysSinceActivity !== null && daysSinceActivity > 1) {
      await pool.query(
        'UPDATE users SET current_streak = 0 WHERE id = $1',
        [userId]
      );
      return res.json({ current_streak: 0, longest_streak: user.longest_streak, studied_today: false });
    }

    const studiedToday = daysSinceActivity === 0;

    return res.json({
      current_streak: user.current_streak,
      longest_streak: user.longest_streak,
      studied_today: studiedToday,
    });
  } catch (error) {
    console.error('Streak get error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Record study activity (call this whenever user completes a lesson or quiz)
router.post('/record', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Try to insert today's activity (ignore if already exists)
    const insertResult = await pool.query(
      `INSERT INTO daily_activity (user_id, activity_date) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, activity_date) DO NOTHING
       RETURNING id`,
      [userId, todayStr]
    );

    // If already recorded today, return current streak without updating
    if (insertResult.rowCount === 0) {
      const current = await pool.query(
        'SELECT current_streak, longest_streak FROM users WHERE id = $1',
        [userId]
      );
      return res.json({ ...current.rows[0], studied_today: true, already_recorded: true });
    }

    // Get user's last activity date
    const userResult = await pool.query(
      'SELECT current_streak, longest_streak, last_activity_date FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    const lastActivity = user.last_activity_date ? new Date(user.last_activity_date) : null;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      // If last activity was yesterday, increment streak
      if (lastActivity.getTime() === yesterday.getTime()) {
        newStreak = (user.current_streak || 0) + 1;
      }
      // If last activity was today (shouldn't happen due to conflict check above), keep streak
      else if (lastActivity.getTime() === today.getTime()) {
        newStreak = user.current_streak || 1;
      }
      // Otherwise streak resets to 1
    }

    const newLongest = Math.max(newStreak, user.longest_streak || 0);

    await pool.query(
      `UPDATE users 
       SET current_streak = $1, longest_streak = $2, last_activity_date = $3 
       WHERE id = $4`,
      [newStreak, newLongest, todayStr, userId]
    );

    return res.json({
      current_streak: newStreak,
      longest_streak: newLongest,
      studied_today: true,
      is_new_record: newStreak > (user.longest_streak || 0),
    });
  } catch (error) {
    console.error('Streak record error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;