const RING_BASE_OFFSET      = 36;
const RING_SPACING          = 32;
const DEFAULT_ANGULAR_SPEED = 0.9;
const DEFAULT_DIRECTION     = 1;

export class Planet {
  constructor({
    parent, ringIndex, startAngle,
    angularSpeed = DEFAULT_ANGULAR_SPEED,
    direction    = DEFAULT_DIRECTION,
    radius       = 10,
    mass         = 3000,
    effectRadius = 90,
    isPredefined = false,
  }) {
    this.parent       = parent;
    this.ringIndex    = ringIndex;
    this.angle        = startAngle;
    this.angularSpeed = angularSpeed;
    this.direction    = direction;
    this.radius       = radius;
    this.mass         = mass;
    this.effectRadius = effectRadius;
    this.isPredefined = isPredefined;
    this.syncPosition();
  }

  ringRadius() {
    return this.parent.radius + RING_BASE_OFFSET + this.ringIndex * RING_SPACING;
  }

  syncPosition() {
    const r = this.ringRadius();
    this.x = this.parent.x + Math.cos(this.angle) * r;
    this.y = this.parent.y + Math.sin(this.angle) * r;
  }

  update(dt) {
    this.angle += this.direction * this.angularSpeed * dt;
    this.syncPosition();
  }

  draw(ctx) {
    const r = this.ringRadius();

    // Orbit ring — subtle dashed
    ctx.beginPath();
    ctx.arc(this.parent.x, this.parent.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80, 160, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Effect radius ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.effectRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(80,160,255,.13)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Planet body — flat color with glow
    ctx.save();
    ctx.shadowColor = '#5599ff';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#5599ff';
    ctx.fill();
    ctx.restore();
  }
}
