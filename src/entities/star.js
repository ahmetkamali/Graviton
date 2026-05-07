export class Star {
  constructor({ x, y, mass = 8000, radius = 22, effectRadius = 220, isObstacle = false }) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.radius = radius;
    this.effectRadius = effectRadius;
    this.isObstacle = isObstacle;
  }

  update(_dt) {}

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.effectRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isObstacle ? '#ff4444' : '#ffcc00';
    ctx.fill();
  }
}
