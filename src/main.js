import kaplay from "kaplay";
import { setupLivesSystem } from "./lives.js";
import { buildLevelOne } from "./levels/levelOne.js";
import { createPlayer, setupPlayerMovement } from "./playerMovement.js";
import { loadEnemyTileAssets } from "./enemyTiles.js";
import { loadEnvironmentTileAssets } from "./environmentTiles.js";
import { loadServiceTiles } from "./serviceTiles.js";
import { GAME_CONFIG, TAGS, loadTileAssets } from "./tiles.js";

const k = kaplay();

loadTileAssets(k);
loadEnvironmentTileAssets(k);
loadEnemyTileAssets(k);
loadServiceTiles(k);
k.setGravity(1800);

const level = buildLevelOne(k);
const player = createPlayer(k, level.playerStart, GAME_CONFIG.jumpForce);

k.add([
  k.text("A/D o frecce: muovi  |  Spazio, W o ↑: salta", { size: 20 }),
  k.pos(20, 20),
  k.color(20, 20, 20),
  k.fixed(),
  k.z(10),
]);

const lives = setupLivesSystem(k, player, {
  maxLives: GAME_CONFIG.maxLives,
  damageCooldown: GAME_CONFIG.damageCooldown,
  respawnPos: level.playerStart,
});

setupPlayerMovement(k, player, {
  playerSpeed: GAME_CONFIG.playerSpeed,
  playerStart: level.playerStart,
  levelWidth: level.levelWidth,
  cameraZoom: GAME_CONFIG.cameraZoom,
  cameraYOffset: GAME_CONFIG.cameraYOffset,
  isGameOver: lives.isGameOver,
});

let reachedGoal = false;

player.onCollide(TAGS.goal, () => {
  if (lives.isGameOver()) return;
  if (reachedGoal) return;
  reachedGoal = true;

  k.add([
    k.text("Traguardo raggiunto!", { size: 42 }),
    k.pos(k.width() / 2, 70),
    k.anchor("center"),
    k.color(20, 120, 40),
    k.fixed(),
    k.z(110),
  ]);
});

player.onCollide(TAGS.hazard, lives.damagePlayer);
