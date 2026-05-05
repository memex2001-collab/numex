import { useRef, useEffect, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Beschriftung über dem Textfeld */
  bezeichnung?: string;
  /** Fehlermeldung (rot hervorgehoben) */
  fehler?: string;
  /** Optionaler Hinweistext unter dem Textfeld */
  hinweis?: string;
  /** Automatische Höhenanpassung an den Inhalt (Standard: true) */
  autoGroesse?: boolean;
  /** Mindestanzahl sichtbarer Zeilen (Standard: 3) */
  minZeilen?: number;
}

/**
 * Mehrzeiliges Textfeld mit optionaler Auto-Größenanpassung.
 * Die Höhe wächst automatisch mit dem Inhalt mit.
 *
 * @example
 * <Textarea
 *   bezeichnung="Deine Ideen"
 *   placeholder="Schreib deine Antwort hier..."
 *   value={antwort}
 *   onChange={(e) => setAntwort(e.target.value)}
 * />
 */
export function Textarea({
  bezeichnung,
  fehler,
  hinweis,
  autoGroesse = true,
  minZeilen = 3,
  className,
  id,
  value,
  onChange,
  ...rest
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Höhe automatisch anpassen wenn sich der Inhalt ändert
  useEffect(() => {
    if (!autoGroesse || !textareaRef.current) return;

    const el = textareaRef.current;
    el.style.height = 'auto'; // Erst zurücksetzen
    el.style.height = `${el.scrollHeight}px`; // Dann auf Inhalts-Höhe setzen
  }, [value, autoGroesse]);

  const eingabeId =
    id ?? (bezeichnung ? `textarea-${bezeichnung.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1">
      {bezeichnung && (
        <label htmlFor={eingabeId} className="text-sm font-medium text-text">
          {bezeichnung}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={eingabeId}
        rows={minZeilen}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full rounded-xl border bg-surface px-3 py-2 text-sm text-text',
          'placeholder:text-text3 resize-none overflow-hidden',
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
