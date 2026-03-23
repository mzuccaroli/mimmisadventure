import { GAME_CONFIG, TAGS } from "../../tiles.js";
import { getEnemySpriteFrames } from "../../enemyTiles.js";
import { getEnvironmentTileSprite } from "../../environmentTiles.js";
import { getEnvironmentTileFarmSprite } from "../../environmentTiles_farm.js";
import {
  HOUSES_BROWN_RED_ROOF_BY_SIZE,
  HOUSES_BY_SIZE,
  HOUSES_GRAY_GREY_ROOF_BY_SIZE,
  applyHouses,
  findHousePlacements,
} from "../shared/houses.js";
import { isTreeTerrainCell, renderAsciiTreeCell } from "../shared/trees.js";

const TERRAIN_TAG = "terrain";
const NPC_VISUAL_HEIGHT = 23;
const NPC_SCALE = 2;
const TINY_TOWN_TILE_SCALE = GAME_CONFIG.tile / 16;
const ENEMY_BY_CHAR = Object.freeze({
  E: {
    patrolWidth: GAME_CONFIG.tile * 7,
    speed: 95,
    enemyName: "alien_1",
    animationSpeed: 8,
  },
  "^": {
    patrolWidth: GAME_CONFIG.tile * 6,
    speed: 72,
    enemyName: "fly",
    animationSpeed: 10,
    isFlying: true,
    patrolAxis: "horizontal",
    bobAmplitude: 0,
    bobSpeed: 0,
  },
  "|": {
    patrolWidth: GAME_CONFIG.tile * 5,
    speed: 66,
    enemyName: "fly",
    animationSpeed: 10,
    isFlying: true,
    patrolAxis: "vertical",
    bobAmplitude: 0,
    bobSpeed: 0,
  },
  9: {
    patrolWidth: GAME_CONFIG.tile * 9,
    speed: 78,
    enemyName: "alien_4",
    animationSpeed: 7,
    randomJump: {
      minInterval: 0.9,
      maxInterval: 2.1,
      chance: 0.65,
      jumpForce: GAME_CONFIG.jumpForce * 0.78,
    },
  },
});

const LEVEL_THREE_ASCII = [
  "               ^                         qwe                                ^                          QWT                                                                                  qwe              ^           |          ",
  "                                         adf^                               u                          ADF              ^                                                                   adf                             U       ",
  "   P         qwe u                  qwe  cjh                                i        QWT               ZJC        qwe U                      QWT                                            cjh                             I       ",
  "             adf i      E           adf   k                U                o        ADF                1   E     adf I                      ADF                            u                k              U               O       ",
  "             cjh o      @@@@        cjh   n                I     |          n        ZJC                1   %%%%% cjh O                      ZJC            &&&&            i                n      %%%%%   I               6       ",
  "              k  n      @@@@         k xmmbMMR             O                rMMR      1               xm4MR %%%%%  k  6                       1     E       &&&&            o                n      %%%%%   O            LMM8       ",
  "              n  n      @@@@      xmmbMMR n                6                n         1 ########        2   %%%%%  n  7                       1  ########   &&&&            rMMR             n      %%%%%   6  9            7       ",
  "              n  n      @@@@         n    n         E      7                n       xm4MR   E           2   %%%%%  n  7                     xm4MR           &&&&           #n###E##          n      %%%%%   7#######        7  S    ",
  "              n  n   #####################n    9           7        *     E n         2                 2   ###### n                 E  ######2#################   9  ########7##########################   ########  E   9 7       ",
  "####################################################################################################################################################################################################################################",
  "####################################################################################################################################################################################################################################",
  "####################################################################################################################################################################################################################################",
  "####################################################################################################################################################################################################################################",
];

const HOUSE_PLACEHOLDER_CONFIG = Object.freeze({
  "@": HOUSES_BY_SIZE,
  "%": HOUSES_GRAY_GREY_ROOF_BY_SIZE,
  "&": HOUSES_BROWN_RED_ROOF_BY_SIZE,
});

const HOUSE_TILE_SPRITE_BY_CHAR = Object.freeze({
  A: "tiny_roof_top_grey_left",
  B: "tiny_roof_top_grey_center",
  C: "tiny_roof_top_grey_right",
  F: "tiny_roof_top_grey_chimney",
  G: "tiny_roof_top_red_left",
  H: "tiny_roof_top_red_center",
  I: "tiny_roof_top_red_right",
  J: "tiny_roof_top_red_chimney",
  K: "tiny_roof_bottom_grey_left",
  L: "tiny_roof_bottom_grey_center",
  M: "tiny_roof_bottom_grey_right",
  N: "tiny_roof_bottom_grey_dormer",
  O: "tiny_roof_bottom_red_left",
  Q: "tiny_roof_bottom_red_center",
  R: "tiny_roof_bottom_red_right",
  T: "tiny_roof_bottom_red_dormer",
  U: "tiny_house_brown_wall_left",
  V: "tiny_house_brown_wall_center",
  W: "tiny_house_brown_door_open",
  Y: "tiny_house_brown_wall_right",
  Z: "tiny_house_gray_wall_left",
  0: "tiny_house_gray_wall_center",
  1: "tiny_house_gray_door_open",
  2: "tiny_house_gray_wall_right",
  a: "tiny_house_brown_window",
  e: "tiny_house_brown_door_closed",
  m: "tiny_house_brown_door_closed_right",
  w: "tiny_house_brown_door_closed_left",
  k: "tiny_house_gray_window",
  x: "tiny_house_gray_door_closed",
  3: "tiny_house_gray_door_closed_right",
  4: "tiny_house_gray_door_closed_left",
});

const TERRAIN_NO_SUPPORT_TILES = {
  single: "soil_single",
  left: "soil_single_left",
  center: "soil_single_center",
  right: "soil_single_right",
};

const TERRAIN_TOP_TILES = {
  single: "soil_top_multi_single",
  left: "soil_top_left",
  center: "soil_top_center",
  right: "soil_top_right",
};

const TERRAIN_CENTER_TILES = {
  single: "soil_center_single",
  left: "soil_center_left",
  center: "soil_center_center",
  right: "soil_center_right",
};

const DECORATION_BY_CHAR = Object.freeze({
  s: { sprite: "farm_sign_post", z: 2, source: "farm" },
  "*": { sprite: "flag", z: 2, source: "env", anim: "wave" },
});

const BACKGROUND_HILL_SPECS = Object.freeze([
  [0, 9, 4, 2, -1],
  [5, 8, 7, 3, -3],
  [13, 7, 5, 4, -3],
  [18, 8, 5, 2, -1],
  [24, 9, 6, 2, -2],
  [31, 9, 5, 1, -1],
  [37, 8, 8, 3, -3],
  [46, 7, 6, 4, -3],
  [55, 8, 7, 2, -3],
  [62, 7, 8, 4, -3],
  [74, 9, 6, 2, -2],
  [82, 8, 8, 3, -3],
  [93, 7, 6, 4, -3],
  [104, 9, 5, 2, -2],
  [112, 8, 7, 3, -3],
  [124, 7, 8, 4, -3],
  [136, 9, 5, 2, -2],
  [144, 8, 9, 3, -3],
  [157, 7, 7, 4, -3],
  [168, 9, 5, 2, -2],
  [176, 8, 8, 3, -3],
  [188, 7, 9, 4, -3],
  [201, 9, 6, 2, -2],
  [210, 8, 7, 3, -3],
]);

const GREENHOUSE_SCENERY = Object.freeze([
  { col: 37, kind: "open" },
  { col: 55, kind: "closed" },
  { col: 82, kind: "open" },
  { col: 112, kind: "closed" },
  { col: 176, kind: "open" },
  { col: 210, kind: "closed" },
]);

const GROUND_PROP_SPECS = Object.freeze([
  { col: 1, sprite: "pumpkin" },
  { col: 3, sprite: "pumpkin_carved" },
  { col: 7, sprite: "sunflower" },
  { col: 17, sprite: "sprout_small" },
  { col: 19, sprite: "sprout_leafy" },
  { col: 22, sprite: "crop_stump" },
  { col: 24, sprite: "hay_bale_single" },
  { col: 25, sprite: "hay_bale_single" },
  { col: 28, sprite: "crop_leaf_small" },
  { col: 30, sprite: "crop_leaf_tall" },
  { col: 34, sprite: "crop_carrot" },
  { col: 36, sprite: "crop_tomatoes" },
  { col: 44, sprite: "crop_corn" },
  { col: 45, sprite: "crop_leaf_small" },
  { col: 46, sprite: "shovel" },
  { col: 53, sprite: "crop_wheat_tall" },
  { col: 55, sprite: "crop_vine" },
  { col: 63, sprite: "crop_dry_large" },
  { col: 65, sprite: "crop_corn_tall" },
  { col: 67, sprite: "pumpkin" },
  { col: 96, sprite: "crop_leaf_small" },
  { col: 98, sprite: "crop_leaf_tall" },
  { col: 101, sprite: "crop_carrot" },
  { col: 103, sprite: "crop_tomatoes" },
  { col: 117, sprite: "pumpkin" },
  { col: 120, sprite: "crop_wheat_tall" },
  { col: 122, sprite: "crop_vine" },
  { col: 148, sprite: "crop_leaf_small" },
  { col: 150, sprite: "crop_corn" },
  { col: 153, sprite: "shovel" },
  { col: 176, sprite: "pumpkin_carved" },
  { col: 179, sprite: "crop_dry_large" },
  { col: 182, sprite: "crop_corn_tall" },
  { col: 205, sprite: "crop_leaf_small" },
  { col: 208, sprite: "crop_tomatoes" },
  { col: 211, sprite: "pumpkin" },
]);

const WIDE_PROP_SPECS = Object.freeze([
  { col: 26, kind: "hay_bale_wide" },
  { col: 132, kind: "hay_bale_wide" },
  { col: 186, kind: "hay_bale_wide" },
]);

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
    for (let row = 0; row < placement.template.length; row++) {
      for (let col = 0; col < placement.template[row].length; col++) {
        cells.add(buildCellKey(placement.row + row, placement.col + col));
      }
    }
  }

  return cells;
}

function buildTerrainColliderRects(mapLines, houseCells) {
  const finalized = [];
  let active = new Map();

  for (let row = 0; row < mapLines.length; row++) {
    const line = mapLines[row];
    const runs = [];
    let col = 0;

    while (col < line.length) {
      if (line[col] !== "#" && !houseCells.has(buildCellKey(row, col))) {
        col += 1;
        continue;
      }

      const start = col;
      while (
        col + 1 < line.length &&
        (line[col + 1] === "#" || houseCells.has(buildCellKey(row, col + 1)))
      ) {
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

function addFarmBackdrop(k, levelWidth) {
  const sceneHeight = k.height() + GAME_CONFIG.tile * 10;

  k.add([
    k.pos(0, 0),
    k.rect(levelWidth, sceneHeight),
    k.color(236, 181, 120),
    k.z(-40),
  ]);

  k.add([
    k.pos(0, 190),
    k.rect(levelWidth, 110),
    k.color(252, 224, 190),
    k.z(-39),
  ]);

  k.add([
    k.pos(0, 265),
    k.rect(levelWidth, 150),
    k.color(219, 179, 163),
    k.z(-38),
  ]);

  k.add([
    k.pos(GAME_CONFIG.tile * 4, 282),
    k.rect(GAME_CONFIG.tile * 12, GAME_CONFIG.tile * 3),
    k.color(205, 164, 148),
    k.z(-37),
  ]);

  k.add([
    k.pos(GAME_CONFIG.tile * 24, 260),
    k.rect(GAME_CONFIG.tile * 14, GAME_CONFIG.tile * 4),
    k.color(205, 164, 148),
    k.z(-37),
  ]);

  k.add([
    k.pos(GAME_CONFIG.tile * 49, 275),
    k.rect(GAME_CONFIG.tile * 11, GAME_CONFIG.tile * 3),
    k.color(205, 164, 148),
    k.z(-37),
  ]);

  k.add([
    k.pos(0, k.height() - 16),
    k.rect(levelWidth, 16),
    k.color(90, 205, 235),
    k.z(-37),
  ]);
}

function addFarmSprite(k, spriteName, x, y, z = 1) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileFarmSprite(spriteName)),
    k.z(z),
  ]);
}

function addGroundDecoration(k, spriteName, x, surfaceY, z = 2) {
  return addFarmSprite(k, spriteName, x, surfaceY - GAME_CONFIG.tile, z);
}

function addHayBaleWide(k, x, surfaceY, z = 2) {
  addGroundDecoration(k, "hay_bale_left", x, surfaceY, z);
  addGroundDecoration(k, "hay_bale_right", x + GAME_CONFIG.tile, surfaceY, z);
}

function addGreenhouseBlock(k, x, groundY, rows, z = 0.25) {
  const topY = groundY - rows.length * GAME_CONFIG.tile;

  rows.forEach((rowSprites, rowIndex) => {
    rowSprites.forEach((spriteName, colIndex) => {
      addFarmSprite(
        k,
        spriteName,
        x + colIndex * GAME_CONFIG.tile,
        topY + rowIndex * GAME_CONFIG.tile,
        z,
      );
    });
  });
}

function addGreenhouseOpen(k, x, groundY) {
  addGreenhouseBlock(
    k,
    x,
    groundY,
    [
      [
        "greenhouse_open_top_left",
        "greenhouse_open_top_center_left",
        "greenhouse_open_top_center_right",
        "greenhouse_open_top_right",
      ],
      [
        "greenhouse_open_mid_left",
        "greenhouse_open_mid_center_left",
        "greenhouse_open_mid_center_right",
        "greenhouse_open_mid_right",
      ],
      [
        "greenhouse_open_bottom_left",
        "greenhouse_open_bottom_center_left",
        "greenhouse_open_bottom_center_right",
        "greenhouse_open_bottom_right",
      ],
    ],
  );
}

function addGreenhouseClosed(k, x, groundY) {
  addGreenhouseBlock(
    k,
    x,
    groundY,
    [
      [
        "greenhouse_closed_top_left",
        "greenhouse_closed_top_center_left",
        "greenhouse_closed_top_center_right",
        "greenhouse_closed_top_right",
      ],
      [
        "greenhouse_closed_mid_left",
        "greenhouse_closed_mid_center_left",
        "greenhouse_closed_mid_center_right",
        "greenhouse_closed_mid_right",
      ],
      [
        "greenhouse_closed_bottom_left",
        "greenhouse_closed_bottom_center_left",
        "greenhouse_closed_bottom_center_right",
        "greenhouse_closed_bottom_right",
      ],
    ],
  );
}

function addDecorativeSoilPatch(k, startCol, topRow, width, height, mapOffsetY, z = -1) {
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const hasTileLeft = col > 0;
      const hasTileRight = col < width - 1;
      const spriteName =
        row === 0
          ? !hasTileLeft && hasTileRight
            ? "soil_hill_left"
            : hasTileLeft && !hasTileRight
              ? "soil_hill_right"
              : height === 1
                ? getTerrainRowSpriteName(
                    TERRAIN_NO_SUPPORT_TILES,
                    hasTileLeft,
                    hasTileRight,
                  )
                : getTerrainRowSpriteName(
                    TERRAIN_TOP_TILES,
                    hasTileLeft,
                    hasTileRight,
                  )
          : row < height - 1
            ? getTerrainRowSpriteName(
                TERRAIN_CENTER_TILES,
                hasTileLeft,
                hasTileRight,
              )
            : getTerrainRowSpriteName(
                TERRAIN_NO_SUPPORT_TILES,
                hasTileLeft,
                hasTileRight,
              );

      addFarmSprite(
        k,
        spriteName,
        (startCol + col) * GAME_CONFIG.tile,
        mapOffsetY + (topRow + row) * GAME_CONFIG.tile,
        z,
      );
    }
  }
}

function getTopPlayableSoilRow(mapLines, col) {
  for (let row = 0; row < mapLines.length; row++) {
    if (mapCharAt(mapLines, row, col) === "#") {
      return row;
    }
  }

  return null;
}

function getTopBackgroundSoilRow(col) {
  let topRow = null;

  for (const [startCol, patchTopRow, width] of BACKGROUND_HILL_SPECS) {
    if (col < startCol || col >= startCol + width) continue;
    topRow = topRow === null ? patchTopRow : Math.min(topRow, patchTopRow);
  }

  return topRow;
}

function getTopSoilRow(mapLines, col) {
  const playableTopRow = getTopPlayableSoilRow(mapLines, col);
  const backgroundTopRow = getTopBackgroundSoilRow(col);

  if (playableTopRow === null) return backgroundTopRow;
  if (backgroundTopRow === null) return playableTopRow;
  return Math.min(playableTopRow, backgroundTopRow);
}

function getFlatSupportRow(mapLines, startCol, widthInTiles) {
  let supportRow = null;

  for (let offset = 0; offset < widthInTiles; offset++) {
    const topRow = getTopSoilRow(mapLines, startCol + offset);
    if (topRow === null) return null;
    if (supportRow === null) {
      supportRow = topRow;
      continue;
    }
    if (supportRow !== topRow) return null;
  }

  return supportRow;
}

function findNearestFlatSupport(mapLines, startCol, widthInTiles, maxShift = 8) {
  const maxStartCol = mapLines[0].length - widthInTiles;

  for (let delta = 0; delta <= maxShift; delta++) {
    const candidates =
      delta === 0 ? [startCol] : [startCol - delta, startCol + delta];

    for (const candidate of candidates) {
      if (candidate < 0 || candidate > maxStartCol) continue;
      const supportRow = getFlatSupportRow(mapLines, candidate, widthInTiles);
      if (supportRow !== null) {
        return { col: candidate, row: supportRow };
      }
    }
  }

  return null;
}

function getSupportSurfaceY(mapOffsetY, supportRow) {
  return mapOffsetY + supportRow * GAME_CONFIG.tile;
}

function addGroundedFarmDecoration(
  k,
  mapLines,
  mapOffsetY,
  startCol,
  spriteName,
  { widthInTiles = 1, z = 2, maxShift = 4 } = {},
) {
  const support = findNearestFlatSupport(mapLines, startCol, widthInTiles, maxShift);
  if (!support) return null;

  addGroundDecoration(
    k,
    spriteName,
    support.col * GAME_CONFIG.tile,
    getSupportSurfaceY(mapOffsetY, support.row),
    z,
  );

  return support;
}

function addFarmScenery(k, mapLines, mapOffsetY) {
  const tile = GAME_CONFIG.tile;
  BACKGROUND_HILL_SPECS.forEach(([startCol, topRow, width, height, z]) => {
    addDecorativeSoilPatch(k, startCol, topRow, width, height, mapOffsetY, z);
  });

  GREENHOUSE_SCENERY.forEach(({ col, kind }) => {
    const support = findNearestFlatSupport(mapLines, col, 4, 10);
    if (!support) return;

    const surfaceY = getSupportSurfaceY(mapOffsetY, support.row);
    if (kind === "open") {
      addGreenhouseOpen(k, tile * support.col, surfaceY);
    } else {
      addGreenhouseClosed(k, tile * support.col, surfaceY);
    }
  });

  GROUND_PROP_SPECS.forEach(({ col, sprite }) => {
    addGroundedFarmDecoration(k, mapLines, mapOffsetY, col, sprite);
  });

  WIDE_PROP_SPECS.forEach(({ col, kind }) => {
    const support = findNearestFlatSupport(mapLines, col, 2, 6);
    if (!support) return;

    const surfaceY = getSupportSurfaceY(mapOffsetY, support.row);
    if (kind === "hay_bale_wide") {
      addHayBaleWide(k, tile * support.col, surfaceY);
    }
  });
}

function addDecoration(k, decoration, x, y) {
  const spriteName =
    decoration.source === "env"
      ? getEnvironmentTileSprite(decoration.sprite)
      : getEnvironmentTileFarmSprite(decoration.sprite);

  return k.add([
    k.pos(x, y),
    k.sprite(
      spriteName,
      decoration.anim ? { anim: decoration.anim } : undefined,
    ),
    k.scale(1),
    k.opacity(1),
    k.z(decoration.z ?? 2),
  ]);
}

function addTownfolkNpc(k, x, y) {
  const npcPosY = y + GAME_CONFIG.tile - NPC_VISUAL_HEIGHT * NPC_SCALE;

  const npc = k.add([
    k.pos(x, npcPosY),
    k.sprite("npcMageM01Dark", { anim: "front" }),
    k.scale(NPC_SCALE),
    k.area(),
    k.z(3),
    TAGS.goal,
    "npc",
  ]);

  npc.play("front");
  return npc;
}

function getTerrainRowSpriteName(tiles, hasTerrainLeft, hasTerrainRight) {
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
  isTop,
  hasTerrainBelow,
  hasTerrainLeft,
  hasTerrainRight,
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
    k.sprite(getEnvironmentTileFarmSprite(spriteName)),
    k.z(0),
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
    k.area(),
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

  enemy.onUpdate(() => {
    if (isDialogOpen()) {
      enemy.vel = k.vec2(0, 0);
      return;
    }

    if (enemy.isStatic) {
      enemy.vel = k.vec2(0, 0);
      return;
    }

    if (enemy._resumeDirection) {
      direction = enemy._resumeDirection;
      enemy._resumeDirection = 0;
    }

    if ((enemy._stunnedUntil ?? 0) > k.time()) {
      const knockbackDir = enemy._knockbackDir ?? direction;
      enemy.flipX = knockbackDir < 0;
      enemy.vel.x = 0;

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

function addFlyingEnemy(
  k,
  x,
  y,
  patrolWidth = GAME_CONFIG.tile * 6,
  speed = 72,
  enemyName = "fly",
  animationSpeed = 10,
  isDialogOpen = () => false,
  patrolAxis = "horizontal",
  bobAmplitude = GAME_CONFIG.tile * 0.35,
  bobSpeed = 2.4,
) {
  const animationFrames = getEnemySpriteFrames(enemyName);
  const enemy = k.add([
    k.pos(x, y),
    k.sprite(animationFrames[0]),
    k.scale(1.5),
    k.area(),
    k.z(4),
    TAGS.hazard,
    "enemy",
    { isEnemyActor: true },
  ]);

  const minX = x - patrolWidth;
  const maxX = x + patrolWidth;
  const minY = y - patrolWidth;
  const maxY = y + patrolWidth;
  const baseX = x;
  const baseY = y;
  let direction = 1;
  let animationTimer = 0;
  let frameIndex = 0;

  enemy.onUpdate(() => {
    if (isDialogOpen() || enemy.isStatic) {
      return;
    }

    if (enemy._resumeDirection) {
      direction = enemy._resumeDirection;
      enemy._resumeDirection = 0;
    }

    if ((enemy._stunnedUntil ?? 0) > k.time()) {
      const knockbackDir = enemy._knockbackDir ?? direction;
      enemy.flipX = knockbackDir < 0;

      return;
    }

    const bobOffset =
      bobAmplitude > 0 && bobSpeed > 0
        ? Math.sin(k.time() * bobSpeed) * bobAmplitude
        : 0;

    if (patrolAxis === "vertical") {
      enemy.move(0, speed * direction);
      enemy.pos.x = baseX + bobOffset;
    } else {
      enemy.move(speed * direction, 0);
      enemy.pos.y = baseY + bobOffset;
    }

    if (animationFrames.length > 1) {
      animationTimer += k.dt();
      if (animationTimer >= 1 / animationSpeed) {
        animationTimer = 0;
        frameIndex = (frameIndex + 1) % animationFrames.length;
        enemy.use(k.sprite(animationFrames[frameIndex]));
      }
    }

    enemy.flipX = direction < 0;
    if (patrolAxis === "vertical") {
      if (enemy.pos.y >= maxY) {
        enemy.pos.y = maxY;
        direction = -1;
      } else if (enemy.pos.y <= minY) {
        enemy.pos.y = minY;
        direction = 1;
      }
    } else {
      if (enemy.pos.x >= maxX) {
        enemy.pos.x = maxX;
        direction = -1;
      } else if (enemy.pos.x <= minX) {
        enemy.pos.x = minX;
        direction = 1;
      }
    }
  });

  return enemy;
}

export function buildLevelThreeMontegrosso(k, options = {}) {
  const { isDialogOpen = () => false } = options;
  const baseMapLines = normalizeAsciiMap(LEVEL_THREE_ASCII);
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

  addFarmBackdrop(k, levelWidth);

  let playerStart = k.vec2(GAME_CONFIG.playerStart.x, GAME_CONFIG.playerStart.y);
  let npcSpawnPos = null;
  const enemySpawns = [];
  let exitDoorBlocker = null;

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
    return cell === "#" || isHouseAtWorld(worldX, worldY) || isTreeTerrainCell(cell);
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
    const wallAhead =
      wallCell === "#" || isHouseAtWorld(wallX, wallY) || isTreeTerrainCell(wallCell);
    return noGroundAhead || wallAhead;
  }

  function spawnEnemy(spawn) {
    if (spawn.isFlying) {
      return addFlyingEnemy(
        k,
        spawn.x,
        spawn.y,
        spawn.patrolWidth,
        spawn.speed,
        spawn.enemyName,
        spawn.animationSpeed,
        isDialogOpen,
        spawn.patrolAxis,
        spawn.bobAmplitude,
        spawn.bobSpeed,
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

  function addExitDoor(x, y) {
    k.add([
      k.pos(x, y - GAME_CONFIG.tile),
      k.sprite(getEnvironmentTileSprite("door_1")),
      k.scale(2),
      k.z(2),
    ]);

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

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      if (cell === "#") {
        const isTop = mapCharAt(mapLines, row - 1, col) !== "#";
        const hasTerrainBelow = mapCharAt(mapLines, row + 1, col) === "#";
        const hasTerrainLeft = mapCharAt(mapLines, row, col - 1) === "#";
        const hasTerrainRight = mapCharAt(mapLines, row, col + 1) === "#";
        addTerrainTile(
          k,
          x,
          y,
          isTop,
          hasTerrainBelow,
          hasTerrainLeft,
          hasTerrainRight,
        );
      } else if (isHouseCell(row, col)) {
        const spriteName = HOUSE_TILE_SPRITE_BY_CHAR[cell];
        k.add([
          k.pos(x, y),
          k.sprite(getEnvironmentTileSprite(spriteName)),
          k.scale(TINY_TOWN_TILE_SCALE),
          k.z(0.5),
        ]);
      } else if (
        renderAsciiTreeCell({ k, mapLines, row, col, mapOffsetY, terrainTag: TERRAIN_TAG })
      ) {
        // Tree tiles are rendered through the shared tree module.
      } else if (cell === "P") {
        playerStart = k.vec2(x, y - GAME_CONFIG.tile);
      } else if (cell === "S") {
        npcSpawnPos = k.vec2(x, y);
      } else if (DECORATION_BY_CHAR[cell]) {
        const decoration = DECORATION_BY_CHAR[cell];
        const decorationRef = addDecoration(k, decoration, x, y);

        if (cell === "s") {
          k.add([
            k.pos(x, y - GAME_CONFIG.tile),
            k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
            k.area(),
            k.opacity(0),
            TAGS.dialogTrigger,
          ]);
        } else if (cell === "*") {
          k.add([
            k.pos(x, y - GAME_CONFIG.tile),
            k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
            k.area(),
            k.opacity(0),
            TAGS.checkpoint,
            {
              checkpointId: `level3-flag-${col}-${row}`,
              respawnPos: k.vec2(x, y - GAME_CONFIG.tile),
              flagRef: decorationRef,
            },
          ]);
        }
      }
    }
  }

  addFarmScenery(k, mapLines, mapOffsetY);

  const terrainColliderRects = buildTerrainColliderRects(mapLines, houseCells);
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
      const enemyConfig = ENEMY_BY_CHAR[mapLines[row][col]];
      if (!enemyConfig) continue;

      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;
      if (enemyConfig.isFlying) {
        const spawn = {
          x,
          y,
          patrolWidth: enemyConfig.patrolWidth,
          speed: enemyConfig.speed,
          enemyName: enemyConfig.enemyName,
          animationSpeed: enemyConfig.animationSpeed,
          isFlying: true,
          patrolAxis: enemyConfig.patrolAxis,
          bobAmplitude: enemyConfig.bobAmplitude,
          bobSpeed: enemyConfig.bobSpeed,
        };
        enemySpawns.push(spawn);
        spawnEnemy(spawn);
      } else {
        const spawn = {
          x,
          y: y - GAME_CONFIG.tile * 2,
          patrolWidth: enemyConfig.patrolWidth,
          speed: enemyConfig.speed,
          enemyName: enemyConfig.enemyName,
          animationSpeed: enemyConfig.animationSpeed,
          randomJump: enemyConfig.randomJump,
          isFlying: false,
        };
        enemySpawns.push(spawn);
        spawnEnemy(spawn);
      }
    }
  }

  if (npcSpawnPos) {
    addTownfolkNpc(k, npcSpawnPos.x, npcSpawnPos.y);
    addExitDoor(npcSpawnPos.x + GAME_CONFIG.tile * 4, npcSpawnPos.y);
  } else {
    addTownfolkNpc(k, playerStart.x + GAME_CONFIG.tile * 4, playerStart.y);
    addExitDoor(playerStart.x + GAME_CONFIG.tile * 8, playerStart.y);
  }

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
