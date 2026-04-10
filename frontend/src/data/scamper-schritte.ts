import type { ScamperSchritt } from '../types/scamper';

/**
 * Statische Daten für alle 7 SCAMPER-Schritte.
 * Reihenfolge entspricht dem Akronym S-C-A-M-P-E-R.
 */
export const SCAMPER_SCHRITTE: ScamperSchritt[] = [
  {
    index: 0,
    buchstabe: 'S',
    name: 'Substituieren',
    leitfrage: 'Was kann ersetzt werden?',
    beschreibung:
      'Ersetze Materialien, Personen, Prozesse oder Ideen durch Alternativen — auch radikale.',
    fragen: [
      'Welche Zutat oder Komponente könnte ausgetauscht werden?',
      'Welche Person oder Rolle könnte diese Aufgabe stattdessen übernehmen?',
      'Welcher Schritt könnte durch etwas Einfacheres oder Digitaleres ersetzt werden?',
    ],
    blockade:
      'Nur an naheliegende Ersatzstoffe denken — wage auch ungewöhnliche oder radikale Substitutionen.',
    farbe: 'p1',
  },
  {
    index: 1,
    buchstabe: 'C',
    name: 'Combinieren',
    leitfrage: 'Was kann kombiniert werden?',
    beschreibung:
      'Verbinde zwei oder mehr Elemente, Ideen oder Zielgruppen zu etwas Neuem und Synergistischem.',
    fragen: [
      'Welche zwei unerwarteten Dinge könnten zusammengebracht werden?',
      'Können verschiedene Zielgruppen oder Zwecke verbunden werden?',
      'Was passiert, wenn du dieses Angebot mit einem Wettbewerber kombinierst?',
    ],
    blockade:
      'Kombinationen erzeugen Komplexität — immer prüfen, ob die Summe mehr wert ist als die Teile.',
    farbe: 'p2',
  },
  {
    index: 2,
    buchstabe: 'A',
    name: 'Adaptieren',
    leitfrage: 'Was kann angepasst werden?',
    beschreibung:
      'Passe bewährte Lösungen aus anderen Kontexten oder Branchen auf dein Thema an.',
    fragen: [
      'Was macht ein erfolgreicher Wettbewerber, das du adaptieren könntest?',
      'Welche Lösung aus einer völlig anderen Branche passt hier?',
      'Wie würde die Natur dieses Problem lösen (Bionik)?',
    ],
    blockade:
      'Blindes Kopieren ohne Kontextanpassung führt zu schlechten Ergebnissen — immer übersetzen.',
    farbe: 'p3',
  },
  {
    index: 3,
    buchstabe: 'M',
    name: 'Modifizieren',
    leitfrage: 'Was kann verändert oder vergrößert werden?',
    beschreibung:
      'Verändere Größe, Form, Tempo, Häufigkeit oder andere Eigenschaften — oft bis zum Extrem.',
    fragen: [
      'Was wäre, wenn du es zehnmal größer oder zehnmal kleiner machst?',
      'Welches Merkmal kannst du verstärken oder übertreiben?',
      'Wie ändert sich das Ergebnis, wenn du das Tempo verdoppelst?',
    ],
    blockade:
      'Mehr ist nicht immer besser — Modifikationen sollten einen klar definierten Nutzen adressieren.',
    farbe: 'p4',
  },
  {
    index: 4,
    buchstabe: 'P',
    name: 'Put to other uses',
    leitfrage: 'Wie kann es anders genutzt werden?',
    beschreibung:
      'Entdecke alternative Verwendungszwecke oder Zielgruppen für bestehende Produkte oder Prozesse.',
    fragen: [
      'Wer sonst könnte von diesem Produkt profitieren?',
      'In welchem anderen Kontext oder Markt könnte es eingesetzt werden?',
      'Welches unerwartete Problem löst dein Angebot bereits, ohne dass du es weißt?',
    ],
    blockade:
      'Nicht jede alternative Verwendung ist wirtschaftlich sinnvoll — Marktgröße und Aufwand prüfen.',
    farbe: 'p1',
  },
  {
    index: 5,
    buchstabe: 'E',
    name: 'Eliminieren',
    leitfrage: 'Was kann entfernt werden?',
    beschreibung:
      'Reduziere auf das Wesentliche: Streiche alles, was keinen klaren Mehrwert liefert.',
    fragen: [
      'Welches Feature würde niemand wirklich vermissen?',
      'Welcher Schritt im Prozess erzeugt keinen messbaren Wert?',
      'Was könntest du weglassen, um das Angebot fokussierter zu machen?',
    ],
    blockade:
      'Zu viel eliminieren kann zur Verwässerung des Kernnutzens führen — immer Differenzierungsmerkmale prüfen.',
    farbe: 'p2',
  },
  {
    index: 6,
    buchstabe: 'R',
    name: 'Reverse',
    leitfrage: 'Was kann umgekehrt oder neu angeordnet werden?',
    beschreibung:
      'Drehe Annahmen, Reihenfolgen oder Rollen um — oft entstehen hier die kreativsten Ideen.',
    fragen: [
      'Was wäre, wenn der Kunde produziert und du konsumierst?',
      'Welche Grundannahme kannst du ins Gegenteil verkehren?',
      'Wie ändert sich das Erlebnis, wenn du Anfang und Ende tauschst?',
    ],
    blockade:
      'Umkehrungen wirken zunächst absurd — genau das ist ihre Stärke. Absurdität nicht sofort verwerfen.',
    farbe: 'p3',
  },
];
