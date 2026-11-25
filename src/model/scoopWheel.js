import * as THREE from 'three';
import { SCOOP_WHEEL } from './dimensions.js';
import { paint, merge } from './geometry.js';

// Roue à aubes en fer de 6,30 m (Nederwaard n° 1 et 2) sous son capot de bois,
// murets du bief et passerelle à garde-corps blancs sur le chemin.
// Géométrie orientée « site » (non tournée avec la calotte).
export function scoopWheelSite() {
  const { diameter, width, offsetX: ox, offsetZ: oz, axleY } = SCOOP_WHEEL;
  const r = diameter / 2;
  const iron = '#2e2f31';
  const wood = '#2c2722';
  const wheel = [];
  wheel.push(paint(new THREE.TorusGeometry(r - 0.45, 0.07, 6, 40).rotateY(Math.PI / 2), iron));
  wheel.push(paint(new THREE.TorusGeometry(r * 0.45, 0.06, 6, 28).rotateY(Math.PI / 2), iron));
  for (let i = 0; i < 8; i++) {
    wheel.push(paint(new THREE.BoxGeometry(0.12, 2 * r - 0.9, 0.12).rotateX((i * Math.PI) / 8), iron));
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    wheel.push(
      paint(
        new THREE.BoxGeometry(width, 0.75, 0.05)
          .rotateX(Math.PI / 2 - a)
          .translate(0, Math.sin(a) * (r - 0.37), Math.cos(a) * (r - 0.37)),
        wood,
      ),
    );
  }
  wheel.push(paint(new THREE.CylinderGeometry(0.28, 0.28, width + 0.9, 12).rotateZ(Math.PI / 2), iron));
  wheel.push(paint(new THREE.CylinderGeometry(r + 0.3, r + 0.3, width + 0.7, 28, 1, true, 0, Math.PI).rotateZ(Math.PI / 2), wood));
  const wheelGeo = merge(wheel).translate(ox, axleY, oz);

  const site = [wheelGeo];
  for (const side of [-1, 1]) {
    site.push(paint(new THREE.BoxGeometry(0.35, 1.2, 9).translate(ox + side * (width / 2 + 0.55), 0.1, oz), '#6b5a4c'));
  }
  // Passerelle sur le bief, au droit du chemin de digue
  const bz = 6.1;
  site.push(paint(new THREE.BoxGeometry(3.2, 0.18, 2.4).translate(ox, 0.32, bz), '#7b6a55'));
  for (const side of [-1, 1]) {
    site.push(paint(new THREE.BoxGeometry(3.2, 0.08, 0.08).translate(ox, 1.15, bz + side * 1.15), '#f2f1ec'));
    for (const px of [-1.5, 1.5]) {
      site.push(paint(new THREE.BoxGeometry(0.08, 0.85, 0.08).translate(ox + px, 0.75, bz + side * 1.15), '#f2f1ec'));
    }
  }
  return merge(site);
}
