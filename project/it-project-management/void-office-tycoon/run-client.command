#!/bin/zsh
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$SCRIPT_DIR/.void-office-pids"
PID_FILE="$PID_DIR/client.pid"
cd "$SCRIPT_DIR/client"

echo "Void Office Tycoon Client"
echo "Project: $SCRIPT_DIR"
echo

if curl -fsS "http://127.0.0.1:5173/" >/dev/null 2>&1; then
  echo "Client is already running at http://127.0.0.1:5173/"
  echo
  read -r "?Press Enter to close this window..."
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Missing npm."
  echo "Install Node.js first, then run this again."
  echo
  read -r "?Press Enter to close this window..."
  exit 1
fi

if [[ ! -d "node_modules/vite" ]]; then
  echo "Missing client dependencies."
  echo
  echo "Run this once:"
  echo "  cd \"$SCRIPT_DIR/client\""
  echo "  npm install"
  echo
  read -r "?Press Enter to close this window..."
  exit 1
fi

echo "Starting Vite:"
echo "  npm run dev"
echo
mkdir -p "$PID_DIR"
echo "$$" > "$PID_FILE"
exec npm run dev
