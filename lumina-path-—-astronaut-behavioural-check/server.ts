import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;

function normalizeAudioMimeType(rawMimeType: unknown): string {
  if (typeof rawMimeType !== 'string' || !rawMimeType.trim()) {
    return 'audio/webm';
  }
  const base = rawMimeType.split(';')[0]?.trim().toLowerCase() ?? 'audio/webm';
  if (!base.startsWith('audio/')) {
    return 'audio/webm';
  }
  return base;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/transcribe', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured. Check your Settings > Secrets panel.',
      });
      return;
    }

    const { audioBase64, mimeType, mode } = req.body as {
      audioBase64?: unknown;
      mimeType?: unknown;
      mode?: unknown;
    };

    if (typeof audioBase64 !== 'string' || audioBase64.trim().length === 0) {
      res.status(400).json({ error: 'Recorded audio payload is missing.' });
      return;
    }

    const cleanMimeType = normalizeAudioMimeType(mimeType);
    const reflectionMode = mode === 'poem' ? 'poem' : 'journal';

    const promptText =
      reflectionMode === 'poem'
        ? 'Transcribe this spoken audio verbatim into text. Preserve natural pauses as line breaks where helpful for poetry. Return only the transcribed text without commentary or quotation marks.'
        : 'Transcribe this spoken audio verbatim into clear, natural prose. Return only the transcribed text without commentary, timestamps, or quotation marks.';

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: audioBase64,
              },
            },
            { text: promptText },
          ],
        },
      });

      const transcript = (response.text ?? '').trim();
      res.json({ transcript });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to transcribe audio with Gemini.';
      const status =
        typeof (error as { status?: unknown })?.status === 'number'
          ? (error as { status: number }).status
          : 500;
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
