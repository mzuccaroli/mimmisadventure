import kaplay from "kaplay";
import { loadBackgroundTileAssets } from "./backgroundTiles.js";
import { createDialogSystem } from "./dialogUI.js";
import { setupLivesSystem } from "./lives.js";
import {
  getLevelTwoGoalDialogPages,
  getLevelTwoSignDialogPages,
} from "./levels/2_andria/dialogs.js";
import { buildLevelTwoAndria } from "./levels/2_andria/level.js";
import { createPlayer, setupPlayerMovement } from "./playerMovement.js";
import { loadEnemyTileAssets } from "./enemyTiles.js";
import { loadEnvironmentTileAssets } from "./environmentTiles.js";
import { loadServiceTiles } from "./serviceTiles.js";
import { GAME_CONFIG, TAGS, loadTileAssets } from "./tiles.js";

const k = kaplay();

loadTileAssets(k);
loadBackgroundTileAssets(k);
loadEnvironmentTileAssets(k);
loadEnemyTileAssets(k);
loadServiceTiles(k);
k.setGravity(1800);

let dialogOpen = false;
let goalSequenceActive = false;

const level = buildLevelTwoAndria(k, {
  isDialogOpen: () => dialogOpen || goalSequenceActive,
});
const player = createPlayer(k, level.playerStart, GAME_CONFIG.jumpForce);
const dialogSystem = createDialogSystem(k);

const HELP_TEXT = "A/D o frecce: muovi  |  Spazio, W o ↑: salta";
const HELP_HINT_TEXT = "Premi H per rivedere questo aiuto";
const PLAYER_FRONT_FRAME = 4;

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
    if (dialogOpen || goalSequenceActive) return;
    if (lives.isGameOver() || lives.isRespawning()) return;
    if (!player.isGrounded()) return;

    firstJumpTriggered = true;
    playHelpVisibilityCycle(2);
  });
});

k.onKeyPress("h", () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
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
  isDialogOpen: () => dialogOpen || goalSequenceActive,
});

function freezeEnemies() {
  for (const enemy of k.get("enemy")) {
    enemy.vel = k.vec2(0, 0);
    enemy.isStatic = true;
  }
}

function unfreezeEnemies() {
  for (const enemy of k.get("enemy")) {
    enemy.isStatic = false;
  }
}

function lockForDialog() {
  dialogOpen = true;
  goalSequenceActive = false;
  player.stop();
  player.vel = k.vec2(0, 0);
  player.flipX = false;
  player.frame = PLAYER_FRONT_FRAME;
  player.isStatic = true;
  freezeEnemies();
}

function unlockAfterDialog() {
  dialogOpen = false;
  if (!lives.isGameOver()) {
    player.isStatic = false;
  }
  unfreezeEnemies();
}

function openDialogWithLock(pages) {
  lockForDialog();
  dialogSystem.openDialog(pages, {
    onClose: unlockAfterDialog,
  });
}

function playGoalCelebrationThenDialog() {
  if (dialogOpen || goalSequenceActive) return;

  goalSequenceActive = true;
  freezeEnemies();

  const spinFrames = [5, 6, 7, 4];
  let frameIndex = 0;
  let frameTimer = 0;
  let elapsed = 0;

  player.stop();
  player.isStatic = false;
  player.vel = k.vec2(0, -560);
  player.frame = spinFrames[0];

  const celebrationCtrl = player.onUpdate(() => {
    if (!goalSequenceActive) {
      celebrationCtrl.cancel();
      return;
    }

    const dt = k.dt();
    elapsed += dt;
    frameTimer += dt;

    if (frameTimer >= 0.06) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % spinFrames.length;
      player.frame = spinFrames[frameIndex];
    }

    const landed = elapsed >= 0.35 && player.isGrounded();
    const timedOut = elapsed >= 1.1;

    if (landed || timedOut) {
      celebrationCtrl.cancel();
      player.vel = k.vec2(0, 0);
      player.frame = 5;
      openDialogWithLock(getLevelTwoGoalDialogPages());
    }
  });
}

let reachedDialogTrigger = false;
let reachedGoal = false;

player.onCollide(TAGS.dialogTrigger, () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (reachedDialogTrigger) return;
  reachedDialogTrigger = true;
  openDialogWithLock(getLevelTwoSignDialogPages());
});

player.onCollide(TAGS.goal, () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (reachedGoal) return;
  reachedGoal = true;
  playGoalCelebrationThenDialog();
});

player.onCollide(TAGS.hazard, () => {
  if (dialogOpen || goalSequenceActive) return;
  lives.damagePlayer();
});
