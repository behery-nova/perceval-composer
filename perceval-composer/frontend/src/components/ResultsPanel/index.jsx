// ResultsPanel/index.jsx — Histogram + probability table
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useCircuitStore } from '../../store/circuitStore';

const COLORS = [
  '#7c3aed', '#0d9488', '#d97706', '#dc2626',
  '#2563eb', '#16a34a', '#9333ea', '#0891b2',
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-state">{payload[0].payload.label}</p>
        <p className="tooltip-prob">{(payload[0].value * 100).toFixed(3)}%</p>
      </div>
    );
  }
  return null;
};

export default function ResultsPanel() {
  const results    = useCircuitStore((s) => s.results);
  const error      = useCircuitStore((s) => s.error);
  const isRunning  = useCircuitStore((s) => s.isRunning);
  const dismissError = useCircuitStore((s) => s.dismissError);

  if (isRunning) {
    return (
      <div className="results-panel results-center">
        <div className="spinner" />
        <p className="running-text">Running simulation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel results-error">
        <div className="error-header">
          <span>⚠ Simulation Error</span>
          <button className="btn-ghost" onClick={dismissError}>✕</button>
        </div>
        <pre className="error-pre">{error}</pre>
      </div>
    );
  }

  if (!results || results.probabilities.length === 0) {
    return (
      <div className="results-panel results-center">
        <div className="empty-results-icon">📊</div>
        <p className="empty-results-text">Run the circuit to see results</p>
        <p className="empty-results-sub">Probability distributions will appear here</p>
      </div>
    );
  }

  const chartData = results.labels.map((label, i) => ({
    label,
    prob: results.probabilities[i],
  })).sort((a, b) => b.prob - a.prob);

  const totalProb = results.probabilities.reduce((s, p) => s + p, 0);

  return (
    <div className="results-panel">
      <div className="panel-header">
        <span className="panel-title">
          <span className="panel-title-icon">📊</span> Probability Distribution
        </span>
        <span className="results-badge">{chartData.length} states</span>
      </div>

      {/* Histogram */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-35}
              textAnchor="end"
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Probability table */}
      <div className="prob-table-wrapper">
        <table className="prob-table">
          <thead>
            <tr>
              <th>Output State</th>
              <th>Probability</th>
              <th>Bar</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={row.label} className="prob-row">
                <td className="state-label">{row.label}</td>
                <td className="prob-value">{(row.prob * 100).toFixed(4)}%</td>
                <td className="prob-bar-cell">
                  <div
                    className="prob-bar"
                    style={{
                      width: `${(row.prob / Math.max(...results.probabilities)) * 100}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="prob-total">
              <td>Total</td>
              <td>{(totalProb * 100).toFixed(4)}%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Raw output */}
      {results.raw_output && (
        <details className="raw-output-details">
          <summary>Raw stdout</summary>
          <pre className="raw-output-pre">{results.raw_output}</pre>
        </details>
      )}
    </div>
  );
}
