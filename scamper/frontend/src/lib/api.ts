/**
 * API-Client für die Kommunikation mit dem Numex-Backend.
 * Alle Anfragen gehen über den Vite-Proxy zu /api/*
 */

/** Parameter für eine Chat-Anfrage */
export interface ChatAnfrageParams {
  thema: string;
  schritt: number;
  bisherigeAntworten?: { schritt: number; antwort: string }[];
  nutzereingabe?: string;
}

/** Parameter für eine Hilfe-Anfrage */
export interface HilfeAnfrageParams {
  thema: string;
  schritt: number;
  bisherigeTeilEingabe?: string;
}

/** Antwort des Hilfe-Endpunkts */
export interface HilfeAntwort {
  hinweis: string;
}

/**
 * Startet eine SSE-Streaming-Anfrage für den aktuellen SCAMPER-Schritt.
 * Gibt die fetch-Response zurück — der Aufrufer ist für das Stream-Lesen verantwortlich.
 */
export async function chatAnfragenStarten(params: ChatAnfrageParams): Promise<Response> {
  const antwort = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(params),
  });

  if (!antwort.ok) {
    throw new Error(`Chat-Anfrage fehlgeschlagen: HTTP ${antwort.status}`);
  }

  return antwort;
}

/**
 * Fragt einen kurzen Hilfehinweis ab (nicht gestreamt).
 */
export async function hilfeAnfragen(params: HilfeAnfrageParams): Promise<HilfeAntwort> {
  const antwort = await fetch('/api/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!antwort.ok) {
    throw new Error(`Hilfe-Anfrage fehlgeschlagen: HTTP ${antwort.status}`);
  }

  return antwort.json() as Promise<HilfeAntwort>;
}
