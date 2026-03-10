export function createPlayer(k, playerStart, jumpForce) {
  return k.add([
    k.pos(playerStart),
    k.sprite("femalePlayer", { anim: "walkRight" }),
    k.scale(2),
    k.area(),
    k.body({ jumpForce }),
  ]);
}

export function setupPlayerMovement(k, player, options) {
  const {
    playerSpeed,
    playerStart,
    levelWidth,
    cameraZoom = 1,
    cameraYOffset = 0,
    isGameOver,
    isRespawning = () => false,
  } = options;
  let facingLeft = false;

  function jumpIfGrounded() {
    if (isGameOver() || isRespawning()) return;
    if (player.isGrounded()) {
      player.jump();
    }
  }

  k.onKeyDown("left", () => {
    if (isGameOver() || isRespawning()) return;
    facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("a", () => {
    if (isGameOver() || isRespawning()) return;
    facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("right", () => {
    if (isGameOver() || isRespawning()) return;
    facingLeft = false;
    player.move(playerSpeed, 0);
  });

  k.onKeyDown("d", () => {
    if (isGameOver() || isRespawning()) return;
    facingLeft = false;
    player.move(playerSpeed, 0);
  });

  k.onKeyPress("space", jumpIfGrounded);
  k.onKeyPress("w", jumpIfGrounded);
  k.onKeyPress("up", jumpIfGrounded);

  player.onUpdate(() => {
    if (isGameOver()) return;

    if (!isRespawning()) {
      player.flipX = false;

      if (!player.isGrounded()) {
        player.stop();
        player.frame = facingLeft ? 7 : 5;
      } else if (Math.abs(player.vel.x) > 8) {
        const walkAnim = facingLeft ? "walkLeft" : "walkRight";
        if (!player.getCurAnim() || player.getCurAnim().name !== walkAnim) {
          player.play(walkAnim);
        }
      } else {
        player.stop();
        player.frame = facingLeft ? 7 : 5;
      }

      if (player.pos.y > k.height() + 120) {
        player.pos = k.vec2(playerStart.x, playerStart.y);
        player.vel = k.vec2(0, 0);
      }

      if (player.pos.x < 0) {
        player.pos.x = 0;
        player.vel.x = 0;
      }

      const maxX = levelWidth - player.width;
      if (player.pos.x > maxX) {
        player.pos.x = maxX;
        player.vel.x = 0;
      }
    }

    k.setCamScale(cameraZoom);

    const camHalfW = k.width() / (2 * cameraZoom);
    const camHalfH = k.height() / (2 * cameraZoom);
    const camMinX = camHalfW;
    const camMaxX = Math.max(camHalfW, levelWidth - camHalfW);
    const camX = k.clamp(player.pos.x, camMinX, camMaxX);

    const camMinY = camHalfH;
    const camMaxY = k.height() - camHalfH - 1;
    const targetCamY = k.height() / 2 + cameraYOffset;
    const camY = k.clamp(targetCamY, camMinY, camMaxY);

    k.setCamPos(camX, camY);
  });
}
