export const GAME_CONFIG = {
  tile: 18,
  bgTile: 24,
  playerSpeed: 320,
  jumpForce: 760,
  floorHeight: 18 * 3,
  levelWidth: 18 * 230,
  playerStart: { x: 64, y: 120 },
  cameraZoom: 1.5,
  cameraYOffset: 110,
  maxLives: 6,
  damageCooldown: 0.7,
};

export const DEBUG_CONFIG = {
  enabled: true,
  defaultLevelId: "3",
  flySpeed: 900,
  levelStorageKey: "mimmi_debug_level_id",
};

export const TAGS = {
  goal: "goal",
  hazard: "hazard",
  spike: "spike",
  dialogTrigger: "dialogTrigger",
  checkpoint: "checkpoint",
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

function loadFemalePlayerSprite(k, spriteName, path) {
  k.loadSprite(spriteName, path, {
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

  k.loadSprite("meleeCelery", "sprites/food/celery.png");
  k.loadSprite("rangedOlivesGreen", "sprites/food/olives_green.png");

  loadFemalePlayerSprite(
    k,
    "femalePlayer",
    "sprites/Characters/Females/F_01_redhair.png",
  );
  loadFemalePlayerSprite(
    k,
    "femalePlayerBrown",
    "sprites/Characters/Females/F_01.png",
  );
  loadFemalePlayerSprite(
    k,
    "femalePlayerBlack",
    "sprites/Characters/Females/F_01_blackhair.png",
  );
  loadFemalePlayerSprite(
    k,
    "femalePlayerBlonde",
    "sprites/Characters/Females/F_01_blondehair.png",
  );
  loadFemalePlayerSprite(
    k,
    "femalePlayerRed",
    "sprites/Characters/Females/F_01_redhair.png",
  );

  k.loadSprite(
    "npcTownfolkOldM001",
    "sprites/Characters/NPC/processed/Townfolk-Old-M-001-light-sheet.png",
    {
      sliceX: 3,
      sliceY: 4,
      anims: {
        back: {
          frames: [0, 1, 2],
          loop: true,
          speed: 6,
        },
        right: {
          frames: [3, 4, 5],
          loop: true,
          speed: 6,
        },
        front: {
          frames: [6, 7, 8],
          loop: true,
          speed: 6,
        },
        left: {
          frames: [9, 10, 11],
          loop: true,
          speed: 6,
        },
      },
    },
  );

  k.loadSprite(
    "npcMageM01Dark",
    "sprites/Characters/Heroes/processed/Mage-M-01-dark-sheet.png",
    {
      sliceX: 3,
      sliceY: 4,
      anims: {
        back: {
          frames: [0, 1, 2],
          loop: true,
          speed: 6,
        },
        right: {
          frames: [3, 4, 5],
          loop: true,
          speed: 6,
        },
        front: {
          frames: [6, 7, 8],
          loop: true,
          speed: 6,
        },
        left: {
          frames: [9, 10, 11],
          loop: true,
          speed: 6,
        },
      },
    },
  );

  k.loadSprite("npcQueen01Light", "sprites/Characters/NPC/processed/Queen_01-light-sheet.png", {
    sliceX: 3,
    sliceY: 4,
    anims: {
      back: {
        frames: [0, 1, 2],
        loop: true,
        speed: 6,
      },
      right: {
        frames: [3, 4, 5],
        loop: true,
        speed: 6,
      },
      front: {
        frames: [6, 7, 8],
        loop: true,
        speed: 6,
      },
      left: {
        frames: [9, 10, 11],
        loop: true,
        speed: 6,
      },
    },
  });
}
