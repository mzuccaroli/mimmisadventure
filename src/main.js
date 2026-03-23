import kaplay from "kaplay";
import { loadBackgroundTileAssets } from "./backgroundTiles.js";
import { createDialogSystem } from "./dialogUI.js";
import { loadEnvironmentTileIndustrialAssets } from "./environmentTiles_industrial.js";
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
import {
  getLevelFourLombardiaGoalDialogPages,
  getLevelFourLombardiaSignDialogPages,
} from "./levels/4_lombardia/dialogs.js";
import { buildLevelFourLombardia } from "./levels/4_lombardia/level.js";
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
  4: {
    buildLevel: buildLevelFourLombardia,
    getGoalDialogPages: getLevelFourLombardiaGoalDialogPages,
    getSignDialogPages: getLevelFourLombardiaSignDialogPages,
  },
});

const HELP_HINT_TEXT = "Premi H per rivedere questo aiuto";
const PLAYER_FRONT_FRAME = 4;
const CHARACTER_UNLOCK_STORAGE_KEY = "mimmi_unlocked_characters";
const PENDING_CHARACTER_STORAGE_KEY = "mimmi_pending_character_id";
const LEVEL_SELECTOR_UNLOCK_STORAGE_KEY = "mimmi_level_selector_unlocked";
const NEXT_LEVEL_BY_LEVEL_ID = Object.freeze({
  1: "2",
  2: "3",
  3: "4",
});
const PLAYER_CHOICES = Object.freeze([
  {
    id: "brown",
    label: "Brown-haired Mimmi",
    subtitle: "Just a regular genuis",
    sprite: "femalePlayerBrown",
    ability: "base",
    unlockedByDefault: true,
  },
  {
    id: "black",
    label: "Black-haired Mimmi",
    subtitle: "Really good jumper",
    sprite: "femalePlayerBlack",
    ability: "double_jump",
    unlockLevelId: "1",
  },
  {
    id: "blonde",
    label: "Blonde-haired Mimmi",
    subtitle: "Power of cime di rapa",
    sprite: "femalePlayerBlonde",
    ability: "melee",
    unlockLevelId: "2",
  },
  {
    id: "red",
    label: "Red-haired Mimmi",
    subtitle: "Super hot spicy olives",
    sprite: "femalePlayerRed",
    ability: "ranged",
    unlockLevelId: "3",
  },
  {
    id: "magic",
    label: "Magic-haired Mimmi",
    subtitle: "True fairy magic",
    sprite: "femalePlayerMagic",
    ability: "base",
    unlockLevelId: "4",
  },
]);
const CHARACTER_UNLOCK_BY_LEVEL_ID = Object.freeze({
  1: "black",
  2: "blonde",
  3: "red",
  4: "magic",
});

function getDefaultUnlockedCharacterIds() {
  return PLAYER_CHOICES.filter((choice) => choice.unlockedByDefault).map(
    (choice) => choice.id,
  );
}

function getPlayerChoiceById(choiceId) {
  return PLAYER_CHOICES.find((choice) => choice.id === choiceId) ?? null;
}

function getCharacterRewardChoiceForLevel(levelId) {
  return getPlayerChoiceById(CHARACTER_UNLOCK_BY_LEVEL_ID[levelId]);
}

function getUnlockedCharacterIds() {
  const defaultUnlockedIds = getDefaultUnlockedCharacterIds();

  try {
    const stored = window.localStorage.getItem(CHARACTER_UNLOCK_STORAGE_KEY);
    if (!stored) {
      return new Set(defaultUnlockedIds);
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set(defaultUnlockedIds);
    }

    const validIds = new Set(PLAYER_CHOICES.map((choice) => choice.id));
    const unlockedIds = parsed.filter((id) => validIds.has(id));
    defaultUnlockedIds.forEach((id) => {
      if (!unlockedIds.includes(id)) unlockedIds.push(id);
    });
    return new Set(unlockedIds);
  } catch {
    return new Set(defaultUnlockedIds);
  }
}

function persistUnlockedCharacterIds(unlockedIds) {
  try {
    window.localStorage.setItem(
      CHARACTER_UNLOCK_STORAGE_KEY,
      JSON.stringify([...unlockedIds]),
    );
  } catch {
    // Ignore localStorage failures for unlock persistence.
  }
}

function unlockCharacterForLevel(levelId) {
  const unlockedCharacterId = CHARACTER_UNLOCK_BY_LEVEL_ID[levelId];
  if (!unlockedCharacterId) {
    return null;
  }

  const unlockedIds = getUnlockedCharacterIds();
  if (unlockedIds.has(unlockedCharacterId)) {
    return null;
  }

  unlockedIds.add(unlockedCharacterId);
  persistUnlockedCharacterIds(unlockedIds);
  return unlockedCharacterId;
}

function persistPendingCharacterId(characterId) {
  try {
    window.localStorage.setItem(PENDING_CHARACTER_STORAGE_KEY, characterId);
  } catch {
    // Ignore localStorage failures for pending character selection.
  }
}

function isLevelSelectorUnlocked() {
  try {
    return window.localStorage.getItem(LEVEL_SELECTOR_UNLOCK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function unlockLevelSelector() {
  try {
    window.localStorage.setItem(LEVEL_SELECTOR_UNLOCK_STORAGE_KEY, "1");
  } catch {
    // Ignore localStorage failures for level selector unlock.
  }
}

function resetGameProgressToNewGame() {
  try {
    window.localStorage.removeItem(CHARACTER_UNLOCK_STORAGE_KEY);
    window.localStorage.removeItem(LEVEL_SELECTOR_UNLOCK_STORAGE_KEY);
    window.localStorage.removeItem(PENDING_CHARACTER_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures for new game reset.
  }

  setConfiguredLevelId("1");
}

function consumePendingCharacterId() {
  try {
    const characterId = window.localStorage.getItem(PENDING_CHARACTER_STORAGE_KEY);
    if (!characterId) {
      return null;
    }
    window.localStorage.removeItem(PENDING_CHARACTER_STORAGE_KEY);
    return characterId;
  } catch {
    return null;
  }
}

function getHelpTextForCharacter(character) {
  switch (character.ability) {
    case "double_jump":
      return "A/D o frecce: muovi  |  Spazio, W o ↑: doppio salto";
    case "melee":
      return "A/D o frecce: muovi  |  W o ↑: salta  |  Spazio: melee";
    case "ranged":
      return "A/D o frecce: muovi  |  W o ↑: salta  |  Spazio: ranged";
    default:
      return "A/D o frecce: muovi  |  Spazio, W o ↑: salta";
  }
}

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
loadEnvironmentTileIndustrialAssets(k);
loadEnemyTileAssets(k);
loadServiceTiles(k);
k.setGravity(1800);

let gameStarted = false;

function createSelectionScreen(onSelect, options = {}) {
  const {
    title = "Choose Your Mimmi",
    subtitle = "Click a character to start the level",
    forcedLevelId = null,
  } = options;
  const ui = [];
  const unlockedCharacterIds = getUnlockedCharacterIds();
  const visiblePlayerChoices = PLAYER_CHOICES.filter((choice) =>
    unlockedCharacterIds.has(choice.id),
  );
  const levelSelectorVisible = isLevelSelectorUnlocked();
  let selectedLevelId = forcedLevelId ?? getConfiguredLevelId();
  let handledSelection = false;
  const addUi = (components) => {
    const obj = k.add(components);
    ui.push(obj);
    return obj;
  };

  addUi([
    k.pos(0, 0),
    k.rect(k.width(), k.height()),
    k.color(247, 235, 211),
    k.fixed(),
    k.z(100),
  ]);

  addUi([
    k.pos(0, k.height() * 0.58),
    k.rect(k.width(), k.height() * 0.42),
    k.color(228, 205, 162),
    k.fixed(),
    k.z(101),
  ]);

  addUi([
    k.text(title, { size: 34 }),
    k.pos(k.width() / 2, 56),
    k.anchor("center"),
    k.color(61, 39, 23),
    k.fixed(),
    k.z(102),
  ]);

  addUi([
    k.text(subtitle, { size: 18 }),
    k.pos(k.width() / 2, 96),
    k.anchor("center"),
    k.color(93, 67, 45),
    k.fixed(),
    k.z(102),
  ]);

  const startNewGameButtonY = levelSelectorVisible ? k.height() - 34 : 138;
  const startNewGameFrame = addUi([
    k.pos(k.width() - 138, startNewGameButtonY),
    k.anchor("center"),
    k.rect(212, 42),
    k.color(101, 78, 52),
    k.area(),
    k.fixed(),
    k.z(103),
  ]);

  startNewGameFrame.onClick(() => {
    if (handledSelection) return;
    handledSelection = true;
    resetGameProgressToNewGame();
    window.location.reload();
  });

  addUi([
    k.text("Start new game", { size: 18 }),
    k.pos(k.width() - 138, startNewGameButtonY),
    k.anchor("center"),
    k.color(255, 247, 230),
    k.fixed(),
    k.z(104),
  ]);

  const optionWidth = 190;
  const optionHeight = 182;
  const columnGap = 24;
  const rowGap = 24;
  const itemsPerRow = 3;
  const totalRows = Math.ceil(visiblePlayerChoices.length / itemsPerRow);
  const centerX = k.width() / 2;
  const centerY = levelSelectorVisible ? k.height() / 2 - 64 : k.height() / 2 + 18;
  const totalGridHeight = totalRows * optionHeight + (totalRows - 1) * rowGap;
  const firstRowY = centerY - totalGridHeight / 2 + optionHeight / 2;

  visiblePlayerChoices.forEach((choice, index) => {
    const rowIndex = Math.floor(index / itemsPerRow);
    const columnIndex = index % itemsPerRow;
    const rowStart = rowIndex * itemsPerRow;
    const rowCount = Math.min(itemsPerRow, visiblePlayerChoices.length - rowStart);
    const totalRowWidth = rowCount * optionWidth + (rowCount - 1) * columnGap;
    const firstRowX = centerX - totalRowWidth / 2 + optionWidth / 2;
    const x = firstRowX + columnIndex * (optionWidth + columnGap);
    const y = firstRowY + rowIndex * (optionHeight + rowGap);

    addUi([
      k.pos(x, y),
      k.anchor("center"),
      k.rect(optionWidth + 8, optionHeight + 8),
      k.color(101, 78, 52),
      k.fixed(),
      k.z(102),
    ]);

    const option = addUi([
      k.pos(x, y),
      k.anchor("center"),
      k.rect(optionWidth, optionHeight),
      k.color(255, 247, 230),
      k.area(),
      k.fixed(),
      k.z(103),
    ]);

    option.onClick(() => {
      if (handledSelection) return;
      handledSelection = true;
      onSelect(choice, selectedLevelId);
    });

    addUi([
      k.pos(x, y - 20),
      k.anchor("center"),
      k.sprite(choice.sprite, { frame: PLAYER_FRONT_FRAME }),
      k.scale(4.6),
      k.opacity(1),
      k.fixed(),
      k.z(104),
    ]);

    addUi([
      k.text(choice.label, {
        size: 18,
        width: optionWidth - 34,
        align: "center",
      }),
      k.pos(x, y + 42),
      k.anchor("center"),
      k.color(53, 39, 24),
      k.fixed(),
      k.z(104),
    ]);

    if (choice.subtitle) {
      addUi([
        k.text(choice.subtitle, {
          size: 13,
          width: optionWidth - 34,
          align: "center",
        }),
        k.pos(x, y + 74),
        k.anchor("center"),
        k.color(112, 84, 56),
        k.fixed(),
        k.z(104),
      ]);
    }
  });

  if (levelSelectorVisible) {
    const levelButtonWidth = 74;
    const levelButtonHeight = 42;
    const levelGap = 16;
    const levelButtonY = firstRowY + totalGridHeight / 2 + 238;
    const levelButtons = [];

    const syncLevelButtonState = () => {
      levelButtons.forEach(({ levelId, frame, label }) => {
        const active = levelId === selectedLevelId;
        frame.color = active ? k.rgb(101, 78, 52) : k.rgb(176, 146, 112);
        label.color = active ? k.rgb(255, 247, 230) : k.rgb(78, 56, 34);
      });
    };

    addUi([
      k.text("Select level", { size: 18 }),
      k.pos(k.width() / 2, levelButtonY - 34),
      k.anchor("center"),
      k.color(61, 39, 23),
      k.fixed(),
      k.z(104),
    ]);

    const levelIds = Object.keys(LEVEL_DEFINITIONS);
    const totalWidth =
      levelIds.length * levelButtonWidth + (levelIds.length - 1) * levelGap;
    const startX = k.width() / 2 - totalWidth / 2 + levelButtonWidth / 2;

    levelIds.forEach((levelId, index) => {
      const x = startX + index * (levelButtonWidth + levelGap);
      const frame = addUi([
        k.pos(x, levelButtonY),
        k.anchor("center"),
        k.rect(levelButtonWidth, levelButtonHeight),
        k.color(176, 146, 112),
        k.area(),
        k.fixed(),
        k.z(103),
      ]);

      frame.onClick(() => {
        selectedLevelId = levelId;
        syncLevelButtonState();
      });

      const label = addUi([
        k.text(levelId, { size: 20 }),
        k.pos(x, levelButtonY),
        k.anchor("center"),
        k.color(78, 56, 34),
        k.fixed(),
        k.z(104),
      ]);

      levelButtons.push({ levelId, frame, label });
    });

    syncLevelButtonState();
  }

  return () => {
    ui.forEach((obj) => obj.destroy());
  };
}

function startGame(selectedCharacter) {
  if (gameStarted) return;
  gameStarted = true;

  const helpText = getHelpTextForCharacter(selectedCharacter);
  let currentPlayerSprite = selectedCharacter.sprite;
  let dialogOpen = false;
  let goalSequenceActive = false;
  let debugFlyActive = false;
  let helpLabel = null;
  let helpFadeCtrl = null;
  let helpSequenceId = 0;
  let firstJumpTriggered = false;
  let reachedDialogTrigger = false;
  let reachedGoal = false;
  let reachedCheckpointIds = new Set();
  let pendingUnlockedCharacter = null;
  let exitDoorUnlocked = false;
  let levelExitSequenceActive = false;

  const currentLevelId = getConfiguredLevelId();
  const currentLevelDefinition =
    LEVEL_DEFINITIONS[currentLevelId] ??
    LEVEL_DEFINITIONS[DEBUG_CONFIG.defaultLevelId];

  if (!currentLevelDefinition) {
    throw new Error(`Livello "${currentLevelId}" non configurato.`);
  }

  const level = currentLevelDefinition.buildLevel(k, {
    isDialogOpen: () => dialogOpen || goalSequenceActive,
  });
  const player = createPlayer(
    k,
    level.playerStart,
    GAME_CONFIG.jumpForce,
    currentPlayerSprite,
  );
  const dialogSystem = createDialogSystem(k);
  const lives = setupLivesSystem(k, player, {
    maxLives: GAME_CONFIG.maxLives,
    damageCooldown: GAME_CONFIG.damageCooldown,
    respawnPos: level.playerStart,
    onRespawn: () => {
      if (typeof level.resetEnemies === "function") {
        level.resetEnemies();
      }
    },
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

  function canUseAbility() {
    if (lives.isGameOver()) return false;
    if (dialogOpen || goalSequenceActive) return false;
    if (isDebugFlying()) return false;
    if (pipeTraversal.isPipeTraveling()) return false;
    if (ropeTraversal.isRopeHanging()) return false;
    if (lives.isRespawning()) return false;
    return true;
  }

  function isMagicCharacter() {
    return selectedCharacter.id === "magic";
  }

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

    showHelpLabel(helpText);

    k.wait(helpDurationSeconds, () => {
      if (sequenceId !== helpSequenceId) return;
      showHelpLabel(HELP_HINT_TEXT);

      k.wait(1.2, () => {
        if (sequenceId !== helpSequenceId) return;
        fadeOutHelpLabel(0.8);
      });
    });
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
    goalSequenceActive = false;
    if (!lives.isGameOver()) {
      player.isStatic = false;
    }
    unfreezeEnemies();
  }

  function unlockLevelExitDoor() {
    exitDoorUnlocked = true;
    if (typeof level.unlockExitDoor === "function") {
      level.unlockExitDoor();
    }
  }

  function openCharacterSelectionScreen({
    forcedLevelId = null,
    title = "Choose Your Mimmi",
    subtitle = "Click a character to start the level",
  } = {}) {
    if (levelExitSequenceActive) return;
    levelExitSequenceActive = true;
    dialogOpen = false;
    goalSequenceActive = true;
    player.stop();
    player.vel = k.vec2(0, 0);
    player.isStatic = true;
    freezeEnemies();

    createSelectionScreen(
      (choice, levelId) => {
        persistPendingCharacterId(choice.id);
        setConfiguredLevelId(levelId);
        window.location.reload();
      },
      {
        forcedLevelId,
        title,
        subtitle,
      },
    );
  }

  function openCharacterSelectionForNextLevel(nextLevelId) {
    openCharacterSelectionScreen({
      forcedLevelId: nextLevelId,
      title: "Choose Your Mimmi",
      subtitle: `Select your character for level ${nextLevelId}`,
    });
  }

  function openLevelSelectionHub() {
    unlockLevelSelector();
    openCharacterSelectionScreen({
      title: "Choose Your Mimmi",
      subtitle: "Select your character and level",
    });
  }

  function swapPlayerSprite(choice) {
    if (!choice) return;

    player.use(k.sprite(choice.sprite, { anim: "walkRight" }));
    player.stop();
    player.flipX = false;
    player.frame = PLAYER_FRONT_FRAME;
    currentPlayerSprite = choice.sprite;
  }

  function playUnlockTransformation(choice, onComplete = unlockAfterDialog) {
    if (!choice) {
      onComplete();
      return;
    }

    goalSequenceActive = true;
    player.stop();
    player.vel = k.vec2(0, 0);
    player.isStatic = true;
    player.flipX = false;

    const baseX = player.pos.x;
    const baseY = player.pos.y;
    const jumpHeight = GAME_CONFIG.tile * 3.4;
    const duration = 1.05;
    const spinTurns = 3;
    const startScale = 2;
    let transformed = false;
    player.opacity = 0;

    const rewardVisual = k.add([
      k.pos(baseX, baseY),
      k.sprite(currentPlayerSprite, { frame: PLAYER_FRONT_FRAME }),
      k.scale(startScale),
      k.opacity(1),
      k.z(7),
    ]);

    addCheckpointGlow(
      rewardVisual,
      GAME_CONFIG.tile * 1.7,
      GAME_CONFIG.tile * 2.1,
      0.65,
      9,
    );

    const startTime = k.time();
    const transformCtrl = rewardVisual.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const t = Math.min(1, elapsed / duration);
      const arc = Math.sin(Math.PI * t);

      rewardVisual.pos.x = baseX;
      rewardVisual.pos.y = baseY - arc * jumpHeight;
      rewardVisual.angle = t * 360 * spinTurns;
      const scalePulse = startScale + arc * 0.18;
      rewardVisual.scale = k.vec2(scalePulse, scalePulse);

      if (!transformed && t >= 0.52) {
        transformed = true;
        rewardVisual.use(k.sprite(choice.sprite, { frame: PLAYER_FRONT_FRAME }));
        createAttackFlash(
          rewardVisual.pos.x + GAME_CONFIG.tile,
          rewardVisual.pos.y + GAME_CONFIG.tile,
          GAME_CONFIG.tile * 1.2,
          GAME_CONFIG.tile * 1.6,
          [255, 235, 150],
          0.2,
        );
      }

      if (t >= 1) {
        transformCtrl.cancel();
        rewardVisual.destroy();
        swapPlayerSprite(choice);
        player.pos = k.vec2(baseX, baseY);
        player.angle = 0;
        player.scale = k.vec2(startScale, startScale);
        player.frame = PLAYER_FRONT_FRAME;
        player.opacity = 1;
        onComplete();
      }
    });
  }

  function openDialogWithLock(pages, options = {}) {
    const { onClose = unlockAfterDialog } = options;
    lockForDialog();
    dialogSystem.openDialog(pages, {
      onClose,
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
        openDialogWithLock(currentLevelDefinition.getGoalDialogPages(), {
          onClose: () => {
            playUnlockTransformation(pendingUnlockedCharacter, () => {
              pendingUnlockedCharacter = null;
              if (typeof level.unlockExitDoor === "function") {
                unlockLevelExitDoor();
              }
              unlockAfterDialog();
            });
          },
        });
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

  function createAttackFlash(x, y, width, height, color, duration = 0.14) {
    const flash = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.rect(width, height),
      k.color(...color),
      k.opacity(0.75),
      k.z(6),
    ]);

    const startTime = k.time();
    const ctrl = flash.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const t = Math.min(1, elapsed / duration);
      flash.opacity = 0.75 * (1 - t);
      flash.scale = k.vec2(1 + t * 0.35, 1 + t * 0.1);

      if (t >= 1) {
        ctrl.cancel();
        flash.destroy();
      }
    });

    return flash;
  }

  function defeatEnemy(enemy) {
    if (!enemy || enemy._defeated) return;
    enemy._defeated = true;

    const center =
      typeof enemy.worldArea === "function"
        ? (() => {
            const bbox = enemy.worldArea().bbox();
            return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
          })()
        : k.vec2(enemy.pos.x, enemy.pos.y);

    createAttackFlash(
      center.x,
      center.y,
      GAME_CONFIG.tile * 0.75,
      GAME_CONFIG.tile * 0.75,
      [255, 214, 120],
      0.18,
    );
    enemy.destroy();
  }

  let meleeCooldown = 0;
  let rangedCooldown = 0;
  const MELEE_STUN_DURATION = 0.3;
  const RANGED_STUN_DURATION = 0.8;

  function applyMeleeHit(enemy, direction) {
    if (!enemy || enemy._defeated) return;

    const now = k.time();
    if ((enemy._meleeHitCooldownUntil ?? 0) > now) return;

    const playerCenter =
      typeof player.worldArea === "function"
        ? (() => {
            const bbox = player.worldArea().bbox();
            return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
          })()
        : k.vec2(player.pos.x, player.pos.y);
    const enemyCenter =
      typeof enemy.worldArea === "function"
        ? (() => {
            const bbox = enemy.worldArea().bbox();
            return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
          })()
        : k.vec2(enemy.pos.x, enemy.pos.y);
    const enemyBbox =
      typeof enemy.worldArea === "function"
        ? enemy.worldArea().bbox()
        : { width: GAME_CONFIG.tile, height: GAME_CONFIG.tile };
    const knockbackDir = enemyCenter.x >= playerCenter.x ? 1 : -1;
    const knockbackDistance = Math.max(enemyBbox.width * 3.5, GAME_CONFIG.tile * 3.5);

    enemy._meleeHitCooldownUntil = now + MELEE_STUN_DURATION;
    enemy._stunnedUntil = now + MELEE_STUN_DURATION;
    enemy._knockbackDir = knockbackDir;
    enemy._resumeDirection = knockbackDir;

    if (enemy.vel) {
      enemy.vel.x = 0;
    }

    enemy.pos.x += knockbackDir * knockbackDistance;

    createAttackFlash(
      enemyCenter.x,
      enemyCenter.y,
      GAME_CONFIG.tile * 0.68,
      GAME_CONFIG.tile * 0.68,
      [255, 214, 120],
      0.12,
    );
  }

  function applyRangedHit(enemy) {
    if (!enemy || enemy._defeated) return;

    const now = k.time();
    const nextStunUntil = now + RANGED_STUN_DURATION;
    enemy._stunnedUntil = Math.max(enemy._stunnedUntil ?? 0, nextStunUntil);

    if (enemy.vel) {
      enemy.vel = k.vec2(0, 0);
    }

    const center =
      typeof enemy.worldArea === "function"
        ? (() => {
            const bbox = enemy.worldArea().bbox();
            return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
          })()
        : k.vec2(enemy.pos.x, enemy.pos.y);

    createAttackFlash(
      center.x,
      center.y,
      GAME_CONFIG.tile * 0.72,
      GAME_CONFIG.tile * 0.72,
      [170, 222, 255],
      0.14,
    );
  }

  function transformEnemyIntoFairy(enemy) {
    if (!enemy || enemy._defeated || enemy._transformedToFairy) return;

    enemy._defeated = true;
    enemy._transformedToFairy = true;

    const center =
      typeof enemy.worldArea === "function"
        ? (() => {
            const bbox = enemy.worldArea().bbox();
            return k.vec2(bbox.pos.x + bbox.width / 2, bbox.pos.y + bbox.height / 2);
          })()
        : k.vec2(enemy.pos.x, enemy.pos.y);

    enemy.destroy();

    const fairy = k.add([
      k.pos(center.x, center.y),
      k.anchor("center"),
      k.sprite("magicFairy"),
      k.scale(1.4),
      k.opacity(0.96),
      k.z(5),
      "magicFairy",
    ]);
    const fairyMarginX = GAME_CONFIG.tile * 1.4;
    const fairyMarginTop = GAME_CONFIG.tile * 1.1;
    const fairyVisibleBandHeight = GAME_CONFIG.tile * 4.5;
    let targetPos = k.vec2(center.x, center.y - GAME_CONFIG.tile * 2);
    let fairySpeed = 88;
    const flutterSeed = Math.random() * Math.PI * 2;

    function getVisibleFairyBounds() {
      const playerCenterX = player.pos.x + player.width / 2;
      const playerCenterY = player.pos.y + player.height / 2;
      const camHalfW = k.width() / (2 * GAME_CONFIG.cameraZoom);
      const camHalfH = k.height() / (2 * GAME_CONFIG.cameraZoom);
      const camMinX = camHalfW;
      const camMaxX = Math.max(camHalfW, level.levelWidth - camHalfW);
      const camX = k.clamp(playerCenterX, camMinX, camMaxX);
      const camMinY = camHalfH;
      const camMaxY = k.height() - camHalfH - 1;
      const baseCamY = k.height() / 2 + GAME_CONFIG.cameraYOffset;
      const targetCamY =
        pipeTraversal.isPipeTraveling() || ropeTraversal.isRopeHanging() || isDebugFlying()
          ? playerCenterY
          : Math.min(baseCamY, playerCenterY + GAME_CONFIG.cameraYOffset);
      const camY = k.clamp(targetCamY, camMinY, camMaxY);

      return {
        minX: camX - camHalfW + fairyMarginX,
        maxX: camX + camHalfW - fairyMarginX,
        minY: camY - camHalfH + fairyMarginTop,
        maxY:
          camY - camHalfH + fairyMarginTop + fairyVisibleBandHeight,
      };
    }

    function pickFairyTarget(initial = false) {
      const bounds = getVisibleFairyBounds();
      const minX = bounds.minX;
      const maxX = Math.max(bounds.minX, bounds.maxX);
      const minY = bounds.minY;
      const maxY = Math.max(bounds.minY, bounds.maxY);
      const nextX = initial
        ? k.clamp(center.x + (Math.random() * 2 - 1) * GAME_CONFIG.tile * 4, minX, maxX)
        : k.rand(minX, maxX);
      const nextY = initial
        ? k.clamp(center.y - GAME_CONFIG.tile * 2, minY, maxY)
        : k.rand(minY, maxY);

      targetPos = k.vec2(nextX, nextY);
      fairySpeed = initial ? 26 : k.rand(54, 92);
    }

    pickFairyTarget(true);

    fairy.onUpdate(() => {
      const bounds = getVisibleFairyBounds();
      const toTarget = targetPos.sub(fairy.pos);
      const distance = toTarget.len();

      if (distance <= 4) {
        pickFairyTarget(false);
      } else {
        const step = Math.min(distance, fairySpeed * k.dt());
        fairy.pos = fairy.pos.add(toTarget.unit().scale(step));
      }

      fairy.pos.x = k.clamp(fairy.pos.x, bounds.minX, Math.max(bounds.minX, bounds.maxX));
      fairy.pos.y = k.clamp(fairy.pos.y, bounds.minY, Math.max(bounds.minY, bounds.maxY));

      const elapsed = k.time();
      fairy.angle = Math.sin(elapsed * 8 + flutterSeed) * 10;
      const flutterScale = 1.32 + (Math.sin(elapsed * 10 + flutterSeed) + 1) * 0.05;
      fairy.scale = k.vec2(flutterScale, flutterScale);
    });
  }

  function doMeleeAttack() {
    if (!canUseAbility()) return;
    if (meleeCooldown > 0) return;

    meleeCooldown = 0.28;
    const direction = player.facingLeft ? -1 : 1;
    const playerBbox = player.worldArea().bbox();
    const meleeVisualInset = 7;
    const meleeVisualYOffset = 5;
    const slashX =
      (direction < 0
        ? playerBbox.pos.x - GAME_CONFIG.tile / 2
        : playerBbox.pos.x + playerBbox.width + GAME_CONFIG.tile / 2) -
      direction * meleeVisualInset;
    const slashY = playerBbox.pos.y + playerBbox.height / 2 + meleeVisualYOffset;
    const slash = k.add([
      k.pos(slashX, slashY),
      k.anchor("center"),
      k.sprite("meleeCelery"),
      k.scale(1.15),
      k.area(),
      k.opacity(0.78),
      k.z(6),
      "playerAttack",
    ]);
    slash.flipX = direction < 0;

    slash.onCollide("enemy", (enemy) => {
      applyMeleeHit(enemy, direction);
    });

    const startTime = k.time();
    const ctrl = slash.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const t = Math.min(1, elapsed / 0.12);
      const uniformScale = 1.15 + t * 0.22;
      slash.scale = k.vec2(uniformScale, uniformScale);
      slash.angle = direction < 0 ? -18 - t * 20 : 18 + t * 20;

      if (t >= 1) {
        ctrl.cancel();
        slash.destroy();
      }
    });
  }

  function doRangedAttack() {
    if (!canUseAbility()) return;
    if (rangedCooldown > 0) return;

    rangedCooldown = 0.32;
    const direction = player.facingLeft ? -1 : 1;
    const projectile = k.add([
      k.pos(
        player.pos.x + (direction < 0 ? -6 : player.width + 6),
        player.pos.y + player.height * 0.44,
      ),
      k.anchor("center"),
      k.sprite("rangedOlivesGreen"),
      k.scale(0.95),
      k.area(),
      k.opacity(0.95),
      k.z(6),
      "playerProjectile",
    ]);
    projectile.flipX = direction < 0;

    projectile.onCollide("enemy", (enemy) => {
      applyRangedHit(enemy);
      projectile.destroy();
    });

    createAttackFlash(
      projectile.pos.x,
      projectile.pos.y,
      GAME_CONFIG.tile * 0.35,
      GAME_CONFIG.tile * 0.35,
      [255, 183, 72],
      0.1,
    );

    const startTime = k.time();
    const ctrl = projectile.onUpdate(() => {
      const elapsed = k.time() - startTime;
      projectile.move(direction * 520, 0);
      projectile.opacity = 0.72 + Math.sin(elapsed * 30) * 0.18;
      projectile.angle = direction < 0 ? -elapsed * 420 : elapsed * 420;
      const projectileScale = 0.95 + Math.sin(elapsed * 16) * 0.04;
      projectile.scale = k.vec2(projectileScale, projectileScale);

      if (elapsed >= 0.6) {
        ctrl.cancel();
        projectile.destroy();
      }
    });
  }

  if (selectedCharacter.ability === "melee") {
    k.onKeyPress("space", doMeleeAttack);
  } else if (selectedCharacter.ability === "ranged") {
    k.onKeyPress("space", doRangedAttack);
  }

  k.onUpdate(() => {
    meleeCooldown = Math.max(0, meleeCooldown - k.dt());
    rangedCooldown = Math.max(0, rangedCooldown - k.dt());
  });

  showHelpLabel(helpText);

  const jumpTriggerKeys =
    selectedCharacter.ability === "melee" || selectedCharacter.ability === "ranged"
      ? ["w", "up"]
      : ["space", "w", "up"];

  jumpTriggerKeys.forEach((key) => {
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
    canDoubleJump: selectedCharacter.ability === "double_jump",
    jumpWithSpace:
      selectedCharacter.ability !== "melee" &&
      selectedCharacter.ability !== "ranged",
    onFallOut: () => {
      if (lives.isGameOver() || lives.isRespawning()) return;
      if (dialogOpen || goalSequenceActive) return;
      if (isDebugFlying()) return;
      lives.damagePlayer();
    },
  });

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
    pendingUnlockedCharacter = getCharacterRewardChoiceForLevel(currentLevelId);
    unlockCharacterForLevel(currentLevelId);
    playGoalCelebrationThenDialog();
  });

  player.onCollide(TAGS.levelExit, () => {
    if (!exitDoorUnlocked || levelExitSequenceActive) return;
    if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
    if (isDebugFlying()) return;
    if (pipeTraversal.isPipeTraveling()) return;
    if (ropeTraversal.isRopeHanging()) return;

    const nextLevelId = NEXT_LEVEL_BY_LEVEL_ID[currentLevelId];
    if (nextLevelId) {
      openCharacterSelectionForNextLevel(nextLevelId);
      return;
    }

    if (currentLevelId === "4") {
      openLevelSelectionHub();
    }
  });

  player.onCollide(TAGS.checkpoint, (checkpoint) => {
    if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
    if (isDebugFlying()) return;
    if (pipeTraversal.isPipeTraveling()) return;
    if (ropeTraversal.isRopeHanging()) return;
    if (!checkpoint?.checkpointId || !checkpoint?.respawnPos) return;

    if (isMagicCharacter()) {
      lives.restoreFullLives();
    }

    if (reachedCheckpointIds.has(checkpoint.checkpointId)) return;

    reachedCheckpointIds.add(checkpoint.checkpointId);
    lives.setRespawnPos(checkpoint.respawnPos);
    playCheckpointActivation(checkpoint);
  });

  player.onCollide("enemy", (enemy) => {
    if (!isMagicCharacter()) return;
    if (lives.isGameOver() || dialogOpen || goalSequenceActive) return;
    if (isDebugFlying()) return;
    if (pipeTraversal.isPipeTraveling()) return;
    if (ropeTraversal.isRopeHanging()) return;
    if (!enemy?.isEnemyActor) return;

    lives.damagePlayer({ respawn: false });
    transformEnemyIntoFairy(enemy);
  });

  player.onCollide(TAGS.hazard, (hazard) => {
    if (dialogOpen || goalSequenceActive) return;
    if (isDebugFlying()) return;
    if (pipeTraversal.isPipeTraveling()) return;
    if (isMagicCharacter() && hazard?.isEnemyActor) return;
    lives.damagePlayer();
  });
}

let destroySelectionScreen = () => {};
const pendingCharacterChoice = getPlayerChoiceById(consumePendingCharacterId());

if (pendingCharacterChoice) {
  startGame(pendingCharacterChoice);
} else {
  destroySelectionScreen = createSelectionScreen((choice, levelId) => {
    destroySelectionScreen();
    setConfiguredLevelId(levelId);
    startGame(choice);
  });
}
