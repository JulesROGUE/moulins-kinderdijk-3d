import * as THREE from 'three';
import { rng } from '../model/textures.js';

// Ciel en dégradé (shader), soleil, lune, étoiles et quelques nuages.
const DAY = { top: '#3b76c4', horizon: '#d3e3ee', bottom: '#b7c6ad', glowColor: '#fff1cc', glow: 0.55, disc: 1.0 };
const NIGHT = { top: '#040817', horizon: '#1c2a4b', bottom: '#0a1020', glowColor: '#c9d4ff', glow: 0.22, disc: 0.0 };

export function createSky({ sunDir, moonDir }) {
  const group = new THREE.Group();
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uSunDir: { value: sunDir.clone() },
    uGlowColor: { value: new THREE.Color() },
    uGlow: { value: 0.5 },
    uDisc: { value: 1.0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    vertexShader: [
      'varying vec3 vDir;',
      'void main() {',
      '  vDir = normalize(position);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uTop;',
      'uniform vec3 uHorizon;',
      'uniform vec3 uBottom;',
      'uniform vec3 uSunDir;',
      'uniform vec3 uGlowColor;',
      'uniform float uGlow;',
      'uniform float uDisc;',
      'varying vec3 vDir;',
      'void main() {',
      '  vec3 d = normalize(vDir);',
      '  float h = d.y;',
      '  vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.6)) : mix(uHorizon, uBottom, clamp(-h * 6.0, 0.0, 1.0));',
      '  float s = max(dot(d, normalize(uSunDir)), 0.0);',
      '  col += uGlowColor * uGlow * pow(s, 12.0);',
      '  col += uGlowColor * uDisc * smoothstep(0.9993, 0.9996, s);',
      '  gl_FragColor = vec4(col, 1.0);',
      '  #include <colorspace_fragment>',
      '}',
    ].join('\n'),
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2500, 32, 16), material);
  dome.frustumCulled = false;
  dome.renderOrder = -1;
  group.add(dome);

  const rand = rng(99);
  const starCount = 800;
  const stars = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = rand() * Math.PI * 2;
    const y = 0.08 + rand() * 0.92;
    const r = Math.sqrt(1 - y * y);
    stars[i * 3] = Math.cos(theta) * r * 2300;
    stars[i * 3 + 1] = y * 2300;
    stars[i * 3 + 2] = Math.sin(theta) * r * 2300;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  const starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
  starPoints.frustumCulled = false;
  group.add(starPoints);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(36, 24, 12), new THREE.MeshBasicMaterial({ color: '#f5f0dc', fog: false }));
  moon.position.copy(moonDir).multiplyScalar(2150);
  group.add(moon);

  const puffs = [];
  for (let c = 0; c < 14; c++) {
    const angle = rand() * Math.PI * 2;
    const dist = 950 + rand() * 750;
    const cx = Math.sin(angle) * dist;
    const cz = Math.cos(angle) * dist;
    const cy = 260 + rand() * 220;
    const n = 4 + ((rand() * 4) | 0);
    for (let i = 0; i < n; i++) {
      puffs.push([cx + (rand() - 0.5) * 220, cy + (rand() - 0.3) * 30, cz + (rand() - 0.5) * 120, 45 + rand() * 60]);
    }
  }
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.2 });
  const clouds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), cloudMat, puffs.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  puffs.forEach(([x, y, z, size], i) => {
    m.compose(p.set(x, y, z), q, s.set(size, size * 0.38, size * 0.7));
    clouds.setMatrixAt(i, m);
  });
  clouds.computeBoundingSphere();
  group.add(clouds);

  function setNight(night) {
    const pal = night ? NIGHT : DAY;
    uniforms.uTop.value.set(pal.top);
    uniforms.uHorizon.value.set(pal.horizon);
    uniforms.uBottom.value.set(pal.bottom);
    uniforms.uGlowColor.value.set(pal.glowColor);
    uniforms.uGlow.value = pal.glow;
    uniforms.uDisc.value = pal.disc;
    uniforms.uSunDir.value.copy(night ? moonDir : sunDir);
    starPoints.visible = night;
    moon.visible = night;
    cloudMat.color.set(night ? '#2a3350' : '#ffffff');
    cloudMat.emissiveIntensity = night ? 0 : 0.2;
  }

  setNight(false);
  return { group, setNight };
}
