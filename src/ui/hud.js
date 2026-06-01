export function getLaunchBtn(canvasWidth) {
  return { x: canvasWidth - 118, y: 12, w: 104, h: 38 };
}

export function getMenuBtn() {
  return { x: 14, y: 36, w: 62, h: 22 };
}

export function drawPlacementHUD(ctx, canvasWidth) {
  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
  ctx.fillText('AIM  ·  PLACE  ·  LAUNCH', 14, 28);

  // Menu button
  const mb = getMenuBtn();
  ctx.save();
  ctx.shadowColor = '#ff3355';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(255, 51, 85, 0.08)';
  ctx.beginPath();
  ctx.roundRect(mb.x, mb.y, mb.w, mb.h, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 51, 85, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(mb.x, mb.y, mb.w, mb.h, 3);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ff3355';
  ctx.font = 'bold 10px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MENU', mb.x + mb.w / 2, mb.y + mb.h / 2 + 4);

  // Launch button
  const { x, y, w, h } = getLaunchBtn(canvasWidth);

  ctx.save();
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur  = 14;

  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

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

export function drawSimulationHUD(ctx, { ship }, canvasWidth) {
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

  // End Run button (same slot as Launch)
  const { x, y, w, h } = getLaunchBtn(canvasWidth);
  ctx.save();
  ctx.shadowColor = '#ff3355';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(255, 51, 85, 0.1)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 51, 85, 0.72)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ff3355';
  ctx.font = 'bold 13px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('END RUN', x + w / 2, y + h / 2 + 5);
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
