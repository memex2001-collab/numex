import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODELL = 'claude-sonnet-4-20250514';

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
