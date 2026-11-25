import * as THREE from 'three';
import { OCT_MILL } from './dimensions.js';
import { paint, merge, beam, windowParts, doorParts } from './geometry.js';
import { capParts } from './cap.js';

const deg = THREE.MathUtils.degToRad;

// Moulin octogonal de l'Overwaard (1740) : socle en brique, fût à huit pans
// couvert de roseau (chaume), arêtes en bois, mêmes calotte et ailes.
export function octagonalMillParts() {
  const { baseRadius: R0, topRadius: R1, plinthHeight: P, bodyHeight: H, moundHeight: M } = OCT_MILL;
  const y0 = M + P;
  const topY = y0 + H;
  const radiusAt = (y) => R0 + (R1 - R0) * ((y - y0) / H);
  const apothem = Math.cos(Math.PI / 8);
  const slope = Math.atan(((R0 - R1) * apothem) / H);

  const body = new THREE.CylinderGeometry(R1, R0, H, 8, 1, true).translate(0, y0 + H / 2, 0);
  const trim = [];
  const glass = [];

  trim.push(paint(new THREE.CylinderGeometry(R0 + 1.1, R0 + 2.3, M, 40).translate(0, M / 2, 0), '#62803d'));
  trim.push(paint(new THREE.CylinderGeometry(R0 + 0.25, R0 + 0.4, P, 8).translate(0, M + P / 2, 0), '#6e4a3c'));
  trim.push(paint(new THREE.CylinderGeometry(R0 + 0.32, R0 + 0.32, 0.14, 8).translate(0, y0 + 0.02, 0), '#3b2f26'));
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const a0 = new THREE.Vector3(Math.sin(a) * (R0 + 0.04), y0, Math.cos(a) * (R0 + 0.04));
    const a1 = new THREE.Vector3(Math.sin(a) * (R1 + 0.04), topY, Math.cos(a) * (R1 + 0.04));
    trim.push(paint(beam(a0, a1, 0.14, 0.14), '#2e261e'));
  }
  trim.push(paint(new THREE.CylinderGeometry(R1 + 0.2, R1 + 0.08, 0.3, 8).translate(0, topY - 0.15, 0), '#2e261e'));

  const faceAz = (k) => deg(22.5 + 45 * k);
  for (const [k, y] of [[0, 4.2], [-1, 8.2], [2, 6.0], [4, 3.5], [-3, 9.5]]) {
    const yy = y0 + y;
    const w = windowParts(faceAz(k), yy, radiusAt(yy) * apothem + 0.02, slope);
    trim.push(w.frame);
    glass.push(w.glass);
  }
  trim.push(...doorParts(faceAz(-2), M, (R0 + 0.3) * apothem + 0.02, 0, '#4b6e3f'));

  const cap = capParts({ topY, topRadius: R1, baseRadius: R0 + 0.4 });
  trim.push(...cap.trim);

  return { body, trim: merge(trim), glass: merge(glass), axleY: cap.axleY, hubZ: cap.hubZ, topY };
}
