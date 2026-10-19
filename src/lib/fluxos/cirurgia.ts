import { atencao, avaliar, cenario, conduta, decisao, ramo, type AreaFluxos } from "./tipos.ts";

export const CIRURGIA: AreaFluxos = {
  id: "cirurgia",
  nome: "Cirurgia",
  temas: [
    {
      id: "trauma",
      titulo: "Trauma",
      questoes: 15,
      revisar: [
        "Hipotensão permissiva (PAS 80–90) está correta no trauma penetrante sem TCE: evita romper o coágulo até a hemostasia. Contraindicada em TCE, lesão medular e gestante.",
      ],
      algoritmos: [
        {
          titulo: "Choque no trauma torácico: exame físico e primeiro gesto",
          passos: [
            cenario("Trauma torácico com choque"),
            avaliar("Auscultar os dois lados, percutir e olhar as jugulares; diagnóstico clínico"),
            decisao(
              "O que o exame mostra?",
              ramo(
                "Murmúrio abolido de um lado, percussão timpânica, jugulares túrgidas",
                conduta("Pneumotórax hipertensivo: descompressão imediata (adulto: 5º espaço intercostal), depois dreno no 5º espaço")
              ),
              ramo(
                "Murmúrio abolido de um lado, percussão maciça, jugulares colabadas",
                conduta("Hemotórax maciço: dreno + sangue"),
                conduta("Toracotomia de urgência se saída imediata ≥ 1.500 mL ou 200 mL/h por 2 a 4 horas")
              ),
              ramo(
                "Murmúrio preservado dos dois lados, jugulares túrgidas, bulhas abafadas",
                avaliar("Suspeita de tamponamento: FAST, janela pericárdica (subxifoide)"),
                conduta("Cirurgia (toracotomia ou esternotomia); pericardiocentese é ponte se não há cirurgião")
              )
            ),
            atencao("Desvio de traqueia e turgência jugular são tardios e podem faltar; não esperar radiografia para descomprimir"),
          ],
        },
        {
          titulo: "Trauma abdominal: da estabilidade à conduta",
          passos: [
            cenario("Trauma abdominal"),
            avaliar("Avaliar estabilidade hemodinâmica, FAST e sinais de sangramento abdominal"),
            decisao(
              "Instável? Há fonte abdominal provável?",
              ramo("Instável com FAST positivo, peritonite, evisceração ou ferimento penetrante", conduta("Laparotomia")),
              ramo(
                "Instável sem fonte abdominal evidente",
                conduta("Procurar tórax, pelve, ossos longos e causa não hemorrágica antes de abrir o abdome"),
                conduta("Fratura de pelve instável: cinta, tamponamento pré-peritoneal ou angioembolização")
              ),
              ramo("Estável", conduta("Investigar: tomografia"))
            ),
            atencao("Tomografia é para o estável: não mandar o instável para o tomógrafo"),
          ],
        },
      ],
      oQueCai: [
        "Tranexâmico: iniciar em até 3 h; 1 g em 10 min + 1 g em 8 h (8 h é a duração, não o prazo)",
        "Critérios cobrados: PAS < 90, FC > 120 na questão (CRASH-2: FC > 110). Diurese < 30 mL/h não é critério",
        "Transfusão maciça: ≥ 10 CH em 24 h ou ≥ 4 em 1 h; 1:1:1; Hb 7–9 g/dL; repor cálcio guiado pelo Ca iônico",
        "Hipotensão permissiva: PAS 80–90 (PAM 50–60) até a hemostasia; não no TCE, na lesão medular nem na gestante",
        "Hemotórax maciço: ≥ 1.500 mL de saída imediata ou 200 mL/h por 2–4 h → toracotomia",
        "Pneumotórax hipertensivo: clínico, sem RX; punção no adulto no 5º EIC, pouco à frente da axilar média",
        "Zona de Ziedler: do 2º ao 10º EIC, da paraesternal D à axilar anterior E. Pericardiocentese é só ponte",
        "Damage control: aponeurose aberta (vácuo/Bogotá), sem anastomose; reexplorar em até 24–48 h",
      ],
      pegadinhas: [
        "Mandar o instável para a tomografia",
        "Pedir radiografia antes de descomprimir o pneumotórax hipertensivo",
        "Metilprednisolona no trauma raquimedular: não se usa",
        "Ângulo alfa agudo = hipocoagulável (não hipercoagulável)",
      ],
    },
    {
      id: "perioperatorio",
      titulo: "Cuidados perioperatórios",
      questoes: 10,
      quadros: [
        {
          titulo: "ASA: classe e exemplo-chave",
          colunas: ["ASA", "Ideia", "Exemplo-chave"],
          linhas: [
            ["I", "Saudável", "Não fuma, álcool mínimo"],
            ["II", "Doença sistêmica leve", "HAS/DM controlados, fumante, gestante, IMC > 30 e < 40"],
            ["III", "Doença sistêmica grave", "HAS/DM mal controlados, IMC ≥ 40, infarto/AVC/stent há > 3 meses"],
            ["IV", "Ameaça constante à vida", "Infarto/AVC/stent há < 3 meses, sepse"],
            ["V", "Não sobrevive sem operar", "Aneurisma roto"],
            ["VI", "Morte encefálica", "Doador de órgãos (E = emergência, soma-se)"],
          ],
        },
        {
          titulo: "Febre no pós-operatório: 5 W",
          colunas: ["W", "Dias", "Hipótese"],
          linhas: [
            ["Wind", "1–2", "Resposta inflamatória (atelectasia é achado, não causa provada)"],
            ["Water", "3–5", "Infecção urinária (sonda vesical)"],
            ["Walking", "4–6", "TVP, embolia pulmonar"],
            ["Wound", "5–7", "Infecção de sítio cirúrgico, deiscência"],
            ["Wonder drugs", "7+", "Droga, cateter venoso, abscesso intracavitário"],
          ],
        },
      ],
      oQueCai: [
        "Jejum 2-6-8: líquido claro 2 h; refeição leve/leite 6 h; pesada 8 h. Maltodextrina até 2 h antes",
        "Antibiótico profilático: até 60 min antes da incisão (120 min vancomicina/quinolonas); máx. 24 h",
        "Repique: cirurgia > 2 meias-vidas ou sangramento > 1.500 mL; dose ajustada por peso",
        "REMIT: sobem cortisol, catecolaminas, glucagon, GH, ADH, aldosterona; insulina cai; Na urinário cai",
        "Manutenção: 25–30 mL/kg/dia (20–25 no idoso frágil, IR, IC); sem K no POI antes de diurese e função renal",
        "Gotas/min (macrogotas, 20 gotas/mL) = volume ÷ (3 × horas); 2.500 mL em 24 h ≈ 35 gotas/min",
        "Deiscência da aponeurose: 5º–10º dia; sentinela = líquido 'água de carne'; evisceração = compressa úmida + CC",
        "Glutaraldeído 2% 20 min = desinfecção de alto nível; termossensível: óxido de etileno ou plasma de peróxido",
      ],
      pegadinhas: [
        "Todo diabético como ASA III (controlado = II); gestante ou fumante como ASA I",
        "Esticar a profilaxia para 5 dias ou negar o repique",
        "KCl já no pós-operatório imediato",
        "Explicar febre precoce por atelectasia e parar de investigar",
      ],
    },
    {
      id: "vias-biliares",
      titulo: "Vias biliares",
      questoes: 8,
      quadros: [
        {
          titulo: "Tokyo lado a lado: colecistite aguda × colangite aguda",
          colunas: ["", "Colecistite aguda", "Colangite aguda"],
          linhas: [
            ["A", "Sinal local: Murphy; dor, massa ou sensibilidade no quadrante superior direito", "Inflamação sistêmica: febre > 38 °C ou calafrios; leucócitos < 4.000 ou > 10.000/mm³; PCR ≥ 1 mg/dL"],
            ["B", "Sinal sistêmico: febre, PCR alta, leucocitose", "Colestase: bilirrubina total ≥ 2 mg/dL; enzimas hepáticas > 1,5× o limite superior"],
            ["C", "Imagem", "Imagem: via biliar dilatada ou causa visível"],
            ["Suspeita", "1 item de A + 1 item de B", "A + (B ou C)"],
            ["Definitivo", "A + B + C", "A + B + C"],
            ["Icterícia", "Não é critério; pode existir, em geral leve: investigar a via biliar", "Habitual, com colestase"],
            ["Grau II", "Basta 1: leucócitos > 18.000/mm³; massa dolorosa palpável no quadrante superior direito; sintomas há mais de 72 horas; inflamação local intensa", "2 dos 5: leucócitos > 12.000 ou < 4.000/mm³; febre ≥ 39 °C; idade ≥ 75 anos; bilirrubina total ≥ 5 mg/dL; albumina baixa (menor que 0,7× o limite inferior)"],
            ["Grau III", "Disfunção de órgão: hipotensão que exige dopamina ≥ 5 µg/kg/min ou noradrenalina; rebaixamento da consciência; PaO₂/FiO₂ < 300; creatinina > 2,0 mg/dL ou oligúria; INR > 1,5; plaquetas < 100.000/mm³", "Disfunção de ao menos um órgão: vasopressor; rebaixamento; PaO₂/FiO₂ < 300; creatinina > 2,0 mg/dL ou oligúria; INR > 1,5; plaquetas < 100.000/mm³"],
            ["Controle do foco", "Graus I e II com Charlson ≤ 5 e ASA ≤ 2: colecistectomia laparoscópica precoce. Risco alto no grau II: tratamento clínico e/ou colecistostomia, com cirurgia depois. Grau III: suporte de órgãos primeiro; opera cedo só o favorável (Charlson ≤ 3, ASA ≤ 2, centro experiente); o resto, colecistostomia", "Drenagem biliar (CPRE é a 1ª escolha): grau I só se não responder ao antibiótico; grau II precoce; grau III urgente, junto com o suporte de órgãos"],
          ],
        },
        {
          titulo: "Cólica × colecistite × colangite (quadro típico)",
          colunas: ["", "Clínica", "Icterícia", "O que confirma"],
          linhas: [
            ["Cólica biliar", "Dor que passa em horas, sem febre", "Não", "US com cálculo, sem inflamação → colecistectomia eletiva"],
            ["Colecistite aguda", "Dor persistente, Murphy, febre", "Ausente ou leve", "Sinais locais + sistêmicos + imagem da vesícula"],
            ["Colangite", "Dor + febre com calafrios (Charcot)", "Habitual, com colestase", "Inflamação + colestase + via biliar dilatada/obstruída"],
          ],
        },
      ],
      oQueCai: [
        "Colecistite: suspeita = 1 de A + 1 de B; definitivo = A + B + C. Icterícia não é critério",
        "Colecistite grau II (basta 1): leucócitos > 18.000/mm³, massa no QSD, sintomas > 72 h, inflamação local intensa",
        "Grau III: dopamina ≥ 5 µg/kg/min ou nora, PaO₂/FiO₂ < 300, creatinina > 2,0 mg/dL, INR > 1,5, plaquetas < 100.000",
        "Bom risco (Charlson ≤ 5 e ASA ≤ 2): colecistectomia laparoscópica precoce no grau I e II; risco alto → colecistostomia",
        "Colangite: suspeita A + (B ou C); definitivo A + B + C; B = bilirrubina ≥ 2 mg/dL, enzimas > 1,5× LSN",
        "Colangite grau II = 2 de 5: leucócitos > 12.000 ou < 4.000, febre ≥ 39 °C, idade ≥ 75, BT ≥ 5 mg/dL, albumina baixa",
        "Drenagem: grau I só se falhar o antibiótico; II precoce; III urgente. CPRE → percutânea → cirurgia",
        "Caso cobrado: 4 dias de dor, Cr 1,5, INR 1,0, leucócitos 14.000 → colecistite grau II pelo tempo",
      ],
      pegadinhas: [
        "Creatinina 1,5 puxando para grau III (corte > 2,0); inventar grau IV",
        "Aceitar 1 critério (ou leucócitos 18.000) para colangite grau II",
        "Urgência ou antibiótico na cólica biliar sem inflamação",
        "Colecistostomia para Child A, gangrena ou Mirizzi IV (são cirurgia)",
      ],
    },
    {
      id: "tecnica-operatoria",
      titulo: "Técnica operatória",
      questoes: 7,
      revisar: [
        "Incisões: Pfannenstiel e mediana corretas; Kocher foi considerada falsa pelo gabarito oficial (embora anatomicamente defensável); McBurney divulsiona as fibras, não secciona.",
      ],
      quadros: [
        {
          titulo: "Fios de sutura",
          colunas: ["Fio", "Tipo", "Força dura", "Uso"],
          linhas: [
            ["Monocryl (poliglecaprone)", "Mono, absorvível", "2–3 semanas", "Pele (intradérmico)"],
            ["Vicryl (poliglactina)", "Multi, absorvível", "3–4 semanas", "Planos internos"],
            ["PDS (polidioxanona)", "Mono, absorvível", "6 semanas ou mais", "Aponeurose"],
            ["Nylon / Prolene", "Mono, inabsorvível", "Permanente", "Pele, vasos, tela"],
            ["Seda / algodão", "Multi, inabsorvível", "Longa", "Ligaduras; evitar em ferida contaminada"],
          ],
        },
      ],
      oQueCai: [
        "Estoma precoce: necrose, sangramento, retração, deiscência mucocutânea, dermatite. Tardio: hérnia paraestomal, prolapso, estenose",
        "Prolapso e hérnia paraestomal: orifício largo + alça frouxa. Isquemia → necrose e retração. Pelo reto abdominal protege",
        "McBurney: músculos divulsionados, não seccionados. Kocher: subcostal D, secciona o reto. Mediana: trauma/emergência",
        "Perder força tênsil ≠ absorção total (a absorção demora bem mais)",
        "Harmônico ~55.500 Hz, sem corrente no paciente; bipolar sem placa, mais seguro com marca-passo",
        "Monopolar: placa descolada → maior densidade de corrente → queimadura; acoplamento capacitivo é do monopolar",
        "Pneumoperitônio: hipercapnia + acidose respiratória; RVS sobe, retorno venoso e DC caem; PIC sobe",
        "Bradicardia na insuflação = reflexo vagal → desinsuflar + atropina",
      ],
      pegadinhas: [
        "Acoplamento capacitivo 'exclusivo do bipolar': falso",
        "McBurney com 'secção ampla' dos oblíquos e transverso: falso",
        "Alcalose respiratória, CO₂ insolúvel ou RVS que cai no pneumoperitônio",
        "Prolapso atribuído à isquemia ou à passagem pelo reto abdominal",
      ],
    },
    {
      id: "hemorragia-digestiva",
      titulo: "Hemorragia digestiva",
      questoes: 6,
      revisar: [
        "HDA no cirrótico, antes da endoscopia: IBP venoso empírico junto com vasoconstritor e ceftriaxona. A causa ainda não é conhecida e cirrótico também sangra de úlcera. Confirmadas as varizes, IBP não é o tratamento.",
      ],
      algoritmos: [
        {
          titulo: "Hemorragia digestiva alta por úlcera: da estabilização ao ressangramento",
          passos: [
            cenario("Hemorragia digestiva alta com suspeita de úlcera péptica"),
            conduta("Estabilizar (acessos, volume, sangue se preciso) + IBP venoso"),
            decisao(
              "Endoscopia depois da reanimação, em até 24 h: qual o Forrest?",
              ramo(
                "Ia, Ib ou IIa",
                conduta("Ia e Ib: adrenalina + segundo método (térmico ou mecânico)"),
                conduta("IIa: térmico, mecânico ou esclerosante, sozinho ou associado à adrenalina")
              ),
              ramo("IIb (coágulo aderido)", conduta("Considerar remover o coágulo; se houver sangramento ativo ou vaso visível, tratar")),
              ramo("IIc ou III", conduta("Sem hemostasia endoscópica, só IBP"))
            ),
            conduta("Ressangrou: nova endoscopia. Falhou de novo: embolização arterial. Cirurgia se a embolização não está disponível ou falha"),
            atencao("Adrenalina isolada não é recomendada como método único"),
          ],
        },
      ],
      quadros: [
        {
          titulo: "Três sangramentos, três sequências: úlcera × varizes × divertículo",
          colunas: ["", "Úlcera péptica", "Varizes esofágicas", "Sangramento diverticular"],
          linhas: [
            ["Quadro", "Achado da endoscopia classificado por Forrest", "Cirrótico ou etilista com hematêmese e hipotensão", "Indolor, volumoso, início abrupto, sem febre; vem mais do cólon direito"],
            ["Primeiro passo", "Estabilizar: acessos, volume, sangue se preciso", "Estabilizar: volume com cautela; transfusão restritiva, hemoglobina alvo 7–8 g/dL", "Estabilizar; hematoquezia com choque: descartar HDA"],
            ["Remédio já na suspeita", "IBP venoso", "Vasoconstritor esplâncnico (terlipressina, octreotida ou somatostatina) + antibiótico profilático (ceftriaxona) + IBP venoso empírico até a endoscopia", "—"],
            ["Endoscopia", "Depois da reanimação, em até 24 h; hemostasia conforme Forrest", "Em até 12 h; ligadura elástica", "Estável: colonoscopia com hemostasia"],
            ["Falha ou instável", "Nova endoscopia; depois embolização arterial; cirurgia se a embolização não está disponível ou falha", "Balão ou prótese como ponte e TIPS", "Instável e sangrando: angio-TC e embolização; cirurgia na falha"],
            ["Não confundir", "Antibiótico não trata úlcera sangrante", "IBP venoso entra empírico até a endoscopia (cirrótico também sangra de úlcera); confirmadas as varizes, IBP não trata a hipertensão portal", "Para sozinho em 70–80% dos casos"],
          ],
        },
      ],
      oQueCai: [
        "1º passo: estabilizar + IBP venoso; endoscopia após a reanimação, em até 24 h",
        "Forrest: Ia jato, Ib babação, IIa vaso visível, IIb coágulo aderido, IIc mancha plana, III base limpa (sem IIIc)",
        "Ia/Ib: adrenalina + térmico ou mecânico. IIa: térmico, clipe ou esclerosante. IIb: considerar remover coágulo. IIc/III: só IBP",
        "Ressangramento (séries clássicas): Ia até 90%, Ib ~55%, IIa 40–50%, IIb 25–30%, IIc < 10%, III < 5%",
        "Ressangrou: nova endoscopia → embolização arterial → cirurgia se indisponível ou falha",
        "Varizes: Hb alvo 7–8 g/dL; terlipressina/octreotida/somatostatina + ceftriaxona + IBP empírico até a EDA; EDA em 12 h com ligadura; falha: balão/prótese, TIPS",
        "Divertículo: sangramento indolor, volumoso; para sozinho em 70–80%; vem mais do cólon direito",
        "Meckel: cintilografia com pertecnetato de Tc-99m; regra dos 2 (2%, 60 cm da válvula ileocecal, até 2 anos)",
      ],
      pegadinhas: [
        "'Forrest III C = úlcera cicatrizada' (não existe)",
        "Adrenalina isolada como método único",
        "Cirurgia antes de estabilizar ou como único passo após 1ª falha endoscópica",
        "Sangramento diverticular com dor e febre (isso é diverticulite)",
      ],
    },
    {
      id: "hernias",
      titulo: "Hérnias",
      questoes: 4,
      algoritmos: [
        {
          titulo: "Hérnia que não reduz: tentar reduzir ou operar",
          passos: [
            cenario("Hérnia que não reduz (encarcerada)"),
            avaliar("Procurar estrangulamento: pele vermelha/arroxeada, dor que piora, febre, toxemia, peritonite, vômitos/obstrução"),
            decisao(
              "Há sinal de sofrimento vascular?",
              ramo("Sim (estrangulada)", conduta("Cirurgia de urgência; nunca forçar a redução")),
              ramo(
                "Não",
                conduta("Tentar redução manual (táxis) com analgesia/sedação"),
                decisao(
                  "Reduziu?",
                  ramo("Sim", conduta("Cirurgia eletiva ou urgência diferida (lactente: mesma internação, em 24–48 h)")),
                  ramo("Não", conduta("Cirurgia de urgência"))
                )
              )
            ),
            atencao("Nunca mandar hérnia encarcerada para o ambulatório"),
          ],
        },
      ],
      quadros: [
        {
          titulo: "Hérnia inguinal direta × indireta",
          colunas: ["", "Direta", "Indireta"],
          linhas: [
            ["Origem", "Adquirida (parede posterior fraca, Hesselbach)", "Congênita (conduto peritônio-vaginal patente)"],
            ["Vasos epigástricos", "Medial", "Lateral"],
            ["Trajeto", "Parede posterior", "Anel interno e canal (pode ir ao escroto)"],
            ["Dedo no canal", "Polpa", "Ponta"],
            ["Encarceramento", "Menos (colo largo)", "Mais; é a mais comum"],
          ],
        },
      ],
      oQueCai: [
        "Encarcerada = não reduz; estrangulada = + sofrimento vascular (pele arroxeada, dor crescente, febre, peritonite, obstrução)",
        "Encarcerada sem sinais: táxis com analgesia/sedação; reduziu → eletiva (lactente: mesma internação, 24–48 h)",
        "Não reduziu ou suspeita de estrangulamento: cirurgia de urgência; nunca forçar redução com isquemia",
        "Nyhus: I indireta anel normal; II anel dilatado; IIIA direta; IIIB indireta c/ parede destruída; IIIC femoral; IV recidiva",
        "Bassini: ligamento inguinal; McVay: Cooper (femoral); Shouldice: jaquetão; Lichtenstein: tela sem tensão (padrão adulto)",
        "Femoral: abaixo do ligamento inguinal; é a que mais estrangula",
      ],
      pegadinhas: [
        "Femoral em IIIB (é IIIC)",
        "Chamar de estrangulada uma hérnia só irredutível (lactente bem, pele normal)",
        "Inverter medial/lateral aos vasos epigástricos",
        "Mandar encarcerada para o ambulatório",
      ],
    },
    {
      id: "diverticulite",
      titulo: "Diverticulite",
      questoes: 3,
      algoritmos: [
        {
          titulo: "Diverticulite complicada: Hinchey, tamanho do abscesso e conduta",
          passos: [
            cenario("Diverticulite aguda complicada"),
            decisao(
              "Abscesso ou peritonite?",
              ramo(
                "Abscesso: Hinchey I (pericólico) ou II (pélvico / à distância)",
                decisao(
                  "Tamanho e acesso para drenar?",
                  ramo("Menor que 4–5 cm", conduta("Tentar antibiótico isolado")),
                  ramo("A partir de 4–5 cm, acessível", conduta("Antibiótico + drenagem percutânea guiada por imagem")),
                  ramo("A partir de 4–5 cm, sem acesso", conduta("Antibiótico e vigilância de perto"))
                )
              ),
              ramo(
                "Peritonite: Hinchey III (purulenta) ou IV (fecal)",
                conduta("Cirurgia de urgência"),
                conduta("Hartmann no crítico ou com muitas comorbidades; ressecção com anastomose primária no estável")
              )
            ),
            atencao("Abscesso sem melhora clínica ou com piora: reavaliar com imagem e discutir cirurgia"),
          ],
        },
      ],
      oQueCai: [
        "Quadro: dor em FIE + febre + leucocitose, > 50 anos; exame de escolha: TC de abdome e pelve com contraste",
        "Colonoscopia/enema na fase aguda: evitar; colonoscopia 6–8 semanas depois, se indicada",
        "Hinchey: I pericólico; II pélvico/à distância; III peritonite purulenta (abscesso rompido); IV fecal (perfuração livre)",
        "Abscesso < 4–5 cm: antibiótico; ≥ 4–5 cm: antibiótico + drenagem percutânea; sem acesso: antibiótico e vigilância",
        "III e IV: cirurgia de urgência; Hartmann no crítico, anastomose primária (± estoma) no estável",
        "Antibiótico: gram-negativos + anaeróbios (ceftriaxona + metronidazol); não complicada: seletivo",
        "Disúria/pneumatúria: irritação ou fístula colovesical",
      ],
      pegadinhas: [
        "Acertar o estágio e errar a conduta: 'Hinchey II e videolaparoscopia', 'Hinchey III e antibiótico'",
        "Trocar III por IV (purulenta × fecal)",
        "Abscesso pélvico como estádio I; drenar todo II sem olhar tamanho e acesso",
      ],
    },
    {
      id: "cancer-gastrico",
      titulo: "Câncer gástrico",
      questoes: 2,
      algoritmos: [
        {
          titulo: "Tratamento pelo estádio (diretriz japonesa)",
          passos: [
            cenario("Câncer gástrico: avaliar T, N e risco de metástase linfonodal"),
            decisao(
              "T1a dentro do critério endoscópico?",
              ramo(
                "Sim",
                conduta("Ressecção endoscópica (ESD)"),
                atencao("eCura C-2 (não curativa) → gastrectomia com linfadenectomia")
              ),
              ramo(
                "Não",
                decisao(
                  "cT1 N0?",
                  ramo("Sim", conduta("Gastrectomia + D1 ou D1+")),
                  ramo("N+ ou ≥ cT2", conduta("Gastrectomia + D2"))
                )
              )
            ),
            atencao("Avançado com suspeita de implante peritoneal: laparoscopia diagnóstica antes"),
          ],
        },
      ],
      quadros: [
        {
          titulo: "Lauren: intestinal × difuso",
          colunas: ["", "Intestinal", "Difuso"],
          linhas: [
            ["Histologia", "Glândulas", "Anel de sinete"],
            ["Perfil", "Idoso, homem, antro", "Jovem, sangue tipo A, CDH1"],
            ["Precursor", "Atrofia e metaplasia (H. pylori)", "Sem lesão precursora clara"],
            ["Disseminação", "Hematogênica (fígado)", "Linfática e peritoneal"],
            ["Prognóstico", "Melhor", "Pior"],
          ],
        },
      ],
      oQueCai: [
        "Borrmann: I polipoide; II ulcerado, bordas nítidas; III úlcero-infiltrativo (o mais comum); IV infiltrativo difuso (linite)",
        "Borrmann = macroscopia (endoscopia); Lauren = histologia; TNM = estadiamento",
        "Ressecção endoscópica clássica: diferenciado, T1a, sem úlcera, até 2 cm",
        "ESD absoluta (6ª ed.): diferenciado sem úlcera > 2 cm; diferenciado com úlcera ≤ 3 cm; indiferenciado sem úlcera ≤ 2 cm (T1a)",
        "cT1 N0 fora do critério: D1/D1+; cT1 N+ ou cT2 em diante: D2",
        "Margem proximal T2+: 3 cm se expansivo (Borrmann I–II), 5 cm se infiltrativo (III–IV)",
      ],
      pegadinhas: [
        "Pedir a característica do intestinal listando três do difuso: sobra a disseminação hematogênica",
        "Trocar Borrmann III por IV (ambos infiltram) ou III por II (ambos ulceram)",
        "D2 para todo T1, D1 para T1 N+, ou eCura C-2 só com seguimento",
      ],
    },
    {
      id: "bariatrica",
      titulo: "Cirurgia bariátrica",
      questoes: 1,
      quadros: [
        {
          titulo: "Escolha da técnica",
          colunas: ["Técnica", "Ponto-chave"],
          linhas: [
            ["Bypass gástrico em Y de Roux", "Refluxo/esofagite + DM2: trata os dois"],
            ["Gastrectomia vertical (sleeve)", "Pode piorar ou criar refluxo: evitar com esofagite"],
            ["Banda gástrica", "Abandonada (resultado fraco, muitas complicações)"],
            ["Derivação biliopancreática", "Muito disabsortiva; obesidade extrema; mais desnutrição"],
          ],
        },
      ],
      oQueCai: [
        "Obeso com refluxo/esofagite + DM2 → bypass gástrico em Y de Roux",
        "Indicação (CFM 2025): IMC ≥ 40; IMC ≥ 35 com doença agravada pela obesidade",
        "IMC 30–35 só com doenças da lista: DM2, apneia grave, doença cardiovascular grave, refluxo com indicação cirúrgica",
        "Sleeve = tubo de alta pressão: empurra ácido para cima",
      ],
      pegadinhas: [
        "Oferecer a gastrectomia vertical (a mais realizada) a quem tem esofagite",
        "Banda gástrica como boa opção: foi abandonada",
      ],
    },
    {
      id: "cancer-prostata",
      titulo: "Câncer de próstata",
      questoes: 1,
      quadros: [
        {
          titulo: "Risco de D'Amico",
          colunas: ["Risco", "PSA (ng/mL)", "Gleason", "T clínico"],
          linhas: [
            ["Baixo (todos)", "< 10", "≤ 6", "T1–T2a"],
            ["Intermediário (qualquer)", "10–20", "7", "T2b"],
            ["Alto (qualquer)", "> 20", "≥ 8", "≥ T2c"],
          ],
        },
      ],
      oQueCai: [
        "D'Amico = 3 itens: PSA, Gleason e estádio clínico T",
        "Idade não entra (pesa na escolha do tratamento, não no risco)",
        "Vale o pior critério: um item alto já põe no grupo alto",
        "Baixo risco exige os três favoráveis ao mesmo tempo",
      ],
      pegadinhas: [
        "Acrescentar 'idade do paciente' aos três parâmetros",
        "Chamar de baixo risco com um só item intermediário",
      ],
    },
    {
      id: "ulcera-h-pylori",
      titulo: "Doença ulcerosa e H. pylori",
      questoes: 1,
      quadros: [
        {
          titulo: "Erradicação: IV × V Consenso Brasileiro",
          colunas: ["", "IV Consenso (2018)", "V Consenso (2026)"],
          linhas: [
            ["1ª linha", "IBP + amoxicilina 1 g + claritromicina 500 mg, tudo 12/12 h", "Quádrupla com bismuto: IBP ou vonoprazana + bismuto + tetraciclina + metronidazol"],
            ["Duração", "14 dias", "10–14 dias (pense em 14)"],
            ["Claritromicina", "1ª linha (cobrada na prova de 2024)", "Só com vonoprazana ou sensibilidade conhecida"],
          ],
        },
      ],
      oQueCai: [
        "Úlcera péptica com H. pylori positivo: erradicar; ler qual consenso o enunciado cita",
        "Controle de cura: teste respiratório ou antígeno fecal, ≥ 4 semanas após antibiótico e ≥ 2 semanas sem IBP",
        "Perfurada: dor epigástrica súbita, abdome em tábua; Jobert = some a macicez hepática",
        "Suspeita de perfuração: TC; RX em pé se TC indisponível; sem ar livre e suspeita → repetir com contraste hidrossolúvel",
        "Perfuração < 2 cm: sutura primária + omento (Graham); > 2 cm: individualizar pelo local",
        "Via: laparoscopia no estável; aberta no instável",
      ],
      pegadinhas: [
        "7 dias, amoxicilina 500 mg ou levofloxacino/azitromicina na 1ª linha do IV Consenso",
        "Radiografia sem pneumoperitônio exclui perfuração",
        "Gastrectomia para toda úlcera perfurada ou ressecção para toda perfuração > 2 cm",
      ],
    },
    {
      id: "doenca-venosa",
      titulo: "Doença venosa crônica",
      questoes: 1,
      quadros: [
        {
          titulo: "CEAP: classe clínica (C)",
          colunas: ["Classe", "Achado"],
          linhas: [
            ["C0–C1", "Sem sinais / telangiectasias e veias reticulares"],
            ["C2", "Varizes (≥ 3 mm)"],
            ["C3", "Edema"],
            ["C4", "Pele: a pigmentação/eczema; b lipodermatoesclerose/atrofia branca; c coroa flebectásica"],
            ["C5", "Úlcera cicatrizada"],
            ["C6", "Úlcera ativa (aberta)"],
          ],
        },
      ],
      oQueCai: [
        "Classifica-se pelo achado mais grave, mesmo com outros coexistindo",
        "Úlcera aberta = C6, ainda que limpa, granulada e sem infecção",
        "Úlcera cicatrizada (fechada) = C5",
        "Dermatite ocre, eczema, lipodermatoesclerose = C4 (só se nunca houve úlcera)",
        "C3 edema; C2 varizes ≥ 3 mm; C1 telangiectasias/reticulares",
      ],
      pegadinhas: [
        "Úlcera com 'fundo granulado, sem infecção' para induzir C5 (é C6)",
        "Citar dermatite ocre e edema para induzir C4 ou C3",
      ],
    },
  ],
  raioX: {
    regras: [
      { tema: "Tumores periampulares", texto: "Ressecável: cirurgia direta + QT adjuvante. Não drenar a via biliar de rotina; só com colangite, IR ou coagulopatia grave, ou cirurgia que vai atrasar (inclui neoadjuvância)." },
      { tema: "Rastreamento do câncer colorretal", texto: "Risco habitual: 45 anos (sociedades americanas) ou 50–75 (Brasil); colonoscopia normal repete em 10 anos. Familiar: aos 40 ou 10 anos antes do parente mais jovem." },
      { tema: "Câncer de cólon: ressecção", texto: "Cirurgia primeiro, QT adjuvante conforme estádio; ligadura dos vasos na origem, margem de 5 cm, mínimo 12 linfonodos. Reto alto trata-se igual." },
      { tema: "Câncer de reto extraperitoneal", texto: "Neoadjuvância se T3/T4, N+, tumor junto ao esfíncter ou fáscia mesorretal ameaçada. Cirurgia = excisão total do mesorreto; resposta clínica completa → watch and wait." },
      { tema: "Aneurisma de aorta abdominal", texto: "Aneurisma ≥ 3,0 cm. Correção eletiva ≥ 5,5 cm no homem e ≥ 5,0 cm na mulher; sintomático → correção urgente. Massa pulsátil estável: 1º exame é o ultrassom." },
    ],
  },
  regrasRelampago: [
    { tema: "Cicatrização", titulo: "Resolvinas e vitamina C", texto: "Resolvinas (derivadas do ômega-3) freiam a chegada de leucócitos e encerram a inflamação. Vitamina C: cofator da hidroxilação de prolina e lisina; sem ela, procolágeno instável → deiscência." },
    { tema: "Invaginação", titulo: "Lactente: quadro, US e redução", texto: "Lactente (6–12 meses), cólica + vômitos + fezes em geleia de groselha; causa idiopática, não Meckel. Ultrassom (alvo); se estável, redução por enema guiada por imagem." },
    { tema: "Invaginação", titulo: "Criança maior: ponto-guia", texto: "Acima de ~2–3 anos ou recorrente: procurar ponto-guia (emagrecimento + massa = linfoma). Idade não indica cirurgia; estável: enema e investigar; grave/obstruída: operar." },
    { tema: "Litíase urinária", titulo: "Cólica ureteral × apendicite", texto: "Dor flanco → fossa ilíaca com irradiação para coxa/genitália + hematúria = cálculo ureteral. Raio-X normal não exclui; melhor exame no adulto: TC sem contraste." },
    { tema: "Apendicite", titulo: "Reconhecimento clínico", texto: "Dor periumbilical que migra para FID + anorexia + febre baixa + Blumberg; ausência de migração não exclui. Dúvida: ultrassom em criança e gestante, tomografia no adulto." },
    { tema: "Câncer de esôfago", texto: "Tabaco + álcool → espinocelular, terço médio/superior. Refluxo, Barrett, obesidade → adenocarcinoma distal. Disfagia progressiva em idoso: endoscopia com biópsia." },
    { tema: "Doença inflamatória intestinal", titulo: "Crohn com peritonite", texto: "Crohn é transmural: Crohn + dor intensa + febre + peritonite = perfuração até prova em contrário; urgência cirúrgica, sem aumentar imunossupressor antes de excluir sepse." },
    { tema: "Fístulas digestivas", titulo: "Como investigar", texto: "TC com contraste tem boa acurácia (coleção, trajeto). Contraste oral hidrossolúvel, não bário. Azul de metileno no dreno confirma: quase não dá falso-positivo (o problema é o falso-negativo). Endoscopia precoce é segura." },
    { tema: "Lesões hepáticas", titulo: "HNF × adenoma", texto: "HNF: hipervascular, cicatriz central, retém contraste hepatobiliar; típica assintomática: só acompanhar. Adenoma: anticoncepcional, sangra/maligniza, em geral não retém." },
    { tema: "Melanoma", titulo: "Margem e linfonodo sentinela", texto: "Manda o Breslow: > 2 mm → margem 2 cm; ≤ 1 mm → 1 cm; in situ 0,5–1 cm. Linfonodo clínico negativo e Breslow ≥ 1 mm → sentinela; positivo: esvaziamento não é automático." },
    { tema: "Obstrução intestinal", titulo: "Regra 3-6-9 no raio-X", texto: "Dilatado se: delgado > 3 cm, cólon > 6 cm, ceco > 9 cm; ceco acima de 12 cm = alto risco de perfuração (não é o início da dilatação)." },
    { tema: "Queimaduras", titulo: "SCQ adulto × criança", texto: "Adulto: cabeça 9%, perna 18%, períneo 1%. Lactente: cabeça 18%, cada perna 14%, braços e tronco iguais, sem períneo à parte. Cálculo real em criança: Lund–Browder; 1º grau não conta." },
  ],
};
