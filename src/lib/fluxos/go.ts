import { atencao, avaliar, cenario, conduta, decisao, ramo, type AreaFluxos } from "./tipos.ts";

export const GO: AreaFluxos = {
  id: "go",
  nome: "Ginecologia e Obstetrícia",
  temas: [
    {
      id: "rastreamento-cervical",
      titulo: "Lesões e rastreamento cervical",
      questoes: 8,
      quadros: [
        {
          titulo: "Rastreamento cervical: citologia primária × DNA-HPV primário",
          colunas: ["", "Citologia primária (diretriz de 2016)", "DNA-HPV primário (diretriz de 2025)"],
          linhas: [
            ["Início", "25 anos, só em quem já iniciou atividade sexual", "25 anos (população-alvo de 25 a 64)"],
            ["Intervalo com exame normal", "Anual 2 vezes; se normais, a cada 3 anos", "5 anos após negativo"],
            ["Vai direto à colposcopia", "ASC-H, HSIL e AGC", "HPV 16 e/ou 18"],
            ["Resultado intermediário", "ASC-US: repetir em 6 meses (30 anos ou mais) ou 12 meses (25 a 29). LSIL, 25 anos ou mais: repetir em 6 meses. Menos de 25 anos, ASC-US ou LSIL: repetir em 3 anos. Alteração mantida: colposcopia", "Outros tipos oncogênicos: citologia reflexa na mesma amostra. ASC-US ou mais: colposcopia. Normal: DNA-HPV em 1 ano"],
            ["Papel da citologia", "Teste de rastreio", "Exame de triagem (reflexa)"],
            ["Imunossuprimida", "Começa após o início da vida sexual; semestral no 1º ano, depois anual. HIV com CD4 < 200: semestral", "Começa após o início da atividade sexual; a cada 3 anos; qualquer tipo positivo vai à colposcopia"],
          ],
        },
        {
          titulo: "Citologia alterada (citologia primária, 2016): repetir ou colposcopia",
          colunas: ["Citologia de rastreio", "< 25 anos", "25–29 anos", "≥ 30 anos"],
          linhas: [
            ["ASC-US", "Repetir em 3 anos", "Repetir em 12 meses", "Repetir em 6 meses"],
            ["LSIL", "Repetir em 3 anos", "Repetir em 6 meses", "Repetir em 6 meses"],
            ["ASC-H / HSIL / AGC", "Colposcopia", "Colposcopia", "Colposcopia"],
            ["Controle", "2 citologias normais → rastreio trienal", "Alteração mantida → colposcopia", "Alteração mantida → colposcopia"],
          ],
        },
      ],
      oQueCai: [
        "Citologia: início 25 anos (se já iniciou vida sexual); anual 2 vezes, se normais a cada 3 anos",
        "DNA-HPV (2025): 25 a 64 anos; negativo → 5 anos; encerra com teste negativo acima dos 60; citologia vira reflexa",
        "DNA-HPV: ASC-US ou mais em HPV positivo → colposcopia; amostra por médico, enfermagem ou autocoleta",
        "AGC → colposcopia + canal endocervical; ≥ 35 anos (ou sangramento anormal) → somar endométrio",
        "Imunossuprimida: após início da vida sexual; citologia semestral no 1º ano, depois anual; DNA-HPV a cada 3 anos",
        "HIV com CD4 < 200: citologia semestral. Histerectomia total benigna sem lesão alto grau: não rastrear",
        "Vasos atípicos = invasão → biópsia; mosaico/pontilhado grosseiro e acetobranco denso = alto grau; iodo negativo inespecífico",
        "NIC 3 = EZT/CAF ou conização (mesmo jovem nuligesta); HPV 16 e 18 iniciam, tabagismo promove; mais comum: espinocelular",
      ],
      pegadinhas: [
        "Início aos 21 anos, 'logo após a sexarca' ou 'aos 30 com DNA-HPV': nenhum é a regra brasileira",
        "AGC: repetir citologia ou pedir captura híbrida está errado; vai à colposcopia",
        "NIC 3: observar ou crioterapia ('não precisa histologia') está errado; excisão dá a peça",
        "Schiller positivo = iodo negativo (área que não cora); gestante não antecipa nem adia rastreio",
      ],
    },
    {
      id: "sindromes-hipertensivas",
      titulo: "Síndromes hipertensivas da gestação",
      questoes: 7,
      algoritmos: [
        {
          titulo: "Hipertensão na gestação: qual das cinco síndromes",
          passos: [
            cenario("Gestante com PA ≥ 140 e/ou 90"),
            avaliar("Idade gestacional em que a hipertensão foi identificada: divisor em 20 semanas (RBEHG 2023)"),
            avaliar("Proteinúria significativa (RBEHG 2023): 300 mg/24 h, relação proteína/creatinina ≥ 0,3 ou fita com ao menos duas cruzes"),
            decisao(
              "Hipertensão identificada antes de 20 semanas?",
              ramo(
                "Sim: hipertensa crônica",
                decisao(
                  "Após 20 semanas, surgiu um destes (RBEHG 2025): proteinúria nova ou acima de 3 vezes a inicial; disfunção de órgão-alvo; disfunção uteroplacentária?",
                  ramo("Sim", conduta("Pré-eclâmpsia sobreposta")),
                  ramo("Não", conduta("Hipertensão crônica"))
                )
              ),
              ramo(
                "Não: surgiu após 20 semanas",
                decisao(
                  "Proteinúria ou disfunção de órgão-alvo?",
                  ramo("Sim, uma ou outra", conduta("Pré-eclâmpsia (pode existir sem proteinúria)")),
                  ramo("Não, só pressão alta", conduta("Hipertensão gestacional"))
                )
              )
            ),
            atencao("Precisar aumentar anti-hipertensivo: critério de sobreposta no protocolo de 2023; no de 2025 é sinal de alerta, não fecha sozinho"),
            atencao("Convulsão sobre qualquer das formas = eclâmpsia"),
            conduta("Hipertensão surgida após 20 semanas que não some até 12 semanas após o parto: reclassificar como crônica"),
          ],
        },
        {
          titulo: "Pré-eclâmpsia com gravidade (1): sulfato de magnésio e pressão",
          passos: [
            cenario("Pré-eclâmpsia com iminência de eclâmpsia, eclâmpsia, HELLP ou deterioração clínica ou laboratorial"),
            conduta("Sulfato de magnésio: previne e trata convulsão; não é anti-hipertensivo"),
            decisao(
              "Qual esquema? Igual eficácia (RBEHG 2025); não se misturam. Doses: RBEHG 2023",
              ramo("Zuspan (EV)", conduta("Ataque 4 g EV; manutenção 1 g/h EV")),
              ramo("Pritchard (EV + IM)", conduta("Ataque 4 g EV + 10 g IM; manutenção 5 g IM a cada 4 h"))
            ),
            avaliar("Vigiar intoxicação: reflexo patelar, frequência respiratória (< 16) e diurese (< 25 mL/h). Antídoto: gluconato de cálcio 1 g EV lento"),
            conduta("Se PA ≥ 160 e/ou 110 persistir após 15 minutos: hidralazina 5 mg EV ou nifedipino 10 mg VO, a cada 20 minutos, até 30 mg (RBEHG 2023)"),
            atencao("Manter o magnésio por 24 h após o parto ou a última convulsão. Convulsão que recorre: mais 2 g EV em bolus (RBEHG 2025)"),
            atencao("Insuficiência renal: manutenção do magnésio pela metade"),
          ],
        },
        {
          titulo: "Pré-eclâmpsia com gravidade (2): depois de estabilizar, quando resolver",
          passos: [
            cenario("Pré-eclâmpsia com gravidade, já com magnésio e pressão controlada"),
            decisao(
              "Estabilizada: qual a idade gestacional?",
              ramo("37 semanas ou mais", conduta("Resolver a gestação")),
              ramo(
                "Menos de 37 semanas",
                decisao(
                  "Mãe e feto estáveis?",
                  ramo("Sim", conduta("Conduta expectante, só até 37 semanas (RBEHG 2025)")),
                  ramo("Não: deterioração materna ou fetal", conduta("Antecipar o parto, em qualquer idade gestacional"))
                )
              )
            ),
            atencao("A via de parto é obstétrica; cesariana não é automática"),
          ],
        },
      ],
      quadros: [
        {
          titulo: "Dois cortes para o mesmo exame: definição de pré-eclâmpsia × HELLP",
          colunas: ["Exame", "Lesão de órgão-alvo que define pré-eclâmpsia", "HELLP"],
          linhas: [
            ["Plaquetas", "< 150 mil", "< 100.000/mm³"],
            ["Transaminases", "> 40 UI/L", "TGO ou TGP > 70 UI/L (ou 2 vezes o limite do laboratório)"],
            ["Hemólise", "Não entra na lista", "DHL > 600 UI/L (ou 2 vezes o limite do laboratório); bilirrubina indireta ≥ 1,0 mg/dL; esquizócitos no sangue periférico"],
            ["Creatinina", "A partir de 1,0 mg/dL", "Não compõe a sigla"],
            ["Diurese", "Oligúria: < 500 mL/24 h", "Não compõe a sigla"],
          ],
        },
      ],
      oQueCai: [
        "PA ≥ 140 e/ou 90; divisor 20 semanas; não some até 12 semanas pós-parto = crônica",
        "Proteinúria: 300 mg/24 h ou proteína/creatinina ≥ 0,3; fita: ao menos duas cruzes (2023). Edema e proteinúria > 5 g não são critério",
        "Definição (2023): creatinina ≥ 1,0 mg/dL, transaminases > 40 UI/L, plaquetas < 150 mil; oligúria < 500 mL/24 h",
        "HELLP: DHL > 600, BI ≥ 1,0, TGO/TGP > 70, plaquetas < 100 mil; esquizócitos. PA grave ≥ 160/110",
        "MgSO₄ Zuspan 4 g EV + 1 g/h; Pritchard 4 g EV + 10 g IM, depois 5 g IM 4/4 h; manter 24 h após parto/última convulsão",
        "Intoxicação: reflexo patelar, FR < 16, diurese < 25 mL/h; antídoto gluconato de cálcio 1 g EV lento; IR: manutenção pela metade",
        "Crise (≥ 160/110 por 15 min): hidralazina 5 mg EV ou nifedipino 10 mg VO a cada 20 min, até 30 mg; refratária: nitroprussiato",
        "Parto: ≥ 37 semanas resolver; antes, expectante só se mãe e feto estáveis. Manutenção: metildopa; alvo diastólica ~85 mmHg",
      ],
      pegadinhas: [
        "MgSO₄ não é anti-hipertensivo; estabilizar antes, cesariana não é automática",
        "Cefaleia + epigastralgia com exames normais = iminência de eclâmpsia, não HELLP",
        "IECA/BRA na gestante, nifedipino sublingual ou normalizar para 120/80: errado",
        "PA alta às 12 sem + proteinúria às 28 = pré-eclâmpsia sobreposta (não escolha só uma)",
      ],
    },
    {
      id: "vulvovaginites",
      titulo: "Vulvovaginites",
      questoes: 6,
      quadros: [
        {
          titulo: "As três causas da mulher adulta",
          colunas: ["", "Candidíase", "Vaginose", "Tricomoníase"],
          linhas: [
            ["pH", "≤ 4,5", "> 4,5", "> 4,5"],
            ["Clínica", "Prurido; branco grumoso ('leite talhado'), sem odor", "Odor de peixe; acinzentado homogêneo; sem colpite", "Amarelo-esverdeado bolhoso; colpite"],
            ["Microscopia", "Pseudo-hifas", "Clue cells", "Protozoário flagelado móvel"],
            ["Tratamento", "Fluconazol 150 mg dose única; miconazol 2% 7 noites; nistatina 100.000 UI 14 noites", "Metronidazol 500 mg 12/12 h 7 dias ou gel vaginal 5 noites", "Metronidazol oral 7 dias ou 2 g dose única"],
            ["Parceria", "Não (salvo sintomática)", "Não de rotina; discutir na recorrente", "Trata (é IST)"],
          ],
        },
      ],
      oQueCai: [
        "Amsel = 3 de 4: corrimento homogêneo, pH > 4,5, aminas positivo, clue cells",
        "Metronidazol 2 g dose única (5 cp de 400 mg): só tricomoníase. Vaginose 2ª opção: clindamicina 300 mg 12/12 h, 7 dias",
        "Candidíase recorrente = ≥ 4 episódios/ano: fluconazol 150 mg dias 1, 4 e 7, depois 1 vez/semana por 6 meses",
        "C. albicans 80–92%; cultura só em recorrente, refratário ou atípico. Gestante: só antifúngico vaginal",
        "Criança: inespecífica (~75%) → higiene, banho de assento, afastar irritantes; sem antibiótico sistêmico",
      ],
      pegadinhas: [
        "Candidíase com pH alcalino (> 4,5 ou > 5): sempre falso",
        "'Presença de colpite' não é critério de Amsel: vaginose não inflama",
        "Tricomoníase com prurido não pede antifúngico; creme vaginal isolado não erradica",
        "Metronidazol 2 g dose única para vaginose: errado; cândida não é principal causa na criança",
      ],
    },
    {
      id: "diabetes-gestacao",
      titulo: "Diabetes na gestação",
      questoes: 5,
      algoritmos: [
        {
          titulo: "Hiperglicemia na gestação: do jejum da primeira consulta ao TOTG",
          passos: [
            cenario("Gestante na primeira consulta de pré-natal, ainda sem diagnóstico de diabetes"),
            avaliar("Glicemia de jejum em toda gestante, já na primeira consulta"),
            decisao(
              "Glicemia de jejum",
              ramo(
                "< 92",
                conduta("Normal por enquanto: TOTG 75 g entre 24 e 28 semanas"),
                avaliar("TOTG 75 g: cortes de jejum 92, 1 h 180, 2 h 153"),
                decisao(
                  "Resultado do TOTG 75 g",
                  ramo("Um valor alterado: jejum 92–125, 1 h ≥ 180 ou 2 h 153–199", conduta("DMG: um valor basta")),
                  ramo("2 h ≥ 200", conduta("Diabetes diagnosticado na gestação")),
                  ramo("Nenhum valor alterado", conduta("Sem critério de DMG neste teste"))
                )
              ),
              ramo("92 a 125", conduta("DMG, em qualquer momento da gestação")),
              ramo("≥ 126", conduta("Diabetes diagnosticado na gestação: tratado como diabetes prévio"))
            ),
            atencao("O valor de 1 h (180) só diagnostica DMG: não existe corte de 1 h para diabetes prévio"),
          ],
        },
      ],
      oQueCai: [
        "Jejum na 1ª consulta: 92 a 125 = DMG; < 92 → TOTG 75 g entre 24 e 28 semanas",
        "TOTG 75 g: jejum 92, 1 h 180, 2 h 153; um valor alterado fecha DMG",
        "Diabetes diagnosticado na gestação: jejum ≥ 126, 2 h ≥ 200 ou HbA1c ≥ 6,5%; ao acaso ≥ 200 só com sintomas",
        "Insulina no DMG: após 7–14 dias de dieta, 30% a 50% das medidas (ou ≥ 2) acima da meta",
        "Critério fetal: circunferência abdominal ≥ p75 entre 29 e 33 semanas (pode ser considerado)",
        "DM2 em comprimido → insulina; metformina se insulina inviável; glibenclamida não recomendada",
        "Pós-parto do DMG: suspender toda insulina; TOTG 75 g ~6 semanas após o parto",
      ],
      pegadinhas: [
        "'Só quem tem jejum > 92 faz TOTG': inverte o fluxo",
        "1 h ≥ 180 não é critério de diabetes prévio: só diagnostica DMG",
        "Malformação é do diabetes prévio mal controlado, não do DMG; insulina não é teratogênica",
        "DMG no pós-parto: reduzir insulina pela metade ou trocar por oral está errado",
      ],
    },
    {
      id: "contracepcao",
      titulo: "Contracepção",
      questoes: 4,
      quadros: [
        {
          titulo: "Métodos combinados: categorias da OMS (iniciar × continuar)",
          colunas: ["Condição (pílula combinada)", "Categoria (OMS, 5ª ed.)"],
          linhas: [
            ["Enxaqueca com aura, qualquer idade", "4 para iniciar e 4 para continuar"],
            ["Enxaqueca sem aura, menos de 35 anos", "2 para iniciar; 3 para continuar"],
            ["Enxaqueca sem aura, 35 anos ou mais", "3 para iniciar; 4 para continuar"],
            ["Fumante com 35 anos ou mais, ≥ 15 cigarros/dia", "4"],
            ["Fumante com 35 anos ou mais, menos de 15 cigarros/dia", "3"],
            ["PA ≥ 160/100", "4"],
            ["Lactante, menos de 6 semanas de pós-parto", "4"],
            ["Não lactante, menos de 21 dias, sem outro fator de risco para trombose", "3"],
            ["Não lactante, menos de 21 dias, com fator de risco para trombose", "4"],
            ["Trombose venosa: antecedente, aguda ou em anticoagulação", "4"],
            ["Lúpus com antifosfolípide positivo", "4"],
            ["Diabetes com nefropatia, retinopatia ou neuropatia, ou com mais de 20 anos de doença", "3 ou 4, conforme a gravidade"],
          ],
        },
        {
          titulo: "Categorias OMS: estrogênio × progestagênio × cobre",
          colunas: ["Condição", "Combinado", "Progestagênio isolado (pílula, injetável trimestral, implante, DIU-LNG)", "DIU de cobre"],
          linhas: [
            ["Lúpus com antifosfolípide positivo/desconhecido", "4", "3", "1"],
            ["Trombose venosa aguda", "4", "3", "1"],
            ["Antecedente de trombose venosa", "4", "2", "1"],
            ["Câncer de mama atual", "4", "4", "1"],
            ["Indutor enzimático", "3", "Pílula 3; implante 2; trimestral e DIU-LNG 1", "1"],
          ],
        },
      ],
      oQueCai: [
        "DIU pós-parto: até 10 min da dequitação ou até 48 h (vaginal ou cesárea); 48 h a 4 semanas = categoria 3; sepse puerperal = 4",
        "Lei 14.443/2022 (laqueadura/vasectomia): > 21 anos OU 2 filhos vivos; 60 dias de prazo; sem consentimento do cônjuge; no parto, se cumpridos os 60 dias",
        "Combinado categoria 4: fumante ≥ 35 anos com ≥ 15 cig/dia (< 15 = 3); PA ≥ 160/100; enxaqueca com aura em qualquer idade",
        "Enxaqueca sem aura: < 35 anos 2 iniciar / 3 continuar; ≥ 35 anos 3 iniciar / 4 continuar",
        "Puerpério: lactante < 6 semanas = 4; não lactante < 21 dias = 3 (4 se outro fator de risco para trombose)",
        "Câncer de mama passado, sem doença há 5 anos = 3 para hormonais. DIU-LNG bloqueia ovulação em só 20–25% dos ciclos",
        "DIU e DIP: risco nas primeiras semanas após inserção; com DIP: antibiótico, DIU pode ficar, reavaliar em 48–72 h",
      ],
      pegadinhas: [
        "Maior expulsão do DIU pós-parto não é proibição; vale para cesárea e parto vaginal",
        "'Vedada no parto, exceto cesarianas sucessivas' é a regra antiga (1996)",
        "DIU hormonal não é categoria 1 no lúpus AFL+ ('ação só local'); pílula 'de baixa dose' não é 2",
        "DIU de cobre para tratar sangramento aumentado: errado; não estenda a proibição do estrogênio aos progestagênios",
      ],
    },
    {
      id: "endometriose",
      titulo: "Endometriose",
      questoes: 4,
      algoritmos: [
        {
          titulo: "Endometriose: reconhecer e tratar a dor",
          passos: [
            cenario("Dismenorreia, dor pélvica crônica, dispareunia, infertilidade"),
            avaliar("Sintoma que volta na mesma fase do mês (inclusive intestinal) = endometriose; diferencial de Crohn"),
            conduta("Suspeita clínica + dor: tratamento empírico, sem laparoscopia"),
            conduta("Progestagênio, contraceptivo combinado ou análogo de GnRH"),
            atencao("AINE alivia dor, não regride lesão. Inibidor de aromatase não é 1ª linha (perda óssea). Histerectomia não é inicial"),
          ],
        },
      ],
      oQueCai: [
        "Endometriose = tecido semelhante ao endométrio fora do útero (peritônio, ovário, intestino)",
        "Adenomiose = endométrio dentro do miométrio; mioma = tumor de músculo",
        "Objetivo do hormônio: bloquear ovulação, atrofiar implantes, reduzir inflamação",
        "Na menorragia e na endometriose, troca-se DIU de cobre por hormônio",
      ],
      pegadinhas: [
        "Adenomiose oferecida para implantes peritoneais",
        "Outra doença intestinal quando a pista é a periodicidade mensal",
        "Laparoscopia com histologia obrigatória antes de qualquer hormônio: falso",
      ],
    },
    {
      id: "hemorragia-segunda-metade",
      titulo: "Hemorragia da segunda metade",
      questoes: 4,
      quadros: [
        {
          titulo: "Sangramento da segunda metade: quatro causas",
          colunas: ["", "Dor / tônus", "Sangue / feto", "Conduta"],
          linhas: [
            ["DPP", "Dor; hipertonia (útero de pedra)", "Materno, escuro, pode ser oculto; feto sofre cedo", "Sofrimento e parto longe: cesárea imediata; parto iminente: amniotomia"],
            ["Placenta prévia", "Indolor; tônus normal", "Materno, vermelho vivo; feto bem", "Estável: cesárea entre 36 e 37 sem e 6d"],
            ["Rotura uterina", "Dor, depois alivia; contrações param", "Materno; feto sofre de súbito; apresentação sobe", "Consumada: laparotomia imediata; iminência: parar ocitocina + cesárea"],
            ["Vasa prévia", "Sem dor; tônus normal", "Fetal, logo após rotura das membranas", "Rompeu: cesárea de emergência"],
          ],
        },
      ],
      oQueCai: [
        "DPP: diagnóstico clínico (dor súbita + hipertonia + BCF alterado); USG normal não exclui; risco: hipertensão, cocaína, trauma",
        "DPP feto morto: vaginal só com mãe estável, sangramento controlado e parto rápido; senão cesárea. Tocolítico não",
        "Prévia: não tocar antes de excluir por USG; borda < 2 cm sem cobrir = inserção baixa",
        "Acretismo na prévia por cesáreas anteriores: 0 = 3%, 1 = 11%, 2 = 40%, 3 = 61%, ≥ 4 = 67%",
        "Bandl-Frommel = iminência de rotura; Reasens, Clark, Laffont = consumada",
        "Cesárea anterior + colo desfavorável: indução mecânica (Foley/Krause); misoprostol contraindicado",
        "Vasa prévia no pré-natal: cesárea programada entre 34 e 37 semanas; CTG pode ser sinusoidal",
      ],
      pegadinhas: [
        "USG 'para confirmar' DPP sem sangramento externo, ou tocolítico/corticoide com feto em sofrimento",
        "Couvelaire é do DPP, não da prévia; prévia não se marca para 39 semanas",
        "40% de acretismo = terceira cesárea (duas anteriores), não três anteriores",
        "Vasa prévia: sangue é fetal, mãe estável; amniotomia é gatilho, não tratamento",
      ],
    },
    {
      id: "sangramento-uterino",
      titulo: "Sangramento uterino anormal",
      questoes: 4,
      quadros: [
        {
          titulo: "Miomas: classificação FIGO",
          colunas: ["Tipo", "Descrição", "Grupo"],
          linhas: [
            ["0", "Pediculado na cavidade", "Submucoso"],
            ["1/2", "< 50% / ≥ 50% intramural", "Submucoso"],
            ["3/4", "100% intramural tocando / sem tocar o endométrio", "Intramural"],
            ["5/6", "≥ 50% / < 50% intramural", "Subseroso"],
            ["7", "Subseroso pediculado", "Subseroso"],
            ["8", "Outros (cervical, parasita)", "Outros"],
          ],
        },
      ],
      oQueCai: [
        "PALM (estrutural): Pólipo, Adenomiose, Leiomioma, Malignidade/hiperplasia",
        "COEIN (não estrutural): Coagulopatia, Ovulatória, Endometrial, Iatrogênica, Não classificada",
        "Adolescente com fluxo intenso desde a menarca: von Willebrand. Mioma que sangra é o submucoso",
        "Pós-menopausa: endométrio > 4 mm com sangramento → histeroscopia com biópsia (excluir câncer de endométrio)",
        "Endométrio espesso + sangramento: hipótese inicial hiperplasia; quem confirma é a histologia",
      ],
      pegadinhas: [
        "Pólipo em COEIN ('crescimento funcional'); culpar mioma subseroso pelo sangramento",
        "'50% ou mais intramural' sozinho serve ao tipo 2 e ao 5: só vale se disser subseroso",
        "Pós-menopausa: USG trimestral ou progestagênio antes do diagnóstico está errado",
      ],
    },
    {
      id: "amenorreia",
      titulo: "Amenorreia",
      questoes: 3,
      quadros: [
        {
          titulo: "Primária: útero, mamas e pelos",
          colunas: ["", "Cariótipo / gônada", "Útero", "Mamas / pelos"],
          linhas: [
            ["Rokitansky", "46,XX / ovário normal", "Ausente", "Sim / normais"],
            ["Morris", "46,XY / testículo", "Ausente", "Sim / escassos"],
            ["Swyer", "46,XY / em fita", "Presente", "Não / presentes"],
            ["Savage", "46,XX / ovário resistente", "Presente", "Variável / normais"],
          ],
        },
      ],
      algoritmos: [
        {
          titulo: "Amenorreia secundária: sequência de testes",
          passos: [
            cenario("Amenorreia secundária"),
            decisao(
              "Teste da progesterona: sangra?",
              ramo("Sim", conduta("Há estrogênio: anovulação (ex.: ovários policísticos)")),
              ramo(
                "Não",
                avaliar("Falta estrogênio ou via obstruída → estrogênio + progesterona"),
                conduta("Sangrou: útero e via de saída normais; problema acima"),
                decisao(
                  "FSH?",
                  ramo("Alto", conduta("Ovário. < 40 anos + FSH e LH altos = insuficiência ovariana prematura")),
                  ramo("Baixo ou normal", conduta("Causa central: hipotálamo/hipófise"))
                )
              )
            ),
          ],
        },
      ],
      oQueCai: [
        "Sem útero e com mama: Rokitansky (46,XX, pelos normais) × Morris (46,XY, pelos escassos)",
        "Morris: testosterona aromatiza → mama; antimülleriano do testículo apaga o útero; vagina em fundo cego",
        "Rokitansky: investigar rim e coluna",
        "IOP: amenorreia antes dos 40 anos + FSH e LH altos",
      ],
      pegadinhas: [
        "A mama não separa Rokitansky de Morris: quem separa é o pelo e o cariótipo",
        "Amenorreia hipotalâmica responde igual aos testes, mas com gonadotrofinas baixas",
      ],
    },
    {
      id: "climaterio",
      titulo: "Climatério",
      questoes: 3,
      algoritmos: [
        {
          titulo: "Terapia hormonal no climatério",
          passos: [
            cenario("Fogachos ou síndrome geniturinária (não iniciar para prevenir doença cardiovascular)"),
            decisao(
              "Contraindicação à TH sistêmica?",
              ramo("Sim", conduta("Não hormonal: paroxetina, escitalopram, venlafaxina, desvenlafaxina, gabapentina")),
              ramo(
                "Não",
                decisao(
                  "< 60 anos ou < 10 anos de menopausa?",
                  ramo("Sim", conduta("Janela: perfil seguro")),
                  ramo("Não", conduta("Início tardio: risco maior"))
                ),
                conduta("Útero + estrogênio sistêmico → associar progestagênio; sem útero → estrogênio isolado"),
                conduta("Risco metabólico ou de trombose → via transdérmica (não anula contraindicação)")
              )
            ),
            atencao("Tamoxifeno: evitar paroxetina e fluoxetina"),
          ],
        },
      ],
      oQueCai: [
        "Contraindicações: câncer de mama/estrogênio-dependente, sangramento sem diagnóstico, TEV, IAM ou AVC, doença hepática ativa",
        "Envelhecimento ovariano: ciclo encurta 2 a 3 dias (fase folicular) primeiro, depois alonga e fica irregular",
        "Contagem de folículos antrais e antimülleriano medem a quantidade da reserva (não a qualidade)",
        "Dispensam progestagênio: estrogênio vaginal em dose baixa, tibolona, estrogênio + bazedoxifeno",
        "Estrogênio tópico vaginal é hormonal e trata só sintoma geniturinário",
      ],
      pegadinhas: [
        "Inverter a ordem do ciclo (alonga e depois encurta)",
        "Começar depois dos 65 'protege mais' ou via oral melhor com risco cardiovascular: falso",
        "Estrogênio tópico como 'não hormonal'; progesterona/testosterona não são opção não hormonal",
      ],
    },
  ],
  regrasRelampago: [
    { tema: "Doença inflamatória pélvica", texto: "Ambulatorial: ceftriaxona 500 mg IM dose única + doxiciclina 100 mg 12/12 h 14 dias + metronidazol 500 mg 12/12 h 14 dias. Quinolona sozinha não serve; reavaliar em 72 h." },
    { tema: "Massas anexiais", titulo: "Teratoma maduro", texto: "Teratoma é sempre germinativo; dermoide = 2 ou mais folhetos (gordura, pelo, dente). Complicação aguda mais comum: torção. Dente não indica imaturidade; malignização rara." },
    { tema: "Massas anexiais", titulo: "Estadiamento do câncer de ovário", texto: "Estadiamento é cirúrgico: lavado peritoneal + HT + SOB + omentectomia infracólica + biópsias peritoneais + linfonodos pélvicos e para-aórticos. TC normal não substitui." },
    { tema: "Abortamento", texto: "Colo aberto sem eliminação = inevitável; aberto com restos = incompleto. Colo fechado: ameaça (embrião vivo), completo (útero vazio), retido (embrião morto)." },
    { tema: "Doenças benignas da mama", titulo: "Derrame papilar", texto: "Suspeito: espontâneo, unilateral, uniductal, hemático/serossanguíneo/cristalino. Causa benigna mais comum: papiloma intraductal. Bilateral, provocado, esverdeado = fisiológico." },
    { tema: "Doenças benignas da mama", titulo: "Biópsias percutâneas", texto: "Core biopsy: agulha 14 G, dá histologia. Mamotomia: vácuo, agulha mais grossa (7 a 11 G). PAAF dá só citologia: exige tríplice diagnóstico." },
    { tema: "Incontinência urinária", titulo: "Urodinâmica", texto: "Pressão de perda < 60 cmH₂O = defeito esfincteriano; > 90 = hipermobilidade. IUE não complicada pode ser operada sem urodinâmica; não é exame para toda paciente." },
    { tema: "Líquido amniótico e crescimento fetal", texto: "Oligoidrâmnio: ILA ≤ 5 cm ou maior bolsão < 2 cm. Tabagismo é causa materna de restrição; RCF + oligoidrâmnio = insuficiência placentária." },
    { tema: "Pré-natal", titulo: "Ácido fólico", texto: "Baixo risco: 0,4 mg/dia (400 microgramas); alto risco (filho com defeito, anticonvulsivante): 4 a 5 mg/dia. Iniciar ≥ 1 mês antes de engravidar e manter no 1º trimestre." },
    { tema: "SOP", texto: "Rotterdam: 2 de 3 (oligo/anovulação, hiperandrogenismo, ovário policístico) + exclusão. US e resistência insulínica não obrigatórios. Sem desejo de gestar: ACO combinado + estilo de vida." },
    { tema: "Sífilis na gestante", texto: "Dose pelo estágio: recente = 2,4 milhões UI dose única; tardia/ignorada = 3 doses semanais (intervalo ≤ 9 dias). Parceria exposta: 1 dose. Alérgica: dessensibilizar." },
    { tema: "Violência sexual", texto: "Levonorgestrel 1,5 mg dose única até 5 dias; PEP HIV até 72 h (tenofovir + lamivudina + dolutegravir 28 dias); IST: penicilina benzatina + ceftriaxona + azitromicina. Não exige BO." },
    { tema: "Classificações obstétricas", titulo: "Robson 6 a 10", texto: "6 = nulípara pélvico; 7 = multípara pélvico (inclui cesárea anterior); 8 = múltipla; 9 = transversa/oblíqua; 10 = cefálico único < 37 semanas." },
    { tema: "Câncer de mama", titulo: "Luminal A", texto: "Luminal A: RH positivo, HER2 negativo, Ki-67 baixo; base = hormonioterapia, muitas vezes sem quimioterapia. Luminal B: Ki-67 alto ou HER2+." },
    { tema: "Colestase intra-hepática da gravidez", texto: "3º trimestre, prurido em palmas e plantas, pior à noite, sem lesão de pele; confirma com ácidos biliares elevados. Risco fetal; tratar com ácido ursodesoxicólico." },
    { tema: "Estática fetal", titulo: "Cefálicas defletidas", texto: "1º grau bregma (linha sagitometópica); 2º grau fronte: glabela/raiz do nariz, linha metópica; 3º grau face: mento, linha facial. Fronte persistente a termo não nasce vaginal." },
    { tema: "Fisiologia reprodutiva", titulo: "Recrutamento folicular", texto: "Corpo lúteo regride, caem progesterona, estradiol e inibina A; sem o freio o FSH sobe e recruta a coorte de folículos antrais. Pico de LH é da ovulação." },
    { tema: "Gestação ectópica", texto: "Metotrexato: estável, massa < 3,5 cm, sem BCF, beta-hCG < 5.000. Fora disso e estável: videolaparoscopia (salpingectomia se tuba contralateral saudável). Instável: laparotomia." },
    { tema: "Hemorragia pós-parto", titulo: "4 Ts", texto: "Tônus (atonia, a mais comum, ~70%), Trauma, Tecido (restos, acretismo), Trombina (coagulopatia). Útero firme e sangrando: buscar trauma, tecido ou trombina." },
    { tema: "Hidropisia fetal", texto: "Líquido em ≥ 2 compartimentos fetais. Imune = só aloimunização. Não imune (maioria): cardíacas/taquiarritmia, Turner, parvovírus B19, anemias." },
    { tema: "IST", titulo: "Úlceras genitais: cancroide", texto: "Cancroide: úlceras múltiplas, dolorosas, fundo sujo; bubão fistuliza por orifício único. Tratamento: azitromicina 1 g VO dose única. Vários orifícios = linfogranuloma." },
    { tema: "Puberdade precoce", titulo: "Central × periférica", texto: "Precoce: antes dos 8 anos na menina. Central: pico de LH puberal ao GnRH (> 5 a 8 UI/L). Periférica: estradiol alto com LH suprimido, sem resposta ao estímulo." },
    { tema: "Toxoplasmose na gestação", texto: "IgG+/IgM+ até 16 semanas: avidez de IgG (alta = antiga). Suspeita recente: espiramicina já. PCR no LA só após 18 semanas e 4 semanas após infecção materna." },
  ],
};
