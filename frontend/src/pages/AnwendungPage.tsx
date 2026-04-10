import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { AiMessageCard } from '../components/ui/AiMessageCard';
import { Stepper, type StepperSchritt } from '../components/ui/Stepper';
import { ExampleChip } from '../components/scamper/ExampleChip';
import { useSession } from '../hooks/useSession';
import { useStreaming } from '../hooks/useStreaming';
import { hilfeAnfragen } from '../lib/api';
import { SCAMPER_SCHRITTE } from '../data/scamper-schritte';

/** Beispielthemen für die Chip-Auswahl */
const BEISPIELTHEMEN = [
  'Ein Café in der Innenstadt',
  'Eine mobile App für Routenplanung',
  'Online-Kurs für Fotografie',
  'Fahrradverleih-Service',
  'Buchclub mit monatlichen Treffen',
];

/** Minimale Zeichenanzahl für die Thema-Eingabe */
const MIN_THEMA_LAENGE = 10;

/** Minimale Zeichenanzahl für eine Schritt-Antwort */
const MIN_ANTWORT_LAENGE = 20;

/** Phasen der Anwendungsseite */
type Phase = 'eingabe' | 'schritte';

/**
 * Modul 2 — Geführte SCAMPER-Anwendung.
 *
 * Ablauf:
 * 1. Thema-Eingabe (falls noch keine Sitzung)
 * 2. Schritt für Schritt durch alle 7 SCAMPER-Schritte
 * 3. Weiterleitung zu Modul 3 (Reflexion) nach dem letzten Schritt
 */
export function AnwendungPage() {
  const navigate = useNavigate();
  const { sitzung, sitzungStarten, antwortSpeichern } = useSession();

  // Aktuelle Phase bestimmen
  const [phase, setPhase] = useState<Phase>(sitzung && !sitzung.abgeschlossen ? 'schritte' : 'eingabe');

  // Thema-Eingabe Zustand
  const [themaEingabe, setThemaEingabe] = useState('');
  const [themaFehler, setThemaFehler] = useState('');

  // Schritt-Antwort Zustand
  const [antwortEingabe, setAntwortEingabe] = useState('');

  // Hilfe-Zustand
  const [hilfe, setHilfe] = useState<string | null>(null);
  const [laeadtHilfe, setLaedtHilfe] = useState(false);
  const [hilfeFehler, setHilfeFehler] = useState<string | null>(null);

  // KI-Streaming für Schritt-Impulse
  const { inhalt: kiInhalt, streamt, fehler: streamFehler, streamStarten, zuruecksetzen } = useStreaming();

  // Aktueller Schritt (aus der Sitzung)
  const aktuellerSchritt = sitzung?.aktuellerSchritt ?? 0;
  const aktuellerSchrittDaten = SCAMPER_SCHRITTE[aktuellerSchritt];

  // Weiterleitung wenn Sitzung abgeschlossen
  useEffect(() => {
    if (sitzung?.abgeschlossen) {
      navigate('/reflexion');
    }
  }, [sitzung?.abgeschlossen, navigate]);

  // KI-Impuls laden wenn ein neuer Schritt beginnt
  useEffect(() => {
    if (phase !== 'schritte' || !sitzung) return;

    zuruecksetzen();
    setAntwortEingabe('');
    setHilfe(null);
    setHilfeFehler(null);

    const bisherigeAntworten = sitzung.antworten.map((a) => ({
      schritt: a.schritt,
      antwort: a.antwort,
    }));

    streamStarten('/api/chat', {
      thema: sitzung.thema,
      schritt: aktuellerSchritt,
      bisherigeAntworten,
    });
    // Nur beim Schrittwechsel auslösen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktuellerSchritt, phase]);

  /** Sitzung mit neuem Thema starten */
  function handleThemaStarten() {
    if (themaEingabe.trim().length < MIN_THEMA_LAENGE) {
      setThemaFehler(`Bitte mindestens ${MIN_THEMA_LAENGE} Zeichen eingeben.`);
      return;
    }
    setThemaFehler('');
    sitzungStarten(themaEingabe.trim());
    setPhase('schritte');
  }

  /** Antwort speichern und zum nächsten Schritt wechseln */
  function handleWeiter() {
    if (antwortEingabe.trim().length < MIN_ANTWORT_LAENGE) return;
    antwortSpeichern(aktuellerSchritt, antwortEingabe.trim());
    // Der useEffect reagiert auf aktuellerSchritt-Änderung und lädt den nächsten Impuls
  }

  /** Hilfe-Hinweis laden */
  const handleHilfe = useCallback(async () => {
    if (!sitzung || laeadtHilfe) return;

    setLaedtHilfe(true);
    setHilfeFehler(null);

    try {
      const ergebnis = await hilfeAnfragen({
        thema: sitzung.thema,
        schritt: aktuellerSchritt,
        bisherigeTeilEingabe: antwortEingabe || undefined,
      });
      setHilfe(ergebnis.hinweis);
    } catch {
      setHilfeFehler('Hilfe konnte nicht geladen werden. Bitte nochmal versuchen.');
    } finally {
      setLaedtHilfe(false);
    }
  }, [sitzung, aktuellerSchritt, antwortEingabe, laeadtHilfe]);

  /** Stepper-Schritte aus den SCAMPER-Daten und der Sitzung aufbauen */
  function erstelleStepperSchritte(): StepperSchritt[] {
    return SCAMPER_SCHRITTE.map((s) => ({
      bezeichnung: `${s.buchstabe} – ${s.name.split(' ')[0]}`,
      zustand:
        s.index < aktuellerSchritt
          ? 'abgeschlossen'
          : s.index === aktuellerSchritt
            ? 'aktiv'
            : 'ausstehend',
    }));
  }

  const weiterAktiv = antwortEingabe.trim().length >= MIN_ANTWORT_LAENGE && !streamt;

  // ── Phase 1: Thema-Eingabe ──────────────────────────────────────────────
  if (phase === 'eingabe') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-p1/30 bg-p1-l px-4 py-1.5 text-xs font-semibold text-p1-d">
            <span className="h-1.5 w-1.5 rounded-full bg-p1" />
            Modul 2 von 3 — Anwendung
          </div>
          <h1 className="text-3xl font-bold text-text mb-3">
            Was möchtest du <span className="text-p1">entwickeln</span>?
          </h1>
          <p className="text-sm text-text2 leading-relaxed">
            Beschreibe dein Thema kurz — eine Idee, ein Problem oder ein Produkt.
            Claude führt dich dann durch alle 7 SCAMPER-Schritte.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-karte">
          <Textarea
            bezeichnung="Dein Thema"
            placeholder="z.B. Ein Café in der Innenstadt, das sich von anderen abheben möchte..."
            value={themaEingabe}
            onChange={(e) => {
              setThemaEingabe(e.target.value);
              if (themaFehler) setThemaFehler('');
            }}
            fehler={themaFehler}
            minZeilen={3}
          />

          {/* Beispiel-Chips */}
          <div className="mt-4">
            <div className="text-xs text-text3 mb-2">Beispiele:</div>
            <div className="flex flex-wrap gap-2">
              {BEISPIELTHEMEN.map((beispiel) => (
                <ExampleChip
                  key={beispiel}
                  text={beispiel}
                  onClick={(t) => {
                    setThemaEingabe(t);
                    setThemaFehler('');
                  }}
                  ausgewaehlt={themaEingabe === beispiel}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button
              variante="primary"
              groesse="lg"
              volleBreite
              onClick={handleThemaStarten}
              disabled={themaEingabe.trim().length < MIN_THEMA_LAENGE}
            >
              SCAMPER starten →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: Schritt-für-Schritt-Anwendung ─────────────────────────────
  if (!sitzung || !aktuellerSchrittDaten) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-text2">
        Lade Sitzung…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Kopf: Thema + Schritt-Nummer */}
      <div className="mb-6">
        <div className="text-xs text-text3 mb-1">Dein Thema</div>
        <div className="font-semibold text-text text-lg leading-snug">{sitzung.thema}</div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper schritte={erstelleStepperSchritte()} />
      </div>

      {/* Schritt-Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-p1-l text-xl font-bold text-p1-d border border-p1/20">
          {aktuellerSchrittDaten.buchstabe}
        </div>
        <div>
          <div className="text-xs text-text3 font-medium">
            Schritt {aktuellerSchritt + 1} von {SCAMPER_SCHRITTE.length}
          </div>
          <div className="font-semibold text-text">
            {aktuellerSchrittDaten.name}{' '}
            <span className="text-text2 font-normal">— {aktuellerSchrittDaten.leitfrage}</span>
          </div>
        </div>
      </div>

      {/* KI-Impuls */}
      <div className="mb-5">
        <AiMessageCard inhalt={kiInhalt} streamt={streamt} />
      </div>

      {/* Streaming-Fehler */}
      {streamFehler && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">KI-Antwort konnte nicht geladen werden.</p>
          <Button
            variante="secondary"
            groesse="sm"
            onClick={() =>
              streamStarten('/api/chat', {
                thema: sitzung.thema,
                schritt: aktuellerSchritt,
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

      {/* Nutzer-Antwort */}
      <div className="mb-4">
        <Textarea
          bezeichnung="Deine Antwort"
          placeholder={`Was fällt dir zu „${aktuellerSchrittDaten.leitfrage}" ein?`}
          value={antwortEingabe}
          onChange={(e) => setAntwortEingabe(e.target.value)}
          minZeilen={4}
          hinweis={
            antwortEingabe.length > 0 && antwortEingabe.length < MIN_ANTWORT_LAENGE
              ? `Noch ${MIN_ANTWORT_LAENGE - antwortEingabe.length} Zeichen…`
              : undefined
          }
        />
      </div>

      {/* Hilfe-Antwort */}
      {hilfe && (
        <div className="mb-4 rounded-xl border border-p3/20 bg-p3-l px-4 py-3 einblenden">
          <div className="text-xs font-semibold text-p3-d mb-1">💡 Hinweis</div>
          <p className="text-sm text-text leading-relaxed">{hilfe}</p>
        </div>
      )}

      {/* Hilfe-Fehler */}
      {hilfeFehler && (
        <p className="mb-4 text-xs text-red-600">{hilfeFehler}</p>
      )}

      {/* Aktions-Zeile */}
      <div className="flex items-center gap-3">
        <Button
          variante="ghost"
          groesse="sm"
          onClick={handleHilfe}
          laedt={laeadtHilfe}
          disabled={streamt}
        >
          💡 Ich brauche Hilfe
        </Button>

        <div className="flex-1" />

        <Button
          variante="primary"
          onClick={handleWeiter}
          disabled={!weiterAktiv}
        >
          {aktuellerSchritt < SCAMPER_SCHRITTE.length - 1
            ? 'Weiter →'
            : 'Abschließen →'}
        </Button>
      </div>
    </div>
  );
}
