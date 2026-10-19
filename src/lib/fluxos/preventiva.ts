import { atencao, avaliar, cenario, conduta, decisao, ramo, type AreaFluxos } from "./tipos.ts";

export const PREVENTIVA: AreaFluxos = {
  id: "preventiva",
  nome: "Preventiva",
  temas: [
    {
      id: "sus",
      titulo: "SUS",
      questoes: 10,
      quadros: [
        {
          titulo: "Conselho × Conferência × Comissões intergestores",
          colunas: ["", "Conselho", "Conferência", "Intergestores (CIT/CIB/CIR)"],
          linhas: [
            ["Quando", "Permanente", "A cada 4 anos", "Foros permanentes de pactuação"],
            ["Faz o quê", "Delibera e fiscaliza (inclusive o dinheiro)", "Avalia a situação e propõe diretrizes", "Negociação e pactuação entre gestores"],
            ["Quem", "50% usuários, 25% trabalhadores, 25% gestores/prestadores", "50% usuários", "Só gestores; sem usuários (não é controle social)"],
            ["Norma", "Lei 8.142; divisão pela Res. CNS 453/2012", "Lei 8.142; convoca o Executivo (ou ela mesma/Conselho, extraord.)", "CIT: Ministério + Conass + Conasems; CIB: estado + Cosems; CIR: Decreto 7.508"],
          ],
        },
        {
          titulo: "Decreto 7.508: Região de Saúde × Portas de entrada",
          colunas: ["", "Região de saúde (mínimo 5)", "Portas de entrada (4 serviços)"],
          linhas: [
            ["Atenção primária", "Sim", "Sim"],
            ["Urgência e emergência", "Sim", "Sim"],
            ["Psicossocial", "Sim", "Sim"],
            ["Ambulatorial especializada e hospitalar", "Sim", "Não: referenciada pelas portas (art. 10)"],
            ["Vigilância em saúde", "Sim", "Não"],
            ["Especiais de acesso aberto", "Não", "Sim"],
          ],
        },
      ],
      oQueCai: [
        "Lei 8.142/1990: conselhos e conferências + repasse fundo a fundo, regular e automático; participação também é princípio da 8.080 (art. 7º, VIII)",
        "Conselho: permanente, deliberativo, 3 esferas; usuários em paridade; 50/25/25 (Res. CNS 453/2012); governo + prestadores = 25% juntos",
        "Conferência: a cada 4 anos; convocada pelo Executivo; extraordinariamente por ela mesma ou pelo Conselho",
        "Repasse: ≥ 70% aos municípios (sobre recursos do FNS do art. 2º, IV), resto aos estados; 6 requisitos: fundo, conselho, plano, relatório, contrapartida, PCCS",
        "Doutrinários (3): universalidade, equidade, integralidade. Organizativos: descentralização, regionalização, hierarquização, participação popular",
        "Letra do art. 7º da 8.080: 'igualdade da assistência'; provas 2024/2026 trataram equidade como princípio (mais a quem precisa mais)",
        "Pacto pela Vida 2006 (6): idoso; colo e mama; mortalidade infantil e materna; emergentes/endemias; promoção; atenção básica",
        "2008 acrescentou: saúde mental, pessoa com deficiência, risco de violência, saúde do homem, saúde do trabalhador",
      ],
      pegadinhas: [
        "Conselhos regulamentados pela Lei 8.080 (é a 8.142), conselho 'discursivo' ou conferência anual",
        "Complementar (privado dentro do SUS) × suplementar (planos, ANS); União na bipartite",
        "Descentralização é político-administrativa; 'centralização política' não existe. Subsistema indígena não é centralizado",
        "Pacto pela Vida: intruso (indígena, próstata/cólon, territorialização) invalida a alternativa",
      ],
    },
    {
      id: "vigilancia",
      titulo: "Vigilância em saúde",
      questoes: 9,
      algoritmos: [
        {
          titulo: "Notificação compulsória: qual evento, em quanto tempo, para quem",
          passos: [
            cenario("Evento da lista nacional de notificação compulsória"),
            avaliar("Em regra, notifica-se na suspeita ou confirmação, conforme a definição de caso do evento"),
            decisao(
              "Qual o prazo que a lista dá ao evento?",
              ramo(
                "Imediata: até 24 horas, pelo meio mais rápido",
                decisao(
                  "Para quem?",
                  ramo("Ministério, estado e município", conduta("Cólera, botulismo, febre amarela, sarampo, rubéola, raiva humana, paralisia flácida aguda, difteria, tétano neonatal")),
                  ramo("Estado e município", conduta("Coqueluche, doença meningocócica e outras meningites, varicela, tétano acidental")),
                  ramo("Município", conduta("Leptospirose, acidente por animal peçonhento, violência sexual, tentativa de suicídio"))
                )
              ),
              ramo("Semanal: até 7 dias", conduta("Tuberculose, hanseníase, HIV/aids, sífilis, hepatites virais; casos de dengue e de Oropouche"))
            ),
            conduta("Semana sem casos: informar a notificação negativa"),
            atencao("A condição muda o prazo: óbito por dengue e malária fora da Amazônia são imediatas"),
          ],
        },
      ],
      quadros: [
        {
          titulo: "Componentes da vigilância em saúde",
          colunas: ["Vigilância", "Objeto", "Onde aparece"],
          linhas: [
            ["Sanitária", "Bens de consumo e serviços", "Lei 8.080; política de 2018"],
            ["Epidemiológica", "Determinantes e condicionantes, doenças e agravos", "Lei 8.080; política de 2018"],
            ["Em saúde ambiental", "Água, ar, solo, químicos", "Política de 2018"],
            ["Em saúde do trabalhador", "Ambientes e processos de trabalho", "Lei 8.080; política de 2018"],
            ["Da situação de saúde", "Indicadores do território", "Lista de 2009 (prova 2021); em 2018, ação transversal"],
          ],
        },
      ],
      oQueCai: [
        "Notificação imediata = até 24 h do conhecimento; semanal = até 7 dias. Semana sem casos → notificação negativa",
        "Imediata às 3 esferas: cólera, botulismo, febre amarela, sarampo, rubéola, raiva humana, PFA; desde 2026, difteria e tétano neonatal",
        "Imediata só a estado e município: coqueluche, doença meningocócica e outras meningites, varicela, tétano acidental",
        "2026: covid genérica saiu; Oropouche: casos semanal, óbitos/gestante/anomalias imediata. Clamídia não está na lista nacional",
        "LIRAa (IIP): < 1% satisfatório; 1 a 3,9% alerta; > 3,9% (4% ou mais) risco de surto",
        "Endemia = habitual; epidemia = acima do esperado; surto = epidemia localizada; pandemia = vários continentes",
        "Quarentena = expostos ainda sem doença; isolamento = doentes/infectados",
      ],
      pegadinhas: [
        "'Exclusivamente', 'apenas' (só hospital, só no surto, coleta passiva) = errada",
        "Coqueluche não vai ao Ministério; difteria cobrada pela regra antiga",
        "'Sem casos na semana, não precisa enviar nada': falso",
        "Faixa de alerta do LIRAa chamada de 'risco', ou exigir > 10% para risco",
      ],
    },
    {
      id: "niveis-prevencao",
      titulo: "Níveis de prevenção",
      questoes: 8,
      quadros: [
        {
          titulo: "Níveis de prevenção: pares de exemplos que a prova troca",
          colunas: ["Situação", "Nível", "Por quê", "Vizinha que confunde"],
          linhas: [
            ["Vacina", "Primária (proteção específica)", "Antes da doença; mira uma doença", "Chamar vacina de promoção da saúde"],
            ["Política intersetorial: regular propaganda de ultraprocessados, estimular atividade física", "Primária (promoção da saúde)", "Antes da doença; medida geral, inespecífica", "—"],
            ["Quimioprofilaxia em grupo de risco", "Primária (proteção específica)", "Antes da doença", "Não é promoção da saúde"],
            ["Parar de fumar com câncer de pulmão já diagnosticado", "Terciária", "Doença estabelecida: o momento do paciente decide", "Cessação do tabagismo é classicamente primária"],
            ["Exames de rotina em assintomático (glicemia, colesterol, PSA, sangue oculto); mamografia", "Secundária", "A doença já pode estar presente, em fase inicial", "Rastreamento oferecido como ação do período pré-patogênico (primária)"],
            ["Diagnosticar e tratar cedo o doente com sintomas iniciais", "Secundária", "Secundária não é só para assintomático", "—"],
            ["Não pedir check-up com teste ergométrico e PSA em jovem assintomático, explicando o motivo", "Quaternária", "Evita intervenção desnecessária e o dano que ela causa", "Não pedir rastreamento aparece como 'secundária'"],
            ["Retirar metformina tomada sem indicação", "Quaternária", "Evita sobretratamento", "'Primária', porque a paciente queria prevenir diabetes"],
            ["Tratar a doença já manifesta para evitar sequela (limitação da incapacidade)", "Secundária, em Leavell e Clark", "Ainda não há sequela a reabilitar", "Reabilitar a sequela é terciária"],
          ],
        },
        {
          titulo: "Leavell e Clark: 3 níveis, 5 ações (+ quaternária)",
          colunas: ["Nível", "Período", "Ações"],
          linhas: [
            ["Primária", "Pré-patogênico (sem doença)", "Promoção da saúde (inespecífica); proteção específica (vacina, quimioprofilaxia)"],
            ["Secundária", "Patogênico inicial (com ou sem sintoma)", "Diagnóstico e tratamento precoces (rastreamento); limitação da incapacidade*"],
            ["Terciária", "Doença instalada / sequela", "Reabilitação"],
            ["Quaternária", "Qualquer momento", "Evitar intervenção desnecessária e iatrogenia"],
            ["Primordial", "Sociedade", "Evitar que surjam os fatores de risco"],
          ],
        },
      ],
      oQueCai: [
        "O nível depende do momento do paciente, não da ação: parar de fumar com câncer de pulmão já diagnosticado = terciária",
        "Exames de rotina em assintomático (glicemia, colesterol, PSA, sangue oculto) = secundária",
        "*Limitação da incapacidade: secundária no original de Leavell e Clark; vários livros a põem na terciária",
        "Quaternária: retirar metformina sem indicação; não pedir teste ergométrico e PSA em jovem assintomático, explicando",
        "Rastreio: doença importante, história natural conhecida, fase pré-clínica detectável, teste aceitável e confiável, tratar cedo dá mais benefício",
        "Colo (diretriz 2025): DNA-HPV, 25 a 64 anos, a cada 5 anos se negativo. Alvo = lesão precursora → cai incidência e mortalidade",
      ],
      pegadinhas: [
        "Cessação do tabagismo em quem já tem câncer: não é primária",
        "Mamografia como ação do período pré-patogênico; vacina chamada de promoção da saúde",
        "Não pedir exame de rastreamento chamado de 'secundária' (é quaternária)",
        "Critério absoluto: doença que possa ser 'tratada e eliminada' (basta melhorar o desfecho)",
      ],
    },
    {
      id: "delineamentos",
      titulo: "Delineamentos epidemiológicos",
      questoes: 7,
      quadros: [
        {
          titulo: "Vieses e confundimento: em que desenho pesam e por quê",
          colunas: ["Problema", "Mais característico de", "Por quê", "Onde é pouco provável ou como se controla"],
          linhas: [
            ["Viés de recordação (memória)", "Caso-controle", "Quem adoeceu lembra mais da exposição; ela é perguntada depois da doença", "Pouco provável na coorte prospectiva: a exposição é registrada antes do desfecho"],
            ["Viés de recordação fora do caso-controle", "Transversal e coorte retrospectiva", "Qualquer estudo que colha exposição passada por relato", "—"],
            ["Viés de seleção", "Caso-controle", "—", "—"],
            ["Perda de seguimento", "Coorte", "O grupo é acompanhado no tempo até o desfecho", "—"],
            ["Fatores de confusão", "—", "—", "No ensaio randomizado, o sorteio equilibra os fatores de confusão entre os grupos"],
          ],
        },
        {
          titulo: "Caso-controle × coorte × ensaio clínico",
          colunas: ["", "Caso-controle", "Coorte", "Ensaio randomizado"],
          linhas: [
            ["Parte de", "Desfecho (doença)", "Exposição (todos sem a doença)", "Intervenção alocada pelo pesquisador"],
            ["Tipo", "Observacional", "Observacional (prospectiva ou retrospectiva)", "Experimental"],
            ["Medida típica", "Odds ratio (não calcula incidência)", "Incidência e risco relativo", "Eficácia da intervenção"],
            ["Bom para", "Doença rara, latência longa; rápido e barato", "Exposição rara, vários desfechos", "Sorteio equilibra confundidores"],
            ["Viés característico", "Recordação e seleção", "Perda de seguimento", "Sorteio ≠ cegamento"],
          ],
        },
      ],
      oQueCai: [
        "O que define o desenho é como o grupo foi escolhido: prontuário antigo não faz coorte retrospectiva",
        "Coorte: exposição antes do desfecho; mede incidência; cara, demorada, ruim para doença rara",
        "ELSA-Brasil: 15 mil servidores seguidos com exames periódicos = observacional prospectivo",
        "Caso-controle e coorte: ambos observacionais, analíticos, longitudinais, com grupo de comparação",
        "Experimentais: ensaio clínico, ensaio de campo (sadios, vacina), ensaio comunitário (unidade = comunidade)",
        "Metanálise: junta numericamente estudos parecidos para ganhar poder estatístico",
      ],
      pegadinhas: [
        "'Coorte retrospectiva' quando os grupos foram formados pela doença (é caso-controle)",
        "Coorte 'experimental', 'a mais econômica' ou 'exclusivamente prospectiva'",
        "Estender o viés de recordação aos dois estudos (é marca do caso-controle)",
        "'Dados de prevalência' descreve transversal, não randomizado",
      ],
    },
    {
      id: "atencao-primaria",
      titulo: "Atenção Primária",
      questoes: 5,
      quadros: [
        {
          titulo: "Atributos da APS (Starfield)",
          colunas: ["Atributo", "Ideia", "Exemplo cobrado"],
          linhas: [
            ["Primeiro contato", "Porta de entrada, acesso", "Atendimento no mesmo dia"],
            ["Longitudinalidade", "Mesma equipe ao longo do tempo, com ou sem doença; vínculo", "Acompanhar a pessoa por anos"],
            ["Integralidade", "Conjunto de ações de que a pessoa precisa", "—"],
            ["Coordenação", "Integra informações e plano entre serviços", "Prontuário visível na UPA; retorno à UBS após alta"],
          ],
        },
      ],
      oQueCai: [
        "Coordenação e longitudinalidade = atributos da APS; universalidade, equidade, regionalização = princípios do SUS",
        "Matriciamento: especialista e equipe da APS juntos, sem hierarquia; coordenação do cuidado continua com a APS",
        "Apoio matricial por telefone e internet amplia o alcance",
        "Método centrado na pessoa: doença + experiência de adoecer, pessoa inteira, plano comum (decisão compartilhada)",
        "Territorialização: território vivo e dinâmico (pessoas, riscos, recursos, relações); conhecer a população para planejar",
      ],
      pegadinhas: [
        "Prontuário na UPA (coordenação) e atendimento no mesmo dia (acesso) vendidos como longitudinalidade",
        "Especialista 'detentor de maior saber' ou que passa a coordenar o caso complexo",
        "Método centrado na pessoa 'principalmente em dados objetivos, como exames'",
        "Território como recorte geográfico fixo, espaço independente ou porta de entrada",
      ],
    },
    {
      id: "indicadores",
      titulo: "Indicadores de saúde",
      questoes: 5,
      linhasDoTempo: [
        {
          titulo: "Mortalidade infantil: os componentes pela idade do óbito",
          marcos: [
            { quando: "22 semanas de gestação", texto: "Começa o período perinatal: óbitos fetais a partir daqui + óbitos de 0 a 6 dias. Denominador: nascimentos totais (nascidos vivos + óbitos fetais)" },
            { quando: "0 a 6 dias", texto: "Neonatal precoce (aqui termina o perinatal). Denominador: nascidos vivos, × 1.000" },
            { quando: "7 a 27 dias", texto: "Neonatal tardia. Neonatal (0 a 27 dias) reflete pré-natal, parto e cuidado ao recém-nascido" },
            { quando: "28 a 364 dias", texto: "Pós-neonatal: reflete ambiente (saneamento, nutrição, infecções). Denominador: nascidos vivos, × 1.000" },
            { quando: "Soma dos três", texto: "Neonatal precoce + neonatal tardia + pós-neonatal = mortalidade infantil. Quando ela cai, passa a predominar o componente neonatal" },
          ],
        },
      ],
      quadros: [
        {
          titulo: "Indicadores: numerador e denominador",
          colunas: ["Indicador", "Numerador", "Denominador", "Tipo"],
          linhas: [
            ["Incidência", "Casos novos", "População sob risco", "Coeficiente (risco)"],
            ["Prevalência", "Casos novos + antigos", "População total", "Coeficiente"],
            ["Mortalidade", "Óbitos", "População total", "Coeficiente"],
            ["Letalidade", "Óbitos pela doença", "Doentes (mesmo grupo e período)", "Coeficiente"],
            ["Coef. mortalidade infantil", "Óbitos < 1 ano", "Nascidos vivos × 1.000", "Coeficiente"],
            ["Razão de mortalidade materna", "Óbitos maternos", "Nascidos vivos × 100.000", "Coeficiente (matematicamente, razão)"],
            ["Mortalidade proporcional (Swaroop-Uemura)", "Óbitos do grupo (ex.: ≥ 50 anos)", "Total de óbitos × 100", "Índice (não mede risco)"],
          ],
        },
      ],
      oQueCai: [
        "Conta cobrada: 573 − (292 + 146) = 135 novos; sob risco 3.297 − 438 = 2.859; 135 ÷ 2.859 = 4,72%",
        "Componentes: neonatal precoce 0–6 d; tardia 7–27 d; pós-neonatal 28–364 d (todos ÷ NV × 1.000). Neonatal = 0 a 27 dias",
        "Perinatal: óbitos fetais ≥ 22 semanas + 0 a 6 dias ÷ nascimentos totais (vivos + óbitos fetais)",
        "Mortalidade infantil caindo → predomina o neonatal (pré-natal, parto, RN); pós-neonatal reflete ambiente",
        "Nelson de Moraes: I N invertido muito baixo; II L/J invertido baixo; III V/U regular; IV J elevado",
        "Swaroop-Uemura: 1º ≥ 75%; 2º 50–74%; 3º 25–49%; 4º < 25% (pior). Quanto maior, melhor",
        "Prevalência ≈ incidência × duração; sobe com casos novos, imigração e tratamento que prolonga sem curar; cai com cura, óbito, emigração",
      ],
      pegadinhas: [
        "Incidência com 573 casos totais no numerador (17,37%) ou sem descontar os doentes do denominador",
        "Comparar óbitos infantis em número absoluto (300 × 450) sem dividir por nascidos vivos",
        "Tratamento que reduz letalidade sem curar 'diminui a prevalência' (aumenta)",
        "Nascidos vivos como denominador da perinatal; 28º dia dentro do neonatal",
      ],
    },
    {
      id: "medidas-epidemiologicas",
      titulo: "Medidas epidemiológicas",
      questoes: 5,
      graficos: [
        {
          titulo: "Intervalo de confiança de 95%: onde fica o valor nulo",
          grupos: [
            {
              titulo: "Medidas de razão (RR, OR): o valor nulo é 1",
              nulo: 1,
              escala: [0.25, 0.5, 1, 2, 4],
              logaritmica: true,
              itens: [
                { rotulo: "A: RR 0,40 (0,30 a 0,55)", ponto: 0.4, inferior: 0.3, superior: 0.55 },
                { rotulo: "B: RR 0,80 (0,55 a 1,20)", ponto: 0.8, inferior: 0.55, superior: 1.2 },
                { rotulo: "C: RR 1,80 (1,20 a 2,70)", ponto: 1.8, inferior: 1.2, superior: 2.7 },
              ],
            },
            {
              titulo: "Medidas de diferença (redução absoluta, diferença de médias): o valor nulo é 0",
              nulo: 0,
              escala: [-20, -10, 0, 10],
              itens: [
                { rotulo: "D: diferença −10 (−18 a −2)", ponto: -10, inferior: -18, superior: -2 },
                { rotulo: "E: diferença −5 (−12 a +2)", ponto: -5, inferior: -12, superior: 2 },
              ],
            },
          ],
          leitura: [
            "Razão: o intervalo que não contém 1 é significativo a 5% (A e C). O que contém 1 não é (B).",
            "Diferença: o intervalo que não contém 0 é significativo (D). O que contém 0 não é (E).",
            "Erro comum: procurar o 1 numa medida de diferença, ou o 0 numa medida de razão.",
          ],
        },
      ],
      quadros: [
        {
          titulo: "Medidas de associação e efeito",
          colunas: ["Medida", "Conta", "Onde se usa"],
          linhas: [
            ["Risco relativo", "Ie ÷ Ine", "Coorte, ensaio clínico"],
            ["Odds ratio", "(a×d) ÷ (b×c)", "Caso-controle"],
            ["Risco atribuível", "Ie − Ine", "Coorte"],
            ["Redução relativa do risco", "1 − RR", "Ensaio clínico"],
            ["Densidade de incidência", "Casos novos ÷ pessoas-tempo", "Entradas em momentos diferentes, perdas de seguimento"],
            ["Taxa de ataque", "Doentes ÷ expostos", "Surto de fonte comum"],
          ],
        },
      ],
      oQueCai: [
        "RR ou OR > 1 = associação positiva (risco); < 1 = proteção; = 1 = sem associação",
        "RR 0,40 → reduz 60% (1 − RR), não 40%",
        "IC 95% que não contém o 1 = significativo a 5% (ex.: 0,30 a 0,55). Não prova causa nem elimina viés/confundimento",
        "Alfa 5% = taxa de erro tipo I do procedimento; não é a probabilidade de este resultado estar errado",
        "Incidência acumulada exige grupo fixo seguido o período inteiro; população que muda pede pessoas-tempo",
        "Surto: taxa de ataque de quem comeu ÷ quem não comeu cada alimento = RR; maior razão = veículo provável",
      ],
      pegadinhas: [
        "Ler RR 0,40 como 'reduz 40%' ou IC todo abaixo de 1 como 'não significativo'",
        "p < 0,05 = '5% de chance de ser acaso' ou 'prova a causa'",
        "Risco atribuível alto = 'doença exclusivamente causada pelo fator'",
        "Chamar de 'taxa de ataque' a comparação entre grupos (isso é o risco relativo)",
      ],
    },
    {
      id: "testes-diagnosticos",
      titulo: "Testes diagnósticos",
      questoes: 5,
      quadros: [
        {
          titulo: "Tabela 2×2 de exemplo",
          colunas: ["", "Doente", "Sadio", "Total"],
          linhas: [
            ["Teste +", "VP 90", "FP 30", "120"],
            ["Teste −", "FN 10", "VN 170", "180"],
            ["Total", "100", "200", "300"],
          ],
        },
        {
          titulo: "Onde está o denominador de cada índice",
          colunas: ["Índice", "Leitura", "Conta", "No exemplo"],
          linhas: [
            ["Sensibilidade", "Coluna dos doentes", "VP ÷ (VP + FN)", "90 ÷ 100 = 90%"],
            ["Especificidade", "Coluna dos sadios", "VN ÷ (VN + FP)", "170 ÷ 200 = 85%"],
            ["VPP", "Linha do teste positivo", "VP ÷ (VP + FP)", "90 ÷ 120 = 75%"],
            ["VPN", "Linha do teste negativo", "VN ÷ (VN + FN)", "170 ÷ 180 = 94,4%"],
            ["Prevalência", "Doentes sobre o total", "(VP + FN) ÷ total", "100 ÷ 300 = 33,3%"],
            ["Acurácia", "Acertos sobre o total", "(VP + VN) ÷ total", "260 ÷ 300 = 86,7%"],
          ],
        },
        {
          titulo: "O que muda quando o teste muda (mesma prevalência)",
          colunas: ["Mudança", "Efeito", "Leitura"],
          linhas: [
            ["Mais sensível (especificidade igual)", "Menos falsos negativos → VPN maior", "Negativo ajuda a afastar"],
            ["Menos específico (sensibilidade igual)", "Mais falsos positivos → VPP menor", "Positivo perde peso"],
            ["Muito específico", "Poucos falsos positivos", "Positivo ajuda a confirmar"],
            ["Teste I (93%/95%) no lugar do II (83%/100%)", "VPN maior e mais falsos positivos", "—"],
          ],
        },
      ],
      oQueCai: [
        "Sensibilidade = VP ÷ (VP + FN); especificidade = VN ÷ (VN + FP): leitura pela doença (coluna)",
        "VPP = VP ÷ (VP + FP); VPN = VN ÷ (VN + FN): leitura pelo resultado (linha)",
        "Prevalência = (VP + FN) ÷ total: (231 + 79) ÷ 687 = 45%. Acurácia = (VP + VN) ÷ total (muda com a prevalência)",
        "VP 5.600, FN 1.400, FP 780, VN 2.220 → sens 80%, espec 74%, VPP 87,8%, VPN 61,3%",
        "Resultado modifica a probabilidade pré-teste: suspeita muito alta, negativo do sensível pode não afastar",
        "Probabilidade clássica = favoráveis ÷ possíveis (só se equiprováveis), 0 a 1; risco = probabilidade de adoecer no período",
      ],
      pegadinhas: [
        "Na prevalência: 34% (VP ÷ total) e 67% (acurácia) são distratores",
        "Pares invertidos: positivo do sensível, negativo do específico",
        "Trocar 'mais falsos positivos' por 'mais falsos negativos'",
        "Taxa, coeficiente e risco como sinônimos; taxa leva tempo no denominador",
      ],
    },
    {
      id: "promocao-saude",
      titulo: "Promoção da saúde",
      questoes: 4,
      quadros: [
        {
          titulo: "Carta de Ottawa (1986) × Relatório Lalonde (1974)",
          colunas: ["", "Ottawa: 5 campos de ação", "Lalonde: 4 componentes"],
          linhas: [
            ["1", "Políticas públicas saudáveis: saúde na agenda de todos os setores", "Biologia humana"],
            ["2", "Ambientes favoráveis: trabalho, moradia, lazer e natureza saudáveis", "Ambiente (peso maior nas crônicas)"],
            ["3", "Ação comunitária: comunidade participa e decide", "Estilo de vida (peso maior nas crônicas)"],
            ["4", "Habilidades pessoais: educação em saúde, autonomia", "Organização dos serviços (menor impacto)"],
            ["5", "Reorientação dos serviços: além da clínica e da cura", "—"],
          ],
        },
      ],
      oQueCai: [
        "Promoção da saúde (Ottawa) = capacitar a comunidade para melhorar qualidade de vida e saúde",
        "Lalonde (Canadá, 1974): dinheiro ia quase todo para a assistência, componente de menor impacto",
        "Crônicas: melhorar estilo de vida e reduzir fatores de risco (tabaco, álcool, sedentarismo, alimentação)",
        "Intersetorialidade = saúde + educação + trabalho + outros setores sobre os determinantes sociais",
      ],
      pegadinhas: [
        "Reorientar serviços = priorizar alta complexidade (é ir além da cura)",
        "Habilidades pessoais focando 'exclusivamente' comportamento individual; ação comunitária como distribuição passiva",
        "Lalonde: apontar genética, serviços médicos ou saneamento 'exclusivo' como principal",
        "Promoção 'só em hospitais', 'exclusivamente tratamento' ou remédio para todos",
      ],
    },
    {
      id: "saude-trabalhador",
      titulo: "Saúde do trabalhador",
      questoes: 3,
      quadros: [
        {
          titulo: "Classificação de Schilling (só 3 grupos)",
          colunas: ["Grupo", "Papel do trabalho", "Exemplos"],
          linhas: [
            ["I", "Causa necessária", "Silicose, intoxicação por chumbo"],
            ["II", "Fator contributivo, não necessário", "Hipertensão, doenças osteomusculares, varizes"],
            ["III", "Desencadeia ou agrava doença latente ou existente", "Asma, dermatite de contato, transtornos mentais"],
          ],
        },
      ],
      oQueCai: [
        "Epicondilite lateral = extensores do punho (lixar, polir); medial = flexores e pronadores",
        "Túnel do carpo = nervo mediano: formigamento do 1º ao 3º dedo e metade do 4º, perda de força de preensão. Só 5º dedo = ulnar",
        "Lixamento/polimento + dor no epicôndilo + formigamento 3º e 4º dedos = túnel do carpo + epicondilite lateral",
        "NR-32: proibido reencapar e desconectar agulha com a mão, sem exceção na urgência; dispositivo de segurança",
        "Descarte em recipiente rígido perto de onde se gera; quem usou descarta. Vacina gratuita: tétano, difteria, hepatite B; recusa documentada",
      ],
      pegadinhas: [
        "Lateral × medial e túnel do carpo × tendinite/bursite: decida as duas metades separadamente",
        "Reencapar 'com uma mão só' na urgência",
        "Vacina/imunidade para hepatite B como 'facultativa'",
        "'Grupo IV' de Schilling não existe",
      ],
    },
    {
      id: "declaracao-obito",
      titulo: "Declaração de Óbito",
      questoes: 2,
      quadros: [
        {
          titulo: "Quem emite a Declaração de Óbito",
          colunas: ["Situação", "Quem emite"],
          linhas: [
            ["Natural, com assistência", "Médico assistente ou substituto (plantonista)"],
            ["Natural, sem assistência, com SVO", "Médico do SVO"],
            ["Natural, sem assistência, sem SVO", "Médico do serviço público mais próximo; na falta, qualquer médico"],
            ["Causa externa ou suspeita, com IML", "Médico do IML (legista), qualquer que seja o tempo até a morte"],
            ["Causa externa, sem IML na localidade", "Qualquer médico da localidade ou perito eventual (ad hoc) designado"],
            ["Óbito fetal", "Emitir se ≥ 20 semanas, ou ≥ 500 g, ou ≥ 25 cm"],
          ],
        },
      ],
      oQueCai: [
        "Só médico preenche. Vias: 1ª branca → Secretaria; 2ª amarela → família/cartório; 3ª rosa → fica na unidade",
        "2ª via é da família sempre. Natural fora de estabelecimento com assistência: 1ª e 3ª à Secretaria; SVO/IML: 3ª fica no serviço",
        "Queda → fratura → pneumonia → óbito: causa básica = queda = externa = IML",
        "Parte I: linha a = causa imediata; última linha preenchida = causa básica (entra na estatística). Parte II: contribuintes",
        "Exame alterado (bilirrubina) e modo de morrer (parada cardíaca) não são causa",
        "Câncer de fígado → insuficiência renal → óbito: básica = câncer; imediata = insuficiência renal",
      ],
      pegadinhas: [
        "Cartório como 'primeira via'; 'qualquer profissional de saúde' preenche",
        "Médico assistente assina pneumonia após queda porque 'a causa terminal não foi externa'",
        "Inverter básica e imediata; achado de laboratório ou doença não citada como intermediária",
      ],
    },
    {
      id: "financiamento-aps",
      titulo: "Financiamento e avaliação da APS",
      questoes: 1,
      quadros: [
        {
          titulo: "Previne Brasil × modelo de 2024",
          colunas: ["", "Previne Brasil (2019, revogado)", "Modelo de 2024 (vigente)"],
          linhas: [
            ["Base", "Capitação ponderada por cadastro", "Componente fixo por equipe + per capita populacional"],
            ["Vínculo", "Cadastro", "Vínculo e acompanhamento territorial"],
            ["Resultado", "Pagamento por desempenho (7 indicadores)", "Componente de qualidade"],
            ["Outros", "Ações estratégicas", "Programas, serviços e equipes; saúde bucal"],
          ],
        },
      ],
      oQueCai: [
        "ICSAP: internação que APS oportuna e efetiva poderia evitar; taxa alta sugere falha de acesso ou efetividade",
        "É indicador indireto de resultado: sozinho não prova APS fraca. Confundidores: leitos, perfil etário/socioeconômico, carga, registro",
        "Exemplos: asma, diabetes e hipertensão descompensados, gastroenterite, infecção urinária, doenças evitáveis por vacina",
        "Previne, 7 indicadores: pré-natal, citopatológico, vacina, hipertensão, diabetes",
        "Modelo atual: Portaria GM/MS 3.493/2024, seis componentes; Previne substituído em 2024",
      ],
      pegadinhas: [
        "Saúde da mulher medindo vacina de criança; saúde da criança medindo mortalidade materna",
        "Pré-natal 'por especialista'",
      ],
    },
  ],
  regrasRelampago: [
    { tema: "Abordagem familiar", titulo: "Crise normativa × paranormativa", texto: "Normativa = mudança esperada do ciclo de vida (ninho vazio = saída dos filhos). Paranormativa = evento inesperado (morte precoce, desemprego, doença grave). Morte de filho não é ninho vazio." },
    { tema: "Abordagem familiar", titulo: "Ecomapa × genograma", texto: "Genograma = estrutura interna (homem = quadrado; mulher = círculo). Ecomapa = ligações com o meio/rede de apoio: linhas = força do vínculo, setas = fluxo de energia; é dinâmico." },
    { tema: "Determinantes sociais", texto: "Modelo de Dahlgren e Whitehead, de dentro para fora: idade/sexo/genética → estilo de vida → redes sociais → condições de vida e trabalho → camada mais externa: condições socioeconômicas, culturais e ambientais gerais." },
    { tema: "Profilaxia antirrábica", texto: "Cão/gato sadio e observável: lavar e observar 10 dias, sem vacina nem soro, mesmo em acidente grave. Grave com animal não observável/doente ou morcego: 4 doses (0, 3, 7, 14) + soro." },
    { tema: "Tuberculose", titulo: "Ações de controle e TDO", texto: "TDO para todo caso (novo ou retratamento): ideal nos 5 dias úteis, mínimo 3 vezes por semana. Sintomático respiratório = tosse ≥ 3 semanas. PAL para maiores de 5 anos." },
    { tema: "Animais peçonhentos", titulo: "Primeiros socorros ofídicos", texto: "Fazer: repouso, água e sabão, membro elevado, levar ao serviço com soro. Não fazer: torniquete, corte, sucção, álcool, querosene ou qualquer substância no local." },
    { tema: "Avaliação de tecnologias", titulo: "Custo-efetividade", texto: "Custo-efetividade compara custo com resultado em saúde (mortes evitadas, anos de vida ganhos) para usar melhor o recurso. Não mede lucro nem satisfação. Custo-utilidade = resultado em QALY." },
    { tema: "Dengue", titulo: "Agente, vetor e prova do laço", texto: "Prova do laço positiva (≥ 20 petéquias adulto, ≥ 10 criança) não é alarme → grupo B. Grupo C: 10 mL/kg SF na 1ª hora. Grupo D: 20 mL/kg em até 20 minutos, até 3 vezes." },
    { tema: "Educação em saúde", titulo: "Permanente × continuada", texto: "Permanente: parte dos problemas reais do trabalho; a equipe discute e muda a prática. Continuada: curso/aula, transmissão vertical, atualização e certificado individual." },
    { tema: "Leishmaniose", titulo: "Tegumentar: vetor e confirmação", texto: "Úlcera indolor com borda 'em moldura'; confirmar com exame parasitológico. Vetor: Lutzomyia (mosquito-palha), não Culex. Mais em homens > 10 anos; não deixa imunidade protetora permanente." },
    { tema: "Leptospirose", titulo: "Quadro pós-enchente", texto: "Agente: bactéria (espiroqueta Leptospira), não vírus. Grave: icterícia rubínica + lesão renal + hemorragia pulmonar. Notificação compulsória; suporte e antibiótico cedo, sem esperar confirmação." },
    { tema: "Medicina baseada em evidências", texto: "Tripé: melhor evidência + experiência clínica + valores do paciente. Evidência sozinha não basta; não promete desfecho melhor a custo maior (mais efetividade com uso racional de recursos)." },
    { tema: "Planejamento em saúde", titulo: "4 momentos do PES (Matus)", texto: "Explicativo (o que é) → Normativo (o que deve ser: imagem-objetivo) → Estratégico (o que pode ser: viabilidade política) → Tático-operacional (fazer e monitorar). Momentos se misturam." },
    { tema: "Saúde mental no SUS", titulo: "O que diferencia o CAPS III", texto: "CAPS III: 24 horas, todos os dias, com acolhimento noturno para crise. CAPS I e II: de dia, dias úteis. Álcool e drogas = CAPS AD (AD III 24 h); criança = CAPS i. Nunca dentro de hospital." },
    { tema: "Vieses e confundimento", titulo: "Desenho × análise", texto: "No desenho: restrição, pareamento, randomização. Na análise: estratificação e análise multivariada (regressão)." },
    { tema: "Ética e cuidados paliativos", titulo: "Termos de fim de vida", texto: "Eutanásia = provocar a morte (proibida). Distanásia = obstinação terapêutica. Ortotanásia = tempo natural, com conforto (conduta ética). Mistanásia = morte miserável, evitável, injusta." },
  ],
};
