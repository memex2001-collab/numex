import { cn } from '../../lib/utils';

export interface AiMessageCardProps {
  inhalt: string;
  streamt?: boolean;
  className?: string;
}

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

export function AiMessageCard({ inhalt, streamt = false, className }: AiMessageCardProps) {
  const istLeer = !inhalt && !streamt;

  return (
    <div
      className={cn(
        'relative rounded-2xl bg-p1-l px-5 py-4 border border-p1/20',
        className,
      )}
      role="region"
      aria-label="Astrologische Interpretation"
      aria-live="polite"
      aria-busy={streamt}
    >
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-p1" aria-hidden="true" />

      <div className="flex items-start gap-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-p1 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          ✦
        </div>

        <div className="flex-1 min-w-0">
          {istLeer ? (
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
