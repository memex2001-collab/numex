import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { StepCard } from '../components/scamper/StepCard';
import { FaqAccordion, type FaqEintrag } from '../components/scamper/FaqAccordion';
import { SCAMPER_SCHRITTE } from '../data/scamper-schritte';

/** FAQ-Einträge für die SCAMPER-Theorie-Seite */
const FAQ_EINTRAEGE: FaqEintrag[] = [
  {
    frage: 'Muss ich alle 7 Schritte durcharbeiten?',
    antwort:
      'Ja — jeder Schritt öffnet eine andere Denkrichtung. Oft entstehen die besten Ideen gerade bei den Schritten, bei denen du zuerst denkst: "Das passt nicht auf mein Thema."',
  },
  {
    frage: 'Für welche Themen eignet sich SCAMPER?',
    antwort:
      'Für fast alles: Produkte, Dienstleistungen, Prozesse, Marketingideen, persönliche Projekte oder sogar Karriereentscheidungen. SCAMPER ist besonders stark wenn du eine bestehende Idee weiterentwickeln möchtest.',
  },
  {
    frage: 'Was macht die KI in der App?',
    antwort:
      'Claude stellt dir personalisierte Denk-Impulse und Fragen, die direkt auf dein Thema zugeschnitten sind — keine generischen Tipps. Wenn du nicht weiterkommst, kannst du jederzeit einen zusätzlichen Hinweis anfordern.',
  },
  {
    frage: 'Werden meine Antworten gespeichert?',
    antwort:
      'Deine Antworten werden ausschließlich lokal in deinem Browser gespeichert (localStorage). Es werden keine Daten an Server übertragen oder dauerhaft gespeichert — außer den KI-Anfragen, die für die Antwort-Generierung an die Claude API gesendet werden.',
  },
  {
    frage: 'Wie lange dauert eine SCAMPER-Sitzung?',
    antwort:
      'Je nach Tiefe deiner Antworten zwischen 20 und 40 Minuten. Du kannst jederzeit pausieren — deine Antworten bleiben im Browser gespeichert und du kannst dort weitermachen, wo du aufgehört hast.',
  },
];

/** Praxisbeispiel: Kaffeehaus durch SCAMPER */
const PRAXISBEISPIEL = [
  {
    buchstabe: 'S',
    frage: 'Was kann ersetzt werden?',
    antwort: 'Barista durch Selbstbedienungs-Terminals mit KI-Empfehlung.',
    farbe: 'bg-p1-l text-p1-d border-p1/20',
  },
  {
    buchstabe: 'C',
    frage: 'Was kann kombiniert werden?',
    antwort: 'Café + Co-Working-Space + monatliche Abo-Mitgliedschaft.',
    farbe: 'bg-p2-l text-p2-d border-p2/20',
  },
  {
    buchstabe: 'A',
    frage: 'Was kann angepasst werden?',
    antwort: 'Netflix-Modell adaptieren: Flatrate für unbegrenzten Kaffee.',
    farbe: 'bg-p3-l text-p3-d border-p3/20',
  },
  {
    buchstabe: 'M',
    frage: 'Was kann verändert werden?',
    antwort: 'Öffnungszeiten auf 24/7 ausweiten — für Nachteulen und frühe Vögel.',
    farbe: 'bg-p4-l text-p4-d border-p4/20',
  },
  {
    buchstabe: 'P',
    frage: 'Wie kann es anders genutzt werden?',
    antwort: 'Als Pop-up in Firmen-Lobbys oder auf Messen statt stationär.',
    farbe: 'bg-p1-l text-p1-d border-p1/20',
  },
  {
    buchstabe: 'E',
    frage: 'Was kann entfernt werden?',
    antwort: 'Kein physischer Raum — nur Lieferservice mit täglicher Personalisierung.',
    farbe: 'bg-p2-l text-p2-d border-p2/20',
  },
  {
    buchstabe: 'R',
    frage: 'Was kann umgekehrt werden?',
    antwort: 'Kunde bringt eigene Zutaten — Café röster und bereitet sie zu.',
    farbe: 'bg-p3-l text-p3-d border-p3/20',
  },
];

/**
 * Modul 1 — SCAMPER-Theorie-Seite.
 * Erklärt die Methode interaktiv und motiviert zur Anwendung.
 */
export function TheoriePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-p1/30 bg-p1-l px-4 py-1.5 text-xs font-semibold text-p1-d">
          <span className="h-1.5 w-1.5 rounded-full bg-p1" />
          Modul 1 von 3 — Theorie
        </div>
        <h1 className="text-3xl font-bold text-text sm:text-4xl mb-4">
          Kreativ denken mit <span className="text-p1">SCAMPER</span>
        </h1>
        <p className="text-base text-text2 leading-relaxed max-w-xl mx-auto">
          SCAMPER ist eine strukturierte Kreativitätsmethode mit 7 Denkrichtungen.
          Lerne die Grundlagen — dann wende sie auf dein eigenes Thema an.
        </p>
        <div className="mt-6">
          <Link to="/anwendung">
            <Button variante="primary" groesse="lg">
              Direkt starten →
            </Button>
          </Link>
        </div>
      </div>

      {/* Nutzen-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { symbol: '🧭', titel: 'Schritt für Schritt', text: 'Sieben klare Denkrichtungen — keine Überwältigung.' },
          { symbol: '🎯', titel: 'Auf dein Thema zugeschnitten', text: 'Claude stellt Fragen speziell zu deinem konkreten Thema.' },
          { symbol: '📋', titel: 'Ergebnis mitnehmbar', text: 'Du erhältst eine strukturierte Zusammenfassung deiner Ideen.' },
        ].map((k, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-xl mb-2">{k.symbol}</div>
            <div className="text-sm font-semibold text-text mb-1">{k.titel}</div>
            <p className="text-xs text-text2 leading-relaxed">{k.text}</p>
          </div>
        ))}
      </div>

      {/* 7 SCAMPER-Schritte */}
      <section aria-labelledby="schritte-überschrift" className="mb-12">
        <h2 id="schritte-überschrift" className="text-xl font-semibold text-text mb-2">
          Die 7 SCAMPER-Schritte
        </h2>
        <p className="text-sm text-text2 mb-5">
          Klicke auf einen Schritt um Details, Leitfragen und häufige Blockaden zu sehen.
        </p>
        <div className="space-y-3">
          {SCAMPER_SCHRITTE.map((schritt) => (
            <StepCard key={schritt.index} schritt={schritt} />
          ))}
        </div>
      </section>

      {/* Praxisbeispiel */}
      <section aria-labelledby="beispiel-überschrift" className="mb-12">
        <h2 id="beispiel-überschrift" className="text-xl font-semibold text-text mb-2">
          Praxisbeispiel: Ein Kaffeehaus
        </h2>
        <p className="text-sm text-text2 mb-5">
          So sieht SCAMPER in der Anwendung aus — alle 7 Schritte auf ein konkretes Thema angewendet.
        </p>
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="divide-y divide-border">
            {PRAXISBEISPIEL.map((schritt) => (
              <div key={schritt.buchstabe} className="flex gap-4 p-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold border ${schritt.farbe}`}
                >
                  {schritt.buchstabe}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-text3 mb-0.5">{schritt.frage}</div>
                  <p className="text-sm text-text">{schritt.antwort}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-überschrift" className="mb-12">
        <h2 id="faq-überschrift" className="text-xl font-semibold text-text mb-5">
          Häufige Fragen
        </h2>
        <FaqAccordion eintraege={FAQ_EINTRAEGE} />
      </section>

      {/* Abschluss-CTA */}
      <div className="rounded-2xl bg-p1-l border border-p1/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-p1-d mb-2">
          Bereit für dein Thema?
        </h2>
        <p className="text-sm text-p1-d/70 mb-5">
          Wende SCAMPER jetzt auf eine eigene Idee an — mit Claude als Coach.
        </p>
        <Link to="/anwendung">
          <Button variante="primary" groesse="lg">
            Jetzt anwenden →
          </Button>
        </Link>
      </div>
    </div>
  );
}
