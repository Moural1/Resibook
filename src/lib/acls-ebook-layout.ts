export type EbookLayoutSegment =
  | { kind: "text"; text: string; bold: boolean; red: boolean }
  | { kind: "image"; src: string };

export type EbookLayoutHint = { offset: number; level: number };
export type EbookStructuredItem = { content: EbookLayoutSegment[]; children: EbookLayoutSegment[][] };

function lineText(line: EbookLayoutSegment[]) {
  return line
    .filter((segment): segment is Extract<EbookLayoutSegment, { kind: "text" }> => segment.kind === "text")
    .map((segment) => segment.text)
    .join("");
}

function startsWithUppercase(text: string) {
  return /^-?\s*[A-ZÀ-ÖØ-Þ0-9]/.test(text.trim());
}

const CONTINUATION_WORDS = /(?:^|\s)(?:a|ao|aos|à|às|com|como|da|das|de|do|dos|e|em|entre|na|nas|no|nos|ou|para|pela|pelas|pelo|pelos|por|que|se)$/i;

function shouldSplitSpacing(left: string, right: string) {
  const normalizedLeft = left.trim();
  const normalizedRight = right.trim();
  if (!normalizedLeft || !normalizedRight || !startsWithUppercase(normalizedRight)) return false;
  if (/^(?:\d+[.)]|-)$/.test(normalizedLeft)) return false;
  if (/^[A-Z]\+$/i.test(normalizedLeft)) return false;
  if (/^\d+\s*\/\s*\d+/.test(normalizedRight)) return false;
  return !CONTINUATION_WORDS.test(normalizedLeft);
}

export function hasVisibleRichContent(content: EbookLayoutSegment[]) {
  return content.some((segment) => segment.kind === "image" || segment.text.trim().length > 0);
}

export function splitRichSteps(content: EbookLayoutSegment[]) {
  const steps: EbookLayoutSegment[][] = [[]];

  function current() {
    return steps[steps.length - 1];
  }

  function turn() {
    if (current().some((segment) => segment.kind === "image" || segment.text.trim())) steps.push([]);
  }

  function append(segment: EbookLayoutSegment) {
    if (segment.kind === "image" || segment.text) current().push(segment);
  }

  for (let index = 0; index < content.length; index += 1) {
    const segment = content[index];

    if (segment.kind === "image") {
      turn();
      append(segment);
      turn();
      continue;
    }

    const next = content.slice(index + 1).find((candidate) => candidate.kind === "image" || candidate.text.trim());
    const previousText = lineText(current()).trim();
    const trimmed = segment.text.trim();
    const previous = [...current()].reverse().find((candidate) => candidate.kind === "text" && candidate.text.trim());

    if (!trimmed) {
      const previousIsMarker = /^(?:\d+[.)]|-)$/.test(previousText);
      const previousIsStandaloneAcronym = /^[A-Z0-9]{2,6}$/.test(previousText);
      const separatesHighlightedItems = segment.text.length >= 2 || Boolean(
        previous?.kind === "text" && previous.red &&
        next?.kind === "text" && next.red && startsWithUppercase(next.text) &&
        !CONTINUATION_WORDS.test(previousText) &&
        !previousText.endsWith("(") && !/^OU\b/i.test(next.text.trim()),
      ) || Boolean(previousIsStandaloneAcronym && next?.kind === "text" && next.red && startsWithUppercase(next.text));
      if (separatesHighlightedItems && !previousIsMarker) turn(); else append(segment);
      continue;
    }

    const beginsNewMarkedItem = /^\s*-\s*[A-ZÀ-ÖØ-Þ0-9]/.test(segment.text) && previousText.length > 0;
    const followsSentence = /[.!?]$/.test(previousText) && !/^\d+[.)]$/.test(previousText) && startsWithUppercase(segment.text);
    const beginsClinicalThreshold = /^[<>≤≥]\s*\d+/.test(trimmed) && /:$/.test(previousText);
    const separatorAfterSegment = content[index + 1];
    const highlightedAfterSeparator = content[index + 2];
    const startsHighlightedSequence = /^[A-Z0-9]{2,6}$/.test(previousText) &&
      previous?.kind === "text" && !previous.red && segment.red && startsWithUppercase(segment.text) &&
      separatorAfterSegment?.kind === "text" && !separatorAfterSegment.text.trim() &&
      highlightedAfterSeparator?.kind === "text" && highlightedAfterSeparator.red;
    if (beginsNewMarkedItem || followsSentence || beginsClinicalThreshold || startsHighlightedSequence) turn();

    const boundaryPattern = /\s{2,}|(?<=[.!?])\s+(?=[-A-ZÀ-ÖØ-Þ0-9])|\s+(?=-\s*[A-ZÀ-ÖØ-Þ0-9])|\s+(?=(?:[≤≥]\s*\d+|ClCr\s*[<>≤≥]))/g;
    let cursor = 0;
    for (const match of segment.text.matchAll(boundaryPattern)) {
      const boundaryAt = match.index ?? 0;
      const before = segment.text.slice(cursor, boundaryAt);
      if (before) append({ ...segment, text: before });
      const left = `${lineText(current())}`;
      const right = segment.text.slice(boundaryAt + match[0].length);
      if (/^(?:[≤≥]\s*\d+|ClCr\s*[<>≤≥])/.test(right) || shouldSplitSpacing(left, right)) {
        turn();
      } else {
        append({ ...segment, text: match[0] });
      }
      cursor = boundaryAt + match[0].length;
    }
    const remainder = segment.text.slice(cursor);
    if (remainder) append({ ...segment, text: remainder });
  }

  return steps.filter((step) => step.some((segment) => segment.kind === "image" || segment.text.trim()));
}

export function splitRichClauses(content: EbookLayoutSegment[]) {
  const clauses: EbookLayoutSegment[][] = [[]];

  for (const segment of content) {
    if (segment.kind === "image") {
      clauses[clauses.length - 1].push(segment);
      continue;
    }

    let cursor = 0;
    for (const match of segment.text.matchAll(/;\s*/g)) {
      const boundary = (match.index ?? 0) + 1;
      clauses[clauses.length - 1].push({ ...segment, text: segment.text.slice(cursor, boundary) });
      clauses.push([]);
      cursor = (match.index ?? 0) + match[0].length;
    }
    const remainder = segment.text.slice(cursor);
    if (remainder) clauses[clauses.length - 1].push({ ...segment, text: remainder });
  }

  return clauses.filter(hasVisibleRichContent);
}

function sliceRichContent(content: EbookLayoutSegment[], start: number, end: number) {
  const result: EbookLayoutSegment[] = [];
  let cursor = 0;

  for (const segment of content) {
    if (segment.kind === "image") {
      if (cursor >= start && cursor < end) result.push(segment);
      continue;
    }
    const segmentStart = cursor;
    const segmentEnd = cursor + segment.text.length;
    const localStart = Math.max(0, start - segmentStart);
    const localEnd = Math.min(segment.text.length, end - segmentStart);
    if (localStart < localEnd) result.push({ ...segment, text: segment.text.slice(localStart, localEnd) });
    cursor = segmentEnd;
  }

  return result;
}

export function splitRichExplicitItems(content: EbookLayoutSegment[]) {
  const source = content
    .filter((segment): segment is Extract<EbookLayoutSegment, { kind: "text" }> => segment.kind === "text")
    .map((segment) => segment.text)
    .join("");
  const markers = [...source.matchAll(/(^|\s+)-\s*(?=[\p{Lu}0-9<])/gu)];
  if (!markers.length) return { intro: content, items: [] as EbookLayoutSegment[][] };

  const introEnd = markers[0].index ?? 0;
  const intro = sliceRichContent(content, 0, introEnd);
  const items = markers.flatMap((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end = markers[index + 1]?.index ?? source.length;
    const item = sliceRichContent(content, start, end);
    return hasVisibleRichContent(item) ? [item] : [];
  });

  return { intro, items };
}

export function structureRichContent(content: EbookLayoutSegment[], hints: EbookLayoutHint[]) {
  const length = content.reduce((total, segment) => total + (segment.kind === "text" ? segment.text.length : 0), 0);
  const sourceText = lineText(content);
  const candidateBoundaries = hints
    .filter((hint) => Number.isInteger(hint.offset) && hint.offset >= 0 && hint.offset < length);
  const splitsInsideToken = candidateBoundaries.some((hint) => {
    if (hint.offset === 0) return false;
    return /[\p{L}\p{N}]/u.test(sourceText[hint.offset - 1] ?? "") && /[\p{L}\p{N}]/u.test(sourceText[hint.offset] ?? "");
  });
  if (splitsInsideToken) return { intro: [] as EbookLayoutSegment[], items: [] as EbookStructuredItem[] };

  const boundaries = candidateBoundaries
    .sort((left, right) => left.offset - right.offset)
    .filter((hint, index, all) => index === 0 || hint.offset !== all[index - 1].offset);

  if (!boundaries.length) return { intro: [] as EbookLayoutSegment[], items: [] as EbookStructuredItem[] };

  const intro = sliceRichContent(content, 0, boundaries[0].offset);
  const items: EbookStructuredItem[] = [];
  for (let index = 0; index < boundaries.length; index += 1) {
    const hint = boundaries[index];
    const nextOffset = boundaries[index + 1]?.offset ?? length;
    const piece = removeLeadingListMarker(sliceRichContent(content, hint.offset, nextOffset));
    if (!hasVisibleRichContent(piece)) continue;
    if (hint.level > 0 && items.length) {
      items[items.length - 1].children.push(piece);
    } else {
      items.push({ content: piece, children: [] });
    }
  }

  return { intro, items };
}

export function removeLeadingListMarker(step: EbookLayoutSegment[]) {
  let removed = false;
  return step.map((segment) => {
    if (removed || segment.kind !== "text" || !segment.text.trim()) return segment;
    removed = true;
    return { ...segment, text: segment.text.replace(/^\s*-\s*/, "") };
  });
}
