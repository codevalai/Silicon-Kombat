import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Server-side Gemini Neural TTS Announcer Endpoint ('Fenrir' Deep Male Voice)
  app.post('/api/tts/announcer', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
        return;
      }

      const text = String(req.body?.text || '').trim().slice(0, 240);
      const voiceName = String(req.body?.voiceName || 'Fenrir');
      if (!text) {
        res.status(400).json({ error: 'Missing text' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            parts: [
              {
                text: `Announce with deep, aggressive male esports hype: ${text}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      });

      const audioBase64 =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

      if (!audioBase64) {
        res.status(502).json({ error: 'No audio payload returned from Gemini TTS' });
        return;
      }

      res.json({ audioBase64, sampleRate: 24000, voiceName });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'TTS generation failed';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SILICON KOMBAT: SOVEREIGN ZENITH server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
