import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Petits utilitaires : couleur par sommet, fusion, poutres, ouvertures sur un fût.
const tmp = new THREE.Color();

export function paint(geometry, color) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  tmp.set(color);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = tmp.r;
    arr[i * 3 + 1] = tmp.g;
    arr[i * 3 + 2] = tmp.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  if (!g.attributes.normal) g.computeVertexNormals();
  return g;
}

export function merge(list) {
  const merged = mergeGeometries(list, false);
  if (!merged) throw new Error('Fusion de géométries impossible');
  return merged;
}

export function beam(a, b, w, h) {
  const g = new THREE.BoxGeometry(w, h, a.distanceTo(b));
  const m = new THREE.Matrix4().lookAt(a, b, new THREE.Vector3(0, 1, 0));
  m.setPosition(a.clone().add(b).multiplyScalar(0.5));
  g.applyMatrix4(m);
  return g;
}

// Place une géométrie sur la surface d'un fût conique : inclinaison, azimut, distance.
export function onSurface(geo, az, y, dist, slope) {
  geo.rotateX(-slope);
  geo.rotateY(az);
  geo.translate(Math.sin(az) * dist, y, Math.cos(az) * dist);
  return geo;
}

export function windowParts(az, y, dist, slope) {
  return {
    frame: paint(onSurface(new THREE.BoxGeometry(0.95, 1.25, 0.3), az, y, dist, slope), '#f1eee6'),
    glass: paint(onSurface(new THREE.BoxGeometry(0.64, 0.92, 0.36), az, y, dist, slope), '#ffffff'),
  };
}

export function doorParts(az, yBottom, dist, slope, color = '#3f6d4e') {
  const h = 2.2;
  const w = 1.4;
  const frame = new THREE.BoxGeometry(w + 0.3, h + 0.15, 0.3).translate(0, (h + 0.15) / 2, 0);
  const frameArch = new THREE.CylinderGeometry((w + 0.3) / 2, (w + 0.3) / 2, 0.3, 18, 1, false, Math.PI / 2, Math.PI)
    .rotateX(Math.PI / 2)
    .translate(0, h + 0.15, 0);
  const leaf = new THREE.BoxGeometry(w, h, 0.38).translate(0, h / 2, 0);
  const leafArch = new THREE.CylinderGeometry(w / 2, w / 2, 0.38, 18, 1, false, Math.PI / 2, Math.PI)
    .rotateX(Math.PI / 2)
    .translate(0, h, 0);
  const place = (g) => onSurface(g, az, yBottom, dist, slope);
  return [
    paint(place(frame), '#ece8de'),
    paint(place(frameArch), '#ece8de'),
    paint(place(leaf), color),
    paint(place(leafArch), color),
  ];
}
