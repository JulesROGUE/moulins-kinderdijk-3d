// Dimensions retenues pour la reproduction (1 unité = 1 m).
//
// Chiffres sourcés :
//  - 19 moulins sur le site, construits en 1738 (Nederwaard, 8 moulins en brique)
//    et 1740 (Overwaard, 8 moulins octogonaux), patrimoine mondial UNESCO en 1997.
//    https://en.wikipedia.org/wiki/Kinderdijk_windmills
//  - « stenen grondzeilers » ronds pour la Nederwaard, « rietgedekte achtkanters »
//    (octogonaux couverts de roseau) pour l'Overwaard.
//    https://nl.wikipedia.org/wiki/Kinderdijk
//  - Nederwaard n° 1 et n° 2 : roue à aubes en fer de 6,30 m de diamètre ;
//    contrefort ajouté vers 1870 contre le fût du n° 1.
//    https://en.wikipedia.org/wiki/Nederwaard_Molen_No.1
//    https://en.wikipedia.org/wiki/Nederwaard_Molen_No.2
//  - Nederwaard n° 4 : « ronde stenen boezemmolen, 1738 » (registre des monuments, n° 30546).
//
// Proportions mesurées sur les photos de référence (Wikimedia Commons, voir README) :
//  - Kinderdijk_windmill.jpg : hauteur du fût ≈ 1,33 × diamètre à la base, diamètre en
//    haut ≈ 0,6 × diamètre à la base, rayon des ailes ≈ 1,3 × diamètre à la base,
//    calotte ≈ 0,22 × hauteur du fût, ailes qui descendent à ~2 m du sol (grondzeiler).
//  - Kinderdijk_-_Molen_Overwaard_No._3.jpg : fût octogonal en chaume sur un socle
//    en brique d'environ 1,5 m, mêmes proportions générales.
//  - Envergure des ailes (~28 m) et entraxe des moulins (~100 m) : estimations.

const DEG = Math.PI / 180;

export const ROUND_MILL = { baseRadius: 5.2, topRadius: 3.1, bodyHeight: 13.6, moundHeight: 0.6 };
export const OCT_MILL = { baseRadius: 5.6, topRadius: 3.3, plinthHeight: 1.6, bodyHeight: 12.0, moundHeight: 0.6 };

export const CAP = { ringHeight: 0.5, hoodHeight: 3.0, axleAboveBase: 1.45, tiltDeg: 10 };

export const SAILS = { radius: 14, latticeStart: 3.0, latticeWidth: 2.1, boardWidth: 0.55, barStep: 0.5, stock: 0.34, speed: 0.9 };

export const SCOOP_WHEEL = { diameter: 6.3, width: 0.9, offsetX: 7.6, offsetZ: 0, axleY: -0.35 };

const NED_PHASES = [0.06, 0.78, 0.3, 0.0, 0.7, 0.2, 0.62, 0.1];
const OVW_PHASES = [0.5, 0.05, 0.75, 0.35, 0.0, 0.66, 0.2, 0.8];

const ditches = [];
for (let k = 0; k < 7; k++) {
  const zs = 85 + k * 60;
  ditches.push([-1800, 250, zs, zs + 3]);
  const zn = -205 - k * 60;
  ditches.push([-1800, 250, zn - 3, zn]);
}
for (let k = 0; k < 9; k++) {
  const x = -100 - k * 160;
  ditches.push([x, x + 2.5, 47, 470]);
  ditches.push([x - 40, x - 37.5, -620, -146]);
}

export const LAYOUT = {
  yaw: 153 * DEG,
  hero: { x: 0, z: 26 },
  nederwaard: NED_PHASES.map((phase, i) => ({ x: -i * 100, z: 26, phase })),
  overwaard: OVW_PHASES.map((phase, i) => ({ x: -60 - i * 100, z: -124, phase })),
  dykeX: 280,
  waterRects: [
    [-1800, 256, -14, 14],
    [-1800, 256, -110, -84],
    [-1800, 140, 40, 47],
    [-1800, 90, -146, -139],
    [302, 2500, -2500, 2500],
    ...ditches,
  ],
  paths: [
    [-760, 40, 31, 33.2],
    [-820, -40, -119, -116.8],
    [-900, 256, -50, -47.5],
  ],
  houses: [
    { x: -20, z: 36 },
    { x: -220, z: 36 },
    { x: -320, z: 36 },
    { x: -520, z: 36 },
    { x: -43, z: -132 },
    { x: -243, z: -132 },
    { x: -543, z: -132 },
  ],
  reedEdges: [
    { z: -14, dir: -1, x0: -700, x1: 250, skip: [[-30, 260]] },
    { z: 14, dir: 1, x0: -700, x1: 250, skip: [[26, 62]] },
    { z: 40, dir: -1, x0: -700, x1: 135, skip: [] },
    { z: -84, dir: 1, x0: -800, x1: 250, skip: [] },
    { z: -110, dir: -1, x0: -800, x1: 250, skip: [] },
  ],
  lilyAreas: [
    [-28, 70, -13.5, -8.5, 190],
    [-60, 30, 9, 13.4, 90],
    [-300, -120, -13, -9, 80],
  ],
  treeClusters: [
    [-28, 38, 5, 10],
    [-228, 38, 4, 10],
    [-328, 38, 3, 8],
    [-528, 38, 4, 10],
    [-35, -136, 4, 10],
    [-235, -136, 3, 8],
    [-535, -136, 4, 10],
    [-150, -62, 6, 30],
    [-420, -40, 5, 25],
    [120, -62, 6, 30],
    [200, 70, 8, 40],
    [180, -175, 8, 40],
  ],
};
