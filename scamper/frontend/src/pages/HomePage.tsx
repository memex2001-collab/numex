import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

/**
 * Startseite — Einstieg in das Kreativitäts-App-Netzwerk.
 * Stellt die SCAMPER-Methode kurz vor und bietet zwei Einstiegspunkte.
 */
export function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero-Bereich */}
      <div className="text-center mb-16">
        {/* App-Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-p1/30 bg-p1-l px-4 py-1.5 text-xs font-semibold text-p1-d">
          <span className="h-1.5 w-1.5 rounded-full bg-p1" />
          Phase 1 — SCAMPER Pilotapp
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl mb-6">
          Kreativ denken{' '}
          <span className="text-p1">mit Methode</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-text2 leading-relaxed mb-10">
          Numex führt dich strukturiert durch bewährte Kreativitätsmethoden —
          Schritt für Schritt, mit Claude als deinem persönlichen KI-Coach.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/theorie">
            <Button variante="primary" groesse="lg">
              Mit SCAMPER starten →
            </Button>
          </Link>
          <Link to="/anwendung">
            <Button variante="secondary" groesse="lg">
              Direkt ausprobieren
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature-Karten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-16">
        {[
          {
            symbol: '🧭',
            titel: 'Geführt Schritt für Schritt',
            text: 'Keine Überwältigung. Du siehst immer nur den nächsten Schritt — von der Theorie bis zur Reflexion.',
            farbe: 'bg-p1-l border-p1/20',
          },
          {
            symbol: '🤖',
            titel: 'KI-Unterstützung auf Knopfdruck',
            text: 'Claude stellt dir personalisierte Fragen und Impulse — abgestimmt auf genau dein Thema.',
            farbe: 'bg-p2-l border-p2/20',
          },
          {
            symbol: '💡',
            titel: 'Ergebnisse sofort nutzbar',
            text: 'Am Ende hast du eine strukturierte Reflexion mit deinen stärksten Ideen und einem konkreten nächsten Schritt.',
            farbe: 'bg-p3-l border-p3/20',
          },
        ].map((karte, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-5 ${karte.farbe}`}
          >
            <div className="text-2xl mb-3">{karte.symbol}</div>
            <div className="font-semibold text-text mb-1.5">{karte.titel}</div>
            <p className="text-sm text-text2 leading-relaxed">{karte.text}</p>
          </div>
        ))}
      </div>

      {/* SCAMPER-Vorschau */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-text mb-2">Was ist SCAMPER?</h2>
          <p className="text-sm text-text2">
            Ein strukturiertes Akronym für 7 kreative Denkrichtungen
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { b: 'S', n: 'Substituieren', f: 'bg-p1-l text-p1-d' },
            { b: 'C', n: 'Combinieren', f: 'bg-p2-l text-p2-d' },
            { b: 'A', n: 'Adaptieren', f: 'bg-p3-l text-p3-d' },
            { b: 'M', n: 'Modifizieren', f: 'bg-p4-l text-p4-d' },
            { b: 'P', n: 'Put to use', f: 'bg-p1-l text-p1-d' },
            { b: 'E', n: 'Eliminieren', f: 'bg-p2-l text-p2-d' },
            { b: 'R', n: 'Reverse', f: 'bg-p3-l text-p3-d' },
          ].map((s) => (
            <div key={s.b} className={`flex items-center gap-2.5 rounded-xl p-3 ${s.f}`}>
              <span className="text-lg font-bold font-mono">{s.b}</span>
              <span className="text-xs font-medium leading-tight">{s.n}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/theorie">
            <Button variante="primary">
              Methode verstehen →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
