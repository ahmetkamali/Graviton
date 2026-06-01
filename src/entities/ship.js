const TRAIL_MAX  = 60;
const SHIP_RADIUS = 8;

export class Ship {
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = SHIP_RADIUS;
    this.trail  = [];
  }

  recordTrail() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > TRAIL_MAX) this.trail.shift();
  }

  draw(ctx, angle = 0) {
    // Trail — glowing gradient dots
    for (let i = 1; i < this.trail.length; i++) {
      const t = i / this.trail.length;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, t * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 210, 255, ${t * 0.55})`;
      ctx.fill();
    }

    // Ship body — triangle pointing in direction of travel
    const r = this.radius;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    // Outer glow halo
    ctx.beginPath();
    ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.fill();

    // Triangle body
    ctx.beginPath();
    ctx.moveTo(r * 1.9, 0);
    ctx.lineTo(-r, r * 0.85);
    ctx.lineTo(-r * 0.45, 0);
    ctx.lineTo(-r, -r * 0.85);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(-r, 0, r * 1.9, 0);
    bodyGrad.addColorStop(0, '#aaeeff');
    bodyGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.restore();
  }
}
