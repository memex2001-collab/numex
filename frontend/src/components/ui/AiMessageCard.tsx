import { cn } from '../../lib/utils';

export interface AiMessageCardProps {
  /** Der anzuzeigende Text (wächst beim Streaming) */
  inhalt: string;
  /** Gibt an ob gerade gestreamt wird (zeigt Tipp-Indikator) */
  streamt?: boolean;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

/** Tipp-Indikator: drei pulsierende Punkte während des Streamings */
function TippIndikator() {
  return (
    <span className="inline-flex items-center gap-1 ml-1" aria-label="KI schreibt...">
      {[0, 150, 300].map((verzoegerung) => (
        <span
          key={verzoegerung}
          className="inline-block h-1.5 w-1.5 rounded-full bg-p1 animate-pulse"
          style={{ animationDelay: `${verzoegerung}ms` }}
        />
      ))}
    </span>
  );
}

/**
 * Karte zur Darstellung von KI-Antworten mit Streaming-Unterstützung.
 *
 * Visuell erkennbar durch:
 * - Lila Akzentlinie auf der linken Seite
 * - Hellvioletter Hintergrund
 * - KI-Avatar mit Initialen
 *
 * @example
 * <AiMessageCard inhalt={streamingText} streamt={isStreaming} />
 */
export function AiMessageCard({ inhalt, streamt = false, className }: AiMessageCardProps) {
  const istLeer = !inhalt && !streamt;

  return (
    <div
      className={cn(
        'relative rounded-2xl bg-p1-l px-5 py-4',
        'border border-p1/20',
        className,
      )}
      role="region"
      aria-label="KI-Antwort"
      aria-live="polite"
      aria-busy={streamt}
    >
      {/* Lila Akzentlinie links */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-p1" aria-hidden="true" />

      <div className="flex items-start gap-3">
        {/* KI-Avatar */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-p1 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          KI
        </div>

        {/* Inhalt */}
        <div className="flex-1 min-w-0">
          {istLeer ? (
            /* Platzhalter-Skelett während des ersten Ladens */
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-p1/20 animate-pulse" />
              <div className="h-3 w-full rounded bg-p1/20 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-p1/20 animate-pulse" />
            </div>
          ) : (
            <p
              className={cn(
                'text-sm text-text leading-relaxed whitespace-pre-wrap',
                streamt && 'tipp-cursor',
              )}
            >
              {inhalt}
              {streamt && inhalt === '' && <TippIndikator />}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
