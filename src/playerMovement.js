export function createPlayer(k, playerStart, jumpForce) {
  return k.add([
    k.pos(playerStart),
    k.sprite("femalePlayer", { anim: "walkRight" }),
    k.scale(2),
    k.area(),
    k.opacity(1),
    k.body({ jumpForce }),
  ]);
}

export function setupPlayerMovement(k, player, options) {
  const {
    playerSpeed,
    debugFlySpeed = 900,
    playerStart,
    levelWidth,
    cameraZoom = 1,
    cameraYOffset = 0,
    isGameOver,
    isRespawning = () => false,
    isDialogOpen = () => false,
    isPipeTraveling = () => false,
    isDebugFlying = () => false,
  } = options;
  let facingLeft = false;
  let wasDebugFlying = false;

  function jumpIfGrounded() {
    if (isGameOver() || isRespawning() || isDialogOpen() || isPipeTraveling()) return;
    if (player.isGrounded()) {
      player.jump();
    }
  }

  k.onKeyDown("left", () => {
    if (isGameOver() || isRespawning() || isDialogOpen() || isPipeTraveling()) return;
    facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("a", () => {
    if (isGameOver() || isRespawning() || isDialogOpen() || isPipeTraveling()) return;
    facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("right", () => {
    if (isGameOver() || isRespawning() || isDialogOpen() || isPipeTraveling()) return;
    facingLeft = false;
    player.move(playerSpeed, 0);
  });

  k.onKeyDown("d", () => {
    if (isGameOver() || isRespawning() || isDialogOpen() || isPipeTraveling()) return;
    facingLeft = false;
    player.move(playerSpeed, 0);
  });

  k.onKeyPress("space", jumpIfGrounded);
  k.onKeyPress("w", jumpIfGrounded);
  k.onKeyPress("up", jumpIfGrounded);

  player.onUpdate(() => {
    if (isGameOver()) return;

    const playerCenterX = player.pos.x + player.width / 2;
    const playerCenterY = player.pos.y + player.height / 2;
    const debugFlying = isDebugFlying();

    if (debugFlying) {
      if (!wasDebugFlying) {
        player.stop();
        player.vel = k.vec2(0, 0);
        player.isStatic = true;
      }

      const moveX =
        (k.isKeyDown("right") || k.isKeyDown("d") ? 1 : 0) -
        (k.isKeyDown("left") || k.isKeyDown("a") ? 1 : 0);
      const moveY =
        (k.isKeyDown("down") || k.isKeyDown("s") ? 1 : 0) -
        (k.isKeyDown("up") || k.isKeyDown("w") ? 1 : 0);
      const moveDir = k.vec2(moveX, moveY);

      if (moveDir.len() > 0) {
        const step = moveDir.unit().scale(debugFlySpeed * k.dt());
        player.pos = player.pos.add(step);
      }

      player.frame = moveX < 0 ? 7 : 5;
      player.flipX = false;
    } else if (wasDebugFlying) {
      if (!isRespawning() && !isDialogOpen() && !isPipeTraveling()) {
        player.isStatic = false;
        player.vel = k.vec2(0, 0);
      }
    }

    if (!debugFlying && !isRespawning() && !isDialogOpen() && !isPipeTraveling()) {
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
    } else if (!debugFlying && isPipeTraveling()) {
      player.vel = k.vec2(0, 0);
    }

    k.setCamScale(cameraZoom);

    const camHalfW = k.width() / (2 * cameraZoom);
    const camHalfH = k.height() / (2 * cameraZoom);
    const camMinX = camHalfW;
    const camMaxX = Math.max(camHalfW, levelWidth - camHalfW);
    const camX = k.clamp(playerCenterX, camMinX, camMaxX);

    const camMinY = camHalfH;
    const camMaxY = k.height() - camHalfH - 1;
    const targetCamY = isPipeTraveling()
      ? playerCenterY
      : k.height() / 2 + cameraYOffset;
    const camY = k.clamp(targetCamY, camMinY, camMaxY);

    k.setCamPos(camX, camY);
    wasDebugFlying = debugFlying;
  });
}
