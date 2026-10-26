import {
  scoreNewsPulse,
  scoreNewsRespiratoryRate,
  scoreNewsSbp,
  scoreNewsSpo2,
  scoreNewsTemperature,
} from "../clinical-calculators.ts";

/* Leitura automática dos dados do caso: sinais vitais, escores de adulto
   (NEWS2, qSOFA, índice de choque) e prioridade sugerida por cor. Tudo é
   regra fixa e revisável; a prioridade é sugestão e não substitui o
   protocolo de classificação de risco do serviço. */

export type NivelPrioridade = "vermelho" | "laranja" | "amarelo" | "verde";
export type Consciencia = "" | "alerta" | "confusao" | "voz" | "dor" | "nao-responde";

export type SinaisVitais = {
  pa: string;
  fc: string;
  fr: string;
  temp: string;
  spo2: string;
  glicemia: string;
};

export type SinalAlarmeMarcado = { id: string; texto: string; nivel: NivelPrioridade; acao?: string };

export type AlertaTriagem = {
  id: string;
  titulo: string;
  detalhe: string;
  nivel: NivelPrioridade;
  origem: "sinais-vitais" | "escore" | "sinal-alarme";
};

export type EntradaTriagem = {
  idade: string;
  vitals: SinaisVitais;
  consciencia?: Consciencia;
  oxigenio?: boolean;
  sinaisAlarme?: SinalAlarmeMarcado[];
};

export type ResultadoNews2 = {
  pontos: number;
  parametros: number;
  completo: boolean;
  faixa: "baixo" | "baixo-medio" | "medio" | "alto";
};

export type LeituraTriagem = {
  idadeAnos: number | null;
  faixaEtaria: "adulto" | "pediatrico" | "desconhecida";
  pa: { sistolica: number; diastolica: number | null } | null;
  indiceChoque: number | null;
  qsofa: { pontos: number; criterios: string[]; avaliados: number } | null;
  news2: ResultadoNews2 | null;
  alertas: AlertaTriagem[];
  notas: string[];
  preenchidos: number;
  prioridade: NivelPrioridade | null;
};

export const ORDEM_PRIORIDADE: NivelPrioridade[] = ["vermelho", "laranja", "amarelo", "verde"];

export const PRIORIDADES: Record<NivelPrioridade, { rotulo: string; descricao: string; gravidadeLegada: string }> = {
  vermelho: {
    rotulo: "Emergência",
    descricao: "Atendimento imediato: sala vermelha, monitorização contínua e equipe acionada.",
    gravidadeLegada: "Emergência",
  },
  laranja: {
    rotulo: "Muito urgente",
    descricao: "Avaliação médica prioritária, monitorização e reavaliação frequente.",
    gravidadeLegada: "Urgência",
  },
  amarelo: {
    rotulo: "Urgente",
    descricao: "Avaliar em breve e repetir os sinais vitais após as primeiras medidas.",
    gravidadeLegada: "Observação",
  },
  verde: {
    rotulo: "Pouco urgente",
    descricao: "Sem alerta pelos dados preenchidos: seguir a avaliação clínica e reavaliar antes do destino.",
    gravidadeLegada: "Baixa complexidade",
  },
};

export const CONSCIENCIA_OPCOES: { valor: Consciencia; rotulo: string }[] = [
  { valor: "", rotulo: "Não avaliado" },
  { valor: "alerta", rotulo: "Alerta" },
  { valor: "confusao", rotulo: "Confusão nova" },
  { valor: "voz", rotulo: "Responde à voz" },
  { valor: "dor", rotulo: "Responde à dor" },
  { valor: "nao-responde", rotulo: "Não responde" },
];

const IDADE_ADULTA = 16; // NEWS2 e qSOFA foram validados a partir de 16 anos.

export function maiorPrioridade(niveis: (NivelPrioridade | null | undefined)[]): NivelPrioridade | null {
  for (const nivel of ORDEM_PRIORIDADE) if (niveis.includes(nivel)) return nivel;
  return null;
}

/* "38,5", "110 bpm", "SpO2 94%" → número; vazio ou inválido → null. */
export function lerNumero(valor: string): number | null {
  const achado = valor.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!achado) return null;
  const numero = Number(achado[0]);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

/* "62", "62 anos", "8 meses", "15 dias", "1 ano e 6 meses" → anos. */
export function lerIdade(valor: string): number | null {
  const texto = valor.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!texto.trim()) return null;
  const anos = texto.match(/(\d+(?:[.,]\d+)?)\s*(?:anos?|a\b)/);
  const meses = texto.match(/(\d+)\s*(?:meses|mes|m\b)/);
  const dias = texto.match(/(\d+)\s*(?:dias?|d\b)/);
  if (anos || meses || dias) {
    const total =
      (anos ? Number(anos[1].replace(",", ".")) : 0) + (meses ? Number(meses[1]) / 12 : 0) + (dias ? Number(dias[1]) / 365 : 0);
    return Number.isFinite(total) ? total : null;
  }
  const numero = lerNumero(texto);
  return numero !== null && numero < 130 ? numero : null;
}

/* "140x90", "140/90", "14x9" (cmHg) ou só a sistólica. */
export function lerPressao(valor: string) {
  const texto = valor.trim().toLowerCase();
  if (!texto) return null;
  const par = texto.match(/(\d{1,3}(?:[.,]\d)?)\s*(?:x|\/|por|×)\s*(\d{1,3}(?:[.,]\d)?)/);
  if (par) {
    let sistolica = Number(par[1].replace(",", "."));
    let diastolica = Number(par[2].replace(",", "."));
    if (sistolica < 30 && diastolica < 20) {
      sistolica *= 10;
      diastolica *= 10;
    }
    return sistolica > 0 ? { sistolica, diastolica: diastolica > 0 ? diastolica : null } : null;
  }
  const sistolica = lerNumero(texto);
  if (sistolica === null) return null;
  return { sistolica: sistolica < 30 ? sistolica * 10 : sistolica, diastolica: null };
}

/* Número no formato brasileiro (vírgula decimal). */
function br(valor: number) {
  return String(valor).replace(".", ",");
}

function alerta(id: string, titulo: string, detalhe: string, nivel: NivelPrioridade, origem: AlertaTriagem["origem"] = "sinais-vitais"): AlertaTriagem {
  return { id, titulo, detalhe, nivel, origem };
}

/* Frequência respiratória de corte da OMS para taquipneia na infância. */
function taquipneiaOms(idade: number) {
  if (idade < 2 / 12) return 60;
  if (idade < 1) return 50;
  if (idade < 5) return 40;
  return null;
}

function faixaNews2(pontos: number, temTres: boolean): ResultadoNews2["faixa"] {
  if (pontos >= 7) return "alto";
  if (pontos >= 5) return "medio";
  if (temTres) return "baixo-medio";
  return "baixo";
}

export function lerTriagem(entrada: EntradaTriagem): LeituraTriagem {
  const idadeAnos = lerIdade(entrada.idade);
  const faixaEtaria = idadeAnos === null ? "desconhecida" : idadeAnos >= IDADE_ADULTA ? "adulto" : "pediatrico";
  const comoAdulto = faixaEtaria !== "pediatrico";
  const pa = lerPressao(entrada.vitals.pa);
  const fc = lerNumero(entrada.vitals.fc);
  const fr = lerNumero(entrada.vitals.fr);
  const temp = lerNumero(entrada.vitals.temp);
  const spo2 = lerNumero(entrada.vitals.spo2);
  const glicemia = lerNumero(entrada.vitals.glicemia);
  const consciencia = entrada.consciencia ?? "";
  const alertas: AlertaTriagem[] = [];
  const notas: string[] = [];

  const preenchidos = [pa, fc, fr, temp, spo2, glicemia].filter((valor) => valor !== null).length + (consciencia ? 1 : 0);

  // Consciência (ACVPU)
  if (consciencia === "voz" || consciencia === "dor" || consciencia === "nao-responde") {
    alertas.push(alerta("consciencia", "Rebaixamento do nível de consciência", "Proteger via aérea, checar glicemia e acionar a equipe.", "vermelho"));
  } else if (consciencia === "confusao") {
    alertas.push(alerta("consciencia", "Confusão aguda", "Pensar em hipóxia, hipoglicemia, sepse, intoxicação e AVC.", "laranja"));
  }

  // Oxigenação
  if (spo2 !== null) {
    if (spo2 < 85) alertas.push(alerta("spo2", "Hipoxemia grave", `SpO₂ ${br(spo2)}%: oxigênio e suporte ventilatório imediatos.`, "vermelho"));
    else if (spo2 < 90) alertas.push(alerta("spo2", "Hipoxemia", `SpO₂ ${br(spo2)}%: ofertar O₂ e investigar a causa.`, "laranja"));
    else if (spo2 < 94)
      alertas.push(alerta("spo2", "SpO₂ limítrofe", `SpO₂ ${br(spo2)}%. Em DPOC com retenção de CO₂, o alvo é 88–92%.`, "amarelo"));
  }

  // Glicemia
  if (glicemia !== null) {
    if (glicemia < 54) alertas.push(alerta("glicemia", "Hipoglicemia grave", `Glicemia ${glicemia} mg/dL: corrigir agora.`, "vermelho"));
    else if (glicemia < 70) alertas.push(alerta("glicemia", "Hipoglicemia", `Glicemia ${glicemia} mg/dL: corrigir e repetir em 15 min.`, "laranja"));
    else if (glicemia >= 600)
      alertas.push(alerta("glicemia", "Hiperglicemia extrema", `Glicemia ${glicemia} mg/dL: pensar em estado hiperosmolar.`, "laranja"));
    else if (glicemia >= 250)
      alertas.push(alerta("glicemia", "Hiperglicemia", `Glicemia ${glicemia} mg/dL: pesquisar cetoacidose se houver sintomas.`, "amarelo"));
  }

  // Temperatura
  if (temp !== null) {
    if (temp <= 35) alertas.push(alerta("temp", "Hipotermia", `Temperatura ${br(temp)} °C.`, "laranja"));
    else if (idadeAnos !== null && idadeAnos < 0.25 && temp >= 38)
      alertas.push(alerta("temp", "Febre em lactente < 3 meses", "Avaliação prioritária para infecção bacteriana grave.", "laranja"));
    else if (temp >= 39.1) alertas.push(alerta("temp", "Febre alta", `Temperatura ${br(temp)} °C.`, "amarelo"));
  }

  let indiceChoque: number | null = null;
  let qsofa: LeituraTriagem["qsofa"] = null;
  let news2: ResultadoNews2 | null = null;

  if (comoAdulto) {
    if (faixaEtaria === "desconhecida" && preenchidos > 0) notas.push("Idade não informada: os escores foram calculados como adulto.");

    if (pa) {
      if (pa.sistolica < 80) alertas.push(alerta("pa", "Hipotensão grave", `PAS ${pa.sistolica} mmHg: tratar como choque até prova em contrário.`, "vermelho"));
      else if (pa.sistolica < 90) alertas.push(alerta("pa", "Hipotensão", `PAS ${pa.sistolica} mmHg.`, "laranja"));
      else if (pa.sistolica >= 180 || (pa.diastolica ?? 0) >= 120)
        alertas.push(
          alerta("pa", "PA muito elevada", "Repetir a medida e procurar lesão de órgão-alvo: é ela que separa emergência de urgência.", "amarelo")
        );
    }

    if (fc !== null) {
      if (fc >= 150 || fc < 40) alertas.push(alerta("fc", fc < 40 ? "Bradicardia extrema" : "Taquicardia extrema", `FC ${fc} bpm: ECG e monitorização.`, "vermelho"));
      else if (fc >= 131) alertas.push(alerta("fc", "Taquicardia importante", `FC ${fc} bpm.`, "laranja"));
      else if (fc >= 111) alertas.push(alerta("fc", "Taquicardia", `FC ${fc} bpm.`, "amarelo"));
      else if (fc < 50) alertas.push(alerta("fc", "Bradicardia", `FC ${fc} bpm: ECG; se houver sintomas, prioridade maior.`, "amarelo"));
    }

    if (fr !== null) {
      if (fr >= 35 || fr <= 8) alertas.push(alerta("fr", "FR crítica", `FR ${fr} irpm: risco de falência respiratória.`, "vermelho"));
      else if (fr >= 25) alertas.push(alerta("fr", "Taquipneia importante", `FR ${fr} irpm.`, "laranja"));
      else if (fr >= 21) alertas.push(alerta("fr", "Taquipneia", `FR ${fr} irpm.`, "amarelo"));
    }

    if (pa && fc !== null) {
      indiceChoque = Math.round((fc / pa.sistolica) * 100) / 100;
      if (indiceChoque >= 1)
        alertas.push(alerta("indice-choque", "Índice de choque ≥ 1", `FC/PAS = ${indiceChoque.toFixed(2).replace(".", ",")}: hipoperfusão provável.`, "laranja", "escore"));
      else if (indiceChoque >= 0.9)
        alertas.push(alerta("indice-choque", "Índice de choque limítrofe", `FC/PAS = ${indiceChoque.toFixed(2).replace(".", ",")}.`, "amarelo", "escore"));
    }

    const mentalAlterado = consciencia !== "" && consciencia !== "alerta";
    const avaliados = [fr !== null, pa !== null, consciencia !== ""].filter(Boolean).length;
    if (avaliados >= 2) {
      const criterios = [
        fr !== null && fr >= 22 ? "FR ≥ 22" : "",
        pa !== null && pa.sistolica <= 100 ? "PAS ≤ 100" : "",
        mentalAlterado ? "alteração mental" : "",
      ].filter(Boolean);
      qsofa = { pontos: criterios.length, criterios, avaliados };
      if (criterios.length >= 2)
        alertas.push(
          alerta("qsofa", "qSOFA ≥ 2", "Se houver suspeita de infecção, alto risco de desfecho ruim: lactato, culturas e antibiótico sem atraso.", "laranja", "escore")
        );
    }

    const partes: number[] = [];
    if (fr !== null) partes.push(scoreNewsRespiratoryRate(fr));
    if (spo2 !== null) partes.push(scoreNewsSpo2(spo2, "scale1", Boolean(entrada.oxigenio)));
    if (pa) partes.push(scoreNewsSbp(pa.sistolica));
    if (fc !== null) partes.push(scoreNewsPulse(fc));
    if (temp !== null) partes.push(scoreNewsTemperature(temp));
    if (consciencia) partes.push(consciencia === "alerta" ? 0 : 3);
    if (partes.length >= 3) {
      const pontos = partes.reduce((soma, valor) => soma + valor, 0) + (entrada.oxigenio ? 2 : 0);
      const parametros = partes.length + 1;
      news2 = { pontos, parametros, completo: parametros === 7, faixa: faixaNews2(pontos, partes.includes(3)) };
      const parcial = news2.completo ? "" : ` (parcial: ${parametros} de 7 parâmetros)`;
      if (news2.faixa === "alto") alertas.push(alerta("news2", `NEWS2 ${pontos}${parcial}`, "Alto risco de deterioração: avaliação emergencial.", "vermelho", "escore"));
      else if (news2.faixa === "medio") alertas.push(alerta("news2", `NEWS2 ${pontos}${parcial}`, "Risco intermediário: avaliação clínica urgente.", "laranja", "escore"));
    }
  } else {
    notas.push("Paciente pediátrico: FC e PA variam com a idade e os escores de adulto (NEWS2, qSOFA, índice de choque) não se aplicam.");
    const corte = idadeAnos !== null ? taquipneiaOms(idadeAnos) : null;
    if (fr !== null && corte !== null && fr >= corte)
      alertas.push(alerta("fr", "Taquipneia para a idade", `FR ${fr} irpm (corte da OMS: ≥ ${corte}).`, "amarelo"));
  }

  for (const sinal of entrada.sinaisAlarme ?? []) {
    alertas.push(alerta(`alarme-${sinal.id}`, sinal.texto, sinal.acao ?? "Sinal de alarme presente.", sinal.nivel, "sinal-alarme"));
  }

  alertas.sort((a, b) => ORDEM_PRIORIDADE.indexOf(a.nivel) - ORDEM_PRIORIDADE.indexOf(b.nivel));
  const temDados = preenchidos > 0 || (entrada.sinaisAlarme?.length ?? 0) > 0;
  const prioridade = maiorPrioridade(alertas.map((item) => item.nivel)) ?? (temDados ? "verde" : null);

  return { idadeAnos, faixaEtaria, pa, indiceChoque, qsofa, news2, alertas, notas, preenchidos, prioridade };
}
