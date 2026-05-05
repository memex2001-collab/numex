import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';
import App from './App.tsx';

const wurzel = document.getElementById('root');
if (!wurzel) {
  throw new Error('Kein Element mit id="root" gefunden. Bitte index.html prüfen.');
}

createRoot(wurzel).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
