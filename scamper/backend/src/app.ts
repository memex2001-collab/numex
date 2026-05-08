import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import { hintRouter } from './routes/hint.js';

/**
 * Erstellt und konfiguriert die Express-App.
 * Getrennt vom Server-Start für bessere Testbarkeit.
 */
export function erstelleApp() {
  const app = express();

  // CORS: nur lokaler Vite-Dev-Server und Produktion erlaubt
  const erlaubteUrsprünge = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: erlaubteUrsprünge,
      methods: ['GET', 'POST'],
    }),
  );

  // JSON-Body-Parser
  app.use(express.json({ limit: '50kb' }));

  // Routen einbinden
  app.use('/api/chat', chatRouter);
  app.use('/api/hint', hintRouter);

  // Gesundheitsprüfungs-Endpunkt
  app.get('/health', (_req, res) => {
    res.json({ ok: true, zeitstempel: new Date().toISOString() });
  });

  return app;
}
