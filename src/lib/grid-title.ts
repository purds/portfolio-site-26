const GLYPHS: Record<string, number[][]> = {
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

const ASCII_DIRECTIONAL = ["|", "/", "—", "\\", "|", "/", "—", "\\"];

export interface TitleCell {
  col: number;
  row: number;
  isLetter: boolean;
  char: string;
}

export function getLetterCells(
  text: string,
  startCol: number,
  startRow: number,
  letterSpacing: number
): TitleCell[] {
  const cells: TitleCell[] = [];
  let offsetCol = startCol;

  for (const char of text) {
    const glyph = GLYPHS[char];
    if (!glyph) {
      offsetCol += 2; // space
      continue;
    }

    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === 1) {
          cells.push({
            col: offsetCol + c,
            row: startRow + r,
            isLetter: true,
            char,
          });
        }
      }
    }

    offsetCol += glyph[0].length + letterSpacing;
  }

  return cells;
}

export function getDirectionalAscii(
  mouseX: number,
  mouseY: number,
  cellX: number,
  cellY: number
): string {
  const dx = mouseX - cellX;
  const dy = mouseY - cellY;
  const angle = Math.atan2(dy, dx);
  const index = Math.round(((angle + Math.PI) / (2 * Math.PI)) * 8) % 8;
  return ASCII_DIRECTIONAL[index];
}
