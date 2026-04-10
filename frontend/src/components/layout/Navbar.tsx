import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

/** Navigations-Link-Konfiguration */
interface NavItem {
  pfad: string;
  bezeichnung: string;
}

const NAV_ITEMS: NavItem[] = [
  { pfad: '/theorie', bezeichnung: 'Theorie' },
  { pfad: '/anwendung', bezeichnung: 'Anwenden' },
];

/**
 * App-Navigationsleiste mit Logo und Navigations-Links.
 * Aktiver Link wird durch die primäre Farbe hervorgehoben.
 */
export function Navbar() {
  const ort = useLocation();

  // Auf der Startseite schlichter Hintergrund, sonst mit Schatten
  const aufStartseite = ort.pathname === '/';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-sm',
        aufStartseite ? '' : 'shadow-sm',
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-base font-semibold text-text hover:text-p1 transition-colors"
          aria-label="Zur Startseite"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-p1 text-xs font-bold text-white">
            N
          </div>
          <span>Numex</span>
        </NavLink>

        {/* Navigations-Links */}
        <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.pfad}
              to={item.pfad}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-p1-l text-p1-d'
                    : 'text-text2 hover:bg-surface2 hover:text-text',
                )
              }
            >
              {item.bezeichnung}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
