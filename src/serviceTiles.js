export const SERVICE_TILES = Object.freeze({
  full_hart: {
    path: "sprites/kenney_pixel-platformer/Tiles/tile_0044.png",
    lives: 2,
  },
  half_hart: {
    path: "sprites/kenney_pixel-platformer/Tiles/tile_0045.png",
    lives: 1,
  },
  empty_hart: {
    path: "sprites/kenney_pixel-platformer/Tiles/tile_0046.png",
    lives: 0,
  },
});

export const HEART_CAPACITY = SERVICE_TILES.full_hart.lives;

export function loadServiceTiles(k) {
  Object.entries(SERVICE_TILES).forEach(([name, tile]) => {
    k.loadSprite(name, tile.path);
  });
}

export function getHeartSpriteByLives(livesInHeart) {
  if (livesInHeart >= SERVICE_TILES.full_hart.lives) return "full_hart";
  if (livesInHeart >= SERVICE_TILES.half_hart.lives) return "half_hart";
  return "empty_hart";
}
