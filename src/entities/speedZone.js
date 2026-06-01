export class SpeedZone {
  constructor({ x, y, width, height, minSpeed }) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
    this.minSpeed = minSpeed;
  }

  contains(ship) {
    return ship.x >= this.x && ship.x <= this.x + this.width &&
           ship.y >= this.y && ship.y <= this.y + this.height;
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(255, 130, 0, 0.06)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = 'rgba(255, 150, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`MIN ${this.minSpeed}`, this.x + this.width / 2, this.y - 7);
  }
}
