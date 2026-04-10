import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * App-Hülle: Navbar + Haupt-Inhaltsbereich.
 * Wird als übergeordnete Route für alle Seiten verwendet.
 */
export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <Navbar />

      {/* Haupt-Inhalt — <Outlet /> rendert die aktive Seite */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Fußzeile */}
      <footer className="border-t border-border py-6 text-center text-xs text-text3">
        <div className="mx-auto max-w-5xl px-4">
          Numex — Kreativitäts-App-Netzwerk
        </div>
      </footer>
    </div>
  );
}
