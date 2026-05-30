#!/usr/bin/env python3
"""Extract local Habbo SWF bitmap assets with SWFTools.

The Habbo SWFs in `assets_habbo_exported` are Flash library files. Rendering
the SWF stage often produces a blank 500x375 image; the useful art is stored as
embedded PNG definitions. This script uses SWFTools `swfextract -p` to pull
those PNGs out untouched.

No resizing, padding, palette editing, or post-processing is applied.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import shutil
import struct
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "client" / "src" / "assets" / "sprites" / "habbo_raw"
DEFAULT_SWFS = (
    "Bot.swf",
    "CameraBot.swf",
    "PlastoPodChair.swf",
    "RoomtoRoomTele.swf",
)
PNG_LIST_RE = re.compile(r"\[-p\]\s+\d+\s+PNGs?:\s+ID\(s\)\s+(.+)", re.IGNORECASE)


@dataclass(frozen=True)
class ExportTarget:
    swf: Path
    png_id: int
    output: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract embedded PNGs from Habbo SWFs using SWFTools swfextract."
    )
    parser.add_argument(
        "--asset-root",
        type=Path,
        default=find_default_asset_root(),
        help="Path to assets_habbo_exported. Defaults to the workspace copy.",
    )
    parser.add_argument(
        "--production",
        type=Path,
        help="Specific flash-assets-PRODUCTION-* folder. Defaults to latest.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Output folder for extracted PNG files.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        help="Manifest JSON path. Defaults to <out>/manifest.json.",
    )
    parser.add_argument(
        "--swfextract",
        default="swfextract",
        help="Path or command name for SWFTools swfextract.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Extract PNGs from every SWF in the selected production folder.",
    )
    parser.add_argument(
        "--name",
        action="append",
        default=[],
        help="SWF filename or stem to extract. Can be repeated.",
    )
    parser.add_argument(
        "--glob",
        action="append",
        default=[],
        help="Case-insensitive filename glob, for example '*bot*.swf'. Can be repeated.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of SWFs selected.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing extracted PNG files.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print selected files and embedded PNG IDs without extracting.",
    )
    parser.add_argument(
        "--keep-going",
        action="store_true",
        help="Continue extracting remaining files if one SWF fails.",
    )
    return parser.parse_args()


def find_default_asset_root() -> Path:
    candidates = [
        Path.cwd() / "assets_habbo_exported",
        PROJECT_ROOT.parents[2] / "assets_habbo_exported",
        PROJECT_ROOT.parent / "assets_habbo_exported",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def latest_production(asset_root: Path) -> Path:
    if not asset_root.exists():
        raise SystemExit(f"Asset root not found: {asset_root}")
    productions = sorted(
        path
        for path in asset_root.iterdir()
        if path.is_dir() and path.name.startswith("flash-assets-PRODUCTION-")
    )
    if not productions:
        raise SystemExit(f"No flash-assets-PRODUCTION-* folders found in {asset_root}")
    return productions[-1]


def normalize_name(name: str) -> str:
    return name if name.lower().endswith(".swf") else f"{name}.swf"


def select_swfs(production: Path, args: argparse.Namespace) -> list[Path]:
    all_swfs = sorted(production.glob("*.swf"), key=lambda path: path.name.lower())
    by_lower_name = {path.name.lower(): path for path in all_swfs}

    selected: list[Path] = []
    seen: set[Path] = set()

    def add(path: Path | None) -> None:
        if path is not None and path not in seen:
            selected.append(path)
            seen.add(path)

    if args.all:
        for path in all_swfs:
            add(path)
    else:
        requested_names = args.name or ([] if args.glob else list(DEFAULT_SWFS))
        for name in requested_names:
            add(by_lower_name.get(normalize_name(name).lower()))

    for pattern in args.glob:
        wanted = normalize_name(pattern).lower() if "*" not in pattern else pattern.lower()
        for path in all_swfs:
            if fnmatch.fnmatch(path.name.lower(), wanted):
                add(path)

    if args.limit is not None:
        selected = selected[: max(args.limit, 0)]
    return selected


def safe_stem(path: Path) -> str:
    return "".join(char if char.isalnum() or char in "._-" else "_" for char in path.stem)


def parse_id_list(raw: str) -> list[int]:
    ids: list[int] = []
    for chunk in raw.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        if "-" in chunk:
            start_raw, end_raw = chunk.split("-", 1)
            start = int(start_raw.strip())
            end = int(end_raw.strip())
            ids.extend(range(start, end + 1))
        else:
            ids.append(int(chunk))
    return ids


def list_png_ids(swfextract: str, swf: Path) -> list[int]:
    result = subprocess.run(
        [swfextract, str(swf)],
        check=True,
        capture_output=True,
        text=True,
    )
    ids: list[int] = []
    for line in result.stdout.splitlines():
        match = PNG_LIST_RE.search(line)
        if match:
            ids.extend(parse_id_list(match.group(1)))
    return sorted(set(ids))


def build_targets(swfextract: str, swfs: list[Path], out_dir: Path) -> list[ExportTarget]:
    targets: list[ExportTarget] = []
    for swf in swfs:
        stem = safe_stem(swf)
        png_ids = list_png_ids(swfextract, swf)
        for png_id in png_ids:
            output = out_dir / stem / f"{stem}_png_{png_id:04d}.png"
            targets.append(ExportTarget(swf=swf, png_id=png_id, output=output))
    return targets


def read_png_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        header = handle.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG file: {path}")
    width, height = struct.unpack(">II", header[16:24])
    return width, height


def extract_target(target: ExportTarget, swfextract: str, overwrite: bool) -> dict[str, object]:
    if target.output.exists() and not overwrite:
        width, height = read_png_size(target.output)
        return manifest_entry(target, width, height, skipped=True)

    target.output.parent.mkdir(parents=True, exist_ok=True)
    command = [
        swfextract,
        "-p",
        str(target.png_id),
        "-o",
        str(target.output),
        str(target.swf),
    ]
    subprocess.run(command, check=True)
    width, height = read_png_size(target.output)
    return manifest_entry(target, width, height, skipped=False)


def manifest_entry(
    target: ExportTarget, width: int, height: int, skipped: bool
) -> dict[str, object]:
    return {
        "sourceSwf": str(target.swf),
        "pngId": target.png_id,
        "outputPng": str(target.output),
        "width": width,
        "height": height,
        "bytes": target.output.stat().st_size,
        "skippedExisting": skipped,
        "postProcessed": False,
    }


def write_manifest(path: Path, production: Path, entries: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "tool": "SWFTools swfextract",
        "production": str(production),
        "note": "PNG files are embedded SWF bitmap assets. No resizing or texture editing was applied.",
        "count": len(entries),
        "assets": entries,
    }
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def main() -> int:
    args = parse_args()
    production = args.production or latest_production(args.asset_root)
    production = production.resolve()
    out_dir = args.out.resolve()
    manifest = (args.manifest or out_dir / "manifest.json").resolve()

    swfextract = shutil.which(args.swfextract) or (
        args.swfextract if Path(args.swfextract).exists() else None
    )
    if swfextract is None:
        print(
            "SWFTools swfextract was not found. Install SWFTools, then rerun this script.",
            file=sys.stderr,
        )
        print("Expected command: swfextract", file=sys.stderr)
        return 2

    swfs = select_swfs(production, args)
    if not swfs:
        print("No SWFs matched. Use --all, --name, or --glob.")
        return 1

    print(f"Production: {production}")
    print(f"Selected SWFs: {len(swfs)}")
    print(f"Output: {out_dir}")

    try:
        targets = build_targets(swfextract, swfs, out_dir)
    except Exception as exc:  # noqa: BLE001 - report tool/listing failures clearly.
        print(f"Failed to inspect SWFs with swfextract: {exc}", file=sys.stderr)
        return 3

    print(f"Embedded PNG targets: {len(targets)}")
    if not targets:
        print("No embedded PNG assets were found in the selected SWFs.")
        return 1

    if args.dry_run:
        for target in targets:
            print(f"DRY RUN {target.swf.name} png {target.png_id} -> {target.output}")
        return 0

    entries: list[dict[str, object]] = []
    failures: list[tuple[ExportTarget, str]] = []
    for index, target in enumerate(targets, start=1):
        print(f"[{index}/{len(targets)}] {target.swf.name} png {target.png_id}")
        try:
            entries.append(extract_target(target, swfextract, args.overwrite))
        except Exception as exc:  # noqa: BLE001 - keep useful context for artists.
            failures.append((target, str(exc)))
            if not args.keep_going:
                break
            print(f"  failed: {exc}", file=sys.stderr)

    write_manifest(manifest, production, entries)
    print(f"Manifest: {manifest}")

    if failures:
        print("Failures:", file=sys.stderr)
        for target, message in failures:
            print(f"- {target.swf.name} png {target.png_id}: {message}", file=sys.stderr)
        return 4

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
