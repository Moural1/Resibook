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

  assert.match(dashboard, /style=\{\{ color: "#071a35" \}\}/);
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
