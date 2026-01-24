import "./firstrun.css";

export default function FirstRunModal({ onFresh, onPreset }) {
  return (
    <div className="gm-modal-backdrop">
      <div className="gm-modal">
        <h2>Welcome to GreenMacros 🌱</h2>

        <p>
          GreenMacros is a flexible planning tool — not a diet prescription.
        </p>

        <p>
          Would you like to start completely fresh, or load a simple structure
          you can customize?
        </p>

        <div className="gm-modal-actions">
          <button className="btn-secondary" onClick={onFresh}>
            Start fresh
          </button>

          <button className="btn-primary" onClick={onPreset}>
            Load preset
          </button>
        </div>

        <p className="gm-modal-note">
          Presets are neutral structures only — no calories or macro targets are
          enforced.
        </p>
      </div>
    </div>
  );
}
