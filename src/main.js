import { initInput, mouse, pollInput } from './input.js';
import { applyGravity, integrate, checkCollision, checkEndZone, isOutOfBounds, failsSpeedZone } from './physics.js';
import {
  clear, drawBackground, drawEndZone, drawAimIndicator, drawShipHandle,
  getHotbar, isOverHotbar, getHoveredFilledSlot,
  drawHotbar, drawDragItem,
} from './renderer.js';
import { initMainMenu, showMainMenu, hideMainMenu } from './ui/mainMenu.js';
import { initLevelSelect, showLevelSelect, hideLevelSelect } from './ui/levelSelect.js';
import { drawPlacementHUD, drawSimulationHUD, showResultOverlay, hideResultOverlay, getLaunchBtn } from './ui/hud.js';
import { Ship } from './entities/ship.js';
import { Star } from './entities/star.js';
import { Planet } from './entities/planet.js';
import { SpeedZone } from './entities/speedZone.js';
import { levels } from './data/levels.js';
import { getCompleted, markCompleted } from './data/progression.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 600;

const LAUNCH_SPEED = 250;
const STAR_SPAWN_CLEARANCE = 40;
const PLANET_ATTACH_RADIUS = 6;

let gameState = 'MAIN_MENU';
let currentLevel = null;
let ship = null;
let placedStars = [];
let starsLeft = 0;
let planets = [];
let planetsLeft = 0;
let speedZones = [];
let aimAngle = 0;
let shipDragging = false;
let drag = { active: false, kind: null, obj: null };
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

function attachPlanet(star, startAngle, opts = {}) {
  const ringIndex = planets.filter(p => p.parent === star).length;
  planets.push(new Planet({ parent: star, ringIndex, startAngle, ...opts }));
}

function removePlanet(planet) {
  const parent = planet.parent;
  const idx = planets.indexOf(planet);
  if (idx === -1) return;
  planets.splice(idx, 1);
  planets
    .filter(p => p.parent === parent)
    .forEach((p, i) => { p.ringIndex = i; p.syncPosition(); });
}

function nearestAttachStar(mx, my) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const star of [...fixedStars, ...placedStars]) {
    const dx = mx - star.x;
    const dy = my - star.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < star.effectRadius && dist < nearestDist) {
      nearestDist = dist;
      nearest = star;
    }
  }
  return nearest;
}

function attachedPlanetAtPoint(mx, my) {
  for (const p of planets) {
    if (p.isPredefined) continue;
    const dx = mx - p.x;
    const dy = my - p.y;
    if (Math.sqrt(dx * dx + dy * dy) < p.radius + PLANET_ATTACH_RADIUS) return p;
  }
  return null;
}

function loadLevel(id) {
  currentLevel = levels.find(l => l.id === id);
  canvas.width = currentLevel.canvasWidth ?? 1000;
  canvas.height = 600;

  placedStars = [];
  fixedStars = currentLevel.fixedObstacles.map(o => new Star(o));
  starsLeft = currentLevel.starsAvailable;

  planets = [];
  planetsLeft = currentLevel.planetsAvailable ?? 0;
  currentLevel.fixedObstacles.forEach((obDef, i) => {
    const star = fixedStars[i];
    (obDef.planets ?? []).forEach(pDef => {
      const { startAngle = 0, ...rest } = pDef;
      attachPlanet(star, startAngle, { ...rest, isPredefined: true });
    });
  });

  speedZones = (currentLevel.speedZones ?? []).map(z => new SpeedZone(z));

  aimAngle = 0;
  shipDragging = false;
  drag = { active: false, kind: null, obj: null };
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
  const btn = getLaunchBtn(canvas.width);
  return px >= btn.x && px <= btn.x + btn.w &&
         py >= btn.y && py <= btn.y + btn.h;
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
  const w = canvas.width;
  const h = canvas.height;
  const { ship: shipCfg, starsAvailable, planetsAvailable = 0 } = currentLevel;
  const hotbar = getHotbar(w, h, starsAvailable, planetsAvailable);

  if (mouse.justDown) {
    if (isInsideLaunchBtn(mouse.x, mouse.y)) {
      launch();
      return;
    }

    if (!drag.active && !shipDragging) {
      const hoveredSlot = getHoveredFilledSlot(mouse.x, mouse.y, hotbar, starsLeft, planetsLeft);
      if (hoveredSlot !== null) {
        if (hoveredSlot.group === 'star') {
          starsLeft--;
          drag = { active: true, kind: 'star', obj: new Star({ x: mouse.x, y: mouse.y }) };
        } else {
          planetsLeft--;
          drag = { active: true, kind: 'planet', obj: {} };
        }
      } else {
        const starIdx = placedStarAtPoint(mouse.x, mouse.y);
        if (starIdx !== -1) {
          const [removed] = placedStars.splice(starIdx, 1);
          drag = { active: true, kind: 'star', obj: removed };
        } else {
          const planet = attachedPlanetAtPoint(mouse.x, mouse.y);
          if (planet) {
            const config = {
              angularSpeed: planet.angularSpeed,
              direction: planet.direction,
              radius: planet.radius,
              mass: planet.mass,
              effectRadius: planet.effectRadius,
            };
            removePlanet(planet);
            drag = { active: true, kind: 'planet', obj: config };
          } else if (isOverShip(mouse.x, mouse.y)) {
            shipDragging = true;
          }
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
    if (drag.kind === 'star') {
      drag.obj.x = mouse.x;
      drag.obj.y = mouse.y;
    }

    if (mouse.justUp) {
      if (isOverHotbar(mouse.x, mouse.y, hotbar)) {
        if (drag.kind === 'star') starsLeft++;
        else planetsLeft++;
      } else if (drag.kind === 'star') {
        const dx = mouse.x - shipCfg.x;
        const dy = mouse.y - shipCfg.y;
        const tooClose = Math.sqrt(dx * dx + dy * dy) < STAR_SPAWN_CLEARANCE;
        const overlaps = [...fixedStars, ...placedStars].some(s => {
          const ex = mouse.x - s.x, ey = mouse.y - s.y;
          return Math.sqrt(ex * ex + ey * ey) < drag.obj.radius + s.radius;
        });
        if (tooClose || overlaps) {
          starsLeft++;
        } else {
          placedStars.push(drag.obj);
        }
      } else {
        const target = nearestAttachStar(mouse.x, mouse.y);
        if (target) {
          const startAngle = Math.atan2(mouse.y - target.y, mouse.x - target.x);
          attachPlanet(target, startAngle, drag.obj);
        } else {
          planetsLeft++;
        }
      }
      drag = { active: false, kind: null, obj: null };
    }
  }
}

function renderPlacement() {
  const w = canvas.width;
  const h = canvas.height;
  const { endZone, ship: shipCfg, starsAvailable, planetsAvailable = 0 } = currentLevel;
  const hotbar = getHotbar(w, h, starsAvailable, planetsAvailable);

  clear(ctx, w, h);
  drawBackground(ctx, w, h);
  drawEndZone(ctx, endZone);

  for (const zone of speedZones) zone.draw(ctx);
  for (const star of fixedStars) star.draw(ctx);
  for (const planet of planets) planet.draw(ctx);
  for (const star of placedStars) star.draw(ctx);

  ship.draw(ctx, aimAngle);

  const shipHovered = !drag.active && !shipDragging && isOverShip(mouse.x, mouse.y);
  drawShipHandle(ctx, ship, shipHovered || shipDragging);
  drawAimIndicator(ctx, ship, aimAngle, shipCfg.aimRange, shipDragging);

  const hoverSlot = drag.active ? null : getHoveredFilledSlot(mouse.x, mouse.y, hotbar, starsLeft, planetsLeft);
  const isDragHover = drag.active && isOverHotbar(mouse.x, mouse.y, hotbar);
  drawHotbar(ctx, hotbar, starsLeft, planetsLeft, hoverSlot, isDragHover);

  if (drag.active) {
    const dragRadius = drag.kind === 'star' ? drag.obj.radius : (drag.obj.radius ?? 10);
    drawDragItem(ctx, mouse.x, mouse.y, dragRadius, drag.kind);
  }

  drawPlacementHUD(ctx, w);
}

function updateSimulation(dt) {
  for (const p of planets) p.update(dt);

  const allSources = [...fixedStars, ...placedStars, ...planets];
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

  if (isOutOfBounds(ship, canvas.width, canvas.height)) {
    setState('LEVEL_FAILED');
    return;
  }

  if (failsSpeedZone(ship, speedZones)) {
    setState('LEVEL_FAILED');
  }
}

function renderSimulation() {
  const w = canvas.width;
  const h = canvas.height;
  const { endZone } = currentLevel;
  clear(ctx, w, h);
  drawBackground(ctx, w, h);
  drawEndZone(ctx, endZone);
  for (const zone of speedZones) zone.draw(ctx);
  for (const star of fixedStars) star.draw(ctx);
  for (const planet of planets) planet.draw(ctx);
  for (const star of placedStars) star.draw(ctx);
  const simAngle = (ship.vx !== 0 || ship.vy !== 0) ? Math.atan2(ship.vy, ship.vx) : aimAngle;
  ship.draw(ctx, simAngle);
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
