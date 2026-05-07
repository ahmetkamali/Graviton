export const LAUNCH_BTN = { x: 1090, y: 16, w: 96, h: 36 };

export function drawPlacementHUD(ctx) {
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('Drag ship to aim  ·  Drag stars from bar below', 14, 24);

  const { x, y, w, h } = LAUNCH_BTN;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LAUNCH', x + w / 2, y + 23);
}

export function drawSimulationHUD(ctx, { ship }) {
  const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Speed: ${speed.toFixed(0)}`, 14, 24);
}

export function showResultOverlay(state) {
  document.getElementById('resultMessage').textContent =
    state === 'LEVEL_COMPLETE' ? 'Level Complete!' : 'Level Failed';
  document.getElementById('resultPanel').classList.remove('is-hidden');
}

export function hideResultOverlay() {
  document.getElementById('resultPanel').classList.add('is-hidden');
}
