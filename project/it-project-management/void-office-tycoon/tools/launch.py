#!/usr/bin/env python3
"""Windows-first launcher for Void Office Tycoon."""

from __future__ import annotations

import argparse
import os
import platform
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = PROJECT_ROOT / "server"
CLIENT_DIR = PROJECT_ROOT / "client"
API_PORT = 8000
CLIENT_PORT = 5173
API_URL = f"http://127.0.0.1:{API_PORT}"
CLIENT_URL = f"http://127.0.0.1:{CLIENT_PORT}"


def npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def rollup_native_package() -> str | None:
    system = platform.system().lower()
    machine = platform.machine().lower()
    if system == "windows" and machine in {"amd64", "x86_64"}:
        return "rollup-win32-x64-msvc"
    if system == "darwin" and machine in {"arm64", "aarch64"}:
        return "rollup-darwin-arm64"
    if system == "darwin":
        return "rollup-darwin-x64"
    if system == "linux" and machine in {"amd64", "x86_64"}:
        return "rollup-linux-x64-gnu"
    if system == "linux" and machine in {"arm64", "aarch64"}:
        return "rollup-linux-arm64-gnu"
    return None


def rollup_native_available() -> tuple[bool, str]:
    package = rollup_native_package()
    if package is None:
        return True, "not checked on this platform"
    path = CLIENT_DIR / "node_modules" / "@rollup" / package
    return path.exists(), str(path)


def api_python() -> Path:
    if os.name == "nt":
        venv_python = SERVER_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = SERVER_DIR / ".venv" / "bin" / "python"
    return venv_python if venv_python.exists() else Path(sys.executable)


def command_version(command: list[str], cwd: Path = PROJECT_ROOT) -> tuple[bool, str]:
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            check=False,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        return False, "not found"
    output = (result.stdout or result.stderr).strip().splitlines()
    return result.returncode == 0, output[0] if output else f"exit {result.returncode}"


def module_available(python: Path, module_name: str) -> bool:
    result = subprocess.run(
        [str(python), "-c", f"import {module_name}"],
        cwd=SERVER_DIR,
        check=False,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def port_is_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.25)
        return sock.connect_ex(("127.0.0.1", port)) != 0


def url_ok(url: str, expected: bytes | None = None) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            body = response.read(5000)
        return response.status == 200 and (expected is None or expected in body)
    except Exception:
        return False


def services_healthy() -> bool:
    return url_ok(f"{API_URL}/api/health", b"void-office-tycoon-api") and url_ok(
        f"{CLIENT_URL}/", b"Void Office Tycoon"
    )


def wait_for_services(timeout: float = 20.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if services_healthy():
            return True
        time.sleep(0.25)
    return False


def maybe_open_browser(open_browser: bool) -> None:
    if open_browser:
        webbrowser.open(CLIENT_URL)


def print_check(label: str, ok: bool, detail: str) -> None:
    status = "OK" if ok else "MISSING"
    print(f"[{status}] {label}: {detail}")


def doctor() -> int:
    failures = 0
    python = api_python()
    python_ok, python_detail = command_version([str(python), "--version"])
    print_check("Python", python_ok, f"{python_detail} ({python})")
    failures += 0 if python_ok else 1

    aiohttp_ok = python_ok and module_available(python, "aiohttp")
    print_check("aiohttp", aiohttp_ok, "available to API Python" if aiohttp_ok else "install server requirements")
    failures += 0 if aiohttp_ok else 1

    node_ok, node_detail = command_version(["node", "--version"], cwd=CLIENT_DIR)
    print_check("Node.js", node_ok, node_detail)
    failures += 0 if node_ok else 1

    npm = npm_command()
    npm_ok, npm_detail = command_version([npm, "--version"], cwd=CLIENT_DIR)
    print_check("npm", npm_ok, npm_detail)
    failures += 0 if npm_ok else 1

    vite_path = CLIENT_DIR / "node_modules" / "vite"
    print_check("Client dependencies", vite_path.exists(), str(vite_path))
    failures += 0 if vite_path.exists() else 1

    rollup_ok, rollup_detail = rollup_native_available()
    print_check("Rollup native package", rollup_ok, rollup_detail)
    failures += 0 if rollup_ok else 1

    proposal_path = SERVER_DIR / "proposal" / "it_project_management_2300005633.json"
    print_check("Proposal JSON", proposal_path.exists(), str(proposal_path))
    failures += 0 if proposal_path.exists() else 1

    print_check("API port", port_is_free(API_PORT), f"127.0.0.1:{API_PORT}")
    print_check("Client port", port_is_free(CLIENT_PORT), f"127.0.0.1:{CLIENT_PORT}")
    return 0 if failures == 0 else 1


def ensure_api_ready() -> Path:
    python = api_python()
    if not module_available(python, "aiohttp"):
        raise SystemExit(
            "aiohttp is not available. Run the setup commands in SETUP_WINDOWS.md first."
        )
    return python


def ensure_client_ready() -> str:
    npm = npm_command()
    if shutil.which(npm) is None:
        raise SystemExit("npm was not found. Install Node.js LTS first.")
    if not (CLIENT_DIR / "node_modules" / "vite").exists():
        raise SystemExit(
            "Client dependencies are missing. Run `cd client` then `npm install` first."
        )
    rollup_ok, rollup_detail = rollup_native_available()
    if not rollup_ok:
        raise SystemExit(
            f"Rollup's native package is missing: {rollup_detail}. "
            "Run `cd client` then `npm.cmd install` on Windows."
        )
    return npm


def run_api() -> int:
    python = ensure_api_ready()
    print(f"Starting API on {API_URL}")
    return subprocess.call([str(python), "app.py"], cwd=SERVER_DIR)


def run_client() -> int:
    npm = ensure_client_ready()
    print(f"Starting client on {CLIENT_URL}")
    return subprocess.call([npm, "run", "dev"], cwd=CLIENT_DIR)


def terminate(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def run_all(open_browser: bool = False) -> int:
    python = ensure_api_ready()
    npm = ensure_client_ready()
    if not port_is_free(API_PORT) or not port_is_free(CLIENT_PORT):
        if services_healthy():
            print(f"Void Office Tycoon is already running at {CLIENT_URL}")
            maybe_open_browser(open_browser)
            return 0
        raise SystemExit(
            f"Port {API_PORT} or {CLIENT_PORT} is already in use, but the app is not healthy."
        )

    api_process = subprocess.Popen([str(python), "app.py"], cwd=SERVER_DIR)
    time.sleep(1.5)
    client_process = subprocess.Popen([npm, "run", "dev"], cwd=CLIENT_DIR)
    if wait_for_services():
        maybe_open_browser(open_browser)
    else:
        print("Warning: services did not become healthy within 20 seconds.")
    print(f"API: {API_URL}")
    print(f"Client: {CLIENT_URL}")
    print("Press Ctrl+C to stop both processes.")

    try:
        while True:
            api_code = api_process.poll()
            client_code = client_process.poll()
            if api_code is not None:
                terminate(client_process)
                return int(api_code)
            if client_code is not None:
                terminate(api_process)
                return int(client_code)
            time.sleep(0.5)
    except KeyboardInterrupt:
        terminate(client_process)
        terminate(api_process)
        return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Launch Void Office Tycoon services.")
    parser.add_argument("command", choices=("doctor", "api", "client", "all"))
    parser.add_argument(
        "--open",
        action="store_true",
        help="Open the client URL in the default browser when using `all`.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.command == "doctor":
        return doctor()
    if args.command == "api":
        return run_api()
    if args.command == "client":
        return run_client()
    if args.command == "all":
        return run_all(open_browser=args.open)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
