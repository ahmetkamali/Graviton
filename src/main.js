import { initInput, mouse, pollInput } from './input.js';
import { applyGravity, integrate, checkCollision, checkEndZone, isOutOfBounds } from './physics.js';
import {
  clear, drawBackground, drawEndZone, drawAimIndicator, drawShipHandle,
  getHotbar, isOverHotbar, getHoveredFilledSlot,
  drawHotbar, drawDragStar,
} from './renderer.js';
import { initMainMenu, showMainMenu, hideMainMenu } from './ui/mainMenu.js';
import { initLevelSelect, showLevelSelect, hideLevelSelect } from './ui/levelSelect.js';
import { drawPlacementHUD, drawSimulationHUD, showResultOverlay, hideResultOverlay, LAUNCH_BTN } from './ui/hud.js';
import { Ship } from './entities/ship.js';
import { Star } from './entities/star.js';
import { levels } from './data/levels.js';
import { getCompleted, markCompleted } from './data/progression.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 600;

const LAUNCH_SPEED = 250;
const STAR_SPAWN_CLEARANCE = 40;

let gameState = 'MAIN_MENU';
let currentLevel = null;
let ship = null;
let placedStars = [];
let starsLeft = 0;
let aimAngle = 0;
let shipDragging = false;
let drag = { active: false, star: null };
let fixedStars = [];
let lastTime = 0;

function setState(next) {
  gameState = next;
  hideMainMenu();
  hideLevelSelect();
  hideResultOverlay();

  if (next === 'MAIN_MENU') showMainMenu();
  else if (next === 'LEVEL_SELECT') showLevelSelect(getCompleted());
  else if (next === 'LEVEL_COMPLETE' || next === 'LEVEL_FAILED') showResultOverlay(next);
}

function loadLevel(id) {
  currentLevel = levels.find(l => l.id === id);
  canvas.width = currentLevel.canvasWidth;
  canvas.height = currentLevel.canvasHeight;
  placedStars = [];
  fixedStars = currentLevel.fixedObstacles.map(o => new Star(o));
  starsLeft = currentLevel.starsAvailable;
  aimAngle = 0;
  shipDragging = false;
  drag = { active: false, star: null };
  ship = new Ship({ x: currentLevel.ship.x, y: currentLevel.ship.y });
  setState('PLACEMENT');
}

function launch() {
  ship.vx = Math.cos(aimAngle) * LAUNCH_SPEED;
  ship.vy = Math.sin(aimAngle) * LAUNCH_SPEED;
  setState('SIMULATION');
}

function resetLevel() {
  loadLevel(currentLevel.id);
}

function clampAngle(angle, [minDeg, maxDeg]) {
  const min = (minDeg * Math.PI) / 180;
  const max = (maxDeg * Math.PI) / 180;
  return Math.max(min, Math.min(max, angle));
}

function isInsideLaunchBtn(px, py) {
  return px >= LAUNCH_BTN.x && px <= LAUNCH_BTN.x + LAUNCH_BTN.w &&
         py >= LAUNCH_BTN.y && py <= LAUNCH_BTN.y + LAUNCH_BTN.h;
}

function placedStarAtPoint(mx, my) {
  for (let i = 0; i < placedStars.length; i++) {
    const s = placedStars[i];
    const dx = s.x - mx;
    const dy = s.y - my;
    if (Math.sqrt(dx * dx + dy * dy) < s.radius + 6) return i;
  }
  return -1;
}

const SHIP_GRAB_RADIUS = 18;

function isOverShip(mx, my) {
  const dx = mx - ship.x;
  const dy = my - ship.y;
  return Math.sqrt(dx * dx + dy * dy) < SHIP_GRAB_RADIUS;
}

function updatePlacement() {
  const { canvasWidth: w, canvasHeight: h, ship: shipCfg, starsAvailable } = currentLevel;
  const hotbar = getHotbar(w, h, starsAvailable);

  if (mouse.justDown) {
    if (isInsideLaunchBtn(mouse.x, mouse.y)) {
      launch();
      return;
    }

    if (!drag.active && !shipDragging) {
      const filledSlot = getHoveredFilledSlot(mouse.x, mouse.y, hotbar, starsLeft);
      if (filledSlot !== -1) {
        starsLeft--;
        drag = { active: true, star: new Star({ x: mouse.x, y: mouse.y }) };
      } else {
        const starIdx = placedStarAtPoint(mouse.x, mouse.y);
        if (starIdx !== -1) {
          const [removed] = placedStars.splice(starIdx, 1);
          drag = { active: true, star: removed };
        } else if (isOverShip(mouse.x, mouse.y)) {
          shipDragging = true;
        }
      }
    }
  }

  if (shipDragging) {
    const rawAngle = Math.atan2(mouse.y - ship.y, mouse.x - ship.x);
    aimAngle = clampAngle(rawAngle, shipCfg.aimRange);
    if (mouse.justUp) shipDragging = false;
  }

  if (drag.active) {
    drag.star.x = mouse.x;
    drag.star.y = mouse.y;

    if (mouse.justUp) {
      if (isOverHotbar(mouse.x, mouse.y, hotbar)) {
        starsLeft++;
      } else {
        const dx = mouse.x - shipCfg.x;
        const dy = mouse.y - shipCfg.y;
        const tooClose = Math.sqrt(dx * dx + dy * dy) < STAR_SPAWN_CLEARANCE;
        if (tooClose) {
          starsLeft++;
        } else {
          placedStars.push(drag.star);
        }
      }
      drag = { active: false, star: null };
    }
  }
}

function renderPlacement() {
  const { canvasWidth: w, canvasHeight: h, endZone, ship: shipCfg, starsAvailable } = currentLevel;
  const hotbar = getHotbar(w, h, starsAvailable);

  clear(ctx, w, h);
  drawBackground(ctx, w, h);
  drawEndZone(ctx, endZone);

  for (const star of fixedStars) star.draw(ctx);
  for (const star of placedStars) star.draw(ctx);

  ship.draw(ctx);

  const shipHovered = !drag.active && !shipDragging && isOverShip(mouse.x, mouse.y);
  drawShipHandle(ctx, ship, shipHovered || shipDragging);
  drawAimIndicator(ctx, ship, aimAngle, shipCfg.aimRange, shipDragging);

  const hoverSlot = drag.active ? -1 : getHoveredFilledSlot(mouse.x, mouse.y, hotbar, starsLeft);
  const isDragHover = drag.active && isOverHotbar(mouse.x, mouse.y, hotbar);
  drawHotbar(ctx, hotbar, starsLeft, hoverSlot, isDragHover);

  if (drag.active) drawDragStar(ctx, mouse.x, mouse.y, drag.star.radius);

  drawPlacementHUD(ctx);
}

function updateSimulation(dt) {
  const allSources = [...fixedStars, ...placedStars];
  applyGravity(ship, allSources, dt);
  integrate(ship, dt);
  ship.recordTrail();

  if (checkCollision(ship, allSources)) {
    setState('LEVEL_FAILED');
    return;
  }

  if (checkEndZone(ship, currentLevel.endZone)) {
    markCompleted(currentLevel.id);
    setState('LEVEL_COMPLETE');
    return;
  }

  if (isOutOfBounds(ship, currentLevel.canvasWidth, currentLevel.canvasHeight)) {
    setState('LEVEL_FAILED');
  }
}

function renderSimulation() {
  const { canvasWidth: w, canvasHeight: h, endZone } = currentLevel;
  clear(ctx, w, h);
  drawBackground(ctx, w, h);
  drawEndZone(ctx, endZone);
  for (const star of fixedStars) star.draw(ctx);
  for (const star of placedStars) star.draw(ctx);
  ship.draw(ctx);
  drawSimulationHUD(ctx, { ship });
}

function tick(timestamp) {
  if (lastTime === 0) { lastTime = timestamp; requestAnimationFrame(tick); return; }
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  pollInput();

  if (gameState === 'PLACEMENT') {
    updatePlacement();
    renderPlacement();
  } else if (gameState === 'SIMULATION') {
    updateSimulation(dt);
    renderSimulation();
  }

  requestAnimationFrame(tick);
}

initInput(canvas);

initMainMenu({ onPlay: () => setState('LEVEL_SELECT') });

initLevelSelect({
  onSelect: id => loadLevel(id),
  onBack: () => setState('MAIN_MENU'),
});

document.getElementById('retryBtn').addEventListener('click', resetLevel);
document.getElementById('menuBtn').addEventListener('click', () => setState('MAIN_MENU'));

setState('MAIN_MENU');
requestAnimationFrame(tick);
