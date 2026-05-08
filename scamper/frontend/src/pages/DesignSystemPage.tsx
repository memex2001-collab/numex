import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Stepper } from '../components/ui/Stepper';
import { AiMessageCard } from '../components/ui/AiMessageCard';
import { ExampleChip } from '../components/scamper/ExampleChip';
import { StepCard } from '../components/scamper/StepCard';
import { FaqAccordion } from '../components/scamper/FaqAccordion';
import { SCAMPER_SCHRITTE } from '../data/scamper-schritte';

/**
 * Design-System-Übersichtsseite (nur in der Entwicklungsumgebung sichtbar).
 * Zeigt alle Komponenten in allen Varianten und Zuständen.
 */
export function DesignSystemPage() {
  const [ausgewaehltesBeispiel, setAusgewaehltesBeispiel] = useState('');
  const [eingabeWert, setEingabeWert] = useState('');
  const [textareaWert, setTextareaWert] = useState('');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-text mb-1">Design System</h1>
        <p className="text-sm text-text2">Nur in der Entwicklungsumgebung sichtbar.</p>
      </div>

      {/* ── Farb-Tokens ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">Farb-Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'p1', label: 'Primär', bg: 'bg-p1', text: 'text-white' },
            { name: 'p1-l', label: 'Primär Hell', bg: 'bg-p1-l', text: 'text-p1-d' },
            { name: 'p2', label: 'Sekundär', bg: 'bg-p2', text: 'text-white' },
            { name: 'p2-l', label: 'Sekundär Hell', bg: 'bg-p2-l', text: 'text-p2-d' },
            { name: 'p3', label: 'Amber', bg: 'bg-p3', text: 'text-white' },
            { name: 'p3-l', label: 'Amber Hell', bg: 'bg-p3-l', text: 'text-p3-d' },
            { name: 'p4', label: 'Blau', bg: 'bg-p4', text: 'text-white' },
            { name: 'p4-l', label: 'Blau Hell', bg: 'bg-p4-l', text: 'text-p4-d' },
          ].map((f) => (
            <div key={f.name} className={`rounded-xl p-3 ${f.bg} ${f.text}`}>
              <div className="text-xs font-mono mb-1 opacity-70">{f.name}</div>
              <div className="text-sm font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Button ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">Button</h2>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variante="primary">Primary</Button>
            <Button variante="secondary">Secondary</Button>
            <Button variante="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variante="primary" groesse="sm">Klein</Button>
            <Button variante="primary" groesse="md">Mittel</Button>
            <Button variante="primary" groesse="lg">Groß</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variante="primary" laedt>Lädt…</Button>
            <Button variante="primary" disabled>Deaktiviert</Button>
          </div>
        </div>
      </section>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">Input</h2>
        <div className="space-y-4 max-w-sm">
          <Input
            bezeichnung="Normales Eingabefeld"
            placeholder="Beispieltext eingeben…"
            value={eingabeWert}
            onChange={(e) => setEingabeWert(e.target.value)}
          />
          <Input
            bezeichnung="Mit Fehler"
            placeholder="Falscher Wert"
            fehler="Das ist ein Pflichtfeld."
          />
          <Input
            bezeichnung="Deaktiviert"
            value="Nicht bearbeitbar"
            disabled
          />
        </div>
      </section>

      {/* ── Textarea ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">Textarea</h2>
        <div className="space-y-4 max-w-sm">
          <Textarea
            bezeichnung="Auto-Größe"
            placeholder="Schreib hier etwas — das Feld wächst automatisch…"
            value={textareaWert}
            onChange={(e) => setTextareaWert(e.target.value)}
          />
          <Textarea
            bezeichnung="Mit Fehler"
            fehler="Mindestens 20 Zeichen erforderlich."
          />
        </div>
      </section>

      {/* ── Stepper ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">Stepper</h2>
        <Stepper
          ausrichtung="horizontal"
          schritte={[
            { bezeichnung: 'S – Sub.', zustand: 'abgeschlossen' },
            { bezeichnung: 'C – Comb.', zustand: 'abgeschlossen' },
            { bezeichnung: 'A – Adapt.', zustand: 'aktiv' },
            { bezeichnung: 'M – Mod.', zustand: 'ausstehend' },
            { bezeichnung: 'P – Put', zustand: 'ausstehend' },
            { bezeichnung: 'E – Elim.', zustand: 'ausstehend' },
            { bezeichnung: 'R – Rev.', zustand: 'ausstehend' },
          ]}
        />
      </section>

      {/* ── AiMessageCard ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">AiMessageCard</h2>
        <div className="space-y-3">
          <AiMessageCard inhalt="Das ist eine fertige KI-Antwort. Sie zeigt den vollständigen Text." />
          <AiMessageCard inhalt="Diese Antwort wird gerade gestreamt…" streamt={true} />
          <AiMessageCard inhalt="" streamt={true} />
        </div>
      </section>

      {/* ── ExampleChip ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">ExampleChip</h2>
        <div className="flex flex-wrap gap-2">
          {['Ein Café', 'Mobile App', 'Online-Kurs', 'Fahrradverleih'].map((t) => (
            <ExampleChip
              key={t}
              text={t}
              onClick={setAusgewaehltesBeispiel}
              ausgewaehlt={ausgewaehltesBeispiel === t}
            />
          ))}
        </div>
        {ausgewaehltesBeispiel && (
          <p className="mt-2 text-xs text-text2">Ausgewählt: {ausgewaehltesBeispiel}</p>
        )}
      </section>

      {/* ── StepCard ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">StepCard</h2>
        <div className="space-y-3">
          <StepCard schritt={SCAMPER_SCHRITTE[0]!} initialGeoeffnet />
          <StepCard schritt={SCAMPER_SCHRITTE[1]!} />
        </div>
      </section>

      {/* ── FaqAccordion ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">FaqAccordion</h2>
        <FaqAccordion
          eintraege={[
            { frage: 'Wie funktioniert das?', antwort: 'Klicke auf eine Frage um die Antwort zu sehen.' },
            { frage: 'Kann ich mehrere öffnen?', antwort: 'Nein — es ist immer nur eine Frage gleichzeitig offen.' },
          ]}
        />
      </section>
    </div>
  );
}
