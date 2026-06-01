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
    const cx = this.x + this.width / 2;

    ctx.fillStyle = 'rgba(255, 130, 0, 0.07)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = 'rgba(255, 150, 0, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.setLineDash([]);

    ctx.textAlign = 'center';

    // "SPEED ZONE" label
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(255, 150, 0, 0.65)';
    ctx.fillText('SPEED ZONE', cx, this.y - 20);

    // Minimum speed requirement
    ctx.font = 'bold 12px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(255, 175, 0, 0.95)';
    ctx.fillText(`MIN  ${this.minSpeed}`, cx, this.y - 7);
  }
}
