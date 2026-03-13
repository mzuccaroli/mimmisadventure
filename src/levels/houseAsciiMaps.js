const BROWN_HOUSE_TILES = Object.freeze({
  "/": "A",
  "^": "B",
  "\\": "C",
  "!": "F",
  "[": "K",
  "-": "L",
  "]": "M",
  "*": "N",
  L: "U",
  "=": "V",
  R: "Y",
  D: "W",
  o: "a",
  d: "e",
  ">": "m",
  "<": "w",
});

const GRAY_HOUSE_TILES = Object.freeze({
  "/": "G",
  "^": "H",
  "\\": "I",
  "!": "J",
  "[": "O",
  "-": "Q",
  "]": "R",
  "*": "T",
  L: "Z",
  "=": "0",
  R: "2",
  D: "1",
  o: "k",
  d: "x",
  ">": "3",
  "<": "4",
});

export const HOUSE_ASCII_MAPS = Object.freeze({
  // Legend:
  // / ^ \ ! = roof top (left, center, right, chimney)
  // [ - ] * = roof bottom (left, center, right, dormer)
  // L = R = walls, o = window, d = closed door, > < = split closed door, D = open door
  house_brown_4x4: {
    visual: [
      "/^^!",
      "[--*",
      "LooR",
      "L>dR",
    ],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_5x4: {
    visual: [
      "/^^\\!",
      "[--]*",
      "Lo=oR",
      "L>d<R",
    ],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_6x4: {
    visual: [
      "/^^^\\!",
      "[---]*",
      "Loo==R",
      "L>d<=R",
    ],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_7x4: {
    visual: [
      "/^^^^\\!",
      "[----]*",
      "Lo===oR",
      "L>dD<=R",
    ],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_5x5: {
    visual: [
      "/^^\\!",
      "[--]*",
      "Lo==R",
      "L=o=R",
      "L>d<R",
    ],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_6x5: {
    visual: [
      "/^^^\\!",
      "[---]*",
      "Lo===R",
      "L=o==R",
      "L>d<=R",
    ],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_7x6: {
    visual: [
      "/^^^^\\!",
      "[----]*",
      "Lo===oR",
      "L=====R",
      "L=o===R",
      "L>dD<=R",
    ],
    tiles: BROWN_HOUSE_TILES,
  },
});

function materializeHouseTemplate(definition) {
  return definition.visual.map((row) =>
    row
      .split("")
      .map((char) => {
        const tileChar = definition.tiles[char];
        if (!tileChar) {
          throw new Error(`Simbolo casa "${char}" non mappato.`);
        }
        return tileChar;
      })
      .join(""),
  );
}

const HOUSE_TEMPLATE_BY_SIZE = Object.freeze(
  Object.fromEntries(
    Object.values(HOUSE_ASCII_MAPS).map((definition) => {
      const template = materializeHouseTemplate(definition);
      return [`${template[0].length}x${template.length}`, template];
    }),
  ),
);

export function applyHouseAsciiMaps(mapLines, placeholderChar = "H") {
  const grid = mapLines.map((line) => line.split(""));
  const visited = new Set();

  function key(row, col) {
    return `${row}:${col}`;
  }

  function inBounds(row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[row].length;
  }

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== placeholderChar) continue;
      if (visited.has(key(row, col))) continue;

      const stack = [[row, col]];
      let minRow = row;
      let maxRow = row;
      let minCol = col;
      let maxCol = col;

      while (stack.length > 0) {
        const [currentRow, currentCol] = stack.pop();
        const currentKey = key(currentRow, currentCol);

        if (visited.has(currentKey)) continue;
        if (!inBounds(currentRow, currentCol)) continue;
        if (grid[currentRow][currentCol] !== placeholderChar) continue;

        visited.add(currentKey);
        minRow = Math.min(minRow, currentRow);
        maxRow = Math.max(maxRow, currentRow);
        minCol = Math.min(minCol, currentCol);
        maxCol = Math.max(maxCol, currentCol);

        stack.push([currentRow - 1, currentCol]);
        stack.push([currentRow + 1, currentCol]);
        stack.push([currentRow, currentCol - 1]);
        stack.push([currentRow, currentCol + 1]);
      }

      for (let templateRow = minRow; templateRow <= maxRow; templateRow++) {
        for (let templateCol = minCol; templateCol <= maxCol; templateCol++) {
          if (grid[templateRow][templateCol] !== placeholderChar) {
            throw new Error(
              `Blocco casa non rettangolare rilevato a (${minRow}, ${minCol}).`,
            );
          }
        }
      }

      const width = maxCol - minCol + 1;
      const height = maxRow - minRow + 1;
      const template = HOUSE_TEMPLATE_BY_SIZE[`${width}x${height}`];

      if (!template) {
        throw new Error(
          `Nessuna house ASCII map disponibile per blocco ${width}x${height} a (${minRow}, ${minCol}).`,
        );
      }

      for (let templateRow = 0; templateRow < template.length; templateRow++) {
        for (let templateCol = 0; templateCol < template[templateRow].length; templateCol++) {
          grid[minRow + templateRow][minCol + templateCol] =
            template[templateRow][templateCol];
        }
      }
    }
  }

  return grid.map((rowChars) => rowChars.join(""));
}
