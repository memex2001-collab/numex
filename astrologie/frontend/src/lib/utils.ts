export function cn(...klassen: (string | undefined | null | false)[]): string {
  return klassen.filter(Boolean).join(' ');
}
