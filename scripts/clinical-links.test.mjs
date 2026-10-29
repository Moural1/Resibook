import assert from "node:assert/strict";
import test from "node:test";

const { relatedCardsForTopic, topicForCard, templatesForTopic } = await import("../src/lib/clinical-links.ts");

const torax = { id: 1, area: "Cirurgia", titulo: "Trauma de Tórax", tags: "cirurgia,trauma,torax,pneumotorax,hemotorax" };
const drge = { id: 2, area: "Clínica Médica", titulo: "Dispepsia e DRGE", tags: "gastro,drge,dispepsia,h pylori,eda" };
const cards = [
  { id: "a", area: "Cirurgia", frente: "Pneumotórax hipertensivo: clínica e conduta imediata?", verso: "Descompressão." },
  { id: "b", area: "Cirurgia", frente: "Hérnia inguinal encarcerada: conduta?", verso: "Cirurgia." },
  { id: "c", area: "Clínica", frente: "DRGE crônica com esofagite: conduta?", verso: "IBP." },
  { id: "d", area: "Cirurgia", frente: "Trauma de face: via aérea?", verso: "IOT." },
];

test("cards do tema: liga por título/tag específica, não só pela área", () => {
  assert.deepEqual(relatedCardsForTopic(torax, cards).map((card) => card.id), ["a"]);
  assert.deepEqual(relatedCardsForTopic(drge, cards).map((card) => card.id), ["c"]);
});

test("tema do card e prescrições do tema", () => {
  assert.equal(topicForCard(cards[2], [torax, drge])?.id, 2);
  assert.equal(topicForCard(cards[1], [torax, drge]), null);
  const templates = [
    { id: 10, titulo: "GASTRITE / DISPEPSIA / DRGE" },
    { id: 11, titulo: "ITU SIMPLES" },
  ];
  assert.deepEqual(templatesForTopic(drge, templates).map((item) => item.id), [10]);
  assert.deepEqual(templatesForTopic(torax, templates), []);
});
