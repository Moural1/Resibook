import assert from "node:assert/strict";
import test from "node:test";

const { AREAS_DOSSIE, totaisDossie, encontrarBloco, vizinhosBloco, textosDoElemento, chavesDoBloco, separarConfirmar } = await import(
  "../src/lib/fluxos/enamed/index.ts"
);
const { AREAS_FLUXOS } = await import("../src/lib/fluxos/index.ts");

function textos(bloco) {
  return [bloco.titulo, bloco.resumo ?? "", ...bloco.elementos.flatMap(textosDoElemento), ...bloco.elementos.flatMap((e) => (e.tipo === "quadro" ? e.quadro.colunas : []))];
}

test("dossiê ENAMED: 7 áreas, 64 blocos, 105 tabelas, 71 algoritmos, 87 erros comuns", () => {
  assert.deepEqual(totaisDossie(), { areas: 7, blocos: 64, quadros: 105, algoritmos: 71, erros: 87 });
  const padroes = AREAS_DOSSIE.flatMap((a) => a.blocos).flatMap((b) => b.elementos).filter((e) => e.tipo === "padrao");
  assert.equal(padroes.length, 12);
});

test("dossiê ENAMED: ids únicos, nenhum bloco vazio e navegação entre blocos", () => {
  const areas = AREAS_DOSSIE.map((a) => a.id);
  assert.equal(new Set(areas).size, areas.length);
  for (const area of AREAS_DOSSIE) {
    const ids = area.blocos.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length, `ids repetidos em ${area.id}`);
    for (const bloco of area.blocos) {
      assert.match(bloco.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      assert.ok(bloco.elementos.length > 0, `${bloco.id} vazio`);
      assert.equal(encontrarBloco(area.id, bloco.id)?.bloco, bloco);
      assert.ok(chavesDoBloco(bloco).length > 0);
    }
    assert.equal(vizinhosBloco(area, area.blocos[0].id).anterior, null);
    assert.equal(vizinhosBloco(area, area.blocos.at(-1).id).proximo, null);
  }
  assert.equal(encontrarBloco("cirurgia", "nao-existe"), null);
});

test("dossiê ENAMED: algoritmos com ramos completos e tabelas retangulares", () => {
  function conferir(nos, contexto) {
    assert.ok(nos.length > 0, `passos vazios em ${contexto}`);
    for (const no of nos) {
      assert.ok(no.texto.trim(), `nó sem texto em ${contexto}`);
      if (no.tipo === "decisao") {
        assert.ok(no.ramos.length >= 2, `decisão com menos de 2 ramos em ${contexto}`);
        const rotulos = no.ramos.map((r) => r.rotulo);
        assert.equal(new Set(rotulos).size, rotulos.length, `ramos repetidos em ${contexto}`);
        for (const ramo of no.ramos) conferir(ramo.passos, `${contexto} › ${ramo.rotulo}`);
      }
    }
  }
  for (const area of AREAS_DOSSIE) {
    for (const bloco of area.blocos) {
      for (const elemento of bloco.elementos) {
        if (elemento.tipo === "algoritmo") conferir(elemento.algoritmo.passos, `${bloco.id} › ${elemento.algoritmo.titulo}`);
        if (elemento.tipo === "quadro") {
          const { quadro } = elemento;
          assert.ok(quadro.linhas.length > 0, `${quadro.titulo} sem linhas`);
          assert.ok(quadro.linhas[0][0], `${quadro.titulo} começa com linha de continuação`);
          for (const linha of quadro.linhas) assert.equal(linha.length, quadro.colunas.length, `${quadro.titulo}: linha com ${linha.length} células`);
        }
        if (elemento.tipo === "erros") for (const item of elemento.itens) assert.ok(item.titulo && item.texto, `${bloco.id}: erro comum incompleto`);
      }
    }
  }
});

test("dossiê ENAMED: sem estatísticas pessoais, marcas de cursinho ou cabeçalhos do PDF", () => {
  const proibido =
    /você|cursinho|medcof|cofbet|caderno|zona vermelha|relatório|relatado|\(P[12]\b|\bBET \d|\bN\d{2}\b|seus 15|sondar|ativa em|\d+ q · \d+ erros?|seus erros|sua situação/i;
  for (const area of AREAS_DOSSIE) {
    for (const bloco of area.blocos) {
      for (const texto of textos(bloco)) {
        assert.doesNotMatch(texto, proibido, `${area.id}/${bloco.id}: "${texto}"`);
        assert.ok(!texto.includes("DOSSIÊ"), `cabeçalho do PDF em ${bloco.id}`);
      }
    }
  }
});

test("dossiê ENAMED: o selo '⚠' só aparece no início do texto", () => {
  let marcados = 0;
  for (const area of AREAS_DOSSIE) {
    for (const bloco of area.blocos) {
      for (const texto of textos(bloco)) {
        const { confirmar, texto: limpo } = separarConfirmar(texto);
        if (confirmar) marcados += 1;
        assert.ok(!limpo.includes("⚠"), `⚠ no meio do texto: "${texto}"`);
      }
    }
  }
  assert.ok(marcados > 150, `apenas ${marcados} itens a confirmar`);
  assert.deepEqual(separarConfirmar("⚠ TCE"), { confirmar: true, texto: "TCE" });
  assert.deepEqual(separarConfirmar("TCE"), { confirmar: false, texto: "TCE" });
});

test("fluxogramas por tema não usam linhas de continuação (agrupamento é só do dossiê)", () => {
  for (const area of AREAS_FLUXOS) {
    for (const tema of area.temas) {
      for (const quadro of tema.quadros ?? []) {
        for (const linha of quadro.linhas) assert.ok(linha[0] && !linha[0].startsWith("↳"), `${tema.id}: ${quadro.titulo}`);
      }
    }
  }
});
