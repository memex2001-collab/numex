import { Router } from 'express';
import type { Request, Response } from 'express';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { erstelleHilfePrompt } from '../prompts/steps.js';
import { erstelleAntwort } from '../services/anthropic.js';

const router = Router();

/** Anfrage-Body für den Hilfe-Endpunkt */
interface HilfeAnfrage {
  thema: string;
  schritt: number;
  bisherigeTeilEingabe?: string;
}

/**
 * POST /api/hint
 *
 * Gibt einen kurzen, konkreten Denkanstoß zurück wenn der Nutzer
 * bei einem Schritt nicht weiterkommt. Nicht-gestreamt.
 */
router.post('/', async (req: Request, res: Response) => {
  const { thema, schritt, bisherigeTeilEingabe }: HilfeAnfrage = req.body;

  // Eingabe-Validierung
  if (!thema || typeof schritt !== 'number') {
    res.status(400).json({ fehler: 'thema und schritt sind Pflichtfelder' });
    return;
  }

  const nutzerPrompt = erstelleHilfePrompt(thema, schritt, bisherigeTeilEingabe);

  try {
    const hinweis = await erstelleAntwort(SYSTEM_PROMPT, nutzerPrompt, 200);
    res.json({ hinweis });
  } catch (fehler) {
    const nachricht = fehler instanceof Error ? fehler.message : 'Unbekannter Fehler';
    res.status(500).json({ fehler: nachricht });
  }
});

export { router as hintRouter };
