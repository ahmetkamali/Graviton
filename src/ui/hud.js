export function getLaunchBtn(canvasWidth) {
  return { x: canvasWidth - 118, y: 12, w: 104, h: 38 };
}

export function drawPlacementHUD(ctx, canvasWidth) {
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
  ctx.fillText('AIM  ·  PLACE  ·  LAUNCH', 14, 28);

  const { x, y, w, h } = getLaunchBtn(canvasWidth);

  ctx.save();
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur  = 14;

  // Background
  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.72)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.stroke();

  ctx.restore();

  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 13px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LAUNCH', x + w / 2, y + h / 2 + 5);
}

export function drawSimulationHUD(ctx, { ship }) {
  const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  const color = speed > 350 ? '#ffcc00' : '#00e5ff';

  ctx.fillStyle = 'rgba(4, 8, 28, 0.6)';
  ctx.fillRect(10, 10, 148, 30);

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 148, 30);

  ctx.font = '12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.fillText(`SPEED  ${speed.toFixed(0)}`, 20, 30);
}

export function showResultOverlay(state) {
  const isComplete = state === 'LEVEL_COMPLETE';
  const msg = document.getElementById('resultMessage');
  msg.textContent = isComplete ? 'Level Complete!' : 'Level Failed';
  msg.classList.toggle('is-failure', !isComplete);
  // Restart the CSS animation on re-show
  msg.style.animation = 'none';
  void msg.offsetWidth;
  msg.style.animation = '';
  document.getElementById('retryBtn').textContent = isComplete ? 'Next' : 'Retry';
  document.getElementById('resultPanel').classList.remove('is-hidden');
}

export function hideResultOverlay() {
  document.getElementById('resultPanel').classList.add('is-hidden');
}
