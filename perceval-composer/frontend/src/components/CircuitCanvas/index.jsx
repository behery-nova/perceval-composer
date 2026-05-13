// CircuitCanvas/index.jsx — React Flow drag-and-drop circuit canvas
import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useCircuitStore } from '../../store/circuitStore';
import BSNode     from './nodes/BSNode';
import PSNode     from './nodes/PSNode';
import SourceNode from './nodes/SourceNode';
import MirrorNode from './nodes/MirrorNode';

const nodeTypes = {
  bs:     BSNode,
  ps:     PSNode,
  source: SourceNode,
  mirror: MirrorNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#a78bfa', strokeWidth: 2 },
};

export default function CircuitCanvas() {
  const reactFlowWrapper = useRef(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCircuitStore();

  // Handle drop from ComponentPalette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      // Convert screen coords → flow coords (approximate without RF instance)
      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top  - 40,
      };
      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="canvas-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e2a3a"
        />
        <Controls className="rf-controls" />
        <MiniMap
          nodeColor={(n) =>
            n.type === 'bs'     ? '#7c3aed' :
            n.type === 'ps'     ? '#0d9488' :
            n.type === 'source' ? '#d97706' :
            '#475569'
          }
          maskColor="rgba(0,0,0,0.6)"
          style={{ background: '#0d1117', border: '1px solid #1e2a3a' }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="canvas-empty-state">
          <div className="empty-icon">⬡</div>
          <p>Drag components from the palette onto the canvas</p>
          <p className="empty-sub">Connect nodes by dragging from a handle</p>
        </div>
      )}
    </div>
  );
}
