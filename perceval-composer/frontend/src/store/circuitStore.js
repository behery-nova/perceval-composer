// circuitStore.js — Zustand global state for the Perceval Composer
import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { generatePercevalCode } from '../utils/codeGenerator';
import { runCode, loadCHSH } from '../utils/api';

let nodeIdCounter = 1;

const defaultNodes = [];
const defaultEdges = [];

export const useCircuitStore = create((set, get) => ({
  // ── React Flow state ───────────────────────────────────────────────────────
  nodes: defaultNodes,
  edges: defaultEdges,

  // ── App state ──────────────────────────────────────────────────────────────
  generatedCode: '# Add components to the canvas to generate code',
  results: null,       // { probabilities: [], labels: [], raw_output: '' }
  isRunning: false,
  error: null,
  activeTab: 'code',   // 'code' | 'results'

  // ── React Flow handlers ────────────────────────────────────────────────────
  onNodesChange: (changes) => {
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes);
      return { nodes, generatedCode: generatePercevalCode(nodes, state.edges) };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges);
      return { edges, generatedCode: generatePercevalCode(state.nodes, edges) };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const edges = addEdge({ ...connection, animated: true, style: { stroke: '#a78bfa' } }, state.edges);
      return { edges, generatedCode: generatePercevalCode(state.nodes, edges) };
    });
  },

  // ── Node creation (called on canvas drop) ─────────────────────────────────
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
      return { nodes, generatedCode: generatePercevalCode(nodes, state.edges) };
    });
  },

  // ── Node data update (slider changes) ─────────────────────────────────────
  updateNodeData: (id, data) => {
    set((state) => {
      const nodes = state.nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n);
      return { nodes, generatedCode: generatePercevalCode(nodes, state.edges) };
    });
  },

  // ── Circuit actions ────────────────────────────────────────────────────────
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
      generatedCode: '# Add components to the canvas to generate code',
    });
  },

  loadTestCase: async () => {
    set({ isRunning: true, error: null });
    try {
      const tc = await loadCHSH();
      nodeIdCounter = 100; // avoid id collisions
      set({
        nodes: tc.circuit_json.nodes.map((n) => ({ ...n })),
        edges: tc.circuit_json.edges.map((e) => ({
          ...e, animated: true, style: { stroke: '#a78bfa' },
        })),
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
