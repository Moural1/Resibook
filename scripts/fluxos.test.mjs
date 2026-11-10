import assert from "node:assert/strict";
import test from "node:test";

const { AREAS_FLUXOS, totaisFluxos, encontrarTema, vizinhos, textoDoTema } = await import("../src/lib/fluxos/index.ts");

test("fluxogramas: 5 áreas, 67 temas e 153 regras (relâmpago + raio-X)", () => {
  const totais = totaisFluxos();
  assert.equal(totais.areas, 5);
  assert.equal(totais.temas, 67);
  assert.equal(totais.regras, 153);
  assert.equal(totais.algoritmos, 49);
});

test("fluxogramas: ids únicos e todo tema tem conteúdo", () => {
  for (const area of AREAS_FLUXOS) {
    const ids = area.temas.map((tema) => tema.id);
    assert.equal(new Set(ids).size, ids.length, `ids repetidos em ${area.id}`);
    for (const tema of area.temas) {
      const partes = (tema.algoritmos?.length ?? 0) + (tema.quadros?.length ?? 0) + (tema.linhasDoTempo?.length ?? 0) + (tema.graficos?.length ?? 0);
      assert.ok(partes > 0, `${tema.id} sem algoritmo, quadro ou linha do tempo`);
      assert.ok((tema.oQueCai?.length ?? 0) > 0, `${tema.id} sem 'o que cai'`);
    }
  }
});

test("fluxogramas: decisões sempre têm ao menos dois ramos e quadros são retangulares", () => {
  function conferir(nos, contexto) {
    for (const no of nos) {
      if (no.tipo === "decisao") {
        assert.ok(no.ramos.length >= 2, `decisão com 1 ramo em ${contexto}`);
        for (const ramo of no.ramos) {
          assert.ok(ramo.passos.length > 0, `ramo vazio em ${contexto}`);
          conferir(ramo.passos, contexto);
        }
      } else {
        assert.ok(no.texto.trim().length > 2, `nó vazio em ${contexto}`);
      }
    }
  }
  for (const area of AREAS_FLUXOS) {
    for (const tema of area.temas) {
      for (const algoritmo of tema.algoritmos ?? []) conferir(algoritmo.passos, `${tema.id}: ${algoritmo.titulo}`);
      for (const quadro of tema.quadros ?? []) {
        for (const linha of quadro.linhas) assert.equal(linha.length, quadro.colunas.length, `${tema.id}: ${quadro.titulo}`);
      }
    }
  }
});

test("fluxogramas: navegação e busca por tema", () => {
  const achado = encontrarTema("cirurgia", "trauma");
  assert.equal(achado.tema.titulo, "Trauma");
  const { anterior, proximo } = vizinhos(achado.area, "trauma");
  assert.equal(anterior, null);
  assert.equal(proximo.id, "perioperatorio");
  assert.match(textoDoTema(achado.tema), /Zona de Ziedler/);
  assert.equal(encontrarTema("cirurgia", "nao-existe"), null);
});

test("fluxogramas: regras relâmpago têm chave única por área", () => {
  for (const area of AREAS_FLUXOS) {
    for (const lista of [area.raioX?.regras ?? [], area.regrasRelampago ?? []]) {
      const chaves = lista.map((regra) => `${regra.tema}-${regra.titulo ?? ""}`);
      assert.equal(new Set(chaves).size, chaves.length, `regra repetida em ${area.id}`);
    }
  }
});

test("fluxogramas: resumo da sidebar bate com os dados", async () => {
  const { RESUMO_FLUXOS } = await import("../src/lib/fluxos/resumo.ts");
  const totais = totaisFluxos();
  assert.equal(RESUMO_FLUXOS.temas, totais.temas);
  assert.equal(RESUMO_FLUXOS.regras, totais.regras);
});

test("fluxogramas: dengue segue o manual do Ministério da Saúde (6ª ed., 2024)", () => {
  const achado = encontrarTema("clinica", "dengue");
  assert.ok(achado, "tema dengue ausente");
  const { tema } = achado;
  assert.match(tema.fonte.url, /saude\.gov\.br/);
  assert.match(tema.fonte.titulo, /6ª edição/);
  const texto = textoDoTema(tema);
  for (const trecho of [
    "Notificar todo caso suspeito de dengue",
    "10 mL/kg de soro fisiológico 0,9% na 1ª hora",
    "20 mL/kg em até 20 minutos",
    "1ª fase 25 mL/kg em 6 horas",
    "2ª fase 25 mL/kg em 8 horas",
    "60 mL/kg/dia",
    "130 mL/kg/dia",
    "retornar no 5º dia da doença",
    "até 48 h após a queda da febre",
    "Não utilizar salicilatos",
    "albumina 0,5 a 1 g/kg",
  ]) {
    assert.ok(texto.includes(trecho), `dengue sem "${trecho}"`);
  }
  // Quadro 1 do MS: oito sinais de alarme.
  const fluxoC = tema.algoritmos.find((algoritmo) => algoritmo.titulo.startsWith("Grupo C"));
  assert.equal(fluxoC.passos[0].texto.split(";").length, 8);
  // Os quatro grupos da classificação de risco com as cores oficiais.
  const risco = tema.quadros.find((quadro) => quadro.titulo.startsWith("Classificação de risco"));
  assert.deepEqual(risco.linhas.map((linha) => linha[1].split(":")[0]), ["Azul", "Verde", "Amarelo", "Vermelho"]);
});

test("fluxogramas: protocolos citam a fonte e mantêm as doses-chave", () => {
  const esperado = {
    "clinica/sifilis": ["2,4 milhões UI IM dose única", "7,2 milhões UI", "18 a 24 milhões UI/dia", "intervalo entre doses > 7 dias"],
    "clinica/corrimento-uretral": ["Ceftriaxona 500 mg IM dose única + azitromicina 500 mg, 2 comprimidos VO dose única"],
    "clinica/ulceras-genitais-dip": ["doxiciclina 100 mg 12/12 h por 14 dias", "Aciclovir 200 mg, 2 comprimidos 3x/dia por 7 a 10 dias"],
    "clinica/hiv": ["dolutegravir 50 mg 12/12 h", "28 dias", "72 horas"],
    "clinica/tuberculose": ["2RHZE", "270 doses", "120 doses"],
    "clinica/sepse": ["30 mL/kg", "PAM ≥ 65 mmHg"],
    "clinica/avc": ["0,9 mg/kg", "185/110"],
    "clinica/iam": ["≤ 90 min", "≤ 30 min"],
    "clinica/diarreia": ["50 a 100 mL/kg em 4 a 6 horas", "Ringer lactato 70 mL/kg"],
    "go/pre-natal": ["dTpa", "TOTG 75 g"],
    "clinica/insonia": ["TCC-I", "mínimo de 5 h", "até 4 semanas", "25% da dose a cada 2 semanas"],
    "clinica/dor-cronica-articular": ["Artrocentese", "≥ 6 de 10 pontos", "urato < 6 mg/dL", "Glucosamina"],
  };
  for (const [chave, trechos] of Object.entries(esperado)) {
    const [area, id] = chave.split("/");
    const achado = encontrarTema(area, id);
    assert.ok(achado, `tema ${chave} ausente`);
    assert.ok(achado.tema.fonte?.url?.startsWith("https://"), `${chave} sem fonte`);
    const texto = textoDoTema(achado.tema);
    for (const trecho of trechos) assert.ok(texto.includes(trecho), `${chave} sem "${trecho}"`);
  }
});
