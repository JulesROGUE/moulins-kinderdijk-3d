import * as THREE from 'three';
import { paint, merge } from './geometry.js';

// Petites maisons de meunier/garde : murs de brique, toit sombre à deux pans.
export function houseGeometry() {
  const parts = [];
  parts.push(paint(new THREE.BoxGeometry(5.5, 2.8, 8).translate(0, 1.4, 0), '#7a4a38'));
  const s = new THREE.Shape();
  s.moveTo(-3.2, 0);
  s.lineTo(3.2, 0);
  s.lineTo(0, 3.4);
  s.closePath();
  const roof = new THREE.ExtrudeGeometry(s, { depth: 8.6, bevelEnabled: false });
  roof.translate(0, 2.8, -4.3);
  parts.push(paint(roof, '#2d3135'));
  parts.push(paint(new THREE.BoxGeometry(0.6, 1.6, 0.6).translate(1.2, 5.2, -2.5), '#6b3e30'));
  parts.push(paint(new THREE.BoxGeometry(0.12, 2.0, 1.0).translate(2.8, 1.0, 1.5), '#3d6b4f'));
  return merge(parts);
}

export function houseGlassGeometry() {
  const parts = [];
  for (const [x, z] of [[2.8, -2.2], [2.8, -0.4], [-2.8, -2.2], [-2.8, 0.2], [-2.8, 2.2]]) {
    parts.push(paint(new THREE.BoxGeometry(0.12, 0.9, 1.0).translate(x, 1.55, z), '#ffffff'));
  }
  return merge(parts);
}
