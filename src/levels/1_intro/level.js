import { GAME_CONFIG, TAGS } from "../../tiles.js";
import { getEnemySpriteFrames } from "../../enemyTiles.js";
import { getEnvironmentTileSprite } from "../../environmentTiles.js";

const TERRAIN_TAG = "terrain";
const NPC_VISUAL_HEIGHT = 23;
const NPC_SCALE = 2;

const LEVEL_ONE_ASCII = [
  "                                                                                     ~~~                                 ",
  "                 #######                                                                                                 ",
  "    E            #######                                                 ~~                                              ",
  "                              ~~~                                               #####                                    ",
  "                                                                                                     ########            ",
  "                         #######                                                   ^^^^^                                 ",
  "                         #######                                                   #####                                 ",
  "      #########                                   ######                                                                 ",
  "                                                                                                                         ",
  "                           #######                                      #######                                          ",
  "        ##                         ###          ######                                                                   ",
  "   P  s ##     #        ###                     ######                                  ####        E               S   d",
  "        ##  ^^^#        #^^   ^^      ^^^    ^^ ######    E   ^^     ^^^    X  ^^   ^^^^                                 ",
  "##########################################################################################################################",
  "##########################################################################################################################",
  "##########################################################################################################################",
  "##########################################################################################################################",
  "##########################################################################################################################",
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
  ">": { sprite: "sign_arrow_r", scale: 2 },
  "<": { sprite: "sign_arrow_l", scale: 2 },
  s: { sprite: "sign_board_3", scale: 2 },
  o: { sprite: "obstacle_torch_red", scale: 2 },
  d: { sprite: "door_1", scale: 2 },
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

function addDecoration(k, spriteName, x, y, scale = 2) {
  return k.add([
    k.pos(x, y),
    k.sprite(getEnvironmentTileSprite(spriteName)),
    k.scale(scale),
    k.z(2),
  ]);
}

function addTownfolkNpc(k, x, y) {
  // Sprite frames are 24x32 but the visible character occupies ~25px in height.
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
) {
  const animationFrames = getEnemySpriteFrames(enemyName);
  const enemy = k.add([
    k.pos(x, y),
    k.sprite(animationFrames[0]),
    k.scale(1.5),
    k.area(ignoreHazards ? { collisionIgnore: [TAGS.hazard] } : undefined),
    k.body(),
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

export function buildLevelOne(k, options = {}) {
  const { isDialogOpen = () => false } = options;
  const mapLines = normalizeAsciiMap(LEVEL_ONE_ASCII);
  const rows = mapLines.length;
  const cols = mapLines[0].length;
  const levelWidth = cols * GAME_CONFIG.tile;
  const floorY = k.height() - GAME_CONFIG.floorHeight;
  const floorStartRow = rows - 3;
  const mapOffsetY = floorY - floorStartRow * GAME_CONFIG.tile;

  addSky(k, levelWidth);

  let playerStart = k.vec2(GAME_CONFIG.playerStart.x, GAME_CONFIG.playerStart.y);
  let npcSpawnPos = null;
  const enemySpawns = [];

  function cellAtWorld(worldX, worldY) {
    const col = Math.floor(worldX / GAME_CONFIG.tile);
    const row = Math.floor((worldY - mapOffsetY) / GAME_CONFIG.tile);
    return mapCharAt(mapLines, row, col);
  }

  function hasGroundAtWorld(worldX, worldY) {
    const cell = cellAtWorld(worldX, worldY);
    return cell === "#" || cell === "~";
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

  function spawnEnemy(spawn) {
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

  // First pass: terrain, spikes, clouds, spawn/goal markers and static decorations.
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
      } else if (cell === "P") {
        playerStart = k.vec2(x, y - GAME_CONFIG.tile);
      } else if (cell === "S") {
        npcSpawnPos = k.vec2(x, y);
      } else if (cell === "s") {
        const decoration = DECORATION_BY_CHAR[cell];
        addDecoration(k, decoration.sprite, x, y, decoration.scale);
        k.add([
          k.pos(x, y - GAME_CONFIG.tile),
          k.rect(GAME_CONFIG.tile, GAME_CONFIG.tile * 2),
          k.area(),
          k.opacity(0),
          TAGS.dialogTrigger,
        ]);
      } else if (DECORATION_BY_CHAR[cell]) {
        const decoration = DECORATION_BY_CHAR[cell];
        addDecoration(k, decoration.sprite, x, y, decoration.scale);
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

  // Second pass: animated/moving entities.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = mapLines[row][col];
      const x = col * GAME_CONFIG.tile;
      const y = mapOffsetY + row * GAME_CONFIG.tile;

      if (cell === "E") {
        const spawn = {
          x,
          y: y - GAME_CONFIG.tile * 2,
          patrolWidth: GAME_CONFIG.tile * 9,
          speed: 95,
          enemyName: "alien_1",
          animationSpeed: 8,
          ignoreHazards: false,
        };
        enemySpawns.push(spawn);
        spawnEnemy(spawn);
      } else if (cell === "X") {
        const spawn = {
          x,
          y: y - GAME_CONFIG.tile * 2,
          patrolWidth: GAME_CONFIG.tile * 8,
          speed: 80,
          enemyName: "spike",
          animationSpeed: 8,
          ignoreHazards: true,
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

  return {
    levelWidth,
    playerStart,
    resetEnemies,
  };
}
