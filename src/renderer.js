// Pre-generated starfield (runs once at import; fixed per page load)
const STAR_FIELD = Array.from({ length: 100 }, () => ({
  rx: Math.random(),
  ry: Math.random(),
  r:  Math.random() < 0.12 ? 1.5 : Math.random() < 0.35 ? 1.1 : 0.7,
  a:  0.28 + Math.random() * 0.72,
}));

export function clear(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

export function drawBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#010314');
  grad.addColorStop(1, '#02030b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (const s of STAR_FIELD) {
    ctx.beginPath();
    ctx.arc(s.rx * w, s.ry * h, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  }
}

export function drawEndZone(ctx, endZone) {
  const { x, y, width, height } = endZone;

  ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
  ctx.fillRect(x, y, width, height);

  ctx.save();
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();

  ctx.fillStyle = 'rgba(0, 255, 136, 0.95)';
  ctx.font = 'bold 11px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', x + width / 2, y - 7);
}

export function drawAimIndicator(ctx, ship, aimAngle, aimRange, isDragging = false) {
  const armLen = 55;
  const [minDeg, maxDeg] = aimRange;
  const minRad = (minDeg * Math.PI) / 180;
  const maxRad = (maxDeg * Math.PI) / 180;

  ctx.beginPath();
  ctx.arc(ship.x, ship.y, armLen * 0.75, minRad, maxRad);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const tx = ship.x + Math.cos(aimAngle) * armLen;
  const ty = ship.y + Math.sin(aimAngle) * armLen;
  const headLen = 10;
  const lineColor = isDragging ? 'rgba(255, 220, 80, 0.95)' : 'rgba(0, 229, 255, 0.7)';

  ctx.save();
  if (isDragging) { ctx.shadowColor = '#ffdc50'; ctx.shadowBlur = 6; }
  else            { ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 4; }

  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y);
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = isDragging ? 2.5 : 1.8;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headLen * Math.cos(aimAngle - 0.4), ty - headLen * Math.sin(aimAngle - 0.4));
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headLen * Math.cos(aimAngle + 0.4), ty - headLen * Math.sin(aimAngle + 0.4));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = isDragging ? 2.5 : 1.8;
  ctx.stroke();

  ctx.restore();
}

export function drawShipHandle(ctx, ship, isHovered) {
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, ship.radius + 10, 0, Math.PI * 2);
  ctx.strokeStyle = isHovered ? 'rgba(0, 229, 255, 0.45)' : 'rgba(0, 229, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ─── Hotbar ──────────────────────────────────────────────────────────────────

const SLOT_SIZE = 44;
const SLOT_GAP  = 10;
const SLOT_PAD_X = 14;
const SLOT_PAD_Y = 8;
const DIVIDER_GAP = 20;

export function getHotbar(canvasWidth, canvasHeight, starSlots, planetSlots = 0) {
  const starGroupWidth   = starSlots   > 0 ? starSlots   * SLOT_SIZE + (starSlots   - 1) * SLOT_GAP : 0;
  const planetGroupWidth = planetSlots > 0 ? planetSlots * SLOT_SIZE + (planetSlots - 1) * SLOT_GAP : 0;
  const hasPlanets = planetSlots > 0;
  const innerWidth = starGroupWidth + (hasPlanets ? DIVIDER_GAP : 0) + planetGroupWidth;
  const width  = innerWidth + SLOT_PAD_X * 2;
  const height = SLOT_SIZE + SLOT_PAD_Y * 2;
  const x = (canvasWidth - width) / 2;
  const y = canvasHeight - height - 10;
  const starGroupX   = x + SLOT_PAD_X;
  const planetGroupX = hasPlanets ? x + SLOT_PAD_X + starGroupWidth + DIVIDER_GAP : null;
  const dividerX     = hasPlanets ? x + SLOT_PAD_X + starGroupWidth + DIVIDER_GAP / 2 : null;

  return { x, y, width, height, starSlots, planetSlots, hasPlanets, starGroupX, planetGroupX, dividerX };
}

export function getHotbarSlot(hotbar, group, index) {
  const startX = group === 'planet' ? hotbar.planetGroupX : hotbar.starGroupX;
  return { x: startX + index * (SLOT_SIZE + SLOT_GAP), y: hotbar.y + SLOT_PAD_Y, size: SLOT_SIZE };
}

export function isOverHotbar(mx, my, hotbar) {
  return mx >= hotbar.x && mx <= hotbar.x + hotbar.width &&
         my >= hotbar.y && my <= hotbar.y + hotbar.height;
}

export function getHoveredFilledSlot(mx, my, hotbar, starsLeft, planetsLeft = 0) {
  for (let i = 0; i < starsLeft; i++) {
    const s = getHotbarSlot(hotbar, 'star', i);
    if (mx >= s.x && mx <= s.x + s.size && my >= s.y && my <= s.y + s.size) return { group: 'star', index: i };
  }
  if (hotbar.hasPlanets) {
    for (let i = 0; i < planetsLeft; i++) {
      const s = getHotbarSlot(hotbar, 'planet', i);
      if (mx >= s.x && mx <= s.x + s.size && my >= s.y && my <= s.y + s.size) return { group: 'planet', index: i };
    }
  }
  return null;
}

export function drawHotbar(ctx, hotbar, starsLeft, planetsLeft = 0, hoverSlot = null, isDragHover = false) {
  const { x, y, width, height } = hotbar;

  ctx.fillStyle = 'rgba(4, 8, 28, 0.72)';
  ctx.fillRect(x, y, width, height);

  ctx.save();
  ctx.shadowColor = isDragHover ? '#ffcc00' : '#00e5ff';
  ctx.shadowBlur  = isDragHover ? 10 : 5;
  ctx.strokeStyle = isDragHover ? 'rgba(255,200,0,.75)' : 'rgba(0,229,255,.3)';
  ctx.lineWidth   = isDragHover ? 1.5 : 1;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();

  // Star slots
  for (let i = 0; i < hotbar.starSlots; i++) {
    const slot   = getHotbarSlot(hotbar, 'star', i);
    const cx     = slot.x + slot.size / 2;
    const cy     = slot.y + slot.size / 2;
    const filled = i < starsLeft;
    const hovered = filled && hoverSlot?.group === 'star' && hoverSlot?.index === i;

    ctx.beginPath();
    ctx.arc(cx, cy, slot.size / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = filled
      ? (hovered ? 'rgba(255,210,0,.9)' : 'rgba(255,200,0,.4)')
      : 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (filled) {
      ctx.save();
      if (hovered) { ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 10; }
      const g = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 12);
      g.addColorStop(0, '#ffeeaa');
      g.addColorStop(0.6, hovered ? '#ffdd55' : '#ffcc00');
      g.addColorStop(1, '#ff9900');
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
  }

  // Divider
  if (hotbar.hasPlanets) {
    ctx.beginPath();
    ctx.moveTo(hotbar.dividerX, hotbar.y + 10);
    ctx.lineTo(hotbar.dividerX, hotbar.y + height - 10);
    ctx.strokeStyle = 'rgba(0,229,255,.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Planet slots
    for (let i = 0; i < hotbar.planetSlots; i++) {
      const slot   = getHotbarSlot(hotbar, 'planet', i);
      const cx     = slot.x + slot.size / 2;
      const cy     = slot.y + slot.size / 2;
      const filled = i < planetsLeft;
      const hovered = filled && hoverSlot?.group === 'planet' && hoverSlot?.index === i;

      ctx.beginPath();
      ctx.arc(cx, cy, slot.size / 2 - 4, 0, Math.PI * 2);
      ctx.strokeStyle = filled
        ? (hovered ? 'rgba(100,180,255,.9)' : 'rgba(80,160,255,.4)')
        : 'rgba(255,255,255,.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (filled) {
        ctx.save();
        if (hovered) { ctx.shadowColor = '#5599ff'; ctx.shadowBlur = 10; }
        const g = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 12);
        g.addColorStop(0, '#aaddff');
        g.addColorStop(0.6, hovered ? '#88bbff' : '#5599ff');
        g.addColorStop(1, '#2255cc');
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

export function drawDragItem(ctx, x, y, radius, kind) {
  const isPlanet = kind === 'planet';
  ctx.save();
  ctx.shadowColor = isPlanet ? '#5599ff' : '#ffcc00';
  ctx.shadowBlur  = 14;
  const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  if (isPlanet) {
    g.addColorStop(0, 'rgba(170,221,255,.65)');
    g.addColorStop(1, 'rgba(40,80,200,.5)');
  } else {
    g.addColorStop(0, 'rgba(255,238,170,.65)');
    g.addColorStop(1, 'rgba(200,130,0,.5)');
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = isPlanet ? 'rgba(100,180,255,.9)' : 'rgba(255,210,0,.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
