// Plural helpers. Each language has its own rules; add one per language as it arrives.

export const pluralEn = (n: number, one: string, other: string) => (n === 1 ? one : other);

// Polish: 1 → one, 2–4 (but not 12–14) → few, everything else → many.
export function pluralPl(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const tens = n % 10;
  const hundreds = n % 100;
  if (tens >= 2 && tens <= 4 && !(hundreds >= 12 && hundreds <= 14)) return few;
  return many;
}
