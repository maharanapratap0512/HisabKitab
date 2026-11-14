/**
 * clipboard.utils.ts
 * ─────────────────────────────────────────────────────────────
 * Multi-cell clipboard matrix serialization and deserialization
 * for Excel copy-paste functionality.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Parses tab-separated clipboard content (copied from Excel, Sheets, etc.)
 * into a 2D matrix of strings.
 */
export function parseTsvToMatrix(tsvText: string): string[][] {
  if (!tsvText || typeof tsvText !== 'string') return [];

  // Normalize newlines (\r\n or \r -> \n)
  const normalized = tsvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // Strip trailing empty line often appended by OS clipboard
  if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  return lines.map(line => line.split('\t').map(cell => cell.trim()));
}

/**
 * Serializes a 2D matrix of cell values into a TSV string
 * ready to be written to system clipboard.
 */
export function matrixToTsv(matrix: any[][]): string {
  if (!matrix || !Array.isArray(matrix)) return '';

  return matrix
    .map(row =>
      (row || [])
        .map(cell => {
          if (cell === null || cell === undefined) return '';
          const str = String(cell);
          // Escape quotes if cell contains tab or newline
          if (str.includes('\t') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join('\t')
    )
    .join('\r\n');
}
