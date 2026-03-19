import kaplay from "kaplay";
import { loadBackgroundTileAssets } from "./backgroundTiles.js";
import { createDialogSystem } from "./dialogUI.js";
import { setupLivesSystem } from "./lives.js";
import { loadEnvironmentTileFarmAssets } from "./environmentTiles_farm.js";
import {
  getLevelOneGoalDialogPages,
  getLevelOneSignDialogPages,
} from "./levels/1_intro/dialogs.js";
import { buildLevelOne } from "./levels/1_intro/level.js";
import {
  getLevelTwoGoalDialogPages,
  getLevelTwoSignDialogPages,
} from "./levels/2_andria/dialogs.js";
import { buildLevelTwoAndria } from "./levels/2_andria/level.js";
import {
  getLevelThreeMontegrossoGoalDialogPages,
  getLevelThreeMontegrossoSignDialogPages,
} from "./levels/3_montegrosso/dialogs.js";
import { buildLevelThreeMontegrosso } from "./levels/3_montegrosso/level.js";
import { createPlayer, setupPlayerMovement } from "./playerMovement.js";
import { loadEnemyTileAssets } from "./enemyTiles.js";
import { loadEnvironmentTileAssets } from "./environmentTiles.js";
import { loadServiceTiles } from "./serviceTiles.js";
import { DEBUG_CONFIG, GAME_CONFIG, TAGS, loadTileAssets } from "./tiles.js";

const LEVEL_DEFINITIONS = Object.freeze({
  1: {
    buildLevel: buildLevelOne,
    getGoalDialogPages: getLevelOneGoalDialogPages,
    getSignDialogPages: getLevelOneSignDialogPages,
  },
  2: {
    buildLevel: buildLevelTwoAndria,
    getGoalDialogPages: getLevelTwoGoalDialogPages,
    getSignDialogPages: getLevelTwoSignDialogPages,
  },
  3: {
    buildLevel: buildLevelThreeMontegrosso,
    getGoalDialogPages: getLevelThreeMontegrossoGoalDialogPages,
    getSignDialogPages: getLevelThreeMontegrossoSignDialogPages,
  },
});

function getConfiguredLevelId() {
  if (!DEBUG_CONFIG.enabled) {
    return DEBUG_CONFIG.defaultLevelId;
  }

  try {
    return (
      window.localStorage.getItem(DEBUG_CONFIG.levelStorageKey) ??
      DEBUG_CONFIG.defaultLevelId
    );
  } catch {
    return DEBUG_CONFIG.defaultLevelId;
  }
}

function setConfiguredLevelId(levelId) {
  try {
    window.localStorage.setItem(DEBUG_CONFIG.levelStorageKey, levelId);
  } catch {
    // Ignore localStorage failures in dev helpers.
  }
}

const k = kaplay();

loadTileAssets(k);
loadBackgroundTileAssets(k);
loadEnvironmentTileAssets(k);
loadEnvironmentTileFarmAssets(k);
loadEnemyTileAssets(k);
loadServiceTiles(k);
k.setGravity(1800);

let dialogOpen = false;
let goalSequenceActive = false;
let debugFlyActive = false;

const currentLevelId = getConfiguredLevelId();
const currentLevelDefinition =
  LEVEL_DEFINITIONS[currentLevelId] ?? LEVEL_DEFINITIONS[DEBUG_CONFIG.defaultLevelId];

if (!currentLevelDefinition) {
  throw new Error(`Livello "${currentLevelId}" non configurato.`);
}

const level = currentLevelDefinition.buildLevel(k, {
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
const pipeTraversal =
  typeof level.setupPipeTraversal === "function"
    ? level.setupPipeTraversal(player, {
        isGameOver: lives.isGameOver,
        isRespawning: lives.isRespawning,
        isDialogOpen: () => dialogOpen || goalSequenceActive,
      })
    : {
        isPipeTraveling: () => false,
        cancelTravel: () => {},
      };
const ropeTraversal =
  typeof level.setupRopeTraversal === "function"
    ? level.setupRopeTraversal(player, {
        isGameOver: lives.isGameOver,
        isRespawning: lives.isRespawning,
        isDialogOpen: () => dialogOpen || goalSequenceActive,
        isPipeTraveling: pipeTraversal.isPipeTraveling,
      })
    : {
        isRopeHanging: () => false,
        cancelHang: () => {},
      };

function isDebugFlying() {
  return DEBUG_CONFIG.enabled && debugFlyActive;
}

["space", "w", "up"].forEach((key) => {
  k.onKeyPress(key, () => {
    if (firstJumpTriggered) return;
    if (dialogOpen || goalSequenceActive) return;
    if (isDebugFlying()) return;
    if (pipeTraversal.isPipeTraveling()) return;
    if (ropeTraversal.isRopeHanging()) return;
    if (lives.isGameOver() || lives.isRespawning()) return;
    if (!player.isGrounded()) return;

    firstJumpTriggered = true;
    playHelpVisibilityCycle(2);
  });
});

k.onKeyPress("h", () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (isDebugFlying()) return;
  if (pipeTraversal.isPipeTraveling()) return;
  if (ropeTraversal.isRopeHanging()) return;
  playHelpVisibilityCycle(5);
});

if (DEBUG_CONFIG.enabled) {
  k.onKeyPress("d", () => {
    if (!k.isKeyDown("ctrl") && !k.isKeyDown("control")) return;
    if (lives.isGameOver()) return;

    debugFlyActive = !debugFlyActive;
    pipeTraversal.cancelTravel();
    ropeTraversal.cancelHang();
    player.opacity = 1;
    player.vel = k.vec2(0, 0);

    if (debugFlyActive) {
      dialogOpen = false;
      goalSequenceActive = false;
      player.isStatic = true;
      freezeEnemies();
    } else if (!dialogOpen && !goalSequenceActive) {
      player.isStatic = false;
      unfreezeEnemies();
    }
  });

  Object.keys(LEVEL_DEFINITIONS).forEach((levelId) => {
    k.onKeyPress(levelId, () => {
      setConfiguredLevelId(levelId);
      window.location.reload();
    });
  });
}

setupPlayerMovement(k, player, {
  playerSpeed: GAME_CONFIG.playerSpeed,
  debugFlySpeed: DEBUG_CONFIG.flySpeed,
  playerStart: level.playerStart,
  levelWidth: level.levelWidth,
  cameraZoom: GAME_CONFIG.cameraZoom,
  cameraYOffset: GAME_CONFIG.cameraYOffset,
  isGameOver: lives.isGameOver,
  isRespawning: lives.isRespawning,
  isDialogOpen: () => dialogOpen || goalSequenceActive,
  isPipeTraveling: pipeTraversal.isPipeTraveling,
  isRopeHanging: ropeTraversal.isRopeHanging,
  isDebugFlying,
});

function freezeEnemies() {
  for (const enemy of k.get("enemy")) {
    enemy.vel = k.vec2(0, 0);
    enemy.isStatic = true;
  }
}

function unfreezeEnemies() {
  if (isDebugFlying()) return;
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
  if (dialogOpen || goalSequenceActive || isDebugFlying()) return;

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
      openDialogWithLock(currentLevelDefinition.getGoalDialogPages());
    }
  });
}

function getEntityGlowCenter(entity) {
  if (entity && typeof entity.worldArea === "function") {
    const bbox = entity.worldArea().bbox();
    return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
  }

  return k.vec2(
    entity.pos.x + GAME_CONFIG.tile / 2,
    entity.pos.y + GAME_CONFIG.tile / 2,
  );
}

function addCheckpointGlow(target, width, height, duration = 0.55, z = 9) {
  const glow = k.add([
    k.pos(0, 0),
    k.anchor("center"),
    k.rect(width, height),
    k.scale(1),
    k.color(255, 244, 173),
    k.opacity(0.45),
    k.z(z),
  ]);

  const startTime = k.time();
  const ctrl = glow.onUpdate(() => {
    const elapsed = k.time() - startTime;
    const t = Math.min(1, elapsed / duration);
    const wave = (Math.sin(elapsed * 26) + 1) * 0.5;

    glow.pos = getEntityGlowCenter(target);
    glow.opacity = (1 - t) * (0.2 + wave * 0.4);
    glow.scale = k.vec2(1 + wave * 0.22);

    if (t >= 1) {
      ctrl.cancel();
      glow.destroy();
    }
  });
}

function pulseCheckpointTarget(target, duration = 0.55) {
  if (!target || typeof target.onUpdate !== "function") return;

  const baseOpacity = typeof target.opacity === "number" ? target.opacity : 1;
  const startTime = k.time();
  const ctrl = target.onUpdate(() => {
    const elapsed = k.time() - startTime;
    const t = Math.min(1, elapsed / duration);
    const wave = (Math.sin(elapsed * 26) + 1) * 0.5;
    target.opacity = 0.7 + wave * 0.3;

    if (t >= 1) {
      target.opacity = baseOpacity;
      ctrl.cancel();
    }
  });
}

function playCheckpointActivation(checkpoint) {
  pulseCheckpointTarget(player);
  addCheckpointGlow(
    player,
    GAME_CONFIG.tile * 1.35,
    GAME_CONFIG.tile * 1.95,
    0.55,
    9,
  );

  if (checkpoint?.flagRef) {
    pulseCheckpointTarget(checkpoint.flagRef);
    addCheckpointGlow(
      checkpoint.flagRef,
      GAME_CONFIG.tile * 0.95,
      GAME_CONFIG.tile * 1.25,
      0.55,
      8,
    );
  }
}

let reachedDialogTrigger = false;
let reachedGoal = false;
let reachedCheckpointIds = new Set();

player.onCollide(TAGS.dialogTrigger, () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (isDebugFlying()) return;
  if (pipeTraversal.isPipeTraveling()) return;
  if (ropeTraversal.isRopeHanging()) return;
  if (reachedDialogTrigger) return;
  reachedDialogTrigger = true;
  openDialogWithLock(currentLevelDefinition.getSignDialogPages());
});

player.onCollide(TAGS.goal, () => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (isDebugFlying()) return;
  if (pipeTraversal.isPipeTraveling()) return;
  if (ropeTraversal.isRopeHanging()) return;
  if (reachedGoal) return;
  reachedGoal = true;
  playGoalCelebrationThenDialog();
});

player.onCollide(TAGS.checkpoint, (checkpoint) => {
  if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
  if (isDebugFlying()) return;
  if (pipeTraversal.isPipeTraveling()) return;
  if (ropeTraversal.isRopeHanging()) return;
  if (!checkpoint?.checkpointId || !checkpoint?.respawnPos) return;
  if (reachedCheckpointIds.has(checkpoint.checkpointId)) return;

  reachedCheckpointIds.add(checkpoint.checkpointId);
  lives.setRespawnPos(checkpoint.respawnPos);
  playCheckpointActivation(checkpoint);
});

player.onCollide(TAGS.hazard, () => {
  if (dialogOpen || goalSequenceActive) return;
  if (isDebugFlying()) return;
  if (pipeTraversal.isPipeTraveling()) return;
  lives.damagePlayer();
});
