import * as THREE from 'three';
import { CAP } from './dimensions.js';
import { paint, beam } from './geometry.js';

// Calotte tournante (kap) : couronne claire, capot sombre, « baard » décoré,
// tête d'arbre incliné de 10°, queue d'orientation avec ses jambes de force,
// treuil et poteaux d'amarrage autour du moulin.
export function capParts({ topY, topRadius: R, baseRadius }) {
  const tilt = THREE.MathUtils.degToRad(CAP.tiltDeg);
  const ringH = CAP.ringHeight;
  const capBase = topY + ringH;
  const axleY = capBase + CAP.axleAboveBase;
  const rx = R + 0.45;
  const ry = CAP.hoodHeight;
  const rz = R + 1.15;
  const hubZ = R + 1.55;
  const wood = '#3a3027';
  const trim = [];

  trim.push(paint(new THREE.CylinderGeometry(R + 0.34, R + 0.2, ringH, 40).translate(0, topY + ringH / 2, 0), '#d9c78f'));
  trim.push(paint(new THREE.CylinderGeometry(rx + 0.06, rx + 0.06, 0.24, 40).scale(1, 1, rz / rx).translate(0, capBase + 0.12, 0), '#2c2620'));
  const hood = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  hood.scale(rx, ry, rz);
  hood.translate(0, capBase, 0);
  trim.push(paint(hood, '#3d342b'));

  // « Baard » : planche décorée sous la tête d'arbre
  const by = capBase + 0.5;
  const bz = rz * Math.sqrt(1 - Math.pow(0.5 / ry, 2)) + 0.07;
  trim.push(paint(new THREE.BoxGeometry(2.5, 0.95, 0.12).translate(0, by, bz), '#efe9db'));
  trim.push(paint(new THREE.BoxGeometry(2.56, 0.14, 0.14).translate(0, by + 0.46, bz + 0.01), '#a8322b'));
  trim.push(paint(new THREE.BoxGeometry(2.56, 0.14, 0.14).translate(0, by - 0.46, bz + 0.01), '#2b5a3f'));
  trim.push(paint(new THREE.BoxGeometry(0.4, 0.4, 0.14).rotateZ(Math.PI / 4).translate(0, by, bz + 0.02), '#a8322b'));

  // Tête de l'arbre (as) inclinée
  const sleeve = new THREE.CylinderGeometry(0.4, 0.46, 1.7, 14).rotateX(Math.PI / 2 - tilt);
  sleeve.translate(0, axleY - 0.85 * Math.sin(tilt), hubZ - 0.85 * Math.cos(tilt));
  trim.push(paint(sleeve, '#2b2b2a'));

  // Queue (staart), jambes de force (schoren) et treuil (kruirad)
  const sy = capBase + 0.25;
  const sz = -0.9;
  const sx = R + 1.9;
  trim.push(paint(new THREE.BoxGeometry(sx * 2, 0.32, 0.32).translate(0, sy, sz), wood));
  const tailTop = new THREE.Vector3(0, capBase + 0.3, -(R + 0.55));
  const tailFoot = new THREE.Vector3(0, 1.2, -(baseRadius + 6.0));
  trim.push(paint(beam(tailTop, tailFoot, 0.36, 0.36), wood));
  const strutFoot = new THREE.Vector3(0, 2.5, -(baseRadius + 5.6));
  for (const side of [-1, 1]) {
    trim.push(paint(beam(new THREE.Vector3(side * sx, sy, sz), strutFoot, 0.24, 0.24), wood));
  }
  const wz = -(baseRadius + 6.35);
  trim.push(paint(new THREE.TorusGeometry(0.85, 0.07, 6, 20).rotateY(Math.PI / 2).translate(0, 1.7, wz), '#2c2620'));
  for (let i = 0; i < 4; i++) {
    trim.push(paint(new THREE.BoxGeometry(0.06, 1.7, 0.06).rotateX((i * Math.PI) / 4).translate(0, 1.7, wz), '#2c2620'));
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const pr = baseRadius + 5.2;
    trim.push(paint(new THREE.CylinderGeometry(0.13, 0.15, 1.1, 6).translate(Math.sin(a) * pr, 0.55, Math.cos(a) * pr), '#4a3d30'));
  }

  return { trim, axleY, hubZ };
}
