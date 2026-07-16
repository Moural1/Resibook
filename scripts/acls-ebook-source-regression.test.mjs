import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { hasVisibleRichContent, splitRichClauses, splitRichExplicitItems, splitRichSteps, structureRichContent } from "../src/lib/acls-ebook-layout.ts";
import { paginateEbookBlocks } from "../src/lib/acls-ebook-pagination.ts";
import { discardLegacyAclsEbookLayoutHints, prepareAclsEbookDocumentForEditing, validateAclsEbookDocument } from "../src/lib/acls-ebook-schema.ts";

const content = JSON.parse(await readFile(new URL("../src/content/acls-ebook-source.json", import.meta.url), "utf8"));
const report = JSON.parse(await readFile(new URL("../src/content/acls-ebook-source-report.json", import.meta.url), "utf8"));
const layoutHints = JSON.parse(await readFile(new URL("../src/content/acls-ebook-layout-hints.json", import.meta.url), "utf8"));
const images = await readdir(new URL("../public/acls-ebook/source/images/", import.meta.url));
const pages = await readdir(new URL("../public/acls-ebook/source/pages/", import.meta.url));
const visualAtlas = await readdir(new URL("../public/acls-ebook/visuals/", import.meta.url));
const ebookPage = await readFile(new URL("../src/app/acls/ebook/page.tsx", import.meta.url), "utf8");
const ebookSourceModule = await readFile(new URL("../src/lib/acls-ebook-source.ts", import.meta.url), "utf8");
const ebookReader = await readFile(new URL("../src/components/acls-ebook-source-view.tsx", import.meta.url), "utf8");
const ebookShell = await readFile(new URL("../src/components/acls-ebook.tsx", import.meta.url), "utf8");
const ebookAdmin = await readFile(new URL("../src/app/admin/acls-ebook/acls-ebook-admin-client.tsx", import.meta.url), "utf8");
const ebookAdminRoute = await readFile(new URL("../src/app/api/admin/acls-ebook/route.ts", import.meta.url), "utf8");
const ebookMigration = await readFile(new URL("../supabase/migrations/20260716100000_acls_ebook_editor.sql", import.meta.url), "utf8");

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
  assert.equal(visualAtlas.length, 20);
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
  assert.equal(ebookPage.includes("getPublishedAclsEbookDocument"), true);
});

test("editor ACLS usa blocos validados e mantém referência editorial ao reordenar", () => {
  const prepared = prepareAclsEbookDocumentForEditing({ schemaVersion: 1, chapters: content.chapters });
  const validation = validateAclsEbookDocument(prepared);
  assert.equal(validation.valid, true);
  assert.equal(prepared.chapters[0].blocks[0].layoutHintKey, 0);
  assert.ok(prepared.chapters[0].blocks[0].id);

  const withFlow = structuredClone(prepared);
  withFlow.chapters[0].blocks.push({
    id: "flow-test",
    layoutHintKey: null,
    kind: "flow",
    title: "Fluxo seguro",
    nodes: [
      { id: "step-1", title: "Avaliar", detail: "", tone: "info" },
      { id: "step-2", title: "Tratar", detail: "", tone: "conduct" },
    ],
  });
  assert.equal(validateAclsEbookDocument(withFlow).valid, true);
  withFlow.chapters[0].blocks.at(-1).nodes = [];
  assert.equal(validateAclsEbookDocument(withFlow).valid, false);
});

test("editor administrativo separa rascunho, prévia e publicação versionada", () => {
  assert.match(ebookAdmin, /Salvar rascunho/);
  assert.match(ebookAdmin, /Publicar/);
  assert.match(ebookAdmin, /AclsEbookSourceView/);
  assert.match(ebookAdmin, /\["table", Table2, "Tabela"\]/);
  assert.match(ebookAdmin, /\["flow", GitBranch, "Fluxo"\]/);
  assert.match(ebookAdminRoute, /isResibookAdmin/);
  assert.match(ebookAdminRoute, /expectedRevision/);
  assert.match(ebookAdminRoute, /publish_acls_ebook/);
  assert.match(ebookMigration, /acls_ebook_drafts/);
  assert.match(ebookMigration, /acls_ebook_publications/);
  assert.match(ebookMigration, /acls_ebook_revisions/);
  assert.match(ebookMigration, /public\.is_resibook_admin\(\)/);
});

test("leitor preserva quebras editoriais e nunca parte palavras entre destaques", () => {
  assert.match(ebookReader, /whitespace-pre-line/);
  assert.match(ebookReader, /break-keep/);
  assert.match(ebookReader, /\[overflow-wrap:normal\]/);
  assert.match(ebookReader, /\[word-break:normal\]/);
  assert.match(ebookReader, /columnCount \* 220/);
});

test("marcadores antigos do PDF nunca dividem palavras depois de uma edição", () => {
  const prevention = content.chapters.find((chapter) => chapter.slug === "prevencao-pcr");
  const editedCell = prevention.blocks[4].rows[0][0];
  const cellText = editedCell.filter((segment) => segment.kind === "text").map((segment) => segment.text).join("");
  const staleHints = ["PAS <", "Hipertensão sintomáti", "Redução inesperada da consciênc", "Convu", "Queda do débito uri"].map((fragment) => ({
    offset: cellText.indexOf(fragment) + fragment.length,
    level: 0,
  }));
  const structured = structureRichContent(editedCell, [{ offset: 0, level: 0 }, ...staleHints]);
  assert.deepEqual(structured.items, []);
  const fallbackText = splitRichSteps(editedCell).map((item) => item.filter((segment) => segment.kind === "text").map((segment) => segment.text).join("").trim());
  assert.ok(fallbackText.includes("Hipertensão sintomática"));
  assert.ok(fallbackText.includes("Redução inesperada da consciência"));
  assert.ok(fallbackText.includes("Convulsão"));
  assert.match(ebookAdmin, /layoutHintKey: null/);
});

test("conteúdo salvo pelo administrador nunca reutiliza marcadores do PDF", () => {
  const prepared = prepareAclsEbookDocumentForEditing({ schemaVersion: 1, chapters: content.chapters });
  assert.ok(prepared.chapters.some((chapter) => chapter.blocks.some((block) => block.layoutHintKey !== null)));
  const authoritative = discardLegacyAclsEbookLayoutHints(prepared);
  assert.ok(authoritative.chapters.every((chapter) => chapter.blocks.every((block) => block.layoutHintKey === null)));
  assert.match(ebookAdminRoute, /discardLegacyAclsEbookLayoutHints\(saved\.document\)/);
  assert.match(ebookSourceModule, /discardLegacyAclsEbookLayoutHints\(validation\.document\)/);
});

test("a troca de capítulos nunca aponta para uma página inexistente", () => {
  assert.equal(ebookReader.includes("pages[safePageIndex]"), true);
  assert.equal(ebookShell.includes("key={sourceChapter.slug}"), true);
});

test("quadros de uma célula recebem diagramação editorial própria", () => {
  assert.equal(ebookReader.includes("const singleCell = block.rows.length === 1"), true);
  assert.equal(ebookReader.includes("Quadro clínico"), true);
});

test("a divisão visual preserva agrupamentos clínicos do material editorial", () => {
  const sca = content.chapters.find((chapter) => chapter.slug === "sindromes-coronarianas");
  const avc = content.chapters.find((chapter) => chapter.slug === "avc-agudo");
  const text = (step) => step.filter((segment) => segment.kind === "text").map((segment) => segment.text).join("").replace(/\s+/g, " ").trim();
  const scaFlow = structureRichContent(sca.blocks[44].rows[0][0], layoutHints["sindromes-coronarianas:44:0:0"]);
  const avcChecklist = structureRichContent(avc.blocks[41].rows[0][0], layoutHints["avc-agudo:41:0:0"]);
  const scaChildren = scaFlow.items.flatMap((item) => item.children).flatMap((child) => splitRichSteps(child));

  assert.ok(scaChildren.some((step) => text(step).includes("Sintomas que iniciaram a < 12 HORAS")));
  assert.equal(scaChildren.some((step) => text(step) === "Sintomas que"), false);
  assert.equal(avcChecklist.items.length, 11);
  assert.ok(avcChecklist.items.some((item) => text(item.content).includes("Obter história: início dos sintomas; última vez visto normal; medicamentos; anticoagulantes; comorbidades; procedimentos recentes")));
});

test("hierarquia das tabelas é recuperada do PDF oficial em todo o eBook", () => {
  const keys = Object.keys(layoutHints);
  const representedChapters = new Set(keys.map((key) => key.split(":")[0]));
  assert.ok(keys.length >= 145);
  assert.ok(Object.values(layoutHints).reduce((total, hints) => total + hints.length, 0) >= 650);
  assert.ok(representedChapters.size >= 11, "A recuperação do PDF não alcançou o inventário editorial esperado.");

  const avc = content.chapters.find((chapter) => chapter.slug === "avc-agudo");
  const firstAssessmentRow = structureRichContent(avc.blocks[42].rows[0][0], layoutHints["avc-agudo:42:0:0"]);
  assert.ok(firstAssessmentRow.items.length === 1);
  assert.ok(firstAssessmentRow.items[0].children.length >= 3);
  assert.ok(firstAssessmentRow.items[0].children.some((child) => textOf(child).includes("Usar escala validada de AVC")));

  const airway = content.chapters.find((chapter) => chapter.slug === "parada-respiratoria-via-aerea");
  const intubation = structureRichContent(airway.blocks[110].rows[0][0], layoutHints["parada-respiratoria-via-aerea:110:0:0"]);
  assert.equal(intubation.items.length, 8);
  assert.ok(intubation.items[4].children.length >= 3);
  assert.ok(intubation.items[7].children.length >= 3);
});

test("títulos vazios não são renderizados nem podem ocupar páginas", () => {
  const avc = content.chapters.find((chapter) => chapter.slug === "avc-agudo");
  const emptyHeadings = avc.blocks.filter((block) => block.kind === "heading" && !hasVisibleRichContent(block.content));
  assert.ok(emptyHeadings.length >= 3);
  for (const chapter of content.chapters) {
    const chapterPages = paginateEbookBlocks(chapter.blocks);
    assert.ok(chapterPages.every((page) => page.some((entry) => entry.block.kind !== "heading")), `${chapter.title} ainda possui página apenas com título.`);
    assert.ok(chapterPages.slice(0, -1).every((page) => page.at(-1)?.block.kind !== "heading"), `${chapter.title} ainda possui título órfão no fim da página.`);
  }
});

test("marcadores numéricos permanecem unidos à respectiva conduta", () => {
  const airway = content.chapters.find((chapter) => chapter.slug === "parada-respiratoria-via-aerea");
  const intubation = splitRichSteps(airway.blocks[110].rows[0][0]).map(textOf);
  assert.ok(intubation.includes("1. Reunir todo o equipamento necessário."));
  assert.ok(intubation.includes("2. Realizar a intubação endotraqueal."));
  assert.equal(intubation.some((item) => /^\d+[.)]$/.test(item)), false);

  const arrest = content.chapters.find((chapter) => chapter.slug === "ritmos-de-parada");
  const afterShock = splitRichSteps(arrest.blocks[11].rows[3][0]).map(textOf);
  assert.ok(afterShock.includes("2. Realizar RCP por 2 minutos."));
  assert.ok(afterShock.includes("5. Verificar pulso apenas se houver ritmo organizado."));

  const dave = content.chapters.find((chapter) => chapter.slug === "pcr-dave");
  const deviceAssessment = splitRichSteps(dave.blocks[3].rows[0][0]).map(textOf);
  assert.ok(deviceAssessment.some((item) => item.startsWith("1. AUXILIE NA VENTILAÇÃO")));
  assert.equal(deviceAssessment.some((item) => item === "1."), false);
});

test("tabelas editoriais achatadas possuem fallback de leitura em itens", () => {
  const fundamentals = content.chapters.find((chapter) => chapter.slug === "fundamentos-abordagem");
  const systematic = splitRichSteps(fundamentals.blocks[39].rows[1][0]).map(textOf);
  const recovery = splitRichSteps(fundamentals.blocks[24].rows[1][0]).map(textOf);
  const quality = splitRichSteps(fundamentals.blocks[48].rows[1][0]).map(textOf);
  const reversibleCauses = splitRichSteps(fundamentals.blocks[70].rows[1][0]).map(textOf);
  const thromboticCauses = splitRichSteps(fundamentals.blocks[71].rows[1][0]).map(textOf);

  assert.equal(systematic.length, 4);
  assert.equal(recovery.length, 5);
  assert.ok(quality.length >= 4);
  assert.ok(reversibleCauses.includes("H+ - Acidose"));
  assert.deepEqual(thromboticCauses, ["TEP", "Tamponamento cardíaco", "Tóxicos", "Tensão no tórax (Pneumotórax)", "Trombose coronariana"]);
  assert.equal(ebookReader.includes("structuredCellData"), true);
  assert.equal(ebookReader.includes("hasTitleRow"), true);
});

test("tabelas multidimensionais só separam itens nos marcadores explícitos do conteúdo", () => {
  const arrest = content.chapters.find((chapter) => chapter.slug === "ritmos-de-parada");
  const fluids = splitRichExplicitItems(arrest.blocks[18].rows[0][0]);
  const ultrasound = splitRichExplicitItems(arrest.blocks[18].rows[0][1]);
  assert.ok(textOf(fluids.intro).includes("FLUIDOS"));
  assert.ok(fluids.items.some((item) => textOf(item).includes("Hipovolemia")));
  assert.ok(textOf(ultrasound.intro).includes("ULTRASSOM"));
  assert.ok(ultrasound.items.some((item) => textOf(item).includes("Não deve atrasar ou interromper a RCP")));

  const dave = content.chapters.find((chapter) => chapter.slug === "pcr-dave");
  const yes = splitRichExplicitItems(dave.blocks[5].rows[0][0]);
  const no = splitRichExplicitItems(dave.blocks[5].rows[0][1]);
  assert.ok(textOf(yes.intro).includes("SE SIM"));
  assert.ok(textOf(no.intro).includes("SE NÃO"));

  const tachycardia = content.chapters.find((chapter) => chapter.slug === "taquiarritmias");
  const noPulse = splitRichExplicitItems(tachycardia.blocks[35].rows[0][1]);
  assert.ok(textOf(noPulse.intro).includes("DESFIBRILADOR EM CARGA MÁXIMA SEM APERTAR O SYNC E COMEÇAR MASSAGEM CARDÍACA"));

  const stroke = content.chapters.find((chapter) => chapter.slug === "avc-agudo");
  const mimics = splitRichExplicitItems(stroke.blocks[55].rows[0][0]);
  assert.equal(mimics.items.length, 0, "Uma mudança de cor não pode criar um novo item.");
});

test("títulos e tabelas multidimensionais usam a identidade editorial estável", () => {
  assert.equal(ebookReader.includes("<RichContent content={block.content} inheritColor />"), true);
  assert.equal(ebookReader.includes("function TableCellContent({ content }"), true);
  assert.equal(ebookReader.includes("const hasColumnHeader"), true);
});

test("nenhum quadro longo de uma célula permanece compactado", () => {
  let audited = 0;
  for (const chapter of content.chapters) {
    for (const [blockIndex, block] of chapter.blocks.entries()) {
      if (block.kind !== "table" || block.rows.length !== 1 || block.rows[0]?.length !== 1) continue;
      const segments = block.rows[0][0];
      const visibleLength = segments
        .filter((segment) => segment.kind === "text")
        .reduce((total, segment) => total + segment.text.trim().length, 0);
      if (visibleLength < 280) continue;
      audited += 1;
      const key = `${chapter.slug}:${blockIndex}:0:0`;
      const pdfStructure = structureRichContent(segments, layoutHints[key] ?? []);
      const steps = splitRichSteps(segments);
      const hasStructuredReading = pdfStructure.items.length >= 2 || pdfStructure.items.some((item) => item.children.length >= 2) || steps.length >= 2 || steps.some((step) => splitRichClauses(step).length >= 3);
      assert.ok(hasStructuredReading, `${chapter.title}, bloco ${blockIndex}, contém um quadro longo sem divisão visual.`);
    }
  }
  assert.ok(audited >= 40, "A auditoria encontrou menos quadros longos que o inventário esperado.");
});

function textOf(segments) {
  return segments.filter((segment) => segment.kind === "text").map((segment) => segment.text).join("").replace(/\s+/g, " ").trim();
}
