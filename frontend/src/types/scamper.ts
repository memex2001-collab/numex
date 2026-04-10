/**
 * Typdefinitionen für die SCAMPER-Methode und ihre 7 Schritte.
 */

/** Farb-Token aus dem Design-System */
export type FarbToken = 'p1' | 'p2' | 'p3' | 'p4';

/** Ein einzelner SCAMPER-Schritt mit allen Metadaten */
export interface ScamperSchritt {
  /** Schritt-Index (0–6) */
  index: number;
  /** Buchstabenkürzel (S, C, A, M, P, E, R) */
  buchstabe: string;
  /** Ausgeschriebener Name */
  name: string;
  /** Kurze Leitfrage */
  leitfrage: string;
  /** Ein-Satz-Erklärung der Methode */
  beschreibung: string;
  /** 2–3 konkrete Beispielfragen für den Nutzer */
  fragen: string[];
  /** Häufige Blockade oder Fehler bei diesem Schritt */
  blockade: string;
  /** Farb-Token für visuelle Differenzierung */
  farbe: FarbToken;
}
