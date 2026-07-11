import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateClinicalScore,
  clinicalCalculators,
  getCalculatorInitialValues,
  validateCalculatorValues,
} from "../src/lib/clinical-calculators.ts";

const curb65 = clinicalCalculators.find(({ id }) => id === "curb65");
const ascvdRisk = clinicalCalculators.find(({ id }) => id === "ascvd-risk");
const centor = clinicalCalculators.find(({ id }) => id === "centor-mcisaac");

assert.ok(curb65, "A calculadora CURB-65 precisa existir.");
assert.ok(ascvdRisk, "A calculadora de risco cardiovascular ASCVD precisa existir.");
assert.ok(centor, "A calculadora Centor/McIsaac precisa existir.");

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

test("risco cardiovascular ASCVD calcula percentual de 10 anos", () => {
  const result = calculateClinicalScore("ascvd-risk", {
    age: 55,
    sex: "male",
    race: "other",
    totalCholesterol: 213,
    hdl: 50,
    sbp: 120,
    treatedSbp: false,
    diabetes: false,
    smoker: false,
    knownAscvdOrLdl190: false,
  });
  assert.equal(result.label, "% em 10 anos");
  assert.equal(result.value, "5.4");
  assert.match(result.classification, /lim/i);
});

test("risco cardiovascular ASCVD respeita faixa validada e prevenção secundária", () => {
  const values = {
    age: 39,
    sex: "female",
    race: "other",
    totalCholesterol: 180,
    hdl: 50,
    sbp: 120,
    treatedSbp: false,
    diabetes: false,
    smoker: false,
    knownAscvdOrLdl190: false,
  };
  assert.match(validateCalculatorValues(ascvdRisk, values), /40/);
  assert.equal(
    calculateClinicalScore("ascvd-risk", { ...values, age: 60, knownAscvdOrLdl190: true }).value,
    "—"
  );
});

test("Centor/McIsaac orienta antibiótico somente após confirmação", () => {
  const lowRisk = calculateClinicalScore("centor-mcisaac", {
    age: 30,
    exudate: false,
    nodes: false,
    fever: false,
    noCough: false,
  });
  assert.equal(lowRisk.value, "0");
  assert.match(lowRisk.recommendation, /antibiótico não indicado/i);

  const intermediateRisk = calculateClinicalScore("centor-mcisaac", {
    age: 30,
    exudate: true,
    nodes: true,
    fever: false,
    noCough: false,
  });
  assert.equal(intermediateRisk.value, "2");
  assert.match(intermediateRisk.recommendation, /somente se houver confirmação/i);

  const highRisk = calculateClinicalScore("centor-mcisaac", {
    age: 10,
    exudate: true,
    nodes: true,
    fever: true,
    noCough: true,
  });
  assert.equal(highRisk.value, "5");
  assert.match(highRisk.recommendation, /teste rápido ou a cultura forem positivos/i);
  assert.match(highRisk.limitations, /nem indica antibiótico empírico/i);
});

test("Centor/McIsaac aplica corretamente o ajuste de idade", () => {
  const base = { exudate: false, nodes: false, fever: false, noCough: false };
  assert.equal(calculateClinicalScore("centor-mcisaac", { ...base, age: 14 }).value, "1");
  assert.equal(calculateClinicalScore("centor-mcisaac", { ...base, age: 15 }).value, "0");
  assert.equal(calculateClinicalScore("centor-mcisaac", { ...base, age: 45 }).value, "-1");
});
