import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("dashboard prioriza o fluxo assistencial sem remover os módulos", async () => {
  const dashboard = await source("../src/app/dashboard/page.tsx");

  assert.match(dashboard, /O que precisa ser resolvido agora\?/);
  assert.match(dashboard, /Atendimento em andamento/);
  assert.match(dashboard, /Comece pela ação clínica/);
  assert.match(dashboard, /Mais ferramentas do atendimento/);
  assert.match(dashboard, /Estudo e acervo pessoal/);

  for (const route of [
    "/caso-rapido",
    "/prescricao",
    "/condutas",
    "/calculadoras",
    "/pacientes",
    "/exames-evolucao",
    "/cids",
    "/ecg-guiado",
    "/acls",
    "/plantao/checklist-risco",
    "/plantao/alta-segura",
    "/plantao/encaminhamento",
    "/topicos",
    "/flashcards",
    "/revisao-topicos",
    "/nunca-mais-errar",
    "/meu-resibook",
  ]) {
    assert.match(dashboard, new RegExp(route.replaceAll("/", "\\/")));
  }

  assert.doesNotMatch(dashboard, /Quatro formas de usar/);
  assert.doesNotMatch(dashboard, /O que você quer fazer/);
  assert.doesNotMatch(dashboard, /Comece em 30 segundos/);
});

test("topbar mantém a busca como porta principal e reduz atalhos concorrentes", async () => {
  const topbar = await source("../src/components/topbar.tsx");
  const quickLinkBlock = topbar.slice(
    topbar.indexOf("const fullQuickLinks"),
    topbar.indexOf("const guestQuickLinks")
  );

  for (const label of ["Pacientes", "Prescrição", "Condutas", "Calculadoras"]) {
    assert.match(quickLinkBlock, new RegExp(`label: "${label}"`));
  }

  for (const label of ["Exames", "Tópicos", "Revisão", "Flashcards", "CIDs", "ECG guiado"]) {
    assert.doesNotMatch(quickLinkBlock, new RegExp(`label: "${label}"`));
  }

  assert.match(topbar, /min-\[1760px\]:flex/);
});

test("CTA principal mantém contraste e cabeçalhos internos exibem localização", async () => {
  const [dashboard, header] = await Promise.all([
    source("../src/app/dashboard/page.tsx"),
    source("../src/components/module-page-header.tsx"),
  ]);

  assert.match(dashboard, /BUTTON_PRIMARY = "[^"]*bg-cyan-800[^"]*text-white/);
  assert.match(header, /aria-label="Localização no aplicativo"/);
  assert.match(header, /href="\/dashboard"/);
  assert.match(header, /Central clínica/);
  assert.match(header, /Atendimento/);
  assert.match(header, /Protocolos e consulta/);
  assert.match(header, /Estudo e acervo/);
  assert.match(header, /Conta e acesso/);
});

test("sidebar é mantida, compacta e agrupada por intenção clínica", async () => {
  const shell = await source("../src/components/app-shell.tsx");

  for (const section of [
    "Atendimento",
    "Protocolos e consulta",
    "Estudo e acervo",
    "Conta e acesso",
  ]) {
    assert.match(shell, new RegExp(`title="${section}"`));
  }

  for (const route of [
    "/dashboard",
    "/plantao",
    "/caso-rapido",
    "/pacientes",
    "/prescricao",
    "/exames-evolucao",
    "/condutas",
    "/calculadoras",
    "/acls",
    "/topicos",
    "/cids",
    "/ecg-guiado",
    "/meu-resibook",
    "/flashcards",
    "/revisao-topicos",
    "/nunca-mais-errar",
  ]) {
    assert.match(shell, new RegExp(route.replaceAll("/", "\\/")));
  }

  assert.match(shell, /w-\[248px\]/);
  assert.match(shell, /lg:pl-\[248px\]/);
});

test("módulos prioritários compartilham o mesmo cabeçalho clínico", async () => {
  const pages = await Promise.all(
    [
      "plantao",
      "prescricao",
      "condutas",
      "pacientes",
      "calculadoras",
      "metricas",
      "suporte",
    ].map((route) => source(`../src/app/${route}/page.tsx`))
  );

  for (const page of pages) {
    assert.match(page, /<ModulePageHeader/);
  }
});

test("calculadoras funcionam como central clínica com descoberta e continuidade", async () => {
  const calculators = await source("../src/app/calculadoras/page.tsx");

  for (const area of [
    "Emergência",
    "Cardiovascular",
    "Neuro e trauma",
    "Rim e metabolismo",
    "Obstetrícia",
    "Clínica geral",
  ]) {
    assert.match(calculators, new RegExp(area));
  }

  assert.match(calculators, /Acesso rápido/);
  assert.match(calculators, /Ferramentas frequentes no atendimento/);
  assert.match(calculators, /CALCULATOR_FAVORITES_KEY/);
  assert.match(calculators, /CALCULATOR_RECENTS_KEY/);
  assert.match(calculators, /calculatorStorageKey\(key, currentUserId\)/);
  assert.match(calculators, /supabase\.auth\.getSession\(\)/);
  assert.match(calculators, /role="tablist"/);
  assert.match(calculators, /router\.replace\(`\/calculadoras\?calculadora=/);
});

test("animação de entrada não prende modais fixos dentro da página", async () => {
  const css = await source("../src/app/globals.css");
  // fill-mode "both"/"forwards" deixa um transform aplicado e transforma o
  // conteúdo em containing block de position:fixed (gaveta de prescrição).
  assert.match(css, /\.page-enter > \* \{ animation: page-enter [^;]*backwards; \}/);
  assert.doesNotMatch(css, /\.page-enter > \* \{ animation:[^;]*\b(both|forwards)\b/);
});

test("bloqueio do plano Completo leva o contexto do módulo para /assinar sem refletir texto livre", async () => {
  const [proxy, assinar] = await Promise.all([
    source("../src/proxy.ts"),
    source("../src/app/assinar/assinar-client.tsx"),
  ]);
  assert.match(proxy, /searchParams\.set\("de", COMPLETE_ONLY_PATHS\.find/);
  assert.match(assinar, /Object\.hasOwn\(UPGRADE_SOURCES, upgradeSource\)/);
  assert.match(assinar, /faz parte do plano Completo/);
  assert.doesNotMatch(assinar, /"\/psiquiatria":/);
});

test("primeiros passos marcam a página visitada e terminam com a instalação", async () => {
  const { EMPTY_ONBOARDING, markVisited, onboardingProgress, parseOnboardingState, stepForPath } = await import("../src/lib/onboarding.ts");
  assert.equal(stepForPath("/plantao/roteiro-caso"), "roteiro");
  assert.equal(stepForPath("/acls/bradicardia"), "acls");
  assert.equal(stepForPath("/pacientes"), null);
  let state = markVisited({ ...EMPTY_ONBOARDING }, "/acls");
  assert.deepEqual(state.done, ["acls"]);
  assert.equal(markVisited(state, "/acls"), state);
  for (const path of ["/caso-rapido", "/flashcards", "/meu-resibook"]) state = markVisited(state, path);
  assert.equal(onboardingProgress(state).finished, false);
  assert.equal(onboardingProgress({ ...state, installed: true }).finished, true);
  assert.deepEqual(parseOnboardingState("{quebrado"), EMPTY_ONBOARDING);
});

test("tema escuro é opcional, poupa a área pública e mantém botões sólidos legíveis", async () => {
  const dark = await source("../src/app/dark-theme.css");
  const overrides = await source("../src/app/dark-overrides.css");
  const layout = await source("../src/app/layout.tsx");
  const surfaces = await source("../src/app/module-surfaces.css");
  assert.match(dark, /^\/\* GERADO por scripts\/generate-dark-theme\.mjs/);
  assert.match(dark, /html\[data-theme="dark"\] body:not\(\[data-resibook-surface="public"\]\) \{/);
  assert.match(dark, /\.app-sidebar-panel \{/);
  assert.match(dark, /\.bg-cyan-800, .*\{ background-color: oklch/);
  assert.match(overrides, /@media print/);
  assert.match(layout, /THEME_BOOT_SCRIPT/);
  assert.match(layout, /import "\.\/dark-theme\.css";/);
  assert.doesNotMatch(surfaces, /background-color: var\(--color-cyan-800\);/);
});
