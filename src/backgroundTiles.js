const BACKGROUND_TILE_ROOT = "sprites/kenney_pixel-platformer/Tiles/Backgrounds";

function tilePath(index) {
  return `${BACKGROUND_TILE_ROOT}/tile_${String(index).padStart(4, "0")}.png`;
}

function spriteId(tileName) {
  return `bg_${tileName}`;
}

export const BACKGROUND_TILE_ORDER = Object.freeze({
  // Sky (0-7): 4 white, 2 brown, 2 green
  sky_white_1: 0,
  sky_white_2: 1,
  sky_white_3: 2,
  sky_white_4: 3,
  sky_brown_1: 4,
  sky_brown_2: 5,
  sky_green_1: 6,
  sky_green_2: 7,

  // Panorama (8-15): 4 white, 2 brown, 2 green
  panorama_white_1: 8,
  panorama_white_2: 9,
  panorama_white_3: 10,
  panorama_white_4: 11,
  panorama_brown_1: 12,
  panorama_brown_2: 13,
  panorama_green_1: 14,
  panorama_green_2: 15,

  // Terrain (16-23): 4 white, 2 brown, 2 green
  terrain_white_1: 16,
  terrain_white_2: 17,
  terrain_white_3: 18,
  terrain_white_4: 19,
  terrain_brown_1: 20,
  terrain_brown_2: 21,
  terrain_green_1: 22,
  terrain_green_2: 23,
});

export const BACKGROUND_TILE_SPRITES = Object.freeze(
  Object.fromEntries(
    Object.entries(BACKGROUND_TILE_ORDER).map(([tileName, tileIndex]) => [
      tileName,
      {
        sprite: spriteId(tileName),
        path: tilePath(tileIndex),
      },
    ]),
  ),
);

export function loadBackgroundTileAssets(k) {
  Object.values(BACKGROUND_TILE_SPRITES).forEach(({ sprite, path }) => {
    k.loadSprite(sprite, path);
  });
}

export function getBackgroundTileSprite(tileName) {
  const tile = BACKGROUND_TILE_SPRITES[tileName];
  if (!tile) {
    throw new Error(`Background tile "${tileName}" non definito.`);
  }
  return tile.sprite;
}
