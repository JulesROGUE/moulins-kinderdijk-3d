import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRenderer } from './renderer.js';
import { createLights } from './lights.js';
import { createSky } from './sky.js';
import { createGround } from './ground.js';
import { createMills } from '../model/mills.js';
import { LAYOUT } from '../model/dimensions.js';
import { VIEWPOINTS, DEFAULT_VIEW } from '../viewpoints.js';

const SUN_DIR = new THREE.Vector3(0.62, 0.55, -0.56).normalize();
const MOON_DIR = new THREE.Vector3(-0.67, 0.42, 0.61).normalize();
const FOG_DAY = '#cfdce6';
const FOG_NIGHT = '#16213a';
const HERO_CENTER = new THREE.Vector3(LAYOUT.hero.x, 13, LAYOUT.hero.z);

// Rendu à la demande : aucune boucle permanente. On dessine au chargement,
// sur 'change' des OrbitControls, au redimensionnement et pendant les
// animations courtes (transitions) ou lancées par un bouton (ailes, visite).
export class World {
  constructor(host, { view = DEFAULT_VIEW, night = false } = {}) {
    this.host = host;
    this.renderer = createRenderer(host);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(FOG_DAY, 0.00055);
    const { w, h } = this.size();
    this.camera = new THREE.PerspectiveCamera(50, w / h, 1, 6000);

    this.sky = createSky({ sunDir: SUN_DIR, moonDir: MOON_DIR });
    this.scene.add(this.sky.group);
    this.lights = createLights(this.scene, { sunDir: SUN_DIR, moonDir: MOON_DIR });
    this.ground = createGround();
    this.scene.add(this.ground.group);
    this.mills = createMills();
    this.scene.add(this.mills.group);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 900;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.screenSpacePanning = true;
    this.controls.zoomSpeed = 0.9;

    this.pending = 0;
    this.loopId = 0;
    this.transition = null;
    this.sailsOn = false;
    this.tour = false;
    this.sailTime = 0;
    this.tourAngle = 0;
    this.onTourStop = null;

    this.onChange = () => {
      this.clampCamera();
      if (!this.loopId) this.requestRender();
    };
    this.onStart = () => {
      this.transition = null;
      if (this.tour) this.stopTour();
    };
    this.controls.addEventListener('change', this.onChange);
    this.controls.addEventListener('start', this.onStart);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.setNight(night, false);
    this.goTo(view, false);
    this.renderNow();
  }

  size() {
    return { w: this.host.clientWidth || window.innerWidth, h: this.host.clientHeight || window.innerHeight };
  }

  renderNow() {
    this.renderer.render(this.scene, this.camera);
  }

  requestRender() {
    if (this.pending || this.loopId) return;
    this.pending = requestAnimationFrame(() => {
      this.pending = 0;
      this.renderNow();
    });
  }

  resize() {
    const { w, h } = this.size();
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderNow();
  }

  clampCamera() {
    const t = this.controls.target;
    t.y = THREE.MathUtils.clamp(t.y, 0, 60);
    if (this.camera.position.y < 1.2) this.camera.position.y = 1.2;
  }

  goTo(name, animate = true) {
    const v = VIEWPOINTS[name] || VIEWPOINTS[DEFAULT_VIEW];
    const toPos = new THREE.Vector3(...v.position);
    const toTarget = new THREE.Vector3(...v.target);
    const fov = v.fov || 50;
    if (this.tour) this.stopTour();
    if (!animate) {
      this.transition = null;
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.position.copy(toPos);
      this.controls.target.copy(toTarget);
      this.controls.update();
      this.renderNow();
      return;
    }
    this.flyTo(toPos, toTarget, fov);
  }

  flyTo(toPos, toTarget, toFov = 50, duration = 1200) {
    this.transition = {
      start: performance.now(),
      duration,
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      fromFov: this.camera.fov,
      toPos,
      toTarget,
      toFov,
    };
    this.startLoop();
  }

  setNight(night, render = true) {
    this.night = night;
    this.sky.setNight(night);
    this.lights.setNight(night);
    this.ground.setNight(night);
    this.mills.setNight(night);
    this.scene.fog.color.set(night ? FOG_NIGHT : FOG_DAY);
    if (render) this.renderNow();
  }

  setSails(on) {
    this.sailsOn = on;
    if (on) this.startLoop();
  }

  setTour(on) {
    if (!on) {
      this.tour = false;
      return;
    }
    const rel = this.camera.position.clone().sub(HERO_CENTER);
    this.tourAngle = Math.atan2(rel.x, rel.z);
    this.tourRadius = 62;
    this.tour = true;
    this.flyTo(this.tourPosition(), HERO_CENTER.clone(), 50);
  }

  stopTour() {
    this.tour = false;
    if (this.onTourStop) this.onTourStop();
  }

  tourPosition() {
    const a = this.tourAngle;
    return new THREE.Vector3(
      HERO_CENTER.x + Math.sin(a) * this.tourRadius,
      7 + 4 * Math.sin(a * 0.8),
      HERO_CENTER.z + Math.cos(a) * this.tourRadius,
    );
  }

  startLoop() {
    if (this.loopId) return;
    if (this.pending) {
      cancelAnimationFrame(this.pending);
      this.pending = 0;
    }
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      let active = false;
      if (this.transition) {
        const tr = this.transition;
        const k = Math.min(Math.max((now - tr.start) / tr.duration, 0), 1);
        const ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        this.camera.position.lerpVectors(tr.fromPos, tr.toPos, ease);
        this.controls.target.lerpVectors(tr.fromTarget, tr.toTarget, ease);
        this.camera.fov = tr.fromFov + (tr.toFov - tr.fromFov) * ease;
        this.camera.updateProjectionMatrix();
        this.controls.update();
        if (k >= 1) this.transition = null;
        else active = true;
      }
      if (this.sailsOn || this.tour) {
        this.sailTime += dt;
        this.mills.setTime(this.sailTime);
        active = true;
      }
      if (this.tour && !this.transition) {
        this.tourAngle += dt * 0.14;
        this.camera.position.copy(this.tourPosition());
        this.controls.target.copy(HERO_CENTER);
        this.controls.update();
        active = true;
      }
      this.renderNow();
      this.loopId = active ? requestAnimationFrame(tick) : 0;
    };
    this.loopId = requestAnimationFrame(tick);
  }

  dispose() {
    if (this.loopId) cancelAnimationFrame(this.loopId);
    if (this.pending) cancelAnimationFrame(this.pending);
    this.loopId = 0;
    this.pending = 0;
    this.resizeObserver.disconnect();
    this.controls.removeEventListener('change', this.onChange);
    this.controls.removeEventListener('start', this.onStart);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
