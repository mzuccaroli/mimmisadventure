export const GAME_CONFIG = {
  tile: 18,
  bgTile: 24,
  playerSpeed: 320,
  jumpForce: 760,
  floorHeight: 18 * 3,
  levelWidth: 18 * 230,
  playerStart: { x: 64, y: 120 },
  maxLives: 6,
  damageCooldown: 0.7,
};

export const TAGS = {
  goal: "goal",
  hazard: "hazard",
  spike: "spike",
};

export const TILE_FRAMES = {
  terrainTop: [0, 1, 2, 3],
  terrainFill: 4,
  spike: 68,
  coin: 151,
  tree: 126,
  cactus: 127,
  grass: 124,
  sign: 69,
  arrowLeft: 87,
  arrowRight: 88,
  door: 130,
  torch: 128,
  cloudLeft: 154,
  cloudMid: 155,
  cloudRight: 156,
};

export function loadTileAssets(k) {
  k.loadRoot("./");

  k.loadSprite(
    "kenneyBg",
    "sprites/kenney_pixel-platformer/Tilemap/tilemap-backgrounds_packed.png",
    {
      sliceX: 8,
      sliceY: 3,
    },
  );

  k.loadSprite(
    "kenneyTiles",
    "sprites/kenney_pixel-platformer/Tilemap/tilemap_packed.png",
    {
      sliceX: 20,
      sliceY: 9,
    },
  );

  k.loadSprite("femalePlayer", "sprites/Characters/Females/F_01_redhair.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
      walkRight: {
        frames: [1, 5, 9],
        loop: true,
        speed: 10,
      },
      walkLeft: {
        frames: [3, 7, 11],
        loop: true,
        speed: 10,
      },
    },
  });
}
