import assert from "node:assert/strict";
import test from "node:test";

const { matchRegions, matchExamRegions, abnormalExamSegments } = await import("../src/lib/body-map-regions.ts");

const examNormal =
  "BEG, BOTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO, AFEBRIL. ACV: BNRNF EM 2T SEM SOPROS; PULSOS CHEIOS E SIMÉTRICOS; TEC < 2S. AR: MVUD SEM RA. ABD: FLÁCIDO, INDOLOR, RHA+. MMII: SEM EDEMA, PANTURRILHAS LIVRES. NEUROLÓGICO: SEM DÉFICITS FOCAIS, PUPILAS ISOCÓRICAS.";

test("mapa corporal: exame físico normal não marca região", () => {
  assert.deepEqual(matchExamRegions(examNormal), []);
  assert.deepEqual(abnormalExamSegments(examNormal), []);
  assert.deepEqual(matchExamRegions("Abdome flácido, indolor à palpação, RHA presentes. Pares cranianos sem alterações."), []);
});

test("mapa corporal: alteração no exame marca a região certa", () => {
  assert.deepEqual(matchExamRegions(`${examNormal} MMII: EDEMA 2+/4+ EM PERNA ESQUERDA`), ["leftLeg", "rightLeg"]);
  assert.deepEqual(matchExamRegions("ABD: doloroso à palpação em epigastro, sem defesa"), ["abdomen"]);
});

test("mapa corporal: queixa respeitada e negações ignoradas", () => {
  assert.deepEqual(matchRegions("Dor torácica há 2 semanas associado a ansiedade. Nega outras queixas"), ["chest"]);
  assert.deepEqual(matchRegions("Cefaleia. Nega dor abdominal, nega disúria"), ["head"]);
  assert.deepEqual(matchRegions("TAG"), []);
});
