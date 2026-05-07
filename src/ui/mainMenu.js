let _onPlay = null;

export function initMainMenu({ onPlay }) {
  _onPlay = onPlay;
  document.getElementById('playBtn').addEventListener('click', () => _onPlay?.());
}

export function showMainMenu() {
  document.getElementById('mainMenuPanel').classList.remove('is-hidden');
}

export function hideMainMenu() {
  document.getElementById('mainMenuPanel').classList.add('is-hidden');
}
