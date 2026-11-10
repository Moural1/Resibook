import { atencao, cenario, conduta, decisao, ramo, type Tema } from "./tipos.ts";

/* Pré-natal de risco habitual conforme o Ministério da Saúde. */
export const PRE_NATAL: Tema = {
  id: "pre-natal",
  titulo: "Pré-natal de risco habitual (MS)",
  fonte: {
    titulo: "Ministério da Saúde. Cadernos de Atenção Básica nº 32: Atenção ao pré-natal de baixo risco; Manual de Gestação de Alto Risco (2022); calendário vacinal do PNI.",
    url: "https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf",
    nota: "Vacinas e suplementos seguem o calendário e as notas técnicas vigentes do MS.",
  },
  revisar: [
    "Captação precoce (até 12 semanas) e testes rápidos de sífilis, HIV e hepatites já na 1ª consulta.",
    "Sífilis: testar na 1ª consulta, no início do 3º trimestre e na internação para o parto; tratar com um teste reagente.",
    "Estratificar o risco em toda consulta: o pré-natal de risco habitual pode virar alto risco a qualquer momento.",
  ],
  algoritmos: [
    {
      titulo: "Roteiro do pré-natal",
      passos: [
        cenario("Gestação confirmada (β-hCG ou teste rápido)"),
        conduta("1ª consulta: anamnese, DUM e DPP (Naegele: +7 dias e −3 meses), exame físico e obstétrico, PA, peso e IMC, estratificação de risco"),
        conduta("Exames da 1ª consulta (quadro) e USG obstétrica (ideal entre 11 e 14 semanas)"),
        conduta("Sulfato ferroso 40 mg de ferro elementar/dia + ácido fólico 0,4 mg/dia; vacinas conforme o calendário"),
        decisao(
          "Fator de alto risco? (hipertensão, diabetes, doença clínica grave, gestação múltipla, história obstétrica desfavorável, entre outros)",
          ramo("Sim", conduta("Referenciar ao pré-natal de alto risco, mantendo o vínculo com a atenção primária")),
          ramo("Não", conduta("Consultas mensais até 28 semanas, quinzenais de 28 a 36 e semanais de 36 até o parto"))
        ),
        conduta("24 a 28 semanas: TOTG 75 g (se glicemia de jejum inicial < 92 mg/dL)"),
        conduta("3º trimestre: repetir hemograma, sífilis, HIV, hepatites e urocultura; toxoplasmose trimestral se suscetível"),
        atencao("Sinais de alerta: sangramento, perda de líquido, cefaleia ou escotomas, epigastralgia, edema súbito, febre, diminuição dos movimentos fetais, contrações regulares antes de 37 semanas"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Exames do pré-natal",
      colunas: ["Momento", "Exames"],
      linhas: [
        ["1ª consulta", "Hemograma; tipagem ABO/Rh (Coombs indireto se Rh negativo); glicemia de jejum; teste rápido ou sorologia de sífilis, HIV, hepatite B (HBsAg) e hepatite C; toxoplasmose IgG/IgM; urina tipo 1 e urocultura; citopatológico conforme o rastreamento"],
        ["24 a 28 semanas", "TOTG 75 g: jejum ≥ 92, 1 h ≥ 180 ou 2 h ≥ 153 mg/dL = diabetes gestacional"],
        ["3º trimestre", "Hemograma; glicemia; sífilis; HIV; hepatites; urocultura; toxoplasmose se suscetível; Coombs indireto se Rh negativo"],
        ["Rh negativo, Coombs negativo", "Imunoglobulina anti-D com 28 semanas e até 72 h após o parto se RN Rh positivo (e após sangramentos ou procedimentos)"],
      ],
    },
    {
      titulo: "Medidas e suplementos",
      colunas: ["Item", "Recomendação"],
      linhas: [
        ["Ácido fólico", "0,4 mg/dia, idealmente desde 30 dias antes da concepção até o fim do 1º trimestre"],
        ["Ferro", "40 mg de ferro elementar/dia durante a gestação e até 3 meses pós-parto"],
        ["AAS", "Alto risco de pré-eclâmpsia: 100 a 150 mg/dia à noite, de 12 até 36 semanas"],
        ["Vacinas", "dTpa a cada gestação a partir de 20 semanas; hepatite B se não vacinada; influenza; demais conforme o calendário do PNI"],
        ["Altura uterina", "12 semanas: sínfise púbica; 16: entre púbis e umbigo; 20: cicatriz umbilical; de 20 a 32 semanas, a altura em cm aproxima a idade gestacional"],
      ],
    },
  ],
  oQueCai: [
    "Consultas: mensais até 28, quinzenais até 36 e semanais depois.",
    "TOTG 75 g com 24 a 28 semanas: 92/180/153.",
    "Sífilis: 1ª consulta, 3º trimestre e parto.",
    "dTpa a partir de 20 semanas em toda gestação.",
    "Anti-D com 28 semanas na Rh negativo não sensibilizada.",
  ],
  pegadinhas: [
    "\"Alta do pré-natal com 37 semanas\" (não há alta: consultas semanais até o parto).",
    "\"Gestante de alto risco sai da atenção primária\" (mantém o acompanhamento compartilhado).",
    "\"Vacina contra febre amarela e tríplice viral na gestação\" (vírus vivos, contraindicadas em regra).",
  ],
};
