import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateClinicalScore,
  clinicalCalculators,
  getCalculatorInitialValues,
  validateCalculatorValues,
} from "../src/lib/clinical-calculators.ts";

const curb65 = clinicalCalculators.find(({ id }) => id === "curb65");

assert.ok(curb65, "A calculadora CURB-65 precisa existir.");

function validCurb(overrides = {}) {
  return {
    age: 40,
    ureaUnit: "urea_mgdl",
    urea: 30,
    rr: 20,
    sbp: 120,
    dbp: 80,
    confusion: false,
    ...overrides,
  };
}

test("CURB-65 usa ureia total em mg/dL como padrão brasileiro", () => {
  const initial = getCalculatorInitialValues(curb65);
  assert.equal(initial.ureaUnit, "urea_mgdl");
  assert.match(
    curb65.fields.find(({ id }) => id === "ureaUnit").options[0].label,
    /padrão no Brasil/i
  );
});

test("CURB-65 pontua ureia total somente acima de 42 mg/dL", () => {
  assert.equal(calculateClinicalScore("curb65", validCurb({ urea: 42 })).value, "0");
  assert.equal(calculateClinicalScore("curb65", validCurb({ urea: 43 })).value, "1");
});

test("CURB-65 mantém conversões laboratoriais explícitas", () => {
  assert.equal(
    calculateClinicalScore("curb65", validCurb({ ureaUnit: "bun_mgdl", urea: 19.6 })).value,
    "0"
  );
  assert.equal(
    calculateClinicalScore("curb65", validCurb({ ureaUnit: "bun_mgdl", urea: 20 })).value,
    "1"
  );
  assert.equal(
    calculateClinicalScore("curb65", validCurb({ ureaUnit: "urea_mmoll", urea: 7 })).value,
    "0"
  );
  assert.equal(
    calculateClinicalScore("curb65", validCurb({ ureaUnit: "urea_mmoll", urea: 7.1 })).value,
    "1"
  );
});

test("calculadoras não presumem resposta negativa", () => {
  assert.match(validateCalculatorValues(curb65, validCurb({ confusion: "" })), /Sim.*Não/i);
});

test("calculadoras rejeitam valores fora dos limites clínicos da interface", () => {
  assert.match(validateCalculatorValues(curb65, validCurb({ age: 121 })), /120/);
  assert.match(
    validateCalculatorValues(curb65, validCurb({ ureaUnit: "urea_mmoll", urea: 81 })),
    /fora da faixa/i
  );
});
