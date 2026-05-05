import { useState, useRef, useCallback } from 'react';

/** Optionen für den useStreaming-Hook */
interface StreamingOptionen {
  /** Wird für jedes eingehende Text-Delta aufgerufen */
  beiDelta?: (delta: string) => void;
  /** Wird aufgerufen wenn der Stream vollständig abgeschlossen ist */
  beiAbschluss?: (gesamtText: string) => void;
  /** Wird bei Netzwerk- oder API-Fehlern aufgerufen */
  beiFehler?: (fehler: Error) => void;
}

/** Rückgabewert des useStreaming-Hooks */
export interface StreamingHookWert {
  /** Der bisher empfangene Text (wächst während des Streamings) */
  inhalt: string;
  /** Gibt an ob gerade gestreamt wird */
  streamt: boolean;
  /** Letzter aufgetretener Fehler (null wenn kein Fehler) */
  fehler: Error | null;
  /** Startet einen neuen Stream — bricht vorherigen Stream ab */
  streamStarten: (url: string, body: unknown) => Promise<void>;
  /** Bricht den aktuellen Stream ab */
  abbrechen: () => void;
  /** Setzt den Zustand zurück (Inhalt + Fehler löschen) */
  zuruecksetzen: () => void;
}

/**
 * Hook für SSE-Streaming über die Fetch API.
 *
 * Verwendet fetch() + ReadableStream statt EventSource, da EventSource
 * keine POST-Anfragen oder Custom-Headers unterstützt.
 *
 * Erwartet SSE-Events im Format:
 *   data: {"type":"delta","content":"..."}\n\n
 *   data: {"type":"done"}\n\n
 *   data: {"type":"error","message":"..."}\n\n
 */
export function useStreaming(optionen: StreamingOptionen = {}): StreamingHookWert {
  const [inhalt, setInhalt] = useState('');
  const [streamt, setStreamt] = useState(false);
  const [fehler, setFehler] = useState<Error | null>(null);

  // Refs für Werte die nicht Re-Renders auslösen sollen
  const abbrechenRef = useRef<AbortController | null>(null);
  const gesamtTextRef = useRef('');

  const streamStarten = useCallback(
    async (url: string, body: unknown): Promise<void> => {
      // Vorherigen Stream abbrechen
      abbrechenRef.current?.abort();
      const controller = new AbortController();
      abbrechenRef.current = controller;

      // Zustand zurücksetzen
      setInhalt('');
      setFehler(null);
      setStreamt(true);
      gesamtTextRef.current = '';

      try {
        const antwort = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!antwort.ok || !antwort.body) {
          throw new Error(`HTTP-Fehler ${antwort.status}: ${antwort.statusText}`);
        }

        const leser = antwort.body.getReader();
        const dekoder = new TextDecoder();
        let puffer = '';

        // Stream Zeile für Zeile lesen
        while (true) {
          const { done, value } = await leser.read();
          if (done) break;

          puffer += dekoder.decode(value, { stream: true });

          // Vollständige Zeilen verarbeiten
          const zeilen = puffer.split('\n');
          puffer = zeilen.pop() ?? ''; // Unvollständige letzte Zeile im Puffer behalten

          for (const zeile of zeilen) {
            if (!zeile.startsWith('data: ')) continue;

            const daten = zeile.slice(6).trim();
            if (daten === '[DONE]') break;

            try {
              const ereignis = JSON.parse(daten) as {
                type: string;
                content?: string;
                message?: string;
              };

              if (ereignis.type === 'delta' && ereignis.content) {
                gesamtTextRef.current += ereignis.content;
                setInhalt((vor) => vor + ereignis.content!);
                optionen.beiDelta?.(ereignis.content);
              } else if (ereignis.type === 'done') {
                optionen.beiAbschluss?.(gesamtTextRef.current);
              } else if (ereignis.type === 'error') {
                throw new Error(ereignis.message ?? 'Stream-Fehler vom Server');
              }
            } catch (parseError) {
              // Fehlerhafte JSON-Zeile überspringen — nicht kritisch
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
      } catch (err) {
        // AbortError ignorieren (normales Abbrechen)
        if (err instanceof Error && err.name === 'AbortError') return;

        const fehlerObjekt = err instanceof Error ? err : new Error(String(err));
        setFehler(fehlerObjekt);
        optionen.beiFehler?.(fehlerObjekt);
      } finally {
        setStreamt(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const abbrechen = useCallback((): void => {
    abbrechenRef.current?.abort();
    setStreamt(false);
  }, []);

  const zuruecksetzen = useCallback((): void => {
    abbrechen();
    setInhalt('');
    setFehler(null);
    gesamtTextRef.current = '';
  }, [abbrechen]);

  return { inhalt, streamt, fehler, streamStarten, abbrechen, zuruecksetzen };
}
