import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateClinicalScore,
  clinicalCalculators,
  getCalculatorInitialValues,
  validateCalculatorValues,
} from "../src/lib/clinical-calculators.ts";
import { getClinicalSearchTerms } from "../src/lib/clinical-quick-complaints.ts";

const curb65 = clinicalCalculators.find(({ id }) => id === "curb65");
const ascvdRisk = clinicalCalculators.find(({ id }) => id === "ascvd-risk");
const centor = clinicalCalculators.find(({ id }) => id === "centor-mcisaac");
const ckdEpi2021 = clinicalCalculators.find(({ id }) => id === "ckd-epi-2021");

assert.ok(curb65, "A calculadora CURB-65 precisa existir.");
assert.ok(ascvdRisk, "A calculadora de risco cardiovascular ASCVD precisa existir.");
assert.ok(centor, "A calculadora Centor/McIsaac precisa existir.");
assert.ok(ckdEpi2021, "A calculadora CKD-EPI 2021 precisa existir.");

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

test("CKD-EPI 2021 reproduz os casos de teste oficiais da NKF", () => {
  const cases = [
    { age: 18, sex: "male", creatinine: 0.9, expected: "127" },
    { age: 18, sex: "male", creatinine: 0.91, expected: "125" },
    { age: 18, sex: "female", creatinine: 0.7, expected: "128" },
    { age: 18, sex: "female", creatinine: 0.71, expected: "126" },
    { age: 90, sex: "male", creatinine: 0.5, expected: "97" },
    { age: 90, sex: "male", creatinine: 1.5, expected: "44" },
    { age: 90, sex: "female", creatinine: 0.5, expected: "89" },
    { age: 90, sex: "female", creatinine: 1.5, expected: "33" },
  ];

  for (const item of cases) {
    assert.equal(calculateClinicalScore("ckd-epi-2021", item).value, item.expected);
  }
});

test("CKD-EPI 2021 é restrita a adultos e não diagnostica DRC isoladamente", () => {
  assert.match(
    validateCalculatorValues(ckdEpi2021, { age: 17, sex: "male", creatinine: 1 }),
    /18/
  );
  const result = calculateClinicalScore("ckd-epi-2021", {
    age: 30,
    sex: "female",
    creatinine: 0.7,
  });
  assert.match(result.limitations, /não confirma doença renal crônica/i);
  assert.match(result.limitations, /lesão renal aguda/i);
});

test("busca por dor torácica não expande para outras síndromes dolorosas", () => {
  const terms = getClinicalSearchTerms("Dor torácica");
  assert.ok(terms.some((term) => /infarto/i.test(term)));
  assert.ok(!terms.some((term) => /lombalgia/i.test(term)));
  assert.ok(!terms.some((term) => /apendicite/i.test(term)));
});
