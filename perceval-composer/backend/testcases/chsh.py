"""
chsh.py — CHSH Bell Inequality demonstration using Perceval 1.1.x

The CHSH game shows quantum mechanics can violate the classical bound of 2,
achieving up to 2√2 ≈ 2.828 with the optimal quantum strategy.

Circuit (4-mode linear optical):
  Input: |1,0,1,0⟩  (one photon in mode 0, one in mode 2)
  
  Layer 1: BS(50/50) on modes (0,1)  and  BS(50/50) on modes (2,3)  — entangling
  Layer 2: PS(phi_alice) on mode 1   and  PS(phi_bob) on mode 3     — measurement angles
  Layer 3: BS(50/50) on modes (0,1)  and  BS(50/50) on modes (2,3)  — analysis

Assign result to _result so perceval_runner.py can extract it.
"""

import perceval as pcvl
import math

# ── Parameters ────────────────────────────────────────────────────────────────
phi_alice = 0.0              # Alice's measurement angle (0 = 0°)
phi_bob   = math.pi / 4     # Bob's measurement angle   (45°)

# ── Circuit definition ────────────────────────────────────────────────────────
n_modes = 4
circuit = pcvl.Circuit(n_modes, name="CHSH Bell")

# Layer 1 — Entangling beam splitters
circuit.add(0, pcvl.BS())   # 50/50 on modes 0,1
circuit.add(2, pcvl.BS())   # 50/50 on modes 2,3

# Layer 2 — Phase shifters (measurement basis selection)
circuit.add(1, pcvl.PS(phi=phi_alice))
circuit.add(3, pcvl.PS(phi=phi_bob))

# Layer 3 — Analysis beam splitters
circuit.add(0, pcvl.BS())   # 50/50 on modes 0,1
circuit.add(2, pcvl.BS())   # 50/50 on modes 2,3

# ── Input state ───────────────────────────────────────────────────────────────
# One photon in Alice's input mode 0, one photon in Bob's input mode 2
input_state = pcvl.BasicState([1, 0, 1, 0])

# ── Simulation ────────────────────────────────────────────────────────────────
backend = pcvl.BackendFactory.get_backend("Naive")
backend.set_circuit(circuit)
backend.set_input_state(input_state)

_result = backend.prob_distribution()

# ── Pretty-print (captured as raw_output) ────────────────────────────────────
print("CHSH Bell Inequality - Output Probability Distribution")
print(f"Alice angle: {math.degrees(phi_alice):.1f} deg  |  Bob angle: {math.degrees(phi_bob):.1f} deg")
print("=" * 55)
total = 0.0
for state, prob in _result.items():
    p = float(prob)
    if p > 1e-6:
        print(f"  |{state}>  :  {p:.6f}  ({p*100:.2f}%)")
        total += p
print(f"\nTotal probability: {total:.6f}")
print("\nNote: Coincidence probabilities in modes (0,2) and (1,3)")
print("violate the classical CHSH bound of 2 (quantum max ~= 2.828).")
