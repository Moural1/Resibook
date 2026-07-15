export type EbookLayoutSegment =
  | { kind: "text"; text: string; bold: boolean; red: boolean }
  | { kind: "image"; src: string };

function lineText(line: EbookLayoutSegment[]) {
  return line
    .filter((segment): segment is Extract<EbookLayoutSegment, { kind: "text" }> => segment.kind === "text")
    .map((segment) => segment.text)
    .join("");
}

function startsWithUppercase(text: string) {
  return /^-?\s*[A-ZÀ-ÖØ-Þ0-9]/.test(text.trim());
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
      const separatesHighlightedItems = segment.text.length >= 2 || Boolean(
        previous?.kind === "text" && previous.red &&
        next?.kind === "text" && next.red && startsWithUppercase(next.text) &&
        !previousText.endsWith("(") && !/^OU\b/i.test(next.text.trim()),
      );
      if (separatesHighlightedItems) turn(); else append(segment);
      continue;
    }

    if (/^;$/.test(trimmed) && previous?.kind === "text" && previous.red && next?.kind === "text" && next.red) {
      turn();
      continue;
    }

    const beginsNewMarkedItem = /^\s*-\s*[A-ZÀ-ÖØ-Þ0-9]/.test(segment.text) && previousText.length > 0;
    const followsSentence = /[.!?]$/.test(previousText) && startsWithUppercase(segment.text);
    if (beginsNewMarkedItem || followsSentence) turn();

    const boundaryPattern = /\s{2,}|(?<=[.!?])\s+(?=[-A-ZÀ-ÖØ-Þ0-9])|\s+(?=-\s*[A-ZÀ-ÖØ-Þ0-9])/g;
    let cursor = 0;
    for (const match of segment.text.matchAll(boundaryPattern)) {
      const boundaryAt = match.index ?? 0;
      const before = segment.text.slice(cursor, boundaryAt);
      if (before) append({ ...segment, text: before });
      turn();
      cursor = boundaryAt + match[0].length;
    }
    const remainder = segment.text.slice(cursor);
    if (remainder) append({ ...segment, text: remainder });
  }

  return steps.filter((step) => step.some((segment) => segment.kind === "image" || segment.text.trim()));
}

export function removeLeadingListMarker(step: EbookLayoutSegment[]) {
  let removed = false;
  return step.map((segment) => {
    if (removed || segment.kind !== "text" || !segment.text.trim()) return segment;
    removed = true;
    return { ...segment, text: segment.text.replace(/^\s*-\s*/, "") };
  });
}
