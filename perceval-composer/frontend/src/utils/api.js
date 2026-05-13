// api.js — Axios calls to the FastAPI backend
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /run — execute Perceval code and return distribution
 * @param {string} code
 * @returns {{ probabilities: number[], labels: string[], raw_output: string, error: string|null }}
 */
export async function runCode(code) {
  const { data } = await client.post('/run', { code });
  return data;
}

/**
 * GET /testcase/chsh — load the CHSH Bell inequality demo
 * @returns {{ name, description, code, circuit_json }}
 */
export async function loadCHSH() {
  const { data } = await client.get('/testcase/chsh');
  return data;
}

/**
 * GET /health — ping backend
 */
export async function checkHealth() {
  const { data } = await client.get('/health');
  return data;
}
