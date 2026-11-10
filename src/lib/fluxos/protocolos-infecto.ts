import { atencao, avaliar, cenario, conduta, decisao, ramo, type Tema } from "./tipos.ts";

/* Protocolos do Ministério da Saúde para ISTs, HIV e tuberculose. Doses e
   critérios conferidos nos documentos citados em `fonte`. Ao sair nova
   edição, revisar antes de mudar qualquer valor. */

const PCDT_IST = {
  titulo: "Ministério da Saúde. PCDT para Atenção Integral às Pessoas com Infecções Sexualmente Transmissíveis (IST). Brasília, 2022.",
  url: "https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts/2022/ist/pcdt-ist-2022_isbn-1.pdf",
};

export const SIFILIS: Tema = {
  id: "sifilis",
  titulo: "Sífilis adquirida e na gestante (PCDT IST)",
  fonte: { ...PCDT_IST, nota: "Quadros 15, 19 e seções 5.6 a 5.10 do PCDT. Sífilis congênita segue o capítulo próprio do mesmo protocolo." },
  revisar: [
    "Um único teste reagente (treponêmico ou não treponêmico) já indica tratamento imediato com penicilina benzatina em: gestantes, vítimas de violência sexual, pessoas com chance de perda de seguimento, pessoas com sinais/sintomas de sífilis primária ou secundária e pessoas sem diagnóstico prévio de sífilis.",
    "Na gestante, só a benzilpenicilina benzatina trata adequadamente. Intervalo entre doses > 7 dias na gestante (> 14 dias fora da gestação): reiniciar o esquema.",
    "Parcerias expostas nos últimos 90 dias: tratamento presuntivo com 2,4 milhões UI dose única, independentemente do estágio ou de sintomas, e testagem.",
  ],
  algoritmos: [
    {
      titulo: "Manejo da sífilis adquirida e em gestantes",
      passos: [
        cenario("Teste rápido (treponêmico) ou teste não treponêmico (VDRL, RPR) reagente, ou lesão sugestiva"),
        decisao(
          "Situação que exige tratar com um só teste reagente?",
          ramo("Sim (gestante, violência sexual, risco de perda de seguimento, sintomas, sem diagnóstico prévio)", conduta("Tratar imediatamente e colher o segundo teste no mesmo dia (idealmente o não treponêmico no 1º dia do tratamento)")),
          ramo("Não", avaliar("Completar com o teste complementar (treponêmico + não treponêmico) e checar história de tratamento prévio"))
        ),
        decisao(
          "Estadiamento",
          ramo("Recente (primária, secundária ou latente com até 1 ano)", conduta("Benzilpenicilina benzatina 2,4 milhões UI IM dose única (1,2 milhão em cada glúteo)")),
          ramo("Tardia (latente > 1 ano, duração ignorada ou terciária)", conduta("Benzilpenicilina benzatina 2,4 milhões UI IM 1x/semana por 3 semanas (total 7,2 milhões UI)")),
          ramo("Neurossífilis", conduta("Benzilpenicilina potássica/cristalina 3 a 4 milhões UI IV 4/4 h (18 a 24 milhões UI/dia) por 14 dias"))
        ),
        conduta("Tratar as parcerias, notificar e orientar sobre a reação de Jarisch-Herxheimer (febre e piora transitória das lesões nas primeiras 24 h, não é alergia)"),
        avaliar("Seguimento com teste não treponêmico trimestral (mensal na gestante), sempre no mesmo método"),
        decisao(
          "Resposta",
          ramo("Queda de 2 diluições em até 6 meses (recente) ou 12 meses (tardia), ou não reagente", conduta("Resposta adequada; manter seguimento")),
          ramo(
            "Sem queda de 2 diluições no prazo, aumento de 2 ou mais diluições, ou sinais clínicos persistentes",
            conduta("Retratar conforme o estágio; investigar neurossífilis se não houve reexposição (em PVHIV, em todo retratamento)")
          )
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Tratamento e seguimento (Quadro 15)",
      colunas: ["Estágio", "Esquema", "Alternativa (exceto gestante)", "Seguimento"],
      linhas: [
        ["Recente: primária, secundária e latente recente (até 1 ano)", "Benzilpenicilina benzatina 2,4 milhões UI IM dose única", "Doxiciclina 100 mg VO 12/12 h por 15 dias", "Não treponêmico trimestral; mensal na gestante"],
        ["Tardia: latente tardia (> 1 ano), duração ignorada e terciária", "Benzilpenicilina benzatina 2,4 milhões UI IM semanal por 3 semanas (7,2 milhões UI)", "Doxiciclina 100 mg VO 12/12 h por 30 dias", "Não treponêmico trimestral; mensal na gestante"],
        ["Neurossífilis", "Benzilpenicilina potássica/cristalina 18 a 24 milhões UI/dia IV (3 a 4 milhões 4/4 h ou infusão contínua) por 14 dias", "Ceftriaxona 2 g IV 1x/dia por 10 a 14 dias", "Líquor 6 meses após o fim do tratamento e de 6/6 meses até normalizar"],
      ],
    },
    {
      titulo: "Quando retratar",
      colunas: ["Critério", "Exemplo"],
      linhas: [
        ["Sem queda de 2 diluições em 6 meses (recente) ou 12 meses (tardia)", "1:32 que não chega a 1:8; 1:128 que não chega a 1:32"],
        ["Aumento de 2 diluições ou mais", "1:16 para 1:64; 1:4 para 1:16"],
        ["Persistência ou recorrência de sinais e sintomas", "Lesão nova, sinais neurológicos"],
      ],
    },
    {
      titulo: "Gestante",
      colunas: ["Ponto", "Recomendação"],
      linhas: [
        ["Testagem", "No mínimo na 1ª consulta, no início do 3º trimestre e na internação para o parto (e em aborto, natimorto, exposição de risco ou violência)"],
        ["Teste rápido reagente", "Considerar sífilis até prova em contrário e tratar no mesmo dia"],
        ["Esquema", "Só penicilina benzatina; intervalo entre doses > 7 dias obriga a reiniciar"],
        ["Seguimento", "Teste não treponêmico mensal até o parto"],
      ],
    },
  ],
  oQueCai: [
    "Recente = até 1 ano: 2,4 milhões UI dose única. Tardia ou ignorada: 7,2 milhões UI em 3 semanas.",
    "Neurossífilis: penicilina cristalina 18 a 24 milhões UI/dia por 14 dias.",
    "Resposta adequada: queda de 2 diluições em 6 meses (recente) ou 12 meses (tardia).",
    "Reinfecção ou falha: aumento de 2 diluições.",
    "Parceria exposta nos últimos 90 dias recebe dose única presuntiva.",
  ],
  pegadinhas: [
    "\"Esperar o segundo teste para tratar a gestante\" (não: um teste reagente basta para tratar no mesmo dia).",
    "\"Doxiciclina na gestante alérgica\" (não: na gestante, só penicilina; avaliar dessensibilização).",
    "\"Título baixo persistente após tratamento adequado é falha\" (pode ser cicatriz sorológica; falha exige os critérios de retratamento).",
    "\"Febre após a benzatina é alergia\" (é a reação de Jarisch-Herxheimer, autolimitada; não contraindica as próximas doses).",
  ],
};

export const CORRIMENTO_URETRAL: Tema = {
  id: "corrimento-uretral",
  titulo: "Corrimento uretral (PCDT IST)",
  fonte: { ...PCDT_IST, nota: "Quadro 37 (tratamento de uretrites) e capítulo de uretrites do PCDT." },
  revisar: [
    "Sem identificação do agente: tratar gonococo e clamídia juntos (ceftriaxona + azitromicina).",
    "Tratar as parcerias, oferecer testagem para HIV, sífilis e hepatites e notificar conforme a rede local.",
  ],
  algoritmos: [
    {
      titulo: "Uretrite: abordagem",
      passos: [
        cenario("Homem com corrimento uretral, disúria ou prurido uretral"),
        avaliar("Anamnese, exame da genitália; coletar material para Gram ou biologia molecular (gonococo e clamídia) quando disponível, sem atrasar o tratamento"),
        decisao(
          "Agente identificado?",
          ramo("Não identificado", conduta("Ceftriaxona 500 mg IM dose única + azitromicina 500 mg, 2 comprimidos VO dose única")),
          ramo("Gonococo (uretra, colo, reto ou faringe)", conduta("Ceftriaxona 500 mg IM dose única + azitromicina 500 mg, 2 comprimidos VO dose única")),
          ramo("Clamídia ou uretrite não gonocócica", conduta("Azitromicina 500 mg, 2 comprimidos VO dose única (alternativa: doxiciclina 100 mg 12/12 h por 7 dias)"))
        ),
        decisao(
          "Persistência após 7 dias do fim do tratamento?",
          ramo("Reexposição", conduta("Reinfecção: repetir o tratamento habitual e tratar parcerias")),
          ramo(
            "Sem reexposição",
            conduta("Falha gonocócica: ceftriaxona 500 mg IM + azitromicina 500 mg 4 comprimidos VO, dose única (alternativa: gentamicina 240 mg IM + azitromicina 2 g)"),
            conduta("Pensar em Mycoplasma genitalium (azitromicina 1 g dose única) e Trichomonas vaginalis (metronidazol 2 g dose única)")
          )
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Tratamento de uretrites (Quadro 37)",
      colunas: ["Situação", "Primeira opção", "Segunda opção"],
      linhas: [
        ["Sem agente identificado", "Ceftriaxona 500 mg IM dose única + azitromicina 1 g VO dose única", "Ceftriaxona 500 mg IM dose única + doxiciclina 100 mg 12/12 h por 7 dias"],
        ["Gonocócica não complicada", "Ceftriaxona 500 mg IM dose única + azitromicina 1 g VO dose única", "—"],
        ["Clamídia ou não gonocócica", "Azitromicina 1 g VO dose única", "Doxiciclina 100 mg 12/12 h por 7 dias"],
        ["Retratamento gonocócico", "Ceftriaxona 500 mg IM + azitromicina 2 g VO, dose única", "Gentamicina 240 mg IM + azitromicina 2 g VO, dose única"],
        ["Mycoplasma genitalium", "Azitromicina 1 g VO dose única", "—"],
        ["Tricomoníase", "Metronidazol 400 mg, 5 comprimidos VO dose única (2 g)", "Metronidazol 250 mg, 2 comprimidos 12/12 h por 7 dias"],
      ],
    },
  ],
  oQueCai: [
    "Ceftriaxona 500 mg IM + azitromicina 1 g VO, dose única, é o esquema sem agente definido.",
    "Sintomas podem levar até 7 dias após o fim do tratamento para resolver.",
    "Falha sem reexposição: azitromicina 2 g; considerar M. genitalium e tricomonas.",
  ],
  pegadinhas: [
    "\"Ceftriaxona sozinha basta para uretrite\" (não: associar azitromicina, pela coinfecção por clamídia).",
    "\"Ciprofloxacino para gonorreia\" (não: resistência alta; não é opção no PCDT).",
    "\"Tratar só o paciente\" (as parcerias devem ser tratadas).",
  ],
};

export const ULCERAS_DIP: Tema = {
  id: "ulceras-genitais-dip",
  titulo: "ISTs: úlceras genitais e DIP (PCDT IST)",
  fonte: { ...PCDT_IST, nota: "Quadros 38 (herpes), 39 (cancroide, LGV e donovanose), 40 (sífilis), 43 e 44 (DIP) do PCDT." },
  revisar: [
    "Úlcera genital sem diagnóstico definido e sem laboratório: tratar sífilis e cancroide no mesmo atendimento; se vesículas ou história de recorrência, tratar herpes.",
    "DIP: por menor que seja a suspeita, iniciar antibiótico; monoterapia não é recomendada.",
  ],
  algoritmos: [
    {
      titulo: "Úlcera genital",
      passos: [
        cenario("Úlcera anogenital"),
        avaliar("História, exame, teste rápido de sífilis e HIV; pesquisa direta quando disponível"),
        decisao(
          "Aspecto",
          ramo(
            "Vesículas agrupadas ou episódios recorrentes",
            conduta("Herpes: 1º episódio aciclovir 200 mg, 2 comprimidos 3x/dia por 7 a 10 dias; recidiva 2 comprimidos 3x/dia por 5 dias, iniciando no pródromo")
          ),
          ramo(
            "Sem vesículas, sem diagnóstico definido",
            conduta("Sífilis: benzilpenicilina benzatina 2,4 milhões UI IM dose única"),
            conduta("Cancroide: azitromicina 500 mg, 2 comprimidos VO dose única (alternativas: ceftriaxona 250 mg IM dose única ou ciprofloxacino 500 mg 12/12 h por 3 dias)")
          ),
          ramo(
            "Lesão com mais de 4 semanas ou sem resposta",
            avaliar("Biópsia; pensar em donovanose, LGV, neoplasia"),
            conduta("Donovanose: azitromicina 1 g/semana por ≥ 3 semanas ou até cicatrizar. LGV: doxiciclina 100 mg 12/12 h por 21 dias")
          )
        ),
        conduta("Tratar parcerias, oferecer testagem e retorno"),
      ],
    },
    {
      titulo: "Doença inflamatória pélvica",
      passos: [
        cenario("Dor pélvica com dor à mobilização do colo, anexos ou útero (critérios do Quadro 42)"),
        decisao(
          "Critério de internação? (abscesso tubo-ovariano, gravidez, sem resposta em 72 h de VO, intolerância à VO ou dificuldade de seguimento, estado geral grave, dúvida com emergência cirúrgica)",
          ramo(
            "Não: ambulatorial",
            conduta("Ceftriaxona 500 mg IM dose única + doxiciclina 100 mg 12/12 h por 14 dias + metronidazol 250 mg, 2 comprimidos 12/12 h por 14 dias"),
            avaliar("Reavaliar em 72 h: sem melhora, internar")
          ),
          ramo(
            "Sim: hospitalar",
            conduta("Ceftriaxona 1 g IV 1x/dia + doxiciclina 100 mg 12/12 h + metronidazol 400 mg IV 12/12 h, por 14 dias"),
            conduta("Alternativas: clindamicina 900 mg IV 3x/dia + gentamicina 3 a 5 mg/kg/dia; ou ampicilina/sulbactam 3 g IV 6/6 h + doxiciclina")
          )
        ),
        atencao("Doxiciclina é contraindicada na gestação. Suspender a via parenteral 24 h após a melhora e completar 14 dias por via oral"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Úlceras genitais: tratamento (Quadros 38 e 39)",
      colunas: ["Agente", "Primeira opção", "Alternativa"],
      linhas: [
        ["Herpes, 1º episódio", "Aciclovir 200 mg, 2 comprimidos 3x/dia por 7 a 10 dias", "Aciclovir 200 mg 5x/dia por 7 a 10 dias"],
        ["Herpes, recidiva", "Aciclovir 200 mg, 2 comprimidos 3x/dia por 5 dias", "Aciclovir 200 mg, 4 comprimidos 2x/dia por 5 dias"],
        ["Herpes, supressão (≥ 6 episódios/ano)", "Aciclovir 200 mg, 2 comprimidos 2x/dia por até 6 meses", "Pode prolongar até 2 anos"],
        ["Cancroide", "Azitromicina 1 g VO dose única", "Ceftriaxona 250 mg IM dose única ou ciprofloxacino 500 mg 12/12 h por 3 dias"],
        ["Linfogranuloma venéreo", "Doxiciclina 100 mg 12/12 h por 21 dias", "Azitromicina 1 g/semana por 21 dias (preferencial na gestante)"],
        ["Donovanose", "Azitromicina 1 g/semana por ≥ 3 semanas ou até cicatrizar", "Doxiciclina 100 mg 12/12 h por ≥ 21 dias"],
        ["Sífilis primária", "Benzilpenicilina benzatina 2,4 milhões UI IM dose única", "Doxiciclina 100 mg 12/12 h por 15 dias (exceto gestante)"],
      ],
    },
    {
      titulo: "DIP: tratamento (Quadro 44)",
      colunas: ["Cenário", "Primeira opção", "Outras opções"],
      linhas: [
        ["Ambulatorial", "Ceftriaxona 500 mg IM dose única + doxiciclina 100 mg 12/12 h 14 dias + metronidazol 250 mg 2 comprimidos 12/12 h 14 dias", "Cefotaxima 500 mg IM dose única no lugar da ceftriaxona"],
        ["Hospitalar", "Ceftriaxona 1 g IV/dia + doxiciclina 100 mg 12/12 h + metronidazol 400 mg IV 12/12 h, 14 dias", "Clindamicina 900 mg IV 8/8 h + gentamicina 3 a 5 mg/kg/dia; ampicilina/sulbactam 3 g IV 6/6 h + doxiciclina"],
      ],
    },
  ],
  oQueCai: [
    "Úlcera sem diagnóstico: tratar sífilis + cancroide; herpes se vesículas.",
    "Herpes recidivante: iniciar no pródromo; supressão se ≥ 6 episódios/ano.",
    "DIP ambulatorial: ceftriaxona + doxiciclina + metronidazol por 14 dias; reavaliar em 72 h.",
    "Gravidez e abscesso tubo-ovariano internam.",
  ],
  pegadinhas: [
    "\"Retirar o DIU obrigatoriamente na DIP\" (não é obrigatório; reavaliar se não houver melhora).",
    "\"Monoterapia com ceftriaxona trata DIP\" (não: é sempre associação).",
    "\"Doxiciclina para LGV na gestante\" (contraindicada; usar azitromicina).",
  ],
};

export const HIV: Tema = {
  id: "hiv",
  titulo: "HIV: TARV, profilaxias e PEP (PCDT HIV 2024)",
  fonte: {
    titulo: "Ministério da Saúde. PCDT para Manejo da Infecção pelo HIV em Adultos, Módulos 1 e 2 (2024), e PCDT de Profilaxia Pós-Exposição (PEP).",
    url: "https://www.gov.br/aids/pt-br/central-de-conteudo/pcdts",
    nota: "Quadros 5, 6 e 9 do Módulo 1, Quadro 29 do Módulo 2 e Quadro 4 do PCDT de PEP.",
  },
  revisar: [
    "TARV para todas as pessoas vivendo com HIV, de início rápido, independentemente do CD4. Esquema preferencial: tenofovir/lamivudina + dolutegravir.",
    "Com rifampicina (TB), o dolutegravir passa a 50 mg de 12/12 h e continua dobrado por 15 dias após o fim do tratamento da TB.",
    "Adiar a TARV na meningite tuberculosa (4 a 6 semanas) e na criptocócica (4 a 6 semanas do antifúngico).",
  ],
  algoritmos: [
    {
      titulo: "Início da TARV",
      passos: [
        cenario("Diagnóstico de HIV confirmado"),
        avaliar("Avaliação inicial: CD4, carga viral, função renal, sorologias (sífilis, hepatites B e C, toxoplasmose), rastreio de TB (sintomas e PT/IGRA), CrAg se CD4 < 200"),
        decisao(
          "Sinais de comprometimento do SNC ou suspeita de meningite tuberculosa ou criptocócica?",
          ramo(
            "Sim",
            conduta("Meningite tuberculosa: iniciar TARV preferencialmente 4 a 6 semanas após o início do tratamento da TB (pode ser após 2 semanas com especialista e CD4 < 50)"),
            conduta("Meningite criptocócica: iniciar TARV 4 a 6 semanas após o início do antifúngico, com melhora neurológica e cultura do líquor negativa")
          ),
          ramo(
            "Não",
            decisao(
              "Tuberculose ativa?",
              ramo("Sim", conduta("Tenofovir/lamivudina 300/300 mg 1x/dia + dolutegravir 50 mg 12/12 h; CD4 ≤ 50: iniciar em até 7 dias")),
              ramo("Não", conduta("Tenofovir/lamivudina 300/300 mg + dolutegravir 50 mg 1x/dia, de preferência no mesmo dia ou em poucos dias"))
            )
          )
        ),
        avaliar("Carga viral 8 semanas após o início; depois a cada 6 meses quando suprimida"),
        atencao("Tenofovir contraindicado com TFGe < 60 mL/min ou disfunção renal: trocar por abacavir (HLA-B*5701 negativo) ou zidovudina"),
      ],
    },
    {
      titulo: "Profilaxia pós-exposição (PEP)",
      passos: [
        cenario("Exposição de risco (sexual, percutânea ou de mucosa) a material potencialmente infectante"),
        decisao(
          "Atendimento em até 72 horas da exposição?",
          ramo("Não", conduta("PEP não indicada (sem benefício após 72 h); testar, orientar e seguir; avaliar PrEP")),
          ramo(
            "Sim",
            conduta("Teste rápido de HIV da pessoa exposta (não atrasa o início)"),
            conduta("Tenofovir/lamivudina 300/300 mg + dolutegravir 50 mg 1x/dia por 28 dias, o mais cedo possível"),
            conduta("Avaliar sífilis, hepatites B e C, outras ISTs, contracepção de emergência e vacina de hepatite B")
          )
        ),
        avaliar("Testar HIV de novo 30 e 90 dias após a exposição; oferecer PrEP ao fim dos 28 dias quando houver risco contínuo"),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Esquemas iniciais (Quadros 5 e 6)",
      colunas: ["Situação", "Esquema", "Observação"],
      linhas: [
        ["Preferencial", "Tenofovir/lamivudina + dolutegravir 1x/dia", "Iniciar o quanto antes"],
        ["Intolerância ao dolutegravir", "Trocar por darunavir/ritonavir 800/100 mg 1x/dia ou efavirenz", "Efavirenz de preferência com genotipagem (resistência transmitida no Brasil)"],
        ["Contraindicação ao tenofovir", "Trocar por abacavir (HLA-B*5701 negativo) ou zidovudina", "Hepatite B ativa: manter droga ativa contra HBV"],
        ["Coinfecção TB-HIV, preferencial", "Tenofovir/lamivudina 1x/dia + dolutegravir 50 mg 12/12 h", "Manter dose dobrada 15 dias após terminar a TB"],
        ["Coinfecção TB-HIV, alternativo", "Tenofovir/lamivudina/efavirenz 1x/dia", "Reavaliar troca para dolutegravir ao fim da TB"],
      ],
    },
    {
      titulo: "Profilaxia primária de infecções oportunistas (Quadro 29)",
      colunas: ["Agente", "Indicação", "Esquema", "Suspender"],
      linhas: [
        ["Pneumocystis jirovecii", "CD4 < 200 (ou < 14%), candidíase oral, febre indeterminada > 2 semanas ou doença definidora de aids", "Sulfametoxazol/trimetoprima 800/160 mg 3x/semana (alternativa: dapsona 100 mg/dia)", "CD4 > 200 por mais de 3 meses com TARV"],
        ["Toxoplasma gondii", "CD4 < 100", "Sulfametoxazol/trimetoprima 800/160 mg 1x/dia", "CD4 > 200 por mais de 3 meses com TARV"],
        ["Micobactérias não tuberculosas", "CD4 < 50 sem TARV iniciada", "Azitromicina 1.250 a 1.500 mg/semana", "Após o início da TARV"],
        ["Tuberculose latente", "CD4 ≤ 350 (sem TB ativa) ou CD4 > 350 com PT ≥ 5 mm/IGRA positivo, ou contato de TB pulmonar", "Ver tema Tuberculose (ILTB)", "Completar as doses"],
      ],
    },
  ],
  oQueCai: [
    "TDF/3TC + DTG é o esquema inicial preferencial, inclusive na gestação.",
    "Rifampicina: dolutegravir 50 mg 12/12 h.",
    "Carga viral 8 semanas após iniciar; depois de 6/6 meses.",
    "SMX-TMP para pneumocistose com CD4 < 200; para toxoplasmose com CD4 < 100.",
    "PEP: até 72 h, 28 dias de TDF/3TC + DTG.",
  ],
  pegadinhas: [
    "\"Esperar o CD4 para começar a TARV\" (não: início rápido para todos).",
    "\"Iniciar TARV imediatamente na meningite criptocócica\" (aumenta mortalidade: esperar 4 a 6 semanas).",
    "\"PEP ainda funciona com 5 dias de exposição\" (sem benefício após 72 h).",
    "\"Medo de SIRI justifica atrasar a TARV na TB\" (não: o benefício do início precoce supera o risco).",
  ],
};

export const TUBERCULOSE: Tema = {
  id: "tuberculose",
  titulo: "Tuberculose: tratamento e ILTB (Manual MS)",
  fonte: {
    titulo: "Ministério da Saúde. Manual de Recomendações para o Controle da Tuberculose no Brasil. 2ª edição atualizada. Brasília, 2019.",
    url: "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/tuberculose/manual-de-recomendacoes-e-controle-da-tuberculose-no-brasil-2a-ed.pdf",
    nota: "Quadros 20 a 23 e capítulos de reações adversas e ILTB. Coinfecção com HIV segue o PCDT HIV 2024 (tema HIV). O SUS incorporou depois o esquema 3HP para ILTB.",
  },
  revisar: [
    "Esquema básico (≥ 10 anos): 2 meses de RHZE + 4 meses de RH, dose por faixa de peso. Crianças < 10 anos: 2RHZ + 4RH (sem etambutol).",
    "Meningoencefálica e osteoarticular: 2RHZE + 10RH (12 meses), com corticoide na forma meningoencefálica.",
    "Notificar, oferecer teste de HIV a todos e avaliar todos os contatos.",
  ],
  algoritmos: [
    {
      titulo: "Tratamento da tuberculose",
      passos: [
        cenario("Tuberculose confirmada (TRM-TB, baciloscopia ou cultura) ou diagnóstico clínico-radiológico"),
        conduta("Notificar; teste rápido de HIV; cultura com teste de sensibilidade conforme a rede; avaliar contatos"),
        decisao(
          "Forma e idade",
          ramo("Pulmonar ou extrapulmonar (exceto SNC e osteoarticular), ≥ 10 anos", conduta("2RHZE (comprimidos 150/75/400/275 mg) + 4RH, por faixa de peso")),
          ramo("Criança < 10 anos", conduta("2RHZ + 4RH (rifampicina 15, isoniazida 10, pirazinamida 35 mg/kg/dia)")),
          ramo("Meningoencefálica ou osteoarticular", conduta("2RHZE + 10RH (12 meses); na meningoencefálica associar corticoide"))
        ),
        conduta("Tratamento diretamente observado sempre que possível; baciloscopia de controle mensal na forma pulmonar"),
        decisao(
          "Hepatotoxicidade?",
          ramo("Enzimas < 5x sem sintomas e < 3x com sintomas, sem icterícia", conduta("Manter e monitorar (elevação assintomática transitória é comum nos 2 primeiros meses)")),
          ramo(
            "Enzimas ≥ 5x sem sintomas, ≥ 3x com sintomas, ou icterícia",
            conduta("Suspender e encaminhar à referência"),
            conduta("Melhora: reintroduzir rifampicina + etambutol, depois isoniazida, depois pirazinamida, com 3 a 7 dias entre elas e enzimas antes de cada etapa")
          )
        ),
      ],
    },
    {
      titulo: "Infecção latente (ILTB)",
      passos: [
        cenario("Contato, PVHIV, candidato a imunobiológico ou outra população com indicação de investigação"),
        avaliar("Excluir TB ativa (sintomas e radiografia de tórax)"),
        decisao(
          "PT ≥ 5 mm ou IGRA positivo (ou PVHIV com CD4 ≤ 350, independentemente do teste)?",
          ramo("Não", conduta("Sem tratamento; em contatos, repetir a PT em 8 semanas quando indicado")),
          ramo(
            "Sim",
            conduta("Isoniazida 5 a 10 mg/kg/dia (máx. 300 mg): 270 doses em 9 a 12 meses (ou 180 doses em 6 a 9 meses)"),
            conduta("Ou rifampicina 10 mg/kg/dia (máx. 600 mg): 120 doses em 4 meses; preferencial em > 50 anos, < 10 anos, hepatopatas e intolerância à isoniazida"),
            atencao("Rifampicina interage com dolutegravir e inibidores de protease: nesses casos preferir isoniazida")
          )
        ),
      ],
    },
  ],
  quadros: [
    {
      titulo: "Esquema básico, adultos e adolescentes ≥ 10 anos (Quadro 20)",
      colunas: ["Peso", "Fase intensiva: RHZE 150/75/400/275 mg (2 meses)", "Manutenção: RH 150/75 mg (4 meses)"],
      linhas: [
        ["20 a 35 kg", "2 comprimidos", "2 comprimidos (ou 1 de 300/150 mg)"],
        ["36 a 50 kg", "3 comprimidos", "3 comprimidos"],
        ["51 a 70 kg", "4 comprimidos", "4 comprimidos (ou 2 de 300/150 mg)"],
        ["Acima de 70 kg", "5 comprimidos", "5 comprimidos"],
      ],
    },
    {
      titulo: "Crianças < 10 anos (Quadro 22)",
      colunas: ["Fármaco", "mg/kg/dia", "Até 20 kg (mg/dia)", "≥ 45 kg (mg/dia)"],
      linhas: [
        ["Rifampicina", "15 (10 a 20)", "300", "600"],
        ["Isoniazida", "10 (7 a 15)", "200", "300"],
        ["Pirazinamida (só nos 2 primeiros meses)", "35 (30 a 40)", "750", "2.000"],
      ],
    },
  ],
  oQueCai: [
    "2RHZE/4RH por faixa de peso; criança < 10 anos sem etambutol.",
    "Meningoencefálica: 12 meses e corticoide.",
    "Suspender por hepatotoxicidade: ≥ 5x sem sintomas, ≥ 3x com sintomas ou icterícia.",
    "Reintrodução: RE → H → Z.",
    "ILTB: PT ≥ 5 mm ou IGRA positivo; isoniazida 270 doses ou rifampicina 120 doses.",
  ],
  pegadinhas: [
    "\"Aumento assintomático de transaminases obriga a suspender\" (não, abaixo de 5x sem sintomas).",
    "\"Etambutol para criança pequena\" (não no esquema < 10 anos).",
    "\"BCG prévia muda o ponto de corte da PT\" (no Brasil, PT ≥ 5 mm indica infecção, independentemente da BCG).",
  ],
};
