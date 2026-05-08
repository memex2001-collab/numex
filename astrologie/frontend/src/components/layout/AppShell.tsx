import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text3">
        <div className="mx-auto max-w-5xl px-4">
          Astrologie — Persönliche Deutung
        </div>
      </footer>
    </div>
  );
}
