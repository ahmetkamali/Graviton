const TRAIL_MAX = 60;
const SHIP_RADIUS = 8;

export class Ship {
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = SHIP_RADIUS;
    this.trail = [];
  }

  recordTrail() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_MAX) this.trail.shift();
  }

  draw(ctx) {
    for (let i = 1; i < this.trail.length; i++) {
      const alpha = i / this.trail.length;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.6})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
}
