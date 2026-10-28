/**
 * normalization.utils.ts
 * ─────────────────────────────────────────────────────────────
 * Generic string cleaning, Devanagari/Hindi Unicode normalization,
 * Levenshtein distance, and similarity calculations.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Normalizes any string representation:
 * 1. Converts to string, trims whitespace.
 * 2. Normalizes to Unicode NFC (canonical decomposition followed by canonical composition).
 * 3. Removes zero-width spaces (\u200B).
 * 4. Converts non-breaking space (\u00A0) to standard ASCII space.
 * 5. Collapses multiple spaces into single space.
 * 6. Converts to lowercase for case-insensitive matching.
 */
export function cleanString(input: any): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .trim()
    .normalize('NFC')
    .replace(/\u200B/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Computes the Levenshtein Distance between two strings.
 * Used for fuzzy header matching and suggestion ranking.
 */
export function levenshteinDistance(a: string, b: string): number {
  const cleanA = cleanString(a);
  const cleanB = cleanString(b);

  if (cleanA === cleanB) return 0;
  if (cleanA.length === 0) return cleanB.length;
  if (cleanB.length === 0) return cleanA.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= cleanB.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= cleanA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= cleanB.length; i++) {
    for (let j = 1; j <= cleanA.length; j++) {
      if (cleanB.charAt(i - 1) === cleanA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[cleanB.length][cleanA.length];
}

/**
 * Calculates a similarity ratio between two strings from 0.0 to 1.0.
 * 1.0 represents an exact match after normalization.
 */
export function stringSimilarity(a: string, b: string): number {
  const cleanA = cleanString(a);
  const cleanB = cleanString(b);

  if (!cleanA && !cleanB) return 1.0;
  if (!cleanA || !cleanB) return 0.0;
  if (cleanA === cleanB) return 1.0;

  // Direct substring bonus
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
    const minLen = Math.min(cleanA.length, cleanB.length);
    const maxLen = Math.max(cleanA.length, cleanB.length);
    return Math.max(0.7, minLen / maxLen);
  }

  const distance = levenshteinDistance(cleanA, cleanB);
  const maxLength = Math.max(cleanA.length, cleanB.length);
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Finds the best match from a list of candidate strings for a given target.
 */
export function findBestStringMatch(
  target: string,
  candidates: string[]
): { match: string; score: number } | null {
  if (!target || !candidates || candidates.length === 0) return null;

  let bestMatch: string = candidates[0];
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = stringSimilarity(target, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return { match: bestMatch, score: bestScore };
}
