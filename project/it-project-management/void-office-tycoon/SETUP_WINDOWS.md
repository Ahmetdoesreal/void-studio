# Void Office Tycoon Windows Setup

This project is split into a Python API server and a Vite client.

The implementation does not install dependencies automatically. Run the setup commands below once, then use the `.bat` scripts.

## Requirements

- Windows 10 or newer
- Python 3.11 or newer
- Node.js LTS, which includes `npm`

Check them:

```bat
py --version
python --version
node --version
npm.cmd --version
```

## Install Python API Dependencies

From `project\it-project-management\void-office-tycoon`:

```bat
cd server
py -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The API uses `aiohttp` and stores runtime sessions as JSON files under `server\data\`.

## Install Client Dependencies

From `project\it-project-management\void-office-tycoon`:

```bat
cd client
npm.cmd install
```

Use `npm.cmd` from PowerShell if `npm` is blocked by execution policy.
If `doctor` reports a missing Rollup native package, run `npm.cmd install` from `client` again on Windows so npm installs the Windows optional dependency.

## Run The App

Open `project\it-project-management\void-office-tycoon` in Command Prompt.

Check the local setup:

```bat
python tools\launch.py doctor
```

Run both servers:

```bat
run-all.bat
```

This opens the browser at:

```text
http://127.0.0.1:5173/
```

Or run them separately:

```bat
run-api.bat
run-client.bat
```

The API runs on:

```text
http://127.0.0.1:8000
```

The client runs on:

```text
http://127.0.0.1:5173
```

Open the client URL in your browser.

## Useful Checks

API health:

```text
http://127.0.0.1:8000/api/health
```

Proposal JSON through the API:

```text
http://127.0.0.1:8000/api/proposal
```

World path building is handled by:

```text
POST http://127.0.0.1:8000/api/sessions/{session_id}/build-world-cell
```

The client uses this endpoint when a player clicks a cell on the isometric 32x32 office map.

Build the client after dependencies are installed:

```bat
cd client
npm.cmd run build
```

## Data And Privacy

The game uses class IDs instead of public names. Session JSON and log JSON files stay local on the machine running the Python server.

Generated data locations:

```text
server\data\sessions\
server\data\logs\
```

Delete those generated JSON files to reset stored class sessions.

## Editable Sprites

Sprite files live here:

```text
client\src\assets\sprites\
```

They are editable SVG files with power-of-two dimensions such as `64x64`, `64x128`, and `128x128`.
