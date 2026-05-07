const G = 150;
const SOFTENING_SQ = 400;

export function applyGravity(ship, sources, dt) {
  for (const src of sources) {
    const dx = src.x - ship.x;
    const dy = src.y - ship.y;
    const rawDistSq = dx * dx + dy * dy;
    if (src.effectRadius !== undefined && rawDistSq > src.effectRadius * src.effectRadius) continue;
    const distSq = rawDistSq + SOFTENING_SQ;
    const dist = Math.sqrt(distSq);
    const accel = (G * src.mass) / distSq;
    ship.vx += (accel * dx / dist) * dt;
    ship.vy += (accel * dy / dist) * dt;
  }
}

export function integrate(ship, dt) {
  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
}

export function checkCollision(ship, sources) {
  for (const src of sources) {
    const dx = src.x - ship.x;
    const dy = src.y - ship.y;
    if (Math.sqrt(dx * dx + dy * dy) < src.radius + ship.radius) return true;
  }
  return false;
}

export function checkEndZone(ship, endZone) {
  return (
    ship.x >= endZone.x &&
    ship.x <= endZone.x + endZone.width &&
    ship.y >= endZone.y &&
    ship.y <= endZone.y + endZone.height
  );
}

export function isOutOfBounds(ship, w, h) {
  const margin = 200;
  return ship.x < -margin || ship.x > w + margin || ship.y < -margin || ship.y > h + margin;
}
