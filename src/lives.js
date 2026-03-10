import { HEART_CAPACITY, getHeartSpriteByLives } from "./serviceTiles.js";

export function setupLivesSystem(k, player, options) {
  const { maxLives, damageCooldown, respawnPos } = options;
  const heartScale = 2;
  const heartSpacing = 52;
  const rightMargin = 24;
  const heartY = 18;
  const totalHearts = Math.ceil(maxLives / HEART_CAPACITY);
  const heartIcons = [];

  let lives = maxLives;
  let canTakeDamage = true;
  let gameOver = false;

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

    k.debug.paused = true;
  }

  function damagePlayer() {
    if (gameOver || !canTakeDamage) return;

    lives -= 1;
    updateLivesDisplay();

    if (lives <= 0) {
      triggerGameOver();
      return;
    }

    canTakeDamage = false;
    player.pos = k.vec2(respawnPos.x, respawnPos.y);
    player.vel = k.vec2(0, 0);
    k.wait(damageCooldown, () => {
      canTakeDamage = true;
    });
  }

  updateLivesDisplay();

  return {
    damagePlayer,
    isGameOver: () => gameOver,
  };
}
