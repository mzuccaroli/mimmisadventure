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

const HELP_TEXT = "A/D o frecce: muovi  |  Spazio, W o ↑: salta";
const HELP_HINT_TEXT = "Premi H per rivedere questo aiuto";

let helpLabel = null;
let helpFadeCtrl = null;
let helpSequenceId = 0;
let firstJumpTriggered = false;

function showHelpLabel(text) {
  if (helpFadeCtrl) {
    helpFadeCtrl.cancel();
    helpFadeCtrl = null;
  }

  if (helpLabel) {
    helpLabel.destroy();
  }

  helpLabel = k.add([
    k.text(text, { size: 20 }),
    k.pos(20, 20),
    k.color(20, 20, 20),
    k.opacity(1),
    k.fixed(),
    k.z(10),
  ]);
}

function fadeOutHelpLabel(duration = 0.8) {
  if (!helpLabel) return;

  if (helpFadeCtrl) {
    helpFadeCtrl.cancel();
    helpFadeCtrl = null;
  }

  const target = helpLabel;
  const fadeStartTime = k.time();

  helpFadeCtrl = target.onUpdate(() => {
    const elapsed = k.time() - fadeStartTime;
    const t = Math.min(1, elapsed / duration);
    target.opacity = 1 - t;

    if (t >= 1) {
      helpFadeCtrl.cancel();
      helpFadeCtrl = null;
      if (helpLabel === target) {
        helpLabel = null;
      }
      target.destroy();
    }
  });
}

function playHelpVisibilityCycle(helpDurationSeconds) {
  const sequenceId = ++helpSequenceId;

  showHelpLabel(HELP_TEXT);

  k.wait(helpDurationSeconds, () => {
    if (sequenceId !== helpSequenceId) return;
    showHelpLabel(HELP_HINT_TEXT);

    k.wait(1.2, () => {
      if (sequenceId !== helpSequenceId) return;
      fadeOutHelpLabel(0.8);
    });
  });
}

showHelpLabel(HELP_TEXT);

const lives = setupLivesSystem(k, player, {
  maxLives: GAME_CONFIG.maxLives,
  damageCooldown: GAME_CONFIG.damageCooldown,
  respawnPos: level.playerStart,
});

["space", "w", "up"].forEach((key) => {
  k.onKeyPress(key, () => {
    if (firstJumpTriggered) return;
    if (lives.isGameOver() || lives.isRespawning()) return;
    if (!player.isGrounded()) return;

    firstJumpTriggered = true;
    playHelpVisibilityCycle(2);
  });
});

k.onKeyPress("h", () => {
  if (lives.isGameOver()) return;
  playHelpVisibilityCycle(5);
});

setupPlayerMovement(k, player, {
  playerSpeed: GAME_CONFIG.playerSpeed,
  playerStart: level.playerStart,
  levelWidth: level.levelWidth,
  cameraZoom: GAME_CONFIG.cameraZoom,
  cameraYOffset: GAME_CONFIG.cameraYOffset,
  isGameOver: lives.isGameOver,
  isRespawning: lives.isRespawning,
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
