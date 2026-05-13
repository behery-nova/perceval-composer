# Perceval Composer

A **visual photonic quantum circuit IDE** built on top of [Perceval](https://github.com/Quandela/Perceval) by Quandela. Design linear-optical circuits by dragging components onto an interactive canvas, view auto-generated Python code, and run simulations against a FastAPI backend.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎛 Drag-and-drop canvas | Build circuits with Beam Splitters, Phase Shifters, Mirrors, Photon Sources |
| 🐍 Live code generation | Circuit → valid Perceval Python in real time |
| 📊 Simulation results | Probability histograms + sortable state table |
| ⚛ CHSH demo | One-click Bell inequality test circuit |
| 🌙 Dark theme | Glassmorphism UI with photonic color palette |

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | ≥ 3.10 | [python.org](https://python.org) |
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Bundled with Node.js |

> **Note**: Perceval requires a C++ compiler on some platforms. On Windows, install [Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if the install fails.

---

## Quick Start

### Windows
```bat
cd perceval-composer\launcher
start.bat
```

### Linux / macOS
```bash
chmod +x perceval-composer/launcher/start.sh
./perceval-composer/launcher/start.sh
```

The launcher will:
1. Create a `.venv` virtual environment
2. Install Python backend dependencies (`fastapi`, `uvicorn`, `perceval-quandela`)
3. Install Node frontend dependencies
4. Start the backend on **http://localhost:8000**
5. Start the frontend on **http://localhost:5173**

---

## Manual Start

### Backend
```bash
cd perceval-composer
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Unix
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd perceval-composer/frontend
npm install
npm run dev
```

---

## Project Structure

```
perceval-composer/
├── backend/
│   ├── main.py              # FastAPI app (POST /run, GET /testcase/chsh)
│   ├── perceval_runner.py   # Sandboxed Perceval code execution
│   ├── testcases/
│   │   └── chsh.py          # CHSH Bell inequality demo
│   └── requirements.txt
│
├── frontend/src/
│   ├── components/
│   │   ├── ComponentPalette/  # Draggable component sidebar
│   │   ├── CircuitCanvas/     # React Flow canvas + custom nodes
│   │   ├── CodePanel/         # Syntax-highlighted Python output
│   │   ├── ResultsPanel/      # Recharts histogram + table
│   │   └── Toolbar/           # Run / Clear / Load demo
│   ├── store/circuitStore.js  # Zustand global state
│   └── utils/
│       ├── codeGenerator.js   # Circuit JSON → Perceval Python
│       └── api.js             # Axios → FastAPI
│
├── launcher/
│   ├── start.bat              # Windows one-click launcher
│   └── start.sh               # Linux/macOS launcher
└── README.md
```

---

## API Reference

### `POST /run`
Execute Perceval code and return the probability distribution.

**Request:**
```json
{ "code": "import perceval as pcvl\n..." }
```

**Response:**
```json
{
  "probabilities": [0.5, 0.5],
  "labels": ["|1,0⟩", "|0,1⟩"],
  "raw_output": "...",
  "error": null
}
```

### `GET /testcase/chsh`
Returns the CHSH Bell inequality demo circuit JSON and Python code.

### `GET /health`
Returns `{ "status": "ok" }`.

---

## Writing Custom Circuits

Generated code uses this pattern — assign your result to `_result`:

```python
import perceval as pcvl

circuit = pcvl.Circuit(2)
circuit.add(0, pcvl.BS(theta=pcvl.BS.r_to_theta(0.5)))

input_state = pcvl.BasicState([1, 0])
backend = pcvl.BackendFactory.get_backend("Naive")
backend.set_circuit(circuit)
backend.set_input_state(input_state)

_result = backend.prob_distribution()  # ← must be named _result
```

---

## License

MIT — see [Perceval's license](https://github.com/Quandela/Perceval/blob/main/LICENSE) for the simulation framework.
