export interface FokusBereich {
  id: string;
  bezeichnung: string;
  symbol: string;
}

export const FOKUS_BEREICHE: FokusBereich[] = [
  { id: 'allgemein',   bezeichnung: 'Allgemeiner Überblick', symbol: '✦' },
  { id: 'liebe',       bezeichnung: 'Liebe & Partnerschaft', symbol: '♥' },
  { id: 'karriere',    bezeichnung: 'Karriere & Finanzen',   symbol: '◈' },
  { id: 'gesundheit',  bezeichnung: 'Gesundheit',            symbol: '◯' },
  { id: 'entwicklung', bezeichnung: 'Persönliches Wachstum', symbol: '↑' },
  { id: 'familie',     bezeichnung: 'Familie & Soziales',    symbol: '⬡' },
];
