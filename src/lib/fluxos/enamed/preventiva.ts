/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const PREVENTIVA: AreaDossie = {
  "id": "preventiva",
  "nome": "Preventiva",
  "blocos": [
    {
      "id": "epidemiologia-desenhos-de-estudo-e-medidas",
      "tipo": "tema",
      "titulo": "Epidemiologia, desenhos de estudo e medidas",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Medidas de associação — RP, RR, OR e NNT",
              "texto": "Transversal → RP; coorte/ensaio → RR; caso-controle → OR. RRR = 1−RR. RAR = risco controle − risco tratamento. NNT = 1/RAR. OR/RR: valor nulo 1; diferenças absolutas/médias: 0.",
              "trava": "Proporção fotografa, risco acompanha, odds olha para trás; NNT traduz efeito para gente."
            },
            {
              "titulo": "Mortalidade x letalidade x mortalidade proporcional",
              "texto": "Mesmo numerador, denominador muda o indicador: mortalidade específica = óbitos/população; letalidade = óbitos/casos; mortalidade proporcional = óbitos pela causa/óbitos totais. Diga primeiro quem está no denominador.",
              "trava": "População mede risco; doentes medem letalidade; óbitos distribuem mortes."
            },
            {
              "titulo": "Gráfico de dispersão — ler pontos antes da teoria",
              "texto": "Primeiro descreva direção, forma, força visual e outliers. Para afirmar ausência/presença estatística, procure coeficiente, teste, IC e desenho; inspeção visual isolada é insuficiente.",
              "trava": "Leia os pontos antes de ler a teoria."
            },
            {
              "titulo": "Viés de performance x seleção x detecção",
              "texto": "Quem entra/como aloca → seleção. Como é tratado → performance. Quem mede/como avalia desfecho → detecção/aferição. 'Cegamento' não resolve sozinho: de quem e qual viés ele reduz?",
              "trava": "Quem ENTRA = seleção; como é TRATADO = performance; quem MEDE = detecção."
            },
            {
              "titulo": "MBE: multiplicidade, erro I/II e subgrupos",
              "texto": "Mais desfechos/comparações sem controle de multiplicidade ↑ falso positivo global. Tipo I = concluir diferença inexistente; tipo II = não detectar diferença real. Pós-hoc é exploratório; pré-especificação, poder e teste de interação dão robustez.",
              "trava": "Mais testes = mais falso positivo. Subgrupo sugere; outro estudo confirma. Tipo I inventa; tipo II perde."
            },
            {
              "titulo": "NNT 1140: magnitude isolada não decide utilidade",
              "texto": "NNT quanto menor, melhor; NNH quanto menor, pior. NNT alto sozinho não condena uma política pública.",
              "trava": "NNT: quanto menor, melhor. NNH: quanto menor, pior. NNT alto sozinho não condena uma política pública."
            },
            {
              "titulo": "Cesárea e mortalidade: direção, platô e unidade",
              "texto": "X sobe e Y cai = associação inversa. Curva com platô: não extrapolar 'quanto mais, melhor'. Dado de país (ecológico) não vira conclusão sobre paciente.",
              "trava": "Se X sobe e Y cai, é inversa. Curva com platô: não extrapole quanto mais, melhor. País não vira paciente."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Erros comuns — pista discriminadora e como volta",
            "colunas": [
              "Tema",
              "Onde se erra",
              "Pista discriminadora",
              "Como volta"
            ],
            "linhas": [
              [
                "Medidas de associação",
                "Sabe fórmulas isoladas, mas perde interpretação de impacto clínico e valor nulo",
                "Transversal → RP; coorte/ensaio → RR; caso-controle → OR",
                "—"
              ],
              [
                "Mortalidade x letalidade",
                "Aritmética certa, nome/interpretação trocado",
                "20 mortes, 1.000 casos, população 10.000, 500 óbitos totais: os mesmos 20 mudam de indicador",
                "Antes de unidades/multiplicador, diga em voz alta quem está no denominador"
              ],
              [
                "Gráfico de dispersão",
                "Inferência teórica sobre equidade substituiu a leitura do gráfico",
                "Direção, concentração e dispersão dos pontos, não o normativamente desejável",
                "'Não há associação estatística' é forte demais sem análise formal"
              ],
              [
                "Viés",
                "Confundiu formação dos grupos com tratamento posterior dos participantes",
                "Descrição falava do tratamento/comportamento após a alocação, não de quem entrou",
                "'Cegamento' não resolve sozinho: de quem e qual viés reduz?"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Medidas de associação e efeito",
            "colunas": [
              "Desenho/medida",
              "Uso",
              "Fórmula/valor nulo"
            ],
            "linhas": [
              [
                "RP",
                "Transversal (proporção fotografa)",
                "Nulo = 1"
              ],
              [
                "RR",
                "Coorte/ensaio (risco acompanha)",
                "Nulo = 1"
              ],
              [
                "OR",
                "Caso-controle (odds olha para trás)",
                "Nulo = 1"
              ],
              [
                "RRR",
                "Redução relativa do risco",
                "1 − RR"
              ],
              [
                "RAR",
                "Redução absoluta do risco",
                "Risco controle − risco tratamento"
              ],
              [
                "NNT",
                "Traduz efeito para gente; quanto menor, melhor",
                "1/RAR"
              ],
              [
                "NNH",
                "Quanto menor, pior",
                "—"
              ],
              [
                "Diferenças absolutas/médias",
                "—",
                "Nulo = 0"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Mesmos 20 óbitos por dengue, três indicadores",
            "colunas": [
              "Indicador",
              "Denominador",
              "Cálculo"
            ],
            "linhas": [
              [
                "Mortalidade específica",
                "População (10.000)",
                "20/10.000 = 200/100.000"
              ],
              [
                "Letalidade",
                "Casos (1.000)",
                "20/1.000 = 2%"
              ],
              [
                "Mortalidade proporcional",
                "Óbitos totais (500)",
                "20/500 = 4%"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Vieses — qual etapa",
            "colunas": [
              "Viés",
              "Pergunta",
              "Etapa"
            ],
            "linhas": [
              [
                "Seleção",
                "Quem entra / como aloca?",
                "Formação dos grupos"
              ],
              [
                "Performance",
                "Como é tratado?",
                "Após alocação (tratamento/comportamento)"
              ],
              [
                "Detecção/aferição",
                "Quem mede / como avalia o desfecho?",
                "Medição do desfecho"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "MBE — erros, multiplicidade, subgrupos, gráficos",
            "colunas": [
              "Conceito",
              "Regra"
            ],
            "linhas": [
              [
                "Erro tipo I",
                "Concluir diferença inexistente (inventa)"
              ],
              [
                "Erro tipo II",
                "Deixar de detectar diferença real (perde)"
              ],
              [
                "Multiplicidade",
                "Mais desfechos/comparações sem controle ↑ risco global de falso positivo"
              ],
              [
                "Subgrupos pós-hoc",
                "Exploratórios; pré-especificação, plausibilidade, poder, multiplicidade e teste de interação dão robustez"
              ],
              [
                "Gráfico de dispersão",
                "Descrever direção, forma, força visual, outliers; estatística exige coeficiente, teste, IC e desenho"
              ],
              [
                "Curva com platô",
                "Não extrapolar 'quanto mais, melhor'; X sobe e Y cai = inversa; país não vira paciente"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Desenhos de estudo",
                "Intervenção aplicada a grupo sem menção de randomização",
                "Selecionar desenho quase-experimental",
                "Chamar toda intervenção de ensaio randomizado"
              ],
              [
                "Desenhos epidemiológicos",
                "Prevalência em adultos de território num curto período",
                "Escolher desenho para levantamento rápido",
                "Escolher coorte ou caso-controle sem necessidade temporal"
              ],
              [
                "Medidas de associação · URGÊNCIA",
                "Coorte com RR 0,6",
                "Interpretar direção da associação",
                "Afirmar maior risco ou negar uso do RR"
              ],
              [
                "Sala de situação",
                "Sífilis gestacional e HAS identificadas em sistemas locais",
                "Transformar dados em ação compartilhada",
                "Manter informação restrita ou apenas publicar boletim"
              ],
              [
                "Desenhos epidemiológicos · URGÊNCIA",
                "Associação entre atividade laboral e lombalgia ao longo dos anos",
                "Escolher desenho longitudinal",
                "Escolher transversal quando temporalidade é objetivo"
              ],
              [
                "Letalidade · IMAGEM",
                "Comparar proporção de mortes/casos por câncer",
                "Calcular óbitos entre casos",
                "Escolher maior número absoluto de óbitos"
              ],
              [
                "Estudo transversal",
                "Inquérito domiciliar de base populacional",
                "Classificar desenho epidemiológico",
                "Confundir coleta populacional com coorte"
              ],
              [
                "Mortalidade materna, natalidade e mortalidade neonatal",
                "Sinais de vida após nascimento de extremo baixo peso",
                "Classificar eventos para indicadores",
                "Chamar nascido vivo de natimorto pelo peso ou duração da sobrevida"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "sus-principios-financiamento-redes-e-controle-social",
      "tipo": "tema",
      "titulo": "SUS — princípios, financiamento, redes e controle social",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "⚠ Financiamento da APS — datar a regra",
              "texto": "PAB: fixo per capita + variável. Previne Brasil: capitação ponderada + desempenho + incentivos. Port. 3.493/2024: componente I 'fixo'. Port. 7.799/2025: componente I → Equidade; mantêm-se Vínculo e Acompanhamento Territorial e Qualidade.",
              "trava": "⚠ Antes de responder financiamento, DATE A REGRA: 2024 fixo; 2025+ equidade."
            },
            {
              "titulo": "Promoção coletiva da saúde — universal não é descuido com equidade",
              "texto": "Promoção coletiva: acesso amplo e universal. Equidade entra ao remover barreiras e intensificar cuidado segundo necessidade; tratamento individual usa risco/diagnóstico para modular conduta.",
              "trava": "Promoção coletiva não exige estar doente para entrar."
            },
            {
              "titulo": "⚠ PNAB — adstrição, vínculo e longitudinalidade",
              "texto": "U-E-I = princípios doutrinários. Território/adstrição define responsabilidade; longitudinalidade mantém relação e seguimento; coordenação integra pontos da rede; integralidade articula necessidades/ações e níveis.",
              "trava": "Crônico do território pede adstrição + vínculo + continuidade, não campanha solta."
            },
            {
              "titulo": "Rastreamento de próstata em mulher trans",
              "texto": "Órgão presente, risco individualizado.",
              "trava": "Órgão presente, risco individualizado."
            },
            {
              "titulo": "PNH — ambiência x PTS para toda família",
              "texto": "Ambiência trata do espaço/relações; PTS organiza cuidado singular com equipe, usuário/família, metas, responsabilidades e reavaliação. 'PTS para cada família' é absoluto e impraticável.",
              "trava": "PTS não é carimbo de toda família."
            },
            {
              "titulo": "⚠ Rede Alyne: último trimestre e transporte regulado",
              "texto": "Pré-natal começa cedo; vinculação/aproximação à maternidade no último trimestre; transporte regulado (logística transporta).",
              "trava": "⚠ Rede Alyne: pré-natal começa cedo; maternidade se aproxima no último trimestre; logística transporta."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Erros comuns — pista discriminadora e como volta",
            "colunas": [
              "Tema",
              "Onde se erra",
              "Pista discriminadora",
              "Como volta"
            ],
            "linhas": [
              [
                "Financiamento da APS",
                "Mistura componentes verdadeiros de épocas diferentes",
                "PAB antigo ≠ Previne Brasil ≠ modelo 2024 ≠ atualização 2025+",
                "Fee for service paga por ato; capitação por pessoa; equidade = princípio e nome do componente"
              ],
              [
                "Promoção coletiva",
                "Equidade aplicada como exclusão dos não obesos: ação universal virou grupo de doentes",
                "Atividade coletiva de promoção/prevenção, não plano terapêutico individual",
                "Universalidade e equidade coexistem; ação universal não espera a doença"
              ],
              [
                "PNAB",
                "Ação pontual escolhida como se resolvesse vínculo e continuidade",
                "Doença crônica + pessoas conhecidas do território + sem acompanhamento regular",
                "Não marcar pelo sentimento geral de 'SUS'; nomear exatamente a operação descrita"
              ],
              [
                "PNH",
                "Frase bonita e abrangente aceita sem conferir função de cada dispositivo",
                "Expressão absoluta 'PTS para cada família': ampla e impraticável",
                "Erro de ambiência fica P2; consolidação posterior do PTS é P1 por recorrência"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "⚠ Financiamento da APS — linha do tempo (datar a regra)",
            "colunas": [
              "Modelo",
              "Componentes"
            ],
            "linhas": [
              [
                "PAB (antigo)",
                "Fixo per capita + variável por programas/estratégias"
              ],
              [
                "Previne Brasil",
                "Capitação ponderada + desempenho + incentivos/ações estratégicas"
              ],
              [
                "Portaria 3.493/2024",
                "Componente I inicialmente chamado fixo"
              ],
              [
                "Portaria 7.799/2025",
                "Componente I → Componente de Equidade; mantêm-se Vínculo e Acompanhamento Territorial e Qualidade"
              ],
              [
                "Conceitos",
                "Fee for service paga por ato; capitação paga por pessoa"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "PNAB e PNH — conceitos operacionais",
            "colunas": [
              "Conceito",
              "O que faz"
            ],
            "linhas": [
              [
                "U-E-I",
                "Universalidade, equidade, integralidade: princípios doutrinários"
              ],
              [
                "Território/adstrição",
                "Define responsabilidade"
              ],
              [
                "Longitudinalidade",
                "Mantém relação e seguimento ao longo do tempo"
              ],
              [
                "Coordenação",
                "Integra pontos da rede"
              ],
              [
                "Integralidade",
                "Articula necessidades/ações e níveis"
              ],
              [
                "Equidade (promoção coletiva)",
                "Remove barreiras e intensifica cuidado segundo necessidade; ação segue universal"
              ],
              [
                "Ambiência (PNH)",
                "Espaço/relações"
              ],
              [
                "PTS (PNH)",
                "Cuidado singular: equipe, usuário/família, metas, responsabilidades e reavaliação"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Atenção primária na saúde suplementar · URGÊNCIA",
                "Fluxo regulado pela APS com exceção de urgência",
                "Atuar como gestora clínica do acesso",
                "Restringir por custo ou liberar por demanda sem critério"
              ],
              [
                "Tratamento Fora do Domicílio",
                "Indicação médica registrada apesar de adulta estável",
                "Aplicar critério legal",
                "Exigir perícia de incapacidade ou negar por distância"
              ],
              [
                "Coordenação do cuidado",
                "Alta por IC complexa com contato hospitalar, sem especialista marcado",
                "Organizar seguimento longitudinal em rede",
                "Transferir centro do cuidado ao especialista"
              ],
              [
                "Telessaúde",
                "Discussão síncrona sem paciente, apoio à médica da APS",
                "Classificar interação profissional-profissional",
                "Chamar teleconsulta/telediagnóstico ou transferir responsabilidade"
              ],
              [
                "Trabalho interdisciplinar na APS · URGÊNCIA",
                "Idosa confusa, faltosa, casa desorganizada e doenças descompensadas",
                "Integrar clínica e território",
                "Fragmentar tarefas entre ACS e médico ou esperar consulta"
              ],
              [
                "Equidade nas visitas domiciliares",
                "Critérios de priorização do agendamento",
                "Aplicar princípio do SUS",
                "Marcar integralidade pelo contexto familiar"
              ],
              [
                "⚠ Financiamento do SUS e Lei 8.142",
                "Fundo e conselho de saúde",
                "Requisitos para transferência de recursos",
                "Substituir exigência legal por ferramenta administrativa"
              ],
              [
                "Universalidade e equidade",
                "Evolução da cobertura e diferença entre quintis",
                "Interpretar gráfico de cobertura por renda",
                "Confundir expansão de acesso com eliminação de desigualdades"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — controle social e agendamento",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Controle social no SUS",
                "Gestão centralizada e reivindicação popular",
                "Composição e participação em conselho",
                "Confundir conselho deliberativo com gestão executiva"
              ],
              [
                "Conselho municipal e secretaria de saúde",
                "Proposta para cuidado de ostomizados",
                "Distinguir deliberação e execução",
                "Atribuir execução administrativa ao conselho"
              ],
              [
                "Agendamento na APS: carve-out",
                "Reserva fixa para demanda aguda e programada",
                "Identificar modelo e limitação",
                "Confundir com acesso avançado ou ignorar vagas ociosas"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "algoritmos-preventiva",
      "tipo": "algoritmos",
      "titulo": "Algoritmos — Preventiva",
      "resumo": "Fluxos para não confundir na hora da prova",
      "elementos": [
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Testes diagnósticos — ordem de cálculo",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "1) Definir doentes/sadios pela prevalência"
              },
              {
                "tipo": "conduta",
                "texto": "2) Aplicar sensibilidade/especificidade"
              },
              {
                "tipo": "conduta",
                "texto": "3) Montar VP / FN / VN / FP"
              },
              {
                "tipo": "conduta",
                "texto": "4) Só então VPP / VPN / LR"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Desenho epidemiológico",
            "passos": [
              {
                "tipo": "avaliar",
                "texto": "Unidade: indivíduo ou grupo? Houve intervenção?"
              },
              {
                "tipo": "decisao",
                "texto": "Sem intervenção — como foi?",
                "ramos": [
                  {
                    "rotulo": "Fotografia",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Transversal"
                      }
                    ]
                  },
                  {
                    "rotulo": "Selecionou pela exposição",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Coorte"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "Taxas de grupos = ecológico"
                      }
                    ]
                  },
                  {
                    "rotulo": "Selecionou pelo desfecho",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Caso-controle"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "id": "contrastes-preventiva",
      "tipo": "contrastes",
      "titulo": "Contrastes — Preventiva",
      "resumo": "Pares parecidos o bastante para serem trocados",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de Preventiva",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "Rastreamento × investigação",
                "Rastreamento",
                "Assintomático + protocolo"
              ],
              [
                "",
                "Investigação",
                "Sintoma/achado que exige diagnóstico"
              ],
              [
                "Equidade × integralidade",
                "Equidade",
                "Mais para quem mais precisa"
              ],
              [
                "",
                "Integralidade",
                "Cuidado global da pessoa"
              ],
              [
                "SVO × IML",
                "SVO",
                "Morte natural sem causa esclarecida"
              ],
              [
                "",
                "IML",
                "Causa externa / suspeita"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "numeros-que-derrubam-preventiva",
      "tipo": "numeros",
      "titulo": "Números que derrubam — Preventiva",
      "resumo": "Cutoffs, doses, janelas e prazos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números de Preventiva",
            "colunas": [
              "Item",
              "Número/corte",
              "Observação"
            ],
            "linhas": [
              [
                "Mortalidade perinatal",
                "Fetal ≥22 semanas + neonatal precoce",
                "Denominador: NV + fetais ≥22 sem"
              ],
              [
                "Mortalidade neonatal",
                "Precoce 0–6 d; tardia 7–27 d; pós-neonatal 28–364 d",
                ""
              ],
              [
                "Conselho / Conferência",
                "Conferência em regra a cada 4 anos; usuários = 50%",
                ""
              ],
              [
                "CAT",
                "Empresa até o 1º dia útil; morte = imediata",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "normativo-preventiva",
      "tipo": "normativo",
      "titulo": "Normativo — Preventiva",
      "resumo": "7 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Atualizações 2026 — Preventiva",
            "colunas": [
              "Norma/tema",
              "O que mudou",
              "Status",
              "Fonte e data"
            ],
            "linhas": [
              [
                "⚠ Rastreamento colorretal",
                "FIT incluído no SUS: rastreamento bienal em assintomáticos de 50 a 75 anos",
                "Confirmada",
                "MS / INCA — portaria no DOU em 10/08/2026"
              ],
              [
                "",
                "FIT positivo → investigação complementar; colonoscopia é o procedimento de referência",
                "",
                ""
              ],
              [
                "",
                "Exclusivo de rastreamento: não cobre sintomático nem suspeita clínica de câncer",
                "",
                ""
              ],
              [
                "",
                "Trava: SUS 2026: 50–75 a, FIT bienal; positivo → colonoscopia. Sintomático é investigação, fora do fluxo",
                "",
                ""
              ],
              [
                "⚠ NR-1 e riscos psicossociais",
                "Desde maio/2026, riscos psicossociais entram no gerenciamento ocupacional",
                "Confirmada",
                "NR-1, vigência maio/2026"
              ],
              [
                "",
                "Estresse, assédio, sobrecarga, organização inadequada do trabalho e insegurança laboral",
                "",
                ""
              ],
              [
                "",
                "Trava: Risco ocupacional deixou de ser só físico, químico e biológico",
                "",
                ""
              ],
              [
                "⚠ Estatuto dos Direitos do Paciente",
                "Reforça consentimento informado, recusa, acompanhante, acesso ao prontuário, segunda opinião",
                "Confirmada",
                "Estatuto dos Direitos do Paciente"
              ],
              [
                "",
                "Também: diretivas antecipadas, sigilo e cuidados paliativos",
                "",
                ""
              ],
              [
                "",
                "Trava: Autonomia e documentação viraram texto legal explícito",
                "",
                ""
              ],
              [
                "⚠ Rede Alyne e população negra",
                "Rede Alyne substituiu a Rede Cegonha (homenagem a Alyne Pimentel)",
                "Confirmada",
                "PNSIPN e Rede Alyne"
              ],
              [
                "",
                "Promove equidade observando iniquidades étnico-raciais",
                "",
                ""
              ],
              [
                "",
                "Quesito raça/cor obrigatório em todos os instrumentos dos serviços públicos desde 2017",
                "",
                ""
              ],
              [
                "",
                "Trava: Se o enunciado ainda falar em Rede Cegonha, é item histórico",
                "",
                ""
              ],
              [
                "⚠ Financiamento da APS",
                "2024: nome formal do componente era fixo, mas o cálculo já usava o IED (equidade)",
                "Confirmada",
                "Portaria 3.493/2024, renomeação em 2025 e Portaria 10.994/2026"
              ],
              [
                "",
                "2025 em diante: componente passa a se chamar formalmente de equidade",
                "",
                ""
              ],
              [
                "",
                "2026: atenção ao cronograma de implantação e ao componente de desempenho (Portaria 10.994/2026)",
                "",
                ""
              ],
              [
                "",
                "Trava: '2024 fixo, 2025+ equidade' vale para o NOME; 2024 não ignorava equidade — IED já no cálculo",
                "",
                ""
              ],
              [
                "⚠ Notificação compulsória 2026",
                "Anomalias congênitas passam a notificação semanal",
                "Controversa — confirmar",
                "Portaria 11.211/2026"
              ],
              [
                "",
                "Adiciona caxumba/parotidite e febre do Oropouche",
                "",
                ""
              ],
              [
                "",
                "Oropouche: caso comum semanal; gestante, óbito, óbito fetal e anomalia congênita: imediata",
                "",
                ""
              ],
              [
                "",
                "Covid-19 deixa de aparecer isolada: permanece como síndrome gripal por covid-19 confirmada",
                "",
                ""
              ],
              [
                "",
                "Varicela sem limitar explicitamente a grave internada ou óbito",
                "",
                ""
              ],
              [
                "",
                "ESAVI substitui a nomenclatura antiga de evento adverso grave pós-vacinação",
                "",
                ""
              ],
              [
                "",
                "Trava: Identifique a versão da portaria. Caxumba: inconsistência portaria x tabela — não é regra firme",
                "",
                ""
              ],
              [
                "⚠ Licença-paternidade",
                "Mudança legal em 2026, com vigência destacada em 01/01/2027",
                "Vigência futura",
                "Legislação com vigência futura"
              ],
              [
                "",
                "Trava: Não aplique o novo regime a cenário datado de 2026",
                "",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-preventiva-saude-coletiva-e-mfc",
      "tipo": "apostas",
      "titulo": "Apostas — Preventiva (Saúde Coletiva e MFC)",
      "resumo": "14 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Preventiva (1/4) — Epidemiologia",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Indicadores de saúde",
                "Prevalência = casos totais / pop. exposta (local, período). Incidência = casos novos / pop. exposta"
              ],
              [
                "↳ mortalidade / letalidade",
                "Mortalidade por causa = óbitos pela causa / pop. exposta. Letalidade = óbitos pela doença / casos da doença"
              ],
              [
                "↳ materna / infantil",
                "Materna = óbitos maternos / NV ×100.000. Infantil = óbitos <1 ano / NV ×1.000"
              ],
              [
                "↳ proporcional",
                "Óbitos por causa ou idade / total de óbitos (local, período)"
              ],
              [
                "Estudos epidemiológicos",
                "Identificar o desenho. Ecológico: agregado, falácia ecológica. Transversal: exposição e efeito juntos; prevalência"
              ],
              [
                "↳ Caso-controle",
                "Parte dos casos × controles; chance de exposição no passado (doença → exposição)"
              ],
              [
                "↳ Coorte",
                "Parte de expostos e não expostos; acompanha a doença (exposição → doença); mede incidência"
              ],
              [
                "↳ Ensaio clínico",
                "Experimental, individuado; padrão-ouro p/ intervenção; randomização + mascaramento; intention-to-treat"
              ],
              [
                "↳ Revisão sistemática",
                "Secundário, sumariza estudos primários; com ≥2 estudos comparáveis → metanálise"
              ],
              [
                "Diagrama de controle (multimídia)",
                "Construído pela incidência média local → limites superior e inferior de endemia"
              ],
              [
                "↳ leitura",
                "Acima do limite superior: epidemia. Dentro do canal endêmico: endemia"
              ],
              [
                "Testes diagnósticos",
                "S = VP ÷ doentes; E = VN ÷ sadios; acurácia = (VP+VN) ÷ total; VPP = VP ÷ positivos; VPN = VN ÷ negativos"
              ],
              [
                "↳ VP e RV",
                "Valores preditivos (pós-teste) dependem da pré-teste (prevalência). RV+ = S ÷ (1 − E); RV− = (1 − S) ÷ E"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Preventiva (2/4) — SUS, APS, MCCP, telessaúde",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Legislação do SUS",
                "CF 1988: cria SUS; saúde direito de todos e dever do Estado"
              ],
              [
                "↳ Lei 8.080/90",
                "Universalidade, integralidade, equidade, descentralização, hierarquização, regionalização, participação popular"
              ],
              [
                "↳ Lei 8.080/90 (cont.)",
                "Novidade: atenção humanizada; funcionamento do SUS e competências de cada esfera"
              ],
              [
                "↳ Lei 8.142/90",
                "Repasse fundo a fundo; 50% usuários; conselhos mensais, permanentes, deliberativos; conferências a cada 4 a"
              ],
              [
                "↳ Decreto 7.508/2011",
                "Região: APS, urgência/emergência, psicossocial, ambulatorial especializada e hospitalar, vigilância"
              ],
              [
                "↳ portas de entrada",
                "APS, urgência e emergência, atenção psicossocial e especiais de acesso aberto"
              ],
              [
                "⚠ Atenção primária à saúde",
                "Essenciais: primeiro contato, integralidade, longitudinalidade, coordenação"
              ],
              [
                "↳ derivados / rede",
                "Orientação familiar, comunitária, competência cultural. APS: porta principal, resolve maioria, coordena o cuidado"
              ],
              [
                "↳ equipes",
                "eSF: médico, enfermeiro, aux./téc. enfermagem, ACS. eAP: médico + enfermeiro"
              ],
              [
                "↳ eMulti",
                "Maior resolutividade; não é porta de entrada, sem unidades físicas independentes"
              ],
              [
                "MCCP e ReSOAP",
                "Doença (disease) ≠ enfermidade (illness). 1º componente: explorar saúde, doença e experiência — SIFE"
              ],
              [
                "↳ SIFE / componentes",
                "Sentimentos, Ideias, Função, Expectativa. 2º pessoa como um todo; 3º plano conjunto; 4º intensificar relação"
              ],
              [
                "↳ ReSOAP",
                "Registro preferencial na APS: S subjetivo, O objetivo, A avaliação (problemas), P plano"
              ],
              [
                "⚠ Telessaúde",
                "TICs p/ teleatendimento complementar ao presencial. Telediagnóstico: dados/imagens → laudo ou parecer"
              ],
              [
                "↳ teleconsulta / consultoria",
                "Teleconsulta: profissional–paciente. Teleconsultoria: entre profissionais p/ dúvidas; síncrona ou assíncrona"
              ],
              [
                "↳ teleinterconsulta",
                "Entre profissionais, com o paciente presente, p/ auxílio diagnóstico ou terapêutico"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Preventiva (3/4) — vigilância e ética",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Manejo integrado de vetores",
                "Processo cíclico e racional; combina métodos; sustentabilidade; uso racional de inseticidas (resistência)"
              ],
              [
                "↳ 4 fases",
                "Análise situacional → desenho/planificação → implementação → monitoramento e avaliação (realimenta)"
              ],
              [
                "↳ tipos de controle",
                "Biológico (peixes, Bti); químico; mecânico/ambiental; legal; proteção individual (repelente, tela, mosquiteiro)"
              ],
              [
                "Leishmaniose — lesões cutâneas (MFC multimídia)",
                "Lesão cutânea = aposta quente. Úlcera >4 semanas → biópsia"
              ],
              [
                "↳ diferenciais",
                "Paracoccidioidomicose, leishmaniose, esporotricose, cromoblastomicose, tuberculose"
              ],
              [
                "↳ visceral / cutânea",
                "Visceral: FOI, esplenomegalia, desnutrição. Cutânea: úlcera crônica arredondada indolor (nasofaringe, tronco, membros)"
              ],
              [
                "↳ dx / tto",
                "Amastigotas (mielograma, biópsia); rK39 no visceral. Glucantime, anfotericina B ou miltefosina"
              ],
              [
                "↳ não sondado",
                "Esquistossomose, Malária, Mudança climática e arboviroses, Hesitação vacinal"
              ],
              [
                "Princípios bioéticos",
                "Beneficência: maximizar benefício e minimizar prejuízo. Não maleficência: primeiro não causar dano"
              ],
              [
                "↳ autonomia / justiça",
                "Autonomia: decidir sobre corpo e vida, pesquisa, TCLE. Justiça/equidade: dar a cada um o devido; imparcial"
              ],
              [
                "⚠ Declaração de óbito",
                "Morte natural: médico assistente/substituto; sem assistência ou causa básica indefinida: SVO; externa: IML"
              ],
              [
                "↳ Parte I / II",
                "I: a = terminal/imediata; b, c = antecedentes; d = causa básica. II: contribuintes fora da sequência"
              ],
              [
                "↳ não sondado",
                "Fim de vida, capacidade civil/demência, doação de órgãos, lesão por pressão, nome social, recusa transfusão…"
              ],
              [
                "↳ não sondado (cont.)",
                "…recusa de transfusão em menor, violência institucional contra idoso"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Preventiva (4/4) — populações vulneráveis",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "SasiSUS — saúde indígena",
                "Lei Arouca (9.836/99); parte do SUS; financiado pela União; gerido pela SESAI; 34 DSEI"
              ],
              [
                "↳ DSEI",
                "Unidade gestora descentralizada; base na ocupação das comunidades; não segue limites estaduais"
              ],
              [
                "↳ estrutura / PNASPI",
                "UBS indígenas, polos base, CASAI. PNASPI: diversidade, medicina tradicional, direito à cultura"
              ],
              [
                "⚠ População negra e Rede Alyne",
                "PNSIPN: racismo, desigualdades étnico-raciais e racismo institucional como determinantes; equidade"
              ],
              [
                "↳ conceitos",
                "Estrutural: na organização da sociedade. Institucional: fracasso da organização por cor/cultura/etnia"
              ],
              [
                "↳ democracia racial / raça-cor",
                "Mito: falsa ideia de que não há discriminação. Quesito raça/cor obrigatório desde 2017"
              ],
              [
                "↳ Rede Alyne",
                "Substituiu a Rede Cegonha; homenagem a Alyne Pimentel (2002); promove equidade étnico-racial"
              ],
              [
                "↳ não sondado",
                "Competência cultural, Saúde da população cigana/Romani, Saúde da população trans"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "pontos-cegos-saude-coletiva",
      "tipo": "pontos-cegos",
      "titulo": "Pontos cegos — Saúde Coletiva",
      "resumo": "18 temas que costumam passar despercebidos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Saúde Coletiva",
            "colunas": [
              "Tema",
              "Pista",
              "Regra/conduta"
            ],
            "linhas": [
              [
                "Asbestose",
                "Construção civil, fibrose e placas pleurais",
                "Asbestose (doença ocupacional). Evitar: confundir c/ silicose ou tabagismo"
              ],
              [
                "Autonomia em fim de vida",
                "Paciente lúcida recusa medicamento experimental apesar da filha",
                "Autonomia: respeitar decisão do adulto capaz. Evitar: trocar vontade dela por pedido familiar"
              ],
              [
                "Capacidade civil e demência",
                "Filha quer laudo secreto por interesse bancário",
                "Avaliar clinicamente capacidade de decisão, dialogar c/ ela; orientar via legal. Evitar: laudo sem avaliar/ocultar fim"
              ],
              [
                "Competência cultural",
                "Evita contato visual e presença do pajé",
                "Espaços formativos p/ equipe, reconhecendo saberes locais. Evitar: padronização biomédica uniforme"
              ],
              [
                "Doação de órgãos",
                "Doadora declarada, mas cônjuge se opõe",
                "Após ME, doação requer consentimento e autorização do esposo. Evitar: ignorar autorização familiar"
              ],
              [
                "Esquistossomose",
                "Contato lacustre, hepatoesplenomegalia, eosinofilia e estrófulos",
                "Kato-Katz +: praziquantel + notificar no sistema do programa específico. Evitar: sorologia confirmatória"
              ],
              [
                "Lesão por pressão",
                "Eritema não branqueável em sacro de acamado",
                "Rodízio de decúbito ≤ 2 h. Evitar: massagear, usar argola ou manter decúbito dorsal"
              ],
              [
                "Malária",
                "Profissional não imune indo trabalhar na Amazônia",
                "Escolher profilaxia p/ área endêmica (questão ANULADA). Evitar: confundir c/ tratamento; ignorar resistência"
              ],
              [
                "Mudança climática e arboviroses",
                "Aumento de temperatura e transmissão em áreas antes frias",
                "Incubação extrínseca encurtada no mosquito → vetor infectante mais cedo. Evitar: mutação viral/só densidade"
              ],
              [
                "Nome social em documento médico",
                "Empresa recusou documento: registro civil não retificado",
                "Novo atestado c/ nome de registro civil + nome social em campo específico. Evitar: expor condição trans/CID"
              ],
              [
                "Recusa de transfusão em menor",
                "Criança em choque hemorrágico c/ indicação vital",
                "Recusa que põe vida do menor em risco não deve ser aceita (texto truncado). Evitar: esperar decisão judicial"
              ],
              [
                "Sala de situação",
                "Sífilis gestacional e HAS identificadas em sistemas locais",
                "Apresentar dados no conselho local de saúde, dialogando c/ lideranças. Evitar: restringir ou só boletim"
              ],
              [
                "Saúde da população cigana/Romani",
                "Racismo e violência associados a depressão/suicídio",
                "Depressão e suicídio são problemas, maior incidência em mulheres. Evitar: generalizar gênero/liderança/nomadismo"
              ],
              [
                "Tratamento Fora do Domicílio (TFD)",
                "Indicação médica registrada; adulta estável",
                "Negar acompanhante não se sustenta: indicação médica no laudo de TFD basta. Evitar: exigir perícia/negar por distância"
              ],
              [
                "Violência institucional contra idoso",
                "Agressões, contenções e lesões de pressão em ILPI",
                "Ação intersetorial c/ controle social + notificação compulsória. Evitar: normalizar contenção"
              ],
              [
                "⚠ Hesitação vacinal",
                "Redes sociais, algoritmo e exposição seletiva",
                "Internet veicula dúvidas sobre eficácia/segurança → abala confiança. Evitar: atribuir só à baixa renda"
              ],
              [
                "Saúde da população trans",
                "Homem trans sem sofrimento psíquico grave busca informação",
                "Identidade de gênero não é transtorno mental; acompanhar na UBS. Evitar: exigir dx psiquiátrico/terceirizar"
              ],
              [
                "Telessaúde",
                "Discussão síncrona sem paciente; apoio à médica da APS",
                "Teleconsultoria entre profissionais; responsabilidade assistencial mantida. Evitar: teleconsulta/telediagnóstico"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "travas-preventiva",
      "tipo": "travas",
      "titulo": "Travas — Preventiva",
      "resumo": "27 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Preventiva",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "⚠ Financiamento APS",
                "DATE A REGRA: 2024 fixo; 2025+ equidade"
              ],
              [
                "SINAN x CAT",
                "SINAN vigia o agravo; CAT comunica à Previdência"
              ],
              [
                "Causa básica",
                "Fica no fundo da cadeia — última linha usada, não necessariamente d"
              ],
              [
                "Desenho de estudo",
                "Não pergunte quando aconteceu; pergunte por que entrou no grupo"
              ],
              [
                "Estudo ecológico",
                "Cidade não vira pessoa porque passou o tempo"
              ],
              [
                "Medidas",
                "Proporção fotografa, risco acompanha, odds olha para trás; NNT traduz efeito para gente"
              ],
              [
                "Níveis de prevenção",
                "Promoção impede começar; rastreamento procura cedo; reabilitação limita o estrago"
              ],
              [
                "Desfecho",
                "A cesta maior pode ser a pior. Quer provar que viveu mais? Conte todas as mortes"
              ],
              [
                "SIFE / SOAP",
                "SIFE: o que sente, pensa, perdeu na vida e espera. SOAP: conta, mede, conclui, faz"
              ],
              [
                "Promoção coletiva",
                "Não exige estar doente para entrar"
              ],
              [
                "Trabalho infantil perigoso",
                "Não é só EPI; é retirar risco e articular proteção"
              ],
              [
                "Crônico do território",
                "Adstrição + vínculo + continuidade, não campanha solta"
              ],
              [
                "Mulher trans",
                "Pode ter próstata; hormônio não torna risco zero nem cria regra absoluta"
              ],
              [
                "Coorte / VPP",
                "Tempo + exposição → desfecho = coorte. Preditivo muda com prevalência"
              ],
              [
                "PTS",
                "Não é carimbo de toda família"
              ],
              [
                "Risco x letalidade",
                "População mede risco; doentes medem letalidade; óbitos distribuem mortes"
              ],
              [
                "HPV no HIV",
                "HIV dá 3 doses, não idade infinita"
              ],
              [
                "Escores",
                "Leia os pontos antes de ler a teoria"
              ],
              [
                "Vieses",
                "Quem ENTRA = seleção; como é TRATADO = performance; quem MEDE = detecção"
              ],
              [
                "Rede Alyne",
                "Pré-natal começa cedo; maternidade se aproxima no último trimestre; logística transporta"
              ],
              [
                "Cancro duro",
                "TR hoje; se reagente, benzetacil hoje"
              ],
              [
                "NNT x NNH",
                "NNT: menor, melhor. NNH: menor, pior. NNT alto sozinho não condena política pública"
              ],
              [
                "Incidência x prevalência",
                "Incidência olha onde a seta nasce; prevalência olha se a seta toca o período"
              ],
              [
                "Prontuário",
                "Não é diário do médico; é o dossiê da assistência"
              ],
              [
                "⚠ Notificação 2026",
                "Antes de decorar prazo, identifique a versão da portaria"
              ],
              [
                "⚠ Rastreamento novo",
                "Date a regra antes de marcar"
              ],
              [
                "⚠ SUS 2026 — colorretal",
                "50 a 75 anos, FIT bienal; positivo vai para colonoscopia"
              ]
            ]
          }
        }
      ]
    }
  ]
};
