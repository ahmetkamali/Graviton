export const levels = [
  {
    id: 1,
    name: 'First Light',
    starsAvailable: 2,
    planetsAvailable: 0,
    fixedObstacles: [
      { x: 600, y: 300, mass: 8000, radius: 22, effectRadius: 220, isObstacle: true },
    ],
    speedZones: [],
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
  },
  {
    id: 2,
    name: 'Orbits',
    starsAvailable: 1,
    planetsAvailable: 1,
    fixedObstacles: [
      {
        x: 480, y: 300, mass: 8000, radius: 22, effectRadius: 220, isObstacle: true,
        planets: [{ startAngle: Math.PI }],
      },
    ],
    speedZones: [
      { x: 680, y: 170, width: 80, height: 260, minSpeed: 250 },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-75, 75],
    },
    endZone: {
      x: 880,
      y: 210,
      width: 70,
      height: 180,
    },
  },
];
