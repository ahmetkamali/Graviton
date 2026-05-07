export function clear(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

export function drawBackground(ctx, w, h) {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);
}

export function drawEndZone(ctx, endZone) {
  const { x, y, width, height } = endZone;

  ctx.fillStyle = 'rgba(0, 255, 136, 0.07)';
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', x + width / 2, y - 6);
}

export function drawAimIndicator(ctx, ship, aimAngle, aimRange, isDragging = false) {
  const armLen = 55;
  const [minDeg, maxDeg] = aimRange;
  const minRad = (minDeg * Math.PI) / 180;
  const maxRad = (maxDeg * Math.PI) / 180;

  ctx.beginPath();
  ctx.arc(ship.x, ship.y, armLen * 0.75, minRad, maxRad);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const tx = ship.x + Math.cos(aimAngle) * armLen;
  const ty = ship.y + Math.sin(aimAngle) * armLen;
  const headLen = 10;
  const lineColor = isDragging ? 'rgba(255, 220, 80, 0.95)' : 'rgba(255, 255, 255, 0.65)';

  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y);
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = isDragging ? 2.5 : 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headLen * Math.cos(aimAngle - 0.4), ty - headLen * Math.sin(aimAngle - 0.4));
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headLen * Math.cos(aimAngle + 0.4), ty - headLen * Math.sin(aimAngle + 0.4));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = isDragging ? 2.5 : 2;
  ctx.stroke();
}

export function drawShipHandle(ctx, ship, isHovered) {
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, ship.radius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Hotbar ──────────────────────────────────────────────────────────────────

const SLOT_SIZE = 44;
const SLOT_GAP = 10;
const SLOT_PAD_X = 14;
const SLOT_PAD_Y = 8;

export function getHotbar(canvasWidth, canvasHeight, totalSlots) {
  const innerWidth = totalSlots * SLOT_SIZE + (totalSlots - 1) * SLOT_GAP;
  const width = innerWidth + SLOT_PAD_X * 2;
  const height = SLOT_SIZE + SLOT_PAD_Y * 2;
  return {
    x: (canvasWidth - width) / 2,
    y: canvasHeight - height - 10,
    width,
    height,
    totalSlots,
  };
}

export function getHotbarSlot(hotbar, index) {
  return {
    x: hotbar.x + SLOT_PAD_X + index * (SLOT_SIZE + SLOT_GAP),
    y: hotbar.y + SLOT_PAD_Y,
    size: SLOT_SIZE,
  };
}

export function isOverHotbar(mx, my, hotbar) {
  return mx >= hotbar.x && mx <= hotbar.x + hotbar.width &&
         my >= hotbar.y && my <= hotbar.y + hotbar.height;
}

export function getHoveredFilledSlot(mx, my, hotbar, starsLeft) {
  for (let i = 0; i < starsLeft; i++) {
    const s = getHotbarSlot(hotbar, i);
    if (mx >= s.x && mx <= s.x + s.size && my >= s.y && my <= s.y + s.size) return i;
  }
  return -1;
}

export function drawHotbar(ctx, hotbar, starsLeft, hoverSlot = -1, isDragHover = false) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(hotbar.x, hotbar.y, hotbar.width, hotbar.height);

  ctx.strokeStyle = isDragHover ? 'rgba(255, 200, 0, 0.7)' : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = isDragHover ? 2 : 1;
  ctx.strokeRect(hotbar.x, hotbar.y, hotbar.width, hotbar.height);

  for (let i = 0; i < hotbar.totalSlots; i++) {
    const slot = getHotbarSlot(hotbar, i);
    const cx = slot.x + slot.size / 2;
    const cy = slot.y + slot.size / 2;
    const filled = i < starsLeft;
    const hovered = filled && i === hoverSlot;

    ctx.beginPath();
    ctx.arc(cx, cy, slot.size / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = filled
      ? hovered ? 'rgba(255, 210, 0, 0.85)' : 'rgba(255, 200, 0, 0.4)'
      : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (filled) {
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = hovered ? '#ffdd55' : '#ffcc00';
      ctx.fill();
    }
  }
}

export function drawDragStar(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 210, 0, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
}
