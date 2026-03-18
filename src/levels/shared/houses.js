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

const GRAY_WALL_GREY_ROOF_TILES = Object.freeze({
  "/": "A",
  "^": "B",
  "\\": "C",
  "!": "F",
  "[": "K",
  "-": "L",
  "]": "M",
  "*": "N",
  L: "Z",
  "=": "0",
  R: "2",
  D: "1",
  o: "k",
  d: "x",
  ">": "3",
  "<": "4",
});

const BROWN_WALL_RED_ROOF_TILES = Object.freeze({
  "/": "G",
  "^": "H",
  "\\": "I",
  "!": "J",
  "[": "O",
  "-": "Q",
  "]": "R",
  "*": "T",
  L: "U",
  "=": "V",
  R: "Y",
  D: "W",
  o: "a",
  d: "e",
  ">": "m",
  "<": "w",
});

// Legend:
// / ^ \ ! = roof top (left, center, right, chimney)
// [ - ] * = roof bottom (left, center, right, dormer)
// L = R = walls, o = window, d = closed door, > < = split closed door, D = open door
export const HOUSES = Object.freeze({
  house_brown_4x4: {
    visual: ["/^^\\", "[--]", "LooR", "L=dR"],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_5x4: {
    visual: ["/^^^\\", "[--*]", "Lo=oR", "L=d=R"],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_6x4: {
    visual: ["/^^!^\\", "[--*-]", "Loo==R", "L><==R"],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_7x4: {
    visual: ["/^^!^^\\", "[-*--*]", "Lo===oR", "L><===R"],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_5x5: {
    visual: ["/^^^\\", "[-*-]", "Lo==R", "L=o=R", "L=D=R"],
    tiles: BROWN_HOUSE_TILES,
  },
  house_gray_6x5: {
    visual: ["/^^!^\\", "[--*-]", "Lo===R", "L=o==R", "L><==R"],
    tiles: GRAY_HOUSE_TILES,
  },
  house_brown_7x6: {
    visual: ["/^^^^^\\", "[-*--*]", "Lo===oR", "L=====R", "L=o===R", "L><===R"],
    tiles: BROWN_HOUSE_TILES,
  },
});

export const HOUSES_GRAY_GREY_ROOF = Object.freeze({
  house_gray_grey_roof_4x4: {
    visual: ["/^^\\", "[--]", "LooR", "L=dR"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_5x4: {
    visual: ["/^^!\\", "[---]", "Lo=oR", "L><=R"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_6x4: {
    visual: ["/^^!^\\", "[----]", "Lo===R", "L><==R"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_7x4: {
    visual: ["/^^^^!\\", "[-----]", "Lo===oR", "L><===R"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_6x5: {
    visual: ["/^^!^\\", "[----]", "Lo===R", "L=o==R", "L><==R"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_7x6: {
    visual: ["/^^^^!\\", "[-----]", "Lo===oR", "L=====R", "L=o===R", "L><===R"],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_6x8: {
    visual: [
      "/^^!^\\",
      "[----]",
      "Lo===R",
      "L=o=oR",
      "Lo===R",
      "L=o==R",
      "Lo===R",
      "L><==R",
    ],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
  house_gray_grey_roof_7x10: {
    visual: [
      "/^^^^!\\",
      "[-----]",
      "Lo===oR",
      "L=o=o=R",
      "Lo===oR",
      "L=o=o=R",
      "Lo===oR",
      "L=o===R",
      "Lo===oR",
      "L><===R",
    ],
    tiles: GRAY_WALL_GREY_ROOF_TILES,
  },
});

export const HOUSES_BROWN_RED_ROOF = Object.freeze({
  house_brown_red_roof_4x4: {
    visual: ["/^^\\", "[--]", "LooR", "L=dR"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
  },
  house_brown_red_roof_5x4: {
    visual: ["/^^^\\", "[---]", "Lo=oR", "L><=R"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
  },
  house_brown_red_roof_6x4: {
    visual: ["/^^!^\\", "[----]", "Loo==R", "L><==R"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
  },
  house_brown_red_roof_6x5: {
    visual: ["/^^!^\\", "[----]", "Loo==R", "L=o==R", "L><==R"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
  },
  house_brown_red_roof_7x6: {
    visual: ["/^^^^^\\", "[-----]", "Lo===oR", "L=====R", "L=o===R", "L><===R"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
  },
  house_brown_red_roof_9x5: {
    visual: ["/^^^!^^^\\", "[-------]", "Lo=====oR", "L=o=o===R", "L><=====R"],
    tiles: BROWN_WALL_RED_ROOF_TILES,
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

function createTemplateBySize(houseDefinitions) {
  return Object.freeze(
    Object.fromEntries(
      Object.values(houseDefinitions).map((definition) => {
        const template = materializeHouseTemplate(definition);
        return [`${template[0].length}x${template.length}`, template];
      }),
    ),
  );
}

const HOUSE_TEMPLATE_BY_SIZE = createTemplateBySize(HOUSES);
const HOUSE_TEMPLATE_BY_SIZE_GRAY_GREY_ROOF =
  createTemplateBySize(HOUSES_GRAY_GREY_ROOF);
const HOUSE_TEMPLATE_BY_SIZE_BROWN_RED_ROOF =
  createTemplateBySize(HOUSES_BROWN_RED_ROOF);

export const HOUSES_BY_SIZE = HOUSE_TEMPLATE_BY_SIZE;
export const HOUSES_GRAY_GREY_ROOF_BY_SIZE =
  HOUSE_TEMPLATE_BY_SIZE_GRAY_GREY_ROOF;
export const HOUSES_BROWN_RED_ROOF_BY_SIZE =
  HOUSE_TEMPLATE_BY_SIZE_BROWN_RED_ROOF;

const HOUSE_PLACEHOLDER_CONFIG = Object.freeze({
  H: HOUSE_TEMPLATE_BY_SIZE,
  G: HOUSE_TEMPLATE_BY_SIZE_GRAY_GREY_ROOF,
  R: HOUSE_TEMPLATE_BY_SIZE_BROWN_RED_ROOF,
});

function normalizePlaceholderConfig(placeholderConfig) {
  if (typeof placeholderConfig === "string") {
    return { [placeholderConfig]: HOUSE_TEMPLATE_BY_SIZE };
  }

  return placeholderConfig;
}

export function findHousePlacements(
  mapLines,
  placeholderConfig = HOUSE_PLACEHOLDER_CONFIG,
) {
  const sourceGrid = mapLines.map((line) => line.split(""));
  const visited = new Set();
  const normalizedPlaceholderConfig =
    normalizePlaceholderConfig(placeholderConfig);
  const placeholderChars = new Set(Object.keys(normalizedPlaceholderConfig));
  const placements = [];

  function key(row, col) {
    return `${row}:${col}`;
  }

  function inBounds(row, col) {
    return (
      row >= 0 &&
      row < sourceGrid.length &&
      col >= 0 &&
      col < sourceGrid[row].length
    );
  }

  for (let row = 0; row < sourceGrid.length; row++) {
    for (let col = 0; col < sourceGrid[row].length; col++) {
      const placeholderChar = sourceGrid[row][col];
      if (!placeholderChars.has(placeholderChar)) continue;
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
        if (sourceGrid[currentRow][currentCol] !== placeholderChar) continue;

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
          if (sourceGrid[templateRow][templateCol] !== placeholderChar) {
            throw new Error(
              `Blocco casa non rettangolare rilevato a (${minRow}, ${minCol}).`,
            );
          }
        }
      }

      const width = maxCol - minCol + 1;
      const height = maxRow - minRow + 1;
      const templatesBySize = normalizedPlaceholderConfig[placeholderChar];
      const template = templatesBySize?.[`${width}x${height}`];

      if (!template) {
        throw new Error(
          `Nessuna house ASCII map disponibile per blocco ${placeholderChar}:${width}x${height} a (${minRow}, ${minCol}).`,
        );
      }

      placements.push({
        placeholderChar,
        row: minRow,
        col: minCol,
        width,
        height,
        template,
      });
    }
  }

  return placements;
}

export function applyHouses(
  mapLines,
  placeholderConfig = HOUSE_PLACEHOLDER_CONFIG,
) {
  const resultGrid = mapLines.map((line) => line.split(""));
  const placements = findHousePlacements(mapLines, placeholderConfig);

  for (const placement of placements) {
    for (let templateRow = 0; templateRow < placement.template.length; templateRow++) {
      for (
        let templateCol = 0;
        templateCol < placement.template[templateRow].length;
        templateCol++
      ) {
        resultGrid[placement.row + templateRow][placement.col + templateCol] =
          placement.template[templateRow][templateCol];
      }
    }
  }

  return resultGrid.map((rowChars) => rowChars.join(""));
}

export const applyHouseAsciiMaps = applyHouses;
