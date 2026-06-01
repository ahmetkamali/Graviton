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
    effectRadius = 180,
    isPredefined = false,
  }) {
    this.parent       = parent;
    this.ringIndex    = ringIndex;
    this.startAngle   = startAngle;
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
    const color = this.isPredefined ? '#ff4444' : '#5599ff';
    const orbitAlpha = this.isPredefined ? 'rgba(255,80,80,0.25)' : 'rgba(80,160,255,0.25)';
    const effectAlpha = this.isPredefined ? 'rgba(255,80,80,.3)' : 'rgba(80,160,255,.3)';

    // Orbit ring
    ctx.beginPath();
    ctx.arc(this.parent.x, this.parent.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = orbitAlpha;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Effect radius ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.effectRadius, 0, Math.PI * 2);
    ctx.strokeStyle = effectAlpha;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Planet body — flat color with glow
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}
