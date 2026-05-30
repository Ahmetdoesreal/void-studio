#!/bin/zsh
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Booting Void Office Tycoon"
echo "Project: $SCRIPT_DIR"
echo "PID files: $SCRIPT_DIR/.void-office-pids"
echo

if curl -fsS "http://127.0.0.1:8000/api/health" >/dev/null 2>&1; then
  echo "API already running at http://127.0.0.1:8000"
else
  echo "Opening API terminal..."
  open "$SCRIPT_DIR/run-api.command"
fi

sleep 2

if curl -fsS "http://127.0.0.1:5173/" >/dev/null 2>&1; then
  echo "Client already running at http://127.0.0.1:5173/"
else
  echo "Opening client terminal..."
  open "$SCRIPT_DIR/run-client.command"
fi

echo
echo "Opening browser..."
sleep 3
open "http://127.0.0.1:5173/"

echo
echo "Done. Keep the API/client terminal windows open while playing."
read -r "?Press Enter to close this launcher window..."
