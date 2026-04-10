import { useState } from 'react';
import { cn } from '../../lib/utils';

/** Eine einzelne FAQ-Frage mit Antwort */
export interface FaqEintrag {
  frage: string;
  antwort: string;
}

export interface FaqAccordionProps {
  /** Liste aller FAQ-Einträge */
  eintraege: FaqEintrag[];
}

/**
 * Akkordeon-Komponente für FAQ-Einträge.
 * Es ist immer nur ein Eintrag gleichzeitig geöffnet.
 */
export function FaqAccordion({ eintraege }: FaqAccordionProps) {
  const [offenerIndex, setOffenerIndex] = useState<number | null>(null);

  function umschalten(index: number) {
    setOffenerIndex((vor) => (vor === index ? null : index));
  }

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
      {eintraege.map((eintrag, i) => {
        const istOffen = offenerIndex === i;

        return (
          <div key={i}>
            <button
              className={cn(
                'w-full flex items-center justify-between gap-4 px-5 py-4 text-left',
                'hover:bg-surface2 transition-colors duration-150',
              )}
              onClick={() => umschalten(i)}
              aria-expanded={istOffen}
              aria-controls={`faq-antwort-${i}`}
            >
              <span className="text-sm font-medium text-text">{eintrag.frage}</span>

              <svg
                className={cn(
                  'h-4 w-4 shrink-0 text-text2 transition-transform duration-200',
                  istOffen && 'rotate-180',
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

            {istOffen && (
              <div
                id={`faq-antwort-${i}`}
                className="px-5 pb-4 pt-0 einblenden"
              >
                <p className="text-sm text-text2 leading-relaxed">{eintrag.antwort}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
