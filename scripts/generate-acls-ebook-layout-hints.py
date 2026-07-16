"""Recupera do PDF oficial a hierarquia visual das tabelas do eBook ACLS.

O Markdown mantém o texto e os destaques, mas achata marcadores e recuos das
células. Este gerador cruza cada célula com os marcadores extraídos do PDF e
salva somente offsets de layout; nenhum conteúdo médico é reescrito.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "src/content/acls-ebook-source.json"
PAGE_DATA = ROOT / "tmp/pdfs/acls-source/pages.json"
PDF = Path(r"C:\Users\admin\Downloads\ANOTAÇÕES ACLS (1).pdf")
OUTPUT = ROOT / "src/content/acls-ebook-layout-hints.json"

MARKER = re.compile(r"^\s*(●|○|\d+[.)]|-(?=\s*[A-ZÀ-ÖØ-Þ]))\s*(.*)$")
ALNUM = re.compile(r"[0-9a-záàâãéêíóôõúüç]", re.IGNORECASE)


def normalized_with_map(value: str) -> tuple[str, list[int]]:
    characters: list[str] = []
    positions: list[int] = []
    separator = True
    for position, character in enumerate(value.casefold()):
        if ALNUM.fullmatch(character):
            characters.append(character)
            positions.append(position)
            separator = False
        elif not separator and characters:
            characters.append(" ")
            positions.append(position)
            separator = True
    while characters and characters[-1] == " ":
        characters.pop()
        positions.pop()
    return "".join(characters), positions


def normalized(value: str) -> str:
    return normalized_with_map(value)[0]


def page_items(page_texts: list[str]) -> list[dict]:
    items: list[dict] = []
    current: dict | None = None
    for page_text in page_texts:
        for line in page_text.splitlines():
            match = MARKER.match(line)
            if match:
                if current:
                    items.append(current)
                marker, body = match.groups()
                current = {"marker": marker, "text": f"{marker} {body}" if marker[0].isdigit() or marker == "-" else body}
            elif current and line.strip():
                current["text"] += f" {line.strip()}"
        if current:
            items.append(current)
            current = None
    return items


def unique_match(source_normalized: str, source_map: list[int], needle: str) -> tuple[int, int] | None:
    matches = [match for match in re.finditer(rf"(?<!\w){re.escape(needle)}(?!\w)", source_normalized)]
    if len(matches) != 1:
        return None
    match = matches[0]
    return source_map[match.start()], source_map[match.end() - 1] + 1


def candidate_offset(source_normalized: str, source_map: list[int], candidate: str, allow_short: bool) -> tuple[int, int] | None:
    candidate_normalized = normalized(candidate)
    words = candidate_normalized.split()
    exact = unique_match(source_normalized, source_map, candidate_normalized) if len(candidate_normalized) >= 8 else None
    if exact and (len(candidate_normalized) >= 20 or allow_short or exact[0] == 0):
        return exact
    if len(candidate_normalized) < 20 or len(words) < 4:
        return None
    minimum_words = max(4, (len(words) * 7 + 9) // 10)
    for length in range(len(words), minimum_words - 1, -1):
        needle = " ".join(words[:length])
        if len(needle) < 8:
            continue
        match = unique_match(source_normalized, source_map, needle)
        if match:
            return match
    return None


def cell_hints(cell: list[dict], candidate_pages: list[tuple[str, list[dict]]]) -> list[dict]:
    source = "".join(segment.get("text", "") for segment in cell if segment.get("kind") == "text")
    source_normalized, source_map = normalized_with_map(source)
    if not source_normalized:
        return []

    first_words = source_normalized.split()[:8]
    locator = " ".join(first_words)
    page_indexes = [index for index, (page_text, _) in enumerate(candidate_pages) if locator and locator in page_text]
    if page_indexes:
        selected_indexes = {nearby for page_index in page_indexes for nearby in range(max(0, page_index - 1), min(len(candidate_pages), page_index + 3))}
        candidates = [candidate for index in sorted(selected_indexes) for candidate in candidate_pages[index][1]]
    else:
        candidates = [candidate for _, page_candidates in candidate_pages for candidate in page_candidates]

    matched: dict[int, dict] = {}
    for candidate in candidates:
        marker = candidate["marker"]
        match = candidate_offset(source_normalized, source_map, candidate["text"], marker == "-" or marker[0].isdigit())
        if match is not None:
            offset, end = match
            if marker == "-":
                marker_offset = source.rfind("-", max(0, offset - 4), offset + 1)
                if marker_offset >= 0:
                    offset = marker_offset
            elif marker[0].isdigit():
                marker_offset = source.rfind(marker, max(0, offset - len(marker) - 2), offset + 1)
                if marker_offset >= 0:
                    offset = marker_offset
            existing = matched.get(offset)
            marker_is_explicit = marker == "-" or marker[0].isdigit()
            existing_marker = existing["marker"] if existing else None
            existing_is_explicit = bool(existing_marker and (existing_marker == "-" or existing_marker[0].isdigit()))
            if existing is None or (marker_is_explicit and not existing_is_explicit):
                matched[offset] = {"marker": marker, "end": end}

    if not matched:
        return []

    explicit_ranges = [(offset, item["end"]) for offset, item in matched.items() if item["marker"] == "-" or item["marker"][0].isdigit()]
    matched = {
        offset: item for offset, item in matched.items()
        if item["marker"] == "-" or item["marker"][0].isdigit() or not any(start < offset < end for start, end in explicit_ranges)
    }
    has_numbered_marker = any(item["marker"][0].isdigit() for item in matched.values())
    if any(item["marker"] == "-" for item in matched.values()) and not has_numbered_marker:
        matched = {offset: item for offset, item in matched.items() if item["marker"] == "-"}

    ordered: list[tuple[int, str]] = []
    for offset, item in sorted(matched.items()):
        marker = item["marker"]
        if ordered and offset - ordered[-1][0] <= 2:
            previous_offset, previous_marker = ordered[-1]
            previous_explicit = previous_marker == "-" or previous_marker[0].isdigit()
            current_explicit = marker == "-" or marker[0].isdigit()
            if current_explicit and not previous_explicit:
                ordered[-1] = (min(previous_offset, offset), marker)
            continue
        ordered.append((offset, marker))
    has_explicit_parent = any(marker == "-" or marker[0].isdigit() for _, marker in ordered)
    hints: list[dict] = []
    parent_seen = False
    numbered_parent_seen = False
    for offset, marker in ordered:
        if marker == "○":
            level = 1
        elif marker == "●" and has_explicit_parent and parent_seen:
            level = 1
        elif marker == "-" and numbered_parent_seen:
            level = 1
        else:
            level = 0
        if marker[0].isdigit():
            numbered_parent_seen = True
            parent_seen = True
        elif marker == "-":
            parent_seen = True
        hints.append({"offset": offset, "level": level})

    first_offset = hints[0]["offset"]
    intro = source[:first_offset].strip()
    if intro and len(intro) <= 120 and not intro.endswith((".", "!", "?")):
        hints.insert(0, {"offset": 0, "level": 0})
        for hint in hints[1:]:
            if hint["level"] == 0:
                hint["level"] = 1

    unique: list[dict] = []
    for hint in hints:
        if not unique or hint != unique[-1]:
            unique.append(hint)
    return unique


def main() -> None:
    content = json.loads(CONTENT.read_text(encoding="utf-8"))
    if PAGE_DATA.exists():
        pages = json.loads(PAGE_DATA.read_text(encoding="utf-8"))
    else:
        poppler = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftotext.exe"
        if poppler.exists():
            extracted = subprocess.run([str(poppler), "-layout", "-enc", "UTF-8", str(PDF), "-"], check=True, capture_output=True).stdout.decode("utf-8")
            pages = [{"text": text} for text in extracted.split("\f") if text.strip()]
        else:
            with pdfplumber.open(PDF) as document:
                pages = [{"text": page.extract_text(x_tolerance=2, y_tolerance=3) or ""} for page in document.pages]
        PAGE_DATA.parent.mkdir(parents=True, exist_ok=True)
        PAGE_DATA.write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    hints: dict[str, list[dict]] = {}
    cells = 0
    structured = 0

    for chapter in content["chapters"]:
        page_start, page_end = chapter["sourcePages"]
        candidate_pages = [(normalized(page["text"]), page_items([page["text"]])) for page in pages[page_start - 1:page_end]]
        for block_index, block in enumerate(chapter["blocks"]):
            if block["kind"] != "table":
                continue
            for row_index, row in enumerate(block["rows"]):
                for cell_index, cell in enumerate(row):
                    cells += 1
                    layout = cell_hints(cell, candidate_pages)
                    if layout:
                        key = f'{chapter["slug"]}:{block_index}:{row_index}:{cell_index}'
                        hints[key] = layout
                        structured += 1

    OUTPUT.write_text(json.dumps(hints, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"tableCells": cells, "structuredCells": structured, "hints": sum(len(value) for value in hints.values())}, ensure_ascii=False))


if __name__ == "__main__":
    main()
