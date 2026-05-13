// ComponentPalette/index.jsx — Sidebar with draggable quantum component tiles
const COMPONENTS = [
  {
    type: 'source',
    label: 'Photon Source',
    icon: '⬡',
    description: 'Emits N photons into the circuit',
    color: 'palette-source',
  },
  {
    type: 'bs',
    label: 'Beam Splitter',
    icon: '⟨BS⟩',
    description: '50/50 or tunable reflectivity',
    color: 'palette-bs',
  },
  {
    type: 'ps',
    label: 'Phase Shifter',
    icon: 'φ',
    description: 'Apply a phase shift φ to a mode',
    color: 'palette-ps',
  },
  {
    type: 'mirror',
    label: 'Mirror',
    icon: '↔',
    description: 'Reflect / SWAP two modes',
    color: 'palette-mirror',
  },
];

export default function ComponentPalette() {
  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="palette">
      <div className="palette-header">
        <span className="palette-logo">⬡</span>
        <div>
          <h1 className="palette-title">Perceval Composer</h1>
          <p className="palette-subtitle">Photonic Circuit IDE</p>
        </div>
      </div>

      <div className="palette-section-label">Components</div>

      <div className="palette-list">
        {COMPONENTS.map((comp) => (
          <div
            key={comp.type}
            className={`palette-item ${comp.color}`}
            draggable
            onDragStart={(e) => onDragStart(e, comp.type)}
            title={`Drag to add: ${comp.label}`}
          >
            <span className="palette-item-icon">{comp.icon}</span>
            <div className="palette-item-info">
              <span className="palette-item-label">{comp.label}</span>
              <span className="palette-item-desc">{comp.description}</span>
            </div>
            <span className="palette-drag-hint">⠿</span>
          </div>
        ))}
      </div>

      <div className="palette-section-label" style={{ marginTop: '1.5rem' }}>How to use</div>
      <div className="palette-help">
        <div className="help-step"><span>1</span> Drag components onto the canvas</div>
        <div className="help-step"><span>2</span> Connect nodes by dragging handles</div>
        <div className="help-step"><span>3</span> Adjust parameters via sliders</div>
        <div className="help-step"><span>4</span> Click <strong>Run</strong> to simulate</div>
      </div>
    </aside>
  );
}
