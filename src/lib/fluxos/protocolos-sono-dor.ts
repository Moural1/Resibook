import { atencao, avaliar, cenario, conduta, decisao, ramo, type Tema } from "./tipos.ts";

/* Insônia e dor articular em versão aprofundada. Doses usuais de adulto;
   conferir bula, disponibilidade no Brasil e ajuste renal e hepático. */

export const INSONIA: Tema = {
  id: "insonia",
  titulo: "Insônia: diagnóstico, TCC-I e farmacoterapia",
  fonte: {
    titulo: "Riemann D, et al. The European Insomnia Guideline: An update on the diagnosis and treatment of insomnia 2023. J Sleep Res. 2023. Consenso Brasileiro de Insônia (ABS, 2019); ICSD-3.",
    url: "https://doi.org/10.1111/jsr.14035",
    nota: "Hipnóticos por tempo curto e com plano de retirada. Disponibilidade dos fármacos no Brasil varia: confira a Anvisa.",
  },
  revisar: [
    "TCC-I é a primeira linha para todos os adultos com insônia crônica, inclusive idosos e pacientes com comorbidades.",
    "Medicamento só quando a TCC-I não basta ou não está disponível, por até 4 semanas e na menor dose.",
    "Antes de rotular insônia, procurar apneia do sono, pernas inquietas, atraso de fase, depressão, ansiedade, dor e substâncias.",
  ],
  algoritmos: [
    {
      titulo: "Avaliação da queixa de insônia",
      passos: [
        cenario("Queixa de sono ruim: dificuldade para iniciar ou manter o sono, ou despertar precoce"),
        avaliar("Prejuízo diurno (fadiga, humor, atenção, desempenho) apesar de oportunidade e ambiente adequados para dormir?"),
        decisao(
          "Duração",
          ramo("< 3 meses: insônia aguda (de curto prazo)", conduta("Identificar o gatilho (estresse, luto, doença, mudança de rotina); higiene do sono e medidas comportamentais; hipnótico só por poucos dias se intenso")),
          ramo("≥ 3 noites por semana há ≥ 3 meses: insônia crônica", avaliar("Diário do sono por 1 a 2 semanas e Índice de Gravidade de Insônia (ISI)"))
        ),
        decisao(
          "Sinais de outro distúrbio do sono ou condição associada?",
          ramo("Ronco, apneias presenciadas, sonolência excessiva, obesidade, HAS resistente", conduta("Suspeita de apneia obstrutiva: STOP-Bang e polissonografia")),
          ramo("Desconforto nas pernas ao repouso, à noite, com alívio ao movimento", conduta("Síndrome das pernas inquietas: ferritina (repor se < 75 ng/mL) e revisar medicamentos")),
          ramo("Sono bom em horário tardio, dificuldade só para dormir cedo", conduta("Atraso de fase do ritmo circadiano: luz pela manhã e regularidade de horários")),
          ramo("Humor deprimido, ansiedade, dor, noctúria, álcool, cafeína, estimulantes, corticoide, betabloqueador", conduta("Tratar a condição associada em paralelo; a insônia também recebe TCC-I"))
        ),
        conduta("Insônia crônica confirmada: iniciar TCC-I (ver o próximo fluxograma)"),
      ],
    },
    {
      titulo: "Tratamento da insônia crônica",
      passos: [
        cenario("Insônia crônica com prejuízo diurno"),
        conduta("TCC-I por 4 a 8 sessões (presencial, em grupo ou digital): educação, controle de estímulos, restrição de sono, higiene do sono, relaxamento e reestruturação cognitiva"),
        avaliar("Reavaliar com diário do sono e ISI após 4 a 8 semanas"),
        decisao(
          "Melhora adequada?",
          ramo("Sim", conduta("Manter as técnicas aprendidas; reforçar em recaídas")),
          ramo(
            "Não, ou TCC-I indisponível ou sofrimento intenso",
            conduta("Revisar adesão à TCC-I e diagnósticos diferenciais"),
            decisao(
              "Padrão principal",
              ramo("Dificuldade para iniciar o sono", conduta("Hipnótico de meia-vida curta: zolpidem 5 a 10 mg (5 mg em mulheres e idosos) imediatamente ao deitar")),
              ramo("Despertares e dificuldade para manter o sono", conduta("Antagonista de orexina (daridorexanto, lemborexante ou suvorexante, conforme disponibilidade) ou eszopiclona 1 a 3 mg")),
              ramo("Despertar no meio da noite com 4 h ou mais restantes de cama", conduta("Zolpidem sublingual em dose baixa, só com 4 h ou mais de sono pela frente (onde disponível)")),
              ramo("Depressão ou ansiedade associada", conduta("Antidepressivo sedativo em dose baixa (mirtazapina, trazodona ou amitriptilina), tratando o transtorno de base"))
            ),
            atencao("Usar por até 4 semanas, na menor dose eficaz, com reavaliação; uso intermitente (3 a 5 noites por semana) é opção quando necessário prolongar")
          )
        ),
      ],
    },
    {
      titulo: "Retirada de benzodiazepínico ou hipnótico em uso crônico",
      passos: [
        cenario("Uso diário de benzodiazepínico ou de droga Z há meses"),
        conduta("Explicar riscos (quedas, fraturas, prejuízo cognitivo, acidentes) e combinar o plano com o paciente"),
        conduta("Iniciar TCC-I antes ou junto da redução (aumenta a chance de sucesso)"),
        conduta("Reduzir cerca de 25% da dose a cada 2 semanas; na reta final, reduções menores (12,5%)"),
        decisao(
          "Sintomas de abstinência ou rebote?",
          ramo("Sim", conduta("Manter a dose atual por mais 2 a 4 semanas e reduzir mais devagar")),
          ramo("Não", conduta("Seguir a redução até suspender"))
        ),
        atencao("Uso de doses altas, dependência de álcool ou história de convulsão na abstinência: retirada lenta com especialista; não suspender de forma abrupta"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Técnicas da TCC-I",
      colunas: ["Técnica", "Como aplicar"],
      linhas: [
        ["Controle de estímulos", "Deitar só com sono; cama só para dormir e sexo; sem sono em cerca de 20 min, sair do quarto e voltar só com sono; mesmo horário para acordar todos os dias; não cochilar"],
        ["Restrição de sono", "Janela na cama = tempo médio de sono do diário (mínimo de 5 h). Eficiência do sono ≥ 85 a 90% por 1 semana: ampliar 15 a 20 min; < 80 a 85%: reduzir 15 a 20 min. Cautela em epilepsia, bipolaridade e motoristas"],
        ["Higiene do sono", "Evitar cafeína após o almoço, álcool e nicotina à noite, refeições pesadas e telas antes de deitar; quarto escuro, silencioso e fresco; exercício regular, não perto da hora de dormir. Sozinha, não trata insônia crônica"],
        ["Relaxamento", "Relaxamento muscular progressivo, respiração diafragmática, mindfulness"],
        ["Reestruturação cognitiva", "Trabalhar crenças como \"preciso de 8 h ou o dia está perdido\" e a preocupação com o sono; reservar um horário da tarde para preocupações"],
      ],
    },
    {
      titulo: "Índice de Gravidade de Insônia (ISI)",
      colunas: ["Pontuação", "Interpretação"],
      linhas: [
        ["0 a 7", "Sem insônia clinicamente significativa"],
        ["8 a 14", "Insônia subclínica (leve)"],
        ["15 a 21", "Insônia clínica moderada"],
        ["22 a 28", "Insônia clínica grave"],
      ],
    },
    {
      titulo: "Medicamentos para insônia (adulto)",
      colunas: ["Classe", "Exemplos e dose", "Indicação principal", "Cuidados"],
      linhas: [
        ["Droga Z", "Zolpidem 5 a 10 mg; zolpidem sublingual em dose baixa; eszopiclona 1 a 3 mg", "Início do sono (zolpidem); início e manutenção (eszopiclona)", "Comportamentos complexos no sono (sonambulismo, dirigir dormindo): suspender; tomar já deitado; evitar álcool; doses menores em idosos e mulheres"],
        ["Antagonista duplo de orexina", "Daridorexanto 25 a 50 mg; lemborexante 5 a 10 mg; suvorexante 10 a 20 mg", "Manutenção do sono; pode ser usado por até 3 meses (diretriz europeia)", "Contraindicado na narcolepsia; sonolência residual; conferir disponibilidade"],
        ["Melatonina de liberação prolongada", "2 mg 1 a 2 h antes de deitar", "≥ 55 anos, por até 3 meses", "Efeito modesto; melatonina de liberação imediata não tem evidência para insônia crônica"],
        ["Antidepressivo sedativo", "Trazodona 25 a 100 mg; mirtazapina 7,5 a 15 mg; amitriptilina 10 a 25 mg; doxepina 3 a 6 mg", "Insônia com depressão ou ansiedade; uso curto", "Evidência limitada sem transtorno de humor; amitriptilina com efeito anticolinérgico (evitar em idosos); mirtazapina aumenta apetite e peso"],
        ["Benzodiazepínico", "Clonazepam, alprazolam, lorazepam, entre outros", "Só uso curto (até 4 semanas) e excepcional", "Tolerância, dependência, quedas, prejuízo cognitivo; evitar em idosos e na apneia do sono"],
        ["Não recomendados", "Anti-histamínicos (prometazina, difenidramina), antipsicóticos (quetiapina), fitoterápicos (valeriana)", "—", "Sem evidência de benefício e com efeitos adversos relevantes"],
      ],
    },
    {
      titulo: "Situações especiais",
      colunas: ["Quem", "O que muda"],
      linhas: [
        ["Idoso", "TCC-I primeiro; evitar benzodiazepínicos, anticolinérgicos e anti-histamínicos (critérios de Beers); se precisar, zolpidem 5 mg, antagonista de orexina ou melatonina de liberação prolongada"],
        ["Gestante", "TCC-I e medidas comportamentais; avaliar pernas inquietas e refluxo; evitar hipnóticos"],
        ["Depressão", "Tratar insônia e depressão juntas; insônia persistente aumenta o risco de recaída"],
        ["Apneia do sono", "Evitar benzodiazepínicos; tratar a apneia (CPAP); TCC-I também funciona na insônia associada"],
        ["Trabalhador em turnos", "Horários regulares, cochilo programado antes do plantão, luz forte no trabalho e quarto escuro para dormir de dia"],
      ],
    },
  ],
  oQueCai: [
    "Insônia crônica: ≥ 3 noites/semana por ≥ 3 meses, com prejuízo diurno.",
    "TCC-I é a primeira linha, inclusive em idosos e com comorbidades.",
    "Restrição de sono: janela = tempo médio de sono, mínimo de 5 h; ajustar pela eficiência.",
    "Hipnótico por até 4 semanas; benzodiazepínico em idoso aumenta quedas e fraturas.",
    "Retirada de benzodiazepínico: redução gradual (cerca de 25% a cada 2 semanas) com TCC-I.",
  ],
  pegadinhas: [
    "\"Higiene do sono sozinha trata insônia crônica\" (não: é só um componente da TCC-I).",
    "\"Quetiapina em dose baixa para dormir\" (não recomendada: risco metabólico sem benefício comprovado).",
    "\"Ficar mais tempo na cama ajuda a recuperar o sono\" (piora: a restrição de sono é que funciona).",
    "\"Insônia com ronco: prescrever benzodiazepínico\" (investigar apneia; benzodiazepínico piora).",
  ],
};

export const DOR_CRONICA: Tema = {
  id: "dor-cronica-articular",
  titulo: "Dor articular: abordagem, osteoartrite e gota",
  fonte: {
    titulo: "Kolasinski SL, et al. 2019 ACR/Arthritis Foundation Guideline for the Management of Osteoarthritis of the Hand, Hip, and Knee. Arthritis Care Res. 2020. FitzGerald JD, et al. 2020 ACR Guideline for the Management of Gout. Critérios ACR/EULAR 2010 para artrite reumatoide.",
    url: "https://doi.org/10.1002/acr.24131",
    nota: "Recomendações de osteoartrite também conferem com a OARSI 2019. Monoartrite aguda é urgência até excluir artrite séptica.",
  },
  revisar: [
    "Primeiro passo: número de articulações (mono, oligo ou poli), tempo (agudo × crônico, corte de 6 semanas) e padrão (inflamatório × mecânico).",
    "Monoartrite aguda: puncionar a articulação (celularidade, Gram, cultura e cristais) antes de antibiótico.",
    "Osteoartrite: exercício, perda de peso e educação são a base; glucosamina, condroitina e opioides fortes não são recomendados.",
  ],
  algoritmos: [
    {
      titulo: "Abordagem da dor articular",
      passos: [
        cenario("Dor articular"),
        avaliar("Confirmar que é articular (dor ao movimento passivo, edema ou derrame) e não periarticular (bursite, tendinite) ou referida"),
        decisao(
          "Quantas articulações e há quanto tempo?",
          ramo(
            "Monoartrite aguda",
            conduta("Artrocentese: celularidade, Gram, cultura e pesquisa de cristais; hemograma, PCR, hemoculturas"),
            decisao(
              "Resultado",
              ramo("Líquido purulento (em geral > 50.000 leucócitos/mm³) ou Gram/cultura positivos", conduta("Artrite séptica: antibiótico EV empírico (cobrir S. aureus; gonococo em jovem sexualmente ativo) e drenagem articular")),
              ramo("Cristais de urato (agulha, birrefringência negativa)", conduta("Crise de gota (ver o fluxograma da gota)")),
              ramo("Cristais de pirofosfato de cálcio (romboides, birrefringência positiva fraca)", conduta("Doença por depósito de pirofosfato: AINE, colchicina ou corticoide intra-articular"))
            )
          ),
          ramo(
            "Oligo ou poliartrite crônica (> 6 semanas) de padrão inflamatório",
            avaliar("Rigidez matinal > 30 a 60 min, edema, melhora com movimento, sintomas sistêmicos: VHS, PCR, FR, anti-CCP, FAN, ácido úrico, sorologias (hepatites B e C, HIV), radiografias de mãos e pés"),
            conduta("Suspeita de artrite reumatoide ou espondiloartrite: encaminhar à reumatologia com prioridade (janela de oportunidade nos primeiros meses)")
          ),
          ramo(
            "Crônica de padrão mecânico",
            avaliar("Piora com uso e alivia com repouso, rigidez matinal < 30 min, crepitação, nódulos de Heberden e Bouchard, > 45 anos"),
            conduta("Osteoartrite: diagnóstico clínico; radiografia só se dúvida ou para planejamento cirúrgico (ver o fluxograma da osteoartrite)")
          ),
          ramo("Dor difusa sem sinovite, com fadiga e sono ruim", conduta("Considerar fibromialgia (tema próprio)"))
        ),
        atencao("Sinais de alarme: febre com monoartrite, perda de peso, déficit neurológico, dor noturna intensa sem alívio, história de câncer"),
      ],
    },
    {
      titulo: "Osteoartrite de joelho, quadril e mãos",
      passos: [
        cenario("Osteoartrite sintomática"),
        conduta("Todos: educação, exercício (fortalecimento, aeróbico, aquático), perda de ≥ 5% do peso se sobrepeso, tai chi ou ioga; autocuidado e controle da dor"),
        conduta("Conforme a articulação: bengala no lado contralateral (joelho, quadril), joelheira tibiofemoral, órtese para rizartrose (base do polegar)"),
        conduta("1ª opção farmacológica: AINE tópico no joelho e nas mãos; AINE oral na menor dose e pelo menor tempo, com proteção gástrica se risco"),
        decisao(
          "Dor persiste?",
          ramo("Não", avaliar("Manter exercício e reavaliar periodicamente")),
          ramo(
            "Sim",
            conduta("Infiltração intra-articular de corticoide no joelho ou no quadril (guiada por imagem no quadril) para crises"),
            conduta("Duloxetina (sobretudo dor difusa ou humor associado), tramadol por tempo curto, capsaicina tópica no joelho"),
            decisao(
              "Dor incapacitante e limitação funcional apesar do tratamento clínico otimizado?",
              ramo("Sim", conduta("Encaminhar ao ortopedista para avaliar artroplastia")),
              ramo("Não", conduta("Seguir com tratamento clínico e reforço do exercício"))
            )
          )
        ),
        atencao("Não recomendados: glucosamina, condroitina (exceto mãos, condicional), hidroxicloroquina, metotrexato, bisfosfonatos, PRP, células-tronco e opioides que não o tramadol"),
      ],
    },
    {
      titulo: "Gota: crise e tratamento redutor de urato",
      passos: [
        cenario("Monoartrite aguda muito dolorosa (podagra), com hiperuricemia ou tofos, ou cristais de urato no líquido"),
        decisao(
          "Crise aguda: escolher conforme comorbidades",
          ramo("Sem contraindicação", conduta("AINE em dose plena ou colchicina em dose baixa (1 mg e mais 0,5 mg 1 h depois, no 1º dia), iniciados o mais cedo possível")),
          ramo("DRC, sangramento, anticoagulante ou IC", conduta("Corticoide: prednisona 30 a 40 mg/dia por 5 dias, ou intra-articular se monoartrite")),
          ramo("Crise grave poliarticular", conduta("Associação de 2 classes (ex.: colchicina + corticoide)"))
        ),
        atencao("Não suspender o alopurinol em uso durante a crise"),
        decisao(
          "Indicação de redutor de urato? (≥ 1 tofo, dano radiográfico ou ≥ 2 crises/ano; considerar após a 1ª crise com DRC ≥ 3, urato > 9 mg/dL ou litíase)",
          ramo("Não", avaliar("Orientar dieta, perda de peso, reduzir álcool e frutose; revisar diuréticos")),
          ramo(
            "Sim",
            conduta("Alopurinol: iniciar ≤ 100 mg/dia (dose menor na DRC) e aumentar a cada 2 a 4 semanas até urato < 6 mg/dL"),
            conduta("Profilaxia de crise por 3 a 6 meses ao iniciar: colchicina 0,5 a 1 mg/dia (ou AINE ou prednisona em dose baixa)"),
            atencao("Testar HLA-B*5801 antes do alopurinol em descendentes do Sudeste Asiático e afro-americanos (risco de reação grave)")
          )
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Inflamatório × mecânico",
      colunas: ["Característica", "Inflamatório", "Mecânico"],
      linhas: [
        ["Rigidez matinal", "> 30 a 60 min", "< 30 min"],
        ["Com o movimento", "Melhora", "Piora"],
        ["Repouso", "Piora (dor e rigidez)", "Alivia"],
        ["Edema e calor", "Frequentes (sinovite)", "Raros; derrame ocasional"],
        ["Sintomas sistêmicos", "Febre, fadiga, perda de peso", "Ausentes"],
        ["VHS e PCR", "Elevadas", "Normais"],
        ["Exemplos", "Artrite reumatoide, espondiloartrites, gota, lúpus", "Osteoartrite"],
      ],
    },
    {
      titulo: "Líquido sinovial",
      colunas: ["Tipo", "Aspecto", "Leucócitos/mm³", "Polimorfonucleares", "Exemplos"],
      linhas: [
        ["Normal", "Transparente, viscoso", "< 200", "< 25%", "—"],
        ["Não inflamatório", "Transparente, amarelo-claro", "200 a 2.000", "< 25%", "Osteoartrite, trauma"],
        ["Inflamatório", "Turvo", "2.000 a 50.000", "≥ 50%", "Gota, pirofosfato, artrite reumatoide"],
        ["Séptico", "Purulento", "Em geral > 50.000", "≥ 75%", "Artrite séptica (também pode haver cristais junto)"],
        ["Hemorrágico", "Sanguinolento", "Variável", "Variável", "Trauma, coagulopatia, sinovite vilonodular"],
      ],
    },
    {
      titulo: "Critérios ACR/EULAR 2010 para artrite reumatoide (≥ 6 de 10 pontos)",
      colunas: ["Domínio", "Pontuação"],
      linhas: [
        ["Articulações acometidas", "1 grande: 0; 2 a 10 grandes: 1; 1 a 3 pequenas: 2; 4 a 10 pequenas: 3; > 10 (com ≥ 1 pequena): 5"],
        ["Sorologia (FR e anti-CCP)", "Ambos negativos: 0; algum positivo em título baixo: 2; algum positivo em título alto (> 3x o limite): 3"],
        ["Provas de fase aguda (PCR, VHS)", "Normais: 0; alguma alterada: 1"],
        ["Duração dos sintomas", "< 6 semanas: 0; ≥ 6 semanas: 1"],
        ["Para quem se aplica", "Sinovite em ≥ 1 articulação sem outro diagnóstico que a explique melhor"],
      ],
    },
    {
      titulo: "Tratamento da osteoartrite (ACR 2019)",
      colunas: ["Força", "A favor", "Contra"],
      linhas: [
        ["Forte", "Exercício; perda de peso (joelho, quadril); autocuidado; tai chi; bengala; joelheira tibiofemoral; órtese de rizartrose; AINE oral; AINE tópico no joelho; corticoide intra-articular no joelho e no quadril", "Glucosamina; condroitina (joelho e quadril); hidroxicloroquina; metotrexato; bisfosfonatos; PRP; células-tronco; anti-TNF e anti-IL-1; ácido hialurônico no quadril; TENS"],
        ["Condicional", "AINE tópico nas mãos; duloxetina; tramadol; paracetamol; capsaicina tópica no joelho; acupuntura; TCC; termoterapia", "Ácido hialurônico no joelho; opioides que não o tramadol; colchicina; óleo de peixe; vitamina D"],
      ],
    },
    {
      titulo: "Gota: metas e fármacos",
      colunas: ["Ponto", "Recomendação"],
      linhas: [
        ["Alvo", "Ácido úrico < 6 mg/dL (< 5 com tofos, até a reabsorção)"],
        ["1ª linha", "Alopurinol, inclusive na DRC (dose inicial baixa e titulação)"],
        ["Alternativas", "Febuxostate (cautela em doença cardiovascular); uricosúricos (benzbromarona) se função renal adequada e sem litíase"],
        ["Profilaxia ao iniciar", "Colchicina em dose baixa por 3 a 6 meses"],
        ["Comorbidades", "Preferir losartana para hipertensão; evitar diuréticos tiazídicos e de alça quando possível"],
      ],
    },
  ],
  oQueCai: [
    "Monoartrite aguda: artrocentese antes do antibiótico; séptica até prova em contrário.",
    "Rigidez matinal > 30 a 60 min sugere artrite inflamatória; < 30 min, osteoartrite.",
    "Artrite reumatoide: ≥ 6 pontos nos critérios ACR/EULAR 2010.",
    "Osteoartrite: exercício e perda de peso; AINE tópico no joelho; corticoide intra-articular nas crises.",
    "Gota: alopurinol iniciado em dose baixa, alvo < 6 mg/dL, com profilaxia de colchicina.",
  ],
  pegadinhas: [
    "\"Achar cristal de urato exclui artrite séptica\" (podem coexistir: sempre Gram e cultura).",
    "\"Suspender o alopurinol na crise de gota\" (manter; o redutor pode até ser iniciado durante a crise, desde que com profilaxia anti-inflamatória).",
    "\"Glucosamina e condroitina para osteoartrite de joelho\" (recomendação forte contra).",
    "\"Radiografia normal exclui osteoartrite\" (o diagnóstico é clínico; imagem e dor se correlacionam pouco).",
  ],
};
