#!/bin/zsh
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$SCRIPT_DIR/.void-office-pids"
PID_FILE="$PID_DIR/api.pid"
cd "$SCRIPT_DIR/server"

echo "Void Office Tycoon API"
echo "Project: $SCRIPT_DIR"
echo

if curl -fsS "http://127.0.0.1:8000/api/health" >/dev/null 2>&1; then
  echo "API is already running at http://127.0.0.1:8000"
  echo
  read -r "?Press Enter to close this window..."
  exit 0
fi

if [[ -x "$SCRIPT_DIR/server/.venv/bin/python" ]]; then
  PYTHON="$SCRIPT_DIR/server/.venv/bin/python"
elif [[ -x "/opt/homebrew/bin/python3.12" ]]; then
  PYTHON="/opt/homebrew/bin/python3.12"
elif command -v python3.12 >/dev/null 2>&1; then
  PYTHON="$(command -v python3.12)"
else
  echo "Missing Python 3.12."
  echo "Install it with Homebrew, or create server/.venv with aiohttp installed."
  echo
  read -r "?Press Enter to close this window..."
  exit 1
fi

if ! "$PYTHON" -c "import aiohttp" >/dev/null 2>&1; then
  echo "The selected Python cannot import aiohttp:"
  echo "  $PYTHON"
  echo
  echo "Install server dependencies first, then run this again."
  echo
  read -r "?Press Enter to close this window..."
  exit 1
fi

echo "Starting API with:"
echo "  $PYTHON app.py"
echo
mkdir -p "$PID_DIR"
echo "$$" > "$PID_FILE"
exec "$PYTHON" app.py
