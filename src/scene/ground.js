import * as THREE from 'three';
import { LAYOUT, SCOOP_WHEEL } from '../model/dimensions.js';
import { grassTexture, reedTexture, rng } from '../model/textures.js';
import { paint, merge } from '../model/geometry.js';

// Polder : prairie, boezems (réservoirs), fossés, roseaux, nénuphars, arbres,
// chemins de digue et la digue de la Lek à l'est.
function rect(x0, x1, z0, z1, y) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  return g;
}

const WATER_DAY = '#7896ad';
const WATER_NIGHT = '#15223a';
const HORIZON_DAY = '#55684e';
const HORIZON_NIGHT = '#0d1420';

export function createGround() {
  const group = new THREE.Group();
  const rand = rng(42);
  const mills = [...LAYOUT.nederwaard, ...LAYOUT.overwaard];

  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 }),
  );
  grass.receiveShadow = true;
  group.add(grass);

  const waterGeos = LAYOUT.waterRects.map(([x0, x1, z0, z1]) => rect(x0, x1, z0, z1, 0.08));
  for (const m of mills) {
    const cx = m.x + SCOOP_WHEEL.offsetX;
    waterGeos.push(rect(cx - 0.7, cx + 0.7, m.z - 15.5, m.z + 15.5, 0.09));
  }
  const waterMat = new THREE.MeshStandardMaterial({
    color: WATER_DAY,
    roughness: 0.2,
    metalness: 0.05,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
  });
  const water = new THREE.Mesh(merge(waterGeos), waterMat);
  water.receiveShadow = true;
  group.add(water);

  const land = [];
  for (const [x0, x1, z0, z1] of LAYOUT.paths) land.push(paint(rect(x0, x1, z0, z1, 0.07), '#bdb49b'));
  const dykeShape = new THREE.Shape();
  dykeShape.moveTo(-22, 0);
  dykeShape.lineTo(-5, 4.5);
  dykeShape.lineTo(5, 4.5);
  dykeShape.lineTo(22, 0);
  dykeShape.closePath();
  const dyke = new THREE.ExtrudeGeometry(dykeShape, { depth: 5000, bevelEnabled: false });
  dyke.translate(LAYOUT.dykeX, 0, -2500);
  land.push(paint(dyke, '#6c8b44'));
  land.push(paint(rect(LAYOUT.dykeX - 3.5, LAYOUT.dykeX + 3.5, -2500, 2500, 4.53), '#8b8a84'));
  const landMesh = new THREE.Mesh(
    merge(land),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
  );
  landMesh.receiveShadow = true;
  group.add(landMesh);

  // Roseaux : panneaux de tiges (texture transparente) le long des berges
  const nearHouse = (x, z) => LAYOUT.houses.some((h) => Math.abs(x - h.x) < 8 && Math.abs(z - h.z) < 8);
  const nearChannel = (x) => mills.some((m) => Math.abs(x - (m.x + SCOOP_WHEEL.offsetX)) < 4.5);
  const panels = [];
  for (const edge of LAYOUT.reedEdges) {
    for (let x = edge.x0; x < edge.x1; x += 3.2) {
      const xx = x + (rand() - 0.5) * 1.5;
      if (nearChannel(xx)) continue;
      if (edge.skip.some(([a, b]) => xx > a && xx < b)) continue;
      for (let row = 0; row < 2; row++) {
        const pz = edge.z + edge.dir * (0.4 + row * 1.3 + rand() * 0.8);
        if (!nearHouse(xx, pz)) panels.push([xx + (rand() - 0.5) * 1.5, pz, (rand() - 0.5) * 0.5]);
      }
    }
  }
  const reeds = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(4.2, 2.5).translate(0, 1.25, 0),
    new THREE.MeshStandardMaterial({ map: reedTexture(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 }),
    panels.length,
  );
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const c = new THREE.Color();
  panels.forEach(([x, z, yaw], i) => {
    const sc = 0.8 + rand() * 0.4;
    q.setFromEuler(e.set(0, yaw, 0));
    m4.compose(p.set(x, 0, z), q, s.set(1, sc, 1));
    reeds.setMatrixAt(i, m4);
  });
  reeds.receiveShadow = true;
  reeds.computeBoundingSphere();
  group.add(reeds);

  // Nénuphars près des berges
  const pads = [];
  for (const [x0, x1, z0, z1, n] of LAYOUT.lilyAreas) {
    for (let i = 0; i < n; i++) pads.push([x0 + rand() * (x1 - x0), z0 + rand() * (z1 - z0), 0.6 + rand() * 0.6]);
  }
  const lilies = new THREE.InstancedMesh(
    new THREE.CircleGeometry(0.55, 9).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#557f3a', roughness: 0.7 }),
    pads.length,
  );
  pads.forEach(([x, z, sc], i) => {
    q.setFromEuler(e.set(0, rand() * 6.28, 0));
    m4.compose(p.set(x, 0.13, z), q, s.set(sc, 1, sc));
    lilies.setMatrixAt(i, m4);
  });
  lilies.computeBoundingSphere();
  group.add(lilies);

  // Arbres : bosquets près des maisons de garde et rideaux d'arbres au loin
  const trees = [];
  for (const [cx, cz, n, spread] of LAYOUT.treeClusters) {
    for (let i = 0; i < n; i++) trees.push([cx + (rand() - 0.5) * spread, cz + (rand() - 0.5) * spread * 0.6, 0.8 + rand() * 0.6]);
  }
  for (let i = 0; i < 70; i++) trees.push([-1300 + rand() * 1500, 330 + rand() * 60, 0.9 + rand() * 0.6]);
  for (let i = 0; i < 70; i++) trees.push([-1300 + rand() * 1500, -430 - rand() * 60, 0.9 + rand() * 0.6]);
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.32, 1, 6).translate(0, 0.5, 0),
    new THREE.MeshStandardMaterial({ color: '#4b3b2c', roughness: 1 }),
    trees.length,
  );
  const crowns = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    trees.length,
  );
  const greens = ['#4f6b34', '#5d7a3a', '#46602f', '#6b8442'];
  trees.forEach(([x, z, sc], i) => {
    m4.compose(p.set(x, 0, z), q.identity(), s.set(sc, 3.2 * sc, sc));
    trunks.setMatrixAt(i, m4);
    q.setFromEuler(e.set(0, rand() * 6.28, 0));
    m4.compose(p.set(x, 5.6 * sc, z), q, s.set(3.3 * sc, 3.7 * sc, 3.3 * sc));
    crowns.setMatrixAt(i, m4);
    crowns.setColorAt(i, c.set(greens[(rand() * greens.length) | 0]));
  });
  [trunks, crowns].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  });

  const horizonMat = new THREE.MeshBasicMaterial({ color: HORIZON_DAY, side: THREE.BackSide });
  const horizon = new THREE.Mesh(new THREE.CylinderGeometry(1900, 1900, 26, 64, 1, true), horizonMat);
  horizon.position.y = 12;
  group.add(horizon);

  function setNight(night) {
    waterMat.color.set(night ? WATER_NIGHT : WATER_DAY);
    horizonMat.color.set(night ? HORIZON_NIGHT : HORIZON_DAY);
  }

  return { group, setNight };
}
