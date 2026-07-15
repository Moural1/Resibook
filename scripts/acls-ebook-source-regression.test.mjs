import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(await readFile(new URL("../src/content/acls-ebook-source.json", import.meta.url), "utf8"));
const report = JSON.parse(await readFile(new URL("../src/content/acls-ebook-source-report.json", import.meta.url), "utf8"));
const images = await readdir(new URL("../public/acls-ebook/source/images/", import.meta.url));
const pages = await readdir(new URL("../public/acls-ebook/source/pages/", import.meta.url));
const ebookPage = await readFile(new URL("../src/app/acls/ebook/page.tsx", import.meta.url), "utf8");

test("eBook integral mantém o inventário oficial do ACLS", () => {
  assert.equal(content.chapters.length, 12);
  assert.equal(report.pagesReviewed, 124);
  assert.equal(report.facsimilePagesPreserved, 124);
  assert.equal(report.uniqueImagesPreserved, 30);
  assert.equal(report.imageOccurrencesInPdf, 32);
  assert.equal(report.pdfTablesDetected, 76);
  assert.equal(report.pdfRedRunsDetected, 1053);
  assert.equal(images.length, 30);
  assert.equal(pages.length, 124);
});

test("todos os capítulos têm leitura responsiva e páginas oficiais", () => {
  for (const chapter of content.chapters) {
    assert.ok(chapter.blocks.length > 0, `${chapter.title} está sem blocos responsivos.`);
    assert.ok(chapter.sourcePages[0] >= 1);
    assert.ok(chapter.sourcePages[1] <= 124);
    assert.ok(chapter.sourcePages[1] >= chapter.sourcePages[0]);
  }
});

test("a leitura não expõe sintaxe Markdown", () => {
  const visibleText = content.chapters.flatMap((chapter) => chapter.blocks.flatMap((block) => {
    const segments = block.kind === "table"
      ? block.rows.flatMap((row) => row.flat())
      : block.content ?? [];
    return segments.filter((segment) => segment.kind === "text").map((segment) => segment.text);
  })).join("\n");

  assert.equal(visibleText.includes("\\"), false);
  assert.equal(visibleText.includes("**"), false);
  assert.equal(visibleText.includes("__"), false);
});

test("o eBook permanece separado dos protocolos rápidos", () => {
  assert.equal(ebookPage.includes("ACLS_NAVIGATION"), false);
  assert.equal(ebookPage.includes("getAclsProtocol"), false);
  assert.equal(ebookPage.includes("ACLS_EBOOK_SOURCE_CHAPTERS"), true);
});
