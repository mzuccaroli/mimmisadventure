export function createPlayer(
  k,
  playerStart,
  jumpForce,
  spriteName = "femalePlayerRed",
) {
  return k.add([
    k.pos(playerStart),
    k.sprite(spriteName, { anim: "walkRight" }),
    k.scale(2),
    k.area(),
    k.opacity(1),
    k.body({ jumpForce }),
    {
      facingLeft: false,
    },
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
    isRopeHanging = () => false,
    isDebugFlying = () => false,
    canDoubleJump = false,
    jumpWithSpace = true,
  } = options;
  let facingLeft = false;
  let wasDebugFlying = false;
  let jumpsUsed = 0;
  let wasGrounded = false;

  function canUseMovementControls() {
    if (
      isGameOver() ||
      isRespawning() ||
      isDialogOpen() ||
      isPipeTraveling() ||
      isRopeHanging()
    ) {
      return false;
    }
    return true;
  }

  function jumpIfPossible() {
    if (!canUseMovementControls()) {
      return;
    }

    if (player.isGrounded()) {
      player.jump();
      jumpsUsed = 1;
      return;
    }

    if (canDoubleJump && jumpsUsed < 2) {
      player.jump();
      jumpsUsed += 1;
    }
  }

  k.onKeyDown("left", () => {
    if (!canUseMovementControls()) {
      return;
    }
    facingLeft = true;
    player.facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("a", () => {
    if (!canUseMovementControls()) {
      return;
    }
    facingLeft = true;
    player.facingLeft = true;
    player.move(-playerSpeed, 0);
  });

  k.onKeyDown("right", () => {
    if (!canUseMovementControls()) {
      return;
    }
    facingLeft = false;
    player.facingLeft = false;
    player.move(playerSpeed, 0);
  });

  k.onKeyDown("d", () => {
    if (!canUseMovementControls()) {
      return;
    }
    facingLeft = false;
    player.facingLeft = false;
    player.move(playerSpeed, 0);
  });

  if (jumpWithSpace) {
    k.onKeyPress("space", jumpIfPossible);
  }
  k.onKeyPress("w", jumpIfPossible);
  k.onKeyPress("up", jumpIfPossible);

  player.onUpdate(() => {
    if (isGameOver()) return;

    const playerCenterX = player.pos.x + player.width / 2;
    const playerCenterY = player.pos.y + player.height / 2;
    const debugFlying = isDebugFlying();
    const grounded = player.isGrounded();

    if (grounded && !wasGrounded) {
      jumpsUsed = 0;
    }
    wasGrounded = grounded;

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

      player.facingLeft = moveX < 0;
      player.frame = moveX < 0 ? 7 : 5;
      player.flipX = false;
    } else if (wasDebugFlying) {
      if (!isRespawning() && !isDialogOpen() && !isPipeTraveling() && !isRopeHanging()) {
        player.isStatic = false;
        player.vel = k.vec2(0, 0);
      }
    }

    if (
      !debugFlying &&
      !isRespawning() &&
      !isDialogOpen() &&
      !isPipeTraveling() &&
      !isRopeHanging()
    ) {
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
    } else if (!debugFlying && (isPipeTraveling() || isRopeHanging())) {
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
    const baseCamY = k.height() / 2 + cameraYOffset;
    const targetCamY =
      isPipeTraveling() || isRopeHanging() || debugFlying
        ? playerCenterY
        : Math.min(baseCamY, playerCenterY + cameraYOffset);
    const camY = k.clamp(targetCamY, camMinY, camMaxY);

    k.setCamPos(camX, camY);
    wasDebugFlying = debugFlying;
  });
}
