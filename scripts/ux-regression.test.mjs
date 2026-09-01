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
});
