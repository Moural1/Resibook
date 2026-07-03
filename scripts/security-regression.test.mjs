import assert from "node:assert/strict";
import test from "node:test";

import { isDisabledCommercialRoute } from "../src/lib/product-config.ts";

test("edição biblioteca bloqueia prontuário na página e na API", () => {
  assert.equal(isDisabledCommercialRoute("/pacientes"), true);
  assert.equal(isDisabledCommercialRoute("/pacientes/123"), true);
  assert.equal(isDisabledCommercialRoute("/api/patients"), true);
  assert.equal(isDisabledCommercialRoute("/api/patients/123"), true);
});

test("edição biblioteca bloqueia IA clínica e consultas também nas APIs", () => {
  assert.equal(isDisabledCommercialRoute("/consulta-audio"), true);
  assert.equal(isDisabledCommercialRoute("/api/ai/case-review"), true);
  assert.equal(isDisabledCommercialRoute("/api/consultas"), true);
  assert.equal(isDisabledCommercialRoute("/api/consultas/123"), true);
});

test("rotas da biblioteca permanecem disponíveis", () => {
  assert.equal(isDisabledCommercialRoute("/calculadoras"), false);
  assert.equal(isDisabledCommercialRoute("/meu-resibook"), false);
  assert.equal(isDisabledCommercialRoute("/api/global-search"), false);
});
