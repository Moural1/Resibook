/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const CLINICA_MEDICA: AreaDossie = {
  "id": "clinica-medica",
  "nome": "Clínica Médica",
  "blocos": [
    {
      "id": "emergencia-pcr-choque-sepse-intoxicacoes",
      "tipo": "tema",
      "titulo": "Emergência — PCR, choque, sepse, intoxicações",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Insuficiência cardíaca aguda — molhado não significa frio",
              "texto": "Quente/úmido hipertensivo → VNI/oxigenação conforme necessidade + vasodilatação (nitrato) + diurético conforme contexto. Frio/úmido hipotenso → sustentar pressão/perfusão; noradrenalina se necessária; inotrópico se baixo débito persistir.",
              "trava": "Hipertenso e molhado: vasodilata e seca. Hipotenso e frio: sustenta e perfunde."
            },
            {
              "titulo": "⚠ Sepse x choque séptico",
              "texto": "Choque séptico exige, após volume adequado: necessidade de vasopressor para manter PAM ≥65 E lactato >2 mmol/L. Lactato >2 e creatinina elevada isolados não definem choque.",
              "trava": "⚠ Lactato alto não basta: choque séptico precisa VASOPRESSOR + lactato >2 apesar de volume."
            },
            {
              "titulo": "Isquemia mesentérica — instabilidade muda a etapa",
              "texto": "Peritonite franca → laparotomia de emergência, avaliar alça, revascularização/ressecção conforme achados, preservando o máximo de intestino; second look pode ser necessário. Estável sem peritonite → estratégia endovascular/angiográfica.",
              "trava": "Isquemia mesentérica + peritonite/choque = centro cirúrgico, não exame demorado."
            },
            {
              "titulo": "Dengue pediátrica — Grupo C não recebe alta após melhora inicial",
              "texto": "Grupo C → hidratação EV conforme protocolo, monitorar perfusão, diurese, hematócrito e evolução; MS: internação até estabilização, no mínimo 48 h. Choque/disfunção grave → Grupo D.",
              "trava": "Dengue C não é hidrata e manda embora."
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
                "IC aguda",
                "Associou 'muito congesto' a 'baixo débito' e cogitou dobutamina",
                "PA alta + estertores/ortopneia/hipoxemia = congestão com perfusão preservada até prova em contrário",
                "Dobutamina não é resposta automática para todo edema pulmonar"
              ],
              [
                "Sepse x choque séptico",
                "Lactato >2 e creatinina elevada tratados como se definissem choque",
                "Foco + disfunção (creatinina 1,9), hipotensão corrigida após cristaloide; lactato 2,2",
                "—"
              ],
              [
                "Isquemia mesentérica",
                "Escolheu arteriografia como se estável e sem suspeita de necrose transmural",
                "Choque + defesa/peritonite + pneumatoses/distensão importante",
                "Alternativa pode nomear exame verdadeiro, mas na etapa errada"
              ],
              [
                "Dengue pediátrica C",
                "Classificação certa; etapa seguinte e tempo de observação errados",
                "Vômitos persistentes + hepatomegalia na defervescência, sem sinais de choque",
                "Melhora após 1º volume é resposta a monitorar, não atalho para casa"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "IC aguda — perfil hemodinâmico",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "IC aguda congesta (úmida)"
              },
              {
                "tipo": "decisao",
                "texto": "PA/perfusão?",
                "ramos": [
                  {
                    "rotulo": "PA alta (quente/úmido)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "VNI/oxigenação conforme necessidade + nitrato + diurético conforme contexto"
                      }
                    ]
                  },
                  {
                    "rotulo": "Hipotenso (frio/úmido)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Sustentar pressão/perfusão; noradrenalina quando necessária"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Considerar inotrópico se baixo débito persistir"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Muito congesto ≠ baixo débito; dobutamina não é automática"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "⚠ Sepse x choque séptico",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Foco infeccioso + disfunção orgânica = sepse"
              },
              {
                "tipo": "conduta",
                "texto": "Volume adequado"
              },
              {
                "tipo": "decisao",
                "texto": "Precisa de vasopressor p/ PAM ≥65 E lactato >2 mmol/L?",
                "ramos": [
                  {
                    "rotulo": "Sim (ambos)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Choque séptico"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Sepse (ex.: hipotensão corrigida com cristaloide, lactato 2,2)"
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
            "titulo": "Isquemia mesentérica — etapa certa",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Suspeita de isquemia mesentérica"
              },
              {
                "tipo": "decisao",
                "texto": "Peritonite/choque?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Laparotomia de emergência; revascularização/ressecção preservando intestino; second look se preciso"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (estável)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Estratégia endovascular/angiográfica conforme anatomia e expertise"
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
            "titulo": "Dengue pediátrica Grupo C",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Sinais de alarme (vômitos persistentes, hepatomegalia) na defervescência, sem choque"
              },
              {
                "tipo": "conduta",
                "texto": "Hidratação EV conforme protocolo"
              },
              {
                "tipo": "conduta",
                "texto": "Monitorar perfusão, diurese, hematócrito e evolução"
              },
              {
                "tipo": "decisao",
                "texto": "Choque/disfunção grave?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Reclassificar como Grupo D"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Internação até estabilização, no mínimo 48 h"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Melhora após o 1º volume não autoriza alta"
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
                "⚠ Sepse de foco urinário · URGÊNCIA",
                "Febre, taquicardia, taquipneia e neutrofilia em diabética",
                "Iniciar tratamento na primeira hora",
                "Esperar culturas ou manter amplo espectro sem descalonar"
              ],
              [
                "Intoxicação por benzodiazepínico · URGÊNCIA",
                "Ingestão recente de clonazepam com coma e ventilação",
                "Identificar flumazenil no cenário proposto",
                "Confundir com naloxona ou usar sem considerar contraindicações clínicas"
              ],
              [
                "DPP · URGÊNCIA · IMAGEM",
                "Dor súbita, hipertonia, sangue escuro, bradicardia fetal e inconsciência",
                "Priorizar estabilização materna e cesárea",
                "Tratar como placenta prévia ou induzir parto vaginal em choque"
              ],
              [
                "Choque hipovolêmico · URGÊNCIA",
                "Extremidades frias, pulsos fracos e TEC 4 s em lactente de 9 kg",
                "Diferenciar choque de desidratação grave e calcular bolus",
                "Usar Plano C lento ou solução glicosada em choque"
              ],
              [
                "Intoxicação por salicilato · URGÊNCIA",
                "Cartelas de AAS, vômitos, hiperventilação e convulsão",
                "Escolher agente imediato",
                "Usar antídoto de paracetamol ou induzir vômito"
              ],
              [
                "Colangite grave",
                "Hipotensão persistente após cristaloide, alteração do sensório",
                "Iniciar vasopressor antes da drenagem",
                "Ir à CPRE sem estabilizar ou usar coloide/corticoide primeiro"
              ],
              [
                "⚠ Pielonefrite com choque séptico · URGÊNCIA",
                "Febre, Giordano, PA 70/40 e taquipneia",
                "Ressuscitar, colher culturas e dar antibiótico",
                "Tratar ambulatorialmente ou como IST"
              ],
              [
                "⚠ Pneumotórax hipertensivo · URGÊNCIA",
                "Hipotensão, hipersonoridade, MV reduzido e desvio traqueal contralateral",
                "Tratar imediatamente",
                "Retirar objeto empalado ou priorizar acesso venoso"
              ],
              [
                "⚠ Sepse pediátrica · URGÊNCIA",
                "Infecção, lactato alto e acidose com perfusão preservada",
                "Classificar gravidade clínica",
                "Usar leucocitose isolada ou chamar choque sem hipotensão refratária"
              ],
              [
                "⚠ Saúde do trabalhador · URGÊNCIA",
                "Sintomas após pulverização e colega também sintomática",
                "Atender, notificar e articular vigilância",
                "Esperar confirmação laboratorial para notificar"
              ],
              [
                "Trauma torácico · URGÊNCIA",
                "Hipoxemia, turgência jugular, desvio traqueal e MV abolido",
                "Realizar tratamento imediato pré-hospitalar",
                "Priorizar exame, volume ou pericardiocentese"
              ],
              [
                "Choque neonatal · URGÊNCIA",
                "14 dias, halo umbilical, má perfusão e insuficiência respiratória",
                "Classificar choque e iniciar pacote terapêutico",
                "Confundir hepatomegalia com cardiogênico"
              ],
              [
                "⚠ Pielonefrite com sepse · URGÊNCIA",
                "Febre 39,3, PA 89/52, Giordano e exame urinário infeccioso",
                "Estabilizar e transferir após antibiótico",
                "Tratar por via oral/ambulatorial ou adiar antibiótico até hospital"
              ],
              [
                "SIM-P associada à covid-19 · URGÊNCIA",
                "Febre 5 dias, choque, GI, conjuntivite e covid há 4 semanas",
                "Reconhecer síndrome",
                "Confundir com Kawasaki clássica ou apendicite"
              ],
              [
                "Intoxicação por lítio · URGÊNCIA",
                "Tremor grosseiro, ataxia e confusão após hidroclorotiazida",
                "Suspender agente causador",
                "Tratar como hipoglicemia/parkinsonismo ou manter lítio"
              ],
              [
                "Intoxicação por opioide · URGÊNCIA",
                "Coma, miose puntiforme, bradipneia e cartelas de morfina",
                "Reconhecer toxíndrome e reverter",
                "Confundir com benzodiazepínico ou síndrome colinérgica"
              ],
              [
                "PCR no adulto",
                "Inconsciência, ausência de respiração e pulso",
                "Sequência de suporte básico",
                "Atrasar compressões para outras etapas"
              ],
              [
                "Intoxicação por chumbo",
                "Reciclagem de baterias e anemia refratária ao ferro",
                "Exame etiológico",
                "Persistir em tratar toda microcitose como ferropriva"
              ],
              [
                "Choque no trauma pediátrico",
                "Criança atropelada com sinais de choque",
                "Acesso e reposição inicial",
                "Atrasar acesso vascular e ressuscitação"
              ],
              [
                "Tamponamento cardíaco",
                "Hipotensão, turgência jugular e pulso paradoxal",
                "Diagnóstico e intervenção",
                "Tratar apenas sintomas sem drenagem do derrame"
              ],
              [
                "PCR em adolescente: AESP",
                "Ausência de pulso com atividade elétrica",
                "Próxima conduta de reanimação",
                "Desfibrilar ritmo não chocável; X preservado"
              ],
              [
                "⚠ AESP por pneumotórax hipertensivo",
                "Timpanismo unilateral e turgência jugular",
                "Tratar causa reversível da parada",
                "Tratar FA no monitor como ritmo chocável sem considerar ausência de pulso"
              ],
              [
                "⚠ Pneumotórax hipertensivo traumático",
                "Hipoxemia, hipertimpanismo e desvio traqueal",
                "Descompressão imediata",
                "Aguardar radiografia para intervir"
              ],
              [
                "Intoxicação por paracetamol",
                "Uso de N-acetilcisteína",
                "Relacionar antídoto e agente",
                "Confundir antídotos de antitérmicos diferentes"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "neurologia-clinica",
      "tipo": "tema",
      "titulo": "Neurologia clínica",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Hérnia de disco lombar — red flags antes da cirurgia",
              "texto": "Sem red flag: analgesia/anti-inflamatório quando seguro, manter atividade, fisioterapia e reavaliação. Urgência cirúrgica se cauda equina ou déficit progressivo; eletiva se dor incapacitante persistente com correlação clínico-radiológica.",
              "trava": "Hérnia de disco sem red flag: conservador primeiro."
            },
            {
              "titulo": "Neuropatia diabética — B6 e diapasão de 128 Hz",
              "texto": "Vibração/propriocepção → fibras grossas. Dor/temperatura → fibras finas. Monofilamento = sensibilidade protetora. Deficiência e excesso de vitamina podem neuropatizar, conforme vitamina e exposição.",
              "trava": "Diapasão vibra = fibra grossa; B6 demais também neuropatiza."
            },
            {
              "titulo": "VPPB — Dix-Hallpike diagnostica; Epley trata",
              "texto": "Suspeita de VPPB de canal posterior → Dix- Hallpike; se compatível, tratar com Epley. HINTS é para síndrome vestibular aguda contínua em sintomático, não para episódios posicionais breves.",
              "trava": "Hallpike acha. Epley trata."
            },
            {
              "titulo": "Compressão medular metastática",
              "texto": "Câncer metastático + dor vertebral progressiva/noturna + fraqueza em MMII + nível sensitivo/perda de deambulação → dexametasona imediata (antiedema, preserva função); depois RM urgente e radioterapia e/ou cirurgia.",
              "trava": "Câncer + dor vertebral + déficit = medula comprimida: dexametasona já, RM e definitivo depois."
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
                "Hérnia de disco lombar",
                "Superestimou a cirurgia: alívio mais rápido em selecionados ≠ superioridade para todos",
                "Dor radicular recente, sem retenção/incontinência, anestesia em sela ou piora motora progressiva",
                "Imagem exuberante não substitui clínica; indicação = déficit, gravidade, tempo, falha conservadora"
              ],
              [
                "Neuropatia diabética",
                "Detalhe de neurofisiologia/causa tóxica pouco automatizado",
                "Alternativa dizia que diapasão avaliava fibras finas: isso a tornava falsa",
                "Diapasão ≠ fibra fina; não elevar este microitem a P1 por ansiedade"
              ],
              [
                "VPPB",
                "Etapa trocada: tratamento usado como se fosse confirmação",
                "Crises de segundos ao deitar, levantar ou girar a cabeça, sem síndrome vestibular contínua",
                "Alternativa composta pode começar com 'VPPB' certo e terminar com manobra errada"
              ],
              [
                "Compressão medular metastática",
                "Pensou no tratamento definitivo antes da medida imediata",
                "Câncer metastático + dor vertebral progressiva/noturna + fraqueza MMII + nível sensitivo",
                "Iniciar medida antiedema enquanto aciona imagem e tratamento definitivo"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Hérnia de disco lombar",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Dor radicular por hérnia de disco lombar"
              },
              {
                "tipo": "decisao",
                "texto": "Red flag (cauda equina ou déficit progressivo)?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cirurgia de urgência"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Analgesia/AINE se seguro, atividade conforme tolerância, fisioterapia, reavaliação"
                      },
                      {
                        "tipo": "decisao",
                        "texto": "Dor incapacitante persistente + correlação clínico-radiológica?",
                        "ramos": [
                          {
                            "rotulo": "Sim",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Cirurgia eletiva"
                              }
                            ]
                          },
                          {
                            "rotulo": "Não",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Manter conservador"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Fibras sensitivas e testes",
            "colunas": [
              "Modalidade/teste",
              "Fibra/avalia"
            ],
            "linhas": [
              [
                "Vibração (diapasão 128 Hz) / propriocepção",
                "Fibras grossas"
              ],
              [
                "Dor / temperatura",
                "Fibras finas"
              ],
              [
                "Monofilamento",
                "Sensibilidade protetora"
              ],
              [
                "Vitamina (ex.: B6)",
                "Deficiência e excesso podem neuropatizar, conforme vitamina e exposição"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Vertigem — VPPB x síndrome vestibular aguda",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Vertigem"
              },
              {
                "tipo": "decisao",
                "texto": "Padrão?",
                "ramos": [
                  {
                    "rotulo": "Crises de segundos, posicionais",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Dix-Hallpike (canal posterior)"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Se compatível → manobra de Epley"
                      }
                    ]
                  },
                  {
                    "rotulo": "Síndrome vestibular aguda contínua",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "HINTS no paciente sintomático"
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
            "titulo": "Compressão medular metastática",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Câncer metastático + dor vertebral progressiva/noturna"
              },
              {
                "tipo": "avaliar",
                "texto": "Fraqueza em MMII + nível sensitivo/perda de deambulação"
              },
              {
                "tipo": "conduta",
                "texto": "Dexametasona já: reduz edema e preserva função neurológica"
              },
              {
                "tipo": "conduta",
                "texto": "RM urgente"
              },
              {
                "tipo": "conduta",
                "texto": "Radioterapia e/ou cirurgia conforme o caso"
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
                "Lombalgia mecânica · URGÊNCIA",
                "Dor laboral, exame neurológico e Lasègue normais",
                "Evitar imagem e manter atividade",
                "Pedir RM/radiografia por irradiação isolada ou indicar repouso"
              ],
              [
                "⚠ AVC agudo · IMAGEM",
                "Déficit focal súbito há 30 minutos",
                "Estabilizar e transferir imediatamente",
                "Reduzir PA na UBS ou observar ambulatorialmente"
              ],
              [
                "Lombalgia com sinais de alarme",
                "Dor noturna, perda ponderal e câncer prévio em imunossuprimido",
                "Escolher investigação de dor oncológica",
                "Tratar como lombalgia mecânica apesar de bandeiras vermelhas"
              ],
              [
                "Encefalopatia de Wernicke · URGÊNCIA",
                "Etilismo, confusão, alterações oculares e ataxia",
                "Tratar após piora induzida por glicose",
                "Tratar como abstinência ou psicose; dar glicose sem tiamina"
              ],
              [
                "Migrânea",
                "Cefaleia unilateral, náusea, fonofobia, duas vezes/mês e falha de AINE",
                "Escolher triptano e orientar hábitos",
                "Pedir RM sem sinal de alarme ou tratar como cefaleia em salvas"
              ],
              [
                "Doença de Parkinson · URGÊNCIA",
                "Bradicinesia, tremor de repouso, rigidez e quedas",
                "Reconhecer síndrome e escolher levodopa",
                "Tratar como demência ou tremor essencial"
              ],
              [
                "Lombalgia · URGÊNCIA",
                "Dor mecânica por 3 semanas, exame neurológico normal",
                "Evitar imagem e manter atividade",
                "Solicitar RM ou prescrever repouso"
              ],
              [
                "⚠ AVC isquêmico · URGÊNCIA",
                "Isquemia maior que um terço da ACM",
                "Identificar impedimento apesar da janela",
                "Considerar PA 170/100 ou glicemia 285 contraindicações absolutas"
              ],
              [
                "Migrânea com aura · URGÊNCIA",
                "Até 10 dias de dor/mês, insônia e broncoespasmo",
                "Escolher droga conforme comorbidades",
                "Usar triptano/AINE como profilaxia ou propranolol em asmática"
              ],
              [
                "Demência vascular",
                "Início súbito, progressão em degraus, déficit executivo e sinais piramidais",
                "Reconhecer padrão",
                "Escolher Alzheimer por memória ou Lewy sem flutuação/alucinação"
              ],
              [
                "Migrânea com aura",
                "Escotomas, hemicrania pulsátil e fotofobia",
                "Diagnóstico e tratamento da crise",
                "Confundir tratamento abortivo com profilaxia"
              ],
              [
                "Síndrome de Guillain-Barré",
                "Fraqueza ascendente e arreflexia após exantema",
                "Diagnóstico clínico e liquórico",
                "Desconsiderar neuropatia aguda por atribuir sintomas a cãibras"
              ],
              [
                "Hipertensão intracraniana em PVHIV",
                "Papiledema, bradicardia e alteração de consciência",
                "Prioridade diagnóstica",
                "Realizar punção lombar antes de excluir efeito de massa"
              ],
              [
                "Síndrome neuropática periférica",
                "Dor irradiada, Lasègue e déficit distal",
                "Reconhecer componente motor e sensitivo",
                "Classificar como puramente sensitiva ou autonômica"
              ],
              [
                "⚠ Hipertensão intracraniana no TCE",
                "Hipertensão, bradicardia e respiração irregular",
                "Reconhecer sinal de gravidade",
                "Confundir tríade de Cushing com outros critérios neurológicos"
              ],
              [
                "Paraparesia progressiva",
                "Déficit bilateral progressivo de membros inferiores",
                "Escolha de exame",
                "Atribuir toda fraqueza em diabético a neuropatia sem investigar coluna"
              ],
              [
                "Síndrome da cauda equina",
                "Retenção urinária e anestesia perineal",
                "Tratamento urgente",
                "Manter tratamento conservador de lombalgia com sinais de alarme"
              ],
              [
                "Síndrome da cauda equina",
                "Anestesia perineal e disfunção esfincteriana",
                "Exame urgente",
                "Tratar como lombalgia inespecífica"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "infectologia-clinica",
      "tipo": "tema",
      "titulo": "Infectologia clínica",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Profilaxia de endocardite em procedimento dentário",
              "texto": "Paciente elegível de alto risco + procedimento dental de alto risco → amoxicilina 2 g VO, dose única, 30–60 min antes. Alvo: estreptococos do grupo viridans. Recuperar alvo, dose, via e janela prévia.",
              "trava": "Endocardite + dente + alto risco = amoxicilina 2 g 30–60 min antes."
            },
            {
              "titulo": "HIV + rastreio/TPT de tuberculose",
              "texto": "TPT = tratar infecção latente p/ impedir adoecimento; TB ativa = esquema completo. Em PVHIV, sempre excluir TB ativa antes de ILTB/TPT. PCDT: PT/IGRA em CD4 >350; CD4 <350, TPT pode ser avaliado sem PT/IGRA.",
              "trava": "Latente não é RIPE: exclui TB ativa → TPT; HIV não espera por latência."
            },
            {
              "titulo": "Neurotoxoplasmose: diagnóstico e tratamento",
              "texto": "HIV avançado, CD4 muito baixo + déficit focal/convulsão + múltiplas lesões com realce em anel e edema (núcleos da base) → pirimetamina + sulfadiazina + ácido folínico. Anfotericina B + flucitosina = neurocriptococose.",
              "trava": "Toxo = anel + foco; pirimetamina/sulfadiazina/folínico. Cripto = anfotericina + flucitosina."
            },
            {
              "titulo": "Efavirenz: efeitos neuropsiquiátricos",
              "texto": "Efavirenz é antirretroviral. Sonhos vívidos, sensação de embriaguez/tontura, insônia e alterações neuropsiquiátricas após mudança de TARV.",
              "trava": "Efavirenz faz o cérebro sonhar/tonturar."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "PVHIV: TB latente x ativa (TPT)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "PVHIV assintomática, sem sinais de TB ativa (ex.: CD4 360 células/mm³)"
              },
              {
                "tipo": "decisao",
                "texto": "TB ativa excluída?",
                "ramos": [
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "TB ativa = esquema completo para doença em atividade"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "decisao",
                        "texto": "CD4 >350?",
                        "ramos": [
                          {
                            "rotulo": "Sim",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "PT/IGRA especialmente usados (PCDT) → TPT se indicado"
                              }
                            ]
                          },
                          {
                            "rotulo": "Não (<350)",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Critérios para TPT podem ser avaliados sem exigir PT/IGRA"
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
                "texto": "Latente não é RIPE; TPT impede adoecimento. HIV não espera por latência."
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Lesão cerebral no HIV: toxo x cripto",
            "colunas": [
              "Item",
              "Neurotoxoplasmose",
              "Neurocriptococose"
            ],
            "linhas": [
              [
                "Pista",
                "CD4 muito baixo + déficit focal/convulsão + múltiplas lesões com realce em anel e edema (núcleos da base)",
                "—"
              ],
              [
                "Tratamento",
                "Pirimetamina + sulfadiazina + ácido folínico (leucovorina)",
                "Anfotericina B + flucitosina"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Infectologia clínica",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "⚠ Exposição sexual ao HIV e sífilis",
                "Parceiro HIV reagente, sífilis provável e relação há 2 dias",
                "Prescrever profilaxia dentro de 72 horas",
                "Usar PrEP como tratamento ou esquema/duração errados"
              ],
              [
                "⚠ Sepse de foco urinário · URGÊNCIA",
                "Febre, taquicardia, taquipneia e neutrofilia em diabética",
                "Iniciar tratamento na primeira hora",
                "Esperar culturas ou manter amplo espectro sem descalonar"
              ],
              [
                "⚠ Sífilis primária",
                "Cancro único, indolor, endurecido e adenopatia indolor",
                "Escolher exame inicial",
                "Confundir com cancroide, gonorreia ou donovanose"
              ],
              [
                "Dengue · URGÊNCIA · IMAGEM",
                "Febre, taquicardia, dor abdominal/hepatomegalia e exames de alarme",
                "Definir hidratação e nível de cuidado",
                "Dar alta por pressão ainda mensurável ou enviar direto à UTI sem choque"
              ],
              [
                "Endocardite infecciosa · URGÊNCIA",
                "Febre, mancha de Roth, hemorragias subungueais e sopro",
                "Reconhecer diagnóstico clínico",
                "Atribuir achados à retocolite ou vasculite"
              ],
              [
                "⚠ Pielonefrite com choque séptico · URGÊNCIA",
                "Febre, Giordano, PA 70/40 e taquipneia",
                "Ressuscitar, colher culturas e dar antibiótico",
                "Tratar ambulatorialmente ou como IST"
              ],
              [
                "Dengue",
                "Dor abdominal e vômitos persistentes com perfusão preservada",
                "Estratificar e hidratar",
                "Classificar como B ou manter apenas hidratação oral"
              ],
              [
                "Esporotricose · IMAGEM",
                "Arranhadura de gato, nódulos ascendentes e corpos asteroides",
                "Identificar diagnóstico e tratamento",
                "Confundir com piodermite ou micose sistêmica"
              ],
              [
                "Infecção aguda pelo HIV",
                "Síndrome retroviral aguda após alto risco e teste rápido negativo",
                "Escolher teste molecular",
                "Repetir apenas sorologia precoce ou encerrar investigação"
              ],
              [
                "⚠ Pielonefrite com sepse · URGÊNCIA",
                "Febre 39,3, PA 89/52, Giordano e exame urinário infeccioso",
                "Estabilizar e transferir após antibiótico",
                "Tratar por via oral/ambulatorial ou adiar antibiótico até hospital"
              ],
              [
                "Chikungunya · URGÊNCIA",
                "Artralgia intensa persistente 18 dias após febre",
                "Escolher teste pela cronologia",
                "Solicitar antígeno/RT-PCR fora da janela apropriada"
              ],
              [
                "Larva migrans cutânea · IMAGEM",
                "Lesão pruriginosa que avança do espaço interdigital ao dorso",
                "Reconhecer lesão serpiginosa",
                "Confundir com tinea, tungíase ou escabiose"
              ],
              [
                "Dengue",
                "Vômitos, dor abdominal, oligúria, TEC 3 s e hematócrito crescente",
                "Internar e hidratar por via venosa",
                "Aguardar confirmação laboratorial ou manter hidratação oral"
              ],
              [
                "Lesão cerebral oportunista no HIV",
                "Convulsão nova, CD4 40 e possível micose sistêmica",
                "Priorizar tomografia de crânio",
                "Realizar punção lombar antes de excluir massa"
              ],
              [
                "Cistite não complicada",
                "Disúria e polaciúria sem febre ou corrimento",
                "Diagnóstico e tratamento",
                "Confundir ITU baixa com pielonefrite"
              ],
              [
                "Leptospirose",
                "Enchentes, icterícia, mialgia e sufusão conjuntival",
                "Diagnóstico clínico-laboratorial",
                "Confundir com outras síndromes febris ictéricas"
              ],
              [
                "Reação hansênica tipo 2",
                "Nódulos dolorosos, febre, artralgia e madarose",
                "Reconhecimento clínico",
                "Confundir reação com outra vasculite ou recidiva"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "geriatria-e-cuidados-ao-idoso",
      "tipo": "tema",
      "titulo": "Geriatria e cuidados ao idoso",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Geriatria — sintoma novo exige revisão medicamentosa",
              "texto": "Constipação, confusão, retenção, xerostomia, queda/hipotensão → buscar carga anticolinérgica/sedativa. Revisar lista antes de acrescentar remédio. Não desmontar medicação CV benéfica antes de achar o fármaco deletério.",
              "trava": "Sintoma novo no idoso? Lista de remédios primeiro."
            },
            {
              "titulo": "⚠ Cuidados paliativos domiciliares — hipodermóclise",
              "texto": "Definir objetivo: reversão, prolongamento ou conforto. Conforto + via oral falhou → hipodermóclise (fármacos/volumes pequenos, soluções compatíveis, vigiar sítio). Hospitalizar se objetivo reversível, sintoma refratário ou necessidade não atendível em casa.",
              "trava": "⚠ Paliativo + via oral ruim = lembrar via subcutânea antes da transferência por reflexo."
            },
            {
              "titulo": "Presbiacusia — ouvir antes de rotular como memória",
              "texto": "Queixa cognitiva no idoso: revisar audição, visão, humor, medicações e cognição. Pior em reunião/ruído sugere falha de entrada sensorial, não de memória. Teste do sussurro rastreia; não fecha diagnóstico nem substitui audiometria.",
              "trava": "Antes de dizer que esqueceu, confirme que ouviu."
            },
            {
              "titulo": "⚠ Dor oncológica em cuidados paliativos: morfina em casa",
              "texto": "Doença sem perspectiva curativa + alta para paliativos + dor intensa apesar de paracetamol/codeína: opioide forte não exige 'morfina EV + internação'.",
              "trava": "⚠ Opioide forte não significa internação; paliativo bom muitas vezes trata a dor em casa."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Sintoma novo no idoso / hipotensão ortostática",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Constipação, confusão, retenção, xerostomia, queda/hipotensão"
              },
              {
                "tipo": "conduta",
                "texto": "Revisar lista: carga anticolinérgica e sedativa antes de acrescentar remédio"
              },
              {
                "tipo": "avaliar",
                "texto": "Hipotensão ortostática: queda PAS ≥20 ou PAD ≥10 mmHg em até 3 min"
              },
              {
                "tipo": "conduta",
                "texto": "1º retirar/reduzir fármacos que derrubam, hidratar, corrigir fatores reversíveis"
              },
              {
                "tipo": "atencao",
                "texto": "Fludrocortisona = opção selecionada, não 1ª etapa automática"
              },
              {
                "tipo": "atencao",
                "texto": "Não desmontar medicação CV benéfica antes de identificar o fármaco deletério"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Paliativo domiciliar — via oral falhou",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Objetivo paliativo + dificuldade de via oral + preferência por cuidado domiciliar"
              },
              {
                "tipo": "decisao",
                "texto": "Objetivo do cuidado?",
                "ramos": [
                  {
                    "rotulo": "Conforto",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Considerar hipodermóclise: fármacos/volumes pequenos, soluções compatíveis, vigiar sítio"
                      }
                    ]
                  },
                  {
                    "rotulo": "Reversível / refratário",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Hospitalizar se objetivo reversível, sintoma refratário ou necessidade não atendível em casa"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Hipodermóclise não é ressuscitação volêmica nem obrigação de hidratar; é ferramenta proporcional"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Queixa cognitiva no idoso — presbiacusia",
            "colunas": [
              "Pista / item",
              "Leitura"
            ],
            "linhas": [
              [
                "Repetição de perguntas, pior em reunião/ruído",
                "Pensar em falha de audição (entrada sensorial)"
              ],
              [
                "Rastreios sem evidência forte de demência/depressão",
                "Não rotular como memória"
              ],
              [
                "Checklist",
                "Audição, visão, humor, medicações e cognição"
              ],
              [
                "Teste do sussurro",
                "Rastreia; não fecha diagnóstico nem substitui audiometria quando indicada"
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
                "Abstinência alcoólica · URGÊNCIA",
                "48 horas sem álcool, agitação, confusão, tremor e hiperatividade autonômica",
                "Diagnosticar e tratar inicialmente",
                "Usar haloperidol isolado ou tratar como encefalopatia hipertensiva"
              ],
              [
                "⚠ Cuidados paliativos",
                "Câncer avançado, linfangite e recusa documentada de invasão",
                "Respeitar diretiva e aliviar sintoma",
                "Intubar por pedido familiar ou drenar pequeno derrame sem alvo sintomático"
              ],
              [
                "⚠ Cuidados paliativos pediátricos · URGÊNCIA",
                "Tumor progressivo sem opção terapêutica e baixa responsividade",
                "Controlar sintomas e pactuar não ressuscitação",
                "Intubar para conforto ou insistir em tratamento antineoplásico fútil"
              ],
              [
                "Hipertensão no idoso · URGÊNCIA",
                "82 anos, PA em torno de 146/88 e assintomática",
                "Evitar medicalização de elevação limítrofe",
                "Aplicar metas de adulto jovem e iniciar droga automaticamente"
              ],
              [
                "Quedas no idoso",
                "Queda noturna e PA cai de 138/92 para 110/70",
                "Revisar medicamentos causais",
                "Investigar causa rara ou adicionar fludrocortisona antes de deprescrever"
              ],
              [
                "Prescrição potencialmente inapropriada",
                "Zolpidem e amitriptilina em idosa com tontura e instabilidade",
                "Retirar fármacos associados a queda",
                "Manter por ausência de descompensação ou trocar por outro sedativo"
              ],
              [
                "Delirium · URGÊNCIA",
                "Idosa com fratura dolorosa, flutuação e exames sem outra causa",
                "Identificar causa reversível",
                "Atribuir a idade/comorbidades ou hipoxemia leve não presente"
              ],
              [
                "Insuficiência cardíaca no idoso",
                "IC com FE preservada/limítrofe, DRC e tontura postural",
                "Individualizar doses mantendo classes",
                "Adicionar droga ou retirar classe prognóstica sem primeiro ajustar"
              ],
              [
                "Avaliação multidimensional do idoso",
                "Polifarmácia, esquecimento e incapacidade para limpar a casa",
                "Identificar itens que pontuam",
                "Pontuar diagnósticos/IMC sem correspondência ao instrumento"
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
      "id": "reumatologia-artrites-e-conectivopatias",
      "tipo": "tema",
      "titulo": "Reumatologia — artrites e conectivopatias",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Espondiloartrites — fenótipo associado decide a biológica",
              "texto": "SpA + DII ativa/uveíte recorrente → anti- TNF monoclonal ganha força; IL-17 pode piorar/ser inadequado em DII ativa. Dactilite não decide. HLA-B27 associa-se a persistência/gravidade, não é requisito diagnóstico.",
              "trava": "IL-17 ama pele, mas briga com intestino. Dactilite não decide; pele e contexto decidem."
            },
            {
              "titulo": "⚠ Monoartrite — cristal não absolve infecção",
              "texto": "Monoartrite aguda potencialmente séptica → artrocentese (contagem, cristais, Gram/cultura conforme contexto). Clínica/risco infeccioso: colher líquido e manter infecção no diferencial mesmo com cristais. Urato normal não absolve gota.",
              "trava": "⚠ Uricemia normal exclui gota aguda? E cristal exclui artrite séptica?"
            },
            {
              "titulo": "Fibromialgia — critérios atuais",
              "texto": "ACR 2016: WPI ≥7 + SSS ≥5, ou WPI 4–6 + SSS ≥9; dor em ≥4/5 regiões; sintomas semelhantes ≥3 meses. WPI pergunta onde doeu (não é tender point). Pode coexistir com outras doenças; não interrompe investigação de sinais objetivos.",
              "trava": "Fibromialgia atual = WPI + SSS; 11/18 ficou histórico."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Espondiloartrites — fenótipo e escolha",
            "colunas": [
              "Fenótipo / dado",
              "Implicação"
            ],
            "linhas": [
              [
                "SpA + DII ativa / uveíte recorrente",
                "Anti-TNF monoclonal ganha força; IL-17 pode piorar/ser inadequado"
              ],
              [
                "Artrite psoriásica (PsA)",
                "Pele/unha/IFD/curso crônico"
              ],
              [
                "Artrite reativa",
                "Infecção GI/GU recente + oligoartrite assimétrica MMII ± uretrite/conjuntivite"
              ],
              [
                "Dactilite",
                "Não decide sozinha"
              ],
              [
                "HLA-B27",
                "Associa-se a persistência/gravidade; não é requisito diagnóstico"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Monoartrite aguda",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Monoartrite aguda potencialmente séptica"
              },
              {
                "tipo": "conduta",
                "texto": "Artrocentese: contagem, cristais, Gram/cultura conforme contexto"
              },
              {
                "tipo": "decisao",
                "texto": "Clínica/risco infeccioso?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Manter infecção no diferencial mesmo com cristais"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Interpretar conjunto; nenhum dado isolado absolve"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Cristal não absolve infecção; uricemia normal não absolve gota; leucócitos abaixo do corte idem"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Fibromialgia — ACR 2016",
            "colunas": [
              "Item",
              "Regra"
            ],
            "linhas": [
              [
                "Critério",
                "WPI ≥7 + SSS ≥5, ou WPI 4–6 + SSS ≥9"
              ],
              [
                "Distribuição",
                "Dor em ≥4/5 regiões"
              ],
              [
                "Tempo",
                "Sintomas em nível semelhante por ≥3 meses"
              ],
              [
                "WPI",
                "Pergunta onde doeu; não é compressão dos 18 tender points (11/18 = histórico)"
              ],
              [
                "Coexistência",
                "Pode coexistir com outras doenças; não interrompe investigação de sinais objetivos"
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
                "Arterite de células gigantes",
                "Maior de 50, couro cabeludo doloroso e sintomas visuais",
                "Reconhecer sinais de alarme e exame inicial",
                "Classificar como cefaleia tensional ou migrânea"
              ],
              [
                "Artrite reumatoide",
                "Poliartrite simétrica inflamatória com FR negativo",
                "Diagnosticar e iniciar DMARD",
                "Excluir AR por fator reumatoide negativo"
              ],
              [
                "Espondiloartrite axial",
                "Rigidez matinal de 2 h e Schober muito reduzido",
                "Diferenciar de lombalgia degenerativa",
                "Fixar-se em alteração L4-L5 e tratar só mecanicamente"
              ],
              [
                "Artrite reumatoide",
                "Pequenas articulações simétricas e rigidez maior que 2 horas",
                "Integrar diagnóstico, marcador e primeira linha",
                "Excluir AR por marcador ou escolher corticoide isolado"
              ],
              [
                "Espondiloartrite axial · URGÊNCIA · IMAGEM",
                "Jovem, rigidez sacroilíaca matinal e melhora com movimento",
                "Reconhecer dor lombar inflamatória",
                "Confundir com dor mecânica ou LES"
              ],
              [
                "Monoartrite aguda · URGÊNCIA · IMAGEM",
                "Joelho quente, grande derrame, dor passiva e febrícula em diabética",
                "Realizar artrocentese diagnóstica",
                "Prescrever AINE ou antibiótico antes de colher líquido em paciente estável"
              ],
              [
                "Fibromialgia",
                "Dor difusa, sono ruim e exames inflamatórios normais",
                "Tratamento de manutenção",
                "Tratar como doença articular inflamatória"
              ],
              [
                "Lúpus eritematoso sistêmico",
                "Artrite, citopenias, úlceras orais e Raynaud",
                "Investigação diagnóstica",
                "Investigar apenas doença articular isolada"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "algoritmos-clinica-medica",
      "tipo": "algoritmos",
      "titulo": "Algoritmos — Clínica Médica",
      "resumo": "Fluxos para não confundir na hora da prova",
      "elementos": [
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "FA",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Fibrilação atrial"
              },
              {
                "tipo": "decisao",
                "texto": "Instável?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cardioversão sincronizada"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Controle de frequência/ritmo conforme caso"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Cardioversão c/ duração longa/desconhecida: anticoagulação prévia OU ETE sem trombo (regra clássica)"
              },
              {
                "tipo": "atencao",
                "texto": "Anticoagulação crônica é decisão separada"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Hipercalemia",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "ECG alterado? → cálcio IV"
              },
              {
                "tipo": "conduta",
                "texto": "Depois: insulina + glicose ± beta-2 ± bicarbonato se acidose"
              },
              {
                "tipo": "conduta",
                "texto": "Em paralelo: retirar K do corpo e tratar a causa"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "STEMI sem instabilidade hemodinâmica",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "IAM com supra"
              },
              {
                "tipo": "decisao",
                "texto": "Tempo FMC → dispositivo ≤120 min?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Transferir para ICP"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (>120 min) e elegível",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Fibrinólise + transferência farmacoinvasiva"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Falhou a reperfusão → ICP de resgate"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Dengue — grupos C e D",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Gravidade?",
                "ramos": [
                  {
                    "rotulo": "Choque / órgão grave (D)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Expansão rápida 20 mL/kg e reavaliar"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sinal de alarme sem choque (C)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Expansão mais cautelosa e reavaliação"
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
            "titulo": "Dengue C — hidratação",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "SF 10 mL/kg na 1ª hora"
              },
              {
                "tipo": "conduta",
                "texto": "10 mL/kg/h na 2ª hora e reavaliar Ht"
              },
              {
                "tipo": "decisao",
                "texto": "Evolução?",
                "ramos": [
                  {
                    "rotulo": "Melhorou",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "25 mL/kg em 6 h + 25 mL/kg em 8 h"
                      }
                    ]
                  },
                  {
                    "rotulo": "Choque",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Conduzir como grupo D"
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
            "titulo": "Insulina hospitalar",
            "passos": [
              {
                "tipo": "avaliar",
                "texto": "Avaliar: crítico? dieta? intensidade da hiperglicemia?"
              },
              {
                "tipo": "decisao",
                "texto": "Paciente não crítico — perfil?",
                "ramos": [
                  {
                    "rotulo": "Eventual",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Correção"
                      }
                    ]
                  },
                  {
                    "rotulo": "Persistente 180–250",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Basal-plus"
                      }
                    ]
                  },
                  {
                    "rotulo": ">250 / deficiência insulínica",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Basal-bolus"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Jejum = basal + correção; enteral contínua = relógio; crítico = EV"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "⚠ Sífilis — estadiar e escolher esquema",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Estadiar → escolher esquema"
              },
              {
                "tipo": "decisao",
                "texto": "Estágio?",
                "ramos": [
                  {
                    "rotulo": "Primária/secundária/latente recente",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "2,4 mi UI IM dose única (no recorte)"
                      }
                    ]
                  },
                  {
                    "rotulo": "Tardia / duração ignorada",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "2,4 mi UI semanal ×3"
                      }
                    ]
                  },
                  {
                    "rotulo": "Neurossífilis",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Clínica + sorologia + LCR"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "VDRL-LCR negativo não exclui neurossífilis sozinho"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "TB sensível",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Quem?",
                "ramos": [
                  {
                    "rotulo": "Adulto/adolescente",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "2RHZE/4RH"
                      }
                    ]
                  },
                  {
                    "rotulo": "Criança/adol. 3 m–16 a, não grave",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "2 meses intensivos + 2 de manutenção"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "SNC/osso: fluxo prolongado"
                      }
                    ]
                  },
                  {
                    "rotulo": "Grave/falha",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "≥6 meses"
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
            "titulo": "Criptococose SNC",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "Indução: anfotericina B + flucitosina"
              },
              {
                "tipo": "conduta",
                "texto": "Consolidação: fluconazol → manutenção: fluconazol"
              },
              {
                "tipo": "conduta",
                "texto": "Medir pressão de abertura e fazer punções de alívio"
              },
              {
                "tipo": "atencao",
                "texto": "TARV não é imediata"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Nódulo pulmonar",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Nódulo no RX → TC de cortes finos"
              },
              {
                "tipo": "decisao",
                "texto": "Tamanho + risco/morfologia/crescimento?",
                "ramos": [
                  {
                    "rotulo": "<6 mm",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Nenhuma"
                      }
                    ]
                  },
                  {
                    "rotulo": "6–8 mm",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "TC seriada"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "N2 acessível suspeito → EBUS"
                      }
                    ]
                  },
                  {
                    "rotulo": ">8 mm",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "PET / tecido"
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
      "id": "contrastes-clinica-medica-e-cirurgia",
      "tipo": "contrastes",
      "titulo": "Contrastes — Clínica Médica e Cirurgia",
      "resumo": "Pares parecidos o bastante para serem trocados",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de Clínica Médica",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "PsA × artrite reativa",
                "Artrite psoriásica",
                "Pele/unha/IFD, curso crônico"
              ],
              [
                "",
                "Artrite reativa",
                "Infecção GI/GU prévia + oligoartrite MMII ± uretrite/conjuntivite"
              ],
              [
                "",
                "Ambas",
                "Dactilite pode ocorrer em ambas"
              ],
              [
                "⚠ Gota × séptica",
                "Cristais",
                "Favorecem gota/CPPD, mas não excluem infecção"
              ],
              [
                "",
                "Uricemia",
                "Normal não exclui crise"
              ],
              [
                "Nefrítica × nefrótica",
                "Nefrítica",
                "Sangue / HAS / oligúria"
              ],
              [
                "",
                "Nefrótica",
                "Proteinúria maciça / hipoalbuminemia / edema"
              ],
              [
                "L4 × L5 × S1",
                "L4",
                "Medial da perna + reflexo patelar"
              ],
              [
                "",
                "L5",
                "Dorso do pé/hálux + dorsiflexão do hálux"
              ],
              [
                "",
                "S1",
                "Posterior/lateral-planta + flexão plantar + aquileu"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de Cirurgia",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "Coledocolitíase × colangite",
                "Coledocolitíase",
                "Obstrução por cálculo / colestase"
              ],
              [
                "",
                "Colangite",
                "Obstrução + infecção sistêmica"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "numeros-que-derrubam-clinica-medica",
      "tipo": "numeros",
      "titulo": "Números que derrubam — Clínica Médica",
      "resumo": "Cutoffs, doses, janelas e prazos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números de Clínica Médica",
            "colunas": [
              "Item",
              "Número/corte",
              "Observação"
            ],
            "linhas": [
              [
                "STEMI transferido",
                "FMC→dispositivo ≤120 min",
                ""
              ],
              [
                "Dengue D",
                "20 mL/kg rapidamente",
                "Com reavaliação"
              ],
              [
                "PBE",
                "PMN ≥250/mm³",
                ""
              ],
              [
                "Albumina na PBE",
                "D1 1,5 g/kg; D3 1 g/kg",
                ""
              ],
              [
                "Paracentese >5 L",
                "Albumina 8 g/L retirado",
                ""
              ],
              [
                "GASA",
                "≥1,1 g/dL",
                "Sugere hipertensão portal"
              ],
              [
                "HCV — resposta",
                "HCV-RNA ≥12 semanas após o fim",
                "= RVS12"
              ],
              [
                "Hipotensão ortostática",
                "Queda PAS ≥20 ou PAD ≥10 mmHg",
                "Em até 3 min"
              ],
              [
                "DPOC GOLD (VEF1)",
                "≥80 / 50–79 / 30–49 / <30%",
                ""
              ],
              [
                "Winter",
                "PaCO2 esperada = 1,5×HCO3 + 8 ±2",
                ""
              ],
              [
                "Anafilaxia adulto",
                "0,5 mg IM",
                "No recorte trabalhado"
              ],
              [
                "PCR — adrenalina",
                "0,1 mg/mL (1:10.000) IV/IO",
                "Conforme dose protocolar"
              ],
              [
                "⚠ RCU extensa — vigilância",
                "Iniciar ~8 anos; intervalo em geral 1–3 anos",
                "Conforme risco"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "normativo-clinica-medica",
      "tipo": "normativo",
      "titulo": "Normativo — Clínica Médica",
      "resumo": "13 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Atualizações 2026 — Clínica Médica",
            "colunas": [
              "Norma/tema",
              "O que mudou",
              "Status",
              "Fonte e data"
            ],
            "linhas": [
              [
                "⚠ AVC isquêmico — janelas de reperfusão",
                "Trombólise até 4,5 h: alteplase 0,9 mg/kg (máx. 90 mg) ou tenecteplase 0,25 mg/kg (máx. 25 mg)",
                "Confirmada",
                "AHA/ASA 2026"
              ],
              [
                "",
                "Trombólise até 9 h em selecionados com penumbra em perfusão TC/RM, incluindo wake-up stroke",
                "",
                ""
              ],
              [
                "",
                "Trombectomia circulação anterior até 24 h em selecionados; ampliação para alguns ASPECTS 3–5",
                "",
                ""
              ],
              [
                "",
                "Trombectomia basilar até 24 h: NIHSS ≥10, pc- ASPECTS ≥6 e mRS prévio 0–1",
                "",
                ""
              ],
              [
                "",
                "Trava: 4,5 h não é mais a única janela: imagem pode estender trombólise e trombectomia",
                "",
                ""
              ],
              [
                "⚠ TEP — classificação A a E",
                "Abandona maciço/submaciço. Classificação A→E + marcador respiratório R",
                "Confirmada",
                "AHA/ACC 2026"
              ],
              [
                "",
                "A e B menor risco; C risco crescente (disfunção de VD, biomarcadores); D falência incipiente; E choque/PCR",
                "",
                ""
              ],
              [
                "",
                "Baixa probabilidade → PERC; PERC negativo encerra; PERC positivo → D-dímero",
                "",
                ""
              ],
              [
                "",
                "Alta probabilidade → imagem direto, sem esperar D-dímero",
                "",
                ""
              ],
              [
                "",
                "Evitar ventilação mecânica quando possível (piora hemodinâmica do VD)",
                "",
                ""
              ],
              [
                "",
                "Trava: Probabilidade antes do dímero; choque antes da anatomia",
                "",
                ""
              ],
              [
                "⚠ Sepse — antibiótico por probabilidade",
                "qSOFA perde protagonismo isolado; NEWS, NEWS2, MEWS e SIRS preferidos. Sepse segue diagnóstico clínico",
                "Confirmada",
                "Surviving Sepsis Campaign 2026"
              ],
              [
                "",
                "ATB: choque séptico e sepse provável/definida sem choque ≤1 h; sepse possível: investigar e, se persistir, ≤3 h",
                "",
                ""
              ],
              [
                "",
                "Baixa probabilidade sem choque pode observar sem ATB imediato",
                "",
                ""
              ],
              [
                "",
                "Beta-lactâmico em infusão prolongada após ataque: recomendação forte",
                "",
                ""
              ],
              [
                "",
                "30 mL/kg como ponto de partida, ênfase em reavaliação; evitar excesso de fluidos",
                "",
                ""
              ],
              [
                "",
                "Vasopressor pode iniciar em acesso periférico. Cristaloide balanceado, exceto TCE. Foco ≤6 h",
                "",
                ""
              ],
              [
                "",
                "CNAF e prona acordado ganham espaço; ventilado sem SDRA 6–8 mL/kg peso predito",
                "",
                ""
              ],
              [
                "",
                "Corticoide IV no choque séptico; sugestão contra vitamina C, vitamina D, betabloqueador e probiótico",
                "",
                ""
              ],
              [
                "",
                "Trava: Nem antibiótico, nem volume, nem lactato no piloto automático",
                "",
                ""
              ],
              [
                "⚠ Anemia na DRC",
                "Hemodiálise: considerar ferro com ferritina ≤500 ng/mL e TSAT ≤30%",
                "Confirmada",
                "KDIGO 2026"
              ],
              [
                "",
                "Sem diálise ou DP: ferritina <100 e TSAT <40%, ou ferritina 100–300 e TSAT <25%",
                "",
                ""
              ],
              [
                "",
                "AEE seguem preferidos aos HIF-PHI. Meta de Hb 10– 11,5 g/dL",
                "",
                ""
              ],
              [
                "",
                "Trava: Os cutoffs de ferritina e TSAT mudam conforme a modalidade dialítica",
                "",
                ""
              ],
              [
                "⚠ Obesidade — indicação de farmacoterapia",
                "Indicada em IMC ≥30, ou IMC ≥27 com complicações",
                "Confirmada",
                "ABESO 2026"
              ],
              [
                "",
                "Novo: considerar com cintura aumentada ou cintura/altura >0,5 + complicações, mesmo fora do IMC",
                "",
                ""
              ],
              [
                "",
                "Introduz o PMAV (peso máximo atingido na vida)",
                "",
                ""
              ],
              [
                "",
                "Semaglutida 2,4 mg e tirzepatida: maior potência. Tratamento tende a ser crônico",
                "",
                ""
              ],
              [
                "",
                ">60 anos ou em risco: rastrear sarcopenia antes de iniciar",
                "",
                ""
              ],
              [
                "",
                "Trava: O IMC deixou de ser a única porta de entrada da farmacoterapia",
                "",
                ""
              ],
              [
                "⚠ Síndrome do intestino irritável — Roma V",
                "Volta a aceitar dor E/OU desconforto abdominal",
                "Confirmada",
                "Roma V"
              ],
              [
                "",
                "Pelo menos 3 dias/mês nos últimos 3 meses; recorrente, não contínuo",
                "",
                ""
              ],
              [
                "",
                "Sintoma só ligado à menstruação fala contra SII. Subtipos pela escala de Bristol",
                "",
                ""
              ],
              [
                "",
                "Trava: Roma V reabilitou o desconforto: não é só dor",
                "",
                ""
              ],
              [
                "⚠ Asma no adulto — GINA 2026",
                "Prova broncodilatadora: ↑ VEF1 ou CVF ≥12% E ≥200 mL",
                "Confirmada",
                "GINA 2026"
              ],
              [
                "",
                "Trilho 1: ICS-formoterol segue preferencial",
                "",
                ""
              ],
              [
                "",
                "Trilho 2: abandona SABA isolado — ICS-SABA, ou ICS junto ao SABA, já na etapa 1",
                "",
                ""
              ],
              [
                "",
                "Etapa 5: 'adicionar LAMA' passa a 'ponderar LAMA'",
                "",
                ""
              ],
              [
                "",
                "Asma grave: revisar adesão, técnica e ambiente antes de fenotipar. Novo: depemokimab (anti-IL-5 longa)",
                "",
                ""
              ],
              [
                "",
                "Exacerbação: leve, moderada, grave, ameaçadora à vida; anafilaxia concomitante → epinefrina primeiro",
                "",
                ""
              ],
              [
                "",
                "O₂ se SatO₂ <92%, alvo 92–95%; atenção à toxicidade de SABA; ICS-formoterol opção em crise leve adulto",
                "",
                ""
              ],
              [
                "",
                "Trava: Broncodilatador nunca anda sozinho",
                "",
                ""
              ],
              [
                "⚠ Malária — tafenoquina e G6PD",
                "Tafenoquina p/ P. vivax exige G6PD: ≥6,1 UI/gHb → tafenoquina 300 mg dose única",
                "Confirmada",
                "Guia de tratamento da malária no Brasil, 3ª ed. — maio/2026"
              ],
              [
                "",
                "G6PD 4,1–6,0 → primaquina 7 dias; ≤4,0 → esquema semanal supervisionado",
                "",
                ""
              ],
              [
                "",
                "Recorrência até 60 dias muda o retratamento e contraindica tafenoquina",
                "",
                ""
              ],
              [
                "",
                "Grave: artesunato injetável em todas as idades e gestantes",
                "",
                ""
              ],
              [
                "",
                "P. falciparum: derivado de artemisinina + primaquina em dose única",
                "",
                ""
              ],
              [
                "",
                "Trava: Prescrever tafenoquina sem G6PD, ou tratar vivax como falciparum",
                "",
                ""
              ],
              [
                "⚠ Helicobacter pylori",
                "Esquemas passam a 14 dias. Vonoprazana e outros P-CAB ganham protagonismo",
                "Confirmada",
                "Consenso 2026"
              ],
              [
                "",
                "Quádrupla com bismuto reforçada como 1ª linha quando disponível",
                "",
                ""
              ],
              [
                "",
                "Evitar reutilizar claritromicina ou levofloxacino após falha",
                "",
                ""
              ],
              [
                "",
                "Novas indicações: antissecretor crônico por DRGE, candidato à bariátrica, parente 1º grau c/ câncer gástrico",
                "",
                ""
              ],
              [
                "",
                "Trava: 10 dias virou 14; e antibiótico que falhou não se repete",
                "",
                ""
              ],
              [
                "⚠ Clostridioides difficile",
                "Fidaxomicina preferida quando disponível",
                "Confirmada",
                "Diretriz 2026"
              ],
              [
                "",
                "Metronidazol sai do tratamento rotineiro do caso não fulminante",
                "",
                ""
              ],
              [
                "",
                "Restauração de microbiota/transplante fecal: recomendação forte a partir da 2ª recorrência",
                "",
                ""
              ],
              [
                "",
                "Trava: Metronidazol deixou de ser a escolha de rotina",
                "",
                ""
              ],
              [
                "⚠ Hipertensão arterial — diagnóstico e alvo",
                "Diagnóstico: ≥140x90 mmHg em duas consultas; considerar MAPA/MRPA sempre, média 130x80",
                "Confirmada",
                "Diretriz Brasileira de HA — 2025"
              ],
              [
                "",
                "Estágio 1: 140–159 e/ou 90–99; estágio 2: 160–179 e/ou 100–109; estágio 3: ≥180 e/ou ≥110",
                "",
                ""
              ],
              [
                "",
                "120–139 e/ou 80–89 c/ alto risco CV: MEV 3 meses; se ≥130 e/ou ≥80, associar fármaco",
                "",
                ""
              ],
              [
                "",
                "≥140 e/ou ≥90: não medicamentoso + medicamentoso. Alvo <130/80 mmHg",
                "",
                ""
              ],
              [
                "",
                "Trava: O alvo mudou. Confirme se o enunciado assume a diretriz de 2025 ou a anterior",
                "",
                ""
              ],
              [
                "⚠ Transplante hepático — MELD 3.0",
                "MELD-Na passa a MELD 3.0: novos componentes sexo feminino e albumina",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "Critérios radiológicos do CHC atualizados pelo LI- RADS",
                "",
                ""
              ],
              [
                "",
                "Abstinência alcoólica considerada: redução de 6 para 3 meses",
                "",
                ""
              ],
              [
                "",
                "Trava: MELD mudou de versão e de componentes",
                "",
                ""
              ],
              [
                "⚠ IRA — KDIGO 2026",
                "Mantêm-se cutoffs clássicos de creatinina e débito urinário",
                "Preliminar (draft)",
                "KDIGO 2026 — draft"
              ],
              [
                "",
                "Nova ênfase em IRA funcional x estrutural; biomarcadores de dano em destaque",
                "",
                ""
              ],
              [
                "",
                "IRA: primeiros 7 dias; doença renal aguda: 7 a 90 dias",
                "",
                ""
              ],
              [
                "",
                "Cistatina C reforçada quando a creatinina é pouco confiável",
                "",
                ""
              ],
              [
                "",
                "Trava: Draft: não substitua automaticamente o algoritmo clássico do KDIGO 2012",
                "",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-clinica-medica",
      "tipo": "apostas",
      "titulo": "Apostas — Clínica Médica",
      "resumo": "7 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Clínica Médica (1/3) — Sepse e arboviroses",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "⚠ Sepse — Surviving Sepsis Campaign 2026",
                "Definição: infecção + SOFA-2 ≥2. 4 categorias: definitiva, provável, possível, não provável"
              ],
              [
                "↳ triagem",
                "Não usar qSOFA para triagem — preferir NEWS, NEWS2, MEWS, SIRS ou SOFA-2"
              ],
              [
                "↳ exames / foco",
                "Lactato, hemoculturas 2 pares, demais exames do SOFA-2; ATB amplo pensando no foco; controle do foco em 6–12 h"
              ],
              [
                "↳ volume",
                "Cristaloide balanceado (Ringer lactato/Plasmalyte) 30 mL/kg em até 3 h, individualizando"
              ],
              [
                "↳ vasopressor",
                "Choque séptico: noradrenalina 0,01–3 mcg/kg/min; refratário: vasopressina ou hidrocortisona 200 mg/dia"
              ],
              [
                "⚠ Arboviroses — dengue, chikungunya, zika",
                "Incubação: dengue 3–7 d; chikungunya 1–12; zika 2–7"
              ],
              [
                "↳ marca",
                "Dengue: cefaleia e hematócrito. Chikungunya: poliartralgia. Zika: mono-like com neurotropismo"
              ],
              [
                "↳ febre / rash",
                "Febre alta súbita: dengue e chik; baixa/ausente: zika. Rash: tardio 50% dengue; presente chik; precoce/muito zika"
              ],
              [
                "↳ laboratório",
                "Dengue NS1 até 48–72 h, sorologia ≥D6/D7. Chik PCR até D8, IgM ≥D6. Zika PCR D4–D6, sorologia após"
              ],
              [
                "↳ notificação",
                "Semanal; imediata ≤24 h: óbitos, microcefalia na zika, infecção em região sem transmissão"
              ],
              [
                "↳ alarme (SILVA HHH)",
                "Sangramento mucosa, Irritab./letargia, Líquidos acumulados, Vômitos persist., Abdome doloroso contínuo…"
              ],
              [
                "↳ alarme (cont.)",
                "…Hemoconcentração, Hepatomegalia >2 cm, Hipotensão postural e lipotimia"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Correções frequentes em resumos de sepse",
            "colunas": [
              "Ponto",
              "Versão incorreta comum",
              "Correto / vigente"
            ],
            "linhas": [
              [
                "Erro frequente em resumos",
                "Vasopressina “0,03 mcg/kg/min”",
                "Unidade errada: vasopressina é dose fixa em U/min, classicamente 0,03 U/min, não por peso"
              ],
              [
                "Conflito — tempo de ATB",
                "“Antibiótico em até 1 hora” indiscriminado",
                "Choque séptico ou sepse provável/definida s/ choque: idealmente ≤1 h"
              ],
              [
                "",
                "",
                "Sepse possível: investigar rápido; se suspeita persiste, ≤3 h. Baixa probabilidade s/ choque: pode observar s/ ATB"
              ],
              [
                "Conflito — vasopressor",
                "Noradrenalina atrelada a “PAM <65 ou lactato >2”",
                "Lactato isolado não liga vasopressor"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Sepse — tempo do antibiótico (SSC 2026)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Suspeita de sepse"
              },
              {
                "tipo": "decisao",
                "texto": "Qual a probabilidade / há choque?",
                "ramos": [
                  {
                    "rotulo": "Choque séptico ou sepse provável/definida",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "ATB idealmente ≤1 h"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sepse possível",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Investigar rápido; persistindo a suspeita → ATB ≤3 h"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "Lactato isolado não indica vasopressor"
                      }
                    ]
                  },
                  {
                    "rotulo": "Baixa probabilidade sem choque",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Pode observar sem ATB imediato"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Clínica Médica (2/3) — Malária, hanseníase, monoartrites",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "⚠ Malária — atualização maio 2026",
                "3ª edição do Guia de tratamento da malária no Brasil"
              ],
              [
                "↳ P. falciparum",
                "Incubação 1 sem, sem hipnozoítos, reticulócitos ↑, 48 h; derivado de artemisinina + primaquina dose única"
              ],
              [
                "↳ P. vivax",
                "Incubação 1–2 sem, hipnozoítos e recaídas, 48 h; cloroquina 3 d + tafenoquina DU ou primaquina 7 d"
              ],
              [
                "↳ recorrência / G6PD",
                "Recorrência: primaquina 14 d. Tafenoquina = anti-hipnozoíto no vivax; exige G6PD antes"
              ],
              [
                "⚠ Hanseníase — formas e imagem (multimídia)",
                "Indeterminada: inicial, mácula hipocrômica c/ hipoestesia térmica, dolorosa e tátil"
              ],
              [
                "↳ Paucibacilar",
                "Tuberculoide: placa anestésica, bordas elevadas e centro claro, neurite, granuloma epitelioide, incubação 5 a"
              ],
              [
                "↳ Multibacilar",
                "Dimorfa (lesão foveolar, intermediária) e virchowiana (hansenomas, madarose, histiócitos); incubação 5–10 a"
              ],
              [
                "↳ PQT",
                "6 meses paucibacilar; 12 meses multibacilar"
              ],
              [
                "Monoartrites agudas e líquido sinovial",
                "Séptica não gonocócica: S. aureus (cocos Gram+ em cachos) → oxacilina ou vancomicina"
              ],
              [
                "↳ gonocócica",
                "Diplococo Gram negativo → ceftriaxona"
              ],
              [
                "↳ microcristalinas",
                "Gota: agulha, birrefringência negativa (colchicina, AINE, corticoide). CPPD: romboide, birrefringência positiva"
              ],
              [
                "↳ artrocentese (3 C)",
                "Celularidade, cristais, cultura c/ bacterioscopia. Trauma = 3ª categoria"
              ],
              [
                "↳ leucócitos",
                "<200 normal; 200–2.000 não inflamatório; 2.000–50.000 inflamatório; >50.000 séptico (PMN >75%)"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Malária P. vivax — anti-hipnozoíto conforme G6PD",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "P. vivax: cloroquina por 3 dias + anti-hipnozoíto"
              },
              {
                "tipo": "avaliar",
                "texto": "Testar G6PD antes de prescrever tafenoquina"
              },
              {
                "tipo": "decisao",
                "texto": "Atividade de G6PD?",
                "ramos": [
                  {
                    "rotulo": "≥6,1 UI/gHb (alta)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Tafenoquina 300 mg dose única com cloroquina"
                      }
                    ]
                  },
                  {
                    "rotulo": "4,1–6,0 (intermediária)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Primaquina 0,5 mg/kg/dia por 7 dias"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "Recorrência: primaquina por 14 dias"
                      }
                    ]
                  },
                  {
                    "rotulo": "≤4,0 (baixa)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Primaquina semanal 0,75 mg/kg por 8 semanas, sob supervisão"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Clínica Médica (3/3) — TEP e HAS",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Tromboembolismo pulmonar",
                "Atualização recente, cobrado no Revalida 2026.1. Prob. baixa/intermediária/improvável → D-dímero"
              ],
              [
                "↳ D-dímero",
                "Negativo afasta; positivo → angio-TC. Corte ajustado: 10 × idade se >50 anos"
              ],
              [
                "↳ alta probabilidade",
                "Alta/provável → angio-TC direta: negativa afasta, positiva confirma; negativa c/ prob. alta pode exigir seguir"
              ],
              [
                "↳ o que falta",
                "Fluxo segue válido; a aposta não traz a classificação A–E que substituiu maciço/submaciço"
              ],
              [
                "⚠ Hipertensão — diretriz brasileira 2025",
                "Dx: ≥140x90 em 2 consultas; considerar MAPA/MRPA sempre (média 130x80)"
              ],
              [
                "↳ classificação",
                "Normal <120 e/ou <80; pré-HAS 120–139/80–89; E1 140–159/90– 99; E2 160–179/100–109; E3 ≥180/≥110"
              ],
              [
                "↳ início do tto",
                "120–139/80–89 c/ alto RCV: MEV 3 meses; se ≥130/≥80 → associar fármaco. ≥140/≥90: MEV + fármaco"
              ],
              [
                "↳ alvo",
                "PA <130/80 mmHg (redução de risco CV e renal)"
              ],
              [
                "↳ texto ambíguo",
                "Card cita “PA ≥120 e/ou <80 medidas não medicamentosas” (transcrito como no original)"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "TEP — investigação por probabilidade",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Suspeita de TEP"
              },
              {
                "tipo": "decisao",
                "texto": "Probabilidade clínica?",
                "ramos": [
                  {
                    "rotulo": "Baixa/intermediária ou improvável",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "D-dímero (corte 10×idade se >50 a)"
                      },
                      {
                        "tipo": "decisao",
                        "texto": "D-dímero?",
                        "ramos": [
                          {
                            "rotulo": "Negativo",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Afasta TEP"
                              }
                            ]
                          },
                          {
                            "rotulo": "Positivo",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Angio-TC"
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "rotulo": "Alta ou provável",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Angio-TC direta: negativa afasta, positiva confirma"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Angio-TC negativa com probabilidade alta pode exigir prosseguir; classificação A–E substituiu maciço/submaciço"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "pontos-cegos-clinica-medica",
      "tipo": "pontos-cegos",
      "titulo": "Pontos cegos — Clínica Médica",
      "resumo": "11 temas que costumam passar despercebidos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Clínica Médica",
            "colunas": [
              "Tema",
              "Pista",
              "Regra/conduta"
            ],
            "linhas": [
              [
                "Esporotricose",
                "Arranhadura de gato, nódulos ascendentes, corpos asteroides",
                "Itraconazol por 120 dias. Evitar: confundir c/ piodermite ou micose sistêmica"
              ],
              [
                "Esquistossomose hepatoesplênica",
                "HDA e contato c/ água c/ caramujos",
                "US abdominal + EDA + ovos nas fezes. Evitar: ignorar epidemiologia na investigação digestiva"
              ],
              [
                "Feocromocitoma",
                "Cefaleia, sudorese, taquicardia e paroxismos",
                "Feocromocitoma (HAS secundária). Evitar: classificar como HAS essencial ou ansiedade"
              ],
              [
                "Leptospirose",
                "Enchentes, icterícia, mialgia e sufusão conjuntival",
                "Leptospirose. Evitar: confundir c/ outras síndromes febris ictéricas"
              ],
              [
                "Lúpus eritematoso sistêmico",
                "Artrite, citopenias, úlceras orais e Raynaud",
                "Pedir FAN. Evitar: investigar apenas doença articular isolada"
              ],
              [
                "Melanoma",
                "Assimetria, bordas irregulares, escurecimento e evolução",
                "Melanoma. Evitar: confundir c/ carcinoma cutâneo não melanocítico"
              ],
              [
                "Retocolite ulcerativa",
                "Diarreia c/ muco, sangue, urgência e tenesmo",
                "RCU. Evitar: fixar câncer por história familiar e ignorar síndrome inflamatória"
              ],
              [
                "Supercrescimento bacteriano intestinal",
                "Diarreia crônica, endoscopias normais, teste respiratório c/ lactulose +",
                "Neomicina e rifaximina. Evitar: só sintomáticos ou dieta sem glúten"
              ],
              [
                "Síndrome de Gilbert",
                "Icterícia episódica por jejum/estresse, sem colúria/hepatopatia",
                "Distúrbio benigno da conjugação: orientar. Evitar: genética/US ou medicar"
              ],
              [
                "Intoxicação por chumbo",
                "Reciclagem de baterias e anemia refratária ao ferro",
                "Chumbo sérico. Evitar: tratar toda microcitose como ferropriva"
              ],
              [
                "Larva migrans cutânea",
                "Lesão pruriginosa serpiginosa do espaço interdigital ao dorso",
                "Ancylostoma brasiliensis. Evitar: confundir c/ tinea, tungíase ou escabiose"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "travas-clinica-medica",
      "tipo": "travas",
      "titulo": "Travas — Clínica Médica",
      "resumo": "61 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Clínica Médica",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "BAV 2:1 x Mobitz",
                "2 P para 1 QRS = BAV 2:1. Wenckebach estica; Mobitz II derruba do nada"
              ],
              [
                "FA instável / eco",
                "FA instável = cardioverte agora. TTE vê estrutura; ETE procura trombo"
              ],
              [
                "Hipercalemia",
                "K + ECG alterado = CÁLCIO PRIMEIRO"
              ],
              [
                "Paracentese",
                "Baixo risco: INR e plaqueta não mandam. Qual albumina? Primeiro pergunte QUAL complicação"
              ],
              [
                "Glicemia c/ corticoide",
                "Corticoide engana o jejum e sobe à tarde"
              ],
              [
                "Anti-IL-17",
                "IL-17 ama pele, mas briga com intestino. Dactilite não decide; pele e contexto decidem"
              ],
              [
                "Sintoma novo no idoso",
                "Lista de remédios primeiro"
              ],
              [
                "⚠ Hepatite C",
                "Nunca tratou = APRI/Child. Falhou DAA = resgate. RVS12 = cura"
              ],
              [
                "IC descompensada",
                "Hipertenso e molhado: vasodilata e seca. Hipotenso e frio: sustenta e perfunde"
              ],
              [
                "Insulina x dieta",
                "Dieta oral segue o prato; dieta contínua segue o relógio; crítico vai para a bomba"
              ],
              [
                "Gota x séptica",
                "Uricemia normal exclui gota aguda? E cristal exclui artrite séptica?"
              ],
              [
                "Leitura do 120",
                "Não leia só 120. Pergunte: 120 minutos ATÉ O QUÊ?"
              ],
              [
                "HBV",
                "Aguda? Crônica? Tem atalho? Só depois DNA + ALT"
              ],
              [
                "Strongyloides",
                "Vai imunossuprimir e pode ter Strongyloides? Pense antes de acender a hiperinfecção"
              ],
              [
                "Paliativo — via",
                "Via oral ruim = lembrar via subcutânea antes da transferência por reflexo"
              ],
              [
                "Hérnia de disco",
                "Sem red flag: conservador primeiro"
              ],
              [
                "Fibromialgia",
                "Atual = WPI + SSS; 11/18 ficou histórico"
              ],
              [
                "Graves x tempestade",
                "Graves explica a causa; tempestade é o corpo inteiro descompensado"
              ],
              [
                "Neuropatia",
                "Diapasão vibra = fibra grossa; B6 demais também neuropatiza"
              ],
              [
                "Nódulo tireoidiano",
                "Nódulo primeiro pergunta ao TSH se ele funciona"
              ],
              [
                "VPPB",
                "Hallpike acha. Epley trata"
              ],
              [
                "Trombose renal",
                "Nefrótico + flanco + sangue + rim grande = trombose renal"
              ],
              [
                "Perda auditiva",
                "Antes de dizer que esqueceu, confirme que ouviu"
              ],
              [
                "DRESS x NET",
                "DRESS incha e eosinofiliza; TEN/NET descola"
              ],
              [
                "Supra de ST",
                "Supra que espalha + PR mexe = pericárdio; supra territorial = coronária"
              ],
              [
                "Stent",
                "Precisa de DAPT: AAS + P2Y12. Não invente proibição automática do clopidogrel"
              ],
              [
                "FA — duas provas",
                "Proteger do AVC e controlar ritmo/frequência. Não troque anticoagulação por betabloqueador"
              ],
              [
                "Profilaxia endocardite",
                "Endocardite + dente + alto risco = amoxicilina 2 g 30–60 min antes"
              ],
              [
                "TEP — exames",
                "AngioTC diz SE tem TEP; eco + BNP/troponina dizem QUANTO o VD sofreu"
              ],
              [
                "PESI",
                "PESI também pontua T <36"
              ],
              [
                "MYH9",
                "Rim familiar + macroplaquetas = lembrar MYH9"
              ],
              [
                "Creatinina + hipo nova",
                "Creatinina mudou de verdade + hipo nova = reestratifica rim antes de só culpar adesão"
              ],
              [
                "Obstrução alta",
                "Não melhora com Foley; ureter bloqueado pede drenagem alta"
              ],
              [
                "Cushing",
                "Primeiro prova cortisol autônomo; depois pergunta de onde vem com ACTH"
              ],
              [
                "Hipercalcemia grave",
                "Soro primeiro; calcitonina corre, bisfosfonato sustenta"
              ],
              [
                "Hiponatremia grave",
                "Sobe 4–6 e perde a pressa. Se disparar: DDAVP freia + SG5% traz de volta"
              ],
              [
                "Legionella",
                "Pulmão + intestino + sódio; hotel lembra água aerosolizada"
              ],
              [
                "TB latente",
                "Latente não é RIPE: exclui TB ativa → TPT; HIV não espera por latência"
              ],
              [
                "Toxo x cripto — tto",
                "Toxo = anel + foco; pirimetamina/sulfadiazina/folínico. Cripto = anfotericina + flucitosina"
              ],
              [
                "Encefalite HSV",
                "Febre + comportamento + convulsão + temporal = HSV; aciclovir já"
              ],
              [
                "Efavirenz",
                "Efavirenz faz o cérebro sonhar/tonturar"
              ],
              [
                "Choque séptico",
                "Lactato alto não basta: precisa VASOPRESSOR + lactato >2 apesar de volume"
              ],
              [
                "SNC no HIV",
                "TOXO = foco/anel. CRIPTO = pressão. TB = base/hidrocefalia. Convulsão/focalidade = imagem antes do líquor"
              ],
              [
                "Vertigem central",
                "Vertigem + skew/focalidade = central até prova em contrário"
              ],
              [
                "Vertigem periférica",
                "Periférico escolhe uma direção e a fixação o acalma"
              ],
              [
                "TRALI",
                "Pós-transfusão + pulmão branco sem volume sobrando = TRALI"
              ],
              [
                "vWF",
                "vWF carrega/guarda o VIII"
              ],
              [
                "Falciforme",
                "Crises + hemólise + úlcera maleolar = falciforme até provar o contrário; idade não apaga a síndrome"
              ],
              [
                "Metanol x etilenoglicol",
                "Metanol cega; etilenoglicol quebra o rim"
              ],
              [
                "Tricíclico",
                "Seco + dilatado + convulsão + QRS; bicarbonato salva o coração"
              ],
              [
                "Artrite reumatoide",
                "Inflamatória simétrica poupa IFD; DMARD cedo, MTX é a âncora"
              ],
              [
                "Doença celíaca",
                "Transglutaminase encontra; endomísio confirma"
              ],
              [
                "Compressão medular",
                "Câncer + dor vertebral + déficit: dexametasona já, RM e definitivo depois"
              ],
              [
                "Tiflite",
                "Neutropênico + febre + FID + ceco grosso = tiflite"
              ],
              [
                "Dor no paliativo",
                "Opioide forte não significa internação; paliativo bom muitas vezes trata a dor em casa"
              ],
              [
                "MALT gástrico",
                "MALT + H. pylori: primeiro pense em erradicar; RT é a próxima camada quando indicada"
              ],
              [
                "⚠ AVC — janela",
                "4,5 h não é mais a única janela: imagem pode estender trombólise e trombectomia"
              ],
              [
                "⚠ TEP 2026",
                "Probabilidade antes do dímero; choque antes da anatomia"
              ],
              [
                "⚠ GINA 2026",
                "Broncodilatador nunca anda sozinho"
              ],
              [
                "⚠ Sepse 2026",
                "Individualiza: nem antibiótico, nem volume, nem lactato no piloto automático"
              ],
              [
                "⚠ Sepse 2026 — ATB",
                "Provável ou choque = 1 h; possível sem choque = até 3 h. Lactato não liga noradrenalina sozinho"
              ]
            ]
          }
        }
      ]
    }
  ]
};
