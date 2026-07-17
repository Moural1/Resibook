"""Importa o PDF/Markdown editorial do ACLS para o eBook virtual do Resibook.

O Markdown é usado para recuperar a estrutura textual. Somente os traçados de
ECG com origem independente aprovada são exportados; ilustrações, pranchas e
fac-símiles de publicações de terceiros não fazem parte da saída pública.
"""

from __future__ import annotations

import base64
import json
import re
from pathlib import Path

import pdfplumber
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\admin\Downloads\ANOTAÇÕES ACLS (1).pdf")
MARKDOWN = Path(r"C:\Users\admin\Downloads\ANOTAÇÕES ACLS.md")
PAGE_DATA = ROOT / "tmp/pdfs/acls-source/pages.json"
PUBLIC_ROOT = ROOT / "public/acls-ebook/source"
CONTENT_OUTPUT = ROOT / "src/content/acls-ebook-source.json"
REPORT_OUTPUT = ROOT / "src/content/acls-ebook-source-report.json"
APPROVED_ECG_IMAGE_IDS = {*range(5, 17), 25, 26, 27, 28}


CHAPTERS = [
    ("fundamentos-abordagem", "Fundamentos e abordagem sistemática", "Fundamentos", 1, 199, 1, 15),
    ("prevencao-pcr", "Prevenção da PCR", "Fundamentos", 200, 214, 16, 17),
    ("sindromes-coronarianas", "Síndromes coronarianas agudas", "Emergências", 215, 390, 17, 32),
    ("avc-agudo", "AVC agudo", "Emergências", 391, 603, 32, 53),
    ("bradicardias", "Bradicardias", "Arritmias", 604, 661, 54, 59),
    ("taquiarritmias", "Taquiarritmias", "Arritmias", 662, 776, 59, 66),
    ("equipes-alto-desempenho", "Equipes de alto desempenho", "Ressuscitação", 777, 965, 66, 78),
    ("parada-respiratoria-via-aerea", "Parada respiratória e via aérea", "Ressuscitação", 966, 1191, 78, 96),
    ("ritmos-de-parada", "Ritmos de parada", "Ressuscitação", 1192, 1332, 96, 106),
    ("cuidados-pos-pcr", "Cuidados pós-PCR", "Pós-PCR", 1333, 1365, 106, 110),
    ("pcr-dave", "PCR em pacientes com DAVE", "Situações especiais", 1366, 1441, 110, 115),
    ("pcr-gestacao", "PCR associada à gestação", "Situações especiais", 1442, 1669, 115, 124),
]


def repair_mojibake(value: str) -> str:
    markers = ("Ã", "Â", "â€", "â†", "â‚", "ðŸ", "�")
    current = value
    for _ in range(2):
        if not any(marker in current for marker in markers):
            break
        try:
            candidate = current.encode("cp1252").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
        if sum(candidate.count(marker) for marker in markers) >= sum(current.count(marker) for marker in markers):
            break
        current = candidate
    return current


def clean_text(value: str) -> str:
    value = repair_mojibake(value)
    value = re.sub(r"\\([\\`*_{}\[\]()#+\-.!|>])", r"\1", value)
    value = value.replace("\\", "")
    value = value.replace("__", "")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalized(value: str) -> str:
    value = clean_text(value).casefold()
    value = re.sub(r"[^a-z0-9áàâãéêíóôõúüç%<>=+/-]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def split_table_row(line: str) -> list[str]:
    body = line.strip().strip("|")
    cells = re.split(r"(?<!\\)\|", body)
    return [cell.strip() for cell in cells]


def is_table_delimiter(line: str) -> bool:
    cells = split_table_row(line)
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def red_ranges(text: str, red_phrases: list[str]) -> list[tuple[int, int]]:
    folded = text.casefold()
    ranges: list[tuple[int, int]] = []
    for phrase in red_phrases:
        if len(normalized(phrase)) < 4:
            continue
        start = 0
        phrase_folded = phrase.casefold()
        while True:
            index = folded.find(phrase_folded, start)
            if index < 0:
                break
            ranges.append((index, index + len(phrase)))
            start = index + max(1, len(phrase))

    normalized_chars: list[str] = []
    normalized_positions: list[int] = []
    previous_separator = False
    allowed = re.compile(r"[a-z0-9áàâãéêíóôõúüç%<>=+/-]")
    for position, char in enumerate(folded):
        if allowed.fullmatch(char):
            normalized_chars.append(char)
            normalized_positions.append(position)
            previous_separator = False
        elif normalized_chars and not previous_separator:
            normalized_chars.append(" ")
            normalized_positions.append(position)
            previous_separator = True
    normalized_text = "".join(normalized_chars).strip()
    leading_offset = len(normalized_chars) - len("".join(normalized_chars).lstrip())
    normalized_positions = normalized_positions[leading_offset:leading_offset + len(normalized_text)]

    for phrase in red_phrases:
        normalized_phrase = normalized(phrase)
        if len(normalized_phrase) < 4:
            continue
        start = 0
        while True:
            index = normalized_text.find(normalized_phrase, start)
            if index < 0:
                break
            original_start = normalized_positions[index]
            original_end = normalized_positions[index + len(normalized_phrase) - 1] + 1
            ranges.append((original_start, original_end))
            start = index + len(normalized_phrase)
    if not ranges:
        return []
    ranges.sort()
    merged = [ranges[0]]
    for start, end in ranges[1:]:
        if start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def append_text_segments(target: list[dict], text: str, bold: bool, red_phrases: list[str]) -> None:
    if not text:
        return
    ranges = red_ranges(text, red_phrases)
    cursor = 0
    for start, end in ranges:
        if start > cursor:
            target.append({"kind": "text", "text": text[cursor:start], "bold": bold, "red": False})
        target.append({"kind": "text", "text": text[start:end], "bold": bold, "red": True})
        cursor = end
    if cursor < len(text):
        target.append({"kind": "text", "text": text[cursor:], "bold": bold, "red": False})


def parse_inline(value: str, red_phrases: list[str]) -> list[dict]:
    value = repair_mojibake(value)
    value = re.sub(r"\\([\\`*_{}\[\]()#+\-.!|>])", r"\1", value)
    value = value.replace("\\", "")
    token = re.compile(r"(!\[\]\[image(\d+)\])|(\*\*)")
    segments: list[dict] = []
    bold = False
    cursor = 0
    for match in token.finditer(value):
        append_text_segments(segments, value[cursor:match.start()], bold, red_phrases)
        if match.group(2):
            image_id = int(match.group(2))
            if image_id in APPROVED_ECG_IMAGE_IDS:
                segments.append({"kind": "image", "src": f"/acls-ebook/source/images/image-{image_id:02d}.png"})
        else:
            bold = not bold
        cursor = match.end()
    append_text_segments(segments, value[cursor:], bold, red_phrases)
    return [segment for segment in segments if segment.get("kind") == "image" or segment.get("text")]


def looks_like_heading(raw: str) -> tuple[bool, int, str]:
    stripped = raw.strip()
    if "ANOTA" in stripped and "EBOOK ACLS" in stripped:
        return True, 1, "ANOTAÇÕES EBOOK ACLS"
    explicit = re.match(r"^(#{1,6})\s*(.*)$", stripped)
    if explicit:
        return True, min(4, len(explicit.group(1))), clean_text(explicit.group(2).replace("**", ""))

    bold_only = re.fullmatch(r"\*\*(.+?)\*\*\s*", stripped)
    if not bold_only:
        return False, 0, ""
    candidate = clean_text(bold_only.group(1))
    letters = [char for char in candidate if char.isalpha()]
    uppercase_ratio = sum(char.isupper() for char in letters) / len(letters) if letters else 0
    if candidate.startswith("PARTE "):
        return True, 1, candidate
    if len(candidate) <= 100 and uppercase_ratio >= 0.82 and not candidate.startswith(("-", "•")):
        return True, 2, candidate
    return False, 0, ""


def parse_blocks(lines: list[str], red_by_line: list[list[str]]) -> tuple[list[dict], int]:
    blocks: list[dict] = []
    tables = 0
    index = 0
    while index < len(lines):
        raw = lines[index].rstrip()
        if not raw.strip() or re.fullmatch(r"[-—_\\\s]{4,}", raw.strip()):
            index += 1
            continue

        if raw.lstrip().startswith("|"):
            table_lines = []
            table_red: list[str] = []
            while index < len(lines) and lines[index].lstrip().startswith("|"):
                table_lines.append(lines[index])
                table_red.extend(red_by_line[index])
                index += 1
            table_red = sorted(set(table_red), key=len, reverse=True)
            rows = [split_table_row(line) for line in table_lines if not is_table_delimiter(line)]
            if rows:
                blocks.append({
                    "kind": "table",
                    "rows": [[parse_inline(cell, table_red) for cell in row] for row in rows],
                    "hasHeader": any(is_table_delimiter(line) for line in table_lines),
                })
                tables += 1
            continue

        heading, level, heading_text = looks_like_heading(raw)
        if heading:
            blocks.append({"kind": "heading", "level": level, "content": parse_inline(heading_text, red_by_line[index])})
            index += 1
            continue

        standalone_images = re.fullmatch(r"\*{0,2}((?:!\[\]\[image\d+\])+?)\*{0,2}\s*", raw.strip())
        if standalone_images:
            for image_id in re.findall(r"image(\d+)", standalone_images.group(1)):
                image_number = int(image_id)
                if image_number in APPROVED_ECG_IMAGE_IDS:
                    blocks.append({"kind": "image", "src": f"/acls-ebook/source/images/image-{image_number:02d}.png"})
            index += 1
            continue

        cleaned = raw.strip()
        list_style = None
        if re.match(r"^(?:\\?-|•)\s*", cleaned):
            list_style = "bullet"
            cleaned = re.sub(r"^(?:\\?-|•)\s*", "", cleaned)
        elif re.match(r"^\d+[.)-]\s*", cleaned):
            list_style = "number"
        blocks.append({"kind": "paragraph", "listStyle": list_style, "content": parse_inline(cleaned, red_by_line[index])})
        index += 1
    return blocks, tables


def map_lines_to_pages(lines: list[str], page_data: list[dict]) -> list[int]:
    page_texts = [normalized(page["text"]) for page in page_data]
    mapped: list[int] = []
    cursor = 0
    for raw in lines:
        candidate = re.sub(r"!\[\]\[image\d+\]", "", raw)
        candidate = clean_text(candidate.replace("**", "").replace("|", " ").lstrip("#"))
        needle = normalized(candidate)
        found = None
        if len(needle) >= 8:
            probes = [needle]
            words = needle.split()
            if len(needle) > 50:
                probes.extend((needle[:50].strip(), needle[-50:].strip()))
            if len(words) >= 6:
                probes.extend((" ".join(words[:6]), " ".join(words[-6:])))
            for page_index in range(cursor, min(len(page_texts), cursor + 8)):
                if any(len(probe) >= 8 and probe in page_texts[page_index] for probe in probes):
                    found = page_index
                    break
        if found is not None:
            cursor = found
        mapped.append(cursor)
    return mapped


def extract_images(markdown: str) -> int:
    image_dir = PUBLIC_ROOT / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    definitions = re.findall(
        r"^\[image(\d+)\]:\s*<data:image/([^;]+);base64,([^>]+)>",
        markdown,
        re.MULTILINE,
    )
    for image_id, extension, payload in definitions:
        if int(image_id) not in APPROVED_ECG_IMAGE_IDS:
            continue
        extension = "jpg" if extension.lower() == "jpeg" else extension.lower()
        decoded = base64.b64decode(payload)
        source_path = image_dir / f"image-{int(image_id):02d}.{extension}"
        source_path.write_bytes(decoded)
        if extension != "png":
            with Image.open(source_path) as image:
                image.convert("RGBA").save(image_dir / f"image-{int(image_id):02d}.png", "PNG")
            source_path.unlink()
    return sum(int(image_id) in APPROVED_ECG_IMAGE_IDS for image_id, _, _ in definitions)


def rgb(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return [round(float(value), 4)]
    return [round(float(item), 4) for item in value]


def is_red(value) -> bool:
    color = rgb(value)
    if color is None:
        return False
    if len(color) == 3:
        return color[0] >= 0.55 and color[0] > color[1] * 1.45 and color[0] > color[2] * 1.45
    if len(color) == 4:
        return color[0] <= 0.25 and color[1] >= 0.45 and color[2] >= 0.35
    return False


def load_page_data() -> list[dict]:
    if PAGE_DATA.exists():
        return json.loads(PAGE_DATA.read_text(encoding="utf-8"))

    pages = []
    PAGE_DATA.parent.mkdir(parents=True, exist_ok=True)
    with pdfplumber.open(str(PDF)) as document:
        for page_number, page in enumerate(document.pages, start=1):
            red_runs = []
            current = []
            last = None
            for char in page.chars:
                if is_red(char.get("non_stroking_color")):
                    if last and (abs(char["top"] - last["top"]) > 2 or char["x0"] - last["x1"] > 10):
                        if current:
                            red_runs.append("".join(current).strip())
                        current = []
                    current.append(char["text"])
                    last = char
                elif current:
                    red_runs.append("".join(current).strip())
                    current = []
                    last = None
            if current:
                red_runs.append("".join(current).strip())
            pages.append({
                "page": page_number,
                "text": page.extract_text(x_tolerance=2, y_tolerance=3) or "",
                "images": len(page.images),
                "tables": len(page.find_tables()),
                "red_runs": [run for run in red_runs if run],
            })
    PAGE_DATA.write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    return pages


def main() -> None:
    markdown = MARKDOWN.read_text(encoding="utf-8")
    source_lines = markdown.splitlines()[:1669]
    page_data = load_page_data()
    raw_red = [clean_text(run) for page in page_data for run in page["red_runs"]]
    red_phrases = sorted({phrase for phrase in raw_red if len(phrase) >= 2}, key=len, reverse=True)
    line_pages = map_lines_to_pages(source_lines, page_data)
    page_red = [sorted({clean_text(run) for run in page["red_runs"] if len(clean_text(run)) >= 2}, key=len, reverse=True) for page in page_data]
    red_by_line = []
    for page_index in line_pages:
        nearby = page_red[max(0, page_index - 1):min(len(page_red), page_index + 2)]
        red_by_line.append(sorted({phrase for phrases in nearby for phrase in phrases}, key=len, reverse=True))
    responsive_text = "\n".join(clean_text(line.replace("**", "")) for line in source_lines)
    responsive_normalized = normalized(responsive_text)
    matched_red = [phrase for phrase in red_phrases if normalized(phrase) in responsive_normalized]

    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    image_count = extract_images(markdown)

    chapters = []
    semantic_tables = 0
    for slug, title, group, line_start, line_end, page_start, page_end in CHAPTERS:
        blocks, table_count = parse_blocks(
            source_lines[line_start - 1:line_end],
            red_by_line[line_start - 1:line_end],
        )
        semantic_tables += table_count
        chapters.append({
            "slug": slug,
            "title": title,
            "group": group,
            "sourceLines": [line_start, line_end],
            "sourcePages": [page_start, page_end],
            "blocks": blocks,
        })

    CONTENT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    CONTENT_OUTPUT.write_text(
        json.dumps({"title": "Anotações ACLS", "chapters": chapters}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    report = {
        "officialSource": PDF.name,
        "pagesReviewed": len(page_data),
        "responsiveChapters": len(chapters),
        "uniqueImagesPreserved": image_count,
        "imageOccurrencesInPdf": sum(page["images"] for page in page_data),
        "facsimilePagesPreserved": 0,
        "pdfTablesDetected": sum(page["tables"] for page in page_data),
        "semanticTableAndBoxBlocks": semantic_tables,
        "pdfRedRunsDetected": len(raw_red),
        "uniqueRedPhrases": len(red_phrases),
        "redPhrasesMatchedInResponsiveText": len(matched_red),
        "redPhraseCoverage": round(len(matched_red) / len(red_phrases), 4) if red_phrases else 1,
        "markdownLinesMappedToPdfPages": len(line_pages),
        "markdownDefinitionsRemovedFromReading": len(re.findall(r"^\[image\d+\]:", markdown, re.MULTILINE)),
        "integrityFallback": "Conteúdo responsivo preservado; fac-símiles e ilustrações de terceiros não são publicados.",
    }
    REPORT_OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
