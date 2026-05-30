from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
LOGS_DIR = DATA_DIR / "logs"
PROPOSAL_PATH = ROOT / "proposal" / "it_project_management_2300005633.json"


class StorageError(RuntimeError):
    pass


def ensure_dirs() -> None:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        if default is not None:
            return default
        raise StorageError(f"Missing JSON file: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(path.suffix + ".tmp")
    with temp_path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    temp_path.replace(path)


def session_path(session_id: str) -> Path:
    safe = "".join(ch for ch in session_id if ch.isalnum() or ch in "-_")
    return SESSIONS_DIR / f"{safe}.json"


def log_path(session_id: str) -> Path:
    safe = "".join(ch for ch in session_id if ch.isalnum() or ch in "-_")
    return LOGS_DIR / f"{safe}.json"


def load_proposal() -> dict[str, Any]:
    return read_json(PROPOSAL_PATH)


def save_session(session: dict[str, Any]) -> None:
    ensure_dirs()
    write_json(session_path(session["sessionId"]), session)


def load_session(session_id: str) -> dict[str, Any]:
    return read_json(session_path(session_id))


def append_log(session_id: str, entry: dict[str, Any]) -> list[dict[str, Any]]:
    ensure_dirs()
    path = log_path(session_id)
    entries = read_json(path, default=[])
    entries.append(entry)
    write_json(path, entries)
    return entries


def load_log(session_id: str) -> list[dict[str, Any]]:
    return read_json(log_path(session_id), default=[])
