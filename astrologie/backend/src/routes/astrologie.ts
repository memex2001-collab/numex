import { Router } from 'express';
import type { Request, Response } from 'express';
import { ASTROLOGIE_SYSTEM_PROMPT } from '../prompts/astrologie.js';
import { streamZuSSE } from '../services/anthropic.js';

const router = Router();

interface AstrologieAnfrage {
  geburtsdatum: string;
  geburtszeit?: string;
  geburtsort?: string;
  fokus: string;
  frage?: string;
  aktuellesDatum: string;
}

router.post('/', async (req: Request, res: Response) => {
  const { geburtsdatum, geburtszeit, geburtsort, fokus, frage, aktuellesDatum }: AstrologieAnfrage =
    req.body;

  if (!geburtsdatum || !fokus || !aktuellesDatum) {
    res.status(400).json({ fehler: 'geburtsdatum, fokus und aktuellesDatum sind Pflichtfelder' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const nutzerPrompt = [
    `Geburtsdatum: ${geburtsdatum}`,
    geburtszeit ? `Geburtszeit: ${geburtszeit} Uhr` : 'Geburtszeit: nicht angegeben',
    geburtsort ? `Geburtsort: ${geburtsort}` : null,
    `Aktuelles Datum: ${aktuellesDatum}`,
    `Fokusbereich: ${fokus}`,
    frage ? `Persönliche Frage: ${frage}` : null,
    '',
    'Erstelle meine persönliche astrologische Interpretation.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await streamZuSSE(ASTROLOGIE_SYSTEM_PROMPT, nutzerPrompt, res);
  } catch (fehler) {
    const nachricht = fehler instanceof Error ? fehler.message : 'Unbekannter Fehler';
    res.write(`data: ${JSON.stringify({ type: 'error', message: nachricht })}\n\n`);
  } finally {
    res.end();
  }
});

export { router as astrologieRouter };
