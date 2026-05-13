"""
perceval_runner.py
Executes user-generated Perceval Python code in a controlled namespace
and extracts the probability distribution from the simulator result.
"""

import traceback
import io
import sys
from typing import Any


def run_perceval_code(code: str) -> dict:
    """
    Execute a Perceval Python code string.
    The code must assign its BSDistribution / StateVector result to a variable
    named `_result` OR call a Sampler/BasicSimulator and assign to `_result`.
    Returns a dict with keys: probabilities, labels, raw_output, error.
    """
    stdout_capture = io.StringIO()
    namespace: dict[str, Any] = {"__builtins__": __builtins__}

    try:
        import perceval as pcvl  # noqa: F401 – expose to executed code
        namespace["pcvl"] = pcvl
    except ImportError:
        return {
            "probabilities": [],
            "labels": [],
            "raw_output": "",
            "error": (
                "perceval-quandela is not installed in the current environment. "
                "Run: pip install perceval-quandela"
            ),
        }

    old_stdout = sys.stdout
    sys.stdout = stdout_capture
    error_msg = None

    try:
        exec(compile(code, "<perceval_code>", "exec"), namespace)  # noqa: S102
    except Exception:
        error_msg = traceback.format_exc()
    finally:
        sys.stdout = old_stdout

    raw_output = stdout_capture.getvalue()

    if error_msg:
        return {
            "probabilities": [],
            "labels": [],
            "raw_output": raw_output,
            "error": error_msg,
        }

    # Try to extract _result from the namespace
    result_obj = namespace.get("_result")
    if result_obj is None:
        return {
            "probabilities": [],
            "labels": [],
            "raw_output": raw_output,
            "error": (
                "No `_result` variable found. "
                "Assign your BSDistribution or probability dict to `_result`."
            ),
        }

    # Convert various Perceval result types to plain lists
    probabilities, labels = _extract_distribution(result_obj)

    return {
        "probabilities": probabilities,
        "labels": labels,
        "raw_output": raw_output,
        "error": None,
    }


def _extract_distribution(result_obj) -> tuple[list[float], list[str]]:
    """
    Handles BSDistribution, SVDistribution, dict, and plain numeric dicts.
    Returns (probabilities, labels) as plain Python lists.
    """
    labels = []
    probabilities = []

    # perceval BSDistribution / SVDistribution behave like dicts
    try:
        items = result_obj.items()
        for state, prob in items:
            labels.append(str(state))
            # prob may be a sympy Float or plain float
            probabilities.append(float(prob))
        return probabilities, labels
    except AttributeError:
        pass

    # Plain dict fallback
    if isinstance(result_obj, dict):
        for k, v in result_obj.items():
            labels.append(str(k))
            probabilities.append(float(v))
        return probabilities, labels

    return [], []
