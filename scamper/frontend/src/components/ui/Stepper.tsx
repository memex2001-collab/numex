import { cn } from '../../lib/utils';

/** Zustand eines einzelnen Schritt-Elements */
type SchrittZustand = 'ausstehend' | 'aktiv' | 'abgeschlossen';

/** Konfiguration eines einzelnen Schritts */
export interface StepperSchritt {
  /** Beschriftung des Schritts */
  bezeichnung: string;
  /** Aktueller Zustand */
  zustand: SchrittZustand;
}

export interface StepperProps {
  /** Liste aller Schritte */
  schritte: StepperSchritt[];
  /** Ausrichtung — 'auto' wählt je nach Bildschirmbreite */
  ausrichtung?: 'horizontal' | 'vertical' | 'auto';
}

/** Häkchen-Symbol für abgeschlossene Schritte */
function HaekSymbol() {
  return (
    <svg
      className="h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Einzelner Schritt-Indikator */
function SchrittIndikator({
  schritt,
  index,
  isLetzter,
  horizontal,
}: {
  schritt: StepperSchritt;
  index: number;
  isLetzter: boolean;
  horizontal: boolean;
}) {
  const { zustand, bezeichnung } = schritt;

  const kreisKlassen = cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
    'transition-all duration-200',
    zustand === 'abgeschlossen' && 'bg-p1-d text-white',
    zustand === 'aktiv' && 'bg-p1 text-white ring-4 ring-p1-l',
    zustand === 'ausstehend' && 'border-2 border-border bg-surface text-text2',
  );

  return (
    <li
      className={cn(
        'flex items-center',
        horizontal ? 'flex-1 flex-col gap-2' : 'gap-3 pb-4',
        isLetzter && (horizontal ? '' : 'pb-0'),
      )}
    >
      <div className={cn('flex items-center', horizontal ? 'w-full flex-col' : 'gap-3')}>
        {/* Verbindungslinie vor dem Schritt (nicht beim ersten) */}
        {horizontal && index > 0 && (
          <div
            className={cn(
              'h-px flex-1 transition-colors duration-200',
              zustand === 'abgeschlossen' || zustand === 'aktiv' ? 'bg-p1' : 'bg-border',
            )}
          />
        )}

        {/* Schritt-Kreis */}
        <div className={kreisKlassen} aria-current={zustand === 'aktiv' ? 'step' : undefined}>
          {zustand === 'abgeschlossen' ? (
            <HaekSymbol />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Verbindungslinie nach dem Schritt (nicht beim letzten, horizontal) */}
        {horizontal && !isLetzter && (
          <div
            className={cn(
              'h-px flex-1 transition-colors duration-200',
              zustand === 'abgeschlossen' ? 'bg-p1' : 'bg-border',
            )}
          />
        )}

        {/* Vertikale Verbindungslinie nach dem Schritt */}
        {!horizontal && !isLetzter && (
          <div className={cn('ml-4 mt-2 h-full min-h-6 w-px', 'bg-border')} />
        )}
      </div>

      {/* Bezeichnung */}
      <span
        className={cn(
          'text-xs font-medium transition-colors duration-200',
          horizontal ? 'text-center' : '',
          zustand === 'aktiv' && 'text-p1',
          zustand === 'abgeschlossen' && 'text-p1-d',
          zustand === 'ausstehend' && 'text-text2',
        )}
      >
        {bezeichnung}
      </span>
    </li>
  );
}

/**
 * Fortschrittsanzeige für mehrstufige Prozesse.
 * Zeigt den aktuellen Schritt, abgeschlossene und ausstehende Schritte an.
 *
 * @example
 * <Stepper
 *   schritte={[
 *     { bezeichnung: 'Theorie', zustand: 'abgeschlossen' },
 *     { bezeichnung: 'Anwendung', zustand: 'aktiv' },
 *     { bezeichnung: 'Reflexion', zustand: 'ausstehend' },
 *   ]}
 * />
 */
export function Stepper({ schritte, ausrichtung = 'auto' }: StepperProps) {
  return (
    <>
      {/* Horizontale Darstellung: Desktop (oder explizit gewählt) */}
      {(ausrichtung === 'horizontal' || ausrichtung === 'auto') && (
        <nav
          aria-label="Fortschritt"
          className={ausrichtung === 'auto' ? 'hidden sm:block' : ''}
        >
          <ol className="flex items-start gap-0">
            {schritte.map((schritt, i) => (
              <SchrittIndikator
                key={i}
                schritt={schritt}
                index={i}
                isLetzter={i === schritte.length - 1}
                horizontal={true}
              />
            ))}
          </ol>
        </nav>
      )}

      {/* Vertikale Darstellung: Mobile (oder explizit gewählt) */}
      {(ausrichtung === 'vertical' || ausrichtung === 'auto') && (
        <nav
          aria-label="Fortschritt"
          className={ausrichtung === 'auto' ? 'sm:hidden' : ''}
        >
          <ol className="flex flex-col">
            {schritte.map((schritt, i) => (
              <SchrittIndikator
                key={i}
                schritt={schritt}
                index={i}
                isLetzter={i === schritte.length - 1}
                horizontal={false}
              />
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
