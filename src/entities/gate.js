export class Gate {
  constructor({ x, y, width = 10, height = 80, minSpeed = null, maxSpeed = null }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
  }

  update(_dt) {}

  draw(ctx) {
    ctx.fillStyle = '#00ffaa';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
