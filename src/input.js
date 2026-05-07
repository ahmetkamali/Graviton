export const mouse = {
  x: 0, y: 0,
  isDown: false,
  justDown: false,
  justUp: false,
  rightJustDown: false,
};
export const keys = new Set();

let pendingDown = false;
let pendingUp = false;
let pendingRightDown = false;

export function initInput(canvas) {
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) { pendingDown = true; mouse.isDown = true; }
    if (e.button === 2) pendingRightDown = true;
  });

  // window-level so drops outside the canvas boundary are still caught
  window.addEventListener('mouseup', e => {
    if (e.button === 0) { pendingUp = true; mouse.isDown = false; }
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  window.addEventListener('keydown', e => keys.add(e.code));
  window.addEventListener('keyup', e => keys.delete(e.code));
}

export function pollInput() {
  mouse.justDown = pendingDown;
  mouse.justUp = pendingUp;
  mouse.rightJustDown = pendingRightDown;
  pendingDown = false;
  pendingUp = false;
  pendingRightDown = false;
}
