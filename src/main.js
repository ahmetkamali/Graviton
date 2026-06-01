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
const slider = document.getElementById('placementScroll');

const VIEWPORT_WIDTH  = 1200;
const VIEWPORT_HEIGHT = 600;

canvas.width  = VIEWPORT_WIDTH;
canvas.height = VIEWPORT_HEIGHT;

const camera = { x: 0 };
let worldWidth = VIEWPORT_WIDTH;

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
let explosion = null;

function setState(next) {
  gameState = next;
  hideMainMenu();
  hideLevelSelect();
  hideResultOverlay();
  slider.classList.add('is-hidden');

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
  worldWidth = currentLevel.canvasWidth ?? 1000;
  canvas.width  = Math.min(worldWidth, VIEWPORT_WIDTH);
  canvas.height = VIEWPORT_HEIGHT;
  camera.x = 0;

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

  if (worldWidth > canvas.width) {
    slider.max   = worldWidth - canvas.width;
    slider.value = 0;
    slider.style.width = canvas.width + 'px';
    slider.classList.remove('is-hidden');
  }
}

function launch() {
  ship.vx = Math.cos(aimAngle) * LAUNCH_SPEED;
  ship.vy = Math.sin(aimAngle) * LAUNCH_SPEED;
  setState('SIMULATION');
}

function resetLevel() {
  loadLevel(currentLevel.id);
}

function triggerExplosion(x, y) {
  const ex = Math.max(8, Math.min(worldWidth - 8, x));
  const ey = Math.max(8, Math.min(canvas.height - 8, y));
  explosion = {
    x: ex, y: ey, elapsed: 0, flash: 1,
    particles: Array.from({ length: 24 }, () => {
      const a = Math.random() * Math.PI * 2;
      const s = 50 + Math.random() * 160;
      return { x: ex, y: ey, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
               r: 2 + Math.random() * 4, life: 1, decay: 0.6 + Math.random() * 0.7 };
    }),
  };
  gameState = 'EXPLODING';
}

function softReset() {
  for (const p of planets) {
    if (p.isPredefined) { p.angle = p.startAngle; p.syncPosition(); }
  }
  const playerPlanets = planets.filter(p => !p.isPredefined);
  starsLeft   = currentLevel.starsAvailable - placedStars.length;
  planetsLeft = (currentLevel.planetsAvailable ?? 0) - playerPlanets.length;
  aimAngle    = 0;
  shipDragging = false;
  drag = { active: false, kind: null, obj: null };
  ship = new Ship({ x: currentLevel.ship.x, y: currentLevel.ship.y });
  camera.x = 0;
  slider.value = 0;
  if (worldWidth > canvas.width) slider.classList.remove('is-hidden');
  hideResultOverlay();
  gameState = 'PLACEMENT';
}

function nextLevel() {
  const idx = levels.findIndex(l => l.id === currentLevel.id);
  const next = levels[idx + 1];
  if (next) loadLevel(next.id);
  else setState('MAIN_MENU');
}

function updateExplosion(dt) {
  explosion.elapsed += dt;
  explosion.flash = Math.max(0, 1 - explosion.elapsed * 5);
  for (const p of explosion.particles) {
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    p.vy += 40 * dt;
    p.life -= p.decay * dt;
  }
  explosion.particles = explosion.particles.filter(p => p.life > 0);
  if (explosion.elapsed >= 1) {
    explosion = null;
    setState('LEVEL_FAILED');
  }
}

function renderExplosion() {
  const w = canvas.width;
  const h = canvas.height;
  clear(ctx, w, h);
  drawBackground(ctx, w, h);

  ctx.save();
  ctx.translate(-camera.x, 0);
  drawEndZone(ctx, currentLevel.endZone);
  for (const zone of speedZones) zone.draw(ctx);
  for (const star of fixedStars) star.draw(ctx);
  for (const planet of planets) planet.draw(ctx);
  for (const star of placedStars) star.draw(ctx);

  if (explosion.flash > 0) {
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, (1 - explosion.flash) * 55 + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${explosion.flash * 0.4})`;
    ctx.fill();
  }

  ctx.save();
  ctx.shadowBlur = 8;
  for (const p of explosion.particles) {
    const a = Math.max(0, p.life);
    const g = Math.floor(160 * p.life);
    ctx.shadowColor = `rgba(255,${g},50,${a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.r * a), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${g},50,${a})`;
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
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
  const wmx = mouse.x + camera.x;  // world-space mouse x
  const wmy = mouse.y;             // y axis never scrolls

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
          drag = { active: true, kind: 'star', obj: new Star({ x: wmx, y: wmy }) };
        } else {
          planetsLeft--;
          drag = { active: true, kind: 'planet', obj: {} };
        }
      } else {
        const starIdx = placedStarAtPoint(wmx, wmy);
        if (starIdx !== -1) {
          const [removed] = placedStars.splice(starIdx, 1);
          drag = { active: true, kind: 'star', obj: removed };
        } else {
          const planet = attachedPlanetAtPoint(wmx, wmy);
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
          } else if (isOverShip(wmx, wmy)) {
            shipDragging = true;
          }
        }
      }
    }
  }

  if (shipDragging) {
    const rawAngle = Math.atan2(wmy - ship.y, wmx - ship.x);
    aimAngle = clampAngle(rawAngle, shipCfg.aimRange);
    if (mouse.justUp) shipDragging = false;
  }

  if (drag.active) {
    if (drag.kind === 'star') {
      drag.obj.x = wmx;
      drag.obj.y = wmy;
    }

    if (mouse.justUp) {
      if (isOverHotbar(mouse.x, mouse.y, hotbar)) {
        if (drag.kind === 'star') starsLeft++;
        else planetsLeft++;
      } else if (drag.kind === 'star') {
        const dx = wmx - shipCfg.x;
        const dy = wmy - shipCfg.y;
        const tooClose = Math.sqrt(dx * dx + dy * dy) < STAR_SPAWN_CLEARANCE;
        const overlaps = [...fixedStars, ...placedStars].some(s => {
          const ex = wmx - s.x, ey = wmy - s.y;
          return Math.sqrt(ex * ex + ey * ey) < drag.obj.radius + s.radius;
        });
        if (tooClose || overlaps) {
          starsLeft++;
        } else {
          placedStars.push(drag.obj);
        }
      } else {
        const target = nearestAttachStar(wmx, wmy);
        if (target) {
          const startAngle = Math.atan2(wmy - target.y, wmx - target.x);
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
  const wmx = mouse.x + camera.x;

  clear(ctx, w, h);
  drawBackground(ctx, w, h);

  ctx.save();
  ctx.translate(-camera.x, 0);

  drawEndZone(ctx, endZone);
  for (const zone of speedZones) zone.draw(ctx);
  for (const star of fixedStars) star.draw(ctx);
  for (const planet of planets) planet.draw(ctx);
  for (const star of placedStars) star.draw(ctx);
  ship.draw(ctx, aimAngle);
  const shipHovered = !drag.active && !shipDragging && isOverShip(wmx, mouse.y);
  drawShipHandle(ctx, ship, shipHovered || shipDragging);
  drawAimIndicator(ctx, ship, aimAngle, shipCfg.aimRange, shipDragging);

  ctx.restore();

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

  camera.x = Math.max(0, Math.min(worldWidth - canvas.width, ship.x - canvas.width / 2));

  if (checkCollision(ship, allSources)) {
    triggerExplosion(ship.x, ship.y);
    return;
  }

  if (checkEndZone(ship, currentLevel.endZone)) {
    markCompleted(currentLevel.id);
    setState('LEVEL_COMPLETE');
    return;
  }

  if (isOutOfBounds(ship, worldWidth, canvas.height)) {
    triggerExplosion(ship.x, ship.y);
    return;
  }

  if (failsSpeedZone(ship, speedZones)) {
    triggerExplosion(ship.x, ship.y);
  }
}

function renderSimulation() {
  const w = canvas.width;
  const h = canvas.height;
  const { endZone } = currentLevel;
  clear(ctx, w, h);
  drawBackground(ctx, w, h);

  ctx.save();
  ctx.translate(-camera.x, 0);
  drawEndZone(ctx, endZone);
  for (const zone of speedZones) zone.draw(ctx);
  for (const star of fixedStars) star.draw(ctx);
  for (const planet of planets) planet.draw(ctx);
  for (const star of placedStars) star.draw(ctx);
  const simAngle = (ship.vx !== 0 || ship.vy !== 0) ? Math.atan2(ship.vy, ship.vx) : aimAngle;
  ship.draw(ctx, simAngle);
  ctx.restore();

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
  } else if (gameState === 'EXPLODING') {
    updateExplosion(dt);
    if (explosion) renderExplosion();
  }

  requestAnimationFrame(tick);
}

initInput(canvas);
slider.addEventListener('input', () => { camera.x = Number(slider.value); });

initMainMenu({ onPlay: () => setState('LEVEL_SELECT') });

initLevelSelect({
  onSelect: id => loadLevel(id),
  onBack: () => setState('MAIN_MENU'),
});

document.getElementById('retryBtn').addEventListener('click', () => {
  if (gameState === 'LEVEL_COMPLETE') nextLevel();
  else softReset();
});
document.getElementById('menuBtn').addEventListener('click', () => setState('MAIN_MENU'));

setState('MAIN_MENU');
requestAnimationFrame(tick);
