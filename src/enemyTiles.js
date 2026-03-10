const ENEMY_TILE_ROOT = "sprites/kenney_pixel-platformer/Tiles/Characters";

function tilePath(index) {
  return `${ENEMY_TILE_ROOT}/tile_${String(index).padStart(4, "0")}.png`;
}

function spriteId(enemyName, frameIndex) {
  return `enemy_${enemyName.replace(/[^a-zA-Z0-9_]/g, "_")}_${frameIndex}`;
}

export const ENEMY_ANIMATIONS = Object.freeze({
  alien_1: [0, 1],
  alien_2: [2, 3],
  alien_3: [4, 5],
  alien_4: [6, 7],
  bomb: [8],
  "alien-5": [9, 10],
  gold_block: [11, 12],
  scrissors: [13, 14],
  spike: [15, 16, 17],
  robot_s: [18, 19, 20],
  robot: [21, 22, 23],
  fly: [24, 25, 26],
});

export const ENEMY_SPRITES = Object.freeze(
  Object.fromEntries(
    Object.entries(ENEMY_ANIMATIONS).map(([enemyName, tiles]) => [
      enemyName,
      tiles.map((tileIndex, frameIndex) => ({
        sprite: spriteId(enemyName, frameIndex),
        path: tilePath(tileIndex),
      })),
    ]),
  ),
);

export function loadEnemyTileAssets(k) {
  Object.values(ENEMY_SPRITES)
    .flat()
    .forEach(({ sprite, path }) => {
      k.loadSprite(sprite, path);
    });
}

export function getEnemySpriteFrames(enemyName) {
  const frames = ENEMY_SPRITES[enemyName];
  if (!frames) {
    throw new Error(`Enemy "${enemyName}" non definito in ENEMY_ANIMATIONS.`);
  }
  return frames.map(({ sprite }) => sprite);
}
