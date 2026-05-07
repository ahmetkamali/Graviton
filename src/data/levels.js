export const levels = [
  {
    id: 1,
    name: 'First Light',
    starsAvailable: 2,
    planetsAvailable: 0,
    fixedObstacles: [
      { x: 600, y: 300, mass: 8000, radius: 22, effectRadius: 220, isObstacle: true },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-40, 40],
    },
    endZone: {
      x: 1080,
      y: 220,
      width: 70,
      height: 160,
    },
    canvasWidth: 1200,
    canvasHeight: 600,
  },
];
