/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const PEDIATRIA: AreaDossie = {
  "id": "pediatria",
  "nome": "Pediatria",
  "blocos": [
    {
      "id": "crescimento-desenvolvimento-e-puericultura",
      "tipo": "tema",
      "titulo": "Crescimento, desenvolvimento e puericultura",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Desenvolvimento — atraso x regressão",
              "texto": "Perda de marco não é simples atraso. Pergunta-chave: 'ele nunca fez ou fazia e parou?'. Nunca fez = atraso; fazia e parou = regressão.",
              "trava": "Nunca fez = atraso. Fazia e parou = regressão."
            },
            {
              "titulo": "DDQ aos 6 meses — a idade muda a imagem",
              "texto": "Risco/exame alterado precoce → US nos primeiros meses; preocupação aos 4–6 meses ou depois → RX de bacia ganha valor. Exame físico anormal (ex.: Ortolani+) precisa avaliação ortopédica; escolha do exame não deve atrasá-la.",
              "trava": "Quadril pequeno = US; chegou em ~6 meses = pense RX e ortopedia."
            },
            {
              "titulo": "Criptorquidia palpável — exame físico já localizou",
              "texto": "Sem descida espontânea aos 6 meses corrigidos → encaminhar. Orquidopexia no período recomendado, idealmente até 18 meses; não pedir US/TC/RM de rotina antes da referência.",
              "trava": "Criptorquidia palpável >6 meses: encaminha/opera, não pede imagem por rotina."
            },
            {
              "titulo": "Alimentação complementar aos 4 meses — exceção protocolar específica",
              "texto": "AME → 6 meses. Cenário específico de não amamentação/leite de vaca modificado → seguir protocolo citado; a partir de 4 meses só com prontidão e orientação adequada. Não estender a toda criança em fórmula.",
              "trava": "Regra geral é 6; quatro meses só no cenário específico e com prontidão."
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
                "Atraso x regressão",
                "Tratou perda de marco como simples atraso",
                "'Ele nunca fez ou fazia e parou?'",
                "—"
              ],
              [
                "DDQ aos 6 meses",
                "Regra automática 'DDQ = ultrassom' venceu a mudança pela idade",
                "Lactente com 6 meses, não recém-nascido",
                "Questão imperfeita: Ortolani+ já justifica encaminhamento"
              ],
              [
                "Criptorquidia palpável",
                "Pediu US para localizar algo já localizado, em idade de tratamento",
                "Palpável em região inguinal, criança com 12 meses",
                "Bilateral não palpável/hipospádia pode exigir avaliação urgente de DSD; não muda regra"
              ],
              [
                "Alimentação aos 4 meses",
                "Aplicou regra geral sem testar exceção protocolar explícita",
                "Leite de vaca modificado + sinais de prontidão; não estava em AME",
                "Não levar a exceção a toda criança em fórmula nem antecipar rotineiramente"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "DDQ — exame conforme idade",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Suspeita de DDQ (risco ou exame alterado)"
              },
              {
                "tipo": "decisao",
                "texto": "Idade?",
                "ramos": [
                  {
                    "rotulo": "Primeiros meses",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "US de quadril"
                      }
                    ]
                  },
                  {
                    "rotulo": "4–6 meses ou depois",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "RX de bacia ganha valor"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Exame físico anormal (Ortolani+) → avaliação ortopédica, não só imagem seriada"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Criptorquidia palpável",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Testículo palpável em região inguinal"
              },
              {
                "tipo": "decisao",
                "texto": "Desceu espontaneamente até 6 meses corrigidos?",
                "ramos": [
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Encaminhar; orquidopexia idealmente até 18 meses"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Sem indicação de encaminhamento por esse motivo"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Não pedir US/TC/RM de rotina antes da referência"
              },
              {
                "tipo": "atencao",
                "texto": "Bilateral não palpável/hipospádia → pode exigir avaliação urgente de DSD"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Alimentação complementar — quando iniciar",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Lactente: quando introduzir alimentação complementar?"
              },
              {
                "tipo": "decisao",
                "texto": "Em aleitamento materno exclusivo?",
                "ramos": [
                  {
                    "rotulo": "Sim (AME)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Iniciar aos 6 meses"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (leite de vaca modificado)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Seguir protocolo citado: a partir de 4 meses só com prontidão e orientação adequada"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Exceção não vale para toda criança em fórmula nem para antecipar por rotina"
              }
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
                "Desenvolvimento neuropsicomotor",
                "Idade de 11 meses e desenvolvimento normal",
                "Identificar reflexo persistente aos 11 meses",
                "Escolher reflexos que desaparecem nos primeiros meses"
              ],
              [
                "⚠ Obesidade pediátrica",
                "IMC Z +2 a +3, cintura alta e acantose",
                "Solicitar avaliação de comorbidades",
                "Biopsiar/tratar lesão cutânea em vez do risco metabólico"
              ],
              [
                "Baixa estatura · URGÊNCIA",
                "Alvo baixo, proporções normais e idade óssea pouco atrasada",
                "Interpretar velocidade, alvo e idade óssea",
                "Confundir com atraso constitucional ou displasia"
              ],
              [
                "Puberdade precoce",
                "Telarca antes de 8 anos, aceleração estatural e idade óssea avançada",
                "Diferenciar telarca isolada de puberdade precoce",
                "Chamar de telarca isolada apesar de avanço ósseo"
              ],
              [
                "⚠ Leite materno ordenhado",
                "Retorno materno ao trabalho com lactente de 4 meses",
                "Orientar armazenamento seguro",
                "Ferver/micro-ondas, higienizar mama com álcool ou usar mamadeira"
              ],
              [
                "Alimentação complementar",
                "Lactente saudável em aleitamento exclusivo até 6 meses",
                "Orientar refeições adequadas",
                "Oferecer suco, composto lácteo ou ultraprocessado"
              ],
              [
                "⚠ Obesidade infantil · URGÊNCIA",
                "IMC Z +2 a +3, cintura/estatura alta e placas aveludadas",
                "Classificar e orientar primeira linha",
                "Medicalizar de imediato ou encaminhar sem intervenção de estilo de vida"
              ],
              [
                "Deficiências nutricionais · URGÊNCIA · IMAGEM",
                "11 meses, dieta vegana, anemia e atraso do desenvolvimento",
                "Corrigir micronutrientes e atraso motor",
                "Suplementar apenas folato/vitaminas sem ferro e B12"
              ],
              [
                "Atraso do desenvolvimento · URGÊNCIA",
                "Ausência de sorriso social e vocalização aos 6 meses",
                "Iniciar investigação orientada pela preocupação parental",
                "Aplicar M-CHAT fora da idade ou aguardar especialista sem avaliação contextual"
              ],
              [
                "Transtorno do espectro autista",
                "Alterações de comunicação, comportamento e socialização",
                "Definir idades de rastreamento",
                "Misturar vigilância do desenvolvimento com cronograma fixo incorreto"
              ],
              [
                "Trauma mamilar na amamentação · URGÊNCIA",
                "Dor e sangramento mamilar com oferta de fórmula",
                "Manter aleitamento exclusivo",
                "Suspender aleitamento ou espaçar mamadas"
              ],
              [
                "Crescimento na síndrome de Down",
                "RN com síndrome de Down desde o nascimento",
                "Escolher referência antropométrica",
                "Usar apenas curva OMS ou correção improvisada"
              ],
              [
                "Puberdade precoce",
                "Telarca e pubarca verdadeiras aos 7 anos",
                "Explicar mecanismo fisiológico",
                "Atribuir todo pelo pubiano à suprarrenal ignorando telarca"
              ],
              [
                "Controle esfincteriano · URGÊNCIA · IMAGEM",
                "4 anos, perda noturna isolada e exame normal",
                "Reconhecer variação normal",
                "Diagnosticar enurese patológica antes da idade de corte"
              ],
              [
                "Crescimento e sobrepeso infantil",
                "Dados visuais de peso e estatura aos 2 anos",
                "Interpretação antropométrica",
                "Confundir excesso ponderal com baixa estatura"
              ],
              [
                "Puericultura na trissomia 21",
                "Hipotonia e instabilidade de quadril",
                "Rastreamento direcionado",
                "Repetir exames normais e ignorar achado ortopédico"
              ],
              [
                "Sinais precoces de alteração do desenvolvimento social",
                "Pouco contato visual e ausência de gesto social aos 9 meses",
                "Estimulação e seguimento",
                "Fechar TEA de imediato ou tranquilizar sem acompanhamento"
              ],
              [
                "Hipovitaminose A",
                "Manchas de Bitot, xeroftalmia e dieta restrita",
                "Reconhecimento de deficiência",
                "Confundir lesão ocular carencial com infecção isolada"
              ],
              [
                "DSD no recém-nascido",
                "Genitália masculina sem gônadas palpáveis",
                "Investigação e decisão multidisciplinar",
                "Definir abordagem apenas pela aparência externa"
              ],
              [
                "Síndrome de Down",
                "Fenótipo sugestivo no recém-nascido",
                "Indicação do cariótipo e aconselhamento",
                "Dispensar cariótipo porque diagnóstico parece clínico"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "infeccoes-e-exantemas-na-infancia",
      "tipo": "tema",
      "titulo": "Infecções e exantemas na infância",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Exantemas — sarampo/rubéola e isolamento",
              "texto": "Sarampo: febre alta + tosse/coriza/conjuntivite ± Koplik, exantema cefalocaudal, transmissão aérea. Rubéola: mais brando + linfonodos retroauriculares/occipitais. Sarampo suspeito → isolamento por aerossóis + notificação/contatos.",
              "trava": "Sarampo = três C + Koplik + aerossol; rubéola chama gânglio retroauricular."
            },
            {
              "titulo": "Enterobíase — quebrar a reinfecção domiciliar",
              "texto": "Prurido anal noturno em criança → tratar criança e coabitantes/conviventes próximos; lavar mãos, unhas curtas, banho, troca/lavagem de roupa de cama; repetir dose em geral após 2 semanas (droga não elimina todos os ovos).",
              "trava": "Oxiúrus: paciente + casa + higiene + repetir."
            },
            {
              "titulo": "OMA sem melhora em 48–72 h — reavaliar e trocar",
              "texto": "Janela de 72 h cumprida com quadro ativo → reexaminar e confirmar OMA/complicações/adesão. Falha clássica à amoxicilina → amoxicilina-clavulanato conforme dose e protocolo; outras opções conforme alergia, exposição, gravidade.",
              "trava": "OMA sem melhora em 48–72 h = reavaliar e trocar, não esperar por fé."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Sarampo x rubéola",
            "colunas": [
              "Item",
              "Sarampo",
              "Rubéola"
            ],
            "linhas": [
              [
                "Clínica",
                "Febre alta + tosse/coriza/conjuntivite ± Koplik; exantema cefalocaudal",
                "Quadro mais brando"
              ],
              [
                "Pista",
                "Três C + Koplik",
                "Linfonodos retroauriculares/occipitais"
              ],
              [
                "Transmissão/conduta",
                "Aérea → isolamento por aerossóis + notificação/controle de contatos",
                "—"
              ],
              [
                "Profilaxia pós-exposição",
                "Depende de tempo e condição do contato",
                "—"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Enterobíase: tratar a casa",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Criança com prurido anal predominantemente noturno"
              },
              {
                "tipo": "conduta",
                "texto": "Tratar criança + coabitantes/conviventes próximos conforme protocolo"
              },
              {
                "tipo": "conduta",
                "texto": "Higiene: lavar mãos, unhas curtas, banho, troca/lavagem de roupas de cama"
              },
              {
                "tipo": "conduta",
                "texto": "Repetir a dose em geral após 2 semanas (vermes que eclodiram)"
              },
              {
                "tipo": "atencao",
                "texto": "Droga não elimina de modo confiável todos os ovos: higiene e repetição fazem parte"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "OMA sem melhora",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "OMA em tratamento, quadro ainda ativo"
              },
              {
                "tipo": "decisao",
                "texto": "Janela de 48–72 h já atingida?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Reexaminar: confirmar OMA, complicações, adesão"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Falha à amoxicilina → amoxicilina-clavulanato (dose/protocolo)"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Reavaliar ao atingir 48–72 h"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Outras opções conforme alergia, exposição e gravidade. Não dar 'mais um dia'."
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Infecções e exantemas na infância",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Tuberculose infantil",
                "Tosse >3 semanas e contato intradomiciliar com TB",
                "Escolher exames iniciais",
                "Tratar empiricamente ou usar baciloscopia como único eixo"
              ],
              [
                "Exantema súbito",
                "Febre alta cessa antes de rash cervical/tronco em lactente",
                "Reconhecer sequência febre-exantema",
                "Investigar sarampo sem sinais típicos ou prescrever antibiótico"
              ],
              [
                "Tungíase · IMAGEM",
                "Pápula amarelada com ponto preto em pés e contato com chiqueiro",
                "Reconhecer lesão parasitária e orientar ambiente",
                "Confundir com escabiose ou esporotricose"
              ],
              [
                "Impetigo bolhoso · URGÊNCIA",
                "Bolhas flácidas amareladas não agrupadas sem sintomas sistêmicos",
                "Reconhecer infecção cutânea neonatal localizada",
                "Tratar como herpes ou queimadura"
              ],
              [
                "Doença mão-pé-boca",
                "Vesículas orais, mãos e pés em lactente",
                "Orientar familiares",
                "Internar rotineiramente ou negar complicações raras"
              ],
              [
                "⚠ Sepse pediátrica · URGÊNCIA",
                "Infecção, lactato alto e acidose com perfusão preservada",
                "Classificar gravidade clínica",
                "Usar leucocitose isolada ou chamar choque sem hipotensão refratária"
              ],
              [
                "Febre reumática",
                "Faringite prévia, artrite migratória e sopro novo",
                "Identificar agente e erradicação",
                "Tratar como artrite séptica ou Lyme"
              ],
              [
                "SIM-P associada à covid-19 · URGÊNCIA",
                "Febre 5 dias, choque, GI, conjuntivite e covid há 4 semanas",
                "Reconhecer síndrome",
                "Confundir com Kawasaki clássica ou apendicite"
              ],
              [
                "Sarampo · URGÊNCIA",
                "Febre, tosse, conjuntivite, exantema e manchas de Koplik",
                "Reconhecer e prescrever vitamina A",
                "Tratar como conjuntivite ou influenza"
              ],
              [
                "Furunculose de repetição",
                "Nódulos dolorosos com pus, flutuação e cicatrizes em áreas de atrito",
                "Reconhecer diagnóstico",
                "Chamar foliculite superficial ou celulite sem coleção"
              ],
              [
                "Meningite meningocócica · URGÊNCIA",
                "Lactente febril, fontanela abaulada e púrpura",
                "Interpretar LCR e bacterioscopia",
                "Escolher padrão viral/tuberculoso ou Gram positivo"
              ],
              [
                "Tungíase",
                "Pápula plantar com centro negro após andar descalço",
                "Diagnóstico e manejo na UBS",
                "Confundir com larva migrans ou verruga"
              ],
              [
                "Doença de Kawasaki",
                "Febre prolongada com sinais mucocutâneos",
                "Reconhecimento e complicação",
                "Não associar ao risco coronariano"
              ],
              [
                "Dermatite atópica",
                "Eczema pruriginoso e história familiar atópica",
                "Diagnóstico clínico",
                "Confundir distribuição típica com escabiose"
              ],
              [
                "Dengue na criança",
                "Febre, exantema e contexto epidemiológico",
                "Avaliação e acompanhamento",
                "Desconsiderar fase crítica e orientar retorno apenas por persistência"
              ],
              [
                "Faringoamigdalite estreptocócica",
                "Febre e exsudato amigdaliano",
                "Tratamento e prevenção de febre reumática",
                "Não distinguir erradicação do agente de alívio sintomático"
              ],
              [
                "Tungíase e controle ambiental",
                "Lesões nos pés e criação de porcos",
                "Manejo integrado",
                "Tratar somente pele sem ambiente e prevenção"
              ],
              [
                "Dengue: prova do laço",
                "Manguito, tempo e petéquias na criança",
                "Executar e interpretar teste",
                "Usar tempo e corte do adulto"
              ],
              [
                "Larva migrans cutânea",
                "Lesão serpiginosa pruriginosa",
                "Diagnóstico e tratamento",
                "Manter corticoide tópico sem tratar parasita"
              ],
              [
                "Mononucleose infecciosa",
                "Astenia, adenopatia posterior e tonsilite",
                "Diagnóstico clínico",
                "Confundir toda amigdalite exsudativa com estreptococo"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "neonatologia",
      "tipo": "tema",
      "titulo": "Neonatologia",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Convulsão neonatal: hierarquia etiológica na pergunta geral",
              "texto": "Pergunta geral sobre convulsão neonatal sem pista específica: primeira hipótese = hipóxia-isquemia.",
              "trava": "Convulsão neonatal sem pista específica: primeiro penso em hipóxia-isquemia."
            },
            {
              "titulo": "⚠ Hipotermia terapêutica na EHI — elegibilidade antes da gravidade",
              "texto": "Regra do simulado: ≥35 sem, ≥1.800 g e início até 6 h; depois critérios de asfixia e EHI moderada/grave. 33+2 sem e 1.710 g = inelegível mesmo grave. Não iniciar na sala de parto por reflexo; prevenir hipertermia.",
              "trava": "Antes de esfriar o cérebro, confira idade, peso e relógio."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Hipotermia terapêutica na EHI",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "RN com quadro neurológico grave sugestivo de EHI"
              },
              {
                "tipo": "decisao",
                "texto": "Elegível? ≥35 semanas, ≥1.800 g e início até 6 h",
                "ramos": [
                  {
                    "rotulo": "Não (ex.: 33+2 sem, 1.710 g)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Fora da indicação consolidada usual (<35 sem), mesmo se grave"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Confirmar critérios de asfixia e EHI moderada/grave → hipotermia"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Não iniciar na sala de parto por reflexo; prevenir hipertermia; estabilizar/transferir"
              },
              {
                "tipo": "atencao",
                "texto": "Números = regra da banca/serviço; protocolos podem variar"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Neonatologia",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Hérnia diafragmática congênita",
                "Abdome escavado, desvio do ictus e ruídos intestinais no tórax",
                "Evitar ventilação com máscara e intubar",
                "Ventilar com balão e distender vísceras torácicas"
              ],
              [
                "Atresia esofágica",
                "Polidrâmnio, sialorreia, tosse, cianose e regurgitação ao mamar",
                "Reconhecer apresentação clássica",
                "Confundir com atresias abdominais"
              ],
              [
                "Perda ponderal neonatal",
                "175 g de 3.500 g em 24 horas, criança hidratada",
                "Calcular porcentagem e interpretar",
                "Errar cálculo ou indicar fórmula sem necessidade"
              ],
              [
                "Triagem neonatal",
                "Lactente de 40 dias sem teste por vulnerabilidade",
                "Reconhecer exceção de coleta",
                "Afirmar que após 28 dias não há qualquer possibilidade"
              ],
              [
                "Infecções congênitas · URGÊNCIA",
                "Conjunto de sinais neonatais específicos",
                "Associar achados à etiologia",
                "Misturar achados de rubéola, sífilis, toxoplasmose e herpes"
              ],
              [
                "Cisto tireoglosso",
                "Massa mediana móvel com protrusão da língua",
                "Reconhecer diagnóstico",
                "Confundir com tireoide ectópica ou higroma lateral"
              ],
              [
                "Atresia biliar · URGÊNCIA",
                "Icterícia, colúria, acolia e fígado firme após 2 semanas",
                "Reconhecer urgência diagnóstica",
                "Atribuir ao leite materno ou observar por ganho ponderal"
              ],
              [
                "Choque neonatal · URGÊNCIA",
                "14 dias, halo umbilical, má perfusão e insuficiência respiratória",
                "Classificar choque e iniciar pacote terapêutico",
                "Confundir hepatomegalia com cardiogênico"
              ],
              [
                "Megacólon congênito",
                "Sem mecônio, distensão, vômito bilioso e fezes explosivas fétidas",
                "Reconhecer complicação grave",
                "Confundir com tampão/íleo meconial sem integrar evolução tóxica"
              ],
              [
                "Desconforto respiratório neonatal",
                "Taquipneia e retrações com preservação hemodinâmica",
                "Suporte inicial",
                "Intubar e administrar surfactante sem critérios do cenário"
              ],
              [
                "Eritema tóxico neonatal",
                "Pápulas com halo no RN saudável",
                "Reconhecimento clínico",
                "Investigar ou tratar dermatose transitória como infecção"
              ],
              [
                "⚠ Sífilis congênita",
                "Pseudoparalisia dolorosa e ausência de pré-natal",
                "Diagnóstico e tratamento",
                "Atribuir a déficit motor primário ou trauma"
              ],
              [
                "Oftalmia neonatal",
                "Secreção purulenta abundante e infecção materna",
                "Etiologia e tratamento",
                "Definir agente apenas pelo dia de início; X preservado"
              ],
              [
                "Hipoglicemia neonatal: filho de mãe diabética",
                "RN macrossômico e mãe com DM gestacional",
                "Monitorização do recém-nascido de risco",
                "Tratar sem aferição ou ignorar risco no assintomático"
              ],
              [
                "Infecção urinária no recém-nascido",
                "Febre e urina fortemente sugestiva de infecção",
                "Internação e tratamento imediato",
                "Esperar resultado da cultura para iniciar antibiótico"
              ],
              [
                "Icterícia neonatal grave",
                "Hemólise, idade em horas e resposta à fototerapia",
                "Interpretar limiar e escolher hemocomponente",
                "Usar apenas zona de Kramer ou sangue sem conferir compatibilidade"
              ],
              [
                "Diferenças do desenvolvimento sexual no recém-nascido",
                "Genitália masculina sem gônadas palpáveis",
                "Investigação e decisão multidisciplinar",
                "Definir abordagem apenas pela aparência externa"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "neuro-e-saude-mental-infantil",
      "tipo": "tema",
      "titulo": "Neuro e saúde mental infantil",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Convulsão febril: recorrência histórica não é repetição em 24 h",
              "texto": "Febril complexa = focal, ≥15 min ou >1 crise em 24 h. Repetir meses depois não torna complexa.",
              "trava": "Complexa repete em 24 h; repetir meses depois não basta."
            },
            {
              "titulo": "Deficiência intelectual: o padrão global vem antes da agitação",
              "texto": "TDAH prejudica o desempenho; deficiência intelectual compromete o desenvolvimento global — reconhecer o padrão global antes de atribuir à agitação.",
              "trava": "TDAH bagunça o desempenho; deficiência intelectual compromete o desenvolvimento global."
            },
            {
              "titulo": "Shapiro: associação rara, revisão",
              "texto": "Associação rara; item de revisão P2 (sem detalhes no trecho)."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Convulsão febril: simples x complexa",
            "colunas": [
              "Tipo",
              "Critério",
              "Armadilha"
            ],
            "linhas": [
              [
                "Complexa",
                "Focal, ≥15 min ou >1 em 24 h",
                "Chamar de complexa por recorrência meses depois"
              ],
              [
                "Simples (caiu)",
                "Generalizada, curta (ex.: 2 ou 7 min), única em 24 h, exame normal/recuperação",
                "Pedir EEG/imagem/punção ou anticonvulsivante contínuo"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Neuro e saúde mental infantil",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "TDAH",
                "Uso crônico com boa resposta",
                "Acompanhar segurança e reavaliar necessidade",
                "Pedir exames sem indicação ou delegar todo seguimento"
              ],
              [
                "Esclerose tuberosa",
                "Espasmos em flexão, manchas hipomelanóticas e SEGA",
                "Reconhecer síndrome neurocutânea",
                "Confundir com outras facomatoses"
              ],
              [
                "Convulsão febril",
                "Generalizada, 2 minutos, única em 24 horas e exame normal",
                "Evitar investigação e profilaxia",
                "Solicitar EEG/imagem ou anticonvulsivante contínuo"
              ],
              [
                "Cisto tireoglosso",
                "Massa mediana móvel com protrusão da língua",
                "Reconhecer diagnóstico",
                "Confundir com tireoide ectópica ou higroma lateral"
              ],
              [
                "Convulsão febril",
                "Criança bem, febre curta e convulsão simples há 2 anos",
                "Tratar febre atual e orientar família",
                "Pedir exames ou internar apenas pelo antecedente"
              ],
              [
                "Transtorno do espectro autista",
                "Alterações de comunicação, comportamento e socialização",
                "Definir idades de rastreamento",
                "Misturar vigilância do desenvolvimento com cronograma fixo incorreto"
              ],
              [
                "Transtornos disruptivos",
                "Desafia autoridade, culpa terceiros e irrita-se diante de limites",
                "Diferenciar padrão comportamental",
                "Confundir irritabilidade episódica com bipolaridade ou DMDD"
              ],
              [
                "Transtorno do espectro autista",
                "Déficits sociais, linguagem restrita e comportamento repetitivo aos 3 anos",
                "Encaminhar sem espera diagnóstica prolongada",
                "Aguardar meses ou limitar a fonoaudiologia"
              ],
              [
                "Parassonia",
                "Gritos e sudorese no sono profundo, não desperta e não lembra",
                "Diferenciar eventos do sono",
                "Confundir com pesadelo ou sonambulismo"
              ],
              [
                "Doença de Legg-Calvé-Perthes · URGÊNCIA",
                "Menino de 7 anos, claudicação crônica e achatamento epifisário",
                "Reconhecer diagnóstico",
                "Confundir com epifisiólise do adolescente ou sinovite aguda"
              ],
              [
                "Nistagmo no lactente",
                "Movimento ocular oscilatório aos 3 meses",
                "Reconhecimento e encaminhamento",
                "Chamar de estrabismo benigno e tranquilizar"
              ],
              [
                "Convulsão febril simples",
                "Crise generalizada de 7 minutos e recuperação",
                "Classificação e investigação",
                "Pedir neuroimagem ou punção indiscriminadamente"
              ],
              [
                "Transtorno de aprendizagem",
                "Dificuldade escolar sem causa sensorial ou neurológica identificada",
                "Avaliação inicial",
                "Prescrever ou rotular antes de avaliação específica"
              ],
              [
                "Sinais precoces de alteração do desenvolvimento social",
                "Pouco contato visual e ausência de gesto social aos 9 meses",
                "Estimulação e seguimento",
                "Fechar TEA de imediato ou tranquilizar sem acompanhamento"
              ],
              [
                "Transtorno do déficit de atenção e hiperatividade",
                "Desatenção e hiperatividade persistentes em contextos distintos",
                "Avaliação diagnóstica",
                "Diagnosticar apenas pela queixa escolar ou alimentação"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "diarreia-desidratacao-e-gastro-pediatrica",
      "tipo": "tema",
      "titulo": "Diarreia, desidratação e gastro pediátrica",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "DRGE no lactente — mamada antes do remédio",
              "texto": "Lactente cresce bem, sem hematêmese/recusa/falha ponderal → revisar alimentação e técnica. Inicial: evitar superalimentação, volumes menores/frequentes, espessar quando apropriado; procinético não é rotina. Nenhum exame é soberano.",
              "trava": "No refluxo do lactente, mexa na MAMADA antes do remédio; nenhum exame reina sozinho."
            },
            {
              "titulo": "Diarreia aguda aos 5 meses — sinais leves ainda fazem Plano B",
              "texto": "Mucosas levemente secas + prega retornando lentamente = alguma desidratação → Plano B: SRO 50–100 mL/kg em 4–6 h, assistido, mantendo aleitamento, reavaliar antes da alta. Ajustar pela resposta e protocolo vigente.",
              "trava": "Dois sinais de B continuam sendo B; leve não é zero."
            },
            {
              "titulo": "Diarreia aguda aos 9 meses — vômito não transforma B em C",
              "texto": "Ainda bebe + pulso/TEC preservados apesar de vômitos → TRO/SRO assistida no Plano B; pequenos volumes frequentes contornam vômitos. Plano C só com desidratação grave/falência de circulação, consciência ou ingestão.",
              "trava": "B ainda BEBE; C já CAIU."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "DRGE no lactente — exames",
            "colunas": [
              "Item",
              "Papel"
            ],
            "linhas": [
              [
                "EDA",
                "Vê mucosa/complicações"
              ],
              [
                "pH-impedanciometria",
                "Correlaciona refluxo e sintomas"
              ],
              [
                "Contraste",
                "Avalia anatomia; não confirma DRGE"
              ],
              [
                "Manejo inicial",
                "Evitar superalimentação, volumes menores/frequentes, espessamento quando apropriado"
              ],
              [
                "Procinético",
                "Não é rotina (fisiopatologia plausível ≠ tratamento recomendado)"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Diarreia aguda — Plano B x Plano C",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Lactente com diarreia aguda"
              },
              {
                "tipo": "avaliar",
                "texto": "Sinais 'leves' (mucosas levemente secas + prega lenta) = alguma desidratação; leve não é zero"
              },
              {
                "tipo": "decisao",
                "texto": "Desidratação grave / falência de circulação, consciência ou ingestão?",
                "ramos": [
                  {
                    "rotulo": "Não (ainda bebe, pulso/TEC ok)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Plano B: SRO 50–100 mL/kg em 4–6 h, assistido, manter aleitamento, reavaliar antes da alta"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Plano C, conforme classificação clínica"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Vômito isolado não é critério de Plano C; pequenos volumes frequentes contornam vômitos"
              }
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
                "⚠ Constipação funcional · URGÊNCIA",
                "Massa em FIE, cíbalos e evacuações a cada 4 dias",
                "Realizar desimpactação antes da manutenção",
                "Começar apenas dieta/toalete ou usar óleo mineral inadequadamente"
              ],
              [
                "Choque hipovolêmico · URGÊNCIA",
                "Extremidades frias, pulsos fracos e TEC 4 s em lactente de 9 kg",
                "Diferenciar choque de desidratação grave e calcular bolus",
                "Usar Plano C lento ou solução glicosada em choque"
              ],
              [
                "Cólera · URGÊNCIA",
                "Água de arroz, odor de peixe, surto e falta de saneamento",
                "Reconhecer diagnóstico epidemiológico",
                "Confundir com rotavírus ou giardíase"
              ],
              [
                "Desidratação por diarreia · URGÊNCIA",
                "Desidratação moderada e cinco vômitos na primeira hora",
                "Escalonar para gastróclise",
                "Abandonar precocemente TRO e partir para venóclise"
              ],
              [
                "Megacólon congênito",
                "Sem mecônio, distensão, vômito bilioso e fezes explosivas fétidas",
                "Reconhecer complicação grave",
                "Confundir com tampão/íleo meconial sem integrar evolução tóxica"
              ],
              [
                "Diarreia aguda sem desidratação",
                "Lactente ativo, hidratado, sem febre ou vômito",
                "Orientar hidratação e alimentação",
                "Restringir dieta/leite, prescrever antibiótico ou internar"
              ],
              [
                "Doença de Hirschsprung com enterocolite",
                "Aganglionose, atraso do mecônio e deterioração sistêmica",
                "Tratamento definitivo após estabilização",
                "Confundir manejo da emergência com operação definitiva"
              ],
              [
                "Estenose hipertrófica do piloro",
                "Vômitos não biliosos, oliva e alcalose hipoclorêmica",
                "Reconhecimento e sequência terapêutica",
                "Operar antes de corrigir desidratação e eletrólitos"
              ],
              [
                "Desidratação grave por diarreia",
                "Letargia, pulso débil e enchimento capilar prolongado",
                "Reposição volêmica inicial",
                "Misturar esquemas de choque e Plano C; X preservado"
              ],
              [
                "Diarreia aguda sem desidratação",
                "Criança ativa, hidratada e aceitando líquidos",
                "Classificação e manejo domiciliar",
                "Indicar expansão venosa sem desidratação"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "hematologia-e-oncologia-pediatrica",
      "tipo": "tema",
      "titulo": "Hematologia e oncologia pediátrica",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "PTI 1: plaquetopenia isolada antes de pensar em leucemia",
              "texto": "Criança bem + pós-virose + plaqueta isoladamente baixa = PTI. Tratar o sangramento, não o número.",
              "trava": "Criança bem + pós-virose + plaqueta isoladamente baixa = PTI. Na PTI, trato o sangramento, não o número."
            },
            {
              "titulo": "PTI 2: 64 mil plaquetas e pele apenas não impõem corticoide",
              "texto": "PTI pediátrica: tratar o sangramento, não o hemograma. Petéquia não é indicação automática de corticoide.",
              "trava": "PTI pediátrica: trato o sangramento, não o hemograma. PETÉQUIA NÃO É INDICAÇÃO AUTOMÁTICA DE CORTICOIDE."
            },
            {
              "titulo": "⚠ Rastreamento de ferro — baixo peso ao nascer muda a conduta",
              "texto": "Nascimento <2.500 g, prematuridade e outros fatores de risco → avaliação laboratorial conforme protocolo; ferritina junto com marcador inflamatório. Cutoff neonatal (ex.: 2.300 g) pesa mais que dieta (veganismo); suplementação não apaga o risco.",
              "trava": "⚠ Nasceu <2.500 g? Aos 9–12 meses, lembre hemograma + ferritina + PCR."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Rastreamento de ferro — fator de risco neonatal",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Lactente com dado chamativo de dieta (ex.: veganismo)"
              },
              {
                "tipo": "decisao",
                "texto": "Nasceu <2.500 g, prematuro ou outro fator de risco?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Aos 9–12 meses: hemograma + ferritina + PCR, conforme protocolo"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Seguir protocolo habitual"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Suplementação correta não apaga status de risco; dieta familiar não substitui cutoff neonatal"
              }
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
                "⚠ Anemia ferropriva · IMAGEM",
                "Quadro clínico e hemograma compatíveis",
                "Prescrever dose terapêutica e monitorar reticulócitos",
                "Usar ferro sérico isolado ou encaminhar antes de tratar"
              ],
              [
                "⚠ Anemia ferropriva · IMAGEM",
                "1 L de leite/dia e ferro 2 mg/kg/dia sem resposta",
                "Corrigir dose e fatores alimentares",
                "Chamar resistência ou talassemia antes de otimizar tratamento"
              ],
              [
                "Leucemia linfoblástica aguda",
                "Falha na terapia de indução",
                "Definir momento de inscrição",
                "Esperar alta ou testar toda família antes de referenciar"
              ],
              [
                "Síndrome torácica aguda · URGÊNCIA",
                "Febre, dor torácica, hipoxemia e redução do MV",
                "Reconhecer e internar",
                "Confundir com TEP ou observar sem antibiótico"
              ],
              [
                "Púrpura trombocitopênica imune · URGÊNCIA · IMAGEM",
                "Púrpura não palpável pós-febre, criança bem, sem organomegalia",
                "Diferenciar causas de púrpura",
                "Confundir com vasculite IgA, dengue grave ou leucemia"
              ],
              [
                "Traço falciforme",
                "Heterozigose em RN eutrófico",
                "Interpretar triagem e orientar família",
                "Confundir traço com doença falciforme"
              ],
              [
                "⚠ Deficiência de G6PD",
                "RN com hemólise não imune e contexto familiar",
                "Diagnóstico de icterícia prolongada",
                "Assumir incompatibilidade ABO como explicação suficiente"
              ],
              [
                "Reação transfusional aguda",
                "Febre e sintomas durante transfusão",
                "Diagnóstico diferencial",
                "Classificar reação apenas pela febre sem avaliar hemólise"
              ],
              [
                "Herança do traço falciforme",
                "Pai HbAS e mãe HbAA",
                "Probabilidade genética",
                "Confundir chance de traço com chance de doença"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "algoritmos-pediatria",
      "tipo": "algoritmos",
      "titulo": "Algoritmos — Pediatria",
      "resumo": "Fluxos para não confundir na hora da prova",
      "elementos": [
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Diarreia — planos",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Desidratação?",
                "ramos": [
                  {
                    "rotulo": "Sem",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Plano A"
                      }
                    ]
                  },
                  {
                    "rotulo": "Alguma",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Plano B: SRO 50–100 mL/kg em 4–6 h"
                      }
                    ]
                  },
                  {
                    "rotulo": "Grave",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Plano C: 30 + 70 mL/kg, tempos por idade"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "⚠ Reanimação neonatal 2026 (SBP)",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "Apneia ou FC <100 → VPP"
              },
              {
                "tipo": "avaliar",
                "texto": "O₂ inicial: ≥34 sem 21%; <34 sem 60% (documento SBP 2026)"
              },
              {
                "tipo": "conduta",
                "texto": "FC <60 após VPP efetiva → cânula + O₂ 100% + 3:1; depois adrenalina"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "contrastes-pediatria",
      "tipo": "contrastes",
      "titulo": "Contrastes — Pediatria",
      "resumo": "Pares parecidos o bastante para serem trocados",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de Pediatria",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "PTI × vasculite IgA × SHU",
                "PTI",
                "Plaquetas baixas sem hemólise"
              ],
              [
                "",
                "Vasculite IgA",
                "Púrpura palpável MMII/glúteos + plaquetas normais"
              ],
              [
                "",
                "SHU",
                "Anemia hemolítica microangiopática + plaquetopenia + rim"
              ],
              [
                "Piloro × Hirschsprung × NEC × intussuscepção",
                "Estenose de piloro",
                "2–8 semanas, jato não bilioso"
              ],
              [
                "",
                "Hirschsprung",
                "Mecônio tardio / constipação crônica"
              ],
              [
                "",
                "NEC",
                "Prematuro doente + pneumatose"
              ],
              [
                "",
                "Intussuscepção",
                "Dor episódica / letargia ± geleia"
              ],
              [
                "DMSA × MAG3 × cistografia",
                "DMSA",
                "Cicatriz cortical"
              ],
              [
                "",
                "MAG3",
                "Drenagem / função dinâmica"
              ],
              [
                "",
                "Cistografia",
                "Refluxo vesicoureteral"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "numeros-que-derrubam-pediatria",
      "tipo": "numeros",
      "titulo": "Números que derrubam — Pediatria",
      "resumo": "Cutoffs, doses, janelas e prazos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números de Pediatria",
            "colunas": [
              "Item",
              "Número/corte",
              "Observação"
            ],
            "linhas": [
              [
                "Diarreia Plano B",
                "SRO 50–100 mL/kg em 4–6 h",
                ""
              ],
              [
                "Diarreia Plano C ≥1 a",
                "30 mL/kg em 30 min + 70 mL/kg em 2h30",
                ""
              ],
              [
                "Diarreia Plano C <1 a",
                "30 mL/kg em 1 h + 70 mL/kg em 5 h",
                ""
              ],
              [
                "Anafilaxia pediátrica",
                "Adrenalina IM 0,01 mg/kg",
                "Da solução 1 mg/mL"
              ],
              [
                "TDAH",
                "Avaliação possível a partir dos 4 anos",
                "Prejuízo em ≥2 ambientes"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "normativo-pediatria",
      "tipo": "normativo",
      "titulo": "Normativo — Pediatria",
      "resumo": "11 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Atualizações 2026 — Pediatria",
            "colunas": [
              "Norma/tema",
              "O que mudou",
              "Status",
              "Fonte e data"
            ],
            "linhas": [
              [
                "⚠ Nirsevimabe e VSR",
                "Prematuros até 36 semanas e 6 dias: estratégia durante todo o ano",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "<24 meses com comorbidade elegível: sazonal, fevereiro a agosto",
                "",
                ""
              ],
              [
                "",
                "Comorbidades: cardiopatia, broncodisplasia, imunocomprometimento, Down, fibrose cística",
                "",
                ""
              ],
              [
                "",
                "Comorbidades (cont.): doença neuromuscular e anomalia de via aérea",
                "",
                ""
              ],
              [
                "",
                "Trava: A janela sazonal vale para comorbidade; o prematuro é ano todo",
                "",
                ""
              ],
              [
                "⚠ Escorpionismo — PCDT 2026",
                "Leve: sem soro. Moderado: 3 ampolas. Grave: 6 ampolas",
                "Confirmada",
                "PCDT dos Acidentes Escorpiônicos 2025/2026"
              ],
              [
                "",
                "Observação: sem manifestação 4 h; leve 6–12 h; recebeu antiveneno 24 h; instável → UTI",
                "",
                ""
              ],
              [
                "",
                "Criança ≤10 anos, especialmente <7, tem maior risco de gravidade",
                "",
                ""
              ],
              [
                "",
                "Tityus obscurus: atenção a manifestações neurológicas",
                "",
                ""
              ],
              [
                "",
                "Trava: Hoje são 3 e 6 ampolas — materiais anteriores usavam 2–3 e 4–6",
                "",
                ""
              ],
              [
                "⚠ Vacina da dengue — Qdenga",
                "Adolescentes de 10 a 14 anos, expansão para todo o território nacional",
                "Confirmada",
                "Calendário 2026"
              ],
              [
                "",
                "Duas doses: D0 e +3 meses. Não exige infecção prévia comprovada",
                "",
                ""
              ],
              [
                "",
                "Trava: Não exige sorologia prévia — diferente da vacina anterior",
                "",
                ""
              ],
              [
                "⚠ Triagem auditiva neonatal — 1-2-3",
                "Sai 1-3-6, entra 1-2-3: triagem até 1 mês, diagnóstico até 2, intervenção até 3 meses",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "Reteste até o 15º dia",
                "",
                ""
              ],
              [
                "",
                "Alto risco pode ir direto à avaliação especializada: meningite neonatal, malformação de orelha, >3 meses de UTI",
                "",
                ""
              ],
              [
                "",
                "Trava: 1 mês triagem, 2 diagnóstico, 3 intervenção",
                "",
                ""
              ],
              [
                "⚠ Roma V pediátrico",
                "SII-C não exige mais teste terapêutico de constipação. Idade mínima proposta: 6 anos",
                "Confirmada",
                "Roma V pediátrico"
              ],
              [
                "",
                "Dor exclusivamente menstrual exclui. Constipação funcional perde divisões rígidas de idade",
                "",
                ""
              ],
              [
                "",
                "Cólica do lactente renomeada Infant Distress Syndrome",
                "",
                ""
              ],
              [
                "",
                "Trava: Nome novo, mesmo quadro — mudou: teste terapêutico deixa de ser obrigatório",
                "",
                ""
              ],
              [
                "⚠ Profilaxia de ferro — SBP 2026",
                "Termo, saudável, peso adequado: 10–12,5 mg/dia, 6 a 24 meses, 2 ciclos de 3 meses (aos 6 e aos 12 meses)",
                "Confirmada",
                "SBP 2026"
              ],
              [
                "",
                "Prematuro ou baixo peso: iniciar aos 30 dias, dose conforme peso. Entre 12 e 24 meses: 1 mg/kg/dia",
                "",
                ""
              ],
              [
                "",
                "Sem laboratório de rotina em lactente saudável, crescendo e alimentando-se bem",
                "",
                ""
              ],
              [
                "",
                "Trava: Termo ou prematuro? Peso? Qual protocolo e ano?",
                "",
                ""
              ],
              [
                "⚠ Sepse pediátrica 2026",
                "Sem screening generalizado automático — protocolo local de reconhecimento. Lactato ganha papel na gravidade",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "ATB: choque séptico suspeito na 1ª hora; provável sepse sem choque até 3 h",
                "",
                ""
              ],
              [
                "",
                "Vasoativo durante ou após expansão inicial, inclusive periférico",
                "",
                ""
              ],
              [
                "",
                "Não obrigatório adrenalina p/ choque frio e noradrenalina p/ quente. POCUS ganha espaço. Evitar excesso de fluidos",
                "",
                ""
              ],
              [
                "",
                "Trava: Frio e quente deixaram de determinar automaticamente a droga",
                "",
                ""
              ],
              [
                "⚠ Asma de 6 a 11 anos — GINA 2026",
                "Não usar SABA isolado na etapa 1",
                "Confirmada",
                "GINA 2026 pediátrico"
              ],
              [
                "",
                "Iniciou ICS-formoterol como alívio → ao subir, caminha para MART",
                "",
                ""
              ],
              [
                "",
                "Iniciou ICS-SABA → segue para ICS diário em baixa dose",
                "",
                ""
              ],
              [
                "",
                "PRAM incorporado à estratificação das exacerbações em <18 anos",
                "",
                ""
              ],
              [
                "",
                "Trava: SABA sozinho acabou na etapa 1 da manutenção; na crise, SABA com corticoide segue",
                "",
                ""
              ],
              [
                "⚠ VPC20 no SUS",
                "Esquema básico: 2 meses VPC20, 4 meses VPC10, 12 meses VPC20",
                "Confirmada",
                "Calendário Nacional 2026"
              ],
              [
                "",
                "Trava: Pneumo 2026: 20–10–20 no esquema básico",
                "",
                ""
              ],
              [
                "⚠ Poliomielite — reforço aos 4 anos",
                "Desde 03/08/2026, reforço de VIP aos 4 anos. Acabou a VOP: esquema só com VIP",
                "Confirmada",
                "Atualização de 03/08/2026"
              ],
              [
                "",
                "Trava: VIP também aos 4 anos",
                "",
                ""
              ],
              [
                "⚠ Reanimação neonatal — SBP 2026",
                "Boa vitalidade: clampeamento após ≥60 s",
                "Confirmada",
                "SBP 2026"
              ],
              [
                "",
                "Vitalidade ruim: estímulo tátil dorsal delicado ~15 s antes de decidir; melhorou → clampeamento tardio",
                "",
                ""
              ],
              [
                "",
                "Ordenha: considerar em alguns ≥28 sem sem boa vitalidade; <28 semanas contraindicada",
                "",
                ""
              ],
              [
                "",
                "Máscara laríngea: opção inicial ou alternativa ≥34 semanas. Detector colorimétrico de CO₂ após IOT",
                "",
                ""
              ],
              [
                "",
                "Sem resposta após reanimação avançada: discutir interrupção em torno de 20 min",
                "",
                ""
              ],
              [
                "",
                "Prematuros: peça T em destaque; surfactante não é rotina antes da estabilização",
                "",
                ""
              ],
              [
                "",
                "Trava: O estímulo tátil de 15 s entra antes de decidir a VPP",
                "",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-pediatria",
      "tipo": "apostas",
      "titulo": "Apostas — Pediatria",
      "resumo": "7 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Pediatria (1/3) — Puberdade, exantemas, dermato",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Puberdade precoce central",
                "Eixo HHG ativado: LH >0,3 U/L + estradiol ou testosterona"
              ],
              [
                "↳ ação hormonal",
                "Avança idade óssea, acelera crescimento, ↑ mama, útero e ovários, ↑ testículos e pênis"
              ],
              [
                "↳ RM",
                "Sempre RM de hipófise em meninos <8 anos e meninas <6 anos"
              ],
              [
                "Doenças exantemáticas — Sarampo",
                "Paramyxovirus/Morbillivirus; morbiliforme cefalocaudal, febre alta + ≥1: respiratório, conjuntivite, Koplik"
              ],
              [
                "↳ Exantema súbito",
                "Herpes 6 e 7; <2 anos; maculopapular após a febre"
              ],
              [
                "↳ Eritema infeccioso",
                "Parvovírus B19; pré-escolar/escolar; face esbofeteada, rendilhado poupando mãos e pés"
              ],
              [
                "↳ Escarlatina",
                "S. pyogenes; faringoamigdalite, língua em framboesa, Filatov, Pastia, pele em lixa; penicilina benzatina/amoxicilina"
              ],
              [
                "↳ Mononucleose",
                "EBV; febre, linfadenopatia, amigdalite, hepatoesplenomegalia, rash após ATB, linfocitose c/ atipia"
              ],
              [
                "↳ Mão-pé-boca / Varicela",
                "Coxsackie A/B: febre + vesículas mãos, pés, boca. Varicela: pleomorfismo, centrípeta, mucosas e couro cabeludo"
              ],
              [
                "Dermato pediátrica (multimídia) — Escabiose",
                "Muito pruriginosa, túneis, interdigital/axilar (lactente: face e tronco); permetrina ou ivermectina"
              ],
              [
                "↳ Escabiose (cont.)",
                "Enxofre em <2 meses; tratar todos os contatos"
              ],
              [
                "↳ Impetigo",
                "S. aureus ou S. pyogenes; crostoso (S. pyogenes), bolhoso (S. aureus); ATB tópico ou sistêmico"
              ],
              [
                "↳ Molusco contagioso",
                "Poxvírus; pápulas peroladas c/ umbilicação central; autolimitado, curetagem ou crioterapia"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Pediatria (2/3) — TEA/TDAH e abdome obstrutivo",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "TEA e TDAH — TEA",
                "M-CHAT-R/F para todos aos 18 e 24 meses; dx clínico DSM-V"
              ],
              [
                "↳ TEA — dx / tto",
                "Comunicação/interação social + comportamento/interesse repetitivo e restrito; ABA, fono, TO, fisio; sem fármaco específ."
              ],
              [
                "↳ TDAH — triagem",
                "SNAP-IV (≥6 por área sugere); DSM-V: início antes dos 12 a, ≥6 meses, prejuízo, ≥2 ambientes"
              ],
              [
                "↳ TDAH — tto",
                "Desatenção e/ou hiperatividade-impulsividade; treino parental, TCC, psicoestimulantes acima de 6 anos"
              ],
              [
                "Abdome agudo obstrutivo na criança — Megacólon",
                "Constipação refratária, mecônio >48 h, distensão, ampola vazia, fezes explosivas"
              ],
              [
                "↳ Megacólon — dx/tto",
                "RX contrastado sem preparo, manometria, dx por biópsia retal; tratamento cirúrgico"
              ],
              [
                "↳ Estenose de piloro",
                "Vômitos leitosos em jato pós-mamada, perda de peso, alcalose hipoclorêmica e hipocalêmica, oliva"
              ],
              [
                "↳ Piloro — dx/tto",
                "Diagnóstico clínico e ultrassonográfico; estabilização e piloromiotomia"
              ],
              [
                "↳ Invaginação",
                "Dor intermitente, vômitos, fezes em geleia de morango, massa palpável; US alvo/pseudorrim; enema ou cirurgia"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Pediatria (3/3) — Diarreia e vacinas 2026",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "⚠ Diarreia aguda — planos A, B, C",
                "A (sem desidratação): alta, SRO e líquidos, alimentação, zinco 5 dias se <5 anos"
              ],
              [
                "↳ Plano B",
                "SRO 50–100 mL/kg VO em 4–6 h, ondansetrona se vômitos. Hidratou → A; igual → gavagem; piorou → C"
              ],
              [
                "↳ Plano C — critério",
                "2 sinais de desidratação + ≥1: incapaz de beber, hipotônico, comatoso/letárgico, pulsos fracos/ausentes"
              ],
              [
                "↳ Plano C — volumes",
                "SF/RL 30 mL/kg (1 h se <1 a; 30 min se >1 a) → 70 mL/kg (5 h se <1 a; 2 h 30 min se >1 a)"
              ],
              [
                "⚠ Atualizações vacinais 2026 — Rotavírus",
                "1ª dose até 3 m 15 d (alguns materiais citam até 11 m 29 d); 2ª até 23 m 29 d"
              ],
              [
                "↳ Poliomielite",
                "Acabou a VOP: só VIP aos 2, 4 e 6 meses + reforços aos 15 meses e 4 anos"
              ],
              [
                "↳ Adolescente",
                "HPV 1 dose 9–14 a; dengue 2 doses 10–14 a; MenACWY aos 12 meses e entre 11–14 a"
              ],
              [
                "↳ Pneumocócica",
                "Transição (até acabar Pneumo 10): 2 m VPC20, 4 m VPC10, reforço 12 m VPC20. Final: 2, 4, 12 m com VPC20"
              ],
              [
                "↳ peso da família",
                "Imunização ped. 6 q; com vigilância/hesitação vacinal e imunização do adulto = 15 no conjunto"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "TEA — triagem M-CHAT-R/F (18 e 24 meses)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Todas as crianças aos 18 e 24 meses: M-CHAT-R/F"
              },
              {
                "tipo": "decisao",
                "texto": "Pontuação?",
                "ramos": [
                  {
                    "rotulo": "≥8 (alto risco)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Intervenção + avaliação diagnóstica"
                      }
                    ]
                  },
                  {
                    "rotulo": "3–7 (médio)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Entrevista de seguimento; se ≥2 → intervenção + avaliação"
                      }
                    ]
                  },
                  {
                    "rotulo": "0–2 (baixo)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Se <24 meses, repetir aos 24"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Diarreia aguda — planos A, B, C",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Criança com diarreia aguda: avaliar hidratação"
              },
              {
                "tipo": "decisao",
                "texto": "Estado de hidratação?",
                "ramos": [
                  {
                    "rotulo": "Sem desidratação",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "A: alta, SRO, alimentação, zinco 5 d se <5 a"
                      }
                    ]
                  },
                  {
                    "rotulo": "Desidratado",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "B: SRO 50–100 mL/kg em 4–6 h (ondansetrona se vômitos)"
                      },
                      {
                        "tipo": "decisao",
                        "texto": "Reavaliação?",
                        "ramos": [
                          {
                            "rotulo": "Hidratou",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Volta ao A"
                              }
                            ]
                          },
                          {
                            "rotulo": "Igual",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Gavagem"
                              }
                            ]
                          },
                          {
                            "rotulo": "Piorou",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Vai ao C"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "rotulo": "Grave",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "C: 30 mL/kg (1 h <1 a / 30 min >1 a) → 70 mL/kg (5 h <1 a / 2h30 >1 a)"
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
      "id": "pontos-cegos-pediatria",
      "tipo": "pontos-cegos",
      "titulo": "Pontos cegos — Pediatria",
      "resumo": "15 temas que costumam passar despercebidos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Pediatria",
            "colunas": [
              "Tema",
              "Pista",
              "Regra/conduta"
            ],
            "linhas": [
              [
                "Baixa estatura",
                "Alvo baixo, proporções normais, idade óssea pouco atrasada",
                "Baixa estatura familiar. Evitar: confundir c/ atraso constitucional ou displasia"
              ],
              [
                "Cisto tireoglosso",
                "Massa mediana móvel c/ protrusão da língua",
                "Cisto tireoglosso. Evitar: confundir c/ tireoide ectópica ou higroma lateral"
              ],
              [
                "Cólera",
                "Água de arroz, odor de peixe, surto, falta de saneamento",
                "Cólera. Evitar: confundir c/ rotavírus ou giardíase"
              ],
              [
                "Deficiência de G6PD",
                "RN c/ hemólise não imune e contexto familiar",
                "Deficiência de G6PD. Evitar: assumir incompatibilidade ABO como explicação suficiente"
              ],
              [
                "Legg-Calvé-Perthes",
                "Menino 7 a, claudicação crônica, achatamento epifisário",
                "Necrose asséptica da cabeça do fêmur. Evitar: confundir c/ epifisiólise ou sinovite aguda"
              ],
              [
                "Esclerose tuberosa",
                "Espasmos em flexão, manchas hipomelanóticas e SEGA",
                "Esclerose tuberosa. Evitar: confundir c/ outras facomatoses"
              ],
              [
                "Hipovitaminose A",
                "Manchas de Bitot, xeroftalmia e dieta restrita",
                "Vitamina A. Evitar: confundir lesão ocular carencial c/ infecção isolada"
              ],
              [
                "Mononucleose infecciosa",
                "Astenia, adenopatia posterior e tonsilite",
                "Mononucleose. Evitar: tratar toda amigdalite exsudativa como estreptococo"
              ],
              [
                "Parassonia",
                "Gritos e sudorese no sono profundo; não desperta e não lembra",
                "Terror noturno. Evitar: confundir c/ pesadelo ou sonambulismo"
              ],
              [
                "Puericultura na trissomia 21",
                "Hipotonia e instabilidade de quadril",
                "US de quadril + ortopedista pediátrico. Evitar: repetir exames normais e ignorar achado ortopédico"
              ],
              [
                "Atresia esofágica",
                "Polidrâmnio, sialorreia, tosse, cianose e regurgitação ao mamar",
                "Atresia esofágica. Evitar: confundir c/ atresias abdominais"
              ],
              [
                "Doença mão-pé-boca",
                "Vesículas orais, mãos e pés em lactente",
                "Orientar familiares (questão ANULADA). Evitar: internar rotineiramente ou negar complicações raras"
              ],
              [
                "Fibrose cística",
                "Escarro purulento, febre, dispneia e SatO2 87%",
                "Internar; O2 + ATB amplo espectro IV; cultura de escarro. Evitar: aguardar TC ou tratar em casa"
              ],
              [
                "Tungíase",
                "Pápula amarelada c/ ponto preto nos pés; contato c/ chiqueiro",
                "Retirada manual + tto tópico e sistêmico; usar calçados. Evitar: confundir c/ escabiose/esporotricose"
              ],
              [
                "Atresia biliar",
                "Icterícia, colúria, acolia e fígado firme após 2 semanas",
                "Icterícia obstrutiva → encaminhar urgente p/ avaliação. Evitar: atribuir ao leite materno/observar"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "travas-pediatria",
      "tipo": "travas",
      "titulo": "Travas — Pediatria",
      "resumo": "34 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Pediatria",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "Formoterol",
                "FORMOTEROL é a exceção do LABA: rápido e, com ICS, pode manter + aliviar"
              ],
              [
                "Bronquiolite",
                "Típica: suporte primeiro; remédio de rotina é a pegadinha"
              ],
              [
                "CAD",
                "Colhe enquanto hidrata; soro não espera o laboratório"
              ],
              [
                "ITU — imagem",
                "DMSA vê CICATRIZ; MAG3 vê ESCOAR; cistografia vê VOLTAR"
              ],
              [
                "Refluxo do lactente",
                "Mexa na MAMADA antes do remédio; nenhum exame reina sozinho"
              ],
              [
                "Atraso x regressão",
                "Nunca fez = atraso. Fazia e parou = regressão"
              ],
              [
                "Sarampo x rubéola",
                "Sarampo = três C + Koplik + aerossol; rubéola chama gânglio retroauricular"
              ],
              [
                "HDC",
                "Não encha o estômago no tórax — tubo na traqueia e sonda no estômago"
              ],
              [
                "Nefrótico + febre",
                "Nefrótico + febre + barriga peritoneal = pense pneumococo antes da trombose"
              ],
              [
                "Pneumonia infantil",
                "Idade muda a frequência; gravidade muda o destino"
              ],
              [
                "RN bradicárdico",
                "Costuma precisar de AR antes de braço"
              ],
              [
                "SHU",
                "A hemácia QUEBRA; ela não nasce pequena"
              ],
              [
                "PTI pediátrica",
                "Trato o sangramento, não o hemograma. Petéquia não é indicação automática de corticoide"
              ],
              [
                "Convulsão febril complexa",
                "Focal, ≥15 min ou >1 em 24 h; repete em 24 h — repetir meses depois não basta"
              ],
              [
                "TDAH x DI",
                "TDAH bagunça o desempenho; deficiência intelectual compromete o desenvolvimento global"
              ],
              [
                "Convulsão neonatal",
                "Sem pista específica: primeiro penso em hipóxia-isquemia"
              ],
              [
                "Shapiro",
                "Hipotermia episódica + hiperidrose + agenesia do corpo caloso = Shapiro, não tumor hipotalâmico"
              ],
              [
                "Sífilis congênita",
                "Parceiro não tratado aumenta reinfecção; não invalida sozinho o tto materno. Mãe 1:4 → RN 1:16 = 4x"
              ],
              [
                "Oxiúrus",
                "Paciente + casa + higiene + repetir"
              ],
              [
                "DDQ",
                "Quadril pequeno = US; chegou em ~6 meses = pense RX e ortopedia"
              ],
              [
                "OMA",
                "Sem melhora em 48–72 h = reavaliar e trocar, não esperar por fé"
              ],
              [
                "Criptorquidia",
                "Palpável >6 meses: encaminha/opera, não pede imagem por rotina"
              ],
              [
                "Desidratação B",
                "Dois sinais de B continuam sendo B; leve não é zero"
              ],
              [
                "Desidratação B x C",
                "B ainda BEBE; C já CAIU"
              ],
              [
                "⚠ Dengue C",
                "Não é hidrata e manda embora"
              ],
              [
                "Aleitamento exclusivo",
                "Regra geral é 6; quatro meses só no cenário específico e com prontidão"
              ],
              [
                "Urticária x anafilaxia",
                "Urticária sozinha é alergia; anafilaxia vai além da pele"
              ],
              [
                "Nasceu <2.500 g",
                "Aos 9–12 meses, lembre hemograma + ferritina + PCR"
              ],
              [
                "Hipotermia terapêutica",
                "Antes de esfriar o cérebro, confira idade, peso e relógio"
              ],
              [
                "⚠ Audição 2026",
                "1 mês triagem, 2 diagnóstico, 3 intervenção"
              ],
              [
                "⚠ Ferro",
                "Antes de puxar ferro: termo ou prematuro? Peso? Qual protocolo e ano?"
              ],
              [
                "⚠ Asma 6 a 11 anos",
                "SABA sozinho também acabou"
              ],
              [
                "⚠ Pneumo 2026",
                "20–10–20 no esquema básico"
              ],
              [
                "⚠ Polio 2026",
                "VIP também aos 4 anos"
              ]
            ]
          }
        }
      ]
    }
  ]
};
