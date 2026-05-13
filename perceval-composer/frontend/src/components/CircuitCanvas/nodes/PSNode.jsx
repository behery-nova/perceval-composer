// PSNode.jsx — Phase Shifter custom React Flow node
import { Handle, Position } from 'reactflow';
import { useCircuitStore } from '../../../store/circuitStore';

export default function PSNode({ id, data, selected }) {
  const updateNodeData = useCircuitStore((s) => s.updateNodeData);
  const phiDeg = ((data.phi ?? 0) * 180 / Math.PI).toFixed(1);

  return (
    <div className={`node-card node-ps ${selected ? 'node-selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="in-0" className="handle" />

      <div className="node-icon">φ</div>
      <div className="node-label">{data.label || 'Phase Shifter'}</div>

      <div className="node-param">
        <span className="param-label">φ = {phiDeg}°</span>
        <input
          type="range"
          min={0}
          max={2 * Math.PI}
          step={0.01}
          value={data.phi ?? 0}
          onChange={(e) => updateNodeData(id, { phi: parseFloat(e.target.value) })}
          className="param-slider"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>

      <Handle type="source" position={Position.Right} id="out-0" className="handle" />
    </div>
  );
}
