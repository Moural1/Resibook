// Paciente fictício de demonstração (o mesmo do protótipo), usado nos testes
// e no botão "Adicionar paciente de exemplo". Nenhum dado real.

import { exameEstadoMentalSemAlteracoes } from "./catalogos.ts";
import { totalEscala } from "./escalas.ts";
import type { AplicacaoEscala, PacientePsiquiatria, TipoEscala } from "./tipos.ts";

export function pacienteExemplo(id = "exemplo", code = "PAC-001"): PacientePsiquiatria {
  let n = 0;
  const uid = () => `${id}-${++n}`;
  const escala = (tipo: TipoEscala, mes: number, itens: number[]): AplicacaoEscala => ({
    id: uid(),
    tipo,
    mes,
    itens,
    total: totalEscala(tipo, itens),
  });
  const eemOk = exameEstadoMentalSemAlteracoes();
  const eem4 = {
    ...eemOk,
    apresentacao: ["Exuberante"],
    humor: ["Eufórico", "Irritável"],
    afeto: ["Lábil"],
    curso: ["Acelerado"],
    conteudo: ["Ideias de grandeza"],
    psicomotricidade: ["Inquietação"],
    volicao: ["Hiperbulia"],
    juizo: ["Parciais"],
  };
  const eem6 = { ...eemOk, humor: ["Eutímico", "Ansioso"] };

  return {
    id,
    code,
    faixa: "35–44",
    sexo: "F",
    hip: "Episódio depressivo moderado; investigar espectro bipolar",
    atual: 6,
    consultas: [
      { id: uid(), mes: 0, resumo: "Humor deprimido há 4 meses, após separação. Anedonia, insônia inicial, ideação passiva sem plano.", combinado: "Iniciar sertralina 50 mg. Plano de segurança combinado com a mãe. Retorno em 1 mês.", adesao: "", efeitos: [] },
      { id: uid(), mes: 1, resumo: "Suspendeu sertralina após 2 semanas por náusea intensa.", combinado: "Trocar para escitalopram 10 mg. Retorno em 1 mês.", adesao: "boa", efeitos: ["Náusea"] },
      { id: uid(), mes: 2, resumo: "Melhora discreta do sono. Nega ideação.", combinado: "Manter escitalopram. Encaminhar para psicoterapia no CAPS.", adesao: "boa", efeitos: [] },
      { id: uid(), mes: 4, resumo: "Perdeu o emprego no mês 3. Relata 4 dias com pouca necessidade de sono, muita energia e gastos acima do habitual.", combinado: "Iniciar lítio 600 mg. Solicitar litemia e creatinina. Manter escitalopram por ora.", adesao: "boa", efeitos: [], eem: eem4, humor: "1" },
      { id: uid(), mes: 6, resumo: "Voltou a trabalhar. Humor mais estável, sem novos períodos de elevação. Às vezes esquece a dose da noite.", combinado: "Solicitar TSH. Reavaliar dose do lítio com a próxima litemia. Retorno em 1 mês.", adesao: "parcial", efeitos: ["Tremor"], eem: eem6, humor: "0" },
    ],
    meds: [
      { id: uid(), nome: "Sertralina", classe: "antidepressivo", dose: "50 mg/dia", inicio: 0, fim: 0, resposta: "intolerancia", motivo: "Náusea intensa" },
      { id: uid(), nome: "Escitalopram", classe: "antidepressivo", dose: "10 mg/dia", inicio: 1, fim: null, resposta: "parcial", motivo: "" },
      { id: uid(), nome: "Carbonato de lítio", classe: "litio", dose: "600 mg/dia", inicio: 4, fim: null, resposta: "aguardando", motivo: "" },
    ],
    escalas: [
      escala("PHQ-9", 0, [3, 3, 2, 2, 2, 3, 2, 1, 1]),
      escala("PHQ-9", 2, [2, 2, 2, 2, 2, 2, 2, 1, 0]),
      escala("PHQ-9", 4, [2, 2, 2, 2, 1, 2, 1, 1, 0]),
      escala("PHQ-9", 6, [1, 1, 1, 2, 1, 1, 1, 1, 0]),
      escala("GAD-7", 0, [2, 2, 2, 2, 2, 2, 2]),
      escala("GAD-7", 4, [2, 2, 1, 2, 1, 1, 1]),
      escala("GAD-7", 6, [1, 1, 1, 2, 1, 1, 1]),
      escala("YMRS", 4, [2, 2, 1, 2, 4, 4, 1, 2, 0, 0, 1]),
      escala("YMRS", 6, [0, 1, 0, 1, 2, 0, 0, 0, 0, 0, 0]),
      escala("MDQ", 4, [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 2]),
    ],
    cssrs: [
      { id: uid(), mes: 0, r: { q1: true, q2: true, q3: false, q4: false, q5: false, q6: false, q6r: false }, nivel: "baixo", obs: "Ideação passiva, sem método" },
      { id: uid(), mes: 6, r: { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q6r: false }, nivel: "nenhum", obs: "" },
    ],
    plano: {
      mes: 0,
      alerta: ["Ficar na cama o dia inteiro", "Pensar que sou um peso para a família"],
      internas: ["Caminhar no quarteirão", "Banho morno e música"],
      distracao: ["Casa da irmã", "Culto de domingo"],
      ajuda: ["Mãe", "Irmã"],
      profissionais: ["Ambulatório de psiquiatria", "CAPS de referência", "CVV 188 (24 horas, gratuito)"],
      meios: ["Objetos cortantes guardados pela mãe"],
      motivo: "Meu filho",
    },
    eventos: [
      { id: uid(), mes: 0, desc: "Separação conjugal" },
      { id: uid(), mes: 3, desc: "Perda do emprego" },
      { id: uid(), mes: 5, desc: "Retorno ao trabalho" },
    ],
    humor: [
      { id: uid(), ini: -18, fim: -15, v: -2 },
      { id: uid(), ini: 0, fim: 2, v: -2 },
      { id: uid(), ini: 3, fim: 3, v: -1 },
      { id: uid(), ini: 4, fim: 4, v: 1 },
      { id: uid(), ini: 5, fim: 6, v: 0 },
    ],
    geno: [
      { id: uid(), rel: "pai", morto: false, conds: ["tab", "spa"], rela: "conflituosa" },
      { id: uid(), rel: "mae", morto: false, conds: ["dep"], rela: "proxima" },
      { id: uid(), rel: "avo_pat_m", morto: true, conds: ["sui", "spa"], rela: "neutra" },
      { id: uid(), rel: "irmao", morto: false, conds: ["spa"], rela: "distante" },
      { id: uid(), rel: "irma", morto: false, conds: [], rela: "proxima" },
      { id: uid(), rel: "conjuge_m", morto: false, conds: [], rela: "rompida" },
      { id: uid(), rel: "filho", morto: false, conds: [], rela: "proxima" },
    ],
    eco: [
      { id: uid(), nome: "Mãe", v: "forte" },
      { id: uid(), nome: "Irmã", v: "forte" },
      { id: uid(), nome: "Filho", v: "forte" },
      { id: uid(), nome: "Ambulatório / CAPS", v: "moderado" },
      { id: uid(), nome: "Trabalho", v: "fraco" },
      { id: uid(), nome: "Igreja", v: "fraco" },
      { id: uid(), nome: "Ex-marido", v: "conflituoso" },
    ],
    exames: [
      { id: uid(), nome: "Litemia", mes: 4, valor: 0.4 },
      { id: uid(), nome: "Litemia", mes: 5, valor: 0.7 },
      { id: uid(), nome: "Creatinina", mes: 4, valor: 0.8 },
    ],
    form: { pre: [], prec: [], perp: [], prot: ["Psicoterapia em andamento no CAPS"], sintese: "", off: [] },
  };
}
