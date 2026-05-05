import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { TheoriePage } from './pages/TheoriePage';
import { AnwendungPage } from './pages/AnwendungPage';
import { ReflexionPage } from './pages/ReflexionPage';
import { DesignSystemPage } from './pages/DesignSystemPage';

/**
 * Wurzel-Komponente mit React Router v7.
 * AppShell dient als gemeinsames Layout für alle Seiten.
 * /design-system ist nur in der Entwicklungsumgebung erreichbar.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Startseite */}
          <Route index element={<HomePage />} />

          {/* Modul 1: Theorie */}
          <Route path="theorie" element={<TheoriePage />} />

          {/* Modul 2: Geführte Anwendung */}
          <Route path="anwendung" element={<AnwendungPage />} />

          {/* Modul 3: Reflexion */}
          <Route path="reflexion" element={<ReflexionPage />} />

          {/* Design-System-Übersicht (nur Entwicklung) */}
          {import.meta.env.DEV && (
            <Route path="design-system" element={<DesignSystemPage />} />
          )}

          {/* Unbekannte Routen → Startseite */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
