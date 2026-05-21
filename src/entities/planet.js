const RING_BASE_OFFSET = 36;
const RING_SPACING = 32;
const DEFAULT_ANGULAR_SPEED = 0.9;
const DEFAULT_DIRECTION = 1;

export class Planet {
  constructor({
    parent, ringIndex, startAngle,
    angularSpeed = DEFAULT_ANGULAR_SPEED,
    direction = DEFAULT_DIRECTION,
    radius = 10, mass = 3000, effectRadius = 90,
    isPredefined = false,
  }) {
    this.parent = parent;
    this.ringIndex = ringIndex;
    this.angle = startAngle;
    this.angularSpeed = angularSpeed;
    this.direction = direction;
    this.radius = radius;
    this.mass = mass;
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

    ctx.beginPath();
    ctx.arc(this.parent.x, this.parent.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.effectRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#5599ff';
    ctx.fill();
  }
}
