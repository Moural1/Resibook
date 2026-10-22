/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const CIRURGIA: AreaDossie = {
  "id": "cirurgia",
  "nome": "Cirurgia",
  "blocos": [
    {
      "id": "trauma-tce-trm-torax-abdome-pelve",
      "tipo": "tema",
      "titulo": "Trauma — TCE, TRM, tórax, abdome, pelve",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Trauma de pelve — cinta baixa e controle de danos",
              "texto": "Cinta nos trocânteres + ressuscitação hemostática. Instável/FAST+ com abdome → laparotomia (pelve pode exigir acesso pré-peritoneal separado). FAST− e pelve foco → packing pré-peritoneal + estabilização externa. Sangue no meato → uretrografia.",
              "trava": "Cinta pélvica é baixa: trocânteres. Abdome e pelve sangrando: cada um ganha sua porta."
            },
            {
              "titulo": "Fratura exposta — sala de trauma x centro cirúrgico",
              "texto": "Sala de trauma: ATB precoce + tétano + curativo/cobertura estéril + exame neurovascular + alinhamento + imobilização. Centro cirúrgico: irrigação abundante e desbridamento adequados.",
              "trava": "Trauma = antibiótico, tétano, cobre, alinha, imobiliza. Irriga/desbrida de verdade no CC."
            },
            {
              "titulo": "Hemotórax maciço — drenar já é ressuscitar",
              "texto": "ABCDE + reposição/hemostasia + drenagem torácica em paralelo (não 'estabilizar → depois drenar'). Débito inicial/contínuo importante e instabilidade orientam controle cirúrgico conforme protocolo.",
              "trava": "No hemotórax maciço, drenar já é ressuscitar."
            },
            {
              "titulo": "Hemotórax: critérios de toracotomia",
              "texto": "Regra clássica: >1.500 mL imediato OU ~150-200 mL/h por 2-4 h OU instabilidade/necessidade transfusional persistente. A base já usa >200 mL/h por 2-4 h.",
              "trava": "Hemotórax: 1500 de uma vez OU ~200 por hora persistente."
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
                "Trauma de pelve",
                "Cinta nas cristas ilíacas; misturou controle do sangramento abdominal com o pélvico",
                "Choque + pelve instável: não perder tempo com TC; FAST decide se há foco intraperitoneal concorrente",
                "Sequência packing/fixação varia por protocolo: memorize o princípio, não ordem dogmática"
              ],
              [
                "Fratura exposta",
                "Aceitou lavagem definitiva na sala de trauma; tratou redução/imobilização como conduta completa",
                "Gustilo IIIA: alta energia, cobertura adequada; IIIB perde cobertura/periósteo; IIIC lesão arterial a reparar",
                "Não confundir 'lavar sujeira grosseira' com irrigação/desbridamento definitivo"
              ],
              [
                "Hemotórax maciço",
                "Aceitou a sequência estabilizar → depois drenar",
                "Choque/hipoxemia + grande coleção hemática pleural",
                "Toracotomia de emergência não é automática; extremis/parada é outra indicação"
              ],
              [
                "Critérios de toracotomia",
                "Limiar de sangramento persistente lembrado alto demais; débito horário não automatizado",
                "400 mL/h por 2 h; 350 mL/h por 2 h; 1.700 mL imediato → gabarito: I + II + III",
                "—"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Trauma de pelve com choque",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Choque + pelve instável"
              },
              {
                "tipo": "conduta",
                "texto": "Cinta pélvica nos trocânteres + ressuscitação hemostática; não perder tempo com TC"
              },
              {
                "tipo": "decisao",
                "texto": "FAST?",
                "ramos": [
                  {
                    "rotulo": "FAST+ (abdome responsável)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Laparotomia; controle pélvico pode exigir acesso pré-peritoneal separado"
                      }
                    ]
                  },
                  {
                    "rotulo": "FAST− (pelve é o foco)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Packing pré-peritoneal + estabilização externa conforme protocolo"
                      },
                      {
                        "tipo": "avaliar",
                        "texto": "Embolização: opção se o paciente suporta a estratégia"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Sangue no meato → uretrografia retrógrada antes de sonda"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Fratura exposta — onde se faz cada etapa",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Fratura exposta"
              },
              {
                "tipo": "conduta",
                "texto": "Sala de trauma: ATB precoce + tétano + curativo/cobertura estéril"
              },
              {
                "tipo": "conduta",
                "texto": "Exame neurovascular + alinhamento + imobilização"
              },
              {
                "tipo": "conduta",
                "texto": "Centro cirúrgico: irrigação abundante + desbridamento adequado"
              },
              {
                "tipo": "atencao",
                "texto": "Lavar sujeira grosseira na sala ≠ irrigação/desbridamento definitivo"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Gustilo III",
            "colunas": [
              "Tipo",
              "Definição"
            ],
            "linhas": [
              [
                "IIIA",
                "Alta energia/ferida extensa, mas cobertura de partes moles ainda adequada"
              ],
              [
                "IIIB",
                "Perde cobertura/periósteo"
              ],
              [
                "IIIC",
                "Lesão arterial que requer reparo"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Hemotórax maciço e toracotomia",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Choque/hipoxemia + grande coleção hemática pleural"
              },
              {
                "tipo": "conduta",
                "texto": "ABCDE + reposição/hemostasia + drenagem torácica em paralelo"
              },
              {
                "tipo": "decisao",
                "texto": "Critério de toracotomia?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "avaliar",
                        "texto": ">1.500 mL imediato OU ~150-200 mL/h por 2-4 h (base: >200 mL/h) OU instabilidade/transfusão persistente"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Controle cirúrgico (toracotomia)"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Seguir débito e estabilidade conforme protocolo"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Toracotomia de emergência não é automática; extremis/parada é outra indicação"
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
                "⚠ TCE · URGÊNCIA · IMAGEM",
                "Intervalo lúcido, anisocoria e coleção biconvexa",
                "Interpretar deterioração e tomografia",
                "Confundir com subdural ou observar sem cirurgia"
              ],
              [
                "Hemorragia externa no trauma · URGÊNCIA",
                "Hemorragia arterial volumosa em membro",
                "Controlar sangramento pré-hospitalar",
                "Dissecar vaso no local ou usar albumina"
              ],
              [
                "Via aérea no trauma · URGÊNCIA",
                "Trauma facial grave, estridor e hipoxemia refratária",
                "Escolher via definitiva diante de obstrução facial",
                "Tentar intubação convencional em via aérea inviável"
              ],
              [
                "Trauma ocular aberto · URGÊNCIA",
                "Fragmento de alta velocidade e extravasamento de vítreo",
                "Proteger olho e iniciar medidas pré-transferência",
                "Irrigar, pressionar ou aplicar colírios em globo aberto"
              ],
              [
                "⚠ XABCDE do trauma · URGÊNCIA · IMAGEM",
                "Amputação traumática com sangramento ativo abundante",
                "Priorizar controle externo",
                "Começar por via aérea/volume antes de controlar exsanguinação"
              ],
              [
                "Trauma torácico · URGÊNCIA",
                "Ferida por arma de fogo, macicez e MV diminuído",
                "Escolher drenagem pleural",
                "Descomprimir como pneumotórax ou drenar pelo orifício do projétil"
              ],
              [
                "Atendimento inicial ao trauma · URGÊNCIA",
                "TCE grave já intubado no pré-hospitalar",
                "Aplicar ABCDE ao chegar ao hospital",
                "Pular A porque a intubação já ocorreu"
              ],
              [
                "Trauma uretral · URGÊNCIA",
                "Uretrorragia, hematoma em asa de borboleta e retenção",
                "Desviar urina sem sondagem",
                "Passar sonda uretral diante de sinais de lesão"
              ],
              [
                "Trauma uretral · URGÊNCIA",
                "Uretrorragia, hematoma perineal e globo vesical",
                "Desviar urina sem sondagem uretral",
                "Passar sonda pela uretra traumatizada"
              ],
              [
                "⚠ TCE · URGÊNCIA",
                "Idoso, perda de consciência, Glasgow 13 e ferida sangrante",
                "Estabilizar ferida e transferir",
                "Observar em casa ou pedir apenas radiografia"
              ],
              [
                "Trauma raquimedular · URGÊNCIA",
                "Perda completa até cicatriz umbilical",
                "Localizar lesão",
                "Confundir dermátomo umbilical com níveis mais baixos"
              ],
              [
                "⚠ TCE · URGÊNCIA",
                "Inconsciência prolongada, trauma facial e cervical",
                "Definir investigação após perda de consciência e amnésia",
                "Radiografia de crânio ou alta precoce"
              ],
              [
                "Trauma torácico · URGÊNCIA",
                "Hipoxemia, turgência jugular, desvio traqueal e MV abolido",
                "Realizar tratamento imediato pré-hospitalar",
                "Priorizar exame, volume ou pericardiocentese"
              ],
              [
                "Transferência do politraumatizado · URGÊNCIA",
                "Choque, pelve instável e unidade sem banco de sangue/cirurgião",
                "Organizar remoção segura",
                "Dar grande volume, usar suporte básico ou transferir sem contato/documento"
              ],
              [
                "Trauma de aorta · URGÊNCIA",
                "Alta energia, mediastino alargado, botão aórtico apagado e traqueia desviada",
                "Reconhecer sinais radiográficos",
                "Confundir com pneumotórax, hemotórax ou tamponamento"
              ],
              [
                "Trauma abdominal fechado · URGÊNCIA",
                "Choque refratário e grande líquido livre subdiafragmático",
                "Indicar laparotomia imediata",
                "Levar instável à tomografia ou repetir FAST"
              ],
              [
                "Trauma de uretra e pelve",
                "Pelve instável e hematoma perineal",
                "Escolha do exame",
                "Investigar trato urinário sem reconhecer lesão uretral"
              ],
              [
                "Hemotórax maciço",
                "Choque profundo, macicez e ausência de murmúrio",
                "Controle cirúrgico de hemorragia",
                "Atrasar controle definitivo em instabilidade extrema"
              ],
              [
                "Choque no trauma pediátrico",
                "Criança atropelada com sinais de choque",
                "Acesso e reposição inicial",
                "Atrasar acesso vascular e ressuscitação"
              ],
              [
                "Trauma raquimedular",
                "Nível sensitivo na cicatriz umbilical",
                "Localização por dermátomo",
                "Errar correlação anatômica do nível medular"
              ],
              [
                "⚠ TCE",
                "Glasgow 9 após queda",
                "Conduta inicial",
                "Aplicar limiar de via aérea sem contexto; X preservado"
              ],
              [
                "Exame neurológico no TRM",
                "Déficit de extensão do joelho",
                "Miotomo e graduação de força",
                "Confundir músculo-chave com nível sensitivo"
              ],
              [
                "Infecção osteoarticular profunda pós-trauma",
                "Febre, dor inguinal e limitação coxofemoral",
                "Escolha de imagem",
                "Atribuir quadro a dor traumática simples"
              ],
              [
                "Lesão urinária e fístula após trauma pélvico",
                "Urina vaginal e hidronefrose após operação",
                "Correção cirúrgica",
                "Tratar incontinência sem reconhecer lesão ureteral associada"
              ],
              [
                "⚠ Pneumotórax hipertensivo traumático",
                "Hipoxemia, hipertimpanismo e desvio traqueal",
                "Descompressão imediata",
                "Aguardar radiografia para intervir"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "abdome-agudo",
      "tipo": "tema",
      "titulo": "Abdome agudo",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Obstrução intestinal — brida não vence câncer nem alça fechada",
              "texto": "Brida simples sem sofrimento → descompressão/observação. Alça fechada, isquemia, perfuração, peritonite ou instabilidade → cirurgia. Idoso + anemia/perda ponderal + transição colônica → câncer. Meta hepática colorretal ≠ irressecável.",
              "trava": "Cirurgia antiga não vence o padrão atual. Brida simples = clínico; alça fechada/hipoperfusão = cirurgia."
            },
            {
              "titulo": "Apendicite — gestante e plastrão/abscesso",
              "texto": "Gestante: US inconclusivo → RM sem gadolínio antes de cirurgia às cegas. Plastrão/abscesso drenável ~5 cm, estável, sem peritonite difusa → antibiótico + drenagem percutânea; apendicectomia de intervalo. Dor ao transdutor é pista útil.",
              "trava": "Gestante: US → RM. Abscesso organizado: controla coleção antes de correr para o apêndice."
            },
            {
              "titulo": "Síndrome de Wilkie e diferenciais",
              "texto": "Grande perda ponderal → perda do coxim gorduroso → ↓ ângulo aortomesentérico → 3ª porção do duodeno comprimida entre aorta e AMS: dor pós-prandial, náuseas, vômitos, distensão. Diferencial: hérnia interna pós-bariátrica (swirl sign).",
              "trava": "Wilkie emagrece e fecha o ângulo: AMS esmaga o duodeno contra a aorta."
            },
            {
              "titulo": "Isquemia mesentérica — instabilidade muda a etapa",
              "texto": "Choque + defesa/peritonite + pneumatose/distensão → laparotomia de emergência, avaliar alça, revascularização/ressecção preservando intestino; second look pode ser necessário. Estável sem peritonite → endovascular/angiografia.",
              "trava": "Isquemia mesentérica + peritonite/choque = centro cirúrgico, não exame demorado."
            },
            {
              "titulo": "Diverticulite com peritonite — conduta firme, Hinchey datado",
              "texto": "Abscesso localizado em estável → antibiótico ± drenagem. Peritonite generalizada/ar livre → ressuscitação, antibiótico e controle cirúrgico do foco. Hinchey III = purulenta; IV = fecal. Pneumoperitônio isolado não define IV.",
              "trava": "Abscesso localizado drena; peritonite generalizada opera. III purulenta, IV fecal."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Obstrução intestinal: brida x câncer x alça fechada",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Obstrução intestinal com cirurgia abdominal prévia"
              },
              {
                "tipo": "decisao",
                "texto": "Qual padrão atual?",
                "ramos": [
                  {
                    "rotulo": "Idoso + anemia/perda ponderal + transição colônica",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Pensar câncer"
                      }
                    ]
                  },
                  {
                    "rotulo": "2 pontos de transição + hipoperfusão/líquido livre",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Alça fechada/estrangulamento → cirurgia"
                      }
                    ]
                  },
                  {
                    "rotulo": "Brida simples sem sofrimento",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Descompressão/observação conforme contexto"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Isquemia, perfuração, peritonite ou instabilidade → cirurgia"
              },
              {
                "tipo": "atencao",
                "texto": "Meta hepática colorretal: avaliar ressecção completa e remanescente hepático funcional"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Apendicite: gestante e plastrão/abscesso",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Cenário?",
                "ramos": [
                  {
                    "rotulo": "Gestante",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "US → se inconclusivo, RM sem gadolínio"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "Não ir à cirurgia às cegas; dor ao transdutor é pista útil"
                      }
                    ]
                  },
                  {
                    "rotulo": "Plastrão/abscesso ~5 cm, estável, sem peritonite difusa",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Antibiótico + drenagem percutânea se factível"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Apendicectomia de intervalo conforme protocolo"
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
            "titulo": "Isquemia mesentérica: etapa certa",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Isquemia mesentérica reconhecida"
              },
              {
                "tipo": "decisao",
                "texto": "Peritonite franca/choque/pneumatose?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Laparotomia de emergência: avaliar alça, revascularizar/ressecar preservando intestino"
                      },
                      {
                        "tipo": "conduta",
                        "texto": "Second look pode ser necessário"
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
              },
              {
                "tipo": "atencao",
                "texto": "Exame verdadeiro na etapa errada = alternativa errada"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Diverticulite complicada",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Abscesso localizado ou peritonite generalizada?",
                "ramos": [
                  {
                    "rotulo": "Abscesso localizado, estável",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Antibiótico ± drenagem"
                      }
                    ]
                  },
                  {
                    "rotulo": "Peritonite generalizada/ar livre",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Ressuscitação + antibiótico + controle cirúrgico do foco"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "avaliar",
                "texto": "Hinchey III = peritonite purulenta; IV = fecal"
              },
              {
                "tipo": "atencao",
                "texto": "Pneumoperitônio isolado não permite chamar IV: o conteúdo peritoneal separa III de IV"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Síndrome de Wilkie x hérnia interna",
            "colunas": [
              "Item",
              "Wilkie (AMS)",
              "Hérnia interna pós-bariátrica"
            ],
            "linhas": [
              [
                "Mecanismo",
                "Perda de gordura ↓ ângulo aortomesentérico; 3ª porção do duodeno entre aorta e AMS",
                "—"
              ],
              [
                "Perfil",
                "Jovem/magro ou após grande emagrecimento, inclusive pós-bariátrica",
                "Pós-bariátrica"
              ],
              [
                "Clínica",
                "Dor pós-prandial, náuseas, vômitos, distensão, obstrução duodenal",
                "Dor intermitente/obstrução"
              ],
              [
                "Imagem/conduta",
                "Redução do ângulo aortomesentérico",
                "Possível swirl sign na TC; risco de estrangulamento; limiar baixo para exploração"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Abdome agudo",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Diverticulite aguda",
                "Dor em FIE, febre, leucocitose e plastrão",
                "Escolher método de maior acurácia",
                "Fazer colonoscopia na fase aguda"
              ],
              [
                "Úlcera péptica perfurada · URGÊNCIA · IMAGEM",
                "AINE crônico, dor súbita, peritonite e ar subfrênico",
                "Reconhecer diagnóstico de abdome agudo",
                "Confundir com pancreatite ou colecistite"
              ],
              [
                "Apendicite aguda · URGÊNCIA",
                "Descompressão brusca dolorosa em dor migratória",
                "Reconhecer indicação de avaliação cirúrgica",
                "Valorizar vômito/dor difusa sem peritonismo"
              ],
              [
                "Apendicite aguda · URGÊNCIA",
                "Dor migratória, febre, neutrofilia e dor em FID",
                "Identificar achado complementar",
                "Interpretar piúria discreta como pielonefrite"
              ],
              [
                "Íleo pós-operatório",
                "Drenagem gástrica de 2 L e íleo no segundo dia",
                "Relacionar perdas digestivas à motilidade",
                "Escolher distúrbio que aumentaria excitabilidade sem considerar perdas"
              ],
              [
                "Apendicite aguda · URGÊNCIA · IMAGEM",
                "Dor migratória para FID, febre e irritação peritoneal",
                "Escolher exame e avaliação cirúrgica",
                "Tratar ambulatorialmente ou presumir etiologia ginecológica"
              ],
              [
                "Diverticulite aguda · URGÊNCIA",
                "Coleção adjacente ao sigmoide e massa dolorosa",
                "Escolher drenagem conforme complicação",
                "Operar todo abscesso ou tratar apenas com antibiótico"
              ],
              [
                "Íleo pós-operatório",
                "3º dia pós-colectomia, alças difusamente dilatadas e sem ar/líquido livre",
                "Diferenciar de obstrução e deiscência",
                "Chamar obstrução mecânica sem ponto de transição"
              ],
              [
                "Apendicite aguda",
                "Apêndice aumentado e inflamação periapendicular",
                "Operação e antibioticoprofilaxia",
                "Confundir profilaxia perioperatória com tratamento prolongado"
              ],
              [
                "Diverticulite complicada",
                "Dor em FIE e plastrão pélvico",
                "Diagnóstico e imagem",
                "Tratar recorrência como não complicada sem investigar abscesso"
              ],
              [
                "⚠ Hemorragia digestiva alta não varicosa",
                "Nova hematêmese após hemostasia com estabilidade",
                "Conduta na recidiva de sangramento",
                "Indicar cirurgia imediatamente sem considerar reendoscopia"
              ],
              [
                "Isquemia mesentérica",
                "Dor súbita, pneumatose e gás portal",
                "Reconhecimento e sequência diagnóstica",
                "Confundir com obstrução mecânica simples"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "vias-biliares-e-pancreas-cirurgicos",
      "tipo": "tema",
      "titulo": "Vias biliares e pâncreas cirúrgicos",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Coledocolitíase/colangite — CPRE não exige febre para existir",
              "texto": "Cálculo no colédoco + colestase = coledocolitíase; + febre/infecção = colangite. Cálculo visto/alta probabilidade → desobstrução endoscópica; colangite → antibiótico + drenagem urgente; depois colecistectomia. US sem cálculo não exclui.",
              "trava": "Colédoco entupido = amarelo; entupido + infectado = amarelo + febre."
            },
            {
              "titulo": "⚠ Cistos pancreáticos: MCN, IPMN, serosa e pseudopapilar",
              "texto": "MCN: quase exclusiva de mulheres; corpo/cauda; macro/oligocística; mucina viscosa; possível calcificação periférica/de parede. IPMN é intraductal. Mulher jovem isoladamente também poderia sugerir pseudopapilar.",
              "trava": "⚠ MUCINOSA = MULHER + MUCO + CAUDA. IPMN mora no ducto; MCN fica fora dele."
            },
            {
              "titulo": "Fístula biliar do coto cístico: descompressão por CPRE",
              "texto": "Pós-colecistectomia, biloma drenado, débito biliar persistente no coto cístico, sem sepse → drenar coleção se preciso + CPRE p/ descompressão (papilotomia; ou stent ± esfincterotomia). Lesão maior/peritonite/falha → equipe HBP.",
              "trava": "Vazou pelo cístico? Não corro para religar: descomprimo a via biliar com CPRE."
            },
            {
              "titulo": "⚠ Resgate endoscópico com SpyGlass após transplante",
              "texto": "Falha da CPRE convencional não esgota a endoscopia: SpyGlass = colangioscopia com visão direta; permite litotripsia intraductal a laser/eletro-hidráulica em cálculos difíceis. Drenagem percutânea é alternativa legítima se endoscopia falha.",
              "trava": "⚠ Falha da CPRE convencional não esgota a endoscopia: visão direta pode resgatar; via depende de anatomia e equipe."
            },
            {
              "titulo": "⚠ Adenoma hepatocelular x HNF x hemangioma",
              "texto": "Estrogênio + fator metabólico + hipervascular + sem retenção hepatobiliar = adenoma. Mulher: retirar estrogênio/corrigir fator metabólico e reavaliar; persistente ou crescente ≥5 cm favorece ressecção. Não operar todo ≥5 cm de imediato.",
              "trava": "HNF segura contraste; adenoma deixa escapar."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Coledocolitíase x colangite",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Colestase com cálculo no colédoco ou alta probabilidade"
              },
              {
                "tipo": "atencao",
                "texto": "US sem cálculo não exclui: colédoco dilatado, cálculo pode não ser visto"
              },
              {
                "tipo": "decisao",
                "texto": "Febre/infecção?",
                "ramos": [
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Coledocolitíase → desobstrução endoscópica conforme cenário"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Colangite → antibiótico + drenagem urgente"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "conduta",
                "texto": "Depois: colecistectomia quando indicado"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Cistos pancreáticos — discriminadores",
            "colunas": [
              "Lesão",
              "Discriminadores no texto"
            ],
            "linhas": [
              [
                "MCN",
                "Quase exclusiva de mulheres; corpo/cauda; macro/oligocística; mucina viscosa; calcificação periférica/de parede"
              ],
              [
                "IPMN",
                "Intraductal: mora no ducto (comunicação ductal); MCN fica fora dele"
              ],
              [
                "Pseudopapilar",
                "Mulher jovem isoladamente também poderia sugerir"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Fístula do coto cístico pós-colecistectomia",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Pós-colecistectomia, biloma drenado, débito biliar persistente, extravasamento no coto, sem sepse"
              },
              {
                "tipo": "conduta",
                "texto": "Drenar coleção/biloma quando necessário"
              },
              {
                "tipo": "conduta",
                "texto": "CPRE para descompressão: papilotomia/esfincterotomia ou stent biliar ± esfincterotomia"
              },
              {
                "tipo": "avaliar",
                "texto": "↓ pressão intraductal → fluxo ao duodeno → fechamento da fístula"
              },
              {
                "tipo": "decisao",
                "texto": "Lesão maior, transecção, peritonite, instabilidade ou falha?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Equipe HBP, controle de foco e possível reconstrução"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Manter manejo endoscópico"
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
            "titulo": "Lesão hepática: adenoma x HNF x hemangioma",
            "colunas": [
              "Lesão",
              "Padrão",
              "Conduta/nota"
            ],
            "linhas": [
              [
                "Hemangioma",
                "Realce periférico nodular com preenchimento centrípeto",
                "—"
              ],
              [
                "HNF",
                "Costuma reter contraste hepatobiliar",
                "—"
              ],
              [
                "Adenoma",
                "Estrogênio/obesidade, hipervascular, geralmente sem retenção",
                "Retirar estrogênio/corrigir fator e reavaliar; persistente/crescente ≥5 cm → ressecção"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Vias biliares e pâncreas",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "Câncer de pâncreas",
                "Dor dorsal, perda ponderal, icterícia, colúria e acolia",
                "Escolher imagem e marcador no quadro obstrutivo",
                "Priorizar CPRE diagnóstica ou investigação de hepatite"
              ],
              [
                "Coledocolitíase · IMAGEM",
                "Icterícia sem febre/instabilidade, vias dilatadas e cálculos",
                "Escolher exame não invasivo",
                "Chamar colangite e indicar CPRE urgente"
              ],
              [
                "Coledocolitíase",
                "Icterícia colestática e cálculo de 9 mm no colédoco",
                "Escolher CPRE terapêutica",
                "Fazer colecistectomia antes de limpar a via biliar"
              ],
              [
                "Pancreatite crônica · URGÊNCIA",
                "Dor recorrente dorsal e etilismo crônico com US normal",
                "Escolher exame e tratamento da dor",
                "Usar CPRE diagnóstica ou enzimas como analgésico universal"
              ],
              [
                "Colangite grave",
                "Hipotensão persistente após cristaloide, alteração do sensório",
                "Iniciar vasopressor antes da drenagem",
                "Ir à CPRE sem estabilizar ou usar coloide/corticoide primeiro"
              ],
              [
                "Neoplasia pancreática",
                "Icterícia indolor, vesícula palpável e emagrecimento",
                "Escolher imagem inicial",
                "Investigar colecistite ou biopsiar antes do estadiamento"
              ],
              [
                "Coledocolitíase",
                "Icterícia colestática sem febre ou Murphy",
                "Escolha de exame com maior acurácia",
                "Confundir colestase com colecistite ou colangite"
              ],
              [
                "Pancreatite crônica",
                "Etilismo, dor crônica, esteatorreia e emagrecimento",
                "Diagnóstico e manejo",
                "Tratar como pancreatite aguda apenas por enzimas"
              ],
              [
                "Fístula pancreática pós-operatória",
                "Débito claro após gastroduodenopancreatectomia",
                "Exame do líquido do dreno",
                "Julgar secreção benigna apenas pelo aspecto"
              ],
              [
                "Colelitíase após cirurgia bariátrica",
                "Perda rápida de peso e epigastralgia",
                "Diagnóstico de complicação tardia",
                "Considerar somente complicações da linha de grampeamento"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "perioperatorio-e-complicacoes-pos-operatorias",
      "tipo": "tema",
      "titulo": "Perioperatório e complicações pós-operatórias",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "⚠ Angina estável após revascularização: otimizar tratamento",
              "texto": "Sintomas previsíveis, aliviados c/ repouso, FC 92 e PA 150/90 apesar de atenolol baixa dose + enalapril → revisar adesão/tolerância, otimizar antianginoso e PA, considerar outro antianginoso e prevenção secundária (estatina).",
              "trava": "⚠ Angina estável + FC/PA sem controle: otimizar tratamento. Enxerto ocluído, sozinho, não obriga revascularização."
            },
            {
              "titulo": "Cefaleia pós-punção dural — escalonamento",
              "texto": "Pós-punção, piora sentado/em pé, melhora em decúbito, sem déficit/bandeira vermelha: avaliar alternativos; analgesia, hidratação conforme necessidade, cafeína conforme contexto. Incapacitante ou sem melhora → discutir blood patch.",
              "trava": "Decúbito melhora o sintoma; blood patch é o escalonamento quando importa ou persiste."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Angina estável pós-revascularização — leitura",
            "colunas": [
              "Dado",
              "Interpretação"
            ],
            "linhas": [
              [
                "Oclusão de 2 enxertos",
                "Não obriga revascularização por si só"
              ],
              [
                "FC 92 e PA 150/90 com atenolol baixa dose + enalapril",
                "Tratamento insuficientemente ajustado → revisar adesão/tolerância"
              ],
              [
                "Betabloqueador",
                "Reduz FC e demanda de O2"
              ],
              [
                "Enalapril",
                "Controle pressórico; sem ação antianginosa direta"
              ],
              [
                "Próximo passo",
                "Associar outro antianginoso conforme resposta; otimizar prevenção secundária (estatina)"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Cefaleia pós-punção dural",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Cefaleia após punção, piora ao sentar/em pé, melhora em decúbito"
              },
              {
                "tipo": "decisao",
                "texto": "Atípica, déficit, convulsão, febre ou hipertensão?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Investigar outras causas"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Analgesia, hidratação conforme necessidade, cafeína conforme contexto"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "decisao",
                "texto": "Compromete atividades/cuidados ou não melhora?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Discutir blood patch (melhor após observação inicial; não adiar se incapacitante)"
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
              },
              {
                "tipo": "atencao",
                "texto": "Repouso horizontal prolongado não é tratamento específico"
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
                "Complicação da tireoidectomia",
                "Rouquidão persistente após tireoidectomia",
                "Relacionar sintoma e anatomia",
                "Escolher vago ou hipoglosso de forma genérica"
              ],
              [
                "Jejum pré-operatório · URGÊNCIA",
                "Cirurgia eletiva em adulto saudável",
                "Orientar tempos de sólidos e líquidos claros",
                "Impor jejum desde a meia-noite"
              ],
              [
                "Recuperação pós-operatória",
                "Colecistectomia curta, estável e sem náusea",
                "Liberar dieta após cirurgia não complicada",
                "Aguardar 6-24 h ou escalonar sem necessidade"
              ],
              [
                "Constipação por opioide · URGÊNCIA",
                "Internação, opioides, fezes endurecidas, dor e sangue vivo",
                "Reconhecer complicações associadas",
                "Confundir com obstrução grave ou intussuscepção em idoso"
              ],
              [
                "Anestesia local",
                "Laceração simples de antebraço sem lesão profunda",
                "Escolher técnica e anestésico",
                "Usar bloqueio de plexo ou anestésico de concentração inadequada"
              ],
              [
                "Complicação da gastrectomia vertical · URGÊNCIA · IMAGEM",
                "10º pós-operatório, taquicardia, febre e dor epigástrica",
                "Escolher imagem diagnóstica",
                "Fazer endoscopia inicial ou dar alta sem excluir vazamento"
              ],
              [
                "Terapia nutricional",
                "Enterectomia extensa, jejunostomia, vasoativos e ventilação mecânica",
                "Escolher via segura",
                "Usar trato GI em paciente instável ou acesso periférico insuficiente"
              ],
              [
                "Jejum pré-operatório",
                "Cirurgia eletiva ASA II às 16 h",
                "Aplicar ERAS/ACERTO",
                "Impor jejum desde a meia-noite ou permitir sólidos tarde demais"
              ],
              [
                "Febre pós-operatória",
                "Quinto dia após colectomia",
                "Diagnóstico diferencial",
                "Fixar causa apenas pelo dia; item com X preservado"
              ],
              [
                "Antibioticoprofilaxia cirúrgica",
                "Herniorrafia eletiva e função renal preservada",
                "Dose, momento e duração",
                "Prolongar antibiótico após fechamento sem indicação"
              ],
              [
                "Antibioticoprofilaxia em cirurgia limpa",
                "Hérnia umbilical pequena sem tela",
                "Decidir indicação",
                "Prescrever profilaxia para toda operação"
              ],
              [
                "Fístula enterocutânea pós-operatória",
                "Colectomia, radioterapia e fístula de baixo débito",
                "Tratamento e fatores de fechamento",
                "Aplicar regra única sem considerar sepse e radiação; X preservado"
              ],
              [
                "Febre pós-operatória precoce",
                "Cirurgia prolongada e ventilação mecânica",
                "Investigação inicial",
                "Usar dia pós-operatório como diagnóstico fechado"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "algoritmos-cirurgia",
      "tipo": "algoritmos",
      "titulo": "Algoritmos — Cirurgia",
      "resumo": "Fluxos para não confundir na hora da prova",
      "elementos": [
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Trauma de pelve",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "Cinta nos trocânteres + ressuscitação hemostática"
              },
              {
                "tipo": "avaliar",
                "texto": "Instável → FAST"
              },
              {
                "tipo": "decisao",
                "texto": "FAST?",
                "ramos": [
                  {
                    "rotulo": "FAST+ e abdome responsável",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Laparotomia"
                      }
                    ]
                  },
                  {
                    "rotulo": "FAST−",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Controle pélvico"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Sangue no meato → uretrografia antes da sonda"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Fratura exposta",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "Trauma: ATB + tétano + cobrir + neurovascular + alinhar + imobilizar"
              },
              {
                "tipo": "conduta",
                "texto": "Centro cirúrgico: irrigar e desbridar definitivamente"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Obstrução intestinal",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Sinais de gravidade?",
                "ramos": [
                  {
                    "rotulo": "Brida simples / sem alarme",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Conservador em cenário adequado"
                      }
                    ]
                  },
                  {
                    "rotulo": "Alça fechada/isquemia/perfuração/peritonite/instabilidade",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cirurgia"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Idoso + anemia + stop colônico → pensar câncer"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Acalásia",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "EDA exclui pseudoacalásia → manometria subtipa"
              },
              {
                "tipo": "decisao",
                "texto": "Subtipo / perfil?",
                "ramos": [
                  {
                    "rotulo": "I / II",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "PD, Heller ou POEM"
                      }
                    ]
                  },
                  {
                    "rotulo": "III",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Miotomia longa / POEM"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "End-stage: centro especializado"
                      }
                    ]
                  },
                  {
                    "rotulo": "Frágil",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Botox"
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
            "titulo": "Pancreatite com coleção",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Coleção?",
                "ramos": [
                  {
                    "rotulo": "Assintomática / estéril",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Observar"
                      }
                    ]
                  },
                  {
                    "rotulo": "Infectada / sintomática",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Antibiótico; se estável, esperar parede madura"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "conduta",
                "texto": "Step-up: drenagem → necrosectomia minimamente invasiva → aberta"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "numeros-que-derrubam-cirurgia",
      "tipo": "numeros",
      "titulo": "Números que derrubam — Cirurgia",
      "resumo": "Cutoffs, doses, janelas e prazos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números de Cirurgia",
            "colunas": [
              "Item",
              "Número/corte",
              "Observação"
            ],
            "linhas": [
              [
                "Hipertermia maligna",
                "Dantrolene 2,5 mg/kg IV inicial",
                ""
              ],
              [
                "⚠ Queimado — taxa calculada",
                "Adulto 2, criança 3, elétrica 4 mL/kg/%SCQ",
                "Taxa inicial = total/16"
              ],
              [
                "⚠ Queimado — provisório",
                "<5 a 125; 6–12 a 250; >12 a 500 mL/h",
                "Taxa inicial provisória"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "normativo-cirurgia",
      "tipo": "normativo",
      "titulo": "Normativo — Cirurgia",
      "resumo": "6 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Atualizações 2026 — Cirurgia",
            "colunas": [
              "Norma/tema",
              "O que mudou",
              "Status",
              "Fonte e data"
            ],
            "linhas": [
              [
                "⚠ ATLS 11 — xABCDE e choque",
                "xABCDE: hemorragia externa exsanguinante antes do A",
                "Confirmada",
                "ATLS 11ª edição"
              ],
              [
                "",
                "Choque: classificação simplificada em leve, moderado e grave",
                "",
                ""
              ],
              [
                "",
                "Queimados: 2 × SCQ × peso ÷ 16; reavaliação horária, principalmente pelo débito urinário",
                "",
                ""
              ],
              [
                "",
                "Trava: Exsanguinação externa pode vir antes da via aérea",
                "",
                ""
              ],
              [
                "⚠ TCE e ácido tranexâmico",
                "TXA no TCE moderado a grave com <3 h de evolução: 1 g em bolus + 1 g em 8 h",
                "Confirmada",
                "ATLS 11ª edição"
              ],
              [
                "",
                "Trava: TXA no TCE tem janela: menos de 3 horas",
                "",
                ""
              ],
              [
                "⚠ Trauma vascular de extremidade",
                "Isquemia franca sem revascularização definitiva imediata possível:",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "revascularização ou shunt temporário → fixação ortopédica → revascularização definitiva",
                "",
                ""
              ],
              [
                "",
                "Trava: Fluxo primeiro, osso depois, reconstrução por último",
                "",
                ""
              ],
              [
                "⚠ Trombose venosa profunda",
                "Alta suspeita clínica pode justificar anticoagular enquanto aguarda Doppler — não só após confirmação",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "Trava: Suspeita alta não espera exame para anticoagular",
                "",
                ""
              ],
              [
                "⚠ Hemorragia digestiva alta — ESGE 2026",
                "Endoscopia precoce em até 24 h; não fazer ≤6 h ou ≤12 h só por ser mais precoce, salvo instabilidade refratária",
                "Confirmada",
                "ESGE 2026"
              ],
              [
                "",
                "OTSC ganha espaço como terapia inicial ou de resgate",
                "",
                ""
              ],
              [
                "",
                "Coágulo aderente: remover e tratar se houver competência técnica",
                "",
                ""
              ],
              [
                "",
                "Ferro antes da alta se deficiência/anemia. Dieta oral precoce <24 h se hemostasia durável",
                "",
                ""
              ],
              [
                "",
                "Trava: Mais precoce que 24 h não é melhor — exceção: instabilidade refratária",
                "",
                ""
              ],
              [
                "⚠ IPMN — critérios de Kyoto",
                "Substitui Fukuoka",
                "Confirmada",
                "Critérios de Kyoto"
              ],
              [
                "",
                "Alto risco: icterícia obstrutiva, nódulo mural ≥5 mm, ducto principal ≥10 mm, citologia suspeita/positiva",
                "",
                ""
              ],
              [
                "",
                "Worrisome: pancreatite, CA 19-9 ↑, DM novo/piora, cisto ≥30 mm, nódulo <5 mm, parede espessada",
                "",
                ""
              ],
              [
                "",
                "Worrisome (cont.): ducto 5–9 mm, atrofia distal, linfonodo, crescimento ≥2,5 mm/ano",
                "",
                ""
              ],
              [
                "",
                "Cisto de 30 mm isolado não significa cirurgia automática",
                "",
                ""
              ],
              [
                "",
                "Trava: Cisto grande sozinho não opera",
                "",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-cirurgia",
      "tipo": "apostas",
      "titulo": "Apostas — Cirurgia",
      "resumo": "7 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de Cirurgia",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Quando operar o trauma abdominal contuso",
                "Instável → cirurgia imediata. Estável que responde ao tratamento inicial → tomografia"
              ],
              [
                "↳ cirurgia mesmo no estável",
                "Peritonite difusa/persistente, pneumoperitônio, hérnia diafragmática, líquido livre sem lesão parenquimatosa"
              ],
              [
                "",
                "…sangramento persistente, refratariedade ao tratamento. No estável, laparoscopia pode ser opção"
              ],
              [
                "TCE — imagem (multimídia)",
                "Prioridade XABCDE: ventilação, oxigenação, suporte p/ evitar lesão secundária. TC crânio ASAP no moderado/grave"
              ],
              [
                "↳ Epidural",
                "Biconvexo, não ultrapassa suturas, sangramento arterial, intervalo lúcido"
              ],
              [
                "↳ Subdural",
                "Foice, ultrapassa suturas, sangramento venoso, etilistas e quedas"
              ],
              [
                "↳ Intraparenquimatoso",
                "Alta energia, isquemia associada"
              ],
              [
                "Abdome agudo obstrutivo",
                "Causas: bridas, hérnia, neoplasia (sobretudo cólon), hérnia interna"
              ],
              [
                "↳ conduta",
                "Parada de flatos/fezes + distensão → RX e TC + laboratório. Alarme → cirurgia; sem alarme → conforme etiologia"
              ],
              [
                "↳ alarmes / brida",
                "Alarme: sepse, peritonite, alça fechada, obstrução total, instabilidade. Brida c/ cirurgia prévia: SNG+jejum 48–72 h"
              ],
              [
                "Colangite aguda",
                "Infecção aguda da via biliar. Causa principal: cálculo; segunda: tumor. Tratamento: antibiótico + CPRE"
              ],
              [
                "↳ Tokyo — diagnóstico",
                "A sistêmico (febre, calafrios, leucocitose); B colestase (BT >2; TGO, TGP, FA, GGT ↑); C imagem (dilatação, etiologia)"
              ],
              [
                "↳ Tokyo — gravidade",
                "I: sem critério. II: leuco >12.000 ou <4.000, febre >39 °C, idade >75, BT >5, hipoalbuminemia. III: disfunção orgânica"
              ],
              [
                "Adenocarcinoma de pâncreas",
                "Tumor periampular mais comum; <20% operáveis ao diagnóstico"
              ],
              [
                "↳ risco / quadro",
                "Tabagismo, obesidade, etilismo, DM, idade, antecedentes, pancreatite crônica. Icterícia obstrutiva, consumptivos, dor"
              ],
              [
                "↳ Courvoisier-Terrier",
                "Vesícula palpável e indolor. Estadiamento: TC + CA 19-9"
              ],
              [
                "↳ ressecabilidade",
                "Ressecável: sem ramos art./venosos. Borderline: venoso >180° c/ reconstrução, venoso <180° irregular, arterial <180°"
              ],
              [
                "↳ irressecável",
                "Impossibilidade de reconstrução venosa ou arterial >180°"
              ],
              [
                "Escroto agudo",
                "Buscar palavras que direcionam: torção (urgência cirúrgica) × orquiepididimite (clínico)"
              ],
              [
                "↳ Torção",
                "Infância e 12–15 a, dor aguda intensa, Prehn neg., cremastérico neg., sem fluxo ao Doppler → cirurgia de urgência"
              ],
              [
                "↳ Orquiepididimite",
                "Todas as idades (viral criança, DST adulto, ITU idoso), subagudo, Prehn+, cremastérico+, ↑fluxo → ATB + sintomáticos"
              ],
              [
                "↳ sem US",
                "Sem ultrassom e sem outra opção → exploração testicular"
              ],
              [
                "Hérnia inguinal",
                "4× mais em homens; 96% das hérnias da região são inguinais; indireta a mais comum. Dx clínico + Valsalva"
              ],
              [
                "↳ tratamento",
                "Hernioplastia. Laparoscopia: menos dor, melhor recuperação; Lichtenstein segue excelente. Encarcerada = urgência"
              ],
              [
                "↳ anatomia",
                "Indireta: lateral aos vasos epigástricos. Direta: medial"
              ],
              [
                "↳ Hesselbach",
                "Medial: reto abdominal; lateral: vasos epigástricos inferiores; inferior: ligamento inguinal"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Trauma abdominal contuso — quando operar",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Trauma abdominal contuso"
              },
              {
                "tipo": "decisao",
                "texto": "Hemodinamicamente instável?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cirurgia imediata"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (responde ao tratamento inicial)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Tomografia; laparoscopia pode ser opção"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Opera mesmo estável: peritonite, pneumoperitônio, hérnia diafragmática, líquido livre s/ lesão parenquimatosa"
              },
              {
                "tipo": "atencao",
                "texto": "…e sangramento persistente ou refratariedade ao tratamento"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Escroto agudo — torção × orquiepididimite",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Dor escrotal aguda"
              },
              {
                "tipo": "decisao",
                "texto": "Prehn negativo, cremastérico negativo, sem fluxo ao Doppler?",
                "ramos": [
                  {
                    "rotulo": "Sim — torção",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cirurgia de urgência"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não — Prehn+, cremastérico+, ↑fluxo",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Orquiepididimite: antibiótico e sintomáticos"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "Sem ultrassom e sem outra opção → exploração testicular"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "pontos-cegos-cirurgia",
      "tipo": "pontos-cegos",
      "titulo": "Pontos cegos — Cirurgia",
      "resumo": "4 temas que costumam passar despercebidos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Cirurgia",
            "colunas": [
              "Tema",
              "Pista",
              "Regra/conduta"
            ],
            "linhas": [
              [
                "Fimose",
                "Anel fibrótico e balanopostites recorrentes aos 6 anos",
                "Indicação cirúrgica (balanopostites + fibrose). Evitar: chamar fisiológica ou postergar"
              ],
              [
                "Osteomielite",
                "Dor, febre e antecedente de fratura exposta",
                "RM de pelve e membro inferior; osteomielite. Evitar: tratar como dor mecânica tardia"
              ],
              [
                "Osteossarcoma",
                "Massa óssea dolorosa e sintomas sistêmicos",
                "RM + biópsia; quimioterapia. Evitar: atribuir dor persistente ao esporte"
              ],
              [
                "Lesão tendínea da mão",
                "Corte volar c/ perda de flexão",
                "Curativo simples + transferir p/ ortopedia. Evitar: suturar pele ignorando lesão profunda"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "travas-cirurgia",
      "tipo": "travas",
      "titulo": "Travas — Cirurgia",
      "resumo": "42 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Cirurgia",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "Obstrução por brida",
                "Cirurgia antiga não vence o padrão atual. Brida simples = clínico; alça fechada/hipoperfusão = cirurgia"
              ],
              [
                "Reimplante dentário",
                "Viveu: fixa. Morreu: tira. O outro lado fixa"
              ],
              [
                "Trauma pélvico",
                "Cinta pélvica é baixa: trocânteres. Abdome e pelve sangrando: cada um ganha sua porta"
              ],
              [
                "Apendicite especial",
                "Gestante: US → RM. Abscesso organizado: controla coleção antes de correr para o apêndice"
              ],
              [
                "Coledocolitíase x colangite",
                "Colédoco entupido = amarelo; entupido + infectado = amarelo + febre"
              ],
              [
                "Fratura exposta",
                "Antibiótico, tétano, cobre, alinha, imobiliza. Irriga/desbrida de verdade no CC"
              ],
              [
                "Hemotórax maciço",
                "Drenar já é ressuscitar"
              ],
              [
                "Pancreatite biliar",
                "Não chama ERCP sozinha; obstrução persistente/colangite chama"
              ],
              [
                "Queimado — volume",
                "125/250/500 é provisório; 2/3/4 ÷16 calcula; depois a urina manda"
              ],
              [
                "Transição toracoabdominal",
                "Facada esquerda na transição + estável: não deixe um furinho no diafragma passar"
              ],
              [
                "Síndrome compartimental",
                "Começa com dor ao estirar; pulso some tarde"
              ],
              [
                "FAF",
                "No tiro, não opero a bala; opero a lesão"
              ],
              [
                "Hemotórax — conduta",
                "Macicez + MV↓ = sangue → dreno primeiro; débito/fisiologia decidem toracotomia"
              ],
              [
                "Toracotomia — cortes",
                "Hemotórax: 1500 de uma vez OU ~200 por hora persistente"
              ],
              [
                "Sequência rápida",
                "Indutor faz dormir; bloqueador paralisa. Paralisar não seda. Hipoxemia pode indicar IOT antes de Glasgow 8"
              ],
              [
                "Tamponamento / pleura",
                "Tamponamento descomprime; pleura complicada drena; infecção recebe ATB. IOT pode derrubar retorno venoso"
              ],
              [
                "Disfagia",
                "Sólido primeiro = bloqueio; sólido + líquido juntos = motilidade"
              ],
              [
                "Disfagia + emagrecimento",
                "Disfagia rápida + emagrecimento = câncer até provar o contrário"
              ],
              [
                "EoE",
                "Jovem + impactação alimentar → EoE. ≥6 biópsias, de ≥2 níveis, mesmo com mucosa normal"
              ],
              [
                "Neoadjuvância",
                "Neoadjuvante melhora a operação; não apaga automaticamente a operação"
              ],
              [
                "Esofagectomia oncológica",
                "Pensar em profilaxia combinada e anticoagulante por 28-35 dias"
              ],
              [
                "Cisto mucinoso",
                "MUCINOSA = MULHER + MUCO + CAUDA"
              ],
              [
                "IPMN x MCN",
                "IPMN = INTRAductal: mora no ducto; MCN fica fora dele"
              ],
              [
                "Fístula do cístico",
                "Vazou pelo cístico? Não corro para religar: descomprimo a via biliar com CPRE"
              ],
              [
                "Falha da CPRE",
                "Não esgota a endoscopia: visão direta pode permitir resgate; via depende da anatomia e equipe"
              ],
              [
                "Bethesda IV",
                "Agulha vê célula; só a peça vê invasão"
              ],
              [
                "Nódulo pequeno unilateral",
                "Suspeita em nódulo pequeno unilateral ≠ tireoide inteira: lobectomia primeiro"
              ],
              [
                "Lynch",
                "Conserta DNA: MLH1, MSH2, MSH6, PMS2. Genética confirma; colonoscopia vigia"
              ],
              [
                "Angina estável",
                "FC/PA sem controle: otimizar tratamento. Enxerto ocluído, sozinho, não obriga revascularização"
              ],
              [
                "Forame jugular",
                "Jugular leva IX-X-XI; o XII mora sozinho no hipoglosso"
              ],
              [
                "Wilkie",
                "Emagrece e fecha o ângulo: AMS esmaga o duodeno contra a aorta"
              ],
              [
                "Ca gástrico precoce",
                "Indiferenciado intramucoso, sem úlcera, até 2 cm pode entrar. SM1 no estômago: <500 μm, não 1.000"
              ],
              [
                "Evisceração",
                "Prova penetração; não necessariamente laparotomia — omento estável é a exceção controversa"
              ],
              [
                "Cefaleia pós-punção",
                "Decúbito melhora o sintoma; blood patch é o escalonamento quando importa ou persiste"
              ],
              [
                "Isquemia mesentérica",
                "+ peritonite/choque = centro cirúrgico, não exame demorado"
              ],
              [
                "Estadiamento",
                "Biopsie primeiro o sítio que, se positivo, muda mais o estágio"
              ],
              [
                "⚠ BI-RADS 5",
                "Ainda precisa core: imagem muito suspeita não substitui tecido"
              ],
              [
                "Diverticulite — Hinchey",
                "Abscesso localizado drena; peritonite generalizada opera. III purulenta, IV fecal"
              ],
              [
                "Fibroadenoma x filoide",
                "FIBRO fica; FILOIDE cresce"
              ],
              [
                "HNF x adenoma",
                "HNF segura contraste; adenoma deixa escapar"
              ],
              [
                "Vesícula — T1a x T2",
                "T1a costuma parar; T2 costuma pedir ampliar — sem inventar classificação pessoal"
              ],
              [
                "⚠ Trauma grave",
                "Exsanguinação externa pode vir antes da via aérea"
              ]
            ]
          }
        }
      ]
    }
  ]
};
