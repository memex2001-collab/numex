/**
 * Allgemeine Hilfsfunktionen.
 */

/**
 * Verknüpft CSS-Klassennamen und filtert falsy-Werte heraus.
 * Vereinfachte Alternative zu clsx/classnames.
 *
 * @example cn('basis', bedingung && 'optional', false) → 'basis optional'
 */
export function cn(...klassen: (string | undefined | null | false)[]): string {
  return klassen.filter(Boolean).join(' ');
}

/**
 * Formatiert einen Unix-Zeitstempel als lesbares deutsches Datum.
 */
export function formatiereZeitstempel(unix: number): string {
  return new Date(unix).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Kürzt einen Text auf eine maximale Zeichenanzahl und fügt Auslassungspunkte an.
 */
export function kuerze(text: string, maxLaenge: number): string {
  if (text.length <= maxLaenge) return text;
  return text.slice(0, maxLaenge).trimEnd() + '…';
}
