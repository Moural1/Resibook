import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  isSearchNoResultContext,
  sanitizeNoResultTerm,
} from "../src/lib/search-no-result.ts";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("Resibook Guard renderiza nas superfícies clínicas previstas", async () => {
  const [
    prescricao,
    prescricaoGuiada,
    condutas,
    plantao,
    casoRapido,
    alta,
    calculadoras,
  ] =
    await Promise.all([
      source("../src/app/prescricao/page.tsx"),
      source("../src/app/plantao/prescricao-guiada/page.tsx"),
      source("../src/app/condutas/page.tsx"),
      source("../src/app/plantao/page.tsx"),
      source("../src/app/caso-rapido/page.tsx"),
      source("../src/app/plantao/alta-segura/page.tsx"),
      source("../src/app/calculadoras/page.tsx"),
    ]);

  assert.match(prescricao, /<ResibookGuard context="prescricao"/);
  assert.match(prescricaoGuiada, /<ResibookGuard context="prescricao"/);
  assert.match(condutas, /<ResibookGuard context="conduta"/);
  assert.match(plantao, /<ResibookGuard context="plantao"/);
  assert.match(casoRapido, /<ResibookGuard context="plantao"/);
  assert.match(alta, /<ResibookGuard context="alta"/);
  assert.match(calculadoras, /<ResibookGuard context="calculadora"/);
});

test("checklist padrão contém os dez pontos e permanece não bloqueante", async () => {
  const guard = await source("../src/components/resibook-guard.tsx");

  for (const label of [
    "Alergias",
    "Gestação / lactação",
    "Função renal",
    "Função hepática",
    "Idade / peso",
    "QT longo",
    "Anticoagulação",
    "Interações medicamentosas",
    "Sinais de gravidade",
    "Protocolo local",
  ]) {
    assert.match(guard, new RegExp(label.replace("/", "\\/")));
  }

  assert.match(guard, /Segurança antes de alta, prescrição e decisões críticas/);
  assert.match(
    guard,
    /Ferramenta de apoio\. Conferir dados clínicos, contraindicações e/
  );
});

test("usuário cria item Nunca Mais Errar com o próprio user_id", async () => {
  const page = await source("../src/app/nunca-mais-errar/page.tsx");

  assert.match(page, /\.from\("never_miss_items"\)/);
  assert.match(page, /\.insert\(\{/);
  assert.match(page, /user_id: currentUserId/);
  assert.match(page, /\.eq\("user_id", currentUserId\)/);
});

test("RLS impede que o usuário A leia ou altere itens do usuário B", async () => {
  const migration = await source(
    "../supabase/migrations/20260723120000_guard_learning_search_insights.sql"
  );

  assert.match(
    migration,
    /create policy never_miss_own_select[\s\S]*user_id = \(select auth\.uid\(\)\)/
  );
  assert.match(
    migration,
    /create policy never_miss_own_insert[\s\S]*with check \(user_id = \(select auth\.uid\(\)\)\)/
  );
  assert.match(
    migration,
    /create policy never_miss_own_update[\s\S]*using \(user_id = \(select auth\.uid\(\)\)\)[\s\S]*with check \(user_id = \(select auth\.uid\(\)\)\)/
  );
  assert.match(migration, /alter table public\.never_miss_items force row level security/);
});

test("busca sem resultado é sanitizada e registrada pelo endpoint seguro", async () => {
  const [route, logger] = await Promise.all([
    source("../src/app/api/search/no-result/route.ts"),
    source("../src/components/no-result-search-logger.tsx"),
  ]);

  assert.equal(sanitizeNoResultTerm("  síndrome rara  "), "síndrome rara");
  assert.equal(sanitizeNoResultTerm("paciente João da Silva"), null);
  assert.equal(sanitizeNoResultTerm("joao@email.com"), null);
  assert.equal(sanitizeNoResultTerm("01/01/1980"), null);
  assert.equal(sanitizeNoResultTerm("11999999999"), null);
  assert.equal(isSearchNoResultContext("global"), true);
  assert.equal(isSearchNoResultContext("pacientes"), false);
  assert.match(route, /\.rpc\("record_search_no_result"/);
  assert.match(route, /if \(!user\?\.id\)/);
  assert.match(logger, /fetch\("\/api\/search\/no-result"/);
});

test("painel de buscas exige admin na página, API e RLS", async () => {
  const [page, route, migration] = await Promise.all([
    source("../src/app/admin/buscas-sem-resultado/page.tsx"),
    source("../src/app/api/admin/search-no-results/route.ts"),
    source(
      "../supabase/migrations/20260723120000_guard_learning_search_insights.sql"
    ),
  ]);

  assert.match(page, /isResibookAdmin\(user\)/);
  assert.match(page, /redirect\("\/dashboard"\)/);
  assert.match(route, /if \(!isResibookAdmin\(user\)\)/);
  assert.match(route, /status: 403/);
  assert.match(
    migration,
    /create policy search_no_result_admin_select[\s\S]*public\.is_resibook_admin\(\)/
  );
  assert.doesNotMatch(
    migration,
    /search_no_result[\s\S]*for select to authenticated[\s\S]*user_id = \(select auth\.uid\(\)\)/
  );
});

test("Alta segura expõe textos separados para paciente e evolução médica", async () => {
  const page = await source("../src/app/plantao/alta-segura/page.tsx");

  assert.match(page, /buildPatientDischargeText/);
  assert.match(page, /Copiar para paciente/);
  assert.match(page, /Copiar evolução médica/);
  assert.match(page, /Critérios de alta/);
  assert.match(page, /Sinais de alarme/);
  assert.match(page, /Orientação de retorno/);
});
