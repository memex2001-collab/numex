import { Router } from 'express';
import type { Request, Response } from 'express';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { erstelleSchrittPrompt } from '../prompts/steps.js';
import { streamZuSSE } from '../services/anthropic.js';

const router = Router();

/** Anfrage-Body für den Chat-Endpunkt */
interface ChatAnfrage {
  thema: string;
  schritt: number;
  bisherigeAntworten?: { schritt: number; antwort: string }[];
  nutzereingabe?: string;
}

/**
 * POST /api/chat
 *
 * Streamt eine Claude-Antwort für den aktuellen SCAMPER-Schritt als SSE.
 * Schritt 7 löst den Reflexions-Prompt aus.
 */
router.post('/', async (req: Request, res: Response) => {
  const { thema, schritt, bisherigeAntworten = [], nutzereingabe }: ChatAnfrage = req.body;

  // Eingabe-Validierung
  if (!thema || typeof schritt !== 'number') {
    res.status(400).json({ fehler: 'thema und schritt sind Pflichtfelder' });
    return;
  }

  if (schritt < 0 || schritt > 7) {
    res.status(400).json({ fehler: 'schritt muss zwischen 0 und 7 liegen' });
    return;
  }

  // SSE-Header setzen
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx-Pufferung deaktivieren
  res.flushHeaders();

  const nutzerPrompt = erstelleSchrittPrompt({
    thema,
    schritt,
    bisherigeAntworten,
    nutzereingabe,
  });

  try {
    await streamZuSSE(SYSTEM_PROMPT, nutzerPrompt, res);
  } catch (fehler) {
    const nachricht = fehler instanceof Error ? fehler.message : 'Unbekannter Fehler';
    res.write(`data: ${JSON.stringify({ type: 'error', message: nachricht })}\n\n`);
  } finally {
    res.end();
  }
});

export { router as chatRouter };
