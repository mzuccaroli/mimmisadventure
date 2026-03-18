import { GAME_CONFIG, TAGS } from "../../tiles.js";
import { getEnemySpriteFrames } from "../../enemyTiles.js";
import { getEnvironmentTileFarmSprite } from "../../environmentTiles_farm.js";
import { isTreeTerrainCell, renderAsciiTreeCell } from "../shared/trees.js";

const TERRAIN_TAG = "terrain";
const NPC_VISUAL_HEIGHT = 23;
const NPC_SCALE = 2;

const LEVEL_THREE_ASCII = [
  "                                                                          ",
  "                                                                          ",
  "             qwe               qwe     QWT            u                   ",
  "             adf        #######adf     ADF      U     i              u    ",
  "             cjh               cjh     ZJC      I     o              i    ",
  "              k                 k       1       O  xmml              o    ",
  "              n              xmmbMMR    1       6     n              rMMR ",
  "   P          n                 n     xm4MR     7     n              n    ",
  "########  ####n                 n     E 2       7     n  ##########  n  S ",
  "########  ################################################################",
  "##########################################################################",
  "##########################################################################",
  "##########################################################################",
];

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
  s: { sprite: "farm_sign_post", z: 2 },
});

function normalizeAsciiMap(lines) {
  const cols = Math.max(...lines.map((line) => line.length));
  return lines.map((line) => line.padEnd(cols, " "));
}

function mapCharAt(mapLines, row, col) {
  if (row < 0 || row >= mapLines.length) return " ";
  if (col < 0 || col >= mapLines[row].length) return " ";
  return mapLines[row][col];
}

function buildTerrainColliderRects(mapLines) {
  const finalized = [];
  let active = new Map();

  for (let row = 0; row < mapLines.length; row++) {
    const line = mapLines[row];
    const runs = [];
    let col = 0;

    while (col < line.length) {
      if (line[col] !== "#") {
        col += 1;
        continue;
      }

      const start = col;
      while (col + 1 < line.length && line[col + 1] === "#") {
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

function addGreenhouseBlock(k, x, groundY, rows, z = -2) {
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
        row === 0 && height === 1
          ? getTerrainRowSpriteName(TERRAIN_NO_SUPPORT_TILES, hasTileLeft, hasTileRight)
          : row === 0
            ? getTerrainRowSpriteName(TERRAIN_TOP_TILES, hasTileLeft, hasTileRight)
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

function addFarmScenery(k, mapOffsetY) {
  const tile = GAME_CONFIG.tile;
  const rowY = (row) => mapOffsetY + row * tile;
  const groundSurfaceY = rowY(9);
  const upperSurfaceY = rowY(8);

  addDecorativeSoilPatch(k, 0, 9, 4, 2, mapOffsetY, -1);
  addDecorativeSoilPatch(k, 18, 8, 5, 2, mapOffsetY, -1);
  addDecorativeSoilPatch(k, 31, 9, 5, 1, mapOffsetY, -1);
  addDecorativeSoilPatch(k, 50, 9, 4, 1, mapOffsetY, -1);
  addGreenhouseOpen(k, tile * 54, groundSurfaceY);
  addGreenhouseClosed(k, tile * 58, groundSurfaceY);

  addGroundDecoration(k, "pumpkin", tile * 1, upperSurfaceY);
  addGroundDecoration(k, "pumpkin_carved", tile * 3, upperSurfaceY);
  addGroundDecoration(k, "sunflower", tile * 7, upperSurfaceY);
  addGroundDecoration(k, "hay_bale_single", tile * 24, upperSurfaceY);
  addGroundDecoration(k, "hay_bale_single", tile * 24, upperSurfaceY - tile);
  addHayBaleWide(k, tile * 26, upperSurfaceY);
  addGroundDecoration(k, "sprout_small", tile * 17, upperSurfaceY);
  addGroundDecoration(k, "sprout_leafy", tile * 19, upperSurfaceY);
  addGroundDecoration(k, "crop_stump", tile * 22, upperSurfaceY);

  addGroundDecoration(k, "crop_leaf_small", tile * 28, groundSurfaceY);
  addGroundDecoration(k, "crop_leaf_tall", tile * 30, groundSurfaceY);
  addGroundDecoration(k, "crop_carrot", tile * 34, groundSurfaceY);
  addGroundDecoration(k, "crop_tomatoes", tile * 36, groundSurfaceY);
  addGroundDecoration(k, "crop_corn", tile * 44, groundSurfaceY);
  addGroundDecoration(k, "crop_leaf_small", tile * 45, groundSurfaceY);
  addGroundDecoration(k, "shovel", tile * 46, groundSurfaceY);
  addFarmSprite(k, "hanging_pot", tile * 61, groundSurfaceY - tile * 4, -1);

  addGroundDecoration(k, "crop_wheat_tall", tile * 53, groundSurfaceY);
  addGroundDecoration(k, "crop_vine", tile * 55, groundSurfaceY);
  addGroundDecoration(k, "pumpkin", tile * 67, groundSurfaceY);
  addGroundDecoration(k, "crop_dry_large", tile * 63, groundSurfaceY);
  addGroundDecoration(k, "crop_corn_tall", tile * 65, groundSurfaceY);
}

function addDecoration(k, spriteName, x, y, z = 2) {
  return addFarmSprite(k, spriteName, x, y, z);
}

function addTownfolkNpc(k, x, y) {
  const npcPosY = y + GAME_CONFIG.tile - NPC_VISUAL_HEIGHT * NPC_SCALE;

  const npc = k.add([
    k.pos(x, npcPosY),
    k.sprite("npcTownfolkOldM001", { anim: "front" }),
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
) {
  const animationFrames = getEnemySpriteFrames(enemyName);
  const enemy = k.add([
    k.pos(x, y),
    k.sprite(animationFrames[0]),
    k.scale(1.5),
    k.area(),
    k.body(),
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

    turnCooldown = Math.max(0, turnCooldown - k.dt());
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

export function buildLevelThreeMontegrosso(k, options = {}) {
  const { isDialogOpen = () => false } = options;
  const mapLines = normalizeAsciiMap(LEVEL_THREE_ASCII);
  const rows = mapLines.length;
  const cols = mapLines[0].length;
  const levelWidth = cols * GAME_CONFIG.tile;
  const floorY = k.height() - GAME_CONFIG.floorHeight;
  const floorStartRow = rows - 3;
  const mapOffsetY = floorY - floorStartRow * GAME_CONFIG.tile;

  addFarmBackdrop(k, levelWidth);

  let playerStart = k.vec2(GAME_CONFIG.playerStart.x, GAME_CONFIG.playerStart.y);
  let npcSpawnPos = null;

  function cellAtWorld(worldX, worldY) {
    const col = Math.floor(worldX / GAME_CONFIG.tile);
    const row = Math.floor((worldY - mapOffsetY) / GAME_CONFIG.tile);
    return mapCharAt(mapLines, row, col);
  }

  function hasGroundAtWorld(worldX, worldY) {
    const cell = cellAtWorld(worldX, worldY);
    return cell === "#" || isTreeTerrainCell(cell);
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
    const wallAhead = wallCell === "#" || isTreeTerrainCell(wallCell);
    return noGroundAhead || wallAhead;
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
        addDecoration(k, decoration.sprite, x, y, decoration.z);

        if (cell === "s") {
          k.add([
            k.pos(x, y - GAME_CONFIG.tile),
            k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
            k.area(),
            k.opacity(0),
            TAGS.dialogTrigger,
          ]);
        }
      }
    }
  }

  addFarmScenery(k, mapOffsetY);

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
      if (mapLines[row][col] !== "E") continue;

      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;
      addPatrolEnemy(
        k,
        x,
        y - GAME_CONFIG.tile * 2,
        GAME_CONFIG.tile * 7,
        95,
        "alien_1",
        8,
        shouldEnemyTurn,
        isDialogOpen,
      );
    }
  }

  if (npcSpawnPos) {
    addTownfolkNpc(k, npcSpawnPos.x, npcSpawnPos.y);
  } else {
    addTownfolkNpc(k, playerStart.x + GAME_CONFIG.tile * 4, playerStart.y);
  }

  return {
    levelWidth,
    playerStart,
  };
}
