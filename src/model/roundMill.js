import * as THREE from 'three';
import { ROUND_MILL } from './dimensions.js';
import { paint, merge, windowParts, doorParts } from './geometry.js';
import { capParts } from './cap.js';

const deg = THREE.MathUtils.degToRad;

// Moulin rond en brique de la Nederwaard (1738) : fût conique, socle sombre,
// corniche, fenêtres à encadrement blanc et porte verte cintrée.
export function roundMillParts() {
  const { baseRadius: R0, topRadius: R1, bodyHeight: H, moundHeight: M } = ROUND_MILL;
  const topY = M + H;
  const radiusAt = (y) => R0 + (R1 - R0) * ((y - M) / H);
  const slope = Math.atan((R0 - R1) / H);

  const body = new THREE.CylinderGeometry(R1, R0, H, 48, 1, true).translate(0, M + H / 2, 0);
  const trim = [];
  const glass = [];

  trim.push(paint(new THREE.CylinderGeometry(R0 + 0.7, R0 + 2.0, M, 40).translate(0, M / 2, 0), '#62803d'));
  trim.push(paint(new THREE.CylinderGeometry(radiusAt(M + 0.8) + 0.1, R0 + 0.12, 0.8, 48).translate(0, M + 0.4, 0), '#4b433b'));
  trim.push(paint(new THREE.CylinderGeometry(R1 + 0.2, R1 + 0.05, 0.3, 48).translate(0, topY - 0.15, 0), '#5c5047'));

  for (const [a, y] of [[12, 5.0], [-28, 9.8], [62, 7.6], [150, 5.6], [-150, 10.6]]) {
    const yy = M + y;
    const w = windowParts(deg(a), yy, radiusAt(yy) + 0.02, slope);
    trim.push(w.frame);
    glass.push(w.glass);
  }
  trim.push(...doorParts(deg(-100), M, R0 + 0.14, slope));

  const cap = capParts({ topY, topRadius: R1, baseRadius: R0 });
  trim.push(...cap.trim);

  return { body, trim: merge(trim), glass: merge(glass), axleY: cap.axleY, hubZ: cap.hubZ, topY };
}

// Contrefort en brique ajouté vers 1870 contre le fût de la Nederwaard n° 1.
export function buttressGeometry() {
  const { baseRadius: R0, topRadius: R1, bodyHeight: H, moundHeight: M } = ROUND_MILL;
  const rAt = (h) => R0 + (R1 - R0) * (h / H);
  const top = 8;
  const s = new THREE.Shape();
  s.moveTo(rAt(0) - 0.6, 0);
  s.lineTo(rAt(0) + 2.3, 0);
  s.lineTo(rAt(top) + 0.35, top);
  s.lineTo(rAt(top) - 0.6, top);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.8, bevelEnabled: false });
  g.translate(0, M, -0.9);
  g.rotateY(deg(-45) - Math.PI / 2);
  return paint(g, '#685a4e');
}
