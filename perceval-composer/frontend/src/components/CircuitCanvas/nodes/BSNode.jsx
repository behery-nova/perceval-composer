// BSNode.jsx — Beam Splitter custom React Flow node
import { Handle, Position, useReactFlow } from 'reactflow';
import { useCircuitStore } from '../../../store/circuitStore';

export default function BSNode({ id, data, selected }) {
  const updateNodeData = useCircuitStore((s) => s.updateNodeData);
  const thetaDeg = ((data.theta ?? Math.PI / 4) * 180 / Math.PI).toFixed(1);

  return (
    <div className={`node-card node-bs ${selected ? 'node-selected' : ''}`}>
      {/* Input handles */}
      <Handle type="target" position={Position.Left} id="in-0" style={{ top: '30%' }} className="handle" />
      <Handle type="target" position={Position.Left} id="in-1" style={{ top: '70%' }} className="handle" />

      <div className="node-icon">⟨BS⟩</div>
      <div className="node-label">{data.label || 'Beam Splitter'}</div>

      <div className="node-param">
        <span className="param-label">θ = {thetaDeg}°</span>
        <input
          type="range"
          min={0}
          max={Math.PI / 2}
          step={0.01}
          value={data.theta ?? Math.PI / 4}
          onChange={(e) => updateNodeData(id, { theta: parseFloat(e.target.value) })}
          className="param-slider"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Output handles */}
      <Handle type="source" position={Position.Right} id="out-0" style={{ top: '30%' }} className="handle" />
      <Handle type="source" position={Position.Right} id="out-1" style={{ top: '70%' }} className="handle" />
    </div>
  );
}
