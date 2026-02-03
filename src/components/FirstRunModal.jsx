import "./firstrun.css";

export default function FirstRunModal({ onFresh, onPreset, onImport }) {
  return (
    <div className="gm-modal-backdrop">
      <div className="gm-modal">
        <h2>Welcome to GreenMacros 🌱</h2>

        <p>
          GreenMacros is a flexible planning tool — not a diet prescription.
        </p>

        <p>
          {onImport 
            ? "A shared plan was detected. Would you like to import it, start fresh, or load a preset?" 
            : "Would you like to start completely fresh, or load a simple structure you can customize?"}
        </p>

        <div className="gm-modal-actions">
          {onImport && (
            <button className="btn-primary" onClick={onImport} style={{backgroundColor: '#2ecc71'}}>
              Import Shared Plan
            </button>
          )}
          
          <button className="btn-secondary" onClick={onFresh}>
            Start fresh
          </button>

          <button className="btn-primary" onClick={onPreset}>
            Load preset
          </button>
        </div>

        <p className="gm-modal-note">
          Presets are neutral structures only — no calories or macro targets are enforced.
        </p>
      </div>
    </div>
  );
}