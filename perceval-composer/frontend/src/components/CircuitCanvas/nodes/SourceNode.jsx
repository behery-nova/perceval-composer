// SourceNode.jsx — Photon Source custom React Flow node
import { Handle, Position } from 'reactflow';
import { useCircuitStore } from '../../../store/circuitStore';

export default function SourceNode({ id, data, selected }) {
  const updateNodeData = useCircuitStore((s) => s.updateNodeData);

  return (
    <div className={`node-card node-source ${selected ? 'node-selected' : ''}`}>
      <div className="node-icon">⬡</div>
      <div className="node-label">{data.label || 'Photon Source'}</div>

      <div className="node-param">
        <span className="param-label">Photons: {data.photons ?? 1}</span>
        <input
          type="range"
          min={1}
          max={4}
          step={1}
          value={data.photons ?? 1}
          onChange={(e) => updateNodeData(id, { photons: parseInt(e.target.value) })}
          className="param-slider"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Only output handles */}
      <Handle type="source" position={Position.Right} id="out-0" style={{ top: '40%' }} className="handle" />
      <Handle type="source" position={Position.Right} id="out-1" style={{ top: '65%' }} className="handle" />
    </div>
  );
}
