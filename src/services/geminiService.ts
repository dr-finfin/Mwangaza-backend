import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getGoogleAI(): GoogleGenAI {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set. Please add it to your environment variables.');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const MODEL = 'gemini-2.0-flash';

function getText(response: any): string {
  return response?.text ?? response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

interface Project {
  title: string;
  description: string;
  tasks: string[];
}

export async function generateProjectGuide(project: Project): Promise<string> {
  const prompt = `You are a direct and helpful AI tutor for the Kenyan CBE curriculum. Your name is Mwangaza.
  A student needs a guide for the following project:
  - Title: ${project.title}
  - Description: ${project.description}
  - Tasks: ${project.tasks.join(', ')}
  Provide a simple, clear, step-by-step guide in Markdown format.`;

  try {
    const genAI = getGoogleAI();
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return getText(response);
  } catch (error) {
    console.error('Error generating project guide:', error);
    return "I'm sorry, I was unable to generate a guide at the moment. Please try again later.";
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export async function generateQuiz(topicName: string, subTopicName?: string): Promise<QuizQuestion[]> {
  const prompt = `You are Mwangaza, an AI learning assistant for the Kenyan CBE curriculum.
  Generate a multiple-choice quiz for junior secondary school students.
  Topic: ${topicName}
  ${subTopicName ? `Sub-topic: ${subTopicName}` : ''}
  Generate ${subTopicName ? '5' : '10'} questions.
  Return ONLY a valid JSON array. Each object must have:
  - "question": string
  - "options": array of 4 strings
  - "correctAnswerIndex": number (0-3)
  - "explanation": string`;

  try {
    const genAI = getGoogleAI();
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    const text = getText(response).trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return [];
  }
}

export async function generateFlashcards(topicName: string, subTopicName: string): Promise<Flashcard[]> {
  const prompt = `You are Mwangaza, an AI learning assistant for the Kenyan CBE curriculum.
  Generate 5 flashcards for junior secondary school students.
  Topic: ${topicName}, Sub-topic: ${subTopicName}
  Return ONLY a valid JSON array. Each object must have:
  - "front": string (concept or question)
  - "back": string (definition or answer)`;

  try {
    const genAI = getGoogleAI();
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    const text = getText(response).trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
}

export async function generateSubTopicExplanation(subTopicName: string, topicName: string): Promise<string> {
  const prompt = `You are Mwangaza, an AI learning assistant for the Kenyan CBE curriculum.
  Provide a brief, encouraging explanation (2-3 sentences) of "${subTopicName}" within "${topicName}".
  Keep it simple and suitable for a junior secondary school student.`;

  try {
    const genAI = getGoogleAI();
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return getText(response);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return "This sub-topic covers essential concepts to help you master your curriculum. Let's dive in!";
  }
}
