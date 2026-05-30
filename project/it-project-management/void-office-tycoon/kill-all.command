#!/bin/zsh
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$SCRIPT_DIR/.void-office-pids"

echo "Stopping Void Office Tycoon"
echo "Project: $SCRIPT_DIR"
echo

kill_tree() {
  local pid="$1"
  if [[ -z "$pid" ]] || ! kill -0 "$pid" >/dev/null 2>&1; then
    return 0
  fi

  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done

  kill "$pid" >/dev/null 2>&1 || true
}

stop_pid_file() {
  local label="$1"
  local file="$2"

  if [[ ! -f "$file" ]]; then
    echo "$label: no launcher PID file"
    return 0
  fi

  local pid
  pid="$(tr -cd '0-9' < "$file")"
  if [[ -z "$pid" ]]; then
    echo "$label: stale PID file"
    rm -f "$file"
    return 0
  fi

  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "$label: stopping PID $pid"
    kill_tree "$pid"
    sleep 1
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "$label: force stopping PID $pid"
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
  else
    echo "$label: PID $pid is not running"
  fi

  rm -f "$file"
}

if [[ ! -d "$PID_DIR" ]]; then
  echo "No PID directory found. Nothing started by the macOS launchers is registered."
  echo
  read -r "?Press Enter to close this window..."
  exit 0
fi

stop_pid_file "API" "$PID_DIR/api.pid"
stop_pid_file "Client" "$PID_DIR/client.pid"

rmdir "$PID_DIR" >/dev/null 2>&1 || true

echo
echo "Done. Only launcher-registered processes were targeted."
read -r "?Press Enter to close this window..."
