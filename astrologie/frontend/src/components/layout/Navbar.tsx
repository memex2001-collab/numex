import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-base font-semibold text-text hover:text-p1 transition-colors"
          aria-label="Zur Startseite"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-p1 text-xs font-bold text-white">
            ✦
          </div>
          <span>Astrologie</span>
        </NavLink>
      </div>
    </header>
  );
}
