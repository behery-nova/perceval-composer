"""
main.py
FastAPI application — routes for running Perceval circuits and loading test cases.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .perceval_runner import run_perceval_code
import json, pathlib

app = FastAPI(title="Perceval Composer API", version="1.0.0")

# Allow Vite dev server (port 5173) and production build (port 4173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────────────

class RunRequest(BaseModel):
    code: str


class RunResponse(BaseModel):
    probabilities: list[float]
    labels: list[str]
    raw_output: str
    error: str | None


class TestCaseResponse(BaseModel):
    name: str
    description: str
    code: str
    circuit_json: dict


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/run", response_model=RunResponse)
async def run_circuit(req: RunRequest):
    """Execute Perceval code and return the probability distribution."""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
    result = run_perceval_code(req.code)
    return RunResponse(**result)


@app.get("/testcase/chsh", response_model=TestCaseResponse)
async def get_chsh_testcase():
    """Return the CHSH Bell-inequality demo circuit."""
    tc_path = pathlib.Path(__file__).parent / "testcases" / "chsh.py"
    code = tc_path.read_text(encoding="utf-8")

    # Canonical circuit JSON that the frontend will render
    circuit_json = {
        "nodes": [
            {"id": "source-0", "type": "source", "position": {"x": 60, "y": 220},
             "data": {"photons": 2, "label": "2-Photon Source"}},
            {"id": "bs-0",     "type": "bs",     "position": {"x": 220, "y": 160},
             "data": {"theta": 0.7854, "label": "BS₁ (π/4)"}},
            {"id": "ps-0",     "type": "ps",     "position": {"x": 380, "y": 120},
             "data": {"phi": 0.0,    "label": "PS Alice"}},
            {"id": "bs-1",     "type": "bs",     "position": {"x": 540, "y": 160},
             "data": {"theta": 0.7854, "label": "BS₂ (π/4)"}},
            {"id": "ps-1",     "type": "ps",     "position": {"x": 380, "y": 300},
             "data": {"phi": 0.7854, "label": "PS Bob (π/4)"}},
            {"id": "bs-2",     "type": "bs",     "position": {"x": 540, "y": 340},
             "data": {"theta": 0.7854, "label": "BS₃ (π/4)"}},
        ],
        "edges": [
            {"id": "e0", "source": "source-0", "sourceHandle": "out-0", "target": "bs-0",  "targetHandle": "in-0"},
            {"id": "e1", "source": "source-0", "sourceHandle": "out-1", "target": "bs-0",  "targetHandle": "in-1"},
            {"id": "e2", "source": "bs-0",     "sourceHandle": "out-0", "target": "ps-0",  "targetHandle": "in-0"},
            {"id": "e3", "source": "bs-0",     "sourceHandle": "out-1", "target": "ps-1",  "targetHandle": "in-0"},
            {"id": "e4", "source": "ps-0",     "sourceHandle": "out-0", "target": "bs-1",  "targetHandle": "in-0"},
            {"id": "e5", "source": "ps-1",     "sourceHandle": "out-0", "target": "bs-2",  "targetHandle": "in-0"},
        ],
    }

    return TestCaseResponse(
        name="CHSH Bell Inequality",
        description=(
            "Demonstrates quantum entanglement via the CHSH game. "
            "Two photons enter a 50/50 beam splitter, are phase-shifted by Alice and Bob, "
            "and recombined. The resulting coincidence probabilities violate the classical CHSH bound of 2."
        ),
        code=code,
        circuit_json=circuit_json,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
