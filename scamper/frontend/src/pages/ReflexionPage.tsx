import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AiMessageCard } from '../components/ui/AiMessageCard';
import { useSession } from '../hooks/useSession';
import { useStreaming } from '../hooks/useStreaming';
import { SCAMPER_SCHRITTE } from '../data/scamper-schritte';

/**
 * Modul 3 — Reflexion und Abschluss.
 *
 * Zeigt:
 * 1. Übersicht aller 7 Schritt-Antworten
 * 2. Claude-Gesamtzusammenfassung (gestreamt)
 * 3. Weiter-Optionen: neues Thema starten oder zur Startseite
 */
export function ReflexionPage() {
  const navigate = useNavigate();
  const { sitzung, sitzungZuruecksetzen } = useSession();
  const { inhalt: kiInhalt, streamt, fehler, streamStarten } = useStreaming();
  const [offeneAntwort, setOffeneAntwort] = useState<number | null>(null);

  // Weiterleitung wenn keine abgeschlossene Sitzung vorhanden
  useEffect(() => {
    if (!sitzung) {
      navigate('/anwendung');
      return;
    }
    if (!sitzung.abgeschlossen && sitzung.aktuellerSchritt < 7) {
      navigate('/anwendung');
    }
  }, [sitzung, navigate]);

  // Reflexions-Zusammenfassung laden sobald die Seite erscheint
  useEffect(() => {
    if (!sitzung?.abgeschlossen) return;

    const bisherigeAntworten = sitzung.antworten.map((a) => ({
      schritt: a.schritt,
      antwort: a.antwort,
    }));

    streamStarten('/api/chat', {
      thema: sitzung.thema,
      schritt: 7, // Schritt 7 = Reflexions-Prompt
      bisherigeAntworten,
    });
    // Nur einmal beim Laden auslösen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sitzung) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-text2">
        Lade Sitzung…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Kopfzeile */}
      <div className="text-center mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-p2/30 bg-p2-l px-4 py-1.5 text-xs font-semibold text-p2-d">
          <span className="h-1.5 w-1.5 rounded-full bg-p2" />
          Modul 3 von 3 — Reflexion
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">
          SCAMPER abgeschlossen 🎉
        </h1>
        <p className="text-sm text-text2">
          Thema: <span className="font-medium text-text">{sitzung.thema}</span>
        </p>
      </div>

      {/* Claude-Zusammenfassung */}
      <section className="mb-8" aria-label="KI-Zusammenfassung">
        <h2 className="text-base font-semibold text-text mb-3">
          Deine SCAMPER-Reflexion
        </h2>
        <AiMessageCard inhalt={kiInhalt} streamt={streamt} />

        {fehler && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">Zusammenfassung konnte nicht geladen werden.</p>
            <Button
              variante="secondary"
              groesse="sm"
              onClick={() =>
                streamStarten('/api/chat', {
                  thema: sitzung.thema,
                  schritt: 7,
                  bisherigeAntworten: sitzung.antworten.map((a) => ({
                    schritt: a.schritt,
                    antwort: a.antwort,
                  })),
                })
              }
            >
              Nochmal versuchen
            </Button>
          </div>
        )}
      </section>

      {/* Alle 7 Antworten — Akkordeon */}
      <section className="mb-8" aria-label="Alle Antworten">
        <h2 className="text-base font-semibold text-text mb-3">
          Deine Antworten im Überblick
        </h2>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden divide-y divide-border">
          {SCAMPER_SCHRITTE.map((schrittDaten) => {
            const antwort = sitzung.antworten.find((a) => a.schritt === schrittDaten.index);
            const istOffen = offeneAntwort === schrittDaten.index;

            return (
              <div key={schrittDaten.index}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface2 transition-colors"
                  onClick={() => setOffeneAntwort(istOffen ? null : schrittDaten.index)}
                  aria-expanded={istOffen}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-p1-l text-xs font-bold text-p1-d">
                    {schrittDaten.buchstabe}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium text-text">{schrittDaten.name}</div>
                    {!istOffen && antwort && (
                      <div className="text-xs text-text2 truncate mt-0.5">
                        {antwort.antwort.slice(0, 80)}{antwort.antwort.length > 80 ? '…' : ''}
                      </div>
                    )}
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 text-text3 transition-transform duration-200 ${istOffen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {istOffen && (
                  <div className="px-4 pb-3 einblenden">
                    {antwort ? (
                      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                        {antwort.antwort}
                      </p>
                    ) : (
                      <p className="text-sm text-text3 italic">Keine Antwort gespeichert.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Abschluss-Aktionen */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variante="primary"
          groesse="lg"
          volleBreite
          onClick={() => {
            sitzungZuruecksetzen();
            navigate('/anwendung');
          }}
        >
          Neues Thema starten
        </Button>
        <Link to="/" className="flex-1">
          <Button variante="secondary" groesse="lg" volleBreite>
            Zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
}
