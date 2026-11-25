import * as THREE from 'three';
import { LAYOUT } from '../model/dimensions.js';

// Soleil (jour) / lune (nuit) avec ombres, lumière d'ambiance hémisphérique
// et deux lanternes chaudes allumées la nuit près du premier moulin.
export function createLights(scene, { sunDir, moonDir }) {
  const hemi = new THREE.HemisphereLight('#d7e6ff', '#5d6b3c', 1.1);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -175;
  cam.right = 175;
  cam.top = 175;
  cam.bottom = -175;
  cam.near = 20;
  cam.far = 1100;
  cam.updateProjectionMatrix();
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.08;
  sun.target.position.set(-70, 0, -20);
  scene.add(hemi, sun, sun.target);

  const hero = LAYOUT.hero;
  const lamps = [
    new THREE.PointLight('#ffad5c', 0, 40, 2),
    new THREE.PointLight('#ffad5c', 0, 34, 2),
  ];
  lamps[0].position.set(hero.x + 5.4, 2.8, hero.z + 4.2);
  lamps[1].position.set(hero.x - 16.4, 2.6, hero.z + 11.5);
  lamps.forEach((lamp) => scene.add(lamp));

  function aim(dir) {
    sun.position.copy(sun.target.position).addScaledVector(dir, 520);
  }

  function setNight(night) {
    if (night) {
      hemi.color.set('#6a7fb5');
      hemi.groundColor.set('#141a28');
      hemi.intensity = 0.42;
      sun.color.set('#9fb3ff');
      sun.intensity = 0.65;
      aim(moonDir);
      lamps.forEach((lamp) => { lamp.intensity = 140; });
    } else {
      hemi.color.set('#d7e6ff');
      hemi.groundColor.set('#5d6b3c');
      hemi.intensity = 1.1;
      sun.color.set('#fff0d6');
      sun.intensity = 2.6;
      aim(sunDir);
      lamps.forEach((lamp) => { lamp.intensity = 0; });
    }
  }

  aim(sunDir);
  return { hemi, sun, lamps, setNight };
}
