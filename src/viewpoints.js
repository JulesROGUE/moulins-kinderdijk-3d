// Points de vue nommés, choisis près des angles des photos de référence
// (berge en face du moulin, trois quarts depuis le chemin, rangée le long du boezem
// au téléobjectif, vue aérienne sur les deux rangées).
export const VIEWPOINTS = {
  berge: { label: 'Berge', position: [48, 2.0, -21], target: [-0.8, 12.0, 13.8], fov: 50 },
  moulin: { label: 'Moulin', position: [34.5, 1.8, 19.5], target: [0, 13.5, 26], fov: 50 },
  rangee: { label: 'Rangée', position: [230, 3.0, -24], target: [-150, 8, 24], fov: 28 },
  aerien: { label: 'Vue aérienne', position: [70, 105, -235], target: [-170, 0, -70], fov: 50 },
};

export const VIEW_ORDER = ['berge', 'moulin', 'rangee', 'aerien'];
export const DEFAULT_VIEW = 'berge';

export function viewFromHash(hash) {
  const id = String(hash || '').replace(/^#/, '').trim();
  return VIEWPOINTS[id] ? id : DEFAULT_VIEW;
}
