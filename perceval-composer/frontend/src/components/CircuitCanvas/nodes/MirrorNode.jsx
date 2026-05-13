// MirrorNode.jsx — Mirror (SWAP) custom React Flow node
import { Handle, Position } from 'reactflow';

export default function MirrorNode({ data, selected }) {
  return (
    <div className={`node-card node-mirror ${selected ? 'node-selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="in-0" className="handle" />
      <div className="node-icon">↔</div>
      <div className="node-label">{data.label || 'Mirror'}</div>
      <Handle type="source" position={Position.Right} id="out-0" className="handle" />
    </div>
  );
}
