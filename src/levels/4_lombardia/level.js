import { GAME_CONFIG, TAGS } from "../../tiles.js";
import { getEnemySpriteFrames } from "../../enemyTiles.js";
import { getEnvironmentTileSprite } from "../../environmentTiles.js";
import { getEnvironmentTileIndustrialSprite } from "../../environmentTiles_industrial.js";
import {
  HOUSES_GRAY_GREY_ROOF_BY_SIZE,
  applyHouses,
  findHousePlacements,
} from "../shared/houses.js";

const TERRAIN_TAG = "terrain";
const NPC_VISUAL_HEIGHT = 23;
const NPC_SCALE = 2;
const TINY_TOWN_TILE_SCALE = GAME_CONFIG.tile / 16;
const TERRAIN_NO_SUPPORT_TILES = {
  single: "concrete_soil_single",
  left: "concrete_soil_single_left",
  center: "concrete_soil_single_center",
  right: "concrete_soil_single_right",
};
const TERRAIN_TOP_TILES = {
  single: "concrete_soil_top_multi_single",
  left: "concrete_soil_top_left",
  center: "concrete_soil_top_center",
  right: "concrete_soil_top_right",
};
const TERRAIN_CENTER_TILES = {
  single: "concrete_soil_center_single",
  left: "concrete_soil_center_left",
  center: "concrete_soil_center_center",
  right: "concrete_soil_center_right",
};
const TERRAIN_BOTTOM_TILES = {
  single: "concrete_soil_bottom_single",
  left: "concrete_soil_bottom_left",
  center: "concrete_soil_bottom_center",
  right: "concrete_soil_bottom_right",
};
const SHAFT_VARIANT_BY_CHAR = Object.freeze({
  L: "ladder",
  B: "brace",
  C: "connector",
});
const ENEMY_BY_CHAR = Object.freeze({
  E: {
    enemyName: "alien_1",
    patrolWidth: GAME_CONFIG.tile * 6,
    speed: 90,
    animationSpeed: 8,
  },
  b: {
    enemyName: "bomb",
    patrolWidth: GAME_CONFIG.tile * 4,
    speed: 55,
    animationSpeed: 4,
  },
  m: {
    enemyName: "gold_block",
    patrolWidth: GAME_CONFIG.tile * 4,
    speed: 65,
    animationSpeed: 6,
  },
  R: {
    enemyName: "robot",
    patrolWidth: GAME_CONFIG.tile * 5,
    speed: 72,
    animationSpeed: 7,
  },
  9: {
    enemyName: "alien_4",
    patrolWidth: GAME_CONFIG.tile * 8,
    speed: 78,
    animationSpeed: 7,
    randomJump: {
      minInterval: 0.9,
      maxInterval: 2.1,
      chance: 0.65,
      jumpForce: GAME_CONFIG.jumpForce * 0.78,
    },
  },
  T: {
    enemyName: "robot_s",
    patrolWidth: GAME_CONFIG.tile * 5,
    speed: 78,
    animationSpeed: 8,
  },
  X: {
    enemyName: "scrissors",
    patrolWidth: GAME_CONFIG.tile * 5,
    speed: 86,
    animationSpeed: 8,
  },
});
const PIPE_SOLID_CHARS = new Set(["|", "-", "j", "k", "u", "n", "p", "q"]);
const WATER_CHARS = new Set(["!", "v", "w"]);
const HANGING_DECOR_CHARS = new Set(["r", "t", "f", "c", "h", "g"]);
const AQUATIC_ENEMY_CHARS = new Set(["X"]);
const HOUSE_PLACEHOLDER_CONFIG = Object.freeze({
  G: HOUSES_GRAY_GREY_ROOF_BY_SIZE,
});
const HOUSE_TILE_SPRITE_BY_CHAR = Object.freeze({
  A: "tiny_roof_top_grey_left",
  B: "tiny_roof_top_grey_center",
  C: "tiny_roof_top_grey_right",
  F: "tiny_roof_top_grey_chimney",
  K: "tiny_roof_bottom_grey_left",
  L: "tiny_roof_bottom_grey_center",
  M: "tiny_roof_bottom_grey_right",
  N: "tiny_roof_bottom_grey_dormer",
  Z: "tiny_house_gray_wall_left",
  0: "tiny_house_gray_wall_center",
  1: "tiny_house_gray_door_open",
  2: "tiny_house_gray_wall_right",
  k: "tiny_house_gray_window",
  x: "tiny_house_gray_door_closed",
  3: "tiny_house_gray_door_closed_right",
  4: "tiny_house_gray_door_closed_left",
});
const BACKGROUND_HILL_SPECS = Object.freeze([
  [0, 7, 8, 5, 0.3],
  [16, 8, 7, 4, 0.24],
  [32, 6, 9, 6, 0.28],
  [46, 7, 7, 5, 0.26],
  [64, 8, 10, 4, 0.22],
  [78, 7, 9, 5, 0.28],
  [102, 8, 8, 4, 0.22],
  [132, 8, 8, 4, 0.26],
  [164, 7, 10, 5, 0.28],
  [188, 8, 9, 4, 0.22],
  [206, 8, 8, 4, 0.24],
  [248, 7, 11, 5, 0.28],
  [270, 8, 8, 4, 0.2],
  [292, 8, 9, 4, 0.26],
  [316, 7, 8, 5, 0.22],
  [334, 7, 10, 5, 0.28],
  [356, 8, 8, 4, 0.22],
]);
const BACKGROUND_HOUSE_SPECS = Object.freeze([
  { col: 10, size: "6x5", opacity: 0.32 },
  { col: 34, size: "7x4", opacity: 0.28 },
  { col: 66, size: "6x5", opacity: 0.3 },
  { col: 94, size: "7x4", opacity: 0.26 },
  { col: 142, size: "6x5", opacity: 0.32 },
  { col: 194, size: "7x4", opacity: 0.28 },
  { col: 234, size: "6x5", opacity: 0.3 },
  { col: 284, size: "7x4", opacity: 0.26 },
  { col: 328, size: "6x5", opacity: 0.3 },
]);
const FOREGROUND_DECOR_SPECS = Object.freeze([
  { col: 11, tiles: [["decor_floor_left"]] },
  { col: 15, tiles: [["decor_floor_right"]] },
  { col: 22, tiles: [["decor_column_top"]] },
  { col: 28, tiles: [["decor_column_upper"]] },
  { col: 35, tiles: [["decor_console_left"]] },
  { col: 41, tiles: [["decor_console_right"]] },
  { col: 48, tiles: [["decor_machine_left"]] },
  { col: 54, tiles: [["decor_machine_right"]] },
  { col: 66, tiles: [["decor_column_middle"]] },
  { col: 73, tiles: [["decor_column_lower"]] },
  { col: 82, tiles: [["decor_column_bottom"]] },
  { col: 96, tiles: [["decor_floor_left"]] },
  { col: 102, tiles: [["decor_floor_right"]] },
  { col: 116, tiles: [["decor_console_left"]] },
  { col: 124, tiles: [["decor_console_right"]] },
  { col: 138, tiles: [["decor_machine_left"]] },
  { col: 147, tiles: [["decor_machine_right"]] },
  { col: 161, tiles: [["decor_column_top"]] },
  { col: 168, tiles: [["decor_column_middle"]] },
  { col: 178, tiles: [["decor_column_bottom"]] },
  { col: 192, tiles: [["decor_floor_left"]] },
  { col: 198, tiles: [["decor_floor_right"]] },
  { col: 214, tiles: [["decor_column_upper"]] },
  { col: 223, tiles: [["decor_console_left"]] },
  { col: 231, tiles: [["decor_console_right"]] },
  { col: 246, tiles: [["decor_machine_left"]] },
  { col: 254, tiles: [["decor_machine_right"]] },
  { col: 268, tiles: [["decor_column_lower"]] },
  { col: 279, tiles: [["decor_column_top"]] },
  { col: 291, tiles: [["decor_floor_left"]] },
  { col: 298, tiles: [["decor_floor_right"]] },
  { col: 312, tiles: [["decor_console_left"]] },
  { col: 320, tiles: [["decor_console_right"]] },
  { col: 334, tiles: [["decor_machine_left"]] },
  { col: 343, tiles: [["decor_machine_right"]] },
  { col: 356, tiles: [["decor_column_middle"]] },
  { col: 364, tiles: [["decor_column_bottom"]] },
]);

const LEVEL_FOUR_ASCII = [
  "                                                                           9                                                                                                                                                                                                                               9                         9              9                   9                         ",
  "            ====          ----                                          j------k                                                    ----                     ====                                                                       ----                ====                                         ------------------------------------------------------------------------------------ ",
  "   9                                                      ====          |                                              ----                 ====                        j------k                    R",
  "-------                                   j------k                                                m                                                  d                  |                   --------------------------------",
  "                                          |                                               j----------------K                                       j------k                                                                                   ",
  "                                          |                                               |                                                        |                                    R ",
  "                                    j-----n                                                                                                     ====       j-------k                  =====                                                 ------                                            ====                   =====                     ",
  "           L                        |                     ====C====            ========                                              GGGGGG                |               B                                                                 ====        ====                                              B      ====                                        ==C====",
  "           L                        p                     c   C                                                                      GGGGGG                p               B      c                                   ----          ====                                       ----        r   c           B                       GGGGGGG   j------k           C                                   ",
  "  P        L                       Bv!B                   g   C                     E                                                GGGGGG                v!         E    B      g                                                                                                        f   g     E     B         ====          GGGGGGG   |                  C                                  ",
  "      ==== L       B!!B     E      B!!B              j----k   C        ##  ###                        *                              GGGGGG   ##!!##       !!            ====   j----k                          ######                                              ====                ######         ====B    j---k              GGGGGGG   p          ####    C    ##!!##                        ",
  "     ######L       B!!B   ######   B!!B    #####     |        C        ##!X#r                  b                                     GGGGGG   ##!!##   b   !!         ######    |            !X            m     ####                R              *                      b      m     ####            ####    | |      R         GGGGGGG   v!         ####!X# C    ##!!##       d       S       ",
  "        ###L       ====   ######   B!!B    ----------n        C        ##!!#f               ####    ####   T                      ####################     !!         ====  ----n       ####!!!       ####====####                    T                             ####====####     ####!!##        ====          ####====###############!!!!!!!!!!!!!!####!!# C    ##!!##        T          ",
  "###########L############################   ##########################  ##!!!!!!#      ####################################      ##########################!!!!#############################!!!!############################################################!!!!!!##########################################!!!!############################################!!!!#####################################",
  "###########L############################   ##########################  ##!!!!!!#      ####################################      ##########################!!!!#############################!!!!############################################################!!!!!!##########################################!!!!############################################!!!!#####################################",
  "###########L############################   ##########################  ##!!!!!!#      ####################################      ##########################!!!!#############################!!!!############################################################!!!!!!##########################################!!!!############################################!!!!#####################################",
  "###########L############################   ##########################  ##!!!!!!#      ####################################      ##########################!!!!#############################!!!!############################################################!!!!!!##########################################!!!!############################################!!!!#####################################",
];

function isWaterAsciiCell(cell) {
  return WATER_CHARS.has(cell) || AQUATIC_ENEMY_CHARS.has(cell);
}

function normalizeAsciiMap(lines) {
  const cols = Math.max(...lines.map((line) => line.length));
  return lines.map((line) => line.padEnd(cols, " "));
}

function mapCharAt(mapLines, row, col) {
  if (row < 0 || row >= mapLines.length) return " ";
  if (col < 0 || col >= mapLines[row].length) return " ";
  return mapLines[row][col];
}

function buildCellKey(row, col) {
  return `${row}:${col}`;
}

function buildHouseCellSet(housePlacements) {
  const cells = new Set();

  for (const placement of housePlacements) {
    for (let row = 0; row < placement.height; row++) {
      for (let col = 0; col < placement.width; col++) {
        cells.add(buildCellKey(placement.row + row, placement.col + col));
      }
    }
  }

  return cells;
}

function isShaftCell(cell) {
  return Object.hasOwn(SHAFT_VARIANT_BY_CHAR, cell);
}

function isSolidAsciiCell(cell) {
  return cell === "#" || isShaftCell(cell) || PIPE_SOLID_CHARS.has(cell);
}

function buildColliderRects(mapLines, matcher) {
  const finalized = [];
  let active = new Map();

  for (let row = 0; row < mapLines.length; row++) {
    const line = mapLines[row];
    const runs = [];
    let col = 0;

    while (col < line.length) {
      if (!matcher(line[col], row, col)) {
        col += 1;
        continue;
      }

      const start = col;
      while (col + 1 < line.length && matcher(line[col + 1], row, col + 1)) {
        col += 1;
      }
      runs.push({ x0: start, x1: col });
      col += 1;
    }

    const next = new Map();
    for (const run of runs) {
      const key = `${run.x0}:${run.x1}`;
      const existing = active.get(key);
      if (existing) {
        existing.lastRow = row;
        next.set(key, existing);
        active.delete(key);
      } else {
        next.set(key, {
          x0: run.x0,
          x1: run.x1,
          startRow: row,
          lastRow: row,
        });
      }
    }

    for (const rect of active.values()) {
      finalized.push(rect);
    }
    active = next;
  }

  for (const rect of active.values()) {
    finalized.push(rect);
  }

  return finalized;
}

function addIndustrialSky(k, levelWidth) {
  const skyHeight = k.height() + GAME_CONFIG.tile * 8;

  k.add([
    k.pos(0, 0),
    k.rect(levelWidth, skyHeight),
    k.color(216, 161, 149),
    k.z(-40),
  ]);

  k.add([
    k.pos(0, 188),
    k.rect(levelWidth, 168),
    k.color(244, 211, 203),
    k.opacity(0.92),
    k.z(-39),
  ]);

  k.add([
    k.pos(0, 320),
    k.rect(levelWidth, skyHeight - 320),
    k.color(191, 139, 126),
    k.opacity(0.75),
    k.z(-38),
  ]);
}

function getTerrainRowSpriteName(tiles, hasTerrainLeft, hasTerrainRight) {
  // The first-column soil tiles are reserved for fully isolated blocks only.
  if (!hasTerrainLeft && !hasTerrainRight) return tiles.single;
  if (!hasTerrainLeft && hasTerrainRight) return tiles.left;
  if (hasTerrainLeft && hasTerrainRight) return tiles.center;
  return tiles.right;
}

function addGroundTile(
  k,
  x,
  y,
  isTop,
  hasTerrainBelow,
  hasTerrainLeft,
  hasTerrainRight,
  z = -1,
  opacity = 1,
) {
  let spriteName;

  if (!hasTerrainBelow) {
    spriteName = getTerrainRowSpriteName(
      TERRAIN_NO_SUPPORT_TILES,
      hasTerrainLeft,
      hasTerrainRight,
    );
  } else if (isTop) {
    spriteName = getTerrainRowSpriteName(
      TERRAIN_TOP_TILES,
      hasTerrainLeft,
      hasTerrainRight,
    );
  } else {
    spriteName = getTerrainRowSpriteName(
      TERRAIN_CENTER_TILES,
      hasTerrainLeft,
      hasTerrainRight,
    );
  }

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
    k.opacity(opacity),
    k.z(z),
  ]);
}

function getToxicSpriteName(hasAbove, hasLeft, hasRight) {
  if (!hasAbove && !hasLeft) return "toxic_top_left";
  if (!hasAbove) return "toxic_fill_single";
  return "toxic_body_single";
}

function addToxicTile(k, x, y, hasAbove, hasLeft, hasRight, z = -1, opacity = 1) {
  const spriteName = getToxicSpriteName(hasAbove, hasLeft, hasRight);
  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
    k.opacity(opacity),
    k.z(z),
  ]);
}

function getShaftSpriteName(mapLines, row, col) {
  const cell = mapCharAt(mapLines, row, col);
  const variant = SHAFT_VARIANT_BY_CHAR[cell];
  const above = mapCharAt(mapLines, row - 1, col) === cell;
  const below = mapCharAt(mapLines, row + 1, col) === cell;

  if (!above) {
    return {
      ladder: "shaft_ladder_top",
      brace: "shaft_brace_top",
      connector: "shaft_connector_top",
    }[variant];
  }

  if (!below) {
    return {
      ladder: "shaft_ladder_bottom",
      brace: "shaft_brace_bottom",
      connector: "shaft_connector_bottom",
    }[variant];
  }

  return {
    ladder: "shaft_ladder_center",
    brace: "shaft_brace_center",
    connector: "shaft_connector_center",
  }[variant];
}

function getVerticalPipeSpriteName(mapLines, row, col) {
  const above = ["|", "j", "k"].includes(mapCharAt(mapLines, row - 1, col));
  const below = ["|", "u", "n", "p", "q"].includes(mapCharAt(mapLines, row + 1, col));

  if (!above) return "vertical_pipe_start";
  if (!below) return "vertical_pipe_end";
  return row % 2 === 0 ? "vertical_pipe_center_lower" : "vertical_pipe_center_upper";
}

function getHorizontalPipeSpriteName(mapLines, row, col) {
  const left = ["-", "j", "u"].includes(mapCharAt(mapLines, row, col - 1));
  const right = ["-", "k", "n"].includes(mapCharAt(mapLines, row, col + 1));

  if (!left && right) return "horizontal_pipe_start";
  if (left && !right) return "horizontal_pipe_end";
  return col % 2 === 0
    ? "horizontal_pipe_center_left"
    : "horizontal_pipe_center_right";
}

function getPipeConnections(mapLines, row, col) {
  return {
    left: ["-", "j", "u"].includes(mapCharAt(mapLines, row, col - 1)),
    right: ["-", "k", "n"].includes(mapCharAt(mapLines, row, col + 1)),
    up: ["|", "j", "k"].includes(mapCharAt(mapLines, row - 1, col)),
    down: ["|", "u", "n", "p", "q"].includes(mapCharAt(mapLines, row + 1, col)),
  };
}

function addAsciiStructureCell(k, mapLines, row, col, x, y) {
  const cell = mapCharAt(mapLines, row, col);
  let spriteName = null;
  let z = 1;

  if (isShaftCell(cell)) {
    spriteName = getShaftSpriteName(mapLines, row, col);
    z = 0;
  } else if (cell === "|") {
    spriteName = getVerticalPipeSpriteName(mapLines, row, col);
  } else if (cell === "-") {
    spriteName = getHorizontalPipeSpriteName(mapLines, row, col);
  } else if (cell === "j") {
    const { right, down, left, up } = getPipeConnections(mapLines, row, col);
    if (right && down) {
      spriteName = "pipe_elbow_down_right";
    } else if (left || right) {
      spriteName = getHorizontalPipeSpriteName(mapLines, row, col);
    } else if (up || down) {
      spriteName = getVerticalPipeSpriteName(mapLines, row, col);
    }
  } else if (cell === "k") {
    const { left, down, right, up } = getPipeConnections(mapLines, row, col);
    if (left && down) {
      spriteName = "pipe_elbow_down_left";
    } else if (left || right) {
      spriteName = getHorizontalPipeSpriteName(mapLines, row, col);
    } else if (up || down) {
      spriteName = getVerticalPipeSpriteName(mapLines, row, col);
    }
  } else if (cell === "u") {
    const { right, up, left, down } = getPipeConnections(mapLines, row, col);
    if (right && up) {
      spriteName = "pipe_elbow_up_right";
    } else if (left || right) {
      spriteName = getHorizontalPipeSpriteName(mapLines, row, col);
    } else if (up || down) {
      spriteName = getVerticalPipeSpriteName(mapLines, row, col);
    }
  } else if (cell === "n") {
    const { left, up, right, down } = getPipeConnections(mapLines, row, col);
    if (left && up) {
      spriteName = "pipe_elbow_up_left";
    } else if (left || right) {
      spriteName = getHorizontalPipeSpriteName(mapLines, row, col);
    } else if (up || down) {
      spriteName = getVerticalPipeSpriteName(mapLines, row, col);
    }
  } else if (cell === "p") {
    spriteName = "vertical_pipe_pour_left";
  } else if (cell === "q") {
    spriteName = "vertical_pipe_pour_right";
  } else if (cell === "v") {
    spriteName = "poured_water_left";
  } else if (cell === "r") {
    spriteName = "rope_start";
    z = 2;
  } else if (cell === "t") {
    spriteName = "rope_center";
    z = 2;
  } else if (cell === "f") {
    spriteName = "rope_end_attached";
    z = 2;
  } else if (cell === "c") {
    spriteName = "chain_start";
    z = 2;
  } else if (cell === "h") {
    spriteName = "chain_center";
    z = 2;
  } else if (cell === "g") {
    spriteName = "chain_end_attached";
    z = 2;
  } else if (cell === "w") {
    spriteName = "poured_water_right";
    z = 0.95;
  }

  if (!spriteName) return;

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
    k.z(z),
  ]);
}

function addBackdropTerrainPatch(
  k,
  mapOffsetY,
  colStart,
  rowStart,
  widthInTiles,
  heightInTiles,
  opacity = 0.35,
  shouldSkipCell = null,
) {
  for (let row = 0; row < heightInTiles; row++) {
    for (let col = 0; col < widthInTiles; col++) {
      const worldRow = rowStart + row;
      const worldCol = colStart + col;
      if (shouldSkipCell?.(worldRow, worldCol)) continue;

      const x = (colStart + col) * GAME_CONFIG.tile;
      const y = mapOffsetY + (rowStart + row) * GAME_CONFIG.tile;
      const hasTerrainLeft = col > 0;
      const hasTerrainRight = col < widthInTiles - 1;
      let spriteName;

      if (row === 0) {
        spriteName =
          heightInTiles === 1
            ? getTerrainRowSpriteName(
                TERRAIN_NO_SUPPORT_TILES,
                hasTerrainLeft,
                hasTerrainRight,
              )
            : getTerrainRowSpriteName(
                TERRAIN_TOP_TILES,
                hasTerrainLeft,
                hasTerrainRight,
              );
      } else if (row < heightInTiles - 1) {
        spriteName = getTerrainRowSpriteName(
          TERRAIN_CENTER_TILES,
          hasTerrainLeft,
          hasTerrainRight,
        );
      } else {
        spriteName =
          heightInTiles > 2
            ? getTerrainRowSpriteName(
                TERRAIN_BOTTOM_TILES,
                hasTerrainLeft,
                hasTerrainRight,
              )
            : getTerrainRowSpriteName(
                TERRAIN_NO_SUPPORT_TILES,
                hasTerrainLeft,
                hasTerrainRight,
              );
      }

      k.add([
        k.pos(x, y),
        k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
        k.opacity(opacity),
        k.z(-14),
      ]);
    }
  }
}

function buildBackgroundHousePlacements() {
  const placements = [];
  const occupiedCells = new Set();

  for (const spec of BACKGROUND_HOUSE_SPECS) {
    const template = HOUSES_GRAY_GREY_ROOF_BY_SIZE[spec.size];
    if (!template) {
      throw new Error(`House background size "${spec.size}" non definita.`);
    }

    const width = template[0].length;
    const height = template.length;
    const compatibleHills = BACKGROUND_HILL_SPECS.filter(
      ([, , hillWidth]) => hillWidth >= width,
    )
      .map(([hillCol, hillRow, hillWidth]) => {
        const snappedCol = kClamp(spec.col, hillCol, hillCol + hillWidth - width);
        return {
          hillCol,
          hillRow,
          hillWidth,
          col: snappedCol,
          row: hillRow - height,
          distance: Math.abs(snappedCol - spec.col),
        };
      })
      .sort((a, b) => a.distance - b.distance || a.hillCol - b.hillCol);

    let placement = null;

    for (const candidate of compatibleHills) {
      let overlaps = false;
      for (let localRow = 0; localRow < height && !overlaps; localRow++) {
        for (let localCol = 0; localCol < width; localCol++) {
          const key = buildCellKey(
            candidate.row + localRow,
            candidate.col + localCol,
          );
          if (occupiedCells.has(key)) {
            overlaps = true;
            break;
          }
        }
      }

      if (!overlaps) {
        placement = {
          ...spec,
          col: candidate.col,
          row: candidate.row,
          width,
          height,
          template,
        };
        break;
      }
    }

    if (!placement) {
      throw new Error(
        `Nessuna collina di sfondo disponibile per la casa ${spec.size} a colonna ${spec.col}.`,
      );
    }

    for (let localRow = 0; localRow < height; localRow++) {
      for (let localCol = 0; localCol < width; localCol++) {
        occupiedCells.add(buildCellKey(placement.row + localRow, placement.col + localCol));
      }
    }

    placements.push(placement);
  }

  return { placements, occupiedCells };
}

function kClamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function addBackdropToxicPatch(
  k,
  mapOffsetY,
  colStart,
  rowStart,
  widthInTiles,
  heightInTiles,
  opacity = 0.3,
) {
  for (let row = 0; row < heightInTiles; row++) {
    for (let col = 0; col < widthInTiles; col++) {
      const x = (colStart + col) * GAME_CONFIG.tile;
      const y = mapOffsetY + (rowStart + row) * GAME_CONFIG.tile;
      const hasAbove = row > 0;
      const hasLeft = col > 0;
      const hasRight = col < widthInTiles - 1;
      addToxicTile(k, x, y, hasAbove, hasLeft, hasRight, -13, opacity);
    }
  }
}

function addBackdropHouse(k, mapOffsetY, placement) {
  const { col: colStart, row: rowStart, template, opacity = 0.3 } = placement;
  for (let row = 0; row < template.length; row++) {
    for (let col = 0; col < template[row].length; col++) {
      const cell = template[row][col];
      const spriteName = HOUSE_TILE_SPRITE_BY_CHAR[cell];
      if (!spriteName) continue;

      k.add([
        k.pos(
          (colStart + col) * GAME_CONFIG.tile,
          mapOffsetY + (rowStart + row) * GAME_CONFIG.tile,
        ),
        k.sprite(getEnvironmentTileSprite(spriteName)),
        k.scale(TINY_TOWN_TILE_SCALE),
        k.opacity(opacity),
        k.z(-12),
      ]);
    }
  }
}

function addIndustrialPlatform(
  k,
  x,
  y,
  widthInTiles,
  supportHeights = [],
  variant = "default",
) {
  k.add([
    k.pos(x, y + GAME_CONFIG.tile * 0.6),
    k.rect(widthInTiles * GAME_CONFIG.tile, GAME_CONFIG.tile * 0.38),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);

  for (let i = 0; i < widthInTiles; i++) {
    const isDamaged = variant === "damaged";
    const leftSprite = isDamaged ? "girder_damaged_left" : "girder_left";
    const centerSprite = isDamaged ? "girder_damaged_center" : "girder_center";
    const rightSprite = isDamaged ? "girder_damaged_right" : "girder_right";
    const spriteName =
      widthInTiles === 1
        ? centerSprite
        : i === 0
          ? leftSprite
          : i === widthInTiles - 1
            ? rightSprite
            : centerSprite;

    k.add([
      k.pos(x + i * GAME_CONFIG.tile, y),
      k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
      k.z(1),
    ]);
  }

  supportHeights.forEach(() => {});
}

function addRope(k, x, y, length = 2, z = 2, bottomAttached = false) {
  const addSolidAnchor = (anchorX, anchorY, spriteName = "girder_center") => {
    addDecoration(k, spriteName, anchorX, anchorY, z - 1);
    k.add([
      k.pos(anchorX, anchorY),
      k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      TERRAIN_TAG,
    ]);
  };

  addSolidAnchor(x, y - GAME_CONFIG.tile);

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite("rope_start")),
    k.z(z),
  ]);

  for (let i = 1; i < length; i++) {
    k.add([
      k.pos(x, y + i * GAME_CONFIG.tile),
      k.sprite(getEnvironmentTileIndustrialSprite("rope_center")),
      k.z(z),
    ]);
  }

  k.add([
    k.pos(x, y + length * GAME_CONFIG.tile),
    k.sprite(
      getEnvironmentTileIndustrialSprite(
        bottomAttached ? "rope_end_attached" : "rope_end",
      ),
    ),
    k.z(z),
  ]);

  if (bottomAttached) {
    addSolidAnchor(x, y + (length + 1) * GAME_CONFIG.tile, "girder_support_top");
  }
}

function addChain(k, x, y, length = 2, z = 2, bottomAttached = false) {
  const addSolidAnchor = (anchorX, anchorY, spriteName = "girder_center") => {
    addDecoration(k, spriteName, anchorX, anchorY, z - 1);
    k.add([
      k.pos(anchorX, anchorY),
      k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      TERRAIN_TAG,
    ]);
  };

  addSolidAnchor(x, y - GAME_CONFIG.tile, "girder_right");

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite("chain_start")),
    k.z(z),
  ]);

  for (let i = 1; i < length; i++) {
    k.add([
      k.pos(x, y + i * GAME_CONFIG.tile),
      k.sprite(getEnvironmentTileIndustrialSprite("chain_center")),
      k.z(z),
    ]);
  }

  k.add([
    k.pos(x, y + length * GAME_CONFIG.tile),
    k.sprite(
      getEnvironmentTileIndustrialSprite(
        bottomAttached ? "chain_end_attached" : "chain_end",
      ),
    ),
    k.z(z),
  ]);

  if (bottomAttached) {
    addSolidAnchor(x, y + (length + 1) * GAME_CONFIG.tile, "girder_left");
  }
}

function addTowerSupport(k, x, yTop, heightInTiles) {
  for (let i = 0; i < heightInTiles; i++) {
    const spriteName =
      i === 0 ? "ladder" : i === heightInTiles - 1 ? "ladder_base" : i === 2 ? "support_brace" : "support_vertical";
    k.add([
      k.pos(x, yTop + i * GAME_CONFIG.tile),
      k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
      k.z(0),
    ]);
  }
}

function addVerticalShaft(k, x, yTop, heightInTiles, variant = "connector", z = 0) {
  const spriteSets = {
    ladder: {
      top: "shaft_ladder_top",
      center: "shaft_ladder_center",
      bottom: "shaft_ladder_bottom",
    },
    brace: {
      top: "shaft_brace_top",
      center: "shaft_brace_center",
      bottom: "shaft_brace_bottom",
    },
    connector: {
      top: "shaft_connector_top",
      center: "shaft_connector_center",
      bottom: "shaft_connector_bottom",
    },
  };

  const sprites = spriteSets[variant] ?? spriteSets.connector;

  for (let i = 0; i < heightInTiles; i++) {
    const spriteName =
      i === 0
        ? sprites.top
        : i === heightInTiles - 1
          ? sprites.bottom
          : sprites.center;

    addDecoration(k, spriteName, x, yTop + i * GAME_CONFIG.tile, z);
  }

  k.add([
    k.pos(x, yTop),
    k.rect(GAME_CONFIG.tile, heightInTiles * GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addConnectedBeamShaft(k, x, yBeam, heightInTiles, z = 0) {
  addDecoration(k, "girder_left", x, yBeam, z);
  addDecoration(k, "shaft_connector_top", x + GAME_CONFIG.tile, yBeam, z);
  addDecoration(k, "girder_right", x + GAME_CONFIG.tile * 2, yBeam, z);

  k.add([
    k.pos(x, yBeam + GAME_CONFIG.tile * 0.6),
    k.rect(GAME_CONFIG.tile * 3, GAME_CONFIG.tile * 0.38),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);

  for (let i = 0; i < heightInTiles; i++) {
    const spriteName =
      i === heightInTiles - 1 ? "shaft_connector_bottom" : "shaft_connector_center";

    addDecoration(
      k,
      spriteName,
      x + GAME_CONFIG.tile,
      yBeam + GAME_CONFIG.tile * (i + 1),
      z,
    );
  }

  k.add([
    k.pos(x + GAME_CONFIG.tile, yBeam + GAME_CONFIG.tile),
    k.rect(GAME_CONFIG.tile, heightInTiles * GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addDecoration(k, spriteName, x, y, z = 2) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileIndustrialSprite(spriteName)),
    k.z(z),
  ]);
}

function addDoorDecoration(k, x, y) {
  return addDecoration(k, "door", x, y, 2);
}

function addCheckpointFlagDecoration(k, x, y) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileSprite("flag"), { anim: "wave" }),
    k.scale(2),
    k.z(2),
  ]);
}

function addVerticalPipe(
  k,
  x,
  y,
  {
    z = 1,
    segmentCount = 6,
    topCap = true,
    bottomCap = true,
  } = {},
) {
  const sprites = [];

  for (let i = 0; i < segmentCount; i++) {
    if (i === 0 && topCap) {
      sprites.push("vertical_pipe_start");
      continue;
    }

    if (i === segmentCount - 1 && bottomCap) {
      sprites.push("vertical_pipe_end");
      continue;
    }

    sprites.push(i % 2 === 0 ? "vertical_pipe_center_lower" : "vertical_pipe_center_upper");
  }

  sprites.forEach((spriteName, index) => {
    addDecoration(k, spriteName, x, y + index * GAME_CONFIG.tile, z);
  });

  k.add([
    k.pos(x, y),
    k.rect(GAME_CONFIG.tile, sprites.length * GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addHorizontalPipe(
  k,
  x,
  y,
  lengthInTiles = 4,
  z = 1,
  { startCap = true, endCap = true } = {},
) {
  const sprites = [];

  for (let i = 0; i < lengthInTiles; i++) {
    if (i === 0 && startCap) {
      sprites.push("horizontal_pipe_start");
    } else if (i === lengthInTiles - 1 && endCap) {
      sprites.push("horizontal_pipe_end");
    } else {
      const phase = startCap ? i - 1 : i;
      sprites.push(
        phase % 2 === 0
          ? "horizontal_pipe_center_left"
          : "horizontal_pipe_center_right",
      );
    }
  }

  sprites.forEach((spriteName, index) => {
    addDecoration(k, spriteName, x + index * GAME_CONFIG.tile, y, z);
  });

  k.add([
    k.pos(x, y),
    k.rect(lengthInTiles * GAME_CONFIG.tile, GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addPipeElbow(k, x, y, type, z = 1) {
  const spriteByType = {
    down_right: "pipe_elbow_down_right",
    down_left: "pipe_elbow_down_left",
    up_left: "pipe_elbow_up_left",
    up_right: "pipe_elbow_up_right",
  };

  addDecoration(k, spriteByType[type], x, y, z);

  k.add([
    k.pos(x, y),
    k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addPipeTestRig(k, x, y, z = 1) {
  const span = 10;

  addPipeElbow(k, x, y, "down_right", z);
  addHorizontalPipe(k, x + GAME_CONFIG.tile, y, span, z, {
    startCap: false,
    endCap: false,
  });
  addPipeElbow(k, x + GAME_CONFIG.tile * (span + 1), y, "down_left", z);

  addVerticalPipe(k, x, y + GAME_CONFIG.tile, {
    z,
    segmentCount: 4,
    topCap: false,
    bottomCap: false,
  });
  addVerticalPipe(k, x + GAME_CONFIG.tile * (span + 1), y + GAME_CONFIG.tile, {
    z,
    segmentCount: 4,
    topCap: false,
    bottomCap: false,
  });

  const bottomY = y + GAME_CONFIG.tile * 5;
  addPipeElbow(k, x, bottomY, "up_right", z);
  addHorizontalPipe(k, x + GAME_CONFIG.tile, bottomY, span, z, {
    startCap: false,
    endCap: false,
  });
  addPipeElbow(k, x + GAME_CONFIG.tile * (span + 1), bottomY, "up_left", z);
}

function addPouringWaterPipe(k, x, y, { pipeRows = 3, z = 1 } = {}) {
  for (let row = 0; row < pipeRows; row++) {
    const leftSprite = row === 0 ? "vertical_pipe_start" : "vertical_pipe_center_upper";
    const rightSprite = row === 0 ? "vertical_pipe_start" : "vertical_pipe_center_lower";
    addDecoration(k, leftSprite, x, y + row * GAME_CONFIG.tile, z);
    addDecoration(k, rightSprite, x + GAME_CONFIG.tile, y + row * GAME_CONFIG.tile, z);
  }

  const spoutY = y + pipeRows * GAME_CONFIG.tile;
  addDecoration(k, "vertical_pipe_pour_left", x, spoutY, z);
  addDecoration(k, "vertical_pipe_pour_right", x + GAME_CONFIG.tile, spoutY, z);

  const splashY = spoutY + GAME_CONFIG.tile;
  addDecoration(k, "poured_water_left", x, splashY, z);
  addDecoration(k, "poured_water_right", x + GAME_CONFIG.tile, splashY, z);

  k.add([
    k.pos(x, y),
    k.rect(GAME_CONFIG.tile * 2, (pipeRows + 1) * GAME_CONFIG.tile),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    TERRAIN_TAG,
  ]);
}

function addTownfolkNpc(k, x, y) {
  const npcPosY = y + GAME_CONFIG.tile - NPC_VISUAL_HEIGHT * NPC_SCALE;
  const npc = k.add([
    k.pos(x, npcPosY),
    k.sprite("npcWingsAndTiara2", { anim: "front" }),
    k.scale(NPC_SCALE),
    k.area(),
    k.z(3),
    TAGS.goal,
    "npc",
  ]);

  npc.play("front");
  return npc;
}

function addPatrolEnemy(
  k,
  x,
  y,
  patrolWidth = GAME_CONFIG.tile * 4,
  speed = 90,
  enemyName = "alien_1",
  animationSpeed = 8,
  shouldTurn = null,
  ignoreHazards = false,
  isDialogOpen = () => false,
  randomJump = null,
) {
  const animationFrames = getEnemySpriteFrames(enemyName);
  const jumpSettings = randomJump
    ? {
        minInterval: randomJump.minInterval ?? 1,
        maxInterval: randomJump.maxInterval ?? 2,
        chance: randomJump.chance ?? 0.5,
        jumpForce: randomJump.jumpForce ?? GAME_CONFIG.jumpForce * 0.75,
      }
    : null;
  const enemy = k.add([
    k.pos(x, y),
    k.sprite(animationFrames[0]),
    k.scale(1.5),
    k.area(ignoreHazards ? { collisionIgnore: [TAGS.hazard] } : undefined),
    k.body(jumpSettings ? { jumpForce: jumpSettings.jumpForce } : {}),
    k.z(4),
    TAGS.hazard,
    "enemy",
    { isEnemyActor: true },
  ]);

  const minX = x - patrolWidth;
  const maxX = x + patrolWidth;
  let direction = 1;
  let animationTimer = 0;
  let frameIndex = 0;
  let turnCooldown = 0;
  let jumpTimer = jumpSettings
    ? jumpSettings.minInterval +
      Math.random() * (jumpSettings.maxInterval - jumpSettings.minInterval)
    : 0;

  enemy.onCollide(TERRAIN_TAG, (_, col) => {
    if (turnCooldown > 0 || !col || !enemy.isGrounded()) return;
    if (!col.isLeft() && !col.isRight()) return;

    const wasMovingRight = direction > 0;
    direction *= -1;
    enemy.vel.x = 0;
    enemy.pos.x += wasMovingRight ? -2 : 2;
    turnCooldown = 0.12;
  });

  if (!ignoreHazards) {
    enemy.onCollide(TAGS.hazard, () => {
      if (turnCooldown > 0 || !enemy.isGrounded()) return;
      const wasMovingRight = direction > 0;
      direction *= -1;
      enemy.vel.x = 0;
      enemy.pos.x += wasMovingRight ? -2 : 2;
      turnCooldown = 0.12;
    });
  }

  enemy.onUpdate(() => {
    if (isDialogOpen()) {
      enemy.vel = k.vec2(0, 0);
      return;
    }

    if (enemy._resumeDirection) {
      direction = enemy._resumeDirection;
      enemy._resumeDirection = 0;
    }

    if ((enemy._stunnedUntil ?? 0) > k.time()) {
      enemy.vel.x = 0;
      enemy.flipX = direction < 0;
      return;
    }

    turnCooldown = Math.max(0, turnCooldown - k.dt());
    if (jumpSettings) {
      jumpTimer -= k.dt();
      if (jumpTimer <= 0) {
        if (enemy.isGrounded() && Math.random() <= jumpSettings.chance) {
          enemy.jump();
        }
        jumpTimer =
          jumpSettings.minInterval +
          Math.random() * (jumpSettings.maxInterval - jumpSettings.minInterval);
      }
    }
    const bbox = enemy.worldArea().bbox();

    if (
      turnCooldown <= 0 &&
      enemy.isGrounded() &&
      shouldTurn &&
      shouldTurn(enemy, direction, bbox)
    ) {
      direction *= -1;
      enemy.vel.x = 0;
      turnCooldown = 0.1;
    }

    enemy.move(speed * direction, 0);

    if (animationFrames.length > 1) {
      animationTimer += k.dt();
      if (animationTimer >= 1 / animationSpeed) {
        animationTimer = 0;
        frameIndex = (frameIndex + 1) % animationFrames.length;
        enemy.use(k.sprite(animationFrames[frameIndex]));
      }
    }

    enemy.flipX = direction < 0;

    const rightEdge = bbox.pos.x + bbox.width;
    const leftEdge = bbox.pos.x;

    if (rightEdge >= maxX) {
      enemy.vel.x = 0;
      direction = -1;
      turnCooldown = 0.1;
    } else if (leftEdge <= minX) {
      enemy.vel.x = 0;
      direction = 1;
      turnCooldown = 0.1;
    }
  });

  return enemy;
}

function addWaterJumpEnemy(
  k,
  x,
  y,
  enemyName = "scrissors",
  animationSpeed = 8,
  isDialogOpen = () => false,
) {
  const animationFrames = getEnemySpriteFrames(enemyName);
  const enemy = k.add([
    k.pos(x, y + GAME_CONFIG.tile * 0.6),
    k.sprite(animationFrames[0]),
    k.scale(1.5),
    k.area({ collisionIgnore: [TAGS.hazard] }),
    k.z(4),
    TAGS.hazard,
    "enemy",
    { isEnemyActor: true },
  ]);

  const originX = x;
  const hiddenY = y + GAME_CONFIG.tile * 0.7;
  const waterSurfaceY = y + GAME_CONFIG.tile * 0.18;
  const peakY = y - GAME_CONFIG.tile * 10.8;
  const riseSpeed = 260;
  const fallSpeed = 168;
  const bobSeed = k.rand(0, Math.PI * 2);
  let state = "wait";
  let stateUntil = k.time() + k.rand(0.35, 0.85);
  let animationTimer = 0;
  let frameIndex = 0;

  enemy.onUpdate(() => {
    if (isDialogOpen()) return;

    if ((enemy._stunnedUntil ?? 0) > k.time()) {
      return;
    }

    if (animationFrames.length > 1) {
      animationTimer += k.dt();
      if (animationTimer >= 1 / animationSpeed) {
        animationTimer = 0;
        frameIndex = (frameIndex + 1) % animationFrames.length;
        enemy.use(k.sprite(animationFrames[frameIndex]));
      }
    }

    enemy.pos.x = originX + Math.sin(k.time() * 3.4 + bobSeed) * 2;

    if (state === "wait") {
      enemy.pos.y = hiddenY;
      enemy.opacity = 0;
      enemy.angle = 0;
      if (k.time() >= stateUntil) {
        state = "rise";
      }
      return;
    }

    if (state === "rise") {
      enemy.pos.y = Math.max(peakY, enemy.pos.y - riseSpeed * k.dt());
      enemy.opacity = enemy.pos.y < waterSurfaceY ? 1 : 0;
      enemy.angle = 0;
      if (enemy.pos.y <= peakY + 0.5) {
        state = "fall";
      }
      return;
    }

    enemy.pos.y = Math.min(hiddenY, enemy.pos.y + fallSpeed * k.dt());
    enemy.opacity = enemy.pos.y < waterSurfaceY ? 1 : 0;
    enemy.angle = 180;
    if (enemy.pos.y >= hiddenY - 0.5) {
      enemy.pos.y = hiddenY;
      enemy.opacity = 0;
      enemy.angle = 0;
      state = "wait";
      stateUntil = k.time() + k.rand(0.55, 1.1);
    }
  });

  return enemy;
}

export function buildLevelFourLombardia(k, options = {}) {
  const { isDialogOpen = () => false } = options;
  const baseMapLines = normalizeAsciiMap(LEVEL_FOUR_ASCII);
  const housePlacements = findHousePlacements(
    baseMapLines,
    HOUSE_PLACEHOLDER_CONFIG,
  );
  const houseCells = buildHouseCellSet(housePlacements);
  const mapLines = applyHouses(baseMapLines, HOUSE_PLACEHOLDER_CONFIG);
  const rows = mapLines.length;
  const cols = mapLines[0].length;
  const levelWidth = cols * GAME_CONFIG.tile;
  const floorY = k.height() - GAME_CONFIG.floorHeight;
  const floorStartRow = rows - 3;
  const mapOffsetY = floorY - floorStartRow * GAME_CONFIG.tile;
  const backgroundHouseLayer = buildBackgroundHousePlacements();

  addIndustrialSky(k, levelWidth);
  BACKGROUND_HILL_SPECS.forEach(([col, row, width, height, opacity]) => {
    addBackdropTerrainPatch(
      k,
      mapOffsetY,
      col,
      row,
      width,
      height,
      opacity,
      (cellRow, cellCol) =>
        backgroundHouseLayer.occupiedCells.has(buildCellKey(cellRow, cellCol)),
    );
  });
  backgroundHouseLayer.placements.forEach((placement) => {
    addBackdropHouse(k, mapOffsetY, placement);
  });
  addBackdropToxicPatch(k, mapOffsetY, 11, 8, 5, 4, 0.22);
  addBackdropToxicPatch(k, mapOffsetY, 58, 9, 7, 3, 0.2);
  addBackdropToxicPatch(k, mapOffsetY, 152, 9, 7, 3, 0.18);
  addBackdropToxicPatch(k, mapOffsetY, 273, 9, 8, 3, 0.18);

  let playerStart = k.vec2(GAME_CONFIG.playerStart.x, GAME_CONFIG.playerStart.y);
  let npcSpawnPos = null;
  const enemySpawns = [];
  let exitDoorBlocker = null;
  let exitDoorPos = null;

  function cellAtWorld(worldX, worldY) {
    const col = Math.floor(worldX / GAME_CONFIG.tile);
    const row = Math.floor((worldY - mapOffsetY) / GAME_CONFIG.tile);
    return mapCharAt(mapLines, row, col);
  }

  function isHouseCell(row, col) {
    return houseCells.has(buildCellKey(row, col));
  }

  function isHouseAtWorld(worldX, worldY) {
    const col = Math.floor(worldX / GAME_CONFIG.tile);
    const row = Math.floor((worldY - mapOffsetY) / GAME_CONFIG.tile);
    return isHouseCell(row, col);
  }

  function hasGroundAtWorld(worldX, worldY) {
    const cell = cellAtWorld(worldX, worldY);
    return isSolidAsciiCell(cell) || cell === "=" || isHouseAtWorld(worldX, worldY);
  }

  const foregroundDecorCells = new Set();

  function isForegroundDecorAreaClear(rowTop, colStart, width, height) {
    if (rowTop < 0 || colStart < 0 || rowTop + height > rows || colStart + width > cols) {
      return false;
    }

    for (let row = rowTop; row < rowTop + height; row++) {
      for (let col = colStart; col < colStart + width; col++) {
        if (foregroundDecorCells.has(buildCellKey(row, col))) {
          return false;
        }

        if (isHouseCell(row, col)) {
          return false;
        }

        const cell = mapCharAt(mapLines, row, col);
        if (cell !== " ") {
          return false;
        }
      }
    }

    return true;
  }

  function hasForegroundDecorSupport(supportRow, colStart, width) {
    if (supportRow < 0 || supportRow >= rows) {
      return false;
    }

    for (let col = colStart; col < colStart + width; col++) {
      const worldX = col * GAME_CONFIG.tile + GAME_CONFIG.tile * 0.5;
      const worldY =
        mapOffsetY + supportRow * GAME_CONFIG.tile + GAME_CONFIG.tile * 0.75;
      if (!hasGroundAtWorld(worldX, worldY)) {
        return false;
      }
    }

    return true;
  }

  function findForegroundDecorPlacement(spec) {
    const width = spec.tiles[0].length;
    const height = spec.tiles.length;
    const candidateCols = [];

    for (let offset = 0; offset <= 8; offset++) {
      candidateCols.push(spec.col + offset);
      if (offset > 0) {
        candidateCols.push(spec.col - offset);
      }
    }

    for (const candidateCol of candidateCols) {
      if (candidateCol < 0 || candidateCol + width > cols) {
        continue;
      }

      for (let supportRow = 0; supportRow < rows; supportRow++) {
        const rowTop = supportRow - height;
        if (rowTop < 0) {
          continue;
        }

        if (
          hasForegroundDecorSupport(supportRow, candidateCol, width) &&
          isForegroundDecorAreaClear(rowTop, candidateCol, width, height)
        ) {
          return { row: rowTop, col: candidateCol };
        }
      }
    }

    return null;
  }

  function addForegroundDecor(spec, z = 2.2) {
    const placement = findForegroundDecorPlacement(spec);
    if (!placement) {
      return;
    }

    spec.tiles.forEach((tileRow, rowOffset) => {
      tileRow.forEach((spriteName, colOffset) => {
        if (!spriteName) {
          return;
        }

        const row = placement.row + rowOffset;
        const col = placement.col + colOffset;
        foregroundDecorCells.add(buildCellKey(row, col));
        addDecoration(
          k,
          spriteName,
          col * GAME_CONFIG.tile,
          mapOffsetY + row * GAME_CONFIG.tile,
          z,
        );
      });
    });
  }

  function shouldEnemyTurn(enemy, direction, bbox) {
    const lookAhead = Math.max(4, GAME_CONFIG.tile * 0.35);
    const footX =
      direction > 0 ? bbox.pos.x + bbox.width + lookAhead : bbox.pos.x - lookAhead;
    const footY = bbox.pos.y + bbox.height + 2;
    const wallY = bbox.pos.y + bbox.height * 0.55;
    const wallX = direction > 0 ? bbox.pos.x + bbox.width + 2 : bbox.pos.x - 2;
    const wallCell = cellAtWorld(wallX, wallY);
    const noGroundAhead = !hasGroundAtWorld(footX, footY);
    const wallAhead = isSolidAsciiCell(wallCell) || isHouseAtWorld(wallX, wallY);
    return noGroundAhead || wallAhead;
  }

  function spawnEnemy(spawn) {
    if (spawn.enemyName === "scrissors") {
      return addWaterJumpEnemy(
        k,
        spawn.x,
        spawn.y,
        spawn.enemyName,
        spawn.animationSpeed,
        isDialogOpen,
      );
    }

    return addPatrolEnemy(
      k,
      spawn.x,
      spawn.y,
      spawn.patrolWidth,
      spawn.speed,
      spawn.enemyName,
      spawn.animationSpeed,
      shouldEnemyTurn,
      spawn.ignoreHazards,
      isDialogOpen,
      spawn.randomJump,
    );
  }

  function resetEnemies() {
    for (const enemy of k.get("enemy")) {
      enemy.destroy();
    }

    for (const spawn of enemySpawns) {
      spawnEnemy(spawn);
    }
  }

  function addExitDoorTriggerAndBlocker(x, y) {
    exitDoorBlocker = k.add([
      k.pos(x + GAME_CONFIG.tile * 0.55, y - GAME_CONFIG.tile * 1.9),
      k.rect(GAME_CONFIG.tile * 1.4, GAME_CONFIG.tile * 3.1),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      TERRAIN_TAG,
    ]);

    k.add([
      k.pos(x + GAME_CONFIG.tile * 0.35, y - GAME_CONFIG.tile * 1.9),
      k.rect(GAME_CONFIG.tile * 1.8, GAME_CONFIG.tile * 3.1),
      k.area(),
      k.opacity(0),
      TAGS.levelExit,
    ]);
  }

  function addExitDoor(x, y) {
    k.add([
      k.pos(x, y - GAME_CONFIG.tile),
      k.sprite(getEnvironmentTileIndustrialSprite("door")),
      k.scale(2),
      k.z(2),
    ]);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      if (isHouseCell(row, col)) {
        const spriteName = HOUSE_TILE_SPRITE_BY_CHAR[cell];
        if (!spriteName) {
          throw new Error(`House tile "${cell}" non definita nel livello 4.`);
        }

        k.add([
          k.pos(x, y),
          k.sprite(getEnvironmentTileSprite(spriteName)),
          k.scale(TINY_TOWN_TILE_SCALE),
          k.z(0.5),
        ]);
      } else if (cell === "#") {
        const isTop = mapCharAt(mapLines, row - 1, col) !== "#";
        const hasTerrainBelow = mapCharAt(mapLines, row + 1, col) === "#";
        const hasTerrainLeft = mapCharAt(mapLines, row, col - 1) === "#";
        const hasTerrainRight = mapCharAt(mapLines, row, col + 1) === "#";
        addGroundTile(
          k,
          x,
          y,
          isTop,
          hasTerrainBelow,
          hasTerrainLeft,
          hasTerrainRight,
        );
      } else if (isWaterAsciiCell(cell)) {
        addToxicTile(
          k,
          x,
          y,
          isWaterAsciiCell(mapCharAt(mapLines, row - 1, col)),
          isWaterAsciiCell(mapCharAt(mapLines, row, col - 1)),
          isWaterAsciiCell(mapCharAt(mapLines, row, col + 1)),
        );
        if (cell === "v" || cell === "w") {
          addAsciiStructureCell(k, mapLines, row, col, x, y);
        }
      } else if (cell === "=") {
        const isStartOfRun = mapCharAt(mapLines, row, col - 1) !== "=";
        if (isStartOfRun) {
          let runLength = 1;
          while (mapCharAt(mapLines, row, col + runLength) === "=") {
            runLength += 1;
          }

          const variant = row <= 4 ? "damaged" : "default";
          addIndustrialPlatform(k, x, y, runLength, [], variant);
        }
      } else if (cell === "P") {
        playerStart = k.vec2(x, y - GAME_CONFIG.tile);
      } else if (cell === "S") {
        npcSpawnPos = k.vec2(x, y);
      } else if (cell === "*") {
        const flagRef = addCheckpointFlagDecoration(k, x, y);
        k.add([
          k.pos(x, y - GAME_CONFIG.tile),
          k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
          k.area(),
          k.opacity(0),
          TAGS.checkpoint,
          {
            checkpointId: `level4-flag-${col}-${row}`,
            respawnPos: k.vec2(x, y - GAME_CONFIG.tile),
            flagRef,
          },
        ]);
      } else if (cell === "d") {
        // The final exit door is placed after the NPC, not at the legacy map marker.
      } else if (
        isShaftCell(cell) ||
        PIPE_SOLID_CHARS.has(cell) ||
        HANGING_DECOR_CHARS.has(cell) ||
        cell === "v" ||
        cell === "w"
      ) {
        addAsciiStructureCell(k, mapLines, row, col, x, y);
      }
    }
  }

  const terrainColliderRects = buildColliderRects(mapLines, (cell, row, col) =>
    isSolidAsciiCell(cell) || isHouseCell(row, col),
  );
  for (const rect of terrainColliderRects) {
    const x = rect.x0 * GAME_CONFIG.tile;
    const y = mapOffsetY + rect.startRow * GAME_CONFIG.tile;
    const w = (rect.x1 - rect.x0 + 1) * GAME_CONFIG.tile;
    const h = (rect.lastRow - rect.startRow + 1) * GAME_CONFIG.tile;

    k.add([
      k.pos(x, y),
      k.rect(w, h),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      TERRAIN_TAG,
    ]);
  }

  const toxicRects = buildColliderRects(mapLines, (cell) => isWaterAsciiCell(cell));
  for (const rect of toxicRects) {
    const x = rect.x0 * GAME_CONFIG.tile;
    const y = mapOffsetY + rect.startRow * GAME_CONFIG.tile;
    const w = (rect.x1 - rect.x0 + 1) * GAME_CONFIG.tile;
    const h = (rect.lastRow - rect.startRow + 1) * GAME_CONFIG.tile;

    k.add([
      k.pos(x, y),
      k.rect(w, h),
      k.area(),
      k.opacity(0),
      TAGS.hazard,
    ]);
  }

  FOREGROUND_DECOR_SPECS.forEach((spec) => {
    addForegroundDecor(spec);
  });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      if (Object.hasOwn(ENEMY_BY_CHAR, cell)) {
        const config = ENEMY_BY_CHAR[cell];
        const spawn = {
          x,
          y:
            config.enemyName === "scrissors"
              ? y
              : y - GAME_CONFIG.tile * 2,
          patrolWidth: config.patrolWidth,
          speed: config.speed,
          enemyName: config.enemyName,
          animationSpeed: config.animationSpeed,
          ignoreHazards: false,
          randomJump: config.randomJump,
        };
        enemySpawns.push(spawn);
        spawnEnemy(spawn);
      }
    }
  }

  if (npcSpawnPos) {
    addTownfolkNpc(k, npcSpawnPos.x, npcSpawnPos.y);
  } else {
    addTownfolkNpc(k, playerStart.x + GAME_CONFIG.tile * 4, playerStart.y);
  }

  exitDoorPos = npcSpawnPos
    ? k.vec2(npcSpawnPos.x + GAME_CONFIG.tile * 4, npcSpawnPos.y)
    : k.vec2(playerStart.x + GAME_CONFIG.tile * 8, playerStart.y);
  addExitDoor(exitDoorPos.x, exitDoorPos.y);

  addExitDoorTriggerAndBlocker(exitDoorPos.x, exitDoorPos.y);

  return {
    levelWidth,
    playerStart,
    resetEnemies,
    unlockExitDoor() {
      if (!exitDoorBlocker) return;
      exitDoorBlocker.destroy();
      exitDoorBlocker = null;
    },
  };
}
