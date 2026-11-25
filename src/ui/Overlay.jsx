import { VIEW_ORDER, VIEWPOINTS } from '../viewpoints.js';

export default function Overlay({ view, night, sails, tour, onView, onNight, onSails, onTour }) {
  return (
    <div className={`kd-overlay${night ? ' is-night' : ''}`}>
      <section className="kd-card" aria-label="Fiche du site">
        <p className="kd-eyebrow">Patrimoine mondial de l'UNESCO · 1997</p>
        <h1 className="kd-title">Moulins de Kinderdijk</h1>
        <p className="kd-place">Kinderdijk, Hollande-Méridionale · Pays-Bas</p>
        <dl className="kd-stats">
          <div><dt>19</dt><dd>moulins sur le site</dd></div>
          <div><dt>1738</dt><dd>8 moulins ronds en brique (Nederwaard)</dd></div>
          <div><dt>1740</dt><dd>8 moulins octogonaux à chaume (Overwaard)</dd></div>
          <div><dt>6,30 m</dt><dd>diamètre des roues à aubes</dd></div>
        </dl>
        <p className="kd-note">Reproduction stylisée, modélisée en code avec l'aide de l'IA.</p>
      </section>

      <p className="kd-help">Glisser : tourner · Molette : zoomer · Clic droit : déplacer</p>

      <nav className="kd-bar" aria-label="Commandes">
        {VIEW_ORDER.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`kd-btn${view === id ? ' is-active' : ''}`}
            onClick={() => onView(id)}
            title={`Touche ${index + 1}`}
          >
            <span className="kd-key">{index + 1}</span>
            {VIEWPOINTS[id].label}
          </button>
        ))}
        <span className="kd-sep" aria-hidden="true" />
        <button type="button" className="kd-btn" onClick={onNight} title="Touche N">
          {night ? 'Jour' : 'Nuit'}
        </button>
        <button type="button" className={`kd-btn${sails ? ' is-active' : ''}`} onClick={onSails}>
          Ailes
        </button>
        <button type="button" className={`kd-btn${tour ? ' is-active' : ''}`} onClick={onTour}>
          Visite
        </button>
      </nav>
    </div>
  );
}
