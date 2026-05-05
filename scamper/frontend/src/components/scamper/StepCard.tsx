import { useState } from 'react';
import type { ScamperSchritt, FarbToken } from '../../types/scamper';
import { cn } from '../../lib/utils';

/** Hintergrundfarbe je Farb-Token */
const HINTERGRUNDFARBE: Record<FarbToken, string> = {
  p1: 'bg-p1-l border-p1/30',
  p2: 'bg-p2-l border-p2/30',
  p3: 'bg-p3-l border-p3/30',
  p4: 'bg-p4-l border-p4/30',
};

/** Textfarbe für den Buchstaben je Farb-Token */
const BUCHSTABENFARBE: Record<FarbToken, string> = {
  p1: 'text-p1 bg-p1-l',
  p2: 'text-p2 bg-p2-l',
  p3: 'text-p3 bg-p3-l',
  p4: 'text-p4 bg-p4-l',
};

export interface StepCardProps {
  /** Der anzuzeigende SCAMPER-Schritt */
  schritt: ScamperSchritt;
  /** Gibt an ob die Karte initial geöffnet ist */
  initialGeoeffnet?: boolean;
}

/**
 * Interaktive Karte für einen SCAMPER-Schritt.
 * Beim Klick werden Details, Beispielfragen und häufige Blockaden angezeigt.
 */
export function StepCard({ schritt, initialGeoeffnet = false }: StepCardProps) {
  const [geoeffnet, setGeoeffnet] = useState(initialGeoeffnet);

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        HINTERGRUNDFARBE[schritt.farbe],
      )}
    >
      {/* Karten-Kopf (immer sichtbar, klickbar) */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left"
        onClick={() => setGeoeffnet((v) => !v)}
        aria-expanded={geoeffnet}
        aria-controls={`step-details-${schritt.index}`}
      >
        {/* Buchstaben-Abzeichen */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            'text-lg font-bold border',
            BUCHSTABENFARBE[schritt.farbe],
          )}
          aria-hidden="true"
        >
          {schritt.buchstabe}
        </div>

        {/* Titel und Leitfrage */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text text-sm">{schritt.name}</div>
          <div className="text-xs text-text2 mt-0.5">{schritt.leitfrage}</div>
        </div>

        {/* Chevron-Pfeil */}
        <svg
          className={cn(
            'h-4 w-4 shrink-0 text-text2 transition-transform duration-200',
            geoeffnet && 'rotate-180',
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Ausgeklappter Bereich */}
      {geoeffnet && (
        <div
          id={`step-details-${schritt.index}`}
          className="border-t border-current/10 px-4 pb-4 pt-3 einblenden"
        >
          {/* Beschreibung */}
          <p className="text-sm text-text mb-3">{schritt.beschreibung}</p>

          {/* Beispielfragen */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-text2 uppercase tracking-wider mb-2">
              Leitfragen
            </div>
            <ul className="space-y-1.5">
              {schritt.fragen.map((frage, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0 opacity-40" />
                  {frage}
                </li>
              ))}
            </ul>
          </div>

          {/* Häufige Blockade */}
          <div className="rounded-xl border border-current/15 bg-white/50 p-3">
            <div className="text-xs font-semibold text-text2 mb-1">⚠️ Häufige Blockade</div>
            <p className="text-xs text-text2">{schritt.blockade}</p>
          </div>
        </div>
      )}
    </div>
  );
}
