/* Gerado a partir do Dossiê ENAMED (tabelas e fluxos), adaptado para uso geral:
   sem estatísticas pessoais, sem marcas de cursinho. Itens com ⚠ ainda não
   foram reconferidos e aparecem com o selo "A confirmar". */
import type { AreaDossie } from "./tipos.ts";

export const ESTRATEGIA: AreaDossie = {
  "id": "estrategia",
  "nome": "Estratégia de prova",
  "blocos": [
    {
      "id": "normativo-confirmar-antes-de-memorizar",
      "tipo": "normativo",
      "titulo": "Normativo — confirmar antes de memorizar",
      "resumo": "51 atualizações recentes — confirme antes de memorizar",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Grau de confiança das atualizações",
            "colunas": [
              "Categoria",
              "Regra de uso",
              "Itens"
            ],
            "linhas": [
              [
                "Regra vigente",
                "Regra brasileira em vigor, com fonte datada. Estude como conteúdo",
                "45"
              ],
              [
                "Controversa",
                "Fontes divergem ou o material tem inconsistência. Não trate como regra firme",
                "2"
              ],
              [
                "Preliminar",
                "Documento ainda draft ou não publicado. Não substitua o algoritmo anterior",
                "1"
              ],
              [
                "Recomendação estrangeira",
                "Sem adoção automática por MS ou sociedade brasileira. Identifique a fonte da banca",
                "2"
              ],
              [
                "Vigência futura",
                "Vale depois da prova. Não aplique a cenário datado antes da vigência",
                "1"
              ]
            ]
          }
        },
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "As quatro travas que valem para todas",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "Date a regra",
                "Date a regra antes de responder"
              ],
              [
                "Estrangeira ≠ Brasil",
                "Não confunda atualização estrangeira com protocolo brasileiro vigente"
              ],
              [
                "Algoritmo novo",
                "Não significa que todo o antigo morreu — identifique exatamente o ponto que mudou"
              ],
              [
                "Priorize o que muda gabarito",
                "Dose, cutoff, janela, indicação, contraindicação e ordem de conduta > nomenclatura"
              ],
              [
                "Selo “A confirmar”",
                "Resposta depende do protocolo vigente: vale o documento que a banca assumiu, não o mais recente"
              ]
            ]
          }
        }
      ]
    },
    {
      "id": "mecanismos-de-erro-20",
      "tipo": "travas",
      "titulo": "Mecanismos de erro — 20",
      "resumo": "Mecanismos de erro e a pergunta que evita cada um",
      "elementos": [
        {
          "tipo": "quadro",
          "quadro": {
            "titulo": "Mecanismos de erro",
            "colunas": [
              "Trava",
              "Regra"
            ],
            "linhas": [
              [
                "Diagnóstico certo, conduta errada",
                "A questão quer diagnóstico, confirmação, primeira medida, tratamento definitivo ou seguimento?"
              ],
              [
                "1ª medida x definitivo x seguimento",
                "Nomeie a etapa. Uma alternativa pode ser verdadeira e ainda estar fora de hora"
              ],
              [
                "Algoritmos misturados",
                "Antes de puxar números, nomeie o protocolo: diarreia? dengue? queimado? FA? RPM?"
              ],
              [
                "Dado acessório vence o decisivo",
                "Qual achado muda probabilidade/conduta? Se ele sumisse, sua resposta mudaria?"
              ],
              [
                "Alternativa mais completa",
                "Excesso também erra. Uma intervenção desnecessária torna a alternativa falsa"
              ],
              [
                "Regra geral sem exceção",
                "Procure idade, gestação, DII, imunossupressão, retratamento, rim, cicatriz uterina, contraindicação"
              ],
              [
                "Estabilidade não avaliada primeiro",
                "Trauma, FA, ectópica, TEP, abdome e obstetrícia frequentemente começam pela fisiologia"
              ],
              [
                "Rastreamento x investigação",
                "Assintomático + protocolo = rastreamento. Sintoma/achado = investigação diagnóstica"
              ],
              [
                "Denominador / desenho",
                "Quem entrou no denominador? Como os grupos foram formados?"
              ],
              [
                "Metade correta salva composta",
                "Não salva. Quebre em afirmações e invalide se uma metade estiver errada"
              ],
              [
                "Atual x histórico x banca",
                "Date a regra: financiamento APS, HTLV, cervical, partograma, PMB"
              ],
              [
                "Acerto por eliminação",
                "Acertou sem saber por quê? Vira consolidação, não erro — mas precisa de resposta automática"
              ],
              [
                "Palavra decisiva perdida",
                "Circule: inicial, melhor, confirmatório, definitivo, primeiro, exceto"
              ],
              [
                "Achado isolado x síndrome",
                "Conjunto sindrômico vence um dado verdadeiro, mas secundário"
              ],
              [
                "Esquema híbrido inexistente",
                "Juntou pedaços de duas estratégias? Pare e reconstrua o protocolo inteiro"
              ],
              [
                "Diagnóstico fechado, tto aberto",
                "Cinco respostas: 1ª medida, droga/procedimento, dose/tempo, contraindicação, falha/escalada"
              ],
              [
                "Pular filtro/etapa",
                "Estou em elegibilidade, diagnóstico, confirmação, tratamento ou seguimento?"
              ],
              [
                "Idade/tempo muda algoritmo",
                "Que idade ou janela muda a regra? DDQ ~6 meses, criptorquidia >6 meses, OMA 48–72 h"
              ],
              [
                "Cutoff não automatizado",
                "Idade, peso, tempo, percentual ou título muda a regra? Circule antes das alternativas"
              ],
              [
                "Excesso x subtratamento",
                "Minha conduta é proporcional ao risco e ao tempo?"
              ]
            ]
          }
        },
        {
          "tipo": "algoritmo",
          "algoritmo": {
            "titulo": "Pergunta universal",
            "passos": [
              {
                "tipo": "cenario",
                "texto": "Leu o enunciado"
              },
              {
                "tipo": "avaliar",
                "texto": "Quer diagnóstico, confirmação, primeira medida, tratamento definitivo ou seguimento?"
              },
              {
                "tipo": "avaliar",
                "texto": "Qual dado realmente muda essa decisão?"
              },
              {
                "tipo": "atencao",
                "texto": "Uma alternativa pode ser verdadeira e ainda estar fora de hora"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "como-a-banca-arma-12-padroes",
      "tipo": "banca",
      "titulo": "Como a banca arma — 12 padrões",
      "resumo": "550 armadilhas analisadas · reconhecer o movimento vale mais que reconhecer o tema",
      "elementos": [
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "01",
            "titulo": "Trocar o diagnóstico por um vizinho",
            "frequencia": "178 de 550 armadilhas",
            "mecanismos": [
              "Achado isolado x síndrome",
              "Dx certo, próxima conduta errada"
            ],
            "antidoto": "Antes de nomear: qual achado separa os dois e se está no enunciado",
            "exemplos": [
              {
                "tema": "Sífilis após lesão genital sugestiva",
                "armadilha": "Teste não treponêmico de avaliação tratado como barreira universal ao tratamento"
              },
              {
                "tema": "Acidente de trabalho fatal",
                "armadilha": "Supor que IML fará notificação e CAT ou que um documento substitui outro"
              },
              {
                "tema": "Intoxicação por benzodiazepínico",
                "armadilha": "Confundir c/ naloxona ou usar sem considerar contraindicações clínicas"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "02",
            "titulo": "Escolher a droga, a via ou a manobra errada",
            "frequencia": "127 de 550 armadilhas",
            "mecanismos": [
              "Dx fechado, tratamento aberto",
              "Esquema híbrido inexistente"
            ],
            "antidoto": "Após nomear: 1ª medida, droga/procedimento, dose e tempo, contraindicação, critério de falha",
            "exemplos": [
              {
                "tema": "Tromboembolismo pulmonar",
                "armadilha": "HBPM na disfunção renal ou trombólise após estabilização sem critério explícito"
              },
              {
                "tema": "Recusa de transfusão em menor",
                "armadilha": "Autonomia do responsável como absoluta ou esperar decisão judicial"
              },
              {
                "tema": "Transferência do politraumatizado",
                "armadilha": "Grande volume, suporte básico ou transferir sem contato/documento"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "03",
            "titulo": "Pular ou inverter a etapa da decisão",
            "frequencia": "93 de 550 armadilhas",
            "mecanismos": [
              "Dx certo, conduta errada",
              "1ª medida x definitivo x seguimento",
              "Estabilidade não avaliada",
              "Pular etapa"
            ],
            "antidoto": "Alternativa verdadeira, fora de hora: nomeie a etapa antes de marcar",
            "exemplos": [
              {
                "tema": "Monoartrite aguda",
                "armadilha": "AINE ou antibiótico antes de colher líquido em paciente estável"
              },
              {
                "tema": "Obesidade infantil",
                "armadilha": "Medicalizar de imediato ou encaminhar sem intervenção de estilo de vida"
              },
              {
                "tema": "Hemorragia pós-parto",
                "armadilha": "Ir direto a B-Lynch/histerectomia ou tamponamento antes de uterotônicos"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "04",
            "titulo": "Atrasar o que já estava indicado",
            "frequencia": "92 de 550 armadilhas",
            "mecanismos": [
              "Excesso x subtratamento",
              "Palavra decisiva perdida"
            ],
            "antidoto": "Aguardar/observar/manter/dar alta: se a conduta já tem gatilho, esperar é errar",
            "exemplos": [
              {
                "tema": "Síndrome coronariana sem supra",
                "armadilha": "Esperar troponina p/ AAS/clopidogrel ou O2 sem hipoxemia relevante"
              },
              {
                "tema": "Atraso do desenvolvimento",
                "armadilha": "M-CHAT fora da idade ou aguardar especialista sem avaliação contextual"
              },
              {
                "tema": "Tentativa de suicídio em adolescente",
                "armadilha": "Manter sigilo diante de risco grave ou impor internação compulsória automática"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "05",
            "titulo": "Reduzir o caso a um único eixo",
            "frequencia": "87 de 550 armadilhas",
            "mecanismos": [
              "Achado isolado x síndrome",
              "Dado acessório vence o decisivo",
              "Metade correta salva alternativa composta"
            ],
            "antidoto": "Alternativa isola um achado/exame/medida: conjunto sindrômico vence dado isolado",
            "exemplos": [
              {
                "tema": "Apneia obstrutiva do sono",
                "armadilha": "Investigar alergia isolada ou exame que não avalia obstrução anatômica"
              },
              {
                "tema": "Nome social em documento médico",
                "armadilha": "Expor condição trans/CID ou usar só nome social quando impede identificação"
              },
              {
                "tema": "Hemorragia pós-parto",
                "armadilha": "Bolsa rota/idade isolada como fator principal no modelo citado"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "06",
            "titulo": "Aplicar a regra geral onde existe exceção",
            "frequencia": "55 de 550 armadilhas",
            "mecanismos": [
              "Regra geral sem exceção",
              "Esquema híbrido inexistente"
            ],
            "antidoto": "Procure a exceção antes: idade, gestação, imunossupressão, rim, cicatriz, retratamento",
            "exemplos": [
              {
                "tema": "Pneumonia na adolescência",
                "armadilha": "Desconsiderar idade e padrão radiológico; gabarito fornecido favorece VSR"
              },
              {
                "tema": "AESP por pneumotórax hipertensivo",
                "armadilha": "Tratar FA no monitor como chocável sem considerar ausência de pulso"
              },
              {
                "tema": "Íleo pós-operatório",
                "armadilha": "Escolher distúrbio que aumentaria excitabilidade sem considerar perdas"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "07",
            "titulo": "Escolher o exame errado para a pergunta",
            "frequencia": "47 de 550 armadilhas",
            "mecanismos": [
              "Rastreamento x investigação",
              "Denominador/desenho"
            ],
            "antidoto": "Cada exame responde a uma pergunta: diga qual pergunta faz antes de escolher",
            "exemplos": [
              {
                "tema": "Violência sexual",
                "armadilha": "Condicionar cuidado a boletim de ocorrência ou sorologia do agressor"
              },
              {
                "tema": "Infecção urinária febril recorrente",
                "armadilha": "Estudo funcional/dinâmico quando o alvo é cicatriz cortical"
              },
              {
                "tema": "Tuberculose resistente",
                "armadilha": "Iniciar esquema básico ou esperar baciloscopia para encaminhar"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "08",
            "titulo": "Fazer mais do que o caso pede",
            "frequencia": "45 de 550 armadilhas",
            "mecanismos": [
              "Alternativa mais completa",
              "Excesso x subtratamento"
            ],
            "antidoto": "Excesso também erra: intervenção desnecessária torna a alternativa inteira falsa",
            "exemplos": [
              {
                "tema": "Cuidados paliativos",
                "armadilha": "Intubar por pedido familiar ou drenar pequeno derrame sem alvo sintomático"
              },
              {
                "tema": "Climatério",
                "armadilha": "Exigir FSH ou prometer benefício cardiovascular/fitoterápico equivalente"
              },
              {
                "tema": "TB em população privada de liberdade",
                "armadilha": "Limiar de 3 semanas da população geral ou internar socialmente"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "09",
            "titulo": "Errar o número, a idade ou a janela",
            "frequencia": "32 de 550 armadilhas",
            "mecanismos": [
              "Cutoff não automatizado",
              "Idade/tempo muda algoritmo"
            ],
            "antidoto": "Circule idade, peso, tempo, percentual ou título antes de ler as alternativas",
            "exemplos": [
              {
                "tema": "Profilaxia antirrábica",
                "armadilha": "Regra de cão/gato (observar 10 dias) ou soro automático"
              },
              {
                "tema": "Infecção congênita por Zika",
                "armadilha": "Equiparar microcefalia por Zika à anencefalia ou criar limite de 20 semanas"
              },
              {
                "tema": "Vacinação HPV",
                "armadilha": "Vacinar abaixo da faixa indicada ou aplicar duas doses sem indicação"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "10",
            "titulo": "Passar por cima da pessoa",
            "frequencia": "13 de 550 armadilhas",
            "mecanismos": [
              "Regra geral sem exceção",
              "Palavra decisiva perdida"
            ],
            "antidoto": "Vontade, sigilo, nome, documento e vínculo são conteúdo — não moldura",
            "exemplos": [
              {
                "tema": "Mudanças climáticas e saúde",
                "armadilha": "Ajustar anti-hipertensivo por calor ou negar educação climática"
              },
              {
                "tema": "Laqueadura e planejamento reprodutivo",
                "armadilha": "Omitir orientação ou tratar aconselhamento como imposição"
              },
              {
                "tema": "Doença mão-pé-boca",
                "armadilha": "Internar rotineiramente ou negar complicações raras"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "11",
            "titulo": "Excluir pelo exame negativo",
            "frequencia": "9 de 550 armadilhas",
            "mecanismos": [
              "Achado isolado x síndrome",
              "Dado acessório vence o decisivo"
            ],
            "antidoto": "Marcador negativo raramente fecha porta: o que o teste exclui de verdade?",
            "exemplos": [
              {
                "tema": "Tuberculose",
                "armadilha": "Descartar TB por TRM negativo ou ignorar teste de sensibilidade"
              },
              {
                "tema": "Estreptococo do grupo B",
                "armadilha": "Dispensar profilaxia por baixa contagem ou bolsa íntegra"
              },
              {
                "tema": "Artrite reumatoide",
                "armadilha": "Excluir AR por marcador ou escolher corticoide isolado"
              }
            ]
          }
        },
        {
          "tipo": "padrao",
          "padrao": {
            "numero": "12",
            "titulo": "Usar o protocolo da época errada",
            "frequencia": "2 de 550 armadilhas",
            "mecanismos": [
              "Atual x histórico x banca",
              "Regra geral sem exceção"
            ],
            "antidoto": "Date a regra antes de memorizar: calendário, rastreamento, financiamento, HTLV, partograma",
            "exemplos": [
              {
                "tema": "Resgate vacinal infantil",
                "armadilha": "Reiniciar todo esquema ou aplicar calendário atual ao item histórico"
              },
              {
                "tema": "Vacinação do adolescente",
                "armadilha": "Dar reforços inexistentes de hepatite B ou SCR"
              }
            ]
          }
        }
      ]
    }
  ]
};
