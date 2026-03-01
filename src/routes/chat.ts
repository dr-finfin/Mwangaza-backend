import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { GoogleGenAI } from '@google/genai';

const router = Router();

function getAI(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are NyotaAI, a friendly and brilliant AI tutor built for Kenyan students in Grades 7–9 (Junior Secondary School).
Your role is to help students understand their lessons, solve problems, and tackle tests or exam questions step by step.

When a student shares a photo or file containing a test, exam paper, or questions:
1. Read all questions carefully
2. Work through each one step by step
3. Show full working/reasoning so the student actually learns — don't just give answers
4. Use simple English appropriate for junior secondary school
5. Encourage the student and celebrate their effort

General guidelines:
- Use examples relevant to Kenya and East Africa when possible
- Be warm, patient, and encouraging
- For maths: show every step of working clearly
- For sciences: explain the concept behind the answer
- For English: explain grammar rules or literary techniques used
- Keep responses focused and not overly long unless detail is needed
- If you see a full exam paper, go question by question systematically`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageData?: string;
  imageMime?: string;
  fileData?: string;
  fileMime?: string;
}

router.post('/', verifyToken, async (req, res) => {
  const { messages }: { messages: ChatMessage[] } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Messages array is required' });
  }

  try {
    const ai = getAI();

    const history = messages.slice(0, -1).map((msg, index) => {
      const parts: any[] = [];

      if (index === 0 && msg.role === 'user') {
        parts.push({ text: SYSTEM_PROMPT + '\n\n' + msg.content });
      } else {
        parts.push({ text: msg.content });
      }

      if (msg.imageData && msg.imageMime) {
        parts.push({ inlineData: { mimeType: msg.imageMime, data: msg.imageData } });
      }

      if (msg.fileData && msg.fileMime) {
        parts.push({ inlineData: { mimeType: msg.fileMime, data: msg.fileData } });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const latest = messages[messages.length - 1];
    const latestParts: any[] = [];

    if (messages.length === 1) {
      latestParts.push({ text: SYSTEM_PROMPT + '\n\n' + latest.content });
    } else {
      latestParts.push({ text: latest.content });
    }

    if (latest.imageData && latest.imageMime) {
      latestParts.push({ inlineData: { mimeType: latest.imageMime, data: latest.imageData } });
    }

    if (latest.fileData && latest.fileMime) {
      latestParts.push({ inlineData: { mimeType: latest.fileMime, data: latest.fileData } });
    }

    const chat = ai.chats.create({ model: MODEL, history });
    const response = await chat.sendMessage({ message: latestParts });
    const reply = response?.text ?? response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    res.json({ reply });
  } catch (error) {
    console.error('NyotaAI chat error:', error);
    res.status(500).json({ message: 'NyotaAI could not respond right now. Please try again.' });
  }
});

export default router;