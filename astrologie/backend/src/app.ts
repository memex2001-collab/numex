import express from 'express';
import cors from 'cors';
import { astrologieRouter } from './routes/astrologie.js';

export function erstelleApp() {
  const app = express();

  const erlaubteUrsprünge = [
    'http://localhost:5174',
    'http://localhost:4174',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: erlaubteUrsprünge,
      methods: ['GET', 'POST'],
    }),
  );

  app.use(express.json({ limit: '20kb' }));

  app.use('/api/astrologie', astrologieRouter);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, zeitstempel: new Date().toISOString() });
  });

  return app;
}
