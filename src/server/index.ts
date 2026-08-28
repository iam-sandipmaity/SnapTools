import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import instagramRouter from './routes/instagram';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin(origin, callback) {
      const allowlist = allowedOrigins.length ? allowedOrigins : defaultOrigins;
      if (!origin || allowlist.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '64kb' }));

const rateBuckets = new Map<string, number[]>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    rateBuckets.set(key, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  return false;
}

app.use('/api/instagram', instagramRouter);

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID || process.env.VITE_JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || process.env.VITE_JDOODLE_CLIENT_SECRET;
const ALLOWED_LANGUAGES = new Set([
  'nodejs',
  'python3',
  'java',
  'c',
  'cpp',
  'cpp14',
  'cpp17',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'kotlin',
  'swift',
  'typescript',
  'bash',
]);

app.post('/api/execute', async (req, res) => {
  try {
    const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(`execute:${clientKey}`, 10, 60_000)) {
      return res.status(429).json({ error: 'Too many execute requests. Try again shortly.' });
    }

    const { code, language, input } = req.body;

    if (typeof code !== 'string' || typeof language !== 'string') {
      return res.status(400).json({ error: 'Missing required parameters: code and language are required' });
    }

    if (code.length > 20_000) {
      return res.status(400).json({ error: 'Source code exceeds the 20KB limit' });
    }

    if (!ALLOWED_LANGUAGES.has(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(503).json({ error: 'Code execution is not configured on this server' });
    }

    const response = await axios.post(
      JDOODLE_API_URL,
      {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script: code,
        language,
        stdin: typeof input === 'string' ? input.slice(0, 4000) : '',
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        res.status(504).json({ error: 'Request timeout: The API server took too long to respond' });
      } else if (!error.response) {
        res.status(502).json({ error: 'Network error: Unable to connect to the JDoodle API' });
      } else {
        res.status(error.response.status || 500).json({
          error: 'Code execution failed',
        });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
