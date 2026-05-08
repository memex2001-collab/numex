import 'dotenv/config';
import { erstelleApp } from './app.js';

const PORT = Number(process.env.PORT) || 3002;

const app = erstelleApp();

app.listen(PORT, () => {
  console.log(`✅ Astrologie-Backend läuft auf Port ${PORT}`);
  console.log(`   Gesundheitsprüfung: http://localhost:${PORT}/health`);

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-...')) {
    console.warn('⚠️  Kein gültiger ANTHROPIC_API_KEY gefunden — Claude-Endpunkte sind nicht funktionsfähig.');
    console.warn('   Bitte .env.example zu .env kopieren und echten API-Schlüssel eintragen.');
  }
});
