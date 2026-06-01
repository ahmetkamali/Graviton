export const levels = [
  {
    id: 1,
    name: 'Stars',
    starsAvailable: 2,
    planetsAvailable: 0,
    fixedObstacles: [
      { x: 600, y: 300, isObstacle: true },
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
      y: 175,
      width: 70,
      height: 250,
    },
    canvasWidth: 1200,
  },
  {
    id: 2,
    name: 'Zones',
    starsAvailable: 2,
    planetsAvailable: 0,
    fixedObstacles: [
      {x: 480, y: 300, isObstacle: true },
    ],
    speedZones: [
      { x: 680, y: 170, width: 80, height: 260, minSpeed: 255 },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-75, 75],
    },
    endZone: {
      x: 880,
      y: 175,
      width: 70,
      height: 250,
    },
  },
  {
    id: 3,
    name: 'Planets',
    starsAvailable: 0,
    planetsAvailable: 1,
    canvasWidth: 1400,
    fixedObstacles: [
      {x: 480, y: 300, isObstacle: true,
        planets: [{ startAngle: -Math.PI }],
	  },
    ],
    speedZones: [
		  { x: 1000, y: 170, width: 80, height: 260, minSpeed: 255 },
	],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-75, 75],
    },
    endZone: {
      x: 1260,
      y: 160,
      width: 70,
      height: 280,
    },
  },
  {
    id: 4,
    name: 'Crossfire',
    starsAvailable: 2,
    planetsAvailable: 0,
    canvasWidth: 1200,
    fixedObstacles: [
      { x: 600, y: 300, isObstacle: true },
    ],
    speedZones: [],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-8, 8],
    },
    endZone: {
      x: 1060,
      y: 30,
      width: 80,
      height: 130,
    },
  },
  {
    id: 5,
    name: 'Slingshot',
    starsAvailable: 1,
    planetsAvailable: 1,
    canvasWidth: 1500,
    fixedObstacles: [
      { x: 550, y: 300, isObstacle: true },
    ],
    speedZones: [],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-5, 5],
    },
    endZone: {
      x: 1390,
      y: 50,
      width: 70,
      height: 110,
    },
  },
  {
    id: 6,
    name: 'Twin Suns',
    starsAvailable: 2,
    planetsAvailable: 1,
    canvasWidth: 2000,
    fixedObstacles: [
      { x: 560, y: 180, isObstacle: true },
      { x: 1100, y: 420, isObstacle: true },
    ],
    speedZones: [
      { x: 1600, y: 140, width: 80, height: 300, minSpeed: 245 },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-35, 35],
    },
    endZone: {
      x: 1880,
      y: 160,
      width: 70,
      height: 280,
    },
  },
  {
    id: 7,
    name: 'Captured Orbit',
    starsAvailable: 2,
    planetsAvailable: 2,
    canvasWidth: 2800,
    fixedObstacles: [
      {
        x: 700, y: 300, isObstacle: true,
        planets: [{ startAngle: 0 }, { startAngle: Math.PI }],
      },
      { x: 1700, y: 200, isObstacle: true },
    ],
    speedZones: [
      { x: 1280, y: 380, width: 80, height: 180, minSpeed: 240 },
      { x: 2260, y: 160, width: 80, height: 280, minSpeed: 260 },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-30, 30],
    },
    endZone: {
      x: 2680,
      y: 160,
      width: 70,
      height: 280,
    },
  },
  {
    id: 8,
    name: 'The Long Haul',
    starsAvailable: 3,
    planetsAvailable: 2,
    canvasWidth: 4200,
    fixedObstacles: [
      { x: 650, y: 300, isObstacle: true },
      {
        x: 1700, y: 200, isObstacle: true,
        planets: [{ startAngle: -Math.PI / 2 }],
      },
      { x: 2900, y: 380, isObstacle: true },
    ],
    speedZones: [
      { x: 1100, y: 160, width: 80, height: 280, minSpeed: 250 },
      { x: 3380, y: 220, width: 80, height: 280, minSpeed: 260 },
    ],
    gates: [],
    ship: {
      x: 80,
      y: 300,
      aimRange: [-25, 25],
    },
    endZone: {
      x: 4080,
      y: 160,
      width: 70,
      height: 280,
    },
  },
];
