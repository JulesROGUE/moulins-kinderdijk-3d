import * as THREE from 'three';
import { LAYOUT, CAP, SAILS } from './dimensions.js';
import { roundMillParts, buttressGeometry } from './roundMill.js';
import { octagonalMillParts } from './octagonalMill.js';
import { rotorGeometry } from './sails.js';
import { scoopWheelSite } from './scoopWheel.js';
import { houseGeometry, houseGlassGeometry } from './houses.js';
import { brickTexture, thatchTexture } from './textures.js';
import { merge } from './geometry.js';

const UP = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);

function instanced(geometry, material, matrices, { cast = true, receive = true } = {}) {
  const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
  matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  mesh.computeBoundingSphere();
  return mesh;
}

// Assemble les deux rangées (8 moulins ronds + 8 octogonaux) avec des InstancedMesh :
// une poignée de draw calls pour 16 moulins complets.
export function createMills() {
  const group = new THREE.Group();
  const trimMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 });
  const rotorMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#27313d', roughness: 0.3, emissive: '#ffae5e', emissiveIntensity: 0 });
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.95 });
  const thatchMat = new THREE.MeshStandardMaterial({ map: thatchTexture(), roughness: 1 });
  // Le contrefort utilise des UV en mètres : une tuile de brique = 4 m.
  const buttressMat = new THREE.MeshStandardMaterial({ map: brickTexture(0.25, 0.25), roughness: 0.95, color: '#d9d2ca' });

  const yawQ = new THREE.Quaternion().setFromAxisAngle(UP, LAYOUT.yaw);
  const site = scoopWheelSite();
  site.rotateY(-LAYOUT.yaw);
  const tilt = THREE.MathUtils.degToRad(CAP.tiltDeg);
  const rotorGeo = rotorGeometry();
  const rotors = [];

  const types = [
    { parts: roundMillParts(), bodyMat: brickMat, list: LAYOUT.nederwaard },
    { parts: octagonalMillParts(), bodyMat: thatchMat, list: LAYOUT.overwaard },
  ];
  for (const t of types) {
    const mats = t.list.map((p) => new THREE.Matrix4().compose(new THREE.Vector3(p.x, 0, p.z), yawQ, ONE));
    group.add(instanced(t.parts.body, t.bodyMat, mats));
    group.add(instanced(merge([t.parts.trim, site]), trimMat, mats));
    group.add(instanced(t.parts.glass, glassMat, mats, { cast: false }));
    const rotor = instanced(rotorGeo, rotorMat, mats);
    rotor.frustumCulled = false;
    group.add(rotor);
    const axle = new THREE.Matrix4()
      .makeTranslation(0, t.parts.axleY, t.parts.hubZ)
      .multiply(new THREE.Matrix4().makeRotationX(-tilt));
    rotors.push({ mesh: rotor, bases: mats.map((m) => m.clone().multiply(axle)), phases: t.list.map((p) => p.phase) });
  }

  const buttress = new THREE.Mesh(buttressGeometry(), buttressMat);
  buttress.position.set(LAYOUT.hero.x, 0, LAYOUT.hero.z);
  buttress.quaternion.copy(yawQ);
  buttress.castShadow = true;
  buttress.receiveShadow = true;
  group.add(buttress);

  const houseMats = LAYOUT.houses.map((h) => new THREE.Matrix4().makeTranslation(h.x, 0, h.z));
  group.add(instanced(houseGeometry(), trimMat, houseMats));
  group.add(instanced(houseGlassGeometry(), glassMat, houseMats, { cast: false }));

  const rot = new THREE.Matrix4();
  const tmp = new THREE.Matrix4();
  function setTime(t) {
    for (const r of rotors) {
      r.bases.forEach((base, i) => {
        rot.makeRotationZ(r.phases[i] + SAILS.speed * t);
        tmp.multiplyMatrices(base, rot);
        r.mesh.setMatrixAt(i, tmp);
      });
      r.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  function setNight(night) {
    glassMat.emissiveIntensity = night ? 2.4 : 0;
    glassMat.color.set(night ? '#3a3024' : '#27313d');
  }

  setTime(0);
  return { group, setTime, setNight };
}
