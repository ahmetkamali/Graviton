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
    const obs = this.isObstacle;

    // Effect radius — dashed ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.effectRadius, 0, Math.PI * 2);
    ctx.strokeStyle = obs ? 'rgba(255,80,80,.13)' : 'rgba(255,200,0,.13)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Outer corona glow
    const corona = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, this.radius * 3.2);
    corona.addColorStop(0, obs ? 'rgba(255,60,60,.3)'  : 'rgba(255,200,0,.25)');
    corona.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 3.2, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    // Core body with radial gradient
    const core = ctx.createRadialGradient(
      this.x - this.radius * 0.28, this.y - this.radius * 0.28, 0,
      this.x, this.y, this.radius
    );
    if (obs) {
      core.addColorStop(0,   '#ffbbbb');
      core.addColorStop(0.5, '#ff4444');
      core.addColorStop(1,   '#bb0000');
    } else {
      core.addColorStop(0,   '#ffeeaa');
      core.addColorStop(0.5, '#ffcc00');
      core.addColorStop(1,   '#dd7700');
    }
    ctx.save();
    ctx.shadowColor = obs ? '#ff4444' : '#ffcc00';
    ctx.shadowBlur  = 18;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();
    ctx.restore();
  }
}
