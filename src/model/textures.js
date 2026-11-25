import * as THREE from 'three';

// Textures générées en code (CanvasTexture) : brique, chaume de roseau, herbe, roseaux.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(canvas, rx, ry) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Une tuile = 4 m × 4 m de maçonnerie (assises de 25 cm, briques de 50 cm stylisées).
export function brickTexture(rx = 8, ry = 3.5) {
  const c = makeCanvas(512, 512);
  const g = c.getContext('2d');
  const r = rng(7);
  g.fillStyle = '#5a5249';
  g.fillRect(0, 0, 512, 512);
  const rows = 16;
  const cols = 8;
  const bh = 512 / rows;
  const bw = 512 / cols;
  for (let y = 0; y < rows; y++) {
    const off = (y % 2) * (bw / 2);
    for (let x = -1; x <= cols; x++) {
      const k = 0.82 + r() * 0.32;
      const red = r() < 0.15 ? 1.1 : 1;
      g.fillStyle = `rgb(${Math.min(255, 121 * k * red) | 0}, ${(109 * k) | 0}, ${(99 * k) | 0})`;
      g.fillRect(x * bw + off + 1.5, y * bh + 1.5, bw - 3, bh - 3);
    }
  }
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(40, 36, 32, ${0.04 + r() * 0.08})`;
    g.fillRect(r() * 512, 0, 2 + r() * 10, 512);
  }
  return toTexture(c, rx, ry);
}

export function thatchTexture() {
  const c = makeCanvas(256, 512);
  const g = c.getContext('2d');
  const r = rng(11);
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, '#5a4c3c');
  grd.addColorStop(1, '#41362a');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 1500; i++) {
    const x = r() * 256;
    const y = r() * 512;
    const len = 18 + r() * 50;
    const light = r() > 0.55;
    g.strokeStyle = light ? `rgba(146, 122, 88, ${0.18 + r() * 0.25})` : `rgba(22, 17, 12, ${0.25 + r() * 0.3})`;
    g.lineWidth = 1 + r() * 1.6;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 2, y + len);
    g.stroke();
  }
  return toTexture(c, 6, 3);
}

export function grassTexture() {
  const c = makeCanvas(256, 256);
  const g = c.getContext('2d');
  const r = rng(3);
  g.fillStyle = '#7b984c';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = r();
    g.fillStyle = v > 0.5 ? `rgba(150, 172, 92, ${0.15 + r() * 0.2})` : `rgba(58, 84, 38, ${0.15 + r() * 0.25})`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3);
  }
  return toTexture(c, 300, 300);
}

// Bande de roseaux (tiges + panicules) sur fond transparent, pour des panneaux en alphaTest.
export function reedTexture() {
  const c = makeCanvas(512, 160);
  const g = c.getContext('2d');
  const r = rng(21);
  g.clearRect(0, 0, 512, 160);
  const greens = ['#7f9a45', '#93a552', '#6c8a3a', '#a9a85f', '#5f7d34'];
  for (let i = 0; i < 260; i++) {
    const x = r() * 512;
    const h = 160 * (0.5 + r() * 0.48);
    const lean = (r() - 0.5) * 26;
    g.strokeStyle = greens[(r() * greens.length) | 0];
    g.lineWidth = 1.4 + r() * 2.2;
    g.beginPath();
    g.moveTo(x, 160);
    g.quadraticCurveTo(x + lean * 0.3, 160 - h * 0.6, x + lean, 160 - h);
    g.stroke();
    if (r() < 0.35) {
      g.fillStyle = r() < 0.5 ? '#7a6644' : '#8d7b55';
      g.beginPath();
      g.ellipse(x + lean, 160 - h + 4, 2.4, 7, lean * 0.02, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
