/**
 * Schritt-spezifische Prompt-Builder für alle 7 SCAMPER-Schritte.
 * Jede Funktion nimmt das Thema des Nutzers und erzeugt einen kontextspezifischen Prompt.
 */

/** Buchstaben-Kürzel für alle 7 Schritte */
const SCHRITTBUCHSTABEN = ['S', 'C', 'A', 'M', 'P', 'E', 'R'] as const;

/** Schritt-Namen für den Prompt-Kontext */
const SCHRITTNAMEN: Record<number, string> = {
  0: 'Substituieren (Was kann ersetzt werden?)',
  1: 'Combinieren (Was kann kombiniert werden?)',
  2: 'Adaptieren (Was kann angepasst werden?)',
  3: 'Modifizieren (Was kann verändert oder vergrößert werden?)',
  4: 'Put to other uses (Wie kann es anders genutzt werden?)',
  5: 'Eliminieren (Was kann entfernt werden?)',
  6: 'Reverse / Rearrange (Was kann umgekehrt oder neu angeordnet werden?)',
};

/** Schritt-spezifische Prompt-Vorlagen */
const SCHRITT_PROMPTS: Record<number, (thema: string) => string> = {
  0: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt S – Substituieren (1 von 7):
Was könnte bei "${thema}" durch etwas anderes ersetzt werden?
Denke an Materialien, Rollen, Technologien, Prozesse oder Zutaten.
Nenne einen konkreten, überraschenden Substitutionsvorschlag speziell für "${thema}".
Stelle dann genau eine präzise Frage.`,

  1: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt C – Combinieren (2 von 7):
Was könnte mit "${thema}" kombiniert werden, um etwas Neues zu schaffen?
Nenne eine konkrete, unerwartete Kombination — vielleicht aus einer anderen Branche.
Stelle dann genau eine präzise Frage.`,

  2: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt A – Adaptieren (3 von 7):
Welche Idee aus einer anderen Branche oder einem anderen Kontext könnte auf "${thema}" übertragen werden?
Benenne eine spezifische, überraschende Analogie.
Stelle dann genau eine präzise Frage.`,

  3: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt M – Modifizieren (4 von 7):
Was an "${thema}" könnte stark verändert, vergrößert oder verkleinert werden?
Nenne eine konkrete Dimension: Größe, Tempo, Häufigkeit, Preis oder Design.
Stelle dann genau eine präzise Frage.`,

  4: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt P – Put to other uses (5 von 7):
Für wen sonst könnte "${thema}" nützlich sein, oder in welchem anderen Kontext?
Nenne eine konkrete alternative Nutzungsgruppe oder Situation.
Stelle dann genau eine präzise Frage.`,

  5: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt E – Eliminieren (6 von 7):
Was an "${thema}" könnte radikal weggelassen werden, ohne den Kernnutzen zu verlieren?
Nenne ein konkretes Element, das überraschenderweise entbehrlich sein könnte.
Stelle dann genau eine präzise Frage.`,

  6: (thema) => `
Das Thema des Nutzers ist: "${thema}"

SCAMPER-Schritt R – Reverse / Rearrange (7 von 7):
Was an "${thema}" könnte umgekehrt oder völlig neu angeordnet werden?
Denke an Reihenfolge, Rollen, Annahmen oder Kausalitäten.
Stelle dann genau eine präzise Frage.`,
};

/** Parameter für den Aufbau eines Schritt-Prompts */
export interface SchrittPromptParams {
  thema: string;
  schritt: number;
  bisherigeAntworten: { schritt: number; antwort: string }[];
  nutzereingabe?: string;
}

/**
 * Erstellt den vollständigen Nutzer-Prompt für einen bestimmten SCAMPER-Schritt.
 * Schritt 7 löst den Reflexions-Prompt aus.
 */
export function erstelleSchrittPrompt(params: SchrittPromptParams): string {
  const { thema, schritt, bisherigeAntworten, nutzereingabe } = params;

  // Schritt 7 bedeutet: alle Schritte abgeschlossen → Reflexion
  if (schritt === 7) {
    return erstelleReflexionsPrompt(thema, bisherigeAntworten);
  }

  // Kontext aus vorherigen Antworten aufbauen
  const kontextZeilen = bisherigeAntworten
    .sort((a, b) => a.schritt - b.schritt)
    .map((a) => {
      const buchstabe = SCHRITTBUCHSTABEN[a.schritt] ?? '?';
      return `${buchstabe} (${SCHRITTNAMEN[a.schritt] ?? `Schritt ${a.schritt + 1}`}): ${a.antwort}`;
    })
    .join('\n');

  const kontext = kontextZeilen
    ? `\nBisherige Antworten des Nutzers:\n${kontextZeilen}\n`
    : '';

  const schrittVorlage = SCHRITT_PROMPTS[schritt]?.(thema) ?? '';
  const nutzereingabeKontext = nutzereingabe
    ? `\nDer Nutzer hat bereits begonnen zu schreiben: "${nutzereingabe}"`
    : '';

  return `${kontext}${schrittVorlage}${nutzereingabeKontext}`;
}

/**
 * Erstellt den Reflexions-Prompt nach Abschluss aller 7 Schritte.
 */
function erstelleReflexionsPrompt(
  thema: string,
  antworten: { schritt: number; antwort: string }[],
): string {
  const zusammenfassung = antworten
    .sort((a, b) => a.schritt - b.schritt)
    .map((a) => {
      const buchstabe = SCHRITTBUCHSTABEN[a.schritt] ?? '?';
      return `${buchstabe}: ${a.antwort}`;
    })
    .join('\n');

  return `
Der Nutzer hat die vollständige SCAMPER-Analyse zum Thema "${thema}" abgeschlossen.

Alle 7 Antworten:
${zusammenfassung}

Erstelle eine strukturierte, ermutigende Abschluss-Reflexion:
1. Identifiziere die 2–3 stärksten Ideen (konkret, nicht generisch, mit Bezug auf die Antworten)
2. Zeige mögliche Verbindungen zwischen verschiedenen SCAMPER-Schritten
3. Schlage einen einzigen, konkreten nächsten Schritt vor
4. Schließe mit einem kurzen, ehrlichen Fazit

Halte die Antwort unter 200 Wörtern.`;
}

/**
 * Erstellt einen Hilfe-Prompt wenn der Nutzer bei einem Schritt nicht weiterkommt.
 */
export function erstelleHilfePrompt(
  thema: string,
  schritt: number,
  bisherigeTeilEingabe?: string,
): string {
  const buchstabe = SCHRITTBUCHSTABEN[schritt] ?? '?';
  const schrittName = SCHRITTNAMEN[schritt] ?? `Schritt ${schritt + 1}`;

  return `
Der Nutzer arbeitet am SCAMPER-Schritt ${buchstabe} – ${schrittName} zum Thema "${thema}".
${bisherigeTeilEingabe ? `Er hat bereits begonnen: "${bisherigeTeilEingabe}"` : 'Er weiß noch nicht, wie er anfangen soll.'}

Gib einen kurzen, konkreten Denkanstoß (maximal 60 Wörter):
- Nenne ein reales Beispiel, wie dieser SCAMPER-Schritt auf ein ähnliches Thema angewendet wurde
- Stelle keine Frage — gib stattdessen einen konkreten Ausgangspunkt`;
}
