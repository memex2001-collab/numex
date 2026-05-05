import { useState, useRef, useCallback } from 'react';

interface StreamingOptionen {
  beiDelta?: (delta: string) => void;
  beiAbschluss?: (gesamtText: string) => void;
  beiFehler?: (fehler: Error) => void;
}

export interface StreamingHookWert {
  inhalt: string;
  streamt: boolean;
  fehler: Error | null;
  streamStarten: (url: string, body: unknown) => Promise<void>;
  abbrechen: () => void;
  zuruecksetzen: () => void;
}

export function useStreaming(optionen: StreamingOptionen = {}): StreamingHookWert {
  const [inhalt, setInhalt] = useState('');
  const [streamt, setStreamt] = useState(false);
  const [fehler, setFehler] = useState<Error | null>(null);

  const abbrechenRef = useRef<AbortController | null>(null);
  const gesamtTextRef = useRef('');

  const streamStarten = useCallback(
    async (url: string, body: unknown): Promise<void> => {
      abbrechenRef.current?.abort();
      const controller = new AbortController();
      abbrechenRef.current = controller;

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

        while (true) {
          const { done, value } = await leser.read();
          if (done) break;

          puffer += dekoder.decode(value, { stream: true });

          const zeilen = puffer.split('\n');
          puffer = zeilen.pop() ?? '';

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
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
      } catch (err) {
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
