/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const SAUDE_MENTAL: AreaDossie = {
  "id": "saude-mental",
  "nome": "Saúde mental",
  "blocos": [
    {
      "id": "transtornos-do-humor-ansiedade-e-suicidio",
      "tipo": "tema",
      "titulo": "Transtornos do humor, ansiedade e suicídio",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Risco suicida — segurança não depende de anuência",
              "texto": "Plano definido + acesso a meio + tentativa prévia/desesperança/isolamento ↑ risco → retirar meios, supervisão/ambiente seguro, envolver rede, avaliação psiquiátrica urgente; internação conforme risco e legislação. Não condicionar à concordância.",
              "trava": "Plano + meio + alto risco: segurança primeiro."
            },
            {
              "titulo": "Baby blues x depressão x psicose puerperal",
              "texto": "Blues: primeiros dias, pico 3º–5º, labilidade/choro, realidade preservada, resolve em ~1–2 sem. Depressão: >2 sem/anedonia/prejuízo. Psicose: delírios, alucinações, desorganização → segurança mãe/bebê, internação urgente.",
              "trava": "Blues passa em duas; depressão passa das duas e paralisa; psicose perde a realidade."
            },
            {
              "titulo": "Autolesão + ideação suicida — estratificar, não automatizar",
              "texto": "Avaliar plano, intenção, meios, tentativa recente/letalidade, psicose/intoxicação/agitação, impulsividade, suporte e seguimento. Alto risco → proteção contínua/internação; sem iminência → psicoterapia estruturada + plano de segurança.",
              "trava": "Ideação suicida exige estratificação; internação não é reflexo automático."
            },
            {
              "titulo": "Prevenção populacional do suicídio — restringir meios letais",
              "texto": "Individual: detectar, tratar, estratificar e proteger. Populacional: dificultar acesso a meios letais e políticas de segurança, articuladas a acesso a cuidado. Campanha genérica ≠ intervenção ambiental de maior impacto.",
              "trava": "No indivíduo trato o risco; na população tiro o meio letal do caminho."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Ideação suicida/autolesão: estratificar o risco",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Ideação suicida e/ou autolesão"
              },
              {
                "tipo": "avaliar",
                "texto": "Avaliar: plano, intenção, meios, tentativa recente/letalidade, psicose/intoxicação, impulsividade, suporte"
              },
              {
                "tipo": "decisao",
                "texto": "Alto risco/iminência? (plano + meio + tentativa prévia/desesperança/isolamento)",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Retirar meios, supervisão contínua, envolver rede, avaliação psiquiátrica urgente"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Internação conforme risco e legislação, sem depender de anuência"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Intervenção psicoterápica estruturada + plano de segurança + seguimento próximo"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "'Contrato de não suicídio' não substitui plano de segurança. Nem banalizar, nem hiperintervir."
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Puerpério: blues x depressão x psicose",
            "colunas": [
              "Quadro",
              "Pistas",
              "Conduta"
            ],
            "linhas": [
              [
                "Baby blues",
                "Primeiros dias, pico 3º–5º dia, labilidade/choro, realidade preservada; resolve em ~1–2 semanas",
                "—"
              ],
              [
                "Depressão puerperal",
                ">2 semanas, anedonia, prejuízo",
                "—"
              ],
              [
                "Psicose puerperal",
                "Delírios, alucinações, confusão/desorganização; bipolaridade prévia pesa muito",
                "Emergência: segurança mãe/bebê, avaliação/internação urgente"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Prevenção do suicídio por nível",
            "colunas": [
              "Nível",
              "Medida"
            ],
            "linhas": [
              [
                "Individual",
                "Detectar, tratar, estratificar e proteger"
              ],
              [
                "Populacional",
                "Dificultar acesso a meios letais e políticas de segurança, articuladas a acesso a cuidado"
              ],
              [
                "Armadilha",
                "Campanha genérica/educativa no lugar de intervenção ambiental de maior impacto mensurável"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Humor, ansiedade e suicídio",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Risco de suicídio · URGÊNCIA",
                "Plano específico, meios disponíveis, isolamento e depressão grave",
                "Definir nível de cuidado",
                "Encaminhar apenas para ambulatório/CAPS I"
              ],
              [
                "Transtorno obsessivo-compulsivo",
                "Pensamento intrusivo, egodistônico e reconhecido como irracional",
                "Nomear fenômeno psicopatológico",
                "Confundir pensamento com delírio ou compulsão"
              ],
              [
                "Transtorno de pânico · URGÊNCIA",
                "Crises recorrentes com investigação orgânica negativa",
                "Escolher fármacos por fase",
                "Usar antipsicótico ou antidepressivo tricíclico como esquema padrão"
              ],
              [
                "Luto",
                "Morte do filho há 3 dias, sofrimento intenso sem suicídio",
                "Escolher acolhimento longitudinal",
                "Medicalizar precocemente ou encaminhar automaticamente ao CAPS"
              ],
              [
                "Antidepressivo tricíclico",
                "Amitriptilina 100 mg/dia por 10 anos em adulto de 57 anos",
                "Selecionar exames de segurança",
                "Pedir exames sem relação ou omitir ECG/eletrólitos"
              ],
              [
                "Depressão refratária aparente",
                "Ganho de peso, pele seca, constipação e irregularidade menstrual",
                "Investigar diagnóstico diferencial",
                "Escalonar antidepressivo sem revisar causa orgânica"
              ],
              [
                "Depressão com ataques de pânico",
                "Síndrome depressiva persistente e crises episódicas",
                "Diagnóstico sindrômico",
                "Reduzir o caso a transtorno de pânico"
              ],
              [
                "Hipotireoidismo como causa de sintomas depressivos",
                "Bradicardia, ganho de peso e constipação",
                "Diagnóstico diferencial orgânico",
                "Escalar antidepressivo sem reavaliar causa clínica"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "psicose-agitacao-e-efeitos-adversos",
      "tipo": "tema",
      "titulo": "Psicose, agitação e efeitos adversos",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Insulinoterapia hospitalar — cenário, dieta e intensidade",
              "texto": "Perguntar: crítico? comendo/jejum/dieta contínua? hiperglicemia eventual, persistente ou muito alta? Não pular basal-plus, não confundir prandial com correção, não usar EV em não crítico nem transportar esquema ambulatorial.",
              "trava": "Dieta oral segue o prato; dieta contínua segue o relógio; crítico vai para a bomba."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Insulinoterapia hospitalar",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Paciente crítico?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Insulina EV conforme protocolo"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "decisao",
                        "texto": "Padrão da hiperglicemia?",
                        "ramos": [
                          {
                            "rotulo": "Eventual, nenhuma >250",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Correção"
                              }
                            ]
                          },
                          {
                            "rotulo": "Persistente ~180– 250",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Basal + correção"
                              }
                            ]
                          },
                          {
                            "rotulo": ">250 / deficiência importante",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Basal-bolus"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Glicemia alta não significa paciente crítico"
              },
              {
                "tipo": "atencao",
                "texto": "Sulfonilureia não 'sempre suspensa' só com basal; sai com basal-bolus/alto risco"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Insulina hospitalar — dieta (não crítico)",
            "colunas": [
              "Situação",
              "Esquema"
            ],
            "linhas": [
              [
                "Comendo",
                "Basal + prandial + correção"
              ],
              [
                "Jejum",
                "Basal + correção"
              ],
              [
                "Enteral contínua",
                "Basal + cobertura nutricional programada + correção"
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
                "Efeitos extrapiramidais · URGÊNCIA",
                "Início em 5 dias e contratura cervical dolorosa",
                "Diagnosticar e tratar reação ao haloperidol",
                "Confundir distonia, acatisia e discinesia tardia"
              ],
              [
                "Transtorno alimentar",
                "IMC 14,7, síncope, PA 80/60, bradicardia e ECG alterado",
                "Definir necessidade de internação clínica",
                "Encaminhar direto à psiquiatria sem estabilização clínica"
              ],
              [
                "Internação psiquiátrica",
                "Sem consentimento, autorizada por médico registrado",
                "Aplicar requisito legal",
                "Confundir involuntária com compulsória judicial"
              ],
              [
                "Antidepressivo tricíclico",
                "Amitriptilina 100 mg/dia por 10 anos em adulto de 57 anos",
                "Selecionar exames de segurança",
                "Pedir exames sem relação ou omitir ECG/eletrólitos"
              ],
              [
                "Delirium · URGÊNCIA",
                "Idosa com fratura dolorosa, flutuação e exames sem outra causa",
                "Identificar causa reversível",
                "Atribuir a idade/comorbidades ou hipoxemia leve não presente"
              ],
              [
                "Intoxicação por lítio · URGÊNCIA",
                "Tremor grosseiro, ataxia e confusão após hidroclorotiazida",
                "Suspender agente causador",
                "Tratar como hipoglicemia/parkinsonismo ou manter lítio"
              ],
              [
                "Agitação psicomotora violenta",
                "Ameaça grave e agressão ativa apesar de abordagem/restrição de espaço",
                "Sequenciar manejo após falha verbal",
                "Medicar antes de conter com segurança ou apenas observar"
              ],
              [
                "Anorexia nervosa",
                "Restrição, exercício excessivo, baixo peso e amenorreia",
                "Diagnóstico e abordagem inicial",
                "Valorizar negação do problema acima do quadro clínico"
              ],
              [
                "Delirium e infecção no idoso",
                "Mudança aguda de comportamento e achado pulmonar",
                "Investigação e conduta",
                "Atribuir alteração ao Parkinson de base; X preservado"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "contrastes-saude-mental",
      "tipo": "contrastes",
      "titulo": "Contrastes — Saúde mental",
      "resumo": "Pares parecidos o bastante para serem trocados",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de Saúde mental",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "Blues × depressão × psicose puerperal",
                "Blues",
                "1–2 semanas, labilidade"
              ],
              [
                "",
                "Depressão puerperal",
                ">2 semanas / prejuízo"
              ],
              [
                "",
                "Psicose puerperal",
                "Perda da realidade / emergência"
              ],
              [
                "Obsessão × delírio",
                "Obsessão",
                "Intrusiva/indesejada, com insight"
              ],
              [
                "",
                "Delírio",
                "Crença fixa e pouca crítica"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-saude-mental",
      "tipo": "apostas",
      "titulo": "Apostas — Saúde mental",
      "resumo": "7 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Saúde mental",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Burnout",
                "CID-11, 3 dimensões: exaustão, cinismo (distanciamento, despersonalização), redução da eficácia"
              ],
              [
                "↳ excluir",
                "Transtorno de adaptação, ligados ao estresse, ansiedade e humor"
              ],
              [
                "↳ tto",
                "TCC, modificar ambiente, afastamento temporário (moderado-grave), estilo de vida; fármaco só p/ comorbidade/sintomas"
              ],
              [
                "Depressão maior",
                "2 fundamentais + ≥2 acessórios por ≥2 semanas. Fundamentais: humor deprimido, perda de interesse, fatigabilidade"
              ],
              [
                "↳ acessórios",
                "Concentração↓, autoestima↓, culpa/inutilidade, pessimismo, autolesão, sono perturbado, apetite↓"
              ],
              [
                "↳ tto",
                "TCC/TIP, psicoeducação, atividade física, risco de suicídio. 1ª linha: ISRS (fluoxetina, sertralina) mod.-grave"
              ],
              [
                "⚠ Internação psiquiátrica — Lei 10.216/2001 — Voluntária",
                "Paciente solicita; término por pedido escrito do paciente ou do médico; pode virar involuntária"
              ],
              [
                "↳ Involuntária",
                "Sem consentimento, a pedido de terceiro por escrito, aceito por psiquiatra; 72 h p/ informar o MP estadual"
              ],
              [
                "↳ Compulsória",
                "Determinada pelo juiz após pedido formal de médico; dispensa autorização familiar"
              ],
              [
                "Transtornos alimentares",
                "Mais cobrado: diferenciar. Anorexia: restrição → baixo peso, medo de engordar, distorção da imagem"
              ],
              [
                "↳ anorexia subtipos",
                "Restritiva (jejum, dietas, exercício) ou purgativa (compulsões + purgação)"
              ],
              [
                "↳ bulimia",
                "Compulsão + compensação ≥1×/sem por 3 meses, incômodo c/ forma/peso, sem baixo peso"
              ],
              [
                "↳ tto",
                "Não farmacológico sempre. Bulimia: fluoxetina alta dose ± topiramato; graves: lisdexanfetamina"
              ],
              [
                "↳ texto original",
                "Card diz “anorexia nervosa é autolimitada” (transcrito como no original)"
              ],
              [
                "Intoxicação por tricíclico — ECG (multimídia)",
                "Amitriptilina/nortriptilina; cautela em idosos (arritmias)"
              ],
              [
                "↳ ECG",
                "Taquicardia sinusal, BAV 1º grau, QRS largo, QT longo, R positiva em aVR"
              ],
              [
                "Transtorno do jogo (ludopatia)",
                "Nem todo jogo é transtorno. Social/recreativo e baixo risco → APS"
              ],
              [
                "↳ risco moderado",
                "Interfere, >1 problema, sem critério de transtorno → APS, compartilhado c/ CAPS se necessário"
              ],
              [
                "↳ transtorno",
                "Contínuo apesar de sofrimento, perda de autogestão, compulsivo, desejo antes do jogo → CAPS + APS"
              ],
              [
                "Tabagismo",
                "Rastrear todos os adultos; abordar tabagistas pelo PAAPA: perguntar, avaliar, aconselhar, preparar, acompanhar"
              ],
              [
                "↳ Prochaska",
                "Pré-contemplação, contemplação, preparação, ação. Não farmacológico p/ motivados (contemplativo em diante)"
              ],
              [
                "↳ fármaco se ≥1",
                "Abstinência, ≥5 cigarros/dia, 1º cigarro na 1ª hora, Fagerström ≥4"
              ],
              [
                "↳ esquema",
                "TRN decrescente + bupropiona (SUS) ou vareniclina ~12 sem. Bupropiona reduz limiar convulsivo"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Transtorno do jogo — onde atender",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Paciente que joga/aposta"
              },
              {
                "tipo": "decisao",
                "texto": "Nível?",
                "ramos": [
                  {
                    "rotulo": "Social/recreativo ou baixo risco",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "APS"
                      }
                    ]
                  },
                  {
                    "rotulo": "Risco moderado/problemático",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "APS, compartilhado com CAPS quando necessário"
                      }
                    ]
                  },
                  {
                    "rotulo": "Transtorno de jogo",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "CAPS compartilhado com a APS"
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
      "id": "travas-saude-mental",
      "tipo": "travas",
      "titulo": "Travas — Saúde mental",
      "resumo": "8 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Saúde mental",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "Risco de suicídio",
                "Plano + meio + alto risco: segurança primeiro"
              ],
              [
                "Puerpério",
                "Blues passa em duas; depressão passa das duas e paralisa; psicose perde a realidade"
              ],
              [
                "Bipolaridade",
                "Depressão na frente? Procure mania atrás. Lamotrigina não apaga incêndio maníaco"
              ],
              [
                "Acatisia",
                "Não consigo ficar parado = acatisia → pense propranolol, não 'mais antipsicótico'"
              ],
              [
                "TCA",
                "Compulsão sem purgação = TCA"
              ],
              [
                "Borderline",
                "Traço ≠ TP borderline automaticamente; conte critérios e confirme padrão"
              ],
              [
                "Ideação suicida",
                "Exige estratificação; internação não é reflexo automático"
              ],
              [
                "Prevenção do suicídio",
                "No indivíduo trato o risco; na população tiro o meio letal do caminho"
              ]
            ]
          }
        }
      ]
    }
  ]
};
