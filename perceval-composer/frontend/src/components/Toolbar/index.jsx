// Toolbar/index.jsx — Run, Clear, Load Test Case controls
import { useCircuitStore } from '../../store/circuitStore';

export default function Toolbar() {
  const runCircuit   = useCircuitStore((s) => s.runCircuit);
  const clearCircuit = useCircuitStore((s) => s.clearCircuit);
  const loadTestCase = useCircuitStore((s) => s.loadTestCase);
  const isRunning    = useCircuitStore((s) => s.isRunning);
  const nodes        = useCircuitStore((s) => s.nodes);
  const results      = useCircuitStore((s) => s.results);
  const error        = useCircuitStore((s) => s.error);

  const status = isRunning ? 'running' : error ? 'error' : results ? 'success' : 'idle';

  const statusLabel = {
    idle:    'Idle',
    running: 'Simulating…',
    error:   'Error',
    success: 'Success',
  }[status];

  return (
    <header className="toolbar">
      {/* Brand */}
      <div className="toolbar-brand">
        <span className="toolbar-logo">⬡</span>
        <span className="toolbar-name">Perceval Composer</span>
      </div>

      {/* Controls */}
      <div className="toolbar-actions">
        <button
          id="btn-load-chsh"
          className="btn btn-secondary"
          onClick={loadTestCase}
          disabled={isRunning}
          title="Load the CHSH Bell Inequality demo circuit"
        >
          ⚛ Load CHSH Demo
        </button>

        <button
          id="btn-clear"
          className="btn btn-ghost"
          onClick={clearCircuit}
          disabled={isRunning}
          title="Clear the canvas"
        >
          ✕ Clear
        </button>

        <button
          id="btn-run"
          className={`btn btn-primary ${isRunning ? 'btn-loading' : ''}`}
          onClick={runCircuit}
          disabled={isRunning || nodes.length === 0}
          title="Run simulation (backend required)"
        >
          {isRunning ? (
            <><span className="btn-spinner" /> Running…</>
          ) : (
            '▶ Run'
          )}
        </button>
      </div>

      {/* Status badge */}
      <div className={`status-badge status-${status}`}>
        <span className="status-dot" />
        {statusLabel}
      </div>
    </header>
  );
}
