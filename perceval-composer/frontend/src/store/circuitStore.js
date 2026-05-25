// circuitStore.js — Zustand global state for the Perceval Composer
import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { generatePercevalCode, patchReferenceCode } from '../utils/codeGenerator';
import { runCode, loadCHSH } from '../utils/api';

let nodeIdCounter = 1;

const defaultNodes = [];
const defaultEdges = [];

/** React Flow layout updates — must not replace loaded testcase Python. */
function isCosmeticNodeChange(changes) {
  return (
    changes.length > 0 &&
    changes.every((c) => c.type === 'dimensions' || c.type === 'select')
  );
}

function isStructuralEdgeChange(changes) {
  return changes.some((c) => c.type === 'add' || c.type === 'remove' || c.type === 'reset');
}

export const useCircuitStore = create((set, get) => ({
  nodes: defaultNodes,
  edges: defaultEdges,

  generatedCode: '# Add components to the canvas to generate code',
  referenceCode: null,
  results: null,
  isRunning: false,
  error: null,
  activeTab: 'code',

  onNodesChange: (changes) => {
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes);

      if (state.referenceCode && isCosmeticNodeChange(changes)) {
        return { nodes };
      }

      const structural = changes.some(
        (c) => c.type === 'add' || c.type === 'remove' || c.type === 'reset' || c.type === 'replace',
      );

      if (state.referenceCode && !structural) {
        return { nodes };
      }

      return {
        nodes,
        referenceCode: null,
        generatedCode: generatePercevalCode(nodes, state.edges),
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges);

      if (state.referenceCode && !isStructuralEdgeChange(changes)) {
        return { edges };
      }

      return {
        edges,
        referenceCode: null,
        generatedCode: generatePercevalCode(state.nodes, edges),
      };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const edges = addEdge(
        { ...connection, animated: true, style: { stroke: '#a78bfa' } },
        state.edges,
      );
      return {
        edges,
        referenceCode: null,
        generatedCode: generatePercevalCode(state.nodes, edges),
      };
    });
  },

  addNode: (type, position) => {
    const id = `${type}-${nodeIdCounter++}`;
    const defaults = {
      bs:     { theta: Math.PI / 4, label: 'Beam Splitter' },
      ps:     { phi: 0,             label: 'Phase Shifter'  },
      mirror: { label: 'Mirror'                             },
      source: { photons: 1,         label: 'Photon Source'  },
    };
    const newNode = { id, type, position, data: { ...defaults[type], id } };
    set((state) => {
      const nodes = [...state.nodes, newNode];
      return {
        nodes,
        referenceCode: null,
        generatedCode: generatePercevalCode(nodes, state.edges),
      };
    });
  },

  updateNodeData: (id, data) => {
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      );
      const node = nodes.find((n) => n.id === id);

      if (state.referenceCode && node) {
        const generatedCode = patchReferenceCode(state.referenceCode, node, data);
        return { nodes, referenceCode: generatedCode, generatedCode };
      }

      return {
        nodes,
        generatedCode: generatePercevalCode(nodes, state.edges),
      };
    });
  },

  runCircuit: async () => {
    const { generatedCode } = get();
    set({ isRunning: true, error: null, activeTab: 'results' });
    try {
      const result = await runCode(generatedCode);
      if (result.error) {
        set({ error: result.error, results: null });
      } else {
        set({ results: result, error: null });
      }
    } catch (err) {
      set({ error: err.message || 'Network error — is the backend running?' });
    } finally {
      set({ isRunning: false });
    }
  },

  clearCircuit: () => {
    nodeIdCounter = 1;
    set({
      nodes: [],
      edges: [],
      results: null,
      error: null,
      referenceCode: null,
      generatedCode: '# Add components to the canvas to generate code',
    });
  },

  loadTestCase: async () => {
    set({ isRunning: true, error: null });
    try {
      const tc = await loadCHSH();
      nodeIdCounter = 100;
      set({
        nodes: tc.circuit_json.nodes.map((n) => ({ ...n })),
        edges: tc.circuit_json.edges.map((e) => ({
          ...e,
          animated: true,
          style: { stroke: '#a78bfa' },
        })),
        referenceCode: tc.code,
        generatedCode: tc.code,
        results: null,
        error: null,
      });
    } catch (err) {
      set({ error: err.message || 'Failed to load test case' });
    } finally {
      set({ isRunning: false });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  dismissError: () => set({ error: null }),
}));
