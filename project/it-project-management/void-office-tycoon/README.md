# Void Office Tycoon

Void Office Tycoon is a Windows-priority client/server implementation of `it_project_management_2300005633.json`.

- `server/` contains the `aiohttp` API, JSON storage, proposal copy, and game rules.
- `client/` contains the Vite frontend.
- `client/src/assets/sprites/` contains editable power-of-two SVG sprites.
- `tools/export_habbo_swfs.py` extracts embedded Habbo SWF PNGs with SWFTools.
- `tools/launch.py` manages startup checks and service launch.
- `run-api.bat`, `run-client.bat`, and `run-all.bat` are Windows-first wrappers around the launcher.
- `SETUP_WINDOWS.md` has the setup commands.

The game now includes a persistent 32x32 isometric world grid. Students build a path from the black void toward the nebula gate, avoid randomly generated mini blackholes, and place irregular office departments into the map. Each normal cell has a 4x4 subcell layer for department sprite stacks and generated north/west perimeter walls.

The existing `../void-studio/` prototype is not used or modified.

## Launcher

After dependencies are installed, run:

```bat
python tools\launch.py doctor
python tools\launch.py all
```

The `.bat` files call the same launcher:

```bat
run-api.bat
run-client.bat
run-all.bat
```

`run-all.bat` opens the browser at `http://127.0.0.1:5173/`. If the app is already running, the launcher reports that instead of failing on occupied ports.

On Windows the launcher uses `npm.cmd`, which avoids PowerShell execution-policy blocking around `npm.ps1`.
If `doctor` reports a missing Rollup native package, rerun `npm.cmd install` from `client` on Windows.

## Habbo SWF Export

The Habbo asset pack is kept outside the game code at `../../../assets_habbo_exported/`.
To export the existing local SWF files, install SWFTools so `swfextract` is on your PATH, then run:

```bash
cd project/it-project-management/void-office-tycoon
python3 tools/export_habbo_swfs.py --dry-run
python3 tools/export_habbo_swfs.py
```

The default command exports a small starter set only. To export every SWF from the latest production folder:

```bash
python3 tools/export_habbo_swfs.py --all --keep-going
```

The script writes embedded SWF PNG assets to `client/src/assets/sprites/habbo_raw/` and creates a `manifest.json` with the emitted width and height. It does not resize, crop, pad, recolor, or edit the extracted PNGs.
