import { Router } from 'express';
import { generateFlashcards, generateProjectGuide, generateQuiz, generateSubTopicExplanation } from '../services/geminiService.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/explain', verifyToken, async (req, res) => {
  const { topic, subTopic } = req.body;
  try {
    const explanation = await generateSubTopicExplanation(subTopic || topic, topic);
    res.json({ explanation });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ message: 'Error generating explanation' });
  }
});

router.post('/quiz', verifyToken, async (req, res) => {
  const { topicName, subTopicName } = req.body;
  try {
    const quiz = await generateQuiz(topicName, subTopicName);
    res.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: 'Error generating quiz' });
  }
});

router.post('/flashcards', verifyToken, async (req, res) => {
  const { topicName, subTopicName } = req.body;
  try {
    const flashcards = await generateFlashcards(topicName, subTopicName);
    res.json({ flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ message: 'Error generating flashcards' });
  }
});

router.post('/project-guide', verifyToken, async (req, res) => {
  const { project } = req.body;
  try {
    const guide = await generateProjectGuide(project);
    res.json({ guide });
  } catch (error) {
    console.error('Error generating project guide:', error);
    res.status(500).json({ message: 'Error generating project guide' });
  }
});

export default router;
