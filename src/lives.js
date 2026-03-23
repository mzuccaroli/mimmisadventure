import { HEART_CAPACITY, getHeartSpriteByLives } from "./serviceTiles.js";

export function setupLivesSystem(k, player, options) {
  const { maxLives, damageCooldown, respawnPos, onRespawn } = options;
  const heartScale = 2;
  const heartSpacing = 52;
  const rightMargin = 24;
  const heartY = 18;
  const totalHearts = Math.ceil(maxLives / HEART_CAPACITY);
  const heartIcons = [];

  let lives = maxLives;
  let canTakeDamage = true;
  let gameOver = false;
  let respawning = false;
  let currentRespawnPos = k.vec2(respawnPos.x, respawnPos.y);

  function clearHeartIcons() {
    while (heartIcons.length > 0) {
      const icon = heartIcons.pop();
      icon.destroy();
    }
  }

  function updateLivesDisplay() {
    clearHeartIcons();

    const startX = k.width() - rightMargin;

    for (let i = 0; i < totalHearts; i++) {
      const heartOrderFromLeft = totalHearts - 1 - i;
      const livesForHeart = Math.max(
        0,
        Math.min(HEART_CAPACITY, lives - heartOrderFromLeft * HEART_CAPACITY),
      );
      const sprite = getHeartSpriteByLives(livesForHeart);

      const heartIcon = k.add([
        k.pos(startX - i * heartSpacing, heartY),
        k.anchor("topright"),
        k.sprite(sprite),
        k.scale(heartScale),
        k.fixed(),
        k.z(10),
      ]);

      heartIcons.push(heartIcon);
    }
  }

  function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    player.vel = k.vec2(0, 0);
    player.isStatic = true;

    k.add([
      k.pos(0, 0),
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.opacity(0.6),
      k.fixed(),
      k.z(100),
    ]);

    k.add([
      k.text("GAME OVER", { size: 64 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(220, 40, 40),
      k.fixed(),
      k.z(101),
    ]);

    k.add([
      k.text("Premi N per ricominciare", { size: 26 }),
      k.pos(k.width() / 2, k.height() / 2 + 56),
      k.anchor("center"),
      k.color(245, 245, 245),
      k.fixed(),
      k.z(101),
    ]);

    k.onKeyPress("n", () => {
      window.location.reload();
    });
  }

  function damagePlayer(options = {}) {
    const { respawn = true } = options;
    if (gameOver || !canTakeDamage) return;

    lives -= 1;
    updateLivesDisplay();

    if (lives <= 0) {
      triggerGameOver();
      return;
    }

    canTakeDamage = false;

    if (!respawn) {
      const blinkStartTime = k.time();
      const blinkDuration = Math.max(0.2, damageCooldown * 0.55);
      const blinkCtrl = player.onUpdate(() => {
        const elapsed = k.time() - blinkStartTime;
        player.opacity = 0.45 + Math.sin(elapsed * 30) * 0.2;

        if (elapsed >= blinkDuration) {
          blinkCtrl.cancel();
          player.opacity = 1;
        }
      });

      k.wait(damageCooldown, () => {
        canTakeDamage = true;
      });
      return;
    }

    respawning = true;

    const transitionDuration = Math.min(0.22, damageCooldown * 0.35);
    const cooldownRemainder = Math.max(0, damageCooldown - transitionDuration);
    const spinDirection = player.vel.x < 0 ? -1 : 1;
    const startTime = k.time();
    const frameStepDuration = 0.055;
    const rightSideFrame = 5;
    const leftSideFrame = 7;
    const frontFrame = 6;
    const backFrame = 4;
    const sideFrame = spinDirection < 0 ? leftSideFrame : rightSideFrame;
    const oppositeSideFrame =
      sideFrame === rightSideFrame ? leftSideFrame : rightSideFrame;
    const spinFrames =
      spinDirection > 0
        ? [sideFrame, frontFrame, oppositeSideFrame, backFrame]
        : [sideFrame, backFrame, oppositeSideFrame, frontFrame];

    player.stop();
    player.angle = 0;
    player.vel = k.vec2(95 * spinDirection, -300);

    const transitionCtrl = player.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const t = Math.min(1, elapsed / transitionDuration);
      const spinIndex = Math.floor(elapsed / frameStepDuration) % spinFrames.length;
      player.frame = spinFrames[spinIndex];

      if (t >= 1) {
        transitionCtrl.cancel();
        player.angle = 0;
        player.frame = sideFrame;
        player.pos = k.vec2(currentRespawnPos.x, currentRespawnPos.y);
        player.vel = k.vec2(0, 0);
        if (typeof onRespawn === "function") {
          onRespawn();
        }
        respawning = false;

        k.wait(cooldownRemainder, () => {
          canTakeDamage = true;
        });
      }
    });
  }

  function restoreFullLives() {
    if (gameOver) return;
    lives = maxLives;
    updateLivesDisplay();
  }

  updateLivesDisplay();

  return {
    damagePlayer,
    restoreFullLives,
    isGameOver: () => gameOver,
    isRespawning: () => respawning,
    setRespawnPos: (nextRespawnPos) => {
      currentRespawnPos = k.vec2(nextRespawnPos.x, nextRespawnPos.y);
    },
  };
}
