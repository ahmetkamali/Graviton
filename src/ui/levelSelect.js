import { levels } from '../data/levels.js';

let _onSelect = null;
let _onBack = null;

export function initLevelSelect({ onSelect, onBack }) {
  _onSelect = onSelect;
  _onBack = onBack;
  document.getElementById('backFromLevelsBtn').addEventListener('click', () => _onBack?.());
}

export function showLevelSelect(completedIds = new Set()) {
  buildCards(completedIds);
  document.getElementById('levelSelectPanel').classList.remove('is-hidden');
}

export function hideLevelSelect() {
  document.getElementById('levelSelectPanel').classList.add('is-hidden');
}

function buildCards(completedIds) {
  const grid = document.getElementById('levelGrid');
  grid.innerHTML = '';

  for (const level of levels) {
    const btn = document.createElement('button');
    btn.className = 'level-card';
    if (completedIds.has(level.id)) btn.classList.add('is-completed');
    btn.textContent = `${level.id}. ${level.name}`;
    btn.addEventListener('click', () => _onSelect?.(level.id));
    grid.appendChild(btn);
  }
}
