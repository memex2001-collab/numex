/**
 * Typdefinitionen für die SCAMPER-Sitzungsverwaltung.
 * Sitzungsdaten werden im localStorage des Browsers gespeichert.
 */

/** Eine einzelne Nutzerantwort für einen SCAMPER-Schritt */
export interface SchrittAntwort {
  /** Schritt-Index (0–6, entspricht S–R) */
  schritt: number;
  /** Antworttext des Nutzers */
  antwort: string;
  /** Unix-Zeitstempel der Speicherung */
  zeitstempel: number;
}

/** Vollständige SCAMPER-Sitzung eines Nutzers */
export interface ScamperSitzung {
  /** Eindeutige Sitzungs-ID (crypto.randomUUID()) */
  sitzungsId: string;
  /** Erstellungszeitpunkt (Unix) */
  erstelltAm: number;
  /** Letzter Aktualisierungszeitpunkt (Unix) */
  aktualisiertAm: number;
  /** Das Thema, das der Nutzer bearbeitet */
  thema: string;
  /** Aktuell aktiver Schritt (0–6); 7 bedeutet abgeschlossen */
  aktuellerSchritt: number;
  /** Alle gespeicherten Antworten */
  antworten: SchrittAntwort[];
  /** Gibt an ob alle 7 Schritte abgeschlossen wurden */
  abgeschlossen: boolean;
}
