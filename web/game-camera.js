class GameCamera {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.lookAhead = 0;
  }

  resize(displayWidth, displayHeight, worldWidth, playerCenterX) {
    if (displayWidth <= 0 || displayHeight <= 0) return;
    const scale = displayHeight / this.viewHeight;
    const viewWidth = displayWidth / scale;

    if (Math.abs(viewWidth - this.viewWidth) > 0.1) {
      // Al girar, conserva el encuadre de Kuro dentro de los límites de la escena.
      const anchor = Math.max(.15, Math.min(.85, (playerCenterX - this.x) / this.viewWidth));
      this.x = playerCenterX - viewWidth * anchor;
    }
    this.viewWidth = viewWidth;
    this.scale = scale;
    this.x = this.limitX(this.x, worldWidth);
  }

  limitX(x, worldWidth) {
    return Math.max(0, Math.min(worldWidth - this.viewWidth, x));
  }

  jumpTo(x, y, worldWidth) {
    this.x = this.limitX(x, worldWidth);
    this.y = y;
    this.lookAhead = 0;
  }

  followHorizontal(dt, worldWidth, playerX, direction) {
    this.lookAhead += (direction * 72 - this.lookAhead) * Math.min(1, 3 * dt);
    const focus = playerX + this.lookAhead - this.x;
    const deadzoneX = Math.max(this.viewWidth * .40, Math.min(this.viewWidth * .60, focus));
    const targetX = this.limitX(this.x + focus - deadzoneX, worldWidth);
    this.x += (targetX - this.x) * Math.min(1, 4.5 * dt);
  }
}
