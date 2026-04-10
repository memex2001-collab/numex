import { useState, useCallback } from 'react';
import type { ScamperSitzung, SchrittAntwort } from '../types/session';

/** localStorage-Schlüssel für die SCAMPER-Sitzung */
const SPEICHER_SCHLUESSEL = 'numex_scamper_sitzung';

/** Maximales Alter einer Sitzung in Millisekunden (7 Tage) */
const MAX_SITZUNGSALTER_MS = 7 * 24 * 60 * 60 * 1000;

/** Erstellt eine neue, leere SCAMPER-Sitzung */
function erstelleSitzung(thema: string): ScamperSitzung {
  const jetzt = Date.now();
  return {
    sitzungsId: crypto.randomUUID(),
    erstelltAm: jetzt,
    aktualisiertAm: jetzt,
    thema,
    aktuellerSchritt: 0,
    antworten: [],
    abgeschlossen: false,
  };
}

/** Lädt eine Sitzung aus dem localStorage — null wenn nicht vorhanden oder abgelaufen */
function ladeSitzung(): ScamperSitzung | null {
  try {
    const rohdaten = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!rohdaten) return null;

    const sitzung = JSON.parse(rohdaten) as ScamperSitzung;

    // Abgelaufene Sitzungen automatisch löschen
    if (Date.now() - sitzung.erstelltAm > MAX_SITZUNGSALTER_MS) {
      localStorage.removeItem(SPEICHER_SCHLUESSEL);
      return null;
    }

    return sitzung;
  } catch {
    // Fehlerhafte Daten aus dem localStorage entfernen
    localStorage.removeItem(SPEICHER_SCHLUESSEL);
    return null;
  }
}

/** Speichert eine Sitzung im localStorage */
function speichereSitzung(sitzung: ScamperSitzung): void {
  localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(sitzung));
}

/** Rückgabewert des useSession-Hooks */
export interface SitzungsHookWert {
  /** Aktuelle Sitzung oder null wenn keine aktiv */
  sitzung: ScamperSitzung | null;
  /** Startet eine neue Sitzung mit dem gegebenen Thema */
  sitzungStarten: (thema: string) => ScamperSitzung;
  /** Speichert eine Antwort für einen Schritt und wechselt zum nächsten */
  antwortSpeichern: (schritt: number, antwort: string) => void;
  /** Schließt die Sitzung ab (alle Schritte erledigt) */
  sitzungAbschliessen: () => void;
  /** Löscht die aktuelle Sitzung vollständig */
  sitzungZuruecksetzen: () => void;
}

/**
 * Hook für die SCAMPER-Sitzungsverwaltung.
 * Sitzungsdaten werden im localStorage persistiert und überleben Browser-Refreshes.
 * Sitzungen älter als 7 Tage werden beim nächsten Laden automatisch gelöscht.
 */
export function useSession(): SitzungsHookWert {
  const [sitzung, setSitzungZustand] = useState<ScamperSitzung | null>(ladeSitzung);

  const sitzungStarten = useCallback((thema: string): ScamperSitzung => {
    const neueSitzung = erstelleSitzung(thema);
    speichereSitzung(neueSitzung);
    setSitzungZustand(neueSitzung);
    return neueSitzung;
  }, []);

  const antwortSpeichern = useCallback((schritt: number, antwort: string): void => {
    setSitzungZustand((vorherige) => {
      if (!vorherige) return vorherige;

      const neueAntwort: SchrittAntwort = {
        schritt,
        antwort,
        zeitstempel: Date.now(),
      };

      // Vorhandene Antwort für diesen Schritt ersetzen oder neue hinzufügen
      const aktualisierteAntworten = [
        ...vorherige.antworten.filter((a) => a.schritt !== schritt),
        neueAntwort,
      ];

      const naechsterSchritt = Math.min(schritt + 1, 7);
      const aktualisiert: ScamperSitzung = {
        ...vorherige,
        aktualisiertAm: Date.now(),
        aktuellerSchritt: naechsterSchritt,
        antworten: aktualisierteAntworten,
        abgeschlossen: schritt === 6, // Schritt 6 ist der letzte (R)
      };

      speichereSitzung(aktualisiert);
      return aktualisiert;
    });
  }, []);

  const sitzungAbschliessen = useCallback((): void => {
    setSitzungZustand((vorherige) => {
      if (!vorherige) return vorherige;
      const aktualisiert: ScamperSitzung = {
        ...vorherige,
        aktualisiertAm: Date.now(),
        abgeschlossen: true,
      };
      speichereSitzung(aktualisiert);
      return aktualisiert;
    });
  }, []);

  const sitzungZuruecksetzen = useCallback((): void => {
    localStorage.removeItem(SPEICHER_SCHLUESSEL);
    setSitzungZustand(null);
  }, []);

  return {
    sitzung,
    sitzungStarten,
    antwortSpeichern,
    sitzungAbschliessen,
    sitzungZuruecksetzen,
  };
}
