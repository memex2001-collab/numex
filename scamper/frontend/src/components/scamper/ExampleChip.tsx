import { cn } from '../../lib/utils';

export interface ExampleChipProps {
  /** Text des Beispiel-Chips */
  text: string;
  /** Wird aufgerufen wenn der Chip geklickt wird */
  onClick: (text: string) => void;
  /** Gibt an ob dieser Chip gerade ausgewählt ist */
  ausgewaehlt?: boolean;
}

/**
 * Klickbarer Chip für Beispielthemen auf der Eingabeseite.
 * Beim Klick wird der Text direkt in das Eingabefeld übernommen.
 *
 * @example
 * <ExampleChip
 *   text="Ein Café in der Innenstadt"
 *   onClick={(text) => setThema(text)}
 * />
 */
export function ExampleChip({ text, onClick, ausgewaehlt = false }: ExampleChipProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p1',
        ausgewaehlt
          ? 'bg-p1 text-white border-p1'
          : 'bg-surface border-border text-text2 hover:border-p1 hover:text-p1 hover:bg-p1-l',
      )}
    >
      {text}
    </button>
  );
}
