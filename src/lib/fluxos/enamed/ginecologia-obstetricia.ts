/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const GINECOLOGIA_OBSTETRICIA: AreaDossie = {
  "id": "ginecologia-obstetricia",
  "nome": "Ginecologia e Obstetrícia",
  "blocos": [
    {
      "id": "ginecologia-geral-sop-endometriose-dip-e-corrimentos",
      "tipo": "tema",
      "titulo": "Ginecologia geral — SOP, endometriose, DIP e corrimentos",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Ciclo menstrual — curva e função hormonal",
              "texto": "Estradiol prolifera endométrio. Progesterona freia a proliferação estrogênica e o transforma em secretor. Regressão do corpo lúteo reduz E2/P/inibina A e permite subida do FSH.",
              "trava": "Estradiol constrói; progesterona freia e transforma. LH é agulha; estradiol é montanha."
            },
            {
              "titulo": "Infertilidade — exame certo na etapa errada",
              "texto": "<35 anos: em geral 12 meses; ≥35: 6 meses (antes, se idade avançada/fator conhecido). Investigar casal em paralelo: ovulação, espermograma, tubas (HSG se indicada), US; histeroscopia p/ lesão intracavitária. AMH não diagnostica sozinho.",
              "trava": "Antes de pedir exame de infertilidade, confirme que já é hora de investigar."
            },
            {
              "titulo": "⚠ Amenorreia primária — MRKH x AIS completa x hímen imperfurado",
              "texto": "Fundo cego + ausência de colo + sem dor cíclica/abaulamento = não é hímen. MRKH: 46,XX, ovários/pelos normais. AIS completa: 46,XY, testosterona masculina, pouco/nenhum pelo. Hímen imperfurado: dor cíclica + hematocolpo + abaulamento.",
              "trava": "⚠ Fundo cego + sem dor cíclica = Müller/AIS, não hímen."
            },
            {
              "titulo": "⚠ Úlceras genitais em neovagina — não aceitar alternativa pela metade",
              "texto": "Descrever lesões, colher material p/ HSV quando disponível, testar sífilis e HIV e ampliar conforme exposição/protocolo. Anatomia construída não elimina agentes clássicos; adaptar exame/coleta ao tecido.",
              "trava": "⚠ Uma úlcera pode ter mais de uma IST; herpes provável não cancela sífilis/HIV."
            },
            {
              "titulo": "SPM x TDPM — prejuízo afetivo e funcional separa",
              "texto": "TDPM exige conjunto sintomático com predominância afetiva e impacto funcional clinicamente significativo, idealmente confirmado prospectivamente em ciclos; SPM pode incomodar sem atingir esse limiar.",
              "trava": "SPM incomoda; TDPM derruba humor e função."
            },
            {
              "titulo": "⚠ Mioma FIGO 2: quanto entrou no miométrio",
              "texto": "Classificação FIGO pela proporção que entrou no miométrio: FIGO 1 entrou pouco; FIGO 2 entrou muito.",
              "trava": "⚠ FIGO 1 entrou pouco; FIGO 2 entrou muito."
            },
            {
              "titulo": "Perfuração histeroscópica: mecanismo antes do reflexo cirúrgico",
              "texto": "Decidir pelo mecanismo: perfuração mecânica e limpa → observar; térmica, com lesão visceral ou sangrando → explorar.",
              "trava": "Mecânica e limpa observa; térmica, visceral ou sangrando explora."
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
                "Ciclo menstrual",
                "Hesita quando a banca chama a progesterona de antiproliferativa",
                "LH pico alto/estreito; E2 pico largo pré-ovulatório + 2º menor lúteo; P sobe após ovulação; inibina B folicular, A lútea",
                "—"
              ],
              [
                "Infertilidade",
                "Pediu HSG cedo demais: o exame existia, mas não era a etapa",
                "<35 a: 12 meses; ≥35: 6 meses; idade mais avançada ou fator conhecido → investigar mais cedo",
                "História de DIP/cirurgia tubária pode antecipar avaliação"
              ],
              [
                "Amenorreia primária",
                "'Fundo cego' puxou para hímen imperfurado sem buscar fenótipo obstrutivo",
                "Fundo cego + ausência de colo + sem dor pélvica cíclica/abaulamento himenal",
                "Testosterona e cariótipo separam Müller de AIS"
              ],
              [
                "Úlcera em neovagina",
                "1ª metade correta ('herpes') salvou a metade final falsa da alternativa",
                "Morfologia herpética + exposição sexual; alternativa dizia sorologia treponêmica desnecessária",
                "Diagnóstico provável não exclui coinfecção nem encerra rastreio associado"
              ],
              [
                "SPM x TDPM",
                "Toda irritabilidade pré-menstrual virou TDPM",
                "Irritabilidade e sintomas físicos cíclicos, sem incapacidade, depressão marcada ou prejuízo grave",
                "Periodicidade é comum aos dois; discriminador = intensidade afetiva + função"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Ciclo menstrual — hormônios",
            "colunas": [
              "Hormônio",
              "Curva",
              "Função"
            ],
            "linhas": [
              [
                "LH",
                "Pico alto/estreito na ovulação (agulha)",
                "—"
              ],
              [
                "Estradiol",
                "Pico largo pré-ovulatório + segundo pico menor lúteo (montanha)",
                "Prolifera endométrio"
              ],
              [
                "Progesterona",
                "Sobe após ovulação",
                "Freia a proliferação estrogênica (antiproliferativa) e torna endométrio secretor"
              ],
              [
                "Inibina",
                "B mais folicular; A mais lútea",
                "—"
              ],
              [
                "Regressão do corpo lúteo",
                "Cai E2/P/inibina A",
                "Permite subida do FSH"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Infertilidade — quando e como investigar",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Casal sem gestação"
              },
              {
                "tipo": "decisao",
                "texto": "Idade da mulher?",
                "ramos": [
                  {
                    "rotulo": "<35 anos",
                    "passos": [
                      {
                        "tipo": "avaliar",
                        "texto": "Em geral após 12 meses"
                      }
                    ]
                  },
                  {
                    "rotulo": "≥35 anos",
                    "passos": [
                      {
                        "tipo": "avaliar",
                        "texto": "Após 6 meses"
                      }
                    ]
                  },
                  {
                    "rotulo": "Idade avançada/fator conhecido",
                    "passos": [
                      {
                        "tipo": "avaliar",
                        "texto": "Investigar mais cedo (ex.: DIP/cirurgia tubária prévia)"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "conduta",
                "texto": "Investigar o casal em paralelo: ovulação, espermograma, tubas (HSG quando indicada), útero/ovários por US"
              },
              {
                "tipo": "conduta",
                "texto": "Histeroscopia para lesão intracavitária"
              },
              {
                "tipo": "atencao",
                "texto": "AMH estima reserva/resposta; não diagnostica infertilidade sozinho"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "⚠ Amenorreia primária com fundo cego",
            "colunas": [
              "Entidade",
              "Cariótipo",
              "Achados",
              "Discriminador"
            ],
            "linhas": [
              [
                "MRKH",
                "46,XX",
                "Ovários/pelos normais; útero e vagina superior ausentes",
                "Fundo cego, sem colo, sem dor cíclica"
              ],
              [
                "AIS completa",
                "46,XY",
                "Testosterona em faixa masculina; pouco/nenhum pelo pubiano/axilar",
                "Testosterona e cariótipo separam de Müller"
              ],
              [
                "Hímen imperfurado",
                "—",
                "Dor cíclica + hematocolpo + abaulamento",
                "Fenótipo de obstrução menstrual"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "⚠ Úlcera genital (inclusive neovagina)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Úlcera genital com morfologia herpética + exposição sexual"
              },
              {
                "tipo": "conduta",
                "texto": "Descrever lesões; colher material para HSV quando disponível"
              },
              {
                "tipo": "conduta",
                "texto": "Testar sífilis e HIV; ampliar conforme exposição/protocolo"
              },
              {
                "tipo": "atencao",
                "texto": "Anatomia construída não elimina agentes clássicos; adaptar exame e coleta ao tecido presente"
              },
              {
                "tipo": "atencao",
                "texto": "Herpes provável não exclui coinfecção nem dispensa sorologia treponêmica"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Perfuração histeroscópica",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Perfuração uterina na histeroscopia"
              },
              {
                "tipo": "decisao",
                "texto": "Mecanismo?",
                "ramos": [
                  {
                    "rotulo": "Mecânica e limpa",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Observar"
                      }
                    ]
                  },
                  {
                    "rotulo": "Térmica, visceral ou sangrando",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Explorar"
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
            "titulo": "O que caiu nas provas",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "⚠ Candidíase vulvovaginal",
                "Prurido, fissuras, corrimento branco e aminas negativo",
                "Identificar etiologia e escolher antifúngico",
                "Tratar como vaginose ou IST bacteriana"
              ],
              [
                "Úlcera genital · IMAGEM",
                "Úlcera dolorosa de base mole e bubão inflamatório",
                "Identificar agente, exame e tratamento",
                "Confundir com sífilis primária ou LGV"
              ],
              [
                "Terapia hormonal no climatério",
                "Histerectomia com focos prévios de endometriose",
                "Escolher regime hormonal",
                "Prescrever estrogênio isolado apesar de doença residual"
              ],
              [
                "Amenorreia primária · URGÊNCIA",
                "14 anos com caracteres sexuais secundários",
                "Definir quando investigar",
                "Aplicar ponto de corte incorreto ou duplicidade de opções equivalentes"
              ],
              [
                "Vaginose bacteriana",
                "Corrimento homogêneo, pH >5, aminas e clue cells",
                "Diagnosticar e tratar",
                "Confundir com candidíase ou tricomoníase"
              ],
              [
                "Cisto ovariano simples",
                "Cisto anecoico de 6 cm, paredes finas e assintomático",
                "Definir seguimento de imagem",
                "Dosar CA-125 ou pedir RM em lesão simples"
              ],
              [
                "⚠ Tamoxifeno e endométrio",
                "Sangramento frequente e endométrio heterogêneo de 15 mm",
                "Indicar avaliação histológica",
                "Suspender tamoxifeno ou tratar empiricamente sem amostra"
              ],
              [
                "Puberdade normal · URGÊNCIA",
                "13 anos, telarca aos 10, Tanner M3P3 e secreção clara",
                "Tranquilizar sem investigação excessiva",
                "Diagnosticar amenorreia primária precocemente"
              ],
              [
                "Irregularidade menstrual da adolescência · URGÊNCIA",
                "18 meses da menarca, ciclos irregulares sem repercussão",
                "Evitar exames desnecessários",
                "Investigar como SUA estrutural/endócrino em fase de maturação"
              ],
              [
                "Cisto de Bartholin",
                "Massa cística no vestíbulo antes das carúnculas, sem inflamação",
                "Reconhecer topografia e indicar cirurgia se incômodo",
                "Confundir com Skene/uretra ou tratar assintomática obrigatoriamente"
              ],
              [
                "⚠ Endometriose",
                "Dismenorreia progressiva, dispareunia profunda e útero retrovertido",
                "Reconhecer quadro típico",
                "Confundir dor à mobilização com DIP isolada"
              ],
              [
                "Amenorreia primária · URGÊNCIA",
                "Ausência de útero, testosterona masculina e poucos pelos",
                "Reconhecer etiologia 46,XY",
                "Confundir com agenesia mülleriana ou disgenesia gonadal"
              ],
              [
                "Tricomoníase",
                "Corrimento amarelo-esverdeado, pH 5,5 e colo em framboesa",
                "Reconhecer vaginite e escolher nitroimidazólico",
                "Tratar como candidíase ou vaginose; inconsistência de esquema"
              ],
              [
                "DIP · URGÊNCIA",
                "Toxemia, falha oral e massa anexial complexa",
                "Internar e usar antibiótico IV",
                "Manter tratamento ambulatorial ou adicionar antifúngico"
              ],
              [
                "Linfogranuloma venéreo",
                "Pápula/úlcera transitória seguida de bubão fistulizado em múltiplos orifícios",
                "Reconhecer síndrome inguinal",
                "Confundir com cancroide, donovanose ou sífilis"
              ],
              [
                "DIP",
                "Febre e dor à mobilização cervical e anexial",
                "Reconhecimento diagnóstico",
                "Atribuir dor pélvica a causa não infecciosa"
              ],
              [
                "⚠ SOP",
                "Anovulação e hiperandrogenismo com exclusões iniciais",
                "Investigação de amenorreia",
                "Atribuir amenorreia apenas ao anticoncepcional prévio"
              ],
              [
                "Lesão vulvar suspeita",
                "Lesão persistente em idosa apesar de tratamentos",
                "Indicação de biópsia",
                "Excluir neoplasia por HPV negativo"
              ],
              [
                "Sangramento uterino anormal",
                "Perimenopausa sem instabilidade",
                "Avaliação inicial",
                "Atribuir todo sangramento ao climatério sem excluir gestação e lesão"
              ],
              [
                "Massa anexial suspeita",
                "Projeção papilar em cisto ovariano",
                "Critério de investigação cirúrgica",
                "Valorizar tamanho isolado acima da morfologia"
              ],
              [
                "⚠ Endometriose profunda",
                "Dismenorreia e hematoquezia cíclica com nódulos posteriores",
                "Investigação e mapeamento",
                "Tratar como doença intestinal isolada"
              ],
              [
                "SUA na adolescente",
                "Oligomenorreia e atividade sexual sem proteção regular",
                "Investigação inicial",
                "Rotular SOP sem excluir gestação"
              ],
              [
                "Amenorreia primária",
                "Caracteres sexuais presentes e genitália externa normal",
                "Investigação anatômica",
                "Excluir anomalia mülleriana pelo exame externo"
              ],
              [
                "Cervicite gonocócica",
                "Secreção cervical mucopurulenta e pH vaginal normal",
                "Diagnóstico etiológico",
                "Confundir cervicite com vaginose"
              ],
              [
                "Cisto mamário simples",
                "Lesão anecoica circunscrita sem fluxo",
                "Interpretar BI-RADS e orientar",
                "Indicar biópsia do cisto benigno por história familiar isolada"
              ],
              [
                "⚠ Sífilis após lesão genital sugestiva",
                "Teste rápido positivo após úlcera indolor",
                "Interpretação sorológica e próxima etapa",
                "Confundir teste não treponêmico de avaliação com barreira universal ao tratamento"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "pre-natal-e-infeccoes-na-gestacao",
      "tipo": "tema",
      "titulo": "Pré-natal e infecções na gestação",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "⚠ HTLV na gestação — regra atual 2026",
              "texto": "HTLV-1/2 confirmado: NT Conjunta MS nº 6/2025 → cesariana como via preferencial + não amamentar; inibir lactação e fórmula conforme fluxo. Atualização, não recorrência. Questão histórica pode usar regra anterior: data/fonte manda.",
              "trava": "⚠ HTLV confirmado em 2026: cesárea preferencial + não amamenta."
            },
            {
              "titulo": "⚠ Pré-natal — cutoff antes do relógio",
              "texto": "HAS na gestação: PAS ≥140 OU PAD ≥90; severa ≥160 e/ou ≥110. >20 sem + HAS + proteinúria/disfunção de órgão-alvo → PE. Morfológica 2º tri: 18–24 sem. Rede Alyne: captação até 12 sem, mínimo 7 consultas.",
              "trava": "Primeiro cutoff; depois relógio. Morfológica = 18–24."
            }
          ]
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "PA na gestação: cutoff antes do relógio",
            "passos": [
              {
                "tipo": "avaliar",
                "texto": "Cutoff: PAS ≥140 OU PAD ≥90; crise/severa ≥160 e/ou ≥110"
              },
              {
                "tipo": "decisao",
                "texto": "Atinge o cutoff?",
                "ramos": [
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Não é HAS (ex.: 135/83 antes de 20 sem ≠ HAS crônica)"
                      }
                    ]
                  },
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "decisao",
                        "texto": "Após 20 semanas + proteinúria ou disfunção de órgão-alvo?",
                        "ramos": [
                          {
                            "rotulo": "Sim",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Pré-eclâmpsia"
                              }
                            ]
                          },
                          {
                            "rotulo": "Não",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "PA alterada sozinha não fecha PE"
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
                "texto": "PA alterada não sequestra a pergunta: morfológica 2º tri = 18–24 semanas"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números e normas do pré-natal",
            "colunas": [
              "Item",
              "Regra",
              "Status"
            ],
            "linhas": [
              [
                "HTLV-1/2 confirmado",
                "Cesariana preferencial; não amamentar; inibir lactação + fórmula (NT Conjunta MS nº 6/2025)",
                "⚠ Regra atual 2026; questão histórica pode usar regra anterior"
              ],
              [
                "HAS na gestação",
                "PAS ≥140 OU PAD ≥90; severa ≥160 e/ou ≥110",
                "—"
              ],
              [
                "Morfológica 2º trimestre",
                "18–24 semanas",
                "—"
              ],
              [
                "Rede Alyne",
                "Captação até 12 semanas; mínimo de 7 consultas",
                "Recorte normativo atual"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Pré-natal e infecções na gestação",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "⚠ Estratificação de risco pré-natal",
                "Comparação entre malária, anemia, gemelaridade e DMG dietética",
                "Selecionar condição de referência compartilhada",
                "Aplicar critério sem diferenciar gravidade/tipo"
              ],
              [
                "Dengue na gestação · URGÊNCIA · IMAGEM",
                "Gestante febril com exantema e alterações laboratoriais fornecidas",
                "Integrar clínica e hemograma",
                "Confundir arboviroses ou subestimar risco gestacional"
              ],
              [
                "Aloimunização Rh",
                "Gestante Rh negativo com sangramento e Coombs positivo",
                "Diferenciar sensibilização de profilaxia",
                "Aplicar imunoglobulina anti-D após sensibilização"
              ],
              [
                "Nódulo mamário na gestação",
                "Nódulo novo e história familiar de câncer precoce",
                "Não adiar avaliação",
                "Esperar o parto ou biopsiar sem imagem inicial"
              ],
              [
                "Isoimunização Rh · URGÊNCIA",
                "Gestante Rh negativo, Coombs negativo e hematoma subcoriônico",
                "Indicar imunoglobulina",
                "Aguardar ou usar progesterona como única medida"
              ],
              [
                "Infecção congênita por Zika",
                "Malformações fetais por Zika confirmadas",
                "Aplicar hipóteses legais",
                "Equiparar microcefalia por Zika à anencefalia ou criar limite de 20 semanas"
              ],
              [
                "Toxoplasmose na gestação",
                "Possível infecção aguda sem IgG para teste de avidez",
                "Tratar provisoriamente e repetir sorologia",
                "Pedir avidez sem IgG ou iniciar tríplice sem confirmação fetal"
              ],
              [
                "⚠ Sífilis na gestação",
                "Gestante sem tratamento prévio e VDRL seriado",
                "Interpretar resposta do VDRL",
                "Confundir teste treponêmico com atividade ou queda de títulos"
              ],
              [
                "Diabetes gestacional",
                "DMG tratada com insulina e parto concluído",
                "Ajustar tratamento após parto",
                "Manter fração da insulina sem reavaliar fisiologia pós-placenta"
              ],
              [
                "HIV na gestação",
                "Carga viral indetectável no terceiro trimestre",
                "Orientar TARV, via de parto e amamentação",
                "Indicar cesárea fixa ou autorizar amamentação"
              ],
              [
                "⚠ Sífilis na gestação · URGÊNCIA",
                "Teste rápido reagente em gestante com múltiplas parcerias",
                "Não esperar confirmação",
                "Aguardar VDRL/FTA-ABS para tratar"
              ],
              [
                "Bacteriúria na gestação · URGÊNCIA · IMAGEM",
                "Gestante assintomática com resultado laboratorial apresentado",
                "Distinguir bacteriúria significativa de contaminação/baixo crescimento",
                "Rotular qualquer crescimento como cistite ou tratar sem critério"
              ],
              [
                "⚠ Qualidade do pré-natal",
                "Morfológico solicitado tardiamente",
                "Interpretar cronologia da carteira",
                "Julgar toda a assistência por um único dado"
              ],
              [
                "⚠ Hipotireoidismo na gestação",
                "TSH elevado e perdas gestacionais prévias",
                "Risco obstétrico e interpretação",
                "Desconsiderar risco na ausência de bócio"
              ],
              [
                "Toxoplasmose na gestação",
                "IgM positiva e IgG negativa no primeiro trimestre",
                "Interpretação e conduta inicial",
                "Confirmar infecção apenas por IgM isolada"
              ],
              [
                "⚠ Pré-natal integrado: sífilis, anemia e Rh",
                "VDRL 1:32, Hb baixa e Rh negativo",
                "Combinar condutas e seguimento",
                "Acertar uma intervenção e aceitar omissões nas demais"
              ],
              [
                "Estreptococo do grupo B",
                "Bacteriúria por EGB na gestação",
                "Profilaxia intraparto",
                "Dispensar profilaxia por baixa contagem ou bolsa íntegra"
              ],
              [
                "⚠ Hipotireoidismo na gestação",
                "TSH elevado e T4 livre reduzido",
                "Monitorização terapêutica",
                "Acompanhar apenas sintomas ou esquecer risco obstétrico"
              ],
              [
                "Diabetes gestacional",
                "Glicemia de jejum de 110 mg/dL",
                "Diagnóstico e tratamento inicial",
                "Usar apenas critérios de diabetes fora da gestação"
              ],
              [
                "Zika na gestação",
                "Exantema pruriginoso em gestante e circulação viral",
                "Prioridade diagnóstica e registro",
                "Tratar todas as arboviroses com investigação idêntica"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "climaterio-th-sangramento-pos-menopausa-e-endometrio",
      "tipo": "tema",
      "titulo": "Climatério, TH, sangramento pós-menopausa e endométrio",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "⚠ SUA / SIU-LNG — 8 anos x 5 anos e mecanismo",
              "texto": "LNG-IUS: contracepção até 8 anos; proteção endometrial na TH estrogênica: 5 anos. Atrofia/supressão endometrial, não 'derrete' mioma. Progestagênio cíclico: sangramento de privação. AINE ↓ prostaglandinas → ↓ dor e fluxo.",
              "trava": "⚠ OITO evita gravidez; CINCO protege endométrio. LNG-IUS trata o ENDOMÉTRIO, não derrete o mioma."
            },
            {
              "titulo": "Climatério/TH — sintoma indica, janela permite",
              "texto": "VMS relevante → TH sistêmica se elegível; SGU isolada → local. Útero → proteção endometrial; histerectomia → estrogênio isolado, exceto endometriose residual. IOP <40: repor até idade média da menopausa. TEV prévio: evitar oral.",
              "trava": "Sintoma indica; janela permite; útero escolhe esquema; risco escolhe via."
            },
            {
              "titulo": "⚠ Sangramento pós-menopausa — regra brasileira x ACOG 2026",
              "texto": "Brasil/FEBRASGO/ENAMED: estável → USTV inicial; ≤4 mm bem visualizado em 1º episódio = baixo risco; >4 mm, focal/heterogêneo/não visualizado ou persistente/recorrente → amostragem. ACOG 2026: USTV + amostragem já inicial.",
              "trava": "⚠ Pós-menopausa sangrou = investiga. 4 mm tranquiliza um episódio; recorrência quebra a tranquilidade."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "SIU-LNG e mecanismos no SUA",
            "colunas": [
              "Item",
              "Regra",
              "Armadilha"
            ],
            "linhas": [
              [
                "SIU-LNG — contracepção",
                "Até 8 anos",
                "Transportar prazo contraceptivo para TH"
              ],
              [
                "SIU-LNG — proteção endometrial na TH estrogênica",
                "5 anos",
                "—"
              ],
              [
                "Mecanismo do LNG-IUS",
                "Atrofia/supressão endometrial",
                "Atribuir melhora à redução do mioma"
              ],
              [
                "Progestagênio cíclico",
                "Organiza sangramento por oposição endometrial/privação, sem necessariamente restaurar ovulação",
                "—"
              ],
              [
                "AINE",
                "Reduz prostaglandinas → reduz dor e fluxo",
                "—"
              ],
              [
                "Princípio",
                "Melhora do sintoma não prova redução da lesão estrutural",
                "—"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Climatério: decidir TH",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Qual sintoma?",
                "ramos": [
                  {
                    "rotulo": "VMS relevante",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Terapia sistêmica se elegível"
                      }
                    ]
                  },
                  {
                    "rotulo": "SGU isolada",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Abordagem local"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "decisao",
                "texto": "Tem útero?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Precisa proteção endometrial (progestagênio)"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (histerectomia)",
                    "passos": [
                      {
                        "tipo": "decisao",
                        "texto": "Endometriose residual?",
                        "ramos": [
                          {
                            "rotulo": "Sim",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Exceção: não usar estrogênio isolado"
                              }
                            ]
                          },
                          {
                            "rotulo": "Não",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Estrogênio isolado geralmente permitido"
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
                "tipo": "avaliar",
                "texto": "IOP <40: reposição geralmente até idade média da menopausa, se sem contraindicação"
              },
              {
                "tipo": "atencao",
                "texto": "TEV prévio: oral problemático; transdérmico = individualização, não passe livre"
              },
              {
                "tipo": "atencao",
                "texto": "Câncer de mama prévio receptor negativo não vira indicação segura de TH sistêmica"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Sangramento pós-menopausa (regra brasileira)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Sangramento pós-menopausa, paciente estável"
              },
              {
                "tipo": "conduta",
                "texto": "USTV inicial: espessura e morfologia"
              },
              {
                "tipo": "decisao",
                "texto": "Endométrio ≤4 mm bem visualizado, 1º episódio?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Baixo risco"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "Persistência/recorrência → histologia"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": ">4 mm, focal/heterogêneo ou não visualizado → amostragem endometrial"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "atencao",
                "texto": "⚠ ACOG 2026: maioria → USTV + amostragem já na avaliação inicial. Não misturar sem fonte explícita."
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "O que caiu nas provas — Climatério, TH, SPM e endométrio",
            "colunas": [
              "Tema",
              "Pista",
              "Cobrança",
              "Armadilha"
            ],
            "linhas": [
              [
                "⚠ Sangramento pós-menopausa · URGÊNCIA",
                "Endométrio 8 mm, obesidade e nuliparidade",
                "Priorizar hipótese endometrial",
                "Atribuir sangramento ao pólipo cervical ou mioma isoladamente"
              ],
              [
                "Terapia hormonal no climatério",
                "Histerectomia com focos prévios de endometriose",
                "Escolher regime hormonal",
                "Prescrever estrogênio isolado apesar de doença residual"
              ],
              [
                "⚠ Osteoporose pós-menopausa",
                "T-score -2,5 e uso crônico de corticoide",
                "Escolher terapia anti-reabsortiva",
                "Usar vitamina D ou calcitonina isoladas"
              ],
              [
                "⚠ Sangramento pós-menopausa · URGÊNCIA · IMAGEM",
                "Sangramento após 4 anos de menopausa, estável e obesa",
                "Solicitar ultrassonografia transvaginal",
                "Curetar de urgência ou pedir RM como primeiro exame"
              ],
              [
                "⚠ Recusa informada",
                "Sangramento recorrente e endométrio 12 mm em mulher capaz",
                "Comunicar risco e respeitar decisão",
                "Omitir hipótese ou ameaçar abandono do cuidado"
              ],
              [
                "⚠ Tamoxifeno e endométrio",
                "Sangramento frequente e endométrio heterogêneo de 15 mm",
                "Indicar avaliação histológica",
                "Suspender tamoxifeno ou tratar empiricamente sem amostra"
              ],
              [
                "⚠ Endometriose",
                "Dismenorreia progressiva, dispareunia profunda e útero retrovertido",
                "Reconhecer quadro típico",
                "Confundir dor à mobilização com DIP isolada"
              ],
              [
                "Pólipo endometrial",
                "Imagem pediculada vascular e projeção glandular digitiforme",
                "Reconhecer lesão",
                "Confundir com leiomioma ou hiperplasia difusa"
              ],
              [
                "Climatério",
                "49 anos sintomática, sem contraindicações e mamografia normal",
                "Oferecer tratamento individualizado",
                "Exigir FSH ou prometer benefício cardiovascular/fitoterápico equivalente"
              ],
              [
                "⚠ Sangramento pós-menopausa",
                "Sangramento recorrente e endométrio irregular de 8 mm",
                "Investigação endometrial",
                "Tranquilizar por citologia cervical negativa"
              ],
              [
                "⚠ Sangramento pós-menopausa e autonomia",
                "Idosa lúcida deseja decidir por si",
                "Investigação com respeito à capacidade",
                "Transferir decisão à filha apenas pela idade"
              ],
              [
                "Terapia hormonal da menopausa",
                "Sintomas, útero presente e risco cardiovascular",
                "Escolha de via e associação",
                "Esquecer proteção endometrial ou tratar via oral como única"
              ],
              [
                "Terapia hormonal da menopausa",
                "Sintomas intensos em histerectomizada",
                "Indicação e escolha de formulação",
                "Prescrever TH para prevenção cognitiva ou esquecer ausência de útero"
              ],
              [
                "⚠ Endometriose profunda",
                "Dismenorreia e hematoquezia cíclica com nódulos posteriores",
                "Investigação e mapeamento",
                "Tratar como doença intestinal isolada"
              ],
              [
                "⚠ Sangramento pós-menopausa",
                "Sangramento persistente sem terapia hormonal",
                "Exame inicial de causa estrutural",
                "Atribuir ao climatério sem investigação"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "parto-partograma-ctg-e-parto-operatorio",
      "tipo": "tema",
      "titulo": "Parto — partograma, CTG e parto operatório",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "⚠ Cardiotocografia — DIP II e Categoria II de alto risco",
              "texto": "Cat. III = variabilidade AUSENTE + tardias/variáveis recorrentes ou bradicardia, ou sinusoidal. Variab. mínima (1–5 bpm) ainda é II; II c/ taqui, tardias recorrentes, mecônio, parto distante = alto risco: ressuscitação intrauterina e resolução se persistir.",
              "trava": "⚠ Cabeça 1; placenta 2; cordão 3. Categoria II não é categoria leve."
            },
            {
              "titulo": "⚠ HPV/condiloma na gestação — oncologia não escolhe via de parto",
              "texto": "Condiloma muda via de parto só se obstrui canal ou há risco relevante de sangramento. Fora obstrução/sangramento importante, via de parto segue critérios obstétricos; genotipagem acessória não decide.",
              "trava": "⚠ HPV alto risco = ONCOLOGIA, não cesariana."
            }
          ]
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "CTG — desacelerações (DIPs)",
            "colunas": [
              "DIP",
              "Mecanismo"
            ],
            "linhas": [
              [
                "DIP I / precoce",
                "Compressão cefálica"
              ],
              [
                "DIP II / tardia",
                "Insuficiência uteroplacentária (erro: ligar ao cordão)"
              ],
              [
                "DIP III / variável",
                "Cordão"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "CTG — Categoria II de alto risco",
            "passos": [
              {
                "tipo": "avaliar",
                "texto": "Variabilidade AUSENTE + tardias/variáveis recorrentes ou bradicardia, ou padrão sinusoidal?"
              },
              {
                "tipo": "decisao",
                "texto": "Critério de Categoria III presente?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Categoria III"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não",
                    "passos": [
                      {
                        "tipo": "avaliar",
                        "texto": "Categoria II (variabilidade mínima 1–5 bpm ainda é II)"
                      },
                      {
                        "tipo": "atencao",
                        "texto": "II + taquicardia, mínima variab., tardias recorrentes, mecônio, parto distante = alto risco"
                      }
                    ]
                  }
                ]
              },
              {
                "tipo": "conduta",
                "texto": "Ressuscitação intrauterina: tratar hipotensão, taquissistolia, suspender/reduzir ocitocina, reposicionar"
              },
              {
                "tipo": "conduta",
                "texto": "Reavaliação rápida → resolução expedita se persistir"
              },
              {
                "tipo": "atencao",
                "texto": "O2 materno de rotina não recomendado se mãe normoxêmica; 'não ser III' ≠ observação prolongada"
              }
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "HPV/condiloma na gestação — via de parto",
            "colunas": [
              "Situação",
              "Via de parto"
            ],
            "linhas": [
              [
                "Condiloma obstrui canal ou risco relevante de sangramento",
                "Muda via de parto"
              ],
              [
                "Fora obstrução/sangramento importante",
                "Via segue critérios obstétricos"
              ],
              [
                "Genotipagem HPV alto risco",
                "Questão oncológica; não indica cesariana"
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
                "Alteração da FC fetal",
                "Linha de base 102 bpm por 10 min, demais parâmetros normais",
                "Realizar medidas de reanimação intrauterina",
                "Indicar cesárea imediata sem medidas iniciais"
              ],
              [
                "Cesárea a pedido",
                "Gestação de baixo risco com desejo persistente",
                "Definir momento seguro",
                "Negar escolha ou operar antes de 39 semanas"
              ],
              [
                "Gestação prolongada · URGÊNCIA",
                "41 semanas, assintomática e bem-estar fetal normal",
                "Planejar conduta em 41 semanas",
                "Aguardar além de 42 semanas ou pedir Doppler sem indicação"
              ],
              [
                "Terceiro período do parto · URGÊNCIA",
                "Placenta não expulsa em 10 minutos e paciente estável",
                "Executar tração controlada do cordão",
                "Realizar curagem ou apenas aguardar"
              ],
              [
                "Rotura uterina",
                "Cicatriz uterina, dor súbita, choque, partes fetais palpáveis e subida da apresentação",
                "Reconhecer e realizar cesárea imediata",
                "Aguardar dilatação ou pedir ultrassom antes de operar"
              ],
              [
                "Laceração perineal",
                "Pele, mucosa e músculos sem esfíncter anal",
                "Reparar com consentimento e comunicação acessível",
                "Priorizar procedimento sem explicação ou anestesia geral"
              ],
              [
                "Distocia de ombro",
                "Sinal da tartaruga após desprendimento cefálico",
                "Executar primeira manobra",
                "Tração forte, pressão fúndica ou manobra interna antes da inicial"
              ],
              [
                "⚠ Partograma · URGÊNCIA · IMAGEM",
                "Registro gráfico apresentado sem critério de distocia",
                "Evitar intervenção desnecessária",
                "Amniotomia, ocitocina ou cesárea apenas por expectativa de rapidez"
              ],
              [
                "Gestação a termo e bem-estar fetal",
                "DUM confiável e CTG tranquilizadora",
                "Datação, CTG e seguimento",
                "Redatar por US tardio ou chamar aceleração de sofrimento"
              ],
              [
                "⚠ Cardiotocografia intraparto",
                "Traçado com desacelerações precoces",
                "Interpretar desacelerações e decidir",
                "Indicar intervenção por qualquer queda da FCF"
              ],
              [
                "⚠ Parto vaginal operatório",
                "Cabeça baixa, dilatação completa e bradicardia",
                "Escolher instrumento e oportunidade",
                "Indicar cesárea sem considerar parto assistido elegível"
              ],
              [
                "Estática fetal e manobras de Leopold",
                "Polo cefálico na região suprapúbica",
                "Interpretar semiologia obstétrica",
                "Confundir situação com apresentação"
              ],
              [
                "Fórceps de alívio",
                "Exaustão no expulsivo",
                "Condições para parto operatório",
                "Indicar instrumento sem conferir pré-requisitos"
              ],
              [
                "Restrição de crescimento fetal",
                "Altura uterina menor que esperada",
                "Biometria e avaliação Doppler",
                "Confundir diagnóstico de crescimento com avaliação de vitalidade"
              ],
              [
                "Dinâmica uterina",
                "Palpação do fundo uterino por 10 minutos",
                "Técnica de exame e comunicação",
                "Confundir número com duração das contrações"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "mama-nodulo-bi-rads-e-rastreamento",
      "tipo": "tema",
      "titulo": "Mama — nódulo, BI-RADS e rastreamento",
      "elementos": [
        {
          "tipo": "erros",
          "itens": [
            {
              "titulo": "Mama triplo-negativa cT2: sequência neoadjuvante",
              "texto": "Triplo-negativo cT2: tratamento sistêmico neoadjuvante primeiro, cirurgia depois.",
              "trava": "Triplo-negativo T2: primeiro sistêmico, depois bisturi."
            },
            {
              "titulo": "Descarga papilar: imagem normal não encerra investigação",
              "texto": "Descarga espontânea + unilateral + uniductal + cristalina/sanguinolenta = fluxo patológico, mesmo com imagem normal; investigação continua.",
              "trava": "Espontânea + unilateral + uniductal + cristalina/sangue = fluxo patológico, mesmo com imagem normal."
            }
          ]
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
                "⚠ Rastreamento de câncer de mama · URGÊNCIA",
                "Mãe com câncer aos 45 anos",
                "Antecipar mamografia",
                "Aplicar faixa etária de risco habitual"
              ],
              [
                "Nódulo mamário na gestação",
                "Nódulo novo e história familiar de câncer precoce",
                "Não adiar avaliação",
                "Esperar o parto ou biopsiar sem imagem inicial"
              ],
              [
                "Abscesso mamário puerperal",
                "Febre, progressão e ponto de flutuação",
                "Tratar coleção mantendo lactação",
                "Suspender amamentação ou apenas antibiótico"
              ],
              [
                "BI-RADS 4C · IMAGEM",
                "Calcificações pleomórficas segmentares",
                "Referenciar para diagnóstico histológico",
                "Acompanhar em 6 meses ou pedir RM como substituto de biópsia"
              ],
              [
                "BI-RADS 4",
                "Microcalcificações agrupadas",
                "Próxima etapa diagnóstica",
                "Repetir imagem em vez de obter histologia"
              ],
              [
                "Mastite lactacional",
                "Mama inflamada sem flutuação",
                "Tratamento e aleitamento",
                "Suspender amamentação ou drenar sem abscesso"
              ],
              [
                "Mastalgia e rastreamento mamário",
                "Exame normal e tia com câncer tardio",
                "Separar sintoma de risco e rastreamento",
                "Classificar como alto risco por qualquer história familiar"
              ],
              [
                "Cisto mamário simples",
                "Lesão anecoica circunscrita sem fluxo",
                "Interpretar BI-RADS e orientar",
                "Indicar biópsia do cisto benigno por história familiar isolada"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "algoritmos-ginecologia-e-obstetricia",
      "tipo": "algoritmos",
      "titulo": "Algoritmos — Ginecologia e Obstetrícia",
      "resumo": "Fluxos para não confundir na hora da prova",
      "elementos": [
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Gravidez ectópica",
            "passos": [
              {
                "tipo": "decisao",
                "texto": "Instável / rota?",
                "ramos": [
                  {
                    "rotulo": "Sim",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Cirurgia"
                      }
                    ]
                  },
                  {
                    "rotulo": "Não (estável)",
                    "passos": [
                      {
                        "tipo": "decisao",
                        "texto": "Perfil?",
                        "ramos": [
                          {
                            "rotulo": "Queda espontânea + elegível",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Expectante"
                              }
                            ]
                          },
                          {
                            "rotulo": "Elegível sem queda adequada",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "MTX"
                              }
                            ]
                          },
                          {
                            "rotulo": "Massa / BCF / dor / líquido livre / falha",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Cirurgia"
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
                "texto": "MTX: β-hCG D4→D7 com queda ≥15%"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "HPP",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Reconheceu sangramento relevante"
              },
              {
                "tipo": "conduta",
                "texto": "Ressuscitar + uterotônico + TXA + 4 Ts em paralelo"
              },
              {
                "tipo": "atencao",
                "texto": "Não esperar Hb"
              },
              {
                "tipo": "avaliar",
                "texto": "Atonia × trauma × tecido × coagulopatia direcionam a escalada"
              }
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "RPM / PPROM",
            "passos": [
              {
                "tipo": "conduta",
                "texto": "Confirmar com espéculo"
              },
              {
                "tipo": "decisao",
                "texto": "Cenário?",
                "ramos": [
                  {
                    "rotulo": "Corio / compromisso fetal / TP estabelecido",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Resolver"
                      }
                    ]
                  },
                  {
                    "rotulo": "<34 sem estável",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Expectância ativa + ATB latência/corticoide; MgSO4 se parto iminente <32"
                      }
                    ]
                  },
                  {
                    "rotulo": "34–36+6 sem",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Protocolo pode variar"
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
      "id": "contrastes-ginecologia-e-obstetricia",
      "tipo": "contrastes",
      "titulo": "Contrastes — Ginecologia e Obstetrícia",
      "resumo": "Pares parecidos o bastante para serem trocados",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Contrastes de GO",
            "colunas": [
              "Contraste",
              "Item",
              "Distintivo"
            ],
            "linhas": [
              [
                "⚠ DIP I × II × III",
                "DIP I / precoce",
                "Cabeça"
              ],
              [
                "",
                "DIP II / tardia",
                "Insuficiência uteroplacentária"
              ],
              [
                "",
                "DIP III / variável",
                "Cordão"
              ],
              [
                "Ameaça × inevitável × incompleto",
                "Ameaça",
                "Sangra + colo fechado + viável"
              ],
              [
                "",
                "Inevitável",
                "Colo aberto sem expulsão completa"
              ],
              [
                "",
                "Incompleto",
                "Expulsou parte e reteve restos"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "numeros-que-derrubam-ginecologia-e-obstetricia",
      "tipo": "numeros",
      "titulo": "Números que derrubam — Ginecologia e Obstetrícia",
      "resumo": "Cutoffs, doses, janelas e prazos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Números de GO",
            "colunas": [
              "Item",
              "Número/corte",
              "Observação"
            ],
            "linhas": [
              [
                "Ectópica — MTX",
                "D4→D7 queda ≥15%",
                ""
              ],
              [
                "Perda gestacional — US",
                "CRL ≥7 mm sem BCF; MSD ≥25 mm sem embrião",
                "Intervalos 11/14 dias conforme achado"
              ],
              [
                "DMG — jejum",
                "<92 normal inicial → TOTG; 92–125 DMG; ≥126 diabetes manifesto",
                ""
              ],
              [
                "TOTG 75 g na gestação",
                "92 / 180 / 153 mg/dL",
                "1 valor alterado basta no protocolo"
              ],
              [
                "Morfológica 2º tri",
                "18–24 semanas",
                ""
              ],
              [
                "⚠ HAS na gestação",
                "PAS ≥140 OU PAD ≥90; grave ≥160 e/ou ≥110",
                ""
              ],
              [
                "⚠ Rede Alyne",
                "Captação ≤12 semanas; mínimo 7 consultas",
                ""
              ],
              [
                "⚠ SIU-LNG 52 mg",
                "Contracepção até 8 anos; proteção endometrial na TH 5 anos",
                ""
              ],
              [
                "Bacteriúria assintomática gestante",
                "≥10^5 UFC/mL",
                "Recorte clássico"
              ],
              [
                "⚠ Cervical DNA-HPV",
                "25–64 anos; negativo = repetir em 5 anos",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "normativo-ginecologia-e-obstetricia",
      "tipo": "normativo",
      "titulo": "Normativo — Ginecologia e Obstetrícia",
      "resumo": "14 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Atualizações 2026 — Ginecologia e Obstetrícia",
            "colunas": [
              "Norma/tema",
              "O que mudou",
              "Status",
              "Fonte e data"
            ],
            "linhas": [
              [
                "⚠ Contracepção — critérios OMS 2025",
                "Injetável trimestral só de progestagênio em lactante <6 semanas: categoria 2",
                "Confirmada",
                "Critérios de elegibilidade médica da OMS, 2025"
              ],
              [
                "",
                "Vários esquemas de TARV passam a categoria 1, incluindo dolutegravir",
                "",
                ""
              ],
              [
                "",
                "Contraceptivos com PrEP: categoria 1",
                "",
                ""
              ],
              [
                "",
                "Trava: TARV e PrEP deixaram de restringir contracepção hormonal",
                "",
                ""
              ],
              [
                "⚠ LARC pós-evento obstétrico",
                "DIU de cobre como contracepção de emergência até 5 dias",
                "Confirmada",
                "COFEN 802/2026 e atualização 2026"
              ],
              [
                "",
                "Enfermeiro habilitado pode inserir e retirar implante subdérmico (COFEN 802/2026)",
                "",
                ""
              ],
              [
                "",
                "Consentimento idealmente antes do evento obstétrico e sem coerção",
                "",
                ""
              ],
              [
                "",
                "Trava: Consentimento no pós-parto imediato é ponto sensível: idealmente antes, sem coerção",
                "",
                ""
              ],
              [
                "⚠ HPV — vacina e indicações 2026",
                "Gardasil 9 também previne tumores de orofaringe e cabeça e pescoço HPV-relacionados, 9 a 45 anos",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "Tratadas por NIC 2+ ou AIS com excisão: prioritárias; perioperatória ou até 12 meses após, 0–2–6 meses",
                "",
                ""
              ],
              [
                "",
                "A vacina não trata HPV já existente",
                "",
                ""
              ],
              [
                "",
                "Trava: Vacina previne recorrência e novas infecções; não trata lesão instalada",
                "",
                ""
              ],
              [
                "⚠ Rastreamento do câncer do colo do útero",
                "Método primário DNA-HPV: 25 a 64 anos em sexualmente ativas",
                "Confirmada",
                "Protocolo vigente de rastreamento"
              ],
              [
                "",
                "PVHIV e outras imunodepressões: a partir do início da atividade sexual",
                "",
                ""
              ],
              [
                "",
                "Imunocompetente: negativo repete em 5 anos; HPV 16 e/ou 18 → colposcopia",
                "",
                ""
              ],
              [
                "",
                "Outros tipos → citologia reflexa; ASCUS+ → colposcopia; reflexa normal → DNA-HPV em 1 ano",
                "",
                ""
              ],
              [
                "",
                "Trava: Primeiro pergunte qual protocolo o enunciado assume: citologia trienal ou DNA- HPV",
                "",
                ""
              ],
              [
                "⚠ Leiomioma — PCDT 2026",
                "Ácido tranexâmico entra para controle do sangramento",
                "Confirmada",
                "PCDT 2026"
              ],
              [
                "",
                "SIU-LNG é opção na elegível, sem distorção importante da cavidade",
                "",
                ""
              ],
              [
                "",
                "SIU-LNG controla sangramento e endométrio — não derrete o mioma",
                "",
                ""
              ],
              [
                "",
                "Trava: O SIU-LNG trata o endométrio, não o mioma",
                "",
                ""
              ],
              [
                "⚠ SOP — mudança de nomenclatura",
                "Proposta de mudança de SOP para SOMP ou PMOS. Critérios de Rotterdam permanecem",
                "Confirmada",
                "Proposta 2026"
              ],
              [
                "",
                "Trava: Nome novo não muda o diagnóstico clássico",
                "",
                ""
              ],
              [
                "⚠ Contato pele a pele e hora de ouro",
                "RN estável: pele a pele imediato, idealmente no 1º minuto",
                "Confirmada",
                "Atualização 2026"
              ],
              [
                "",
                "Hora de ouro: clampeamento oportuno, pele a pele e aleitamento",
                "",
                ""
              ],
              [
                "",
                "Exceções imediatas: <34 semanas, anestesia geral, instabilidade materna ou neonatal",
                "",
                ""
              ],
              [
                "",
                "Trava: As exceções são poucas e específicas — o padrão é o contato imediato",
                "",
                ""
              ],
              [
                "⚠ Sífilis na gestação — tratamento adequado",
                "Pesquisar: 1ª consulta, 3º trimestre, admissão para parto e violência sexual — TR primeiro, depois VDRL",
                "Confirmada",
                "PCDT IST vigente"
              ],
              [
                "",
                "Tratar ao primeiro exame positivo",
                "",
                ""
              ],
              [
                "",
                "≤1 ano de infecção: penicilina benzatina 2,4 milhões UI IM dose única; >1 ano/ignorada: 3 doses",
                "",
                ""
              ],
              [
                "",
                "Seguimento com VDRL mensal",
                "",
                ""
              ],
              [
                "",
                "Adequado: penicilina benzatina, início até 30 dias antes do parto, esquema p/ estágio, intervalo respeitado",
                "",
                ""
              ],
              [
                "",
                "Trava: As quatro condições são cobradas em conjunto — falhar em uma invalida",
                "",
                ""
              ],
              [
                "⚠ Vacinação na gestante",
                "Hepatite B: completar 3 doses se necessário. dTpa: a partir de 20 semanas, em toda gestação",
                "Confirmada",
                "Calendário 2026"
              ],
              [
                "",
                "Influenza: qualquer IG. Covid: 1 dose por gestação, respeitando intervalo de 6 meses",
                "",
                ""
              ],
              [
                "",
                "VSR materno: a partir de 28 semanas, dose única em cada gestação. Febre amarela: risco-benefício",
                "",
                ""
              ],
              [
                "",
                "Contraindicadas: sarampo, caxumba e rubéola; varicela; HPV; dengue",
                "",
                ""
              ],
              [
                "",
                "Trava: A vacina do VSR na gestante é recente — confirme a janela de 28 semanas",
                "",
                ""
              ],
              [
                "⚠ Cardiotocografia — categorias",
                "Cat. I: FC 110–160, variabilidade 5–25, aceleração presente ou não, DIP I presente ou não → expectante",
                "Confirmada",
                "Taxonomia NICHD"
              ],
              [
                "",
                "Cat. II: nem I nem III → reanimação intrauterina (decúbito, parar ocitocina, O₂, fluidos EV)",
                "",
                ""
              ],
              [
                "",
                "Cat. III: variabilidade ausente c/ DIP II ou III recorrentes ou bradicardia, ou sinusoidal → parto imediato",
                "",
                ""
              ],
              [
                "",
                "Trava: Cat. II não é tranquilizadora: é indeterminada; reanimação intrauterina, não parto imediato",
                "",
                ""
              ],
              [
                "⚠ HTLV na gestação",
                "Testar no 1º trimestre, preferencialmente na 1ª consulta de pré-natal",
                "Confirmada",
                "Nota Técnica Conjunta nº 6/2025 — CGIST/DATHI/SVSA/MS"
              ],
              [
                "",
                "HTLV-1/2 confirmado: cesariana preferencial, independentemente de sintomas",
                "",
                ""
              ],
              [
                "",
                "Não amamentar (principal via vertical); oferecer alternativa alimentar segura + apoio psicossocial",
                "",
                ""
              ],
              [
                "",
                "Diagnóstico não esclarecido no parto: cesárea se manifestação de HTLV (ATL, HAM/TSP)",
                "",
                ""
              ],
              [
                "",
                "Triagem positiva exige confirmação",
                "",
                ""
              ],
              [
                "",
                "Trava: Confirmado: cesárea preferencial e não amamenta. Triagem positiva sozinha não fecha — confirme",
                "",
                ""
              ],
              [
                "⚠ Cálcio e pré-eclâmpsia",
                "FEBRASGO e RBEHG (2026) deixaram de recomendar suplementação rotineira de cálcio, após revisão Cochrane",
                "Controversa — confirmar",
                "FEBRASGO/RBEHG 2026 x protocolos anteriores"
              ],
              [
                "",
                "Trava: Controvérsia ativa: não apague protocolos anteriores; identifique sociedade, protocolo e ano",
                "",
                ""
              ],
              [
                "⚠ Tireoide na gestação — ATA 2026",
                "Sem rastreamento universal. TSH c/ referência própria da gestação ou do laboratório quando possível",
                "Recomendação estrangeira — confirmar",
                "ATA 2026 — recomendação estrangeira"
              ],
              [
                "",
                "Anti-TPO positivo em eutireoidiana não recebe levotiroxina automaticamente",
                "",
                ""
              ],
              [
                "",
                "Hipo subclínico leve: mais tratamento no 1º trimestre; depois, não oferecer rotineiramente",
                "",
                ""
              ],
              [
                "",
                "Hipotiroxinemia isolada não se trata. Graves: PTU no 1º trimestre",
                "",
                ""
              ],
              [
                "",
                "Tireotoxicose gestacional transitória e fase tireotóxica da tireoidite pós-parto: sem antitireoidiano",
                "",
                ""
              ],
              [
                "",
                "Trava: Sem adoção automática por MS ou FEBRASGO. Identifique a fonte que a banca assume",
                "",
                ""
              ],
              [
                "⚠ Sangramento pós-menopausa — ACOG 2026",
                "USTV + biópsia endometrial como abordagem inicial",
                "Recomendação estrangeira — confirmar",
                "ACOG 2026 — pode divergir do protocolo brasileiro"
              ],
              [
                "",
                "Exceção no muito baixo risco: episódio único, endométrio visualizado ≤4 mm, sem FR, seguimento garantido",
                "",
                ""
              ],
              [
                "",
                "Trava: Pode divergir de algoritmos brasileiros. Pergunte qual diretriz e qual ano",
                "",
                ""
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "apostas-ginecologia-e-obstetricia",
      "tipo": "apostas",
      "titulo": "Apostas — Ginecologia e Obstetrícia",
      "resumo": "7 temas com alta chance de cair",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de GO (1/2) — Vulvovaginites, sífilis, vacinas, CTG",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Vulvovaginites — Candidíase",
                "C. albicans; branco grumoso (leite coalhado), pH <4,5, prurido intenso, disúria externa, pseudo-hifas"
              ],
              [
                "↳ Candidíase — tto",
                "Aminas negativo; fluconazol VO dose única ou nistatina 14 dias"
              ],
              [
                "↳ Vaginose bacteriana",
                "Gardnerella; branco-acinzentado homogêneo fino, pH >4,5, assintomática/leve ardência, clue cells, aminas +"
              ],
              [
                "↳ Vaginose — tto",
                "Metronidazol VO ou VV 7 dias"
              ],
              [
                "↳ Tricomoníase",
                "T. vaginalis; amarelo-esverdeado bolhoso abundante, pH >4,5, prurido, disúria, dispareunia, flagelados móveis"
              ],
              [
                "↳ Tricomoníase — tto",
                "Aminas podem ser +; metronidazol VO 7 dias ou dose única, tratando o parceiro"
              ],
              [
                "⚠ Sífilis na gestação",
                "Pesquisar: 1ª consulta, 3º tri, admissão p/ parto, violência sexual — teste rápido primeiro, depois VDRL"
              ],
              [
                "↳ tratar",
                "Ao primeiro exame positivo. ≤1 ano: penicilina benzatina 2,4 mi UI IM DU; >1 ano: 2,4 mi UI IM em 3 doses"
              ],
              [
                "↳ seguimento / adequado",
                "VDRL mensal. Adequado: benzatina, início ≥30 d antes do parto, esquema p/ estágio, intervalo entre doses"
              ],
              [
                "⚠ Pré-natal — vacinas",
                "Indicadas: dTpa a partir de 20 sem p/ todas; influenza; hepatite B 3 doses (0–1–6) p/ suscetíveis; covid-19"
              ],
              [
                "↳ VSR / contraindicadas",
                "VSR dose única IM a partir de 28 sem. Contraindicadas: sarampo, caxumba e rubéola; varicela; HPV; dengue"
              ],
              [
                "⚠ Vitalidade fetal — CTG Cat. I",
                "FC 110–160, variabilidade 5–25 bpm, aceleração ±, DIP I ± → conduta expectante"
              ],
              [
                "↳ Categoria II",
                "Nem I nem III → reanimação intrauterina: decúbito, parar ocitocina, O₂, fluidos EV"
              ],
              [
                "↳ Categoria III",
                "Variabilidade ausente c/ DIP II ou III recorrentes ou bradicardia, ou sinusoidal → parto imediato"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Apostas de GO (2/2) — Imagem, colo do útero, anticoncepção",
            "colunas": [
              "Aposta",
              "O que saber"
            ],
            "linhas": [
              [
                "Imagem em ginecologia — pólipo e endometrioma (multimídia)",
                "Banca descreve achados de imagem no enunciado: treinar ler a descrição e associar ao dx"
              ],
              [
                "↳ SUA",
                "Sangramento uterino anormal: US transvaginal com pólipo endometrial"
              ],
              [
                "↳ Endometrioma",
                "Cisto unilocular avascular, ecos internos homogêneos de baixa intensidade, vidro fosco"
              ],
              [
                "⚠ Rastreamento do câncer de colo",
                "Método primário: DNA-HPV. 25 a 64 anos se sexualmente ativa"
              ],
              [
                "↳ HIV/imunossupressão",
                "Iniciar a partir do início da atividade sexual (HIV/aids, imunodepressão ou imunossupressão)"
              ],
              [
                "Anticoncepção em situações especiais",
                "Contraindicação absoluta (OMS 4) a estrogênio: TEV prévio"
              ],
              [
                "↳ demais OMS 4",
                "Tabagista >35 anos e >15 cigarros/dia; enxaqueca com aura"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Rastreamento cervical — imunocompetentes (DNA-HPV)",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "25–64 anos, sexualmente ativa: DNA-HPV"
              },
              {
                "tipo": "decisao",
                "texto": "Resultado do DNA-HPV?",
                "ramos": [
                  {
                    "rotulo": "Negativo",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Repetir em 5 anos"
                      }
                    ]
                  },
                  {
                    "rotulo": "HPV 16 e/ou 18",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Colposcopia"
                      }
                    ]
                  },
                  {
                    "rotulo": "Outros tipos (não 16-18)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Citologia reflexa"
                      },
                      {
                        "tipo": "decisao",
                        "texto": "Citologia?",
                        "ramos": [
                          {
                            "rotulo": "ASCUS+",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Colposcopia"
                              }
                            ]
                          },
                          {
                            "rotulo": "Normal",
                            "passos": [
                              {
                                "tipo": "conduta",
                                "texto": "Repetir DNA-HPV em 1 ano"
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
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "CTG intraparto — conduta por categoria",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Cardiotocografia intraparto"
              },
              {
                "tipo": "decisao",
                "texto": "Categoria?",
                "ramos": [
                  {
                    "rotulo": "I",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "FC 110–160, variab. 5–25, DIP I ±: expectante"
                      }
                    ]
                  },
                  {
                    "rotulo": "II (nem I nem III)",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Reanimação intrauterina: decúbito, parar ocitocina, O₂, fluidos EV"
                      }
                    ]
                  },
                  {
                    "rotulo": "III",
                    "passos": [
                      {
                        "tipo": "conduta",
                        "texto": "Variab. ausente + DIP II/III recorrente ou bradicardia, ou sinusoidal: parto imediato"
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
      "id": "pontos-cegos-ginecologia-e-obstetricia",
      "tipo": "pontos-cegos",
      "titulo": "Pontos cegos — Ginecologia e Obstetrícia",
      "resumo": "9 temas que costumam passar despercebidos",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Ginecologia e Obstetrícia",
            "colunas": [
              "Tema",
              "Pista",
              "Regra/conduta"
            ],
            "linhas": [
              [
                "Cervicite gonocócica",
                "Secreção cervical mucopurulenta e pH vaginal normal",
                "Neisseria gonorrhoeae. Evitar: confundir cervicite c/ vaginose"
              ],
              [
                "Cisto de Bartholin",
                "Massa cística no vestíbulo antes das carúnculas, sem inflamação",
                "Cisto de Bartholin; cirurgia se incômodo indicar. Evitar: confundir c/ Skene/uretra; tratar assintomática"
              ],
              [
                "Linfogranuloma venéreo",
                "Pápula/úlcera transitória → bubão fistulizado em múltiplos orifícios",
                "Chlamydia trachomatis. Evitar: confundir c/ cancroide, donovanose ou sífilis"
              ],
              [
                "Mastite lactacional",
                "Mama inflamada sem flutuação",
                "Analgesia, manter amamentação e ATB VO. Evitar: suspender amamentação ou drenar sem abscesso"
              ],
              [
                "Osteoporose pós-menopausa",
                "T-score -2,5 e uso crônico de corticoide",
                "Bisfosfonato oral + exercício 30–40 min 3x/sem. Evitar: vitamina D ou calcitonina isoladas"
              ],
              [
                "Rotura uterina",
                "Cicatriz uterina, dor súbita, choque, partes fetais palpáveis, subida da apresentação",
                "Cesariana de emergência. Evitar: aguardar dilatação ou pedir US antes de operar"
              ],
              [
                "Tamoxifeno e endométrio",
                "Sangramento frequente e endométrio heterogêneo de 15 mm",
                "Estudo histológico do endométrio. Evitar: suspender tamoxifeno ou tratar empiricamente sem amostra"
              ],
              [
                "Tricomoníase",
                "Corrimento amarelo-esverdeado, pH 5,5 e colo em framboesa",
                "Vaginite → nitroimidazólico (questão ANULADA). Evitar: tratar como candidíase/vaginose"
              ],
              [
                "Síndrome dos ovários policísticos",
                "Anovulação e hiperandrogenismo c/ exclusões iniciais",
                "Anovulação crônica hiperandrogênica. Evitar: atribuir amenorreia só ao anticoncepcional prévio"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "travas-ginecologia-e-obstetricia",
      "tipo": "travas",
      "titulo": "Travas — Ginecologia e Obstetrícia",
      "resumo": "31 frases-trava para fixar a regra",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Travas — Ginecologia e Obstetrícia",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "⚠ CTG — DIPs",
                "Cabeça 1; placenta 2; cordão 3. Categoria II não é categoria leve"
              ],
              [
                "⚠ HTLV 2026",
                "Confirmado: cesárea preferencial + não amamenta"
              ],
              [
                "Partograma",
                "Antes de 10 cm olho DILATAÇÃO; com 10 cm olho DESCIDA"
              ],
              [
                "⚠ Rastreamento cervical",
                "Primeiro pergunte QUAL protocolo/ano: citologia histórica ou DNA-HPV 2025+"
              ],
              [
                "Mioma / SIU-LNG",
                "OITO evita gravidez; CINCO protege endométrio. LNG-IUS trata o ENDOMÉTRIO, não derrete o mioma"
              ],
              [
                "Ciclo menstrual",
                "Estradiol constrói; progesterona freia e transforma. LH é agulha; estradiol é montanha"
              ],
              [
                "Terapia hormonal",
                "Sintoma indica; janela permite; útero escolhe esquema; risco escolhe via"
              ],
              [
                "Ectópica",
                "Beta mede evolução; US localiza. Instável não negocia: opera"
              ],
              [
                "⚠ HPV alto risco",
                "HPV alto risco = ONCOLOGIA, não cesariana"
              ],
              [
                "Infertilidade",
                "Antes de pedir exame, confirme que já é hora de investigar"
              ],
              [
                "PE precoce",
                "Pré-eclâmpsia antes de 20 semanas: pense MOLA"
              ],
              [
                "Cutoff x relógio",
                "Primeiro cutoff; depois relógio. Morfológica = 18–24"
              ],
              [
                "RPM",
                "Latência ≠ GBS. Corioamnionite termina a espera"
              ],
              [
                "Sangramento pós-menopausa",
                "Sangrou = investiga. 4 mm tranquiliza um episódio; recorrência quebra a tranquilidade"
              ],
              [
                "HPP",
                "Não é escadinha: contrai, antifibrinolisa, repõe e procura a causa junto"
              ],
              [
                "Fundo cego",
                "Fundo cego + sem dor cíclica = Müller/AIS, não hímen"
              ],
              [
                "⚠ Úlcera genital",
                "Pode ter mais de uma IST; herpes provável não cancela sífilis/HIV"
              ],
              [
                "SPM x TDPM",
                "SPM incomoda; TDPM derruba humor e função"
              ],
              [
                "Triplo-negativo T2",
                "Primeiro sistêmico, depois bisturi"
              ],
              [
                "⚠ BRCA",
                "25 começa RM; 30 soma mamografia"
              ],
              [
                "Endométrio",
                "Endométrio não rastreia; sangrou, investiga"
              ],
              [
                "FIGO 1 x 2",
                "FIGO 1 entrou pouco; FIGO 2 entrou muito"
              ],
              [
                "Lesão vulvar/perineal",
                "Mecânica e limpa observa; térmica, visceral ou sangrando explora"
              ],
              [
                "HAS na gestação — 20 sem",
                "Antes de 20 = crônica; depois de 20 = gestacional/PE até provar o contrário"
              ],
              [
                "Pré-eclâmpsia — critério",
                "Hipertensão + doença sistêmica/placentária; proteína é opcional"
              ],
              [
                "Aloimunização",
                "Título diz quanto anticorpo a mãe tem; ACM diz se o feto está sofrendo"
              ],
              [
                "Oligodrâmnio a termo",
                "Não observa: resolve; Doppler normal não apaga o oligo. Indica parto, não cesárea"
              ],
              [
                "DMG",
                "Glicemia decide QUANDO; obstetrícia decide COMO"
              ],
              [
                "⚠ Vacina HPV",
                "Previne recorrência e novas infecções; não trata lesão já instalada"
              ],
              [
                "⚠ Pós-menopausa",
                "Antes de responder, pergunte qual diretriz e qual ano"
              ],
              [
                "⚠ HTLV confirmado",
                "Cesárea preferencial e não amamenta. Triagem positiva sozinha não fecha"
              ]
            ]
          }
        }
      ]
    }
  ]
};
