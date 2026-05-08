import { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { AiMessageCard } from '../components/ui/AiMessageCard';
import { useStreaming } from '../hooks/useStreaming';
import { FOKUS_BEREICHE } from '../data/astrologie-optionen';
import { berechneSonnenzeichen, formatiereDatum, heuteFormatiert } from '../lib/sonnenzeichen';
import { cn } from '../lib/utils';

type Phase = 'eingabe' | 'ergebnis';

interface AnfrageBody {
  geburtsdatum: string;
  geburtszeit?: string;
  geburtsort?: string;
  fokus: string;
  frage?: string;
  aktuellesDatum: string;
}

export function AstrologiePage() {
  const [phase, setPhase] = useState<Phase>('eingabe');

  // Formular-Felder
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [geburtszeit, setGeburtszeit] = useState('');
  const [geburtsort, setGeburtsort] = useState('');
  const [fokus, setFokus] = useState('');
  const [frage, setFrage] = useState('');

  // Validierungsfehler
  const [datumFehler, setDatumFehler] = useState('');
  const [fokusFehler, setFokusFehler] = useState('');

  // Ergebnis-Zustand
  const [sonnenzeichen, setSonnenzeichen] = useState('');
  const letzteAnfrageRef = useRef<AnfrageBody | null>(null);

  const { inhalt, streamt, fehler, streamStarten, zuruecksetzen } = useStreaming();

  const heuteDatum = new Date().toISOString().split('T')[0];

  function handleStarten() {
    let gueltig = true;

    if (!geburtsdatum) {
      setDatumFehler('Bitte Geburtsdatum angeben.');
      gueltig = false;
    } else {
      setDatumFehler('');
    }

    if (!fokus) {
      setFokusFehler('Bitte einen Fokusbereich wählen.');
      gueltig = false;
    } else {
      setFokusFehler('');
    }

    if (!gueltig) return;

    const fokusBereich = FOKUS_BEREICHE.find((f) => f.id === fokus);
    const anfrage: AnfrageBody = {
      geburtsdatum: formatiereDatum(geburtsdatum),
      geburtszeit: geburtszeit || undefined,
      geburtsort: geburtsort || undefined,
      fokus: fokusBereich?.bezeichnung ?? fokus,
      frage: frage.trim() || undefined,
      aktuellesDatum: heuteFormatiert(),
    };

    letzteAnfrageRef.current = anfrage;
    setSonnenzeichen(berechneSonnenzeichen(geburtsdatum));
    zuruecksetzen();
    setPhase('ergebnis');
    void streamStarten('/api/astrologie', anfrage);
  }

  function handleNeuStarten() {
    zuruecksetzen();
    setPhase('eingabe');
  }

  function handleNochmalVersuchen() {
    if (!letzteAnfrageRef.current) return;
    zuruecksetzen();
    void streamStarten('/api/astrologie', letzteAnfrageRef.current);
  }

  // ── Ergebnis-Ansicht ────────────────────────────────────────────────────
  if (phase === 'ergebnis') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 einblenden">
        {/* Kopfzeile */}
        <div className="mb-7">
          <button
            onClick={handleNeuStarten}
            className="mb-5 flex items-center gap-1.5 text-sm text-text2 hover:text-text transition-colors"
          >
            ← Neue Interpretation
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-p1/30 bg-p1-l px-3 py-1 text-xs font-semibold text-p1-d">
              ✦ {sonnenzeichen}
            </div>
            {fokus && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface2 px-3 py-1 text-xs text-text2">
                {FOKUS_BEREICHE.find((f) => f.id === fokus)?.symbol}{' '}
                {FOKUS_BEREICHE.find((f) => f.id === fokus)?.bezeichnung}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-text">Deine astrologische Interpretation</h1>
        </div>

        {/* KI-Antwort */}
        <AiMessageCard inhalt={inhalt} streamt={streamt} />

        {/* Fehler-Banner */}
        {fehler && !streamt && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3 einblenden">
            <p className="text-sm text-red-700">Interpretation konnte nicht geladen werden.</p>
            <Button variante="secondary" groesse="sm" onClick={handleNochmalVersuchen}>
              Nochmal versuchen
            </Button>
          </div>
        )}

        {/* Abschluss-Aktion */}
        {!streamt && !fehler && inhalt && (
          <div className="mt-6 flex justify-end einblenden">
            <Button variante="secondary" onClick={handleNeuStarten}>
              Neue Interpretation →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── Eingabe-Formular ────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Seitenkopf */}
      <div className="text-center mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-p1/30 bg-p1-l px-4 py-1.5 text-xs font-semibold text-p1-d">
          <span>✦</span>
          Persönliche Deutung
        </div>
        <h1 className="text-3xl font-bold text-text mb-3">
          Deine <span className="text-p1-d">astrologische</span> Interpretation
        </h1>
        <p className="text-sm text-text2 leading-relaxed max-w-md mx-auto">
          Gib deine Geburtsdaten ein, wähle einen Fokusbereich — Claude erstellt eine persönliche
          Deutung basierend auf deinem Horoskop und den aktuellen Planetenkonstellationen.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-karte space-y-7">
        {/* Geburtsdaten */}
        <section>
          <div className="text-sm font-semibold text-text mb-3">Geburtsdaten</div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              bezeichnung="Geburtsdatum *"
              type="date"
              max={heuteDatum}
              value={geburtsdatum}
              onChange={(e) => {
                setGeburtsdatum(e.target.value);
                if (datumFehler) setDatumFehler('');
              }}
              fehler={datumFehler}
            />
            <Input
              bezeichnung="Geburtszeit"
              type="time"
              value={geburtszeit}
              onChange={(e) => setGeburtszeit(e.target.value)}
              hinweis="Für präzisen Aszendenten"
            />
          </div>
          <div className="mt-4">
            <Input
              bezeichnung="Geburtsort"
              type="text"
              placeholder="z.B. München, Bayern"
              value={geburtsort}
              onChange={(e) => setGeburtsort(e.target.value)}
              hinweis="Stadt und Land (optional)"
            />
          </div>
        </section>

        {/* Fokusbereich */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-text">Fokusbereich *</div>
            {fokusFehler && (
              <p className="text-xs text-red-600" role="alert">
                {fokusFehler}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FOKUS_BEREICHE.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setFokus(b.id);
                  if (fokusFehler) setFokusFehler('');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                  fokus === b.id
                    ? 'border-p1 bg-p1-l text-p1-d font-medium'
                    : 'border-border bg-surface hover:border-border2 hover:bg-surface2 text-text2',
                )}
              >
                <span className="shrink-0 text-base leading-none">{b.symbol}</span>
                <span className="leading-tight">{b.bezeichnung}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Persönliche Frage */}
        <Textarea
          bezeichnung="Persönliche Frage (optional)"
          placeholder="z.B. Wann ist der richtige Zeitpunkt für einen Jobwechsel?"
          value={frage}
          onChange={(e) => setFrage(e.target.value)}
          minZeilen={2}
          hinweis="Konkretisiert die Interpretation"
        />

        {/* Absenden */}
        <Button
          variante="primary"
          groesse="lg"
          volleBreite
          onClick={handleStarten}
        >
          Interpretation anfordern ✦
        </Button>
      </div>
    </div>
  );
}
