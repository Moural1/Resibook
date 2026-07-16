import type { AclsEbookRichText, AclsEbookSourceBlock } from "./acls-ebook-source.ts";
import { hasVisibleRichContent, splitRichSteps } from "./acls-ebook-layout.ts";

export const EBOOK_PAGE_WEIGHT = 2700;

export type EbookReaderBlock = {
  block: AclsEbookSourceBlock;
  sourceIndex: number;
};

function segmentLength(segment: AclsEbookRichText) {
  return segment.kind === "text" ? segment.text.length : 650;
}

export function ebookBlockWeight(block: AclsEbookSourceBlock) {
  if (block.kind === "image") return 760;
  if (block.kind === "heading") return block.level <= 1 ? 190 : 125;
  if (block.kind === "table") {
    const characters = block.rows.flat(2).reduce((total, segment) => total + segmentLength(segment), 0);
    const structuredSteps = block.rows.reduce(
      (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + splitRichSteps(cell).length, 0),
      0,
    );
    return Math.max(620, characters + block.rows.length * 90 + Math.min(structuredSteps, 18) * 85);
  }
  return Math.max(90, block.content.reduce((total, segment) => total + segmentLength(segment), 0));
}

function visibleBlocks(blocks: AclsEbookSourceBlock[]) {
  return blocks.flatMap((block, sourceIndex) => (
    block.kind === "heading" && !hasVisibleRichContent(block.content)
      ? []
      : [{ block, sourceIndex }]
  ));
}

function editorialUnits(blocks: AclsEbookSourceBlock[]) {
  const units: EbookReaderBlock[][] = [];
  let pendingHeadings: EbookReaderBlock[] = [];

  for (const entry of visibleBlocks(blocks)) {
    if (entry.block.kind === "heading") {
      pendingHeadings.push(entry);
      continue;
    }

    if (pendingHeadings.length) {
      units.push([...pendingHeadings, entry]);
      pendingHeadings = [];
    } else {
      units.push([entry]);
    }
  }

  if (pendingHeadings.length) {
    if (units.length) units[units.length - 1].push(...pendingHeadings);
    else units.push(pendingHeadings);
  }

  return units;
}

export function paginateEbookBlocks(blocks: AclsEbookSourceBlock[]) {
  const pages: EbookReaderBlock[][] = [];
  let page: EbookReaderBlock[] = [];
  let weight = 0;

  for (const unit of editorialUnits(blocks)) {
    const unitWeight = unit.reduce((total, entry) => total + ebookBlockWeight(entry.block), 0);
    const startsSection = unit[0]?.block.kind === "heading";
    const shouldTurn = page.length > 0 && (
      weight + unitWeight > EBOOK_PAGE_WEIGHT ||
      (startsSection && weight > EBOOK_PAGE_WEIGHT * 0.82)
    );

    if (shouldTurn) {
      pages.push(page);
      page = [];
      weight = 0;
    }

    page.push(...unit);
    weight += unitWeight;
  }

  if (page.length) pages.push(page);
  return pages.length ? pages : [[]];
}

export function isMediaFocusedEbookPage(page: EbookReaderBlock[]) {
  return page.length <= 3 &&
    page.some((entry) => entry.block.kind === "image") &&
    page.every((entry) => entry.block.kind === "heading" || entry.block.kind === "image");
}
