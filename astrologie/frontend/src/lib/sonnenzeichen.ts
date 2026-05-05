export function berechneSonnenzeichen(datumStr: string): string {
  const d = new Date(datumStr + 'T12:00:00');
  const m = d.getMonth() + 1;
  const t = d.getDate();

  if ((m === 3 && t >= 21) || (m === 4 && t <= 19)) return 'Widder ♈';
  if ((m === 4 && t >= 20) || (m === 5 && t <= 20)) return 'Stier ♉';
  if ((m === 5 && t >= 21) || (m === 6 && t <= 20)) return 'Zwillinge ♊';
  if ((m === 6 && t >= 21) || (m === 7 && t <= 22)) return 'Krebs ♋';
  if ((m === 7 && t >= 23) || (m === 8 && t <= 22)) return 'Löwe ♌';
  if ((m === 8 && t >= 23) || (m === 9 && t <= 22)) return 'Jungfrau ♍';
  if ((m === 9 && t >= 23) || (m === 10 && t <= 22)) return 'Waage ♎';
  if ((m === 10 && t >= 23) || (m === 11 && t <= 21)) return 'Skorpion ♏';
  if ((m === 11 && t >= 22) || (m === 12 && t <= 21)) return 'Schütze ♐';
  if ((m === 12 && t >= 22) || (m === 1 && t <= 19)) return 'Steinbock ♑';
  if ((m === 1 && t >= 20) || (m === 2 && t <= 18)) return 'Wassermann ♒';
  return 'Fische ♓';
}

export function formatiereDatum(datumStr: string): string {
  return new Date(datumStr + 'T12:00:00').toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function heuteFormatiert(): string {
  return new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
