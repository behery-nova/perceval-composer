// App.jsx — Main application layout
import { useState } from 'react';
import Toolbar          from './components/Toolbar';
import ComponentPalette from './components/ComponentPalette';
import CircuitCanvas    from './components/CircuitCanvas';
import CodePanel        from './components/CodePanel';
import ResultsPanel     from './components/ResultsPanel';
import { useCircuitStore } from './store/circuitStore';

export default function App() {
  const [rightTab, setRightTab] = useState('code'); // 'code' | 'results'
  const results   = useCircuitStore((s) => s.results);
  const isRunning = useCircuitStore((s) => s.isRunning);
  const error     = useCircuitStore((s) => s.error);

  // Auto-switch to results tab when run completes
  const hasResults = results || error;

  return (
    <div className="app-root">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main 3-column layout */}
      <div className="app-body">
        {/* Left: Component palette */}
        <ComponentPalette />

        {/* Centre: Circuit canvas */}
        <main className="app-canvas">
          <CircuitCanvas />
        </main>

        {/* Right: Code + Results tabs */}
        <aside className="app-right">
          <div className="right-tabs">
            <button
              id="tab-code"
              className={`tab-btn ${rightTab === 'code' ? 'tab-active' : ''}`}
              onClick={() => setRightTab('code')}
            >
              🐍 Code
            </button>
            <button
              id="tab-results"
              className={`tab-btn ${rightTab === 'results' ? 'tab-active' : ''} ${isRunning ? 'tab-pulse' : ''}`}
              onClick={() => setRightTab('results')}
            >
              📊 Results {hasResults && !isRunning && <span className="tab-dot" />}
            </button>
          </div>

          <div className="right-content">
            {rightTab === 'code'    && <CodePanel />}
            {rightTab === 'results' && <ResultsPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
}
