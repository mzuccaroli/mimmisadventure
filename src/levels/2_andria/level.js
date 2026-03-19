import { GAME_CONFIG, TAGS } from "../../tiles.js";
import { getEnemySpriteFrames } from "../../enemyTiles.js";
import { getEnvironmentTileSprite } from "../../environmentTiles.js";
import { applyHouses } from "../shared/houses.js";

const TERRAIN_TAG = "terrain";
const NPC_VISUAL_HEIGHT = 23;
const NPC_SCALE = 2;
const TINY_TOWN_TILE_SCALE = GAME_CONFIG.tile / 16;
const PIPE_TILE_SCALE = GAME_CONFIG.tile / 16;
const ROPE_TILE_SCALE = 1;
const PLAYER_BACK_FRAME = 2;
const HOUSE_TILE_CHARS = new Set("ABCFGHIJKLMNOQRTUVWYZ012aemwkx34".split(""));
const PIPE_TRAVEL_SPEED = GAME_CONFIG.tile * 7;
const ROPE_TRAVEL_SPEED = GAME_CONFIG.tile * 6.5;
const PIPE_ENDPOINT_CHARS = new Set(["u", "j", "z", "!"]);
const PIPE_CHARS = new Set(["u", "i", "j", "y", "v", "[", "]", "z", "|", "!"]);
const ROPE_CHARS = new Set(["(", "r", ")", "{", "_", "}", "h"]);
const PIPE_CONNECTIONS = Object.freeze({
  u: ["right"],
  i: ["left", "right"],
  j: ["left"],
  y: ["right", "down"],
  v: ["left", "down"],
  "[": ["right", "up"],
  "]": ["left", "up"],
  z: ["down"],
  "|": ["up", "down"],
  "!": ["up"],
});
const ROPE_CONNECTIONS = Object.freeze({
  "(": ["down"],
  r: ["up", "down"],
  ")": ["up"],
  "{": ["right"],
  _: ["left", "right"],
  "}": ["left"],
  h: ["left", "right", "down"],
});
const DIRECTION_DELTAS = Object.freeze({
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
});
const OPPOSITE_DIRECTION = Object.freeze({
  left: "right",
  right: "left",
  up: "down",
  down: "up",
});
const ENEMY_BY_CHAR = Object.freeze({
  E: {
    patrolWidth: GAME_CONFIG.tile * 10,
    speed: 95,
    enemyName: "alien_1",
    animationSpeed: 8,
    ignoreHazards: false,
  },
  X: {
    patrolWidth: GAME_CONFIG.tile * 8,
    speed: 80,
    enemyName: "spike",
    animationSpeed: 8,
    ignoreHazards: true,
  },
  5: {
    patrolWidth: GAME_CONFIG.tile * 8,
    speed: 88,
    enemyName: "alien_3",
    animationSpeed: 7,
    ignoreHazards: false,
  },
  6: {
    patrolWidth: GAME_CONFIG.tile * 9,
    speed: 78,
    enemyName: "alien_4",
    animationSpeed: 7,
    ignoreHazards: false,
    randomJump: {
      minInterval: 0.9,
      maxInterval: 2.1,
      chance: 0.65,
      jumpForce: GAME_CONFIG.jumpForce * 0.78,
    },
  },
  7: {
    patrolWidth: GAME_CONFIG.tile * 11,
    speed: 92,
    enemyName: "robot",
    animationSpeed: 8,
    ignoreHazards: false,
  },
});

// House blocks use rectangles of H and are expanded through the shared houses module.
const LEVEL_TWO_ASCII = [
  "              5                                                                                                                       6",
  "            GGGG                                                              GGGG                                                  GGGGGG",
  "            GGGG{______________}RRRRR                   X                     GGGG                                                  GGGGGG",
  "            GGGG                RRRRR                 HHHHHH                  GGGG                      E                           GGGGGG",
  "            GGGG                RRRRR                 HHHHHH                  GGGG                    RRRRRR                        GGGGGG",
  "           ######               RRRRR                 HHHHHH{______________}######                    RRRRRR                        GGGGGG",
  "                               #######                HHHHHH                                          RRRRRR                        GGGGGG",
  "                                     (               ########                                         RRRRRR                        GGGGGG",
  "                                     r               h                                                RRRRRR                        GGGGGG",
  "                                     r                                                               ########                      ########            E",
  "                  ~~~~RRRR           r        6             HHHHHHH                                                                                   GGGG",
  "                      RRRR           r      =====           HHHHHHH                                                                                   GGGG",
  "                      RRRR           r                      HHHHHHH                       ~~~                                                         GGGG",
  "                      RRRR           r                      HHHHHHH                                                 ====                              GGGG",
  "                     ######          r ===RRRRRRRRR        #########                                                                                 ######",
  "          E                          r    RRRRRRRRR                                                                                GGGG",
  "      #######                        r    RRRRRRRRR                                              HHHHHHH                           GGGG",
  "                              ####   r    RRRRRRRRR                                              HHHHHHH                           GGGG",
  "                       ~~            )    RRRRRRRRR             =======           *              HHHHHHH                           GGGG",
  "                 ==                 ################            =======                          HHHHHHH                         ######                                      ",
  "         #######                    ####                         =======          =======         =======                                                                     ",
  "                                    RRRR                         =======          =======     E    =======                 ======",
  "                        HHHH        RRRRz         HHHHHH     X    GGGGGG          HHHHHHH          GGGGGGG                 RRRRRR    GGGG",
  "                        HHHH        RRRR|         HHHHHH          GGGGGG     6    HHHHHHH          GGGGGGG                 RRRRRR    GGGG",
  "                        HHHH        RRRR|         HHHHHH          GGGGGG          HHHHHHH          GGGGGGG      6       z  RRRRRR    GGGG           ",
  "   P         ^^^  ==    HHHH       #####|#        HHHHHH          GGGGGG          HHHHHHH          GGGGGGG              |  RRRRRR    GGGG      >                       S f",
  "######################@@@@@@@@@@@@@@@@##|###############@@@@###@@@@@@@@@###@@@@@@@@@###@@@@@@@@###@@@@@@################|################.                                   ",
  "######################@@@@@@@@@@@@@@@@##[iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii]####################################################",
  "#############################################################################################################################################################################",
  "#############################################################################################################################################################################",
];

const TERRAIN_TOP_TILES_NO_SUPPORT = {
  single: "grass_single",
  left: "grass_1",
  center: "grass_2",
  right: "grass_3",
};
const TERRAIN_TOP_TILES_WITH_SUPPORT = {
  single: "grass_single_1",
  left: "grass_4",
  center: "grass_5",
  right: "grass_6",
};

const DECORATION_BY_CHAR = Object.freeze({
  t: { sprite: "tree_1", scale: 2 },
  c: { sprite: "plant_cactus", scale: 2 },
  g: { sprite: "plant_1", scale: 2 },
  p: { sprite: "plant_2", scale: 2 },
  q: { sprite: "plant_3", scale: 2 },
  ">": { sprite: "sign_arrow_r", scale: 2 },
  "<": { sprite: "sign_arrow_l", scale: 2 },
  s: { sprite: "sign_board_3", scale: 2 },
  o: { sprite: "obstacle_torch_red", scale: 2 },
  d: { sprite: "door_1", scale: 2 },
  D: { sprite: "door_2", scale: 2 },
  f: { sprite: "flag_1", scale: 2 },
  n: { sprite: "flag_2", scale: 2 },
  "*": { sprite: "flag", scale: 2, anim: "wave" },
  b: { sprite: "button_green", scale: 2 },
  l: { sprite: "lever_1", scale: 2 },
  "(": { sprite: "rope_vertical_start", scale: ROPE_TILE_SCALE },
  r: { sprite: "rope_vertical_center", scale: ROPE_TILE_SCALE },
  ")": { sprite: "rope_vertical_end", scale: ROPE_TILE_SCALE },
  h: { sprite: "rope_hook", scale: ROPE_TILE_SCALE },
  "{": { sprite: "rope_horizontal_start", scale: ROPE_TILE_SCALE },
  _: { sprite: "rope_horizontal_center", scale: ROPE_TILE_SCALE },
  "}": { sprite: "rope_horizontal_end", scale: ROPE_TILE_SCALE },
  u: { sprite: "pipe_blue_horizontal_start", scale: PIPE_TILE_SCALE },
  i: { sprite: "pipe_blue_horizontal_center", scale: PIPE_TILE_SCALE },
  j: { sprite: "pipe_blue_horizontal_end", scale: PIPE_TILE_SCALE },
  y: { sprite: "pipe_blue_corner_tl", scale: PIPE_TILE_SCALE },
  z: { sprite: "pipe_blue_vertical_start", scale: PIPE_TILE_SCALE },
  v: { sprite: "pipe_blue_corner_tr", scale: PIPE_TILE_SCALE },
  "[": { sprite: "pipe_blue_corner_bl", scale: PIPE_TILE_SCALE },
  "]": { sprite: "pipe_blue_corner_br", scale: PIPE_TILE_SCALE },
  "|": { sprite: "pipe_blue_vertical_center", scale: PIPE_TILE_SCALE },
  "!": { sprite: "pipe_blue_vertical_end", scale: PIPE_TILE_SCALE },
  A: { sprite: "tiny_roof_top_grey_left", scale: TINY_TOWN_TILE_SCALE },
  B: { sprite: "tiny_roof_top_grey_center", scale: TINY_TOWN_TILE_SCALE },
  C: { sprite: "tiny_roof_top_grey_right", scale: TINY_TOWN_TILE_SCALE },
  F: { sprite: "tiny_roof_top_grey_chimney", scale: TINY_TOWN_TILE_SCALE },
  G: { sprite: "tiny_roof_top_red_left", scale: TINY_TOWN_TILE_SCALE },
  H: { sprite: "tiny_roof_top_red_center", scale: TINY_TOWN_TILE_SCALE },
  I: { sprite: "tiny_roof_top_red_right", scale: TINY_TOWN_TILE_SCALE },
  J: { sprite: "tiny_roof_top_red_chimney", scale: TINY_TOWN_TILE_SCALE },
  K: { sprite: "tiny_roof_bottom_grey_left", scale: TINY_TOWN_TILE_SCALE },
  L: { sprite: "tiny_roof_bottom_grey_center", scale: TINY_TOWN_TILE_SCALE },
  M: { sprite: "tiny_roof_bottom_grey_right", scale: TINY_TOWN_TILE_SCALE },
  N: { sprite: "tiny_roof_bottom_grey_dormer", scale: TINY_TOWN_TILE_SCALE },
  O: { sprite: "tiny_roof_bottom_red_left", scale: TINY_TOWN_TILE_SCALE },
  Q: { sprite: "tiny_roof_bottom_red_center", scale: TINY_TOWN_TILE_SCALE },
  R: { sprite: "tiny_roof_bottom_red_right", scale: TINY_TOWN_TILE_SCALE },
  T: { sprite: "tiny_roof_bottom_red_dormer", scale: TINY_TOWN_TILE_SCALE },
  U: { sprite: "tiny_house_brown_wall_left", scale: TINY_TOWN_TILE_SCALE },
  V: { sprite: "tiny_house_brown_wall_center", scale: TINY_TOWN_TILE_SCALE },
  W: { sprite: "tiny_house_brown_door_open", scale: TINY_TOWN_TILE_SCALE },
  Y: { sprite: "tiny_house_brown_wall_right", scale: TINY_TOWN_TILE_SCALE },
  Z: { sprite: "tiny_house_gray_wall_left", scale: TINY_TOWN_TILE_SCALE },
  0: { sprite: "tiny_house_gray_wall_center", scale: TINY_TOWN_TILE_SCALE },
  1: { sprite: "tiny_house_gray_door_open", scale: TINY_TOWN_TILE_SCALE },
  2: { sprite: "tiny_house_gray_wall_right", scale: TINY_TOWN_TILE_SCALE },
  a: { sprite: "tiny_house_brown_window", scale: TINY_TOWN_TILE_SCALE },
  e: { sprite: "tiny_house_brown_door_closed", scale: TINY_TOWN_TILE_SCALE },
  m: { sprite: "tiny_house_brown_door_closed_right", scale: TINY_TOWN_TILE_SCALE },
  w: { sprite: "tiny_house_brown_door_closed_left", scale: TINY_TOWN_TILE_SCALE },
  k: { sprite: "tiny_house_gray_window", scale: TINY_TOWN_TILE_SCALE },
  x: { sprite: "tiny_house_gray_door_closed", scale: TINY_TOWN_TILE_SCALE },
  3: { sprite: "tiny_house_gray_door_closed_right", scale: TINY_TOWN_TILE_SCALE },
  4: { sprite: "tiny_house_gray_door_closed_left", scale: TINY_TOWN_TILE_SCALE },
});

function pipeCellKey(row, col) {
  return `${row}:${col}`;
}

function isPipeChar(cell) {
  return PIPE_CHARS.has(cell);
}

function isRopeChar(cell) {
  return ROPE_CHARS.has(cell);
}

function isPipeEndpoint(cell) {
  return PIPE_ENDPOINT_CHARS.has(cell);
}

function getPipeConnections(cell) {
  return PIPE_CONNECTIONS[cell] ?? [];
}

function getRopeConnections(cell) {
  return ROPE_CONNECTIONS[cell] ?? [];
}

function getPipeOpenDirection(cell) {
  const connections = getPipeConnections(cell);
  if (connections.length !== 1) return null;
  return OPPOSITE_DIRECTION[connections[0]];
}

function isOpenPipeEntryCell(mapLines, row, col) {
  const cell = mapCharAt(mapLines, row, col);
  if (!isPipeEndpoint(cell)) return false;

  const openDirection = getPipeOpenDirection(cell);
  if (!openDirection) return false;

  const delta = DIRECTION_DELTAS[openDirection];
  const openNeighbor = mapCharAt(mapLines, row + delta.row, col + delta.col);
  return !isPipeChar(openNeighbor);
}

function getConnectedPipeNeighbors(mapLines, row, col) {
  const cell = mapCharAt(mapLines, row, col);
  if (!isPipeChar(cell)) return [];

  return getPipeConnections(cell)
    .map((direction) => {
      const delta = DIRECTION_DELTAS[direction];
      const nextRow = row + delta.row;
      const nextCol = col + delta.col;
      const nextCell = mapCharAt(mapLines, nextRow, nextCol);
      if (!isPipeChar(nextCell)) return null;
      if (!getPipeConnections(nextCell).includes(OPPOSITE_DIRECTION[direction])) {
        return null;
      }

      return {
        row: nextRow,
        col: nextCol,
        direction,
      };
    })
    .filter(Boolean);
}

function getConnectedRopeNeighbors(mapLines, row, col) {
  const cell = mapCharAt(mapLines, row, col);
  if (!isRopeChar(cell)) return [];

  return getRopeConnections(cell)
    .map((direction) => {
      const delta = DIRECTION_DELTAS[direction];
      const nextRow = row + delta.row;
      const nextCol = col + delta.col;
      const nextCell = mapCharAt(mapLines, nextRow, nextCol);
      if (!isRopeChar(nextCell)) return null;
      if (!getRopeConnections(nextCell).includes(OPPOSITE_DIRECTION[direction])) {
        return null;
      }

      return {
        row: nextRow,
        col: nextCol,
        direction,
      };
    })
    .filter(Boolean);
}

function buildPipeRoutes(mapLines) {
  const routesByEntry = new Map();

  for (let row = 0; row < mapLines.length; row++) {
    for (let col = 0; col < mapLines[row].length; col++) {
      const cell = mapLines[row][col];
      const startKey = pipeCellKey(row, col);

      if (!isPipeEndpoint(cell) || routesByEntry.has(startKey)) {
        continue;
      }

      const path = [{ row, col }];
      let previous = null;
      let current = { row, col };

      while (true) {
        const nextCandidates = getConnectedPipeNeighbors(
          mapLines,
          current.row,
          current.col,
        ).filter(
          ({ row: nextRow, col: nextCol }) =>
            !previous || nextRow !== previous.row || nextCol !== previous.col,
        );

        if (previous && isPipeEndpoint(mapCharAt(mapLines, current.row, current.col))) {
          break;
        }

        if (nextCandidates.length !== 1) {
          break;
        }

        previous = current;
        current = {
          row: nextCandidates[0].row,
          col: nextCandidates[0].col,
        };
        path.push(current);

        if (path.length > mapLines.length * mapLines[0].length) {
          break;
        }
      }

      if (path.length < 2) continue;

      const end = path[path.length - 1];
      const endCell = mapCharAt(mapLines, end.row, end.col);
      if (!isPipeEndpoint(endCell)) continue;

      const endKey = pipeCellKey(end.row, end.col);
      routesByEntry.set(startKey, path);
      routesByEntry.set(endKey, [...path].reverse());
    }
  }

  return routesByEntry;
}

function getPipeEntryTrigger(mapLines, entryKey, mapOffsetY) {
  const [row, col] = entryKey.split(":").map(Number);
  const cell = mapCharAt(mapLines, row, col);
  const openDirection = getPipeOpenDirection(cell);

  if (!openDirection) return null;

  const tileX = col * GAME_CONFIG.tile;
  const tileY = mapOffsetY + row * GAME_CONFIG.tile;
  const half = GAME_CONFIG.tile / 2;

  if (openDirection === "left") {
    return {
      x: tileX,
      y: tileY,
      width: half,
      height: GAME_CONFIG.tile,
    };
  }

  if (openDirection === "right") {
    return {
      x: tileX + half,
      y: tileY,
      width: half,
      height: GAME_CONFIG.tile,
    };
  }

  if (openDirection === "up") {
    return {
      x: tileX,
      y: tileY,
      width: GAME_CONFIG.tile,
      height: half,
    };
  }

  return {
    x: tileX,
    y: tileY + half,
    width: GAME_CONFIG.tile,
    height: half,
  };
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

function isSolidTerrainChar(cell) {
  return cell === "#" || HOUSE_TILE_CHARS.has(cell);
}

function buildTerrainColliderRects(mapLines) {
  const finalized = [];
  let active = new Map();

  for (let row = 0; row < mapLines.length; row++) {
    const line = mapLines[row];
    const runs = [];
    let col = 0;

    while (col < line.length) {
      if (!isSolidTerrainChar(line[col])) {
        col += 1;
        continue;
      }

      const start = col;
      while (col + 1 < line.length && isSolidTerrainChar(line[col + 1])) {
        col += 1;
      }
      const end = col;
      runs.push({ x0: start, x1: end });
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

function addSky(k, levelWidth) {
  const skyExtraHeight = GAME_CONFIG.tile * 12;

  k.add([
    k.pos(0, 0),
    k.sprite("kenneyBg", { frame: 0 }),
    k.scale(
      k.vec2(
        levelWidth / GAME_CONFIG.bgTile,
        (k.height() + skyExtraHeight) / GAME_CONFIG.bgTile,
      ),
    ),
    k.z(-30),
  ]);

  const cloudCopies = Math.ceil(levelWidth / (GAME_CONFIG.bgTile * 4)) + 1;

  for (let i = 0; i < cloudCopies; i++) {
    k.add([
      k.pos(i * GAME_CONFIG.bgTile * 4 - 40, 200),
      k.sprite("kenneyBg", { frame: 8 }),
      k.scale(2),
      k.opacity(0.55),
      k.z(-29),
    ]);

    k.add([
      k.pos(i * GAME_CONFIG.bgTile * 4 - 20, 255),
      k.sprite("kenneyBg", { frame: 10 }),
      k.scale(2),
      k.opacity(0.75),
      k.z(-28),
    ]);
  }
}

function addSpikeObstacle(k, x, y, count = 2) {
  for (let i = 0; i < count; i++) {
    k.add([
      k.pos(x + i * GAME_CONFIG.tile, y),
      k.sprite(getEnvironmentTileSprite("spikes")),
      k.area(),
      k.body({ isStatic: true }),
      TAGS.hazard,
      TAGS.spike,
    ]);
  }
}

function addCloudPlatform(k, x, y, widthInTiles = 3) {
  k.add([
    k.pos(x, y + GAME_CONFIG.tile / 2),
    k.rect(widthInTiles * GAME_CONFIG.tile, GAME_CONFIG.tile / 2),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
  ]);

  for (let i = 0; i < widthInTiles; i++) {
    const spriteName =
      widthInTiles === 1
        ? "cloud_white_s"
        : i === 0
          ? "cloud_white_l"
          : i === widthInTiles - 1
            ? "cloud_white_r"
            : "cloud_white_c";

    k.add([
      k.pos(x + i * GAME_CONFIG.tile, y),
      k.sprite(getEnvironmentTileSprite(spriteName)),
      k.z(1),
    ]);
  }
}

function addWoodPlatform(k, x, y, widthInTiles = 3) {
  k.add([
    k.pos(x, y + GAME_CONFIG.tile / 2),
    k.rect(widthInTiles * GAME_CONFIG.tile, GAME_CONFIG.tile / 2),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
  ]);

  for (let i = 0; i < widthInTiles; i++) {
    const spriteName = i % 2 === 0 ? "platform_wood_1" : "platform_wood_2";
    k.add([
      k.pos(x + i * GAME_CONFIG.tile, y),
      k.sprite(getEnvironmentTileSprite(spriteName)),
      k.z(1),
    ]);
  }
}

function addWaterTile(k, x, y, hasWaterAbove, isStartOfRun) {
  k.add([
    k.pos(x, y),
    k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile),
    k.area(),
    k.opacity(0),
    TAGS.hazard,
  ]);

  const spriteName = hasWaterAbove
    ? "water_center"
    : isStartOfRun
      ? "water_1"
      : "water_2";

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileSprite(spriteName)),
    k.z(0),
  ]);
}

function addDecoration(k, decoration, x, y) {
  return k.add([
    k.pos(x, y),
    k.sprite(
      getEnvironmentTileSprite(decoration.sprite),
      decoration.anim ? { anim: decoration.anim } : undefined,
    ),
    k.scale(decoration.scale ?? 2),
    k.opacity(1),
    k.z(2),
  ]);
}

function addTownfolkNpc(k, x, y) {
  const npcPosY = y + GAME_CONFIG.tile - NPC_VISUAL_HEIGHT * NPC_SCALE;

  const npc = k.add([
    k.pos(x, npcPosY),
    k.sprite("npcQueen01Light", { anim: "front" }),
    k.scale(NPC_SCALE),
    k.area(),
    k.z(3),
    TAGS.goal,
    "npc",
  ]);

  npc.play("front");
  return npc;
}

function getFillSpriteName(hasTerrainBelow, hasTerrainLeft, hasTerrainRight) {
  if (!hasTerrainLeft && !hasTerrainRight) {
    return hasTerrainBelow ? "ground_fill_2" : "ground_fill_6";
  }

  if (!hasTerrainLeft && hasTerrainRight) {
    return hasTerrainBelow ? "ground_fill_3" : "ground_fill_7";
  }

  if (hasTerrainLeft && hasTerrainRight) {
    return hasTerrainBelow ? "ground_fill_4" : "ground_fill_8";
  }

  return hasTerrainBelow ? "ground_fill_5" : "ground_fill_9";
}

function getTopSpriteName(hasTerrainBelow, hasTerrainLeft, hasTerrainRight) {
  const tiles = hasTerrainBelow
    ? TERRAIN_TOP_TILES_WITH_SUPPORT
    : TERRAIN_TOP_TILES_NO_SUPPORT;

  if (!hasTerrainLeft && !hasTerrainRight) {
    return tiles.single;
  }

  if (!hasTerrainLeft && hasTerrainRight) {
    return tiles.left;
  }

  if (hasTerrainLeft && hasTerrainRight) {
    return tiles.center;
  }

  return tiles.right;
}

function addTerrainTile(
  k,
  x,
  y,
  col,
  row,
  isTop,
  hasTerrainBelow,
  hasTerrainLeft,
  hasTerrainRight,
) {
  const spriteName = isTop
    ? getTopSpriteName(hasTerrainBelow, hasTerrainLeft, hasTerrainRight)
    : getFillSpriteName(hasTerrainBelow, hasTerrainLeft, hasTerrainRight);

  k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileSprite(spriteName)),
    k.z(-1),
  ]);
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
    if (turnCooldown > 0) return;
    if (!col) return;
    if (!enemy.isGrounded()) return;
    if (!col.isLeft() && !col.isRight()) return;

    const wasMovingRight = direction > 0;
    direction *= -1;
    enemy.vel.x = 0;
    enemy.pos.x += wasMovingRight ? -2 : 2;
    turnCooldown = 0.12;
  });

  if (!ignoreHazards) {
    enemy.onCollide(TAGS.spike, () => {
      if (turnCooldown > 0) return;
      if (!enemy.isGrounded()) return;

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

export function buildLevelTwoAndria(k, options = {}) {
  const { isDialogOpen = () => false } = options;
  const mapLines = applyHouses(normalizeAsciiMap(LEVEL_TWO_ASCII));
  const pipeRoutes = buildPipeRoutes(mapLines);
  const ropeCells = [];
  const rows = mapLines.length;
  const cols = mapLines[0].length;
  const levelWidth = cols * GAME_CONFIG.tile;
  const floorY = k.height() - GAME_CONFIG.floorHeight;
  const floorStartRow = rows - 3;
  const mapOffsetY = floorY - floorStartRow * GAME_CONFIG.tile;

  addSky(k, levelWidth);

  let playerStart = k.vec2(GAME_CONFIG.playerStart.x, GAME_CONFIG.playerStart.y);
  let npcSpawnPos = null;

  function getPipeTileCenter(row, col) {
    return k.vec2(
      col * GAME_CONFIG.tile + GAME_CONFIG.tile / 2,
      mapOffsetY + row * GAME_CONFIG.tile + GAME_CONFIG.tile / 2,
    );
  }

  function getRopeTileCenter(row, col) {
    return k.vec2(
      col * GAME_CONFIG.tile + GAME_CONFIG.tile / 2,
      mapOffsetY + row * GAME_CONFIG.tile + GAME_CONFIG.tile / 2,
    );
  }

  function getPlayerBoxSize(player) {
    const bbox = player.worldArea().bbox();
    return {
      width: bbox.width,
      height: bbox.height,
    };
  }

  function centerPlayerAt(player, point) {
    const { width, height } = getPlayerBoxSize(player);
    player.pos = k.vec2(point.x - width / 2, point.y - height / 2);
  }

  function getPipeExitPoint(player, endpoint) {
    const exitPoint = getPipeTileCenter(endpoint.row, endpoint.col);
    const previous = endpoint.previous;

    if (!previous) {
      return exitPoint;
    }

    const interiorDirection =
      previous.row < endpoint.row
        ? "up"
        : previous.row > endpoint.row
          ? "down"
          : previous.col < endpoint.col
            ? "left"
            : "right";
    const exteriorDirection = OPPOSITE_DIRECTION[interiorDirection];
    const delta = DIRECTION_DELTAS[exteriorDirection];
    const offset = GAME_CONFIG.tile * 0.85;

    return k.vec2(
      exitPoint.x + delta.col * offset,
      exitPoint.y + delta.row * offset,
    );
  }

  function getDirectionBetweenPoints(fromPoint, toPoint) {
    if (toPoint.x > fromPoint.x) return "right";
    if (toPoint.x < fromPoint.x) return "left";
    if (toPoint.y > fromPoint.y) return "down";
    return "up";
  }

  function interpolatePipePoint(points, position) {
    const maxIndex = points.length - 1;
    const clamped = k.clamp(position, 0, maxIndex);
    const lowerIndex = Math.floor(clamped);
    const upperIndex = Math.ceil(clamped);

    if (lowerIndex === upperIndex) {
      return points[lowerIndex];
    }

    const startPoint = points[lowerIndex];
    const endPoint = points[upperIndex];
    const ratio = clamped - lowerIndex;

    return k.vec2(
      startPoint.x + (endPoint.x - startPoint.x) * ratio,
      startPoint.y + (endPoint.y - startPoint.y) * ratio,
    );
  }

  function findNearbyRopeCell(player) {
    const bbox = player.worldArea().bbox();
    const bboxRight = bbox.pos.x + bbox.width;
    const bboxBottom = bbox.pos.y + bbox.height;
    const playerCenter = k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
    let nearestCell = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const cell of ropeCells) {
      const tileX = cell.col * GAME_CONFIG.tile;
      const tileY = mapOffsetY + cell.row * GAME_CONFIG.tile;
      const tileRight = tileX + GAME_CONFIG.tile;
      const tileBottom = tileY + GAME_CONFIG.tile;
      const intersects =
        bbox.pos.x < tileRight &&
        bboxRight > tileX &&
        bbox.pos.y < tileBottom &&
        bboxBottom > tileY;

      if (!intersects) continue;

      const center = getRopeTileCenter(cell.row, cell.col);
      const distance = playerCenter.dist(center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCell = cell;
      }
    }

    return nearestCell;
  }

  function setupPipeTraversal(player, traversalOptions = {}) {
    const {
      isGameOver = () => false,
      isRespawning = () => false,
      isDialogOpen: isPipeDialogOpen = () => false,
    } = traversalOptions;

    let activeTravel = null;
    const reentryCooldownUntil = new Map();

    function isPipeTraveling() {
      return activeTravel !== null;
    }

    function canEnterPipe(entryKey) {
      return (reentryCooldownUntil.get(entryKey) ?? 0) <= k.time();
    }

    function finishTravel(exitIndex) {
      if (!activeTravel) return;

      const route = activeTravel.route;
      const exitCell = route[exitIndex];
      const previousCell =
        exitIndex === 0
          ? route.length > 1
            ? route[1]
            : null
          : route[exitIndex - 1] ?? null;
      const exitPoint = getPipeExitPoint(player, {
        ...exitCell,
        previous: previousCell,
      });

      centerPlayerAt(player, exitPoint);
      player.opacity = 1;
      player.isStatic = false;
      player.vel = k.vec2(0, 0);
      player.frame = 5;

      reentryCooldownUntil.set(pipeCellKey(exitCell.row, exitCell.col), k.time() + 0.35);
      activeTravel = null;
    }

    function cancelTravel() {
      if (!activeTravel) return;
      player.opacity = 1;
      player.isStatic = false;
      player.vel = k.vec2(0, 0);
      activeTravel = null;
    }

    function startTravel(entryKey) {
      if (isGameOver() || isRespawning() || isPipeDialogOpen() || activeTravel) return;
      if (!canEnterPipe(entryKey)) return;

      const route = pipeRoutes.get(entryKey);
      if (!route || route.length < 2) return;

      const points = route.map(({ row, col }) => getPipeTileCenter(row, col));
      activeTravel = {
        route,
        points,
        position: 0,
      };

      player.stop();
      player.vel = k.vec2(0, 0);
      player.isStatic = true;
      player.opacity = 0;
      centerPlayerAt(player, points[0]);
    }

    player.onCollide("pipeEntry", (entry) => {
      if (!entry?.pipeEntryKey) return;
      startTravel(entry.pipeEntryKey);
    });

    player.onUpdate(() => {
      if (!activeTravel) return;

      if (isGameOver() || isRespawning() || isPipeDialogOpen()) {
        cancelTravel();
        return;
      }

      const pressedDirections = new Set();
      if (k.isKeyDown("left") || k.isKeyDown("a")) pressedDirections.add("left");
      if (k.isKeyDown("right") || k.isKeyDown("d")) pressedDirections.add("right");
      if (k.isKeyDown("up") || k.isKeyDown("w")) pressedDirections.add("up");
      if (k.isKeyDown("down") || k.isKeyDown("s")) pressedDirections.add("down");

      const maxPosition = activeTravel.points.length - 1;
      const epsilon = 0.0001;
      const isAtStart = activeTravel.position <= epsilon;
      const isAtEnd = activeTravel.position >= maxPosition - epsilon;
      const roundedPosition = Math.round(activeTravel.position);
      const isOnNode = Math.abs(activeTravel.position - roundedPosition) <= epsilon;

      const startOpenDirection = getPipeOpenDirection(
        mapCharAt(mapLines, activeTravel.route[0].row, activeTravel.route[0].col),
      );
      const endOpenDirection = getPipeOpenDirection(
        mapCharAt(
          mapLines,
          activeTravel.route[maxPosition].row,
          activeTravel.route[maxPosition].col,
        ),
      );

      if (isAtStart && startOpenDirection && pressedDirections.has(startOpenDirection)) {
        finishTravel(0);
        return;
      }

      if (isAtEnd && endOpenDirection && pressedDirections.has(endOpenDirection)) {
        finishTravel(maxPosition);
        return;
      }

      let forwardDirection = null;
      let backwardDirection = null;

      if (isOnNode) {
        if (roundedPosition < maxPosition) {
          forwardDirection = getDirectionBetweenPoints(
            activeTravel.points[roundedPosition],
            activeTravel.points[roundedPosition + 1],
          );
        }

        if (roundedPosition > 0) {
          backwardDirection = getDirectionBetweenPoints(
            activeTravel.points[roundedPosition],
            activeTravel.points[roundedPosition - 1],
          );
        }
      } else {
        const lowerIndex = Math.floor(activeTravel.position);
        forwardDirection = getDirectionBetweenPoints(
          activeTravel.points[lowerIndex],
          activeTravel.points[lowerIndex + 1],
        );
        backwardDirection = OPPOSITE_DIRECTION[forwardDirection];
      }

      let travelDelta = 0;
      if (forwardDirection && pressedDirections.has(forwardDirection)) {
        travelDelta = 1;
      } else if (backwardDirection && pressedDirections.has(backwardDirection)) {
        travelDelta = -1;
      }

      if (travelDelta !== 0) {
        activeTravel.position = k.clamp(
          activeTravel.position +
            (travelDelta * PIPE_TRAVEL_SPEED * k.dt()) / GAME_CONFIG.tile,
          0,
          maxPosition,
        );
      }

      centerPlayerAt(player, interpolatePipePoint(activeTravel.points, activeTravel.position));
    });

    return {
      isPipeTraveling,
      cancelTravel,
    };
  }

  function setupRopeTraversal(player, traversalOptions = {}) {
    const {
      isGameOver = () => false,
      isRespawning = () => false,
      isDialogOpen: isRopeDialogOpen = () => false,
      isPipeTraveling = () => false,
    } = traversalOptions;

    let activeHang = null;

    function isRopeHanging() {
      return activeHang !== null;
    }

    function setPlayerOnRope(point) {
      centerPlayerAt(player, point);
      player.opacity = 1;
      player.stop();
      player.vel = k.vec2(0, 0);
      player.flipX = false;
      player.frame = PLAYER_BACK_FRAME;
    }

    function getHangPoint() {
      if (!activeHang) return null;

      const currentPoint = getRopeTileCenter(activeHang.row, activeHang.col);
      if (!activeHang.target) {
        return currentPoint;
      }

      const targetPoint = getRopeTileCenter(activeHang.target.row, activeHang.target.col);
      return k.vec2(
        currentPoint.x + (targetPoint.x - currentPoint.x) * activeHang.progress,
        currentPoint.y + (targetPoint.y - currentPoint.y) * activeHang.progress,
      );
    }

    function releaseHang(jumpAway = false, jumpDirection = null) {
      if (!activeHang) return;

      const currentPoint = getHangPoint();
      if (currentPoint) {
        centerPlayerAt(player, currentPoint);
      }

      player.isStatic = false;
      player.opacity = 1;
      player.vel = jumpAway
        ? k.vec2(
            jumpDirection === "left"
              ? -GAME_CONFIG.playerSpeed * 0.95
              : jumpDirection === "right"
                ? GAME_CONFIG.playerSpeed * 0.95
                : 0,
            -GAME_CONFIG.jumpForce * 0.82,
          )
        : k.vec2(0, 0);
      activeHang = null;
    }

    function startHang(cell) {
      if (!cell || activeHang) return;
      if (isGameOver() || isRespawning() || isRopeDialogOpen() || isPipeTraveling()) return;

      activeHang = {
        row: cell.row,
        col: cell.col,
        target: null,
        progress: 0,
      };

      player.isStatic = true;
      setPlayerOnRope(getRopeTileCenter(cell.row, cell.col));
    }

    ["space"].forEach((key) => {
      k.onKeyPress(key, () => {
        if (!isRopeHanging()) return;
        if (isGameOver() || isRespawning() || isRopeDialogOpen()) return;
        releaseHang(true);
      });
    });

    player.onUpdate(() => {
      if (isGameOver() || isRespawning() || isRopeDialogOpen()) {
        releaseHang(false);
        return;
      }

      const pressedDirections = [];
      if (k.isKeyDown("up") || k.isKeyDown("w")) pressedDirections.push("up");
      if (k.isKeyDown("down") || k.isKeyDown("s")) pressedDirections.push("down");
      if (k.isKeyDown("left") || k.isKeyDown("a")) pressedDirections.push("left");
      if (k.isKeyDown("right") || k.isKeyDown("d")) pressedDirections.push("right");

      if (!activeHang) {
        if (pressedDirections.length === 0) return;
        if (isPipeTraveling()) return;

        const nearbyCell = findNearbyRopeCell(player);
        if (!nearbyCell) return;

        const neighbors = getConnectedRopeNeighbors(mapLines, nearbyCell.row, nearbyCell.col);
        if (
          neighbors.length === 0 ||
          !neighbors.some(({ direction }) => pressedDirections.includes(direction))
        ) {
          return;
        }

        startHang(nearbyCell);
      }

      if (!activeHang) return;

      if (activeHang.target) {
        activeHang.progress = Math.min(
          1,
          activeHang.progress + (ROPE_TRAVEL_SPEED * k.dt()) / GAME_CONFIG.tile,
        );

        if (activeHang.progress >= 1) {
          activeHang.row = activeHang.target.row;
          activeHang.col = activeHang.target.col;
          activeHang.target = null;
          activeHang.progress = 0;
        }
      } else if (pressedDirections.length > 0) {
        const neighbors = getConnectedRopeNeighbors(mapLines, activeHang.row, activeHang.col);
        const availableDirections = new Set(
          neighbors.map((neighbor) => neighbor.direction),
        );
        const isVerticalRope =
          availableDirections.has("up") || availableDirections.has("down");
        const jumpDirection = pressedDirections.find(
          (direction) => direction === "left" || direction === "right",
        );

        if (
          jumpDirection &&
          isVerticalRope &&
          !availableDirections.has(jumpDirection)
        ) {
          releaseHang(true, jumpDirection);
          return;
        }

        const nextNode = pressedDirections
          .map((direction) =>
            neighbors.find((neighbor) => neighbor.direction === direction) ?? null,
          )
          .find(Boolean);

        if (nextNode) {
          activeHang.target = {
            row: nextNode.row,
            col: nextNode.col,
          };
          activeHang.progress = 0;
        }
      }

      const point = getHangPoint();
      if (point) {
        player.isStatic = true;
        setPlayerOnRope(point);
      }
    });

    return {
      isRopeHanging,
      cancelHang: () => releaseHang(false),
    };
  }

  function cellAtWorld(worldX, worldY) {
    const col = Math.floor(worldX / GAME_CONFIG.tile);
    const row = Math.floor((worldY - mapOffsetY) / GAME_CONFIG.tile);
    return mapCharAt(mapLines, row, col);
  }

  function hasGroundAtWorld(worldX, worldY) {
    const cell = cellAtWorld(worldX, worldY);
    return isSolidTerrainChar(cell) || cell === "~" || cell === "=";
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
    const wallAhead = wallCell === "#";
    return noGroundAhead || wallAhead;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      if (isRopeChar(cell)) {
        ropeCells.push({ row, col });
      }

      if (cell === "#") {
        const tileAbove = mapCharAt(mapLines, row - 1, col);
        const isTop = tileAbove !== "#" && tileAbove !== "@";
        const hasTerrainBelow = mapCharAt(mapLines, row + 1, col) === "#";
        const hasTerrainLeft = mapCharAt(mapLines, row, col - 1) === "#";
        const hasTerrainRight = mapCharAt(mapLines, row, col + 1) === "#";
        addTerrainTile(
          k,
          x,
          y,
          col,
          row,
          isTop,
          hasTerrainBelow,
          hasTerrainLeft,
          hasTerrainRight,
        );
      } else if (cell === "^") {
        addSpikeObstacle(k, x, y, 1);
      } else if (cell === "~") {
        const isStartOfRun = mapCharAt(mapLines, row, col - 1) !== "~";
        if (isStartOfRun) {
          let runLength = 1;
          while (mapCharAt(mapLines, row, col + runLength) === "~") {
            runLength += 1;
          }
          addCloudPlatform(k, x, y, runLength);
        }
      } else if (cell === "=") {
        const isStartOfRun = mapCharAt(mapLines, row, col - 1) !== "=";
        if (isStartOfRun) {
          let runLength = 1;
          while (mapCharAt(mapLines, row, col + runLength) === "=") {
            runLength += 1;
          }
          addWoodPlatform(k, x, y, runLength);
        }
      } else if (cell === "@") {
        const hasWaterAbove = mapCharAt(mapLines, row - 1, col) === "@";
        const isStartOfRun = mapCharAt(mapLines, row, col - 1) !== "@";
        addWaterTile(k, x, y, hasWaterAbove, isStartOfRun);
      } else if (cell === "P") {
        playerStart = k.vec2(x, y - GAME_CONFIG.tile);
      } else if (cell === "S") {
        npcSpawnPos = k.vec2(x, y);
      } else if (cell === "s") {
        const decoration = DECORATION_BY_CHAR[cell];
        addDecoration(k, decoration, x, y);
        k.add([
          k.pos(x, y - GAME_CONFIG.tile),
          k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
          k.area(),
          k.opacity(0),
          TAGS.dialogTrigger,
        ]);
      } else if (DECORATION_BY_CHAR[cell]) {
        const decoration = DECORATION_BY_CHAR[cell];
        const decorationRef = addDecoration(k, decoration, x, y);

        if (cell === "*") {
          k.add([
            k.pos(x, y - GAME_CONFIG.tile),
            k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
            k.area(),
            k.opacity(0),
            TAGS.checkpoint,
            {
              checkpointId: `level2-flag-${col}-${row}`,
              respawnPos: k.vec2(x, y - GAME_CONFIG.tile),
              flagRef: decorationRef,
            },
          ]);
        }
      }
    }
  }

  const terrainColliderRects = buildTerrainColliderRects(mapLines);
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

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      const enemyConfig = ENEMY_BY_CHAR[cell];
      if (enemyConfig) {
        addPatrolEnemy(
          k,
          x,
          y - GAME_CONFIG.tile * 2,
          enemyConfig.patrolWidth,
          enemyConfig.speed,
          enemyConfig.enemyName,
          enemyConfig.animationSpeed,
          shouldEnemyTurn,
          enemyConfig.ignoreHazards,
          isDialogOpen,
          enemyConfig.randomJump,
        );
      }
    }
  }

  if (npcSpawnPos) {
    addTownfolkNpc(k, npcSpawnPos.x, npcSpawnPos.y);
  } else {
    addTownfolkNpc(k, playerStart.x + GAME_CONFIG.tile * 4, playerStart.y);
  }

  for (const entryKey of pipeRoutes.keys()) {
    if (!isOpenPipeEntryCell(mapLines, ...entryKey.split(":").map(Number))) {
      continue;
    }

    const trigger = getPipeEntryTrigger(mapLines, entryKey, mapOffsetY);
    if (!trigger) continue;

    k.add([
      k.pos(trigger.x, trigger.y),
      k.rect(trigger.width, trigger.height),
      k.area(),
      k.opacity(0),
      "pipeEntry",
      { pipeEntryKey: entryKey },
    ]);
  }

  return {
    levelWidth,
    playerStart,
    setupPipeTraversal,
    setupRopeTraversal,
  };
}
