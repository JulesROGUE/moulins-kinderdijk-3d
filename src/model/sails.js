import * as THREE from 'three';
import { SAILS } from './dimensions.js';
import { paint, merge } from './geometry.js';

// Rotor à quatre ailes « à l'ancienne hollandaise » : deux vergues (roeden)
// croisées, planches au bord d'attaque et treillis (hekwerk) du côté de fuite.
// Le moulin tourne dans le sens inverse des aiguilles d'une montre vu de face.
export function rotorGeometry() {
  const { radius: R, latticeStart: r0, latticeWidth: W, boardWidth: B, barStep, stock } = SAILS;
  const len = R - r0;
  const mid = (R + r0) / 2;
  const parts = [paint(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 16).rotateX(Math.PI / 2), '#262624')];
  for (let k = 0; k < 4; k++) {
    const blade = [];
    blade.push(paint(new THREE.BoxGeometry(R, stock, stock).translate(R / 2, 0, 0), '#22312a'));
    blade.push(paint(new THREE.BoxGeometry(len, B, 0.05).translate(mid, stock / 2 + B / 2, -0.04), '#2f4d3c'));
    for (let x = r0; x <= R + 1e-6; x += barStep) {
      blade.push(paint(new THREE.BoxGeometry(0.08, W, 0.08).translate(x, -W / 2, -0.14), '#dcd8cc'));
    }
    for (const y of [-W, -W * 0.5]) {
      blade.push(paint(new THREE.BoxGeometry(len, 0.1, 0.1).translate(mid, y, -0.14), '#dcd8cc'));
    }
    const g = merge(blade);
    g.rotateZ((k * Math.PI) / 2);
    parts.push(g);
  }
  return merge(parts);
}
