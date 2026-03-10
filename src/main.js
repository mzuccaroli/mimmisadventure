import kaplay from "kaplay";
import { createDialogSystem, getGoalPlaceholderPages } from "./dialogUI.js";
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

let dialogOpen = false;

const level = buildLevelOne(k, {
  isDialogOpen: () => dialogOpen,
});
const player = createPlayer(k, level.playerStart, GAME_CONFIG.jumpForce);
const dialogSystem = createDialogSystem(k);

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
    if (dialogOpen) return;
    if (lives.isGameOver() || lives.isRespawning()) return;
    if (!player.isGrounded()) return;

    firstJumpTriggered = true;
    playHelpVisibilityCycle(2);
  });
});

k.onKeyPress("h", () => {
  if (lives.isGameOver() || dialogOpen) return;
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
  isDialogOpen: () => dialogOpen,
});

let reachedGoal = false;

player.onCollide(TAGS.goal, () => {
  if (lives.isGameOver()) return;
  if (reachedGoal) return;
  reachedGoal = true;
  dialogOpen = true;

  player.stop();
  player.vel = k.vec2(0, 0);
  player.isStatic = true;

  for (const enemy of k.get("enemy")) {
    enemy.vel = k.vec2(0, 0);
    enemy.isStatic = true;
  }

  dialogSystem.openDialog(getGoalPlaceholderPages(), {
    onClose: () => {
      dialogOpen = false;

      if (!lives.isGameOver()) {
        player.isStatic = false;
      }

      for (const enemy of k.get("enemy")) {
        enemy.isStatic = false;
      }
    },
  });
});

player.onCollide(TAGS.hazard, () => {
  if (dialogOpen) return;
  lives.damagePlayer();
});
