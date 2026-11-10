import { atencao, avaliar, cenario, conduta, decisao, ramo, type Tema } from "./tipos.ts";

/* Dengue conforme o Ministério da Saúde: "Dengue: diagnóstico e manejo
   clínico – adulto e criança", 6ª edição, 2024 (versão vigente). O texto
   segue o manual e o fluxograma oficial (Figura 2); números, critérios e
   doses foram conferidos com o documento. Ao sair nova edição, revisar
   tudo aqui antes de mudar qualquer valor. */
export const DENGUE: Tema = {
  id: "dengue",
  titulo: "Dengue: manejo clínico (Ministério da Saúde)",
  fonte: {
    titulo: "Ministério da Saúde. Dengue: diagnóstico e manejo clínico – adulto e criança. 6ª edição. Brasília, 2024.",
    url: "https://bvsms.saude.gov.br/bvs/publicacoes/dengue_diagnostico_manejo_clinico_6ed.pdf",
    nota: "Transcrição do fluxograma e das condutas do manual vigente. Confira o protocolo local e a nota técnica mais recente durante epidemias.",
  },
  calculadoras: [
    { id: "dengue-classificacao", nome: "Classificar e estadiar (A a D)", descricao: "Marque os achados: grupo, conduta e volumes de hidratação pelo peso." },
    { id: "prova-do-laco", nome: "Prova do laço", descricao: "Pressão do manguito, tempo e leitura pelo número de petéquias." },
    { id: "dengue-alta", nome: "Critérios de alta", descricao: "Marque os cinco critérios do MS antes da alta." },
  ],
  revisar: [
    "Notificar todo caso suspeito de dengue.",
    "A hidratação começa logo após a classificação, enquanto o paciente aguarda exames: oral nos grupos A e B, venosa nos grupos C e D.",
    "Grupos C e D: iniciar a reposição venosa em qualquer ponto de atenção, inclusive durante a transferência, mesmo sem exames complementares.",
    "Os sinais de alarme surgem na fase crítica, que começa com a queda da febre (entre o 3º e o 7º dia): reavaliar no dia em que a febre melhora.",
    "O paciente pode mudar de grupo em pouco tempo: reestadiar a cada reavaliação, com história e exame físico completos.",
  ],
  algoritmos: [
    {
      titulo: "Fluxograma do manejo clínico de dengue (Figura 2 do MS)",
      passos: [
        cenario(
          "Suspeita de dengue: febre, usualmente de 2 a 7 dias, e duas ou mais destas manifestações: náusea, vômitos; exantema; mialgia, artralgia; cefaleia, dor retro-orbital; petéquias; prova do laço positiva e leucopenia. Também é caso suspeito toda criança com quadro febril agudo, usualmente de 2 a 7 dias, sem foco de infecção aparente"
        ),
        conduta("Notificar todo caso suspeito de dengue"),
        decisao(
          "Tem sinal de alarme ou de gravidade?",
          ramo(
            "Não",
            avaliar("Pesquisar sangramento espontâneo de pele ou induzido (prova do laço), condição clínica especial, risco social ou comorbidades"),
            decisao(
              "Algum presente?",
              ramo(
                "Não: Grupo A (azul)",
                conduta("Dengue sem sinais de alarme, sem condição especial, sem risco social e sem comorbidades"),
                conduta("Hidratação oral; acompanhamento ambulatorial; exames complementares a critério médico")
              ),
              ramo(
                "Sim: Grupo B (verde)",
                conduta("Dengue sem sinais de alarme, com sangramento de pele (espontâneo ou induzido), condição especial, risco social ou comorbidades"),
                conduta("Hidratação oral; leito de observação até o resultado de exames e reavaliação clínica; hemograma completo obrigatório")
              )
            )
          ),
          ramo(
            "Sim",
            decisao(
              "Há sinais de gravidade (choque, sangramento grave ou comprometimento grave de órgãos)?",
              ramo(
                "Não, só sinais de alarme: Grupo C (amarelo)",
                conduta("Reposição volêmica imediata: 10 mL/kg de soro fisiológico 0,9% na 1ª hora"),
                conduta("Leito de internação até estabilização, mínimo de 48 h")
              ),
              ramo(
                "Sim, dengue grave: Grupo D (vermelho)",
                conduta("Expansão rápida: soro fisiológico 0,9% 20 mL/kg em até 20 minutos, até 3 vezes"),
                conduta("Leito de UTI até estabilização, mínimo de 48 h")
              )
            )
          )
        ),
        atencao("Condições especiais, risco social ou comorbidades: lactentes (< 24 meses), gestantes, adultos > 65 anos, hipertensão arterial ou outras doenças cardiovasculares graves, diabetes mellitus, DPOC, asma, obesidade, doenças hematológicas crônicas, doença renal crônica, doença ácido-péptica, hepatopatias e doenças autoimunes"),
      ],
    },
    {
      titulo: "Grupo A: sem sinais de alarme, sem condição especial",
      passos: [
        cenario("Caso suspeito, sem sinais de alarme, sem comorbidades, grupo de risco ou condições clínicas especiais"),
        conduta("Exames laboratoriais complementares a critério médico"),
        conduta("Hidratação oral (ver quadro): adulto 60 mL/kg/dia, 1/3 com sais de reidratação oral e volume maior no início; criança conforme o peso"),
        conduta("Paracetamol e/ou dipirona (ver quadro de medicamentos)"),
        atencao("Não utilizar salicilatos, anti-inflamatórios não esteroides nem corticosteroides"),
        conduta("Orientar repouso, dieta e hidratação; não se automedicar"),
        atencao("Procurar imediatamente o serviço de urgência em caso de sangramento ou sinal de alarme"),
        conduta("Retorno para reavaliação clínica no dia de melhora da febre (possível início da fase crítica); se não houver defervescência, retornar no 5º dia da doença"),
        conduta("Preencher e entregar o cartão de acompanhamento; orientar eliminação de criadouros do Aedes aegypti e uso de repelente durante a viremia"),
        conduta("Exames específicos de confirmação não são necessários para a conduta; notificar se for a primeira unidade a atender"),
      ],
    },
    {
      titulo: "Grupo B: sangramento de pele, condição especial, risco social ou comorbidade",
      passos: [
        cenario("Caso suspeito, sem sinais de alarme, com sangramento espontâneo de pele ou induzido (prova do laço), ou com condição clínica especial, risco social ou comorbidades"),
        conduta("Hemograma completo obrigatório: colher no atendimento e liberar o resultado em até 2 horas (no máximo 4 horas); avaliar hemoconcentração"),
        conduta("Comorbidade de difícil controle ou descompensada: exames específicos conforme a situação clínica"),
        conduta("Manter em observação até o resultado; hidratação oral como no Grupo A; paracetamol ou dipirona"),
        decisao(
          "Reavaliação clínica e resultado dos exames",
          ramo("Hemoconcentração ou surgimento de sinal de alarme", conduta("Conduzir como Grupo C")),
          ramo(
            "Hematócrito normal",
            conduta("Tratamento ambulatorial com reavaliação clínica e laboratorial diária até 48 h após a queda da febre, ou imediata se surgir sinal de alarme"),
            conduta("Repouso; não se automedicar; procurar a urgência se sangramento ou sinal de alarme; cartão de acompanhamento, criadouros e repelente")
          )
        ),
      ],
    },
    {
      titulo: "Grupo C: sinais de alarme presentes, sinais de gravidade ausentes",
      passos: [
        cenario(
          "Algum sinal de alarme: dor abdominal intensa (referida ou à palpação) e contínua; vômitos persistentes; acúmulo de líquidos (ascite, derrame pleural, derrame pericárdico); hipotensão postural e/ou lipotimia; hepatomegalia > 2 cm abaixo do rebordo costal; sangramento de mucosa; letargia e/ou irritabilidade; aumento progressivo do hematócrito"
        ),
        conduta("Reposição volêmica imediata em qualquer ponto de atenção, inclusive durante a transferência e mesmo sem exames: 10 mL/kg de soro fisiológico 0,9% na 1ª hora"),
        conduta("Exames obrigatórios: hemograma completo, albumina sérica e transaminases. Imagem: radiografia de tórax (PA, perfil e Hjelm-Laurell) e ultrassonografia de abdome, mais sensível para derrames"),
        conduta("Outros conforme a necessidade: glicemia, ureia, creatinina, eletrólitos, gasometria, TPAE e ecocardiograma"),
        avaliar("Reavaliação clínica após a 1ª hora: sinais vitais, PA e diurese (desejável 1 mL/kg/h)"),
        conduta("Manter 10 mL/kg/h na 2ª hora até o hematócrito, colhido 2 horas após a etapa de reposição. Máximo de 20 mL/kg em 2 horas por fase de expansão"),
        decisao(
          "Melhora clínica e do hematócrito?",
          ramo(
            "Sim",
            conduta("Fase de manutenção: 1ª fase 25 mL/kg em 6 horas; se houver melhora, 2ª fase 25 mL/kg em 8 horas com soro fisiológico"),
            conduta("Internação até estabilização e critérios de alta, mínimo de 48 h; depois, retorno como no Grupo B")
          ),
          ramo(
            "Não",
            conduta("Repetir a fase de expansão até 3 vezes: reavaliação clínica após 1 hora e hematócrito 2 horas após cada etapa"),
            atencao("Sem melhora clínica e laboratorial: conduzir como Grupo D")
          )
        ),
        atencao("Idosos: maior risco de choque e também de sobrecarga hídrica. Acompanhar a hidratação buscando edema pulmonar (crepitações)"),
        conduta("Avaliação contínua, inclusive pela enfermagem; sinal de agravamento ou choque exige reavaliação médica imediata"),
        conduta("Exames de confirmação são obrigatórios, mas não essenciais para a conduta: até o 5º dia, NS1, RT-PCR ou isolamento viral; a partir do 6º dia, sorologia"),
      ],
    },
    {
      titulo: "Grupo D: dengue grave",
      passos: [
        cenario(
          "Sinais de choque (taquicardia; extremidades distais frias; pulso fraco e filiforme; enchimento capilar > 2 segundos; PA convergente < 20 mmHg; taquipneia; oligúria < 1,5 mL/kg/h; hipotensão e cianose na fase tardia), sangramento grave ou disfunção grave de órgãos"
        ),
        conduta("Expansão rápida parenteral imediata, em qualquer nível de complexidade e durante a transferência, mesmo sem exames: soro fisiológico 0,9% 20 mL/kg em até 20 minutos; repetir até 3 vezes conforme avaliação clínica"),
        conduta("Oxigênio em todas as situações de choque; monitoramento contínuo; leito de UTI até estabilização (mínimo de 48 h), depois leito de internação"),
        avaliar("Reavaliação clínica a cada 15 a 30 minutos e hematócrito a cada 2 horas"),
        conduta("Exames obrigatórios: hemograma completo, albumina sérica e transaminases; radiografia de tórax e ultrassonografia de abdome; outros conforme a necessidade"),
        decisao(
          "Resposta à expansão",
          ramo("Melhora clínica e laboratorial", conduta("Retornar para a fase de expansão do Grupo C e seguir a conduta do Grupo C")),
          ramo(
            "Choque persistente com hematócrito em ascensão",
            conduta("Expansor plasmático: albumina 0,5 a 1 g/kg em solução a 5% (para cada 100 mL: 25 mL de albumina 20% + 75 mL de soro fisiológico 0,9%). Na falta, coloide sintético 10 mL/kg/hora")
          ),
          ramo(
            "Choque persistente com hematócrito em queda",
            avaliar("Investigar hemorragia e avaliar a coagulação"),
            conduta("Hemorragia: concentrado de hemácias 10 a 15 mL/kg/dia"),
            conduta("Coagulopatia: avaliar plasma fresco 10 mL/kg, vitamina K endovenosa e crioprecipitado (1 U para cada 5 a 10 kg)"),
            conduta("Plaquetas apenas se sangramento persistente não controlado após corrigir coagulação e choque, ou trombocitopenia com INR > 1,5 vez o normal")
          ),
          ramo(
            "Hematócrito em queda, choque resolvido, sem sangramento, mas com outros sinais de gravidade",
            avaliar("Sinais de desconforto respiratório ou de insuficiência cardíaca congestiva: investigar hiper-hidratação"),
            conduta("Reduzir a infusão de líquidos; diurético e inotrópico quando necessário")
          )
        ),
        atencao("Interromper ou reduzir a infusão à velocidade mínima se: término do extravasamento; normalização da PA, do pulso e da perfusão; hematócrito em queda sem sangramento; diurese normalizada; resolução dos sintomas abdominais"),
        atencao("Idosos: maior risco de sobrecarga hídrica. Buscar crepitações durante a hidratação"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Classificação de risco e estadiamento",
      colunas: ["Grupo", "Cor e prioridade", "Quem é", "Hidratação", "Onde acompanhar"],
      linhas: [
        ["A", "Azul: por ordem de chegada", "Sem sinais de alarme, sem condição especial, risco social ou comorbidade", "Oral", "Ambulatorial"],
        ["B", "Verde: prioridade não urgente", "Sem sinais de alarme, com sangramento de pele (espontâneo ou prova do laço), condição especial, risco social ou comorbidade", "Oral", "Leito de observação até resultado de exames e reavaliação"],
        ["C", "Amarelo: urgência, o mais rápido possível", "Algum sinal de alarme, sem sinais de gravidade", "Venosa: 10 mL/kg de SF 0,9% na 1ª hora", "Leito de internação, mínimo de 48 h"],
        ["D", "Vermelho: emergência, atendimento imediato", "Choque, sangramento grave ou disfunção grave de órgãos", "Venosa: 20 mL/kg de SF 0,9% em até 20 minutos", "Leito de UTI, mínimo de 48 h"],
      ],
    },
    {
      titulo: "Sinais de alarme e de dengue grave",
      colunas: ["Situação", "O que procurar"],
      linhas: [
        ["Sinais de alarme (Grupo C)", "Dor abdominal intensa (referida ou à palpação) e contínua; vômitos persistentes; acúmulo de líquidos (ascite, derrame pleural, derrame pericárdico); hipotensão postural ou lipotimia; hepatomegalia > 2 cm abaixo do rebordo costal; sangramento de mucosa; letargia e/ou irritabilidade; aumento progressivo do hematócrito"],
        ["Sinais de choque (Grupo D)", "Taquicardia; extremidades distais frias; pulso fraco e filiforme; enchimento capilar > 2 segundos; PA convergente (< 20 mmHg); taquipneia; oligúria (< 1,5 mL/kg/h); hipotensão arterial e cianose (fase tardia do choque); acúmulo de líquidos com insuficiência respiratória"],
        ["Sangramento grave (Grupo D)", "Segundo avaliação médica: hematêmese, melena, metrorragia volumosa, sangramento do sistema nervoso central"],
        ["Disfunção grave de órgãos (Grupo D)", "Fígado (AST/ALT > 1.000), sistema nervoso central (alteração da consciência), coração (miocardite) e outros órgãos"],
        ["Hipotensão", "PAS < 90 mmHg ou PAM < 70 mmHg no adulto; queda da PAS > 40 mmHg ou < 2 desvios-padrão para a idade; pressão de pulso ≤ 20 mmHg. Criança até 10 anos: PAS < 70 + (idade × 2) mmHg"],
      ],
    },
    {
      titulo: "Avaliação hemodinâmica: sequência de alterações",
      colunas: ["Parâmetro", "Choque ausente", "Choque compensado (fase inicial)", "Choque com hipotensão (fase tardia)"],
      linhas: [
        ["Consciência", "Claro e lúcido", "Claro e lúcido (se o paciente não for tocado, o choque pode não ser detectado)", "Alteração do estado mental (agitação, agressividade)"],
        ["Enchimento capilar", "Normal (≤ 2 segundos)", "Prolongado (3 a 5 segundos)", "Muito prolongado (> 5 segundos), pele mosqueada"],
        ["Extremidades", "Temperatura normal e rosadas", "Frias", "Muito frias e úmidas, pálidas ou cianóticas"],
        ["Pulso periférico", "Normal", "Fraco e filiforme", "Tênue ou ausente"],
        ["Ritmo cardíaco", "Normal para a idade", "Taquicardia", "Taquicardia no início e bradicardia no choque tardio"],
        ["Pressão arterial", "Normal para a idade", "PAS normal, mas PAD crescente", "Hipotensão"],
        ["PAM e pressão de pulso (adulto)", "Normal para a idade", "Redução da pressão de pulso (≤ 20 mmHg), hipotensão postural", "Pressão de pulso < 10 mmHg; pressão não detectável"],
        ["Frequência respiratória", "Normal para a idade", "Taquipneia", "Acidose metabólica, polipneia ou respiração de Kussmaul"],
      ],
    },
    {
      titulo: "Hidratação oral (grupos A e B)",
      colunas: ["Quem", "Volume", "Como oferecer"],
      linhas: [
        ["Adulto", "60 mL/kg/dia", "1/3 com sais de reidratação oral e volume maior no início; 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco). Ex.: 70 kg = 4,2 L/dia, com 1,4 L nas primeiras 4 a 6 horas"],
        ["Criança até 10 kg", "130 mL/kg/dia", "1/3 com SRO e 2/3 com água, sucos e chás; 1/3 do volume nas primeiras 4 a 6 horas"],
        ["Criança > 10 a 20 kg", "100 mL/kg/dia", "Igual (regra de Holliday-Segar + 3% de perdas)"],
        ["Criança > 20 kg (< 13 anos)", "80 mL/kg/dia", "Igual"],
        ["Todos", "Durante toda a febre e até 24 a 48 horas após a defervescência", "Começar já na sala de espera; escrever o volume na receita ou no cartão; não interromper a alimentação; manter e estimular a amamentação"],
      ],
    },
    {
      titulo: "Hidratação venosa: Grupo C × Grupo D",
      colunas: ["Etapa", "Grupo C", "Grupo D"],
      linhas: [
        ["Expansão", "SF 0,9% 10 mL/kg na 1ª hora; 10 mL/kg/h na 2ª hora até o hematócrito (máximo 20 mL/kg em 2 horas por fase)", "SF 0,9% 20 mL/kg em até 20 minutos"],
        ["Repetir", "Até 3 vezes", "Até 3 vezes"],
        ["Reavaliação", "Clínica após 1 hora (sinais vitais, PA, diurese desejável 1 mL/kg/h); hematócrito 2 horas após cada etapa", "Clínica a cada 15 a 30 minutos; hematócrito a cada 2 horas"],
        ["Se melhora", "Manutenção: 25 mL/kg em 6 horas e depois 25 mL/kg em 8 horas", "Voltar à fase de expansão do Grupo C"],
        ["Se não melhora", "Conduzir como Grupo D", "Hematócrito subindo: albumina ou coloide; caindo: investigar sangramento e coagulação"],
        ["Local", "Leito de internação, mínimo de 48 h", "Leito de UTI, mínimo de 48 h"],
      ],
    },
    {
      titulo: "Medicamentos (sintomáticos)",
      colunas: ["Medicamento", "Adulto", "Criança"],
      linhas: [
        ["Dipirona", "20 gotas ou 1 comprimido (500 mg) até de 6/6 horas", "10 mg/kg/dose até de 6/6 horas, respeitando a dose máxima por peso e idade. Gotas 500 mg/mL (1 mL = 20 gotas); solução oral 50 mg/mL"],
        ["Paracetamol", "40 gotas ou 1 comprimido (500 mg) de 4/4 horas, ou 60 gotas ou 2 comprimidos até de 6/6 horas; não exceder 4 g em 24 horas", "10 mg/kg/dose até de 6/6 horas; doses maiores são hepatotóxicas. Gotas 200 mg/mL (1 mL = 20 gotas)"],
        ["Não usar", "Salicilatos (AAS), anti-inflamatórios não esteroides e corticosteroides", "Os mesmos"],
      ],
    },
    {
      titulo: "Exames",
      colunas: ["Exame", "Quando", "Observação"],
      linhas: [
        ["Hemograma completo", "Obrigatório nos grupos B, C e D; a critério médico no Grupo A", "No Grupo B, resultado em até 2 horas (no máximo 4 horas)"],
        ["Albumina e transaminases", "Obrigatórios nos grupos C e D", "Extravasamento plasmático e dano hepático"],
        ["Radiografia de tórax e USG de abdome", "Recomendados nos grupos C e D", "Tórax em PA, perfil e Hjelm-Laurell; a USG é mais sensível para derrames cavitários"],
        ["NS1, RT-PCR ou isolamento viral", "Até o 5º dia de sintomas", "Confirmação: obrigatória em C e D, mas não essencial para a conduta"],
        ["Sorologia IgM (ELISA)", "A partir do 6º dia de sintomas", "Reação cruzada com Zika pode dar resultado inconclusivo"],
        ["Amostra", "5 mL (criança) ou 10 mL (adulto) de sangue total sem anticoagulante", "Até o 5º dia: −70 °C; a partir do 6º dia: −20 °C"],
      ],
    },
    {
      titulo: "Internação e alta hospitalar",
      colunas: ["Critério", "Quando"],
      linhas: [
        ["Internar", "Sinais de alarme ou de choque, sangramento grave ou comprometimento grave de órgão (grupos C e D); recusa de alimentos e líquidos; comprometimento respiratório (dor torácica, dificuldade respiratória, murmúrio vesicular diminuído); impossibilidade de seguimento por condição clínica ou social; comorbidade descompensada (diabetes, hipertensão, insuficiência cardíaca, uso de dicumarínico, crise asmática, anemia falciforme); outras a critério clínico"],
        ["Alta (todos os 5 critérios)", "Estabilização hemodinâmica por 48 horas; ausência de febre por 24 horas; melhora visível do quadro clínico; hematócrito normal e estável por 24 horas; plaquetas em elevação"],
        ["Depois da alta", "Retorno para reavaliação clínica e laboratorial como no Grupo B; preencher e entregar o cartão de acompanhamento"],
      ],
    },
    {
      titulo: "Antiagregantes e anticoagulantes (adulto)",
      colunas: ["Em uso", "Plaquetas > 50 mil/mm³", "Plaquetas entre 30 e 50 mil", "Plaquetas < 30 mil"],
      linhas: [
        ["AAS + clopidogrel (stent farmacológico < 6 meses ou convencional < 1 mês)", "Manter; contagem diária de plaquetas (protocolo do Grupo B)", "Manter; leito de observação e plaquetas diárias", "Suspender os dois; observação com plaquetas diárias; retomar quando > 50 mil"],
        ["Só AAS (stent farmacológico > 6 meses, convencional > 1 mês ou profilaxia secundária coronária ou cerebrovascular)", "Manter; plaquetas diárias (protocolo do Grupo B)", "Manter; leito de observação e plaquetas diárias", "Suspender; observação até plaquetas > 50 mil"],
        ["Varfarina", "TAP e plaquetas ambulatoriais", "Internar; trocar por heparina não fracionada quando o INR ficar < 2,0", "Suspender; internar com TAP e plaquetas diários; não reverter, exceto se sangramento"],
        ["Dabigatrana, rivaroxabana, apixabana, edoxabana (se a suspensão não for opção)", "Manter (≥ 50 mil)", "Internar e trocar por heparina não fracionada 24 horas após a última dose", "Igual à coluna anterior"],
        ["Sangramento moderado ou grave", "Suspender antiagregantes e anticoagulantes", "DAPT: plaquetas 1 unidade para cada 10 kg", "Varfarina com sangramento grave: plasma fresco 15 mL/kg (até INR < 1,5) e vitamina K 10 mg VO ou EV"],
      ],
    },
    {
      titulo: "Cardiopata com insuficiência cardíaca",
      colunas: ["Situação", "Conduta"],
      linhas: [
        ["Classe funcional I (NYHA)", "Hidratar como descrito para o grupo"],
        ["Classe II", "SF 0,9% ou Ringer 15 mL/kg, idealmente em 30 minutos, até 3 vezes, sob rigorosa observação"],
        ["Classe III", "SF 0,9% ou Ringer 10 mL/kg, idealmente em 30 minutos, até 3 vezes, sob rigorosa observação"],
        ["Classe IV", "UTI, manejo como paciente crítico"],
        ["Manutenção", "15 a 25 mL/kg de SF 0,9% ou Ringer a cada 12 horas, após melhora da diurese e da PA, atento à congestão pulmonar"],
        ["Aminas vasoativas", "Hipotensão com congestão, hipoperfusão com PAS < 100 mmHg ou oligúria com hipotensão e congestão: dopamina 10 a 20, dobutamina 2,5 a 20, adrenalina 0,01 a 0,3 ou noradrenalina 0,01 a 0,5 mcg/kg/min. Meta: diurese normal e PAS > 100 mmHg"],
        ["Monitorar", "PA a cada 1 a 4 horas (hipotensão: PAS < 100 mmHg), perfusão periférica, congestão pulmonar e débito urinário (≥ 0,5 mL/kg/h)"],
      ],
    },
    {
      titulo: "Distúrbios eletrolíticos, metabólicos e inotrópicos",
      colunas: ["Situação", "Conduta"],
      linhas: [
        ["Hiponatremia", "Corrigir após tratar a desidratação ou o choque, se Na < 120 mEq/L ou sintomas neurológicos: (130 − Na atual) × peso × 0,6 = mEq de NaCl 3% (1 mL = 0,51 mEq). 100 mL de NaCl 3% = 85 mL de água destilada + 15 mL de NaCl 20%. Velocidade 0,5 a 2 mEq/kg/dia ou 1 a 2 mL/kg/h; dosar sódio após"],
        ["Hipocalemia", "Repor EV nos casos graves com K < 2,5 mEq/L: 0,2 a 0,4 mEq/kg/h, concentração máxima de 4 mEq/100 mL"],
        ["Acidose metabólica", "Corrigir primeiro a desidratação ou o choque. Bicarbonato só se < 10 e/ou pH < 7,20: (bicarbonato desejado 15 a 22 − encontrado) × 0,4 × peso. Adulto em choque sem resposta a 2 expansões e sem gasometria: 40 mL de NaHCO3 8,4% na 3ª expansão"],
        ["Choque com disfunção miocárdica", "Dopamina 5 a 10, dobutamina 5 a 20 ou milrinona 0,5 a 0,8 mcg/kg/min. Fase de extravasamento pede volume; fase de reabsorção pede restrição hídrica"],
        ["Hemorragia e coagulação", "Investigar TAP, TTPa, plaquetas, produtos de degradação da fibrina, fibrinogênio e dímero-D. A reposição volêmica precoce previne a coagulopatia de consumo"],
      ],
    },
    {
      titulo: "Situações especiais",
      colunas: ["Quem", "O que muda"],
      linhas: [
        ["Hipertenso", "Sem alarme e PA normal: manter anti-hipertensivos (cuidado ao retirar betabloqueador e clonidina: rebote). Com alarme e hipovolemia: suspender diuréticos e vasodilatadores durante a observação. Pode chocar com PA ainda alta: queda de 40% da PA habitual pode ser hipotensão; suspender hipotensores na dengue grave"],
        ["Gestante", "Mesmo estadiamento e mesmo volume, com vigilância em qualquer grupo e cuidado com hiper-hidratação. Taquicardia, hipotensão postural e hemoconcentração aparecem mais tarde (confundidas com a gravidez). Após 20 semanas, decúbito lateral esquerdo. Diferencial: pré-eclâmpsia, HELLP e sepse. Sangramento na gestação: perguntar sobre febre nos últimos 7 dias. RCP com mais de 20 semanas: deslocar o útero para a esquerda; considerar cesárea após 4 a 5 minutos sem reversão"],
        ["Criança", "Pode ter só sintomas inespecíficos (adinamia, sonolência, recusa alimentar e de líquidos, vômitos, diarreia). Em menores de 2 anos, dor aparece como choro persistente, adinamia e irritabilidade. O agravamento costuma ser súbito e o quadro grave pode ser a primeira manifestação"],
        ["Idoso", "Grupo de maior vulnerabilidade para óbito: maior risco de choque e de sobrecarga hídrica"],
      ],
    },
    {
      titulo: "Dengue × Zika × Chikungunya",
      colunas: ["Manifestação", "Dengue", "Zika", "Chikungunya"],
      linhas: [
        ["Febre", "Alta (> 38 °C), 2 a 7 dias", "Sem febre ou baixa (≤ 38 °C), 1 a 2 dias subfebril", "Alta (> 38 °C), 2 a 3 dias"],
        ["Exantema", "Surge do 3º ao 6º dia", "Surge do 1º ao 2º dia", "Surge do 2º ao 5º dia"],
        ["Mialgia", "+++", "++", "++"],
        ["Artralgia (frequência)", "+", "++", "+++"],
        ["Artralgia (intensidade)", "Leve", "Leve a moderada", "Moderada a intensa"],
        ["Edema articular", "Raro, leve", "Frequente, leve", "Frequente, moderado a intenso"],
        ["Conjuntivite", "Rara", "50% a 90% dos casos", "30%"],
        ["Cefaleia", "+++", "++", "++"],
        ["Linfadenomegalia", "+", "+++", "++"],
        ["Discreta hemorragia", "++", "Ausente", "+"],
        ["Acometimento neurológico", "+", "+++", "++"],
        ["Leucopenia", "+++", "++", "++"],
        ["Linfopenia", "Incomum", "Incomum", "Incomum"],
        ["Trombocitopenia", "+++", "+", "++"],
      ],
    },
    {
      titulo: "Choque da dengue × choque séptico",
      colunas: ["Aspecto", "Choque na dengue", "Choque séptico"],
      linhas: [
        ["Início", "Hipovolêmico, após a defervescência", "Comprometimento hemodinâmico variável"],
        ["Consciência e temperatura", "Consciência melhor; normotermia", "Consciência comprometida; hipotermia"],
        ["Extravasamento", "Mais insidioso", "Mais rápido"],
        ["Hemodinâmica", "Resistência vascular sistêmica alta (choque frio); débito cardíaco baixo", "Resistência baixa ou alta; débito cardíaco baixo com taquicardia"],
        ["Pressão", "PA diferencial convergente < 20 mmHg (pressão de pulso estreita)", "Hipotensão com pressão de pulso ampla"],
        ["Laboratório", "Lactato muito alto; CIVD mais precoce; hematócrito alto, plaquetas e leucócitos baixos", "Lactato alto; hematócrito baixo; plaquetas e leucócitos altos"],
        ["Evolução", "Recuperação mais rápida; menos ventilação mecânica e drogas vasoativas", "Recuperação mais lenta; mais ventilação mecânica e drogas vasoativas (mortalidade semelhante)"],
      ],
    },
    {
      titulo: "Criança: parâmetros de referência",
      colunas: ["Parâmetro", "Valores"],
      linhas: [
        ["Peso aproximado", "Lactente de 3 a 12 meses: idade × 0,5 + 4,5. Criança de 1 a 8 anos: idade × 2 + 8,5"],
        ["FC acordado (bpm)", "0 a 2 meses: 85 a 205; 3 a 23 meses: 100 a 190; 2 a 10 anos: 60 a 140; > 10 anos: 60 a 100"],
        ["FR (por minuto)", "< 2 meses: até 60; 2 meses a 1 ano: até 50; 1 a 5 anos: até 40; 5 a 8 anos: até 30; adulto: 12 a 20"],
        ["PA (PAS/PAD, mmHg)", "Recém-nascido 60 a 70/20 a 60; lactente 87 a 105/53 a 66; pré-escolar 95 a 105/53 a 66; escolar 97 a 112/57 a 71"],
        ["Bolsa do manguito", "0 a 1 mês: 3 cm; 2 a 23 meses: 5 cm; 2 a 4 anos: 7 cm; 5 a 10 anos: 12 cm; > 10 anos: 18 cm"],
      ],
    },
    {
      titulo: "Prova do laço",
      colunas: ["Passo", "Como fazer"],
      linhas: [
        ["PA média", "(PAS + PAD) / 2. Ex.: 100 × 60 mmHg = 80 mmHg"],
        ["Insuflar", "Manguito no valor médio por 5 minutos (adulto) ou 3 minutos (criança)"],
        ["Contar", "Petéquias dentro de um quadrado de 2,5 cm de lado no antebraço; observar também o antebraço todo, o dorso das mãos e os dedos"],
        ["Positiva", "≥ 20 petéquias no adulto; ≥ 10 na criança"],
        ["Limites", "Frequentemente negativa na obesidade e no choque; revisão da Opas/OMS (2022) mostrou baixo valor preditivo para formas graves e para internação"],
      ],
    },
  ],
  oQueCai: [
    "Fases: febril (2 a 7 dias), crítica (começa na defervescência, entre o 3º e o 7º dia, quando surgem os sinais de alarme) e de recuperação (reabsorção do extravasado; cuidado com hiper-hidratação).",
    "O choque costuma ocorrer entre o 4º e o 5º dia (intervalo do 3º ao 7º), dura de 24 a 48 horas e pode matar em 12 a 24 horas.",
    "Grupo A retorna no dia em que a febre melhora; sem defervescência, no 5º dia. Grupo B com hematócrito normal: reavaliação diária até 48 horas após a queda da febre.",
    "Grupo C: 10 mL/kg de SF na 1ª hora. Grupo D: 20 mL/kg em até 20 minutos. Ambos repetem até 3 vezes.",
    "Manutenção do Grupo C: 25 mL/kg em 6 horas e depois 25 mL/kg em 8 horas.",
    "Alta exige os 5 critérios: 48 horas de estabilidade hemodinâmica, 24 horas sem febre, melhora visível, hematócrito normal e estável por 24 horas e plaquetas subindo.",
    "Diagnóstico: NS1, RT-PCR ou isolamento viral até o 5º dia; sorologia IgM a partir do 6º dia.",
    "Paracetamol e dipirona são os sintomáticos; AAS, anti-inflamatórios e corticoides são contraindicados.",
  ],
  pegadinhas: [
    "\"Prova do laço positiva é sinal de alarme\" (não é: sangramento de pele sem alarme coloca no Grupo B; sangramento de mucosa é que é alarme).",
    "\"Esperar o hemograma para começar a hidratar o Grupo C\" (não: a reposição começa imediatamente, em qualquer serviço e até na transferência).",
    "\"Choque com PA normal não existe\" (existe: no choque compensado a PAS é normal e a pressão de pulso converge para ≤ 20 mmHg; no hipertenso, queda de 40% da PA habitual já pode ser hipotensão).",
    "\"Plaquetopenia isolada indica transfusão de plaquetas\" (não: só com sangramento persistente após corrigir coagulação e choque, ou trombocitopenia com INR > 1,5 vez o normal).",
    "\"Derrame e edema no Grupo C são sempre excesso de soro\" (não: o extravasamento capilar causa edema e derrames; a reposição é guiada por hematócrito, diurese e sinais vitais).",
    "\"Fazer toracocentese ou paracentese para aliviar o derrame\" (evitar procedimentos invasivos desnecessários).",
  ],
};
