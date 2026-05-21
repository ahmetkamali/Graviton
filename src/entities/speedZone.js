export class SpeedZone {
  constructor({ x, y, width, height, minSpeed }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.minSpeed = minSpeed;
  }

  contains(ship) {
    return ship.x >= this.x && ship.x <= this.x + this.width &&
           ship.y >= this.y && ship.y <= this.y + this.height;
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(255, 100, 0, 0.08)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = 'rgba(255, 120, 0, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`≥${this.minSpeed}`, this.x + this.width / 2, this.y - 6);
  }
}
