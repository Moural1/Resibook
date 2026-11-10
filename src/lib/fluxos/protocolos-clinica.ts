import { atencao, avaliar, cenario, conduta, decisao, ramo, type Tema } from "./tipos.ts";
import { DOR_CRONICA, INSONIA } from "./protocolos-sono-dor.ts";

/* Protocolos de urgência e de doenças crônicas, resumidos das diretrizes
   citadas em `fonte`. Conferir doses no documento original antes de
   mudar qualquer valor. */

export const SEPSE: Tema = {
  id: "sepse",
  titulo: "Sepse e choque séptico (Surviving Sepsis 2021 e ILAS)",
  fonte: {
    titulo: "Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Intensive Care Med. 2021. Protocolos gerenciados do ILAS.",
    url: "https://doi.org/10.1007/s00134-021-06506-y",
    nota: "Resumo para o atendimento inicial. Ajuste o antibiótico ao foco e à microbiologia local.",
  },
  revisar: [
    "Choque ou sepse provável: antibiótico na 1ª hora. Sepse possível sem choque: investigação rápida e antibiótico em até 3 horas se a suspeita persistir.",
    "Hemoculturas antes do antibiótico, sem atrasá-lo.",
    "Não usar qSOFA isolado como ferramenta de triagem.",
  ],
  algoritmos: [
    {
      titulo: "Pacote da 1ª hora",
      passos: [
        cenario("Suspeita de infecção com disfunção orgânica (hipotensão, rebaixamento, oligúria, hipoxemia, lactato alto, plaquetopenia, bilirrubina alta)"),
        conduta("Lactato; 2 pares de hemoculturas e culturas do foco; antibiótico de amplo espectro"),
        decisao(
          "Hipotensão ou lactato ≥ 4 mmol/L?",
          ramo("Não", avaliar("Reavaliar perfusão e lactato; tratar o foco")),
          ramo(
            "Sim",
            conduta("Cristaloide 30 mL/kg nas primeiras 3 horas, de preferência solução balanceada (Ringer lactato)"),
            decisao(
              "Hipotensão durante ou após o volume?",
              ramo("Não", avaliar("Reavaliar responsividade a volume, enchimento capilar e lactato")),
              ramo(
                "Sim",
                conduta("Noradrenalina para PAM ≥ 65 mmHg (pode iniciar em veia periférica enquanto se obtém acesso central)"),
                conduta("Noradrenalina 0,25 a 0,5 mcg/kg/min: associar vasopressina"),
                conduta("Noradrenalina ou adrenalina ≥ 0,25 mcg/kg/min por ≥ 4 h: hidrocortisona 200 mg/dia")
              )
            )
          )
        ),
        conduta("Remensurar lactato em 2 a 4 h se inicial > 2 mmol/L; controle do foco (drenagem, retirada de cateter) o mais cedo possível"),
        atencao("Disfunção cardíaca com hipoperfusão apesar de volume e PAM adequados: dobutamina ou adrenalina"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Definições (Sepsis-3)",
      colunas: ["Termo", "Definição"],
      linhas: [
        ["Sepse", "Disfunção orgânica ameaçadora à vida por resposta desregulada à infecção (aumento de ≥ 2 pontos no SOFA)"],
        ["Choque séptico", "Vasopressor para manter PAM ≥ 65 mmHg e lactato > 2 mmol/L apesar de volume adequado"],
        ["Metas iniciais", "PAM ≥ 65 mmHg; queda do lactato; enchimento capilar normal; diurese ≥ 0,5 mL/kg/h"],
      ],
    },
  ],
  oQueCai: [
    "30 mL/kg de cristaloide na hipotensão ou lactato ≥ 4.",
    "Noradrenalina é o vasopressor de 1ª linha; alvo PAM ≥ 65.",
    "Hidrocortisona 200 mg/dia se vasopressor ≥ 0,25 mcg/kg/min por 4 h.",
    "Choque séptico = vasopressor + lactato > 2 após volume.",
  ],
  pegadinhas: [
    "\"Esperar a hemocultura para começar o antibiótico\" (colher antes, mas não atrasar).",
    "\"Soro fisiológico é preferível\" (preferir cristaloide balanceado).",
    "\"Dopamina como primeira escolha\" (não: noradrenalina).",
  ],
};

export const AVC: Tema = {
  id: "avc",
  titulo: "AVC isquêmico agudo (AHA/ASA)",
  fonte: {
    titulo: "Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019 (AHA/ASA).",
    url: "https://doi.org/10.1161/STR.0000000000000211",
    nota: "Siga o protocolo de AVC do seu serviço (trombolítico disponível, critérios de imagem e rede de trombectomia).",
  },
  revisar: [
    "Hora de início = último momento em que o paciente foi visto bem.",
    "Glicemia capilar e TC de crânio sem contraste antes de qualquer decisão; não atrasar a trombólise por outros exames, exceto se houver suspeita específica.",
    "PA < 185/110 mmHg antes da trombólise e < 180/105 mmHg nas 24 h seguintes.",
  ],
  algoritmos: [
    {
      titulo: "Fluxo do AVC isquêmico agudo",
      passos: [
        cenario("Déficit neurológico súbito (escala pré-hospitalar positiva)"),
        conduta("Glicemia capilar (tratar < 60 mg/dL), NIHSS, TC de crânio sem contraste; angio-TC se candidato a trombectomia"),
        decisao(
          "TC mostra hemorragia?",
          ramo("Sim", conduta("Protocolo de AVC hemorrágico: reverter anticoagulação; PAS alvo em torno de 140 mmHg; neurocirurgia")),
          ramo(
            "Não",
            decisao(
              "Até 4,5 h do último momento bem e sem contraindicação?",
              ramo(
                "Sim",
                conduta("Alteplase 0,9 mg/kg (máximo 90 mg): 10% em bolus em 1 min e o restante em 60 min. Tenecteplase 0,25 mg/kg (máximo 25 mg) em bolus é alternativa"),
                atencao("Sem antiagregante ou anticoagulante nas 24 h seguintes; TC de controle em 24 h")
              ),
              ramo("Não", conduta("Sem trombólise: tratar PA apenas se ≥ 220/120 mmHg (reduzir cerca de 15% nas primeiras 24 h); AAS 160 a 325 mg em 24 a 48 h"))
            ),
            decisao(
              "Oclusão de grande vaso (carótida interna ou ACM M1)?",
              ramo("Até 6 h, NIHSS ≥ 6, ASPECTS ≥ 6", conduta("Trombectomia mecânica (mesmo após trombolítico)")),
              ramo("6 a 24 h", conduta("Trombectomia se critérios de imagem dos estudos DAWN ou DEFUSE 3")),
              ramo("Sem oclusão de grande vaso", conduta("Seguir com trombólise (se indicada) e unidade de AVC"))
            )
          )
        ),
        conduta("Unidade de AVC: glicemia 140 a 180 mg/dL, tratar febre, triagem de disfagia antes de dieta, profilaxia de TEV com compressão pneumática"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Principais contraindicações à trombólise",
      colunas: ["Grupo", "Itens"],
      linhas: [
        ["Imagem", "Hemorragia na TC; hipodensidade extensa já estabelecida"],
        ["História", "AVC isquêmico ou TCE grave nos últimos 3 meses; cirurgia intracraniana ou raquimedular nos últimos 3 meses; hemorragia intracraniana prévia; neoplasia intracraniana intra-axial; sangramento gastrointestinal nos últimos 21 dias"],
        ["Exames", "Plaquetas < 100.000; INR > 1,7; TTPa prolongado; glicemia < 50 mg/dL"],
        ["Medicações", "Heparina de baixo peso em dose plena nas últimas 24 h; anticoagulante oral direto nas últimas 48 h (salvo exames normais)"],
        ["Clínica", "PA que não baixa de 185/110 mmHg; suspeita de endocardite ou dissecção de aorta"],
      ],
    },
    {
      titulo: "Prevenção secundária precoce",
      colunas: ["Situação", "Conduta"],
      linhas: [
        ["AVC menor (NIHSS ≤ 3) sem trombólise ou AIT de alto risco (ABCD2 ≥ 4)", "AAS + clopidogrel iniciados em 24 h, por 21 dias, depois antiagregante único"],
        ["Fibrilação atrial", "Anticoagulação; momento conforme a gravidade do AVC"],
        ["Estenose carotídea sintomática 70 a 99%", "Endarterectomia, idealmente em até 2 semanas"],
        ["Todos", "Estatina de alta intensidade, controle de PA e de fatores de risco"],
      ],
    },
  ],
  oQueCai: [
    "Janela da trombólise: 4,5 h do último momento bem.",
    "Alteplase 0,9 mg/kg, máximo 90 mg, 10% em bolus.",
    "PA < 185/110 antes e < 180/105 após a trombólise.",
    "Trombectomia até 24 h com seleção por imagem.",
    "Sem trombólise, tolerar PA até 220/120.",
  ],
  pegadinhas: [
    "\"Hora de início é quando o paciente acordou com o déficit\" (é a última vez em que foi visto bem).",
    "\"Esperar a creatinina para a TC sem contraste\" (não; nem para trombolisar, sem suspeita específica).",
    "\"Baixar agressivamente a PA no AVC sem trombólise\" (permissiva até 220/120).",
  ],
};

export const IAM: Tema = {
  id: "iam",
  titulo: "Síndrome coronariana aguda e IAM (AHA/ACC 2025)",
  fonte: {
    titulo: "Rao SV, et al. 2025 ACC/AHA/ACEP/NAEMSP/SCAI Guideline for the Management of Patients With Acute Coronary Syndromes. Circulation. 2025.",
    url: "https://doi.org/10.1161/CIR.0000000000001309",
    nota: "No Brasil, confira também as diretrizes da SBC e o protocolo de dor torácica do serviço.",
  },
  revisar: [
    "ECG em até 10 minutos da chegada em toda dor torácica.",
    "IAM com supra: reperfusão em até 12 h. Angioplastia primária se o tempo do primeiro contato até a abertura da artéria for ≤ 90 min (≤ 120 min com transferência); se não, fibrinolítico em até 30 min.",
    "Oxigênio só se SpO2 < 90%.",
  ],
  algoritmos: [
    {
      titulo: "Dor torácica e IAM",
      passos: [
        cenario("Dor torácica sugestiva de isquemia"),
        conduta("ECG em 10 min, monitorização, acesso venoso, troponina de alta sensibilidade; AAS 162 a 325 mg mastigado"),
        decisao(
          "Supra de ST (ou BRE novo com quadro compatível)?",
          ramo(
            "Sim: IAM com supra",
            decisao(
              "Angioplastia primária disponível em ≤ 120 min do primeiro contato?",
              ramo(
                "Sim",
                conduta("Angioplastia primária; inibidor de P2Y12 (prasugrel 60 mg ou ticagrelor 180 mg; clopidogrel 600 mg se indisponíveis); heparina não fracionada")
              ),
              ramo(
                "Não",
                conduta("Fibrinolítico em até 30 min (sem contraindicação) + clopidogrel 300 mg (75 mg se > 75 anos) + enoxaparina"),
                avaliar("Resolução do supra < 50% em 60 a 90 min ou instabilidade: angioplastia de resgate"),
                conduta("Com sucesso: transferir para coronariografia entre 2 e 24 h")
              )
            )
          ),
          ramo(
            "Não",
            avaliar("Troponina seriada (algoritmo 0/1 h ou 0/2 h) e escore de risco"),
            decisao(
              "Risco",
              ramo("Instabilidade hemodinâmica ou elétrica, angina refratária, insuficiência cardíaca aguda", conduta("Estratégia invasiva imediata (< 2 h)")),
              ramo("IAM sem supra ou alto risco (GRACE > 140)", conduta("Estratégia invasiva precoce (< 24 h); antiagregação dupla e anticoagulação")),
              ramo("Troponina negativa, baixo risco", conduta("Investigação não invasiva ou alta com seguimento"))
            )
          )
        ),
        conduta("Estatina de alta intensidade; betabloqueador oral nas primeiras 24 h se sem insuficiência cardíaca, choque ou bloqueio"),
        atencao("Nitrato contraindicado se PAS < 90 mmHg, IAM de ventrículo direito ou uso de sildenafil (24 h) ou tadalafil (48 h)"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Tempos-alvo no IAM com supra",
      colunas: ["Etapa", "Meta"],
      linhas: [
        ["Chegada até ECG", "≤ 10 min"],
        ["Primeiro contato até angioplastia (no hospital com hemodinâmica)", "≤ 90 min"],
        ["Primeiro contato até angioplastia (com transferência)", "≤ 120 min"],
        ["Chegada até fibrinolítico", "≤ 30 min"],
        ["Após fibrinólise com sucesso", "Coronariografia entre 2 e 24 h"],
      ],
    },
    {
      titulo: "Contraindicações absolutas à fibrinólise",
      colunas: ["Item", "Detalhe"],
      linhas: [
        ["Sangramento intracraniano", "Qualquer hemorragia intracraniana prévia"],
        ["Lesão estrutural", "Malformação vascular ou neoplasia intracraniana"],
        ["AVC isquêmico", "Nos últimos 3 meses (exceto AVC agudo em até 4,5 h)"],
        ["Dissecção de aorta", "Suspeita"],
        ["Sangramento ativo", "Ou diátese hemorrágica (exceto menstruação)"],
        ["Trauma", "TCE ou trauma facial significativo nos últimos 3 meses; cirurgia intracraniana ou medular nos últimos 2 meses"],
      ],
    },
  ],
  oQueCai: [
    "ECG em 10 min; angioplastia ≤ 90 min (≤ 120 com transferência); fibrinolítico ≤ 30 min.",
    "Após fibrinólise: coronariografia em 2 a 24 h; resgate se falha.",
    "Clopidogrel com fibrinolítico: 300 mg (75 mg acima de 75 anos).",
    "O2 só se SpO2 < 90%.",
  ],
  pegadinhas: [
    "\"MONA para todos\" (oxigênio e morfina não são rotina).",
    "\"Nitrato no IAM inferior com hipotensão\" (contraindicado se suspeita de VD).",
    "\"Fibrinolítico após 12 h de dor sem isquemia persistente\" (sem benefício).",
  ],
};

export const ASMA: Tema = {
  id: "asma",
  titulo: "Asma: tratamento e crise (GINA)",
  fonte: {
    titulo: "Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention. Relatório 2024.",
    url: "https://ginasthma.org/reports/",
    nota: "Doses de corticoide inalatório variam por dispositivo: consulte a tabela de doses do GINA.",
  },
  revisar: [
    "Não tratar asma com broncodilatador de curta ação (SABA) isolado em adolescentes e adultos: todo esquema inclui corticoide inalatório.",
    "Via preferencial (trilha 1): budesonida-formoterol como resgate, com ou sem manutenção (MART).",
  ],
  algoritmos: [
    {
      titulo: "Crise de asma no pronto atendimento (adulto)",
      passos: [
        cenario("Dispneia, sibilos, tosse ou aperto torácico com piora aguda"),
        avaliar("Gravidade: fala, posição, FR, FC, SpO2 e pico de fluxo (PFE)"),
        decisao(
          "Gravidade",
          ramo(
            "Leve a moderada: fala frases, FC 100 a 120, SpO2 90 a 95%, PFE > 50%",
            conduta("SABA 4 a 10 jatos com espaçador a cada 20 min na 1ª hora"),
            conduta("Prednisolona 40 a 50 mg VO; O2 para SpO2 93 a 95%")
          ),
          ramo(
            "Grave: fala palavras, agitado, FR > 30, FC > 120, SpO2 < 90%, PFE ≤ 50%",
            conduta("SABA + ipratrópio, corticoide sistêmico, O2 alvo 93 a 95%"),
            conduta("Sem resposta: sulfato de magnésio 2 g IV em 20 min; considerar UTI")
          ),
          ramo("Risco de vida: sonolência, confusão, tórax silencioso", conduta("UTI, preparar intubação; SABA + ipratrópio, corticoide e O2"))
        ),
        avaliar("Reavaliar em 1 h com PFE e SpO2"),
        conduta("Alta: corticoide oral por 5 a 7 dias, iniciar ou aumentar corticoide inalatório, checar técnica e plano de ação, retorno em 2 a 7 dias"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Tratamento de manutenção por etapas (≥ 12 anos)",
      colunas: ["Etapa", "Trilha 1 (preferencial)", "Trilha 2 (alternativa)"],
      linhas: [
        ["1 e 2", "Budesonida-formoterol dose baixa conforme necessidade", "Corticoide inalatório sempre que usar SABA (etapa 1) ou corticoide inalatório dose baixa diário (etapa 2)"],
        ["3", "Budesonida-formoterol dose baixa de manutenção e resgate (MART)", "Corticoide inalatório + LABA dose baixa + SABA de resgate"],
        ["4", "MART com dose média", "Corticoide inalatório + LABA dose média ou alta"],
        ["5", "Associar LAMA; fenotipar (eosinófilos, IgE); considerar imunobiológico", "Mesmo"],
      ],
    },
    {
      titulo: "Controle dos sintomas (últimas 4 semanas)",
      colunas: ["Pergunta", "Resultado"],
      linhas: [
        ["Sintomas diurnos mais de 2x/semana?", "Cada sim conta 1 ponto"],
        ["Despertar noturno por asma?", "0 ponto: bem controlada"],
        ["Resgate mais de 2x/semana?", "1 a 2 pontos: parcialmente controlada"],
        ["Limitação de atividade por asma?", "3 a 4 pontos: não controlada"],
      ],
    },
  ],
  oQueCai: [
    "SABA isolado não é mais tratamento de asma em adultos.",
    "MART com budesonida-formoterol nas etapas 3 e 4.",
    "Crise: SABA a cada 20 min, corticoide sistêmico precoce, O2 alvo 93 a 95%.",
    "Magnésio IV na crise grave sem resposta.",
  ],
  pegadinhas: [
    "\"Tórax silencioso é sinal de melhora\" (é sinal de risco de vida).",
    "\"PaCO2 normal na crise grave é tranquilizador\" (pode indicar fadiga).",
    "\"Antibiótico de rotina na crise\" (só se houver infecção bacteriana).",
  ],
};

export const HIPERTENSAO: Tema = {
  id: "hipertensao",
  titulo: "Hipertensão arterial (Diretriz Brasileira 2025)",
  fonte: {
    titulo: "Diretriz Brasileira de Hipertensão Arterial – 2025 (SBC, SBH e SBN). Arquivos Brasileiros de Cardiologia.",
    url: "https://abccardiol.org",
    nota: "Resumo dos pontos principais: classificação, início do tratamento e metas.",
  },
  revisar: [
    "PA 120 a 139/80 a 89 mmHg é pré-hipertensão; medidas não medicamentosas para todos a partir de 120/80.",
    "Meta única: PA < 130/80 mmHg para a maioria, individualizando em idosos frágeis.",
    "Diagnóstico com medidas repetidas no consultório e, sempre que possível, MAPA ou MRPA.",
  ],
  algoritmos: [
    {
      titulo: "Do diagnóstico ao tratamento",
      passos: [
        cenario("PA elevada no consultório"),
        avaliar("Confirmar com medidas em 2 ou mais consultas e MAPA/MRPA (afastar hipertensão do avental branco e mascarada)"),
        avaliar("Risco cardiovascular global, lesão de órgão-alvo (ECG, creatinina, albuminúria, fundo de olho) e causas secundárias quando indicado"),
        decisao(
          "Classificação",
          ramo("Pré-hipertensão (120 a 139/80 a 89)", conduta("Mudança de estilo de vida; considerar medicamento se risco cardiovascular alto")),
          ramo("Hipertensão estágio 1 (140 a 159/90 a 99)", conduta("Mudança de estilo de vida + medicamento, em geral combinação em dose baixa")),
          ramo("Estágio 2 ou 3 (≥ 160/100)", conduta("Combinação de 2 fármacos desde o início, de preferência em comprimido único"))
        ),
        conduta("Classes preferenciais: IECA ou BRA, bloqueador de canal de cálcio di-hidropiridínico e diurético tiazídico ou similar"),
        decisao(
          "Fora da meta com 3 fármacos em dose plena (incluindo diurético)?",
          ramo("Sim", conduta("Hipertensão resistente: confirmar adesão e MAPA; associar espironolactona; investigar causas secundárias")),
          ramo("Não", avaliar("Seguimento até a meta < 130/80"))
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Classificação da PA no consultório (≥ 18 anos)",
      colunas: ["Categoria", "PAS (mmHg)", "PAD (mmHg)"],
      linhas: [
        ["Normal", "< 120", "< 80"],
        ["Pré-hipertensão", "120 a 139", "80 a 89"],
        ["Hipertensão estágio 1", "140 a 159", "90 a 99"],
        ["Hipertensão estágio 2", "160 a 179", "100 a 109"],
        ["Hipertensão estágio 3", "≥ 180", "≥ 110"],
      ],
    },
    {
      titulo: "Urgência × emergência hipertensiva",
      colunas: ["Situação", "Conduta"],
      linhas: [
        ["Emergência: PA muito elevada com lesão aguda de órgão-alvo (encefalopatia, AVC, SCA, edema agudo de pulmão, dissecção de aorta, eclâmpsia)", "Internação, droga EV titulável; reduzir PAM até 25% na 1ª hora (dissecção de aorta: PAS < 120 mmHg em 20 min)"],
        ["PA muito elevada sem lesão aguda", "Não é emergência: ajustar medicação oral e reavaliar em poucos dias; evitar queda abrupta"],
      ],
    },
  ],
  oQueCai: [
    "Pré-hipertensão: 120 a 139/80 a 89.",
    "Meta < 130/80 para a maioria.",
    "Estágio 2 ou mais: começar com combinação.",
    "Resistente: espironolactona como 4º fármaco.",
  ],
  pegadinhas: [
    "\"Nifedipino sublingual na PA alta sem lesão de órgão\" (não: risco de queda abrupta).",
    "\"IECA + BRA juntos para mais proteção renal\" (combinação contraindicada).",
    "\"Diagnosticar com uma única medida\" (confirmar com medidas repetidas e MAPA/MRPA).",
  ],
};

export const DIARREIA: Tema = {
  id: "diarreia",
  titulo: "Diarreia aguda e crônica (MS: planos A, B e C)",
  fonte: {
    titulo: "Ministério da Saúde. Manejo do paciente com diarreia (planos A, B e C) e Doenças Diarreicas Agudas.",
    url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/dda",
    nota: "Valores do cartaz do MS para avaliação do estado de hidratação e dos planos de tratamento.",
  },
  revisar: [
    "Avaliar o estado de hidratação antes de tudo: o plano depende dele, não da causa.",
    "Criança: zinco por 10 a 14 dias em todo episódio de diarreia aguda.",
    "Antibiótico só em disenteria com comprometimento do estado geral, cólera ou imunossupressão.",
  ],
  algoritmos: [
    {
      titulo: "Diarreia aguda: estado de hidratação e plano",
      passos: [
        cenario("Diarreia com menos de 14 dias"),
        avaliar("Estado geral, olhos, lágrimas, sede, sinal da prega, pulso e enchimento capilar"),
        decisao(
          "Classificação",
          ramo(
            "Sem desidratação: Plano A (domicílio)",
            conduta("Aumentar líquidos e SRO após cada evacuação: < 1 ano 50 a 100 mL; 1 a 10 anos 100 a 200 mL; > 10 anos à vontade"),
            conduta("Manter alimentação e aleitamento; zinco < 6 meses 10 mg/dia e ≥ 6 meses 20 mg/dia por 10 a 14 dias"),
            conduta("Orientar sinais de perigo e retorno")
          ),
          ramo(
            "Alguma desidratação (≥ 2 sinais): Plano B (unidade de saúde)",
            conduta("SRO 50 a 100 mL/kg em 4 a 6 horas, em pequenas quantidades"),
            avaliar("Reavaliar: hidratado vai para o Plano A; piora ou vômitos persistentes vai para o Plano C (ou sonda nasogástrica)")
          ),
          ramo(
            "Desidratação grave (≥ 2 sinais, sendo ≥ 1 de gravidade): Plano C (EV)",
            conduta("< 5 anos: SF 0,9% 20 mL/kg em 30 min, repetir até hidratar"),
            conduta("≥ 5 anos: SF 0,9% 30 mL/kg em 30 min + Ringer lactato 70 mL/kg em 2 h 30 min"),
            conduta("Depois: manutenção (Holliday-Segar, SG 5% + SF 0,9% 4:1, KCl 10% 2 mL/100 mL) + reposição (SG 5% + SF 0,9% 1:1, 50 mL/kg/dia); iniciar SRO assim que possível")
          )
        ),
      ],
    },
    {
      titulo: "Diarreia crônica (> 4 semanas)",
      passos: [
        cenario("Diarreia por mais de 4 semanas"),
        decisao(
          "Sinais de alarme? (idade > 50 anos, sangue, perda de peso, anemia, febre, diarreia noturna, história familiar de câncer colorretal ou DII)",
          ramo("Sim", conduta("Colonoscopia com biópsias e investigação dirigida")),
          ramo(
            "Não",
            avaliar("Hemograma, PCR, TSH, sorologia para doença celíaca (antitransglutaminase IgA + IgA total), parasitológico, calprotectina fecal"),
            decisao(
              "Padrão",
              ramo("Inflamatória (calprotectina alta, sangue)", conduta("Pensar em DII, colite infecciosa, colite microscópica: colonoscopia")),
              ramo("Gordurosa (esteatorreia)", conduta("Pensar em má absorção (celíaca) ou insuficiência pancreática")),
              ramo("Aquosa sem alarme", conduta("Pensar em síndrome do intestino irritável (critérios de Roma IV), medicamentos, lactose"))
            )
          )
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Avaliação do estado de hidratação (MS)",
      colunas: ["Sinal", "Sem desidratação", "Alguma desidratação", "Desidratação grave"],
      linhas: [
        ["Estado geral", "Bem alerta", "Irritado, intranquilo", "Comatoso, hipotônico*"],
        ["Olhos", "Normais", "Fundos", "Muito fundos e secos"],
        ["Lágrimas", "Presentes", "Ausentes", "Ausentes"],
        ["Sede", "Bebe normalmente", "Sedento, bebe rápido e avidamente", "Bebe mal ou não é capaz de beber*"],
        ["Sinal da prega", "Desaparece rapidamente", "Desaparece lentamente", "Desaparece muito lentamente (> 2 s)"],
        ["Pulso", "Cheio", "Rápido, fraco", "Muito fraco ou ausente*"],
        ["Enchimento capilar", "Normal (até 3 s)", "Prejudicado (3 a 5 s)", "Muito prejudicado (> 5 s)*"],
        ["Conclusão", "Plano A", "≥ 2 sinais: Plano B", "≥ 2 sinais, sendo ≥ 1 com *: Plano C"],
      ],
    },
  ],
  oQueCai: [
    "Plano B: SRO 50 a 100 mL/kg em 4 a 6 h.",
    "Plano C < 5 anos: SF 20 mL/kg em 30 min; ≥ 5 anos: SF 30 mL/kg em 30 min + RL 70 mL/kg em 2 h 30.",
    "Zinco 10 mg (< 6 meses) ou 20 mg (≥ 6 meses) por 10 a 14 dias.",
    "Diarreia crônica: > 4 semanas; calprotectina separa inflamatória de funcional.",
  ],
  pegadinhas: [
    "\"Suspender a alimentação na diarreia\" (manter alimentação e aleitamento).",
    "\"Antidiarreico para criança\" (não usar).",
    "\"Antibiótico para toda diarreia com febre\" (não: disenteria com comprometimento, cólera ou imunossupressão).",
  ],
};

export const OBESIDADE: Tema = {
  id: "obesidade",
  titulo: "Obesidade no adulto",
  fonte: {
    titulo: "Ministério da Saúde/Conitec. PCDT de Sobrepeso e Obesidade em Adultos (2020) e diretrizes da ABESO.",
    url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/protocolos-clinicos-e-diretrizes-terapeuticas",
    nota: "Medicamentos disponíveis variam entre o SUS e a rede privada; confira a bula e a aprovação da Anvisa.",
  },
  revisar: [
    "IMC ≥ 30 kg/m² é obesidade; associar circunferência abdominal e comorbidades à avaliação.",
    "Mudança de estilo de vida é a base de qualquer tratamento.",
  ],
  algoritmos: [
    {
      titulo: "Tratamento da obesidade",
      passos: [
        cenario("Adulto com IMC ≥ 25 kg/m²"),
        avaliar("Comorbidades (diabetes, hipertensão, dislipidemia, apneia do sono, esteatose), circunferência abdominal, causas secundárias e medicamentos que engordam"),
        conduta("Plano alimentar com déficit calórico, atividade física (150 a 300 min/semana), sono e abordagem comportamental"),
        decisao(
          "IMC ≥ 30, ou ≥ 27 com comorbidade, sem resposta adequada à mudança de estilo de vida?",
          ramo("Não", avaliar("Manter acompanhamento e metas de perda de 5 a 10% do peso")),
          ramo("Sim", conduta("Considerar farmacoterapia: agonistas de GLP-1 (liraglutida, semaglutida), tirzepatida, orlistate ou sibutramina, conforme perfil e contraindicações"))
        ),
        decisao(
          "IMC ≥ 40, ou ≥ 35 com comorbidade, após falha do tratamento clínico?",
          ramo("Sim", conduta("Avaliar cirurgia bariátrica com equipe multiprofissional (ver tema Cirurgia bariátrica)")),
          ramo("Não", avaliar("Seguir com tratamento clínico"))
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Classificação pelo IMC (adulto)",
      colunas: ["IMC (kg/m²)", "Classificação"],
      linhas: [
        ["18,5 a 24,9", "Eutrofia"],
        ["25 a 29,9", "Sobrepeso"],
        ["30 a 34,9", "Obesidade grau I"],
        ["35 a 39,9", "Obesidade grau II"],
        ["≥ 40", "Obesidade grau III"],
      ],
    },
    {
      titulo: "Circunferência abdominal (risco metabólico)",
      colunas: ["Sexo", "Risco aumentado", "Risco muito aumentado"],
      linhas: [
        ["Homem", "≥ 94 cm", "≥ 102 cm"],
        ["Mulher", "≥ 80 cm", "≥ 88 cm"],
      ],
    },
  ],
  oQueCai: [
    "Farmacoterapia: IMC ≥ 30 ou ≥ 27 com comorbidade.",
    "Cirurgia: IMC ≥ 40 ou ≥ 35 com comorbidade.",
    "Perda de 5 a 10% do peso já melhora comorbidades.",
  ],
  pegadinhas: [
    "\"IMC sozinho define o risco\" (avaliar também circunferência abdominal e comorbidades).",
    "\"Sibutramina para cardiopata\" (contraindicada em doença cardiovascular).",
  ],
};

export const FIBROMIALGIA: Tema = {
  id: "fibromialgia",
  titulo: "Fibromialgia",
  fonte: {
    titulo: "Wolfe F, et al. 2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria (Semin Arthritis Rheum, 2016) e recomendações EULAR revisadas (Ann Rheum Dis, 2017).",
    url: "https://doi.org/10.1136/annrheumdis-2016-209724",
  },
  revisar: [
    "Diagnóstico é clínico (critérios de 2016) e pode coexistir com outras doenças.",
    "Exercício físico é a intervenção com melhor evidência.",
  ],
  algoritmos: [
    {
      titulo: "Diagnóstico e tratamento",
      passos: [
        cenario("Dor difusa crônica com fadiga, sono não reparador e sintomas cognitivos"),
        avaliar("Critérios 2016: WPI ≥ 7 e SSS ≥ 5, ou WPI 4 a 6 e SSS ≥ 9; dor generalizada (≥ 4 de 5 regiões); sintomas há ≥ 3 meses"),
        avaliar("Exames básicos para diferenciais: hemograma, VHS/PCR, TSH, CPK, função hepática e renal (sem pedir autoanticorpos sem clínica)"),
        conduta("Educação sobre a doença e exercício aeróbico e de fortalecimento progressivos"),
        conduta("Associar conforme o perfil: TCC (humor, sono), terapias meditativas, hidroterapia"),
        decisao(
          "Sintomas predominantes",
          ramo("Dor com sono ruim", conduta("Amitriptilina em dose baixa à noite ou ciclobenzaprina")),
          ramo("Dor com depressão ou ansiedade", conduta("Duloxetina ou milnaciprana")),
          ramo("Dor intensa com sono ruim", conduta("Pregabalina"))
        ),
        atencao("Opioides fortes, AINEs crônicos e corticoides não são recomendados"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Critérios diagnósticos de 2016",
      colunas: ["Componente", "Descrição"],
      linhas: [
        ["WPI (índice de dor generalizada)", "Número de áreas dolorosas na última semana (0 a 19)"],
        ["SSS (gravidade dos sintomas)", "Fadiga, sono não reparador e sintomas cognitivos (0 a 3 cada) + cefaleia, dor abdominal e depressão (0 a 1 cada); total 0 a 12"],
        ["Critério", "WPI ≥ 7 e SSS ≥ 5, ou WPI 4 a 6 e SSS ≥ 9; dor em ≥ 4 de 5 regiões; ≥ 3 meses"],
      ],
    },
  ],
  oQueCai: [
    "Não há mais pontos dolorosos (tender points) nos critérios atuais.",
    "Exercício é a principal intervenção.",
    "Fármacos: amitriptilina, ciclobenzaprina, duloxetina, pregabalina.",
  ],
  pegadinhas: [
    "\"Diagnóstico de exclusão\" (é clínico e pode coexistir com outras doenças reumáticas).",
    "\"Opioide para dor refratária\" (não recomendado).",
  ],
};

export const VITAMINAS: Tema = {
  id: "reposicao-vitaminas",
  titulo: "Reposição de vitaminas e ferro",
  fonte: {
    titulo: "Posicionamento SBEM/SBPC (vitamina D, 2020), Programa Nacional de Suplementação de Ferro (MS) e diretrizes de anemias carenciais.",
    url: "https://www.gov.br/conitec/pt-br/assuntos/avaliacao-de-tecnologias-em-saude/protocolos-clinicos-e-diretrizes-terapeuticas",
    nota: "Doses usuais para adultos; individualizar em gestantes, crianças, renais crônicos e pós-bariátricos.",
  },
  revisar: [
    "Vitamina D: não rastrear a população geral; dosar em grupos de risco.",
    "Tiamina antes de glicose em etilistas ou desnutridos (prevenção de Wernicke).",
    "Ferro oral em dias alternados é tão eficaz quanto diário e com menos efeitos adversos.",
  ],
  quadros: [
    {
      titulo: "Deficiências e reposição (adulto)",
      colunas: ["Nutriente", "Quando pensar", "Reposição usual", "Observações"],
      linhas: [
        ["Vitamina D", "Idosos, osteoporose, má absorção, pós-bariátrica, doença renal, uso de anticonvulsivantes ou corticoide", "25(OH)D < 20 ng/mL: 50.000 UI/semana por 8 semanas (ou 7.000 UI/dia), depois manutenção 1.000 a 2.000 UI/dia", "Alvo > 20 ng/mL na população geral e 30 a 60 ng/mL nos grupos de risco; toxicidade > 100 ng/mL"],
        ["Vitamina B12", "Anemia macrocítica, neuropatia, metformina, IBP crônico, gastrectomia ou bariátrica, vegetarianos, idosos", "Cianocobalamina 1.000 mcg IM (ataque diário ou semanal, depois mensal) ou 1.000 a 2.000 mcg/dia VO", "Sintomas neurológicos: preferir IM; dosar ácido metilmalônico se B12 limítrofe"],
        ["Ácido fólico", "Anemia macrocítica, etilismo, gestação, uso de metotrexato", "5 mg/dia por 4 meses (deficiência)", "Gestação: 0,4 mg/dia desde antes da concepção até 12 semanas; corrigir B12 antes ou junto"],
        ["Ferro", "Anemia ferropriva (ferritina baixa), perdas, gestação", "Sulfato ferroso 40 a 120 mg de ferro elementar/dia ou em dias alternados, por 3 meses após normalizar a hemoglobina", "EV se intolerância, má absorção, pós-bariátrica, DII ativa ou necessidade de reposição rápida"],
        ["Tiamina (B1)", "Etilismo, desnutrição, hiperêmese, pós-bariátrica com vômitos", "Suspeita de Wernicke: 200 a 500 mg IV 8/8 h; profilaxia 100 mg/dia", "Dar antes da glicose"],
      ],
    },
  ],
  oQueCai: [
    "Vitamina D < 20 ng/mL: 50.000 UI/semana por 8 semanas.",
    "B12 com sintoma neurológico: via IM.",
    "Ácido fólico na gestação: 0,4 mg/dia; deficiência: 5 mg/dia.",
    "Tiamina antes da glicose.",
  ],
  pegadinhas: [
    "\"Repor folato sem checar B12\" (pode mascarar a anemia e piorar a lesão neurológica).",
    "\"Ferro oral não serve após bariátrica\" (pode servir, mas absorção é menor: considerar EV).",
    "\"Dosar vitamina D em todos\" (rastrear só grupos de risco).",
  ],
};

export const PROTOCOLOS_CLINICA = [SEPSE, AVC, IAM, ASMA, HIPERTENSAO, DIARREIA, OBESIDADE, INSONIA, FIBROMIALGIA, DOR_CRONICA, VITAMINAS];
