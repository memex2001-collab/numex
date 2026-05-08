import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Beschriftung über dem Eingabefeld */
  bezeichnung?: string;
  /** Fehlermeldung (rot hervorgehoben) */
  fehler?: string;
  /** Optionaler Hinweistext unter dem Eingabefeld */
  hinweis?: string;
}

/**
 * Eingabefeld-Komponente mit Beschriftung, Fehler- und Hinweistext.
 *
 * @example
 * <Input
 *   bezeichnung="Dein Thema"
 *   placeholder="z.B. Ein Café in der Innenstadt"
 *   fehler={fehlerNachricht}
 * />
 */
export function Input({
  bezeichnung,
  fehler,
  hinweis,
  className,
  id,
  ...rest
}: InputProps) {
  // Eindeutige ID für die Verknüpfung von Label und Input (Barrierefreiheit)
  const eingabeId = id ?? (bezeichnung ? `eingabe-${bezeichnung.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1">
      {bezeichnung && (
        <label
          htmlFor={eingabeId}
          className="text-sm font-medium text-text"
        >
          {bezeichnung}
        </label>
      )}

      <input
        id={eingabeId}
        className={cn(
          'w-full rounded-xl border bg-surface px-3 py-2 text-sm text-text',
          'placeholder:text-text3',
          'transition-shadow duration-150',
          'focus:outline-none focus:ring-2 focus:ring-p1 focus:border-p1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          fehler
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-border hover:border-border2',
          className,
        )}
        aria-invalid={fehler ? 'true' : undefined}
        aria-describedby={
          fehler ? `${eingabeId}-fehler` : hinweis ? `${eingabeId}-hinweis` : undefined
        }
        {...rest}
      />

      {fehler && (
        <p id={`${eingabeId}-fehler`} className="text-xs text-red-600" role="alert">
          {fehler}
        </p>
      )}

      {hinweis && !fehler && (
        <p id={`${eingabeId}-hinweis`} className="text-xs text-text2">
          {hinweis}
        </p>
      )}
    </div>
  );
}
