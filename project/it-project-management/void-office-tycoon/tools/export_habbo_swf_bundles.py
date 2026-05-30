#!/usr/bin/env python3
"""
Habbo-style SWF bitmap exporter + bundle/animation gallery.

What it does:
  - Uses swfdump to find embedded bitmap IDs and exported symbol names.
  - Uses swfextract to extract bitmap PNGs.
  - Parses Habbo-style symbol names like:
      acc_chest_U_backpack_h_std_ca_2498_7_0
  - Groups related frames by:
      source file + layer + action + part + set_id + direction
  - Optionally creates animated GIFs if Pillow is installed.
  - Detects likely runtime-recolor/template images.
  - Creates paginated gallery instead of one huge 40MB+ HTML file.

Requirements:
  brew install swftools

Optional for GIFs + recolor detection:
  python3 -m pip install pillow

Usage:
  rm -rf ../habbo_bundle_export
  python3 export_habbo_swf_bundles.py --input . --output ../habbo_bundle_export --workers 8

Open:
  open ../habbo_bundle_export/gallery/index.html
"""

import argparse
import csv
import json
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


try:
    from PIL import Image
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False


BITMAP_RE = re.compile(
    r"DEFINEBITS(?:LOSSLESS2?|JPEG\d*)?\s+defines id\s+0*([0-9]+)\s+image\s+([0-9]+)x([0-9]+)",
    re.IGNORECASE,
)

EXPORT_RE = re.compile(
    r'exports\s+0*([0-9]+)\s+as\s+"([^"]+)"',
    re.IGNORECASE,
)


PART_CODES = {
    "ca": "chest_accessory",
    "ea": "eye_accessory",
    "fa": "face_accessory",
    "ha": "head_accessory",
    "wa": "waist_accessory",
    "hr": "hair",
    "hd": "head",
    "fc": "face",
    "ch": "shirt",
    "cc": "coat_or_jacket",
    "lg": "trousers",
    "sh": "shoes",
    "cp": "chest_print",
}


def has_tool(name: str) -> bool:
    return shutil.which(name) is not None


def run_cmd(cmd: list[str], timeout: int = 30) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=timeout,
    )


def category_for(filename: str) -> str:
    stem = Path(filename).stem
    parts = stem.split("_")

    if stem.startswith("hh_human_"):
        return "hh_human"

    if len(parts) >= 2 and parts[0].lower() == "acc":
        return f"{parts[0]}_{parts[1]}".lower()

    if parts[0].lower() in {
        "hair", "hat", "face", "jacket", "shirt",
        "shoe", "shoes", "trousers", "misc", "pet"
    }:
        return parts[0].lower()

    return "misc"


def safe_name(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9_.-]+", "_", str(s))
    return s[:180]


def parse_symbol_name(source_stem: str, symbol_name: str) -> dict:
    parsed = {
        "symbol_name": symbol_name,
        "source_stem": source_stem,
        "item_name": source_stem,
        "layer": "",
        "action": "",
        "part": "",
        "part_name": "",
        "set_id": "",
        "direction": "",
        "frame": "",
        "is_habbo_figure_part": False,
    }

    prefix = source_stem + "_"
    tail = symbol_name

    if symbol_name.startswith(prefix):
        tail = symbol_name[len(prefix):]

    parts = tail.split("_")

    # Expected tail:
    # h_std_ca_2498_7_0
    if len(parts) >= 6:
        layer = parts[-6]
        action = parts[-5]
        part = parts[-4]
        set_id = parts[-3]
        direction = parts[-2]
        frame = parts[-1]

        if set_id.isdigit() and direction.isdigit() and frame.isdigit():
            parsed.update({
                "layer": layer,
                "action": action,
                "part": part,
                "part_name": PART_CODES.get(part, ""),
                "set_id": set_id,
                "direction": direction,
                "frame": frame,
                "is_habbo_figure_part": True,
            })

    return parsed


def likely_recolor_template_png(path: Path) -> tuple[bool, str]:
    if not PIL_AVAILABLE:
        return False, "pillow_not_installed"

    try:
        img = Image.open(path).convert("RGBA")
        pixels = list(img.getdata())
        opaque = [p for p in pixels if p[3] > 10]

        if not opaque:
            return False, "empty_or_transparent"

        total = len(opaque)
        purpleish = 0
        low_saturation_gray = 0
        unique_rgb = set()

        for r, g, b, a in opaque:
            unique_rgb.add((r, g, b))

            if r > 90 and b > 90 and g < max(r, b) * 0.85:
                purpleish += 1

            if abs(r - g) < 8 and abs(g - b) < 8:
                low_saturation_gray += 1

        purple_ratio = purpleish / total
        gray_ratio = low_saturation_gray / total
        unique_count = len(unique_rgb)

        if purple_ratio >= 0.20:
            return True, f"purpleish_pixels_{purple_ratio:.2f}"

        if unique_count <= 8 and gray_ratio < 0.80:
            return True, f"small_palette_{unique_count}_colors"

        return False, f"normal purple={purple_ratio:.2f} unique={unique_count}"

    except Exception as e:
        return False, f"analyze_error:{repr(e)}"


def read_swf(swf: Path, timeout: int) -> tuple[list[dict], dict[int, list[str]], str]:
    p = run_cmd(["swfdump", str(swf)], timeout=timeout)
    dump = (p.stdout or "") + "\n" + (p.stderr or "")

    bitmaps = []
    for m in BITMAP_RE.finditer(dump):
        bitmaps.append({
            "id": int(m.group(1)),
            "width": int(m.group(2)),
            "height": int(m.group(3)),
        })

    by_id = {}
    for b in bitmaps:
        by_id[b["id"]] = b

    exports: dict[int, list[str]] = {}
    for m in EXPORT_RE.finditer(dump):
        sid = int(m.group(1))
        name = m.group(2)
        exports.setdefault(sid, []).append(name)

    bitmaps = [by_id[k] for k in sorted(by_id.keys())]
    return bitmaps, exports, dump


def extract_bitmap(swf: Path, bitmap_id: int, out_file: Path, timeout: int) -> tuple[bool, str]:
    out_file.parent.mkdir(parents=True, exist_ok=True)

    attempts = [
        ["swfextract", "-p", str(bitmap_id), "-o", str(out_file), str(swf)],
        ["swfextract", "-j", str(bitmap_id), "-o", str(out_file), str(swf)],
    ]

    last_error = ""

    for cmd in attempts:
        try:
            p = run_cmd(cmd, timeout=timeout)

            if p.returncode == 0 and out_file.exists() and out_file.stat().st_size > 0:
                return True, ""

            last_error = (p.stderr or p.stdout or "swfextract failed").strip()

        except subprocess.TimeoutExpired:
            last_error = f"timeout_after_{timeout}s"

        except Exception as e:
            last_error = repr(e)

    return False, last_error


def extract_one_swf(swf: Path, input_root: Path, output_root: Path, timeout: int) -> list[dict]:
    rel = swf.relative_to(input_root)
    source_stem = swf.stem
    category = category_for(swf.name)

    rows = []

    try:
        bitmaps, exports, dump = read_swf(swf, timeout)

        dump_dir = output_root / "dumps" / category
        dump_dir.mkdir(parents=True, exist_ok=True)
        (dump_dir / f"{safe_name(source_stem)}.txt").write_text(
            dump,
            encoding="utf-8",
            errors="replace",
        )

        if not bitmaps:
            return [{
                "source": str(rel),
                "source_stem": source_stem,
                "category": category,
                "bitmap_id": "",
                "width": "",
                "height": "",
                "symbol_name": "",
                "item_name": source_stem,
                "layer": "",
                "action": "",
                "part": "",
                "part_name": "",
                "set_id": "",
                "direction": "",
                "frame": "",
                "bundle_key": "",
                "output_png": "",
                "likely_recolor_template": "",
                "recolor_reason": "",
                "status": "no_bitmaps",
                "error": "",
            }]

        for b in bitmaps:
            bid = b["id"]
            names = exports.get(bid, [])
            symbol_name = names[0] if names else f"{source_stem}_id_{bid:04d}"

            parsed = parse_symbol_name(source_stem, symbol_name)

            if parsed["is_habbo_figure_part"]:
                bundle_key = "__".join([
                    source_stem,
                    parsed["layer"],
                    parsed["action"],
                    parsed["part"],
                    parsed["set_id"],
                    parsed["direction"],
                ])
                frame_part = f"frame_{int(parsed['frame']):03d}"
            else:
                bundle_key = f"{source_stem}__unparsed__id_{bid:04d}"
                frame_part = "frame_000"

            bundle_dir = output_root / "bundles" / category / safe_name(bundle_key)
            out_file = bundle_dir / f"{frame_part}__id_{bid:04d}__{safe_name(symbol_name)}.png"

            ok, err = extract_bitmap(swf, bid, out_file, timeout)

            likely_template = ""
            recolor_reason = ""

            if ok:
                lt, reason = likely_recolor_template_png(out_file)
                likely_template = "yes" if lt else "no"
                recolor_reason = reason

            rows.append({
                "source": str(rel),
                "source_stem": source_stem,
                "category": category,
                "bitmap_id": bid,
                "width": b["width"],
                "height": b["height"],
                "symbol_name": symbol_name,
                "item_name": parsed["item_name"],
                "layer": parsed["layer"],
                "action": parsed["action"],
                "part": parsed["part"],
                "part_name": parsed["part_name"],
                "set_id": parsed["set_id"],
                "direction": parsed["direction"],
                "frame": parsed["frame"],
                "bundle_key": bundle_key,
                "output_png": str(out_file.relative_to(output_root)) if ok else "",
                "likely_recolor_template": likely_template,
                "recolor_reason": recolor_reason,
                "status": "extracted" if ok else "failed",
                "error": err,
            })

    except Exception as e:
        rows.append({
            "source": str(rel),
            "source_stem": source_stem,
            "category": category,
            "bitmap_id": "",
            "width": "",
            "height": "",
            "symbol_name": "",
            "item_name": source_stem,
            "layer": "",
            "action": "",
            "part": "",
            "part_name": "",
            "set_id": "",
            "direction": "",
            "frame": "",
            "bundle_key": "",
            "output_png": "",
            "likely_recolor_template": "",
            "recolor_reason": "",
            "status": "error",
            "error": repr(e),
        })

    return rows


def copy_metadata(input_root: Path, output_root: Path) -> list[dict]:
    exts = {".xml", ".txt", ".json", ".ini", ".dat"}
    copied = []
    out_resolved = output_root.resolve()

    for p in input_root.rglob("*"):
        try:
            p.resolve().relative_to(out_resolved)
            continue
        except ValueError:
            pass

        if not p.is_file():
            continue

        if p.suffix.lower() not in exts:
            continue

        rel = p.relative_to(input_root)
        dest = output_root / "metadata" / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dest)

        copied.append({
            "source": str(rel),
            "copied_to": str(dest.relative_to(output_root)),
            "size_bytes": p.stat().st_size,
        })

    return copied


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow(r)


def group_bundles(rows: list[dict]) -> dict:
    bundles = {}

    for r in rows:
        if r["status"] != "extracted":
            continue

        key = r["bundle_key"]
        if not key:
            continue

        b = bundles.setdefault(key, {
            "bundle_key": key,
            "source": r["source"],
            "source_stem": r["source_stem"],
            "category": r["category"],
            "item_name": r["item_name"],
            "layer": r["layer"],
            "action": r["action"],
            "part": r["part"],
            "part_name": r["part_name"],
            "set_id": r["set_id"],
            "direction": r["direction"],
            "frames": [],
            "frame_count": 0,
            "animated_gif": "",
            "likely_recolor_template_count": 0,
        })

        frame_num = int(r["frame"]) if str(r["frame"]).isdigit() else 0

        b["frames"].append({
            "frame": frame_num,
            "bitmap_id": r["bitmap_id"],
            "symbol_name": r["symbol_name"],
            "png": r["output_png"],
            "width": r["width"],
            "height": r["height"],
            "likely_recolor_template": r["likely_recolor_template"],
            "recolor_reason": r["recolor_reason"],
        })

        if r["likely_recolor_template"] == "yes":
            b["likely_recolor_template_count"] += 1

    for b in bundles.values():
        b["frames"].sort(key=lambda x: (x["frame"], int(x["bitmap_id"])))
        b["frame_count"] = len(b["frames"])

    return bundles


def create_gifs(output_root: Path, bundles: dict, duration_ms: int) -> None:
    if not PIL_AVAILABLE:
        return

    for key, b in bundles.items():
        frame_numbers = sorted(set(f["frame"] for f in b["frames"]))

        if len(frame_numbers) < 2:
            continue

        selected = []
        seen = set()

        for f in b["frames"]:
            if f["frame"] in seen:
                continue
            seen.add(f["frame"])
            selected.append(f)

        images = []
        max_w = 1
        max_h = 1

        for f in selected:
            path = output_root / f["png"]

            try:
                img = Image.open(path).convert("RGBA")
                images.append(img)
                max_w = max(max_w, img.width)
                max_h = max(max_h, img.height)
            except Exception:
                pass

        if len(images) < 2:
            continue

        normalized = []

        for img in images:
            canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
            canvas.alpha_composite(img, ((max_w - img.width) // 2, (max_h - img.height) // 2))
            normalized.append(canvas)

        gif_dir = output_root / "animations" / b["category"]
        gif_dir.mkdir(parents=True, exist_ok=True)

        gif_path = gif_dir / f"{safe_name(key)}.gif"

        normalized[0].save(
            gif_path,
            save_all=True,
            append_images=normalized[1:],
            duration=duration_ms,
            loop=0,
            disposal=2,
        )

        b["animated_gif"] = str(gif_path.relative_to(output_root))


def make_gallery(output_root: Path, bundles: dict, page_size: int = 300) -> None:
    gallery_root = output_root / "gallery"
    pages_root = gallery_root / "pages"
    pages_root.mkdir(parents=True, exist_ok=True)

    bundle_list = sorted(
        bundles.values(),
        key=lambda b: (
            b.get("category", ""),
            b.get("source_stem", ""),
            b.get("action", ""),
            b.get("direction", ""),
            b.get("bundle_key", ""),
        ),
    )

    lightweight = []

    for b in bundle_list:
        frames = b.get("frames", [])

        if not frames:
            continue

        first_frame = frames[0]
        img_src = b.get("animated_gif") or first_frame.get("png", "")

        if not img_src:
            continue

        item = {
            "bundle_key": b.get("bundle_key", ""),
            "source": b.get("source", ""),
            "source_stem": b.get("source_stem", ""),
            "category": b.get("category", ""),
            "item_name": b.get("item_name", ""),
            "layer": b.get("layer", ""),
            "action": b.get("action", ""),
            "part": b.get("part", ""),
            "part_name": b.get("part_name", ""),
            "set_id": b.get("set_id", ""),
            "direction": b.get("direction", ""),
            "frame_count": b.get("frame_count", 0),
            "animated_gif": b.get("animated_gif", ""),
            "preview": img_src,
            "likely_recolor_template_count": b.get("likely_recolor_template_count", 0),
            "frames": frames,
        }

        item["search"] = " ".join([
            item["bundle_key"],
            item["source"],
            item["source_stem"],
            item["category"],
            item["item_name"],
            item["layer"],
            item["action"],
            item["part"],
            item["part_name"],
            item["set_id"],
            item["direction"],
        ]).lower()

        lightweight.append(item)

    total = len(lightweight)
    page_count = max(1, (total + page_size - 1) // page_size)

    page_files = []

    for i in range(page_count):
        start = i * page_size
        end = start + page_size
        page_items = lightweight[start:end]

        page_name = f"page_{i + 1:04d}.json"
        page_path = pages_root / page_name

        with page_path.open("w", encoding="utf-8") as f:
            json.dump(page_items, f, ensure_ascii=False)

        page_files.append({
            "page": i + 1,
            "file": f"pages/{page_name}",
            "start": start,
            "end": min(end, total),
            "count": len(page_items),
        })

    global_index = {
        "total": total,
        "page_size": page_size,
        "page_count": page_count,
        "pages": page_files,
        "categories": sorted(set(x["category"] for x in lightweight)),
        "actions": sorted(set(x["action"] for x in lightweight if x["action"])),
        "parts": sorted(set(x["part"] for x in lightweight if x["part"])),
    }

    with (gallery_root / "index_all.json").open("w", encoding="utf-8") as f:
        json.dump(global_index, f, indent=2, ensure_ascii=False)

    html = r'''<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Habbo SWF Bundle Gallery</title>
<style>
:root {
  color-scheme: dark;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: #111;
  color: #eee;
  margin: 0;
  padding: 20px;
}

h1 {
  margin: 0 0 8px 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #111;
  border-bottom: 1px solid #333;
  padding-bottom: 14px;
  margin-bottom: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

input, select, button {
  background: #1d1d1d;
  color: #eee;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 9px 10px;
}

input {
  min-width: 280px;
  flex: 1;
}

button {
  cursor: pointer;
}

button:hover {
  background: #2a2a2a;
}

.stats {
  color: #aaa;
  font-size: 13px;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 10px;
  contain: content;
}

.card img {
  width: 100%;
  height: 130px;
  object-fit: contain;
  background:
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  image-rendering: pixelated;
  border-radius: 6px;
}

.name {
  margin-top: 8px;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.meta {
  color: #aaa;
  font-size: 11px;
  margin-top: 4px;
}

.badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 5px;
  background: #333;
  margin-right: 3px;
  margin-top: 4px;
}

.recolor {
  background: #51335f;
}

.anim {
  background: #31506b;
}

.details {
  display: none;
  margin-top: 8px;
  max-height: 220px;
  overflow: auto;
  border-top: 1px solid #333;
  padding-top: 8px;
}

.details img {
  width: 48px;
  height: 48px;
  margin: 3px;
  object-fit: contain;
}

.card.open .details {
  display: block;
}

.small {
  font-size: 12px;
  color: #aaa;
}

#loading {
  padding: 20px;
  color: #aaa;
}
</style>
</head>
<body>

<div class="topbar">
  <h1>Habbo SWF Bundle Gallery</h1>

  <div class="row">
    <button onclick="prevPage()">← Prev</button>
    <select id="pageSelect" onchange="loadPage(Number(this.value))"></select>
    <button onclick="nextPage()">Next →</button>

    <input id="searchBox" placeholder="Search current page: backpack, hair, std, lay, 2498..." oninput="renderCurrentPage()">

    <select id="categoryFilter" onchange="renderCurrentPage()">
      <option value="">All categories</option>
    </select>

    <select id="actionFilter" onchange="renderCurrentPage()">
      <option value="">All actions</option>
    </select>
  </div>

  <div class="stats" id="stats">Loading index...</div>
</div>

<div id="loading">Loading...</div>
<div class="grid" id="grid"></div>

<script>
let indexData = null;
let currentPageNum = 1;
let currentItems = [];

function rel(path) {
  return "../" + String(path || "").replaceAll("\\", "/");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function init() {
  indexData = await fetch("index_all.json").then(r => r.json());

  const pageSelect = document.getElementById("pageSelect");
  pageSelect.innerHTML = "";

  for (const p of indexData.pages) {
    const opt = document.createElement("option");
    opt.value = p.page;
    opt.textContent = `Page ${p.page} / ${indexData.page_count} (${p.start + 1}-${p.end})`;
    pageSelect.appendChild(opt);
  }

  const cat = document.getElementById("categoryFilter");
  for (const c of indexData.categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    cat.appendChild(opt);
  }

  const act = document.getElementById("actionFilter");
  for (const a of indexData.actions) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    act.appendChild(opt);
  }

  await loadPage(1);
}

async function loadPage(n) {
  if (!indexData) return;

  if (n < 1) n = 1;
  if (n > indexData.page_count) n = indexData.page_count;

  currentPageNum = n;
  document.getElementById("pageSelect").value = String(n);
  document.getElementById("loading").style.display = "block";
  document.getElementById("grid").innerHTML = "";

  const pageInfo = indexData.pages[n - 1];
  currentItems = await fetch(pageInfo.file).then(r => r.json());

  document.getElementById("loading").style.display = "none";
  renderCurrentPage();
}

function prevPage() {
  loadPage(currentPageNum - 1);
}

function nextPage() {
  loadPage(currentPageNum + 1);
}

function renderCurrentPage() {
  const q = document.getElementById("searchBox").value.toLowerCase().trim();
  const cat = document.getElementById("categoryFilter").value;
  const action = document.getElementById("actionFilter").value;

  let filtered = currentItems;

  if (q) {
    filtered = filtered.filter(x => String(x.search || "").includes(q));
  }

  if (cat) {
    filtered = filtered.filter(x => x.category === cat);
  }

  if (action) {
    filtered = filtered.filter(x => x.action === action);
  }

  const grid = document.getElementById("grid");

  const html = filtered.map(item => {
    const preview = rel(item.preview);

    const badges = [
      item.animated_gif ? '<span class="badge anim">animation</span>' : '',
      item.likely_recolor_template_count > 0 ? '<span class="badge recolor">runtime color?</span>' : '',
    ].join("");

    const frameThumbs = (item.frames || []).slice(0, 80).map(f => {
      return `<img loading="lazy" src="${rel(f.png)}" title="frame ${escapeHtml(f.frame)} id ${escapeHtml(f.bitmap_id)}">`;
    }).join("");

    return `
      <div class="card" onclick="this.classList.toggle('open')">
        <img loading="lazy" src="${preview}">
        <div class="name">${escapeHtml(item.bundle_key)}</div>
        <div class="meta">
          ${escapeHtml(item.category)} · action=${escapeHtml(item.action || "-")} · part=${escapeHtml(item.part || "-")} · dir=${escapeHtml(item.direction || "-")} · frames=${escapeHtml(item.frame_count)}
        </div>
        <div>${badges}</div>
        <div class="details">
          <div class="small">Source: ${escapeHtml(item.source)}</div>
          <div class="small">Set ID: ${escapeHtml(item.set_id || "-")}</div>
          <div class="small">Layer: ${escapeHtml(item.layer || "-")}</div>
          <div class="small">Click card to close.</div>
          <div>${frameThumbs}</div>
        </div>
      </div>
    `;
  }).join("");

  grid.innerHTML = html;

  const pageInfo = indexData.pages[currentPageNum - 1];

  document.getElementById("stats").textContent =
    `Total bundles: ${indexData.total} · Page ${currentPageNum}/${indexData.page_count} · ` +
    `Page range: ${pageInfo.start + 1}-${pageInfo.end} · Showing: ${filtered.length}/${currentItems.length}`;
}

init().catch(err => {
  document.getElementById("loading").textContent = "Failed to load gallery: " + err;
});
</script>

</body>
</html>
'''

    (gallery_root / "index.html").write_text(html, encoding="utf-8")

    redirect = '''<!doctype html>
<meta charset="utf-8">
<title>Gallery Redirect</title>
<meta http-equiv="refresh" content="0; url=gallery/index.html">
<a href="gallery/index.html">Open gallery</a>
'''
    (output_root / "gallery.html").write_text(redirect, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", "-i", default=".")
    ap.add_argument("--output", "-o", default="../habbo_bundle_export")
    ap.add_argument("--workers", "-w", type=int, default=max(2, os.cpu_count() or 4))
    ap.add_argument("--timeout", type=int, default=30)
    ap.add_argument("--gif-duration", type=int, default=180)
    ap.add_argument("--page-size", type=int, default=300)
    args = ap.parse_args()

    input_root = Path(args.input).resolve()
    output_root = Path(args.output).resolve()

    if not has_tool("swfdump") or not has_tool("swfextract"):
        print("ERROR: swfdump/swfextract not found.")
        print("Install with:")
        print("  brew install swftools")
        return 1

    output_root.mkdir(parents=True, exist_ok=True)
    output_resolved = output_root.resolve()

    swfs = []
    for p in input_root.rglob("*.swf"):
        try:
            p.resolve().relative_to(output_resolved)
            continue
        except ValueError:
            pass
        swfs.append(p)

    swfs = sorted(swfs)

    print(f"Input:  {input_root}")
    print(f"Output: {output_root}")
    print(f"SWFs:   {len(swfs)}")
    print(f"Pillow: {'yes, GIFs and recolor detection enabled' if PIL_AVAILABLE else 'no, GIFs/recolor detection disabled'}")

    copied = copy_metadata(input_root, output_root)
    print(f"Copied metadata files: {len(copied)}")

    rows = []

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [
            ex.submit(extract_one_swf, swf, input_root, output_root, args.timeout)
            for swf in swfs
        ]

        done = 0
        extracted = 0

        for fut in as_completed(futures):
            new_rows = fut.result()
            rows.extend(new_rows)
            done += 1
            extracted += sum(1 for r in new_rows if r["status"] == "extracted")

            if done % 50 == 0 or done == len(swfs):
                print(f"[{done}/{len(swfs)}] extracted bitmaps={extracted}")

    rows.sort(key=lambda r: (r["source"], str(r["bitmap_id"])))

    fields = [
        "source", "source_stem", "category",
        "bitmap_id", "width", "height",
        "symbol_name", "item_name",
        "layer", "action", "part", "part_name",
        "set_id", "direction", "frame",
        "bundle_key", "output_png",
        "likely_recolor_template", "recolor_reason",
        "status", "error",
    ]

    write_csv(output_root / "manifest.csv", rows, fields)
    write_csv(
        output_root / "copied_metadata.csv",
        copied,
        ["source", "copied_to", "size_bytes"],
    )

    bundles = group_bundles(rows)

    create_gifs(output_root, bundles, args.gif_duration)

    with (output_root / "bundles.json").open("w", encoding="utf-8") as f:
        json.dump(bundles, f, indent=2, ensure_ascii=False)

    make_gallery(output_root, bundles, page_size=args.page_size)

    total_extracted = sum(1 for r in rows if r["status"] == "extracted")
    total_failed = sum(1 for r in rows if r["status"] == "failed")
    total_bundles = len(bundles)
    total_gifs = sum(1 for b in bundles.values() if b.get("animated_gif"))

    print()
    print("DONE")
    print(f"Extracted bitmaps: {total_extracted}")
    print(f"Failed bitmaps:    {total_failed}")
    print(f"Bundles:           {total_bundles}")
    print(f"Animated GIFs:     {total_gifs}")
    print(f"Manifest:          {output_root / 'manifest.csv'}")
    print(f"Bundles JSON:      {output_root / 'bundles.json'}")
    print(f"Gallery index:     {output_root / 'gallery' / 'index.html'}")
    print()
    print("Open gallery:")
    print(f"  open '{output_root / 'gallery' / 'index.html'}'")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
