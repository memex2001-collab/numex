import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';

/** Anthropic-Client — API-Schlüssel aus Umgebungsvariable */
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Das zu verwendende Claude-Modell */
const MODELL = 'claude-sonnet-4-20250514';

/**
 * Streamt eine Claude-Antwort als Server-Sent Events (SSE) an den Express-Response.
 *
 * Sendet Events in folgendem Format:
 *   data: {"type":"delta","content":"..."}\n\n
 *   data: {"type":"done"}\n\n
 *
 * Bei Fehler:
 *   data: {"type":"error","message":"..."}\n\n
 */
export async function streamZuSSE(
  systemPrompt: string,
  nutzerPrompt: string,
  res: Response,
): Promise<void> {
  const stream = await client.messages.stream({
    model: MODELL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: nutzerPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      const chunk = { type: 'delta', content: event.delta.text };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
}

/**
 * Erstellt eine einfache (nicht-gestreamte) Claude-Antwort.
 * Wird für kurze Hilfe-Texte verwendet.
 */
export async function erstelleAntwort(
  systemPrompt: string,
  nutzerPrompt: string,
  maxTokens = 300,
): Promise<string> {
  const nachricht = await client.messages.create({
    model: MODELL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: nutzerPrompt }],
  });

  const ersterBlock = nachricht.content[0];
  return ersterBlock?.type === 'text' ? ersterBlock.text : '';
}
