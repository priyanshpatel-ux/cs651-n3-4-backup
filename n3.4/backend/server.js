import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// Create the Express application. Express handles our backend routes.
const app = express();

// Use Cloud Run's PORT value when deployed, or the port value from backend/.env locally.
// If neither is set, the backend runs on port 3001.
const port = process.env.PORT || 3001;

// Read allowedOrigins from backend/.env as a comma-separated list.
// Example: allowedOrigins=http://localhost:5173,http://127.0.0.1:5173
const allowedOrigins = process.env.allowedOrigins
  ? process.env.allowedOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Enable CORS (Cross-Origin Resource Sharing - front-end and backend on different servers) only for the frontend URLs in allowedOrigins.
// This includes local development and the deployed Firebase frontend.
app.use(cors({ origin: allowedOrigins }));

// Tell Express to parse incoming JSON request bodies.
// This lets us read request.body.message in the /api/askanything route.
app.use(express.json());

// Create the Gemini API client.
// The API key is loaded from backend/.env through dotenv.
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() })
  : null;

// The Ask Anything prompt is loaded from backend/.env.
// Keeping it in .env lets us change the agent instructions without editing code.
const askAnythingPrompt = process.env.askAnythingPrompt?.trim();

// The Gemini model for Ask Anything is also loaded from backend/.env.
const geminiAskAnythingModel = process.env.geminiAskAnythingModel?.trim() || 'gemini-2.5-flash';

const fallbackAnswer =
  'Smart Speech Coach is an AI-powered tool that helps users improve public speaking by providing feedback on pacing, filler words, tone, clarity, and pronunciation.';

app.get('/', (request, response) => {
  response.json({ service: 'Smart Speech Coach backend', status: 'ok' });
});

// A small test route. If this returns { status: "ok" },
// the backend server is running correctly.
// currently not invoked by front-end but, tester can use to make sure
// backend is running
app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' });
});

// Ask Anything endpoint
// This route receives a user's question from the frontend,
// sends it to Gemini, and returns Gemini's answer.
app.post('/api/askanything', async (request, response) => {
  // Pull the message out of the JSON request body and remove extra spaces.
  const message = request.body?.message?.trim();

  // Stop early if the user submitted an empty message.
  if (!message) {
    return response.status(400).json({
      error: 'Please enter a question.',
    });
  }

  // Stop early if the Gemini key has not been configured.
  // The real key should live only in backend/.env.
  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({
      error: 'Gemini API key is not configured.',
    });
  }

  // Stop early if the Ask Anything prompt has not been configured.
  // The prompt should live in backend/.env as askAnythingPrompt.
  if (!askAnythingPrompt) {
    return response.status(500).json({
      error: 'Ask Anything prompt is not configured.',
    });
  }

  // Stop early if the Gemini model name has not been configured.
  // The model should live in backend/.env as geminiAskAnythingModel.
  if (!geminiAskAnythingModel) {
    return response.status(500).json({
      error: 'Ask Anything Gemini model is not configured.',
    });
  }

  try {
    // Combine the configured agent instructions with the user's actual question.
    const prompt = `${askAnythingPrompt}

User question: ${message}`;

    // Use the stable Gemini generateContent API. It is supported by the
    // @google/genai version locked in package-lock.json and works on both
    // local Node.js and Elastic Beanstalk.
    const result = await Promise.race([
      ai.models.generateContent({
        model: geminiAskAnythingModel,
        contents: prompt,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timed out')), 15000),
      ),
    ]);

    // Send only the final answer text back to the frontend.
    response.json({
      answer: result.text || 'I could not generate an answer right now.',
    });
  } catch (error) {
    // Keep the API usable if Gemini is temporarily unavailable or slow.
    // The real error is logged for diagnosis, but not exposed to clients.
    console.error('Gemini request failed:', error?.message || error);
    response.json({ answer: fallbackAnswer, fallback: true });
  }
});

// Start the backend and print the local URL in the terminal.
app.listen(port, () => {
  console.log(`Smart Speech Coach backend running on http://localhost:${port}`);
});
