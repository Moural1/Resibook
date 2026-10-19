import { atencao, avaliar, cenario, conduta, decisao, ramo, type AreaFluxos } from "./tipos.ts";

export const CLINICA: AreaFluxos = {
  id: "clinica",
  nome: "Clínica Médica",
  temas: [
    {
      id: "anemias",
      titulo: "Anemias",
      questoes: 7,
      revisar: [
        "Clampeamento imediato do cordão NÃO é fator de risco para anemia macrocítica: dá ferropriva (microcítica). Pirimetamina, leite de cabra e doença celíaca levam à falta de folato, e daí à macrocitose.",
      ],
      algoritmos: [
        {
          titulo: "Anemia: do VCM e da hemólise até a causa",
          passos: [
            cenario("Anemia a esclarecer"),
            avaliar("VCM e sinais de hemólise: icterícia (bilirrubina indireta alta), reticulócitos altos, LDH alto"),
            decisao(
              "Qual o padrão?",
              ramo(
                "VCM baixo (microcítica e hipocrômica)",
                conduta("Pensar em ferropriva: ferritina baixa confirma"),
                atencao("Com inflamação, ferritina normal ou alta não exclui: indício se < 30 µg/L (menor de 5 anos) ou < 70 µg/L (5 anos ou mais)")
              ),
              ramo("VCM alto (macrocítica)", conduta("Pensar em deficiência de B12 ou folato")),
              ramo(
                "Sinais de hemólise",
                decisao(
                  "Coombs direto?",
                  ramo("Positivo", conduta("Hemólise imune: procurar a causa. Autoimune por anticorpo quente: glicocorticoide")),
                  ramo("Negativo + microesferócitos", conduta("Esferocitose hereditária: CHCM alta (> 36 g/dL) e cálculo biliar de bilirrubinato"))
                )
              )
            ),
          ],
        },
      ],
      oQueCai: [
        "VCM primeiro: ferropriva = microcítica e hipocrômica; falta de B12 ou folato = macrocítica",
        "Ferro profilático (SBP, prova 2024): a termo sem risco, 1 mg/kg/dia do 6º mês (180 dias) até 24 meses; com fator de risco, desde o 3º mês (90 dias)",
        "Referência atual (SBP 17/03/2026): 10–12,5 mg/dia de ferro elementar, 2 ciclos de 3 meses, aos 6 e aos 12 meses. Sem ano na questão: use esta",
        "Dose de tratamento da anemia ferropriva: 3 a 6 mg/kg/dia (não é profilaxia)",
        "Ferritina com inflamação (OMS): deficiência se < 30 µg/L no menor de 5 anos; < 70 µg/L a partir dos 5 anos",
        "Coombs direto + hemólise = imune; autoimune por anticorpo quente: glicocorticoide na 1ª linha",
        "Esferocitose: Coombs negativo + microesferócitos; CHCM > 36 g/dL; cálculo biliar de bilirrubinato",
        "Síndrome torácica aguda: internar; O₂ se hipoxemia, analgesia, hidratação, ATB com atípicos; transfusão simples se hipoxemia/queda de Hb; troca se grave",
      ],
      pegadinhas: [
        "Macrocítica: clampeamento imediato do cordão NÃO é fator de risco (dá ferropriva, não macrocítica)",
        "Ferro: 3º mês é para quem tem fator de risco; 5 mg/kg é dose de tratamento",
        "Esferocitose: banca oferece VCM alto, HbF alta ou RDW normal no lugar da CHCM alta",
        "Síndrome torácica aguda: 'observar 24 h e evitar transfusão' com saturação de 90% está errado",
      ],
    },
    {
      id: "geriatria",
      titulo: "Geriatria",
      questoes: 4,
      quadros: [
        {
          titulo: "Delirium × demência",
          colunas: ["", "Delirium", "Demência"],
          linhas: [
            ["Início", "Horas a dias", "Meses a anos"],
            ["Curso", "Flutua no dia (piora à noite)", "Progressivo"],
            ["Atenção", "Alterada desde o início", "Preservada no começo"],
            ["Diagnóstico", "Clínico: CAM = 1 + 2 + (3 ou 4)", "Perda cognitiva + perda de função"],
            ["Conduta", "Achar e tratar a causa (exames + revisão de remédios)", "Acompanhar"],
          ],
        },
      ],
      oQueCai: [
        "Alzheimer: memória recente, piora lenta e progressiva por anos (rampa). Vascular: degraus, AVC ou sinal focal",
        "Leucoaraiose sozinha não basta para demência vascular (é comum no idoso)",
        "TSH pouco alto com T4 livre normal (subclínico) não explica declínio de anos: repetir o exame",
        "VDRL 1:2 estável após tratamento = cicatriz sorológica; líquor se sem tratamento documentado, título subindo ou sinal neurológico/ocular",
        "CAM: (1) início agudo e flutuante + (2) desatenção + [(3) pensamento desorganizado ou (4) consciência alterada]",
        "Demência predispõe; precipitantes: infecção, remédio (cefepime), fecaloma, retenção urinária, dor, hipóxia",
        "Mais causam delirium: anticolinérgicos (difenidramina, tricíclicos, oxibutinina); benzodiazepínico também piora",
        "Alucinação visual aguda e flutuante no idoso internado = delirium até prova em contrário",
      ],
      pegadinhas: [
        "Distratores ancorados no enunciado: leucoaraiose (vascular), TSH 6,1 (hipotireoidismo), VDRL 1:2 (neurossífilis)",
        "Quadro abrupto e flutuante 'psiquiátrico ou da demência': é delirium",
        "'Delirium dispensa exames': errado, procurar a causa em todos",
        "Difenidramina e benzodiazepínico 'para todos': pioram o delirium",
      ],
    },
    {
      id: "pancreatite",
      titulo: "Pancreatite",
      questoes: 4,
      revisar: [
        "Primeiras 24 h: Ringer lactato 250–500 mL/h; morfina liberada (não é 'opioide exceto morfina'); sem antibiótico; dieta oral/enteral cedo.",
        "Diagnóstico: dor + enzima > 3× já basta (imagem não obrigatória). Delgado distendido com níveis e peristaltismo diminuído = íleo reacional, não brida. ALT alta = causa biliar.",
      ],
      algoritmos: [
        {
          titulo: "Pancreatite aguda: do diagnóstico à coleção",
          passos: [
            cenario("2 de 3: dor típica; amilase ou lipase > 3× o limite; imagem compatível"),
            avaliar("ALT alta → causa biliar"),
            avaliar("Gravidade em 24 h: BISAP (BUN > 25, mental, SIRS, idade > 60, derrame pleural); ≥ 3 = maior risco"),
            conduta("Ringer lactato pela resposta; dieta oral/enteral precoce; opioide (morfina liberada); sem ATB profilático"),
            decisao(
              "Coleção na imagem: infecção, sintoma persistente ou complicação?",
              ramo("Sim", conduta("Intervir; preferir esperar a parede (~4 semanas), salvo infecção com piora")),
              ramo("Não", conduta("Observar e repetir a imagem"))
            ),
            atencao("Tamanho isolado não indica drenagem"),
          ],
        },
      ],
      oQueCai: [
        "Diagnóstico = 2 de 3: dor típica; amilase ou lipase > 3 vezes o limite; imagem. Imagem não obrigatória se já há dor + enzima",
        "BISAP (1 ponto cada): BUN > 25 mg/dL; estado mental alterado; SIRS; idade > 60 anos; derrame pleural. ≥ 3 = maior risco de morte",
        "BUN não é ureia: BUN 25 ≈ ureia 53 mg/dL",
        "Hidratação: Ringer lactato ajustado por PA, diurese, ureia e hematócrito; na questão de 2021: 250 a 500 mL/h",
        "Sem antibiótico profilático (febre e leucocitose iniciais = inflamação); dieta oral/enteral precoce, parenteral só se falhar",
        "≤ 4 semanas, sem parede: coleção líquida aguda (sem necrose) ou necrótica aguda (com necrose)",
        "> 4 semanas, com parede: pseudocisto (sem necrose) ou necrose delimitada/walled-off. Quem define é a parede na imagem",
      ],
      pegadinhas: [
        "'Imagem obrigatória para confirmar': falso, bastam 2 de 3",
        "Nível hidroaéreo no delgado pode ser íleo reacional: não confirma brida",
        "Erradas: meropenem pela febre, jejum + parenteral precoce, 'opioide exceto morfina'",
        "Coleção com 2 semanas: laparotomia, drenagem ou endoscopia já = errado; observar",
      ],
    },
    {
      id: "diabetes",
      titulo: "Diabetes mellitus",
      questoes: 4,
      algoritmos: [
        {
          titulo: "Cetoacidose diabética: volume, potássio, insulina",
          passos: [
            cenario("Cetoacidose: glicemia ≥ 200 mg/dL ou diabetes conhecido + cetona + acidose"),
            conduta("1º Volume: cristaloide isotônico, 500 a 1.000 mL/h nas primeiras 2 a 4 h"),
            decisao(
              "2º Potássio inicial?",
              ramo("< 3,5 mmol/L", conduta("Repor potássio e adiar a insulina")),
              ramo("3,5 a 5,0 mmol/L", conduta("Insulina + potássio no soro, para manter 4 a 5 mmol/L")),
              ramo("> 5,0 mmol/L", conduta("Insulina; não repor; medir de novo"))
            ),
            conduta("3º Insulina regular venosa contínua, 0,1 U/kg/h"),
            conduta("Glicemia < 250 mg/dL: somar glicose a 5–10% e manter a insulina"),
            atencao("Bicarbonato só com pH < 7,0. Resolveu quando cetose e acidose cederam, não a glicemia"),
          ],
        },
      ],
      oQueCai: [
        "Diabetes: sintomas + ao acaso ≥ 200; jejum ≥ 126; TOTG 2 h ≥ 200; TOTG 1 h ≥ 209 (mg/dL); HbA1c ≥ 6,5%",
        "Sem sintomas: repetir o exame; jejum ≥ 126 + HbA1c ≥ 6,5% na mesma coleta já confirmam",
        "MODY 2 (GCK): jovem magro, jejum 100–125 estável, AD, anticorpos negativos: em geral sem remédio. MODY 3 (HNF1A): progressivo, sulfonilureia",
        "MODY 2 na gestação: feto sem a mutação → macrossomia → insulina se crescimento acelerado no US; feto com a mutação: não tratar",
        "Internado: hiperglicemia > 140; insulina se persistente > 180; meta 100–180. Comendo: basal + bolus + correção; jejum: basal + correção",
        "CAD: glicemia ≥ 200 ou DM; beta-hidroxibutirato ≥ 3,0 mmol/L ou cetonúria ≥ 2+; pH < 7,3 ou bicarbonato < 18 mmol/L",
        "CAD: volume 500–1.000 mL/h (2–4 h); K < 3,5 repor e adiar insulina; insulina 0,1 U/kg/h; glicemia < 250 → glicose 5–10%; bicarbonato só pH < 7,0",
        "CAD resolvida: cetona < 0,6 mmol/L com pH ≥ 7,3 ou bicarbonato ≥ 18; basal SC 1–2 h antes de desligar a venosa",
      ],
      pegadinhas: [
        "126 (jejum) ou 140 oferecidos como corte da glicemia ao acaso: o corte é 200",
        "MODY 2 tratado com sulfonilureia (MODY 3), insulina (DM1) ou metformina (DM2): não precisa",
        "Internado: só escala móvel de insulina rápida ou religar orais na doença aguda",
        "CAD: insulina com K 3,0; parar insulina com glicemia 200; bicarbonato com pH 7,15",
      ],
    },
    {
      id: "cirrose",
      titulo: "Cirrose e complicações",
      questoes: 3,
      quadros: [
        {
          titulo: "Ascite: GASA (albumina do soro − albumina da ascite)",
          colunas: ["GASA", "Mecanismo", "Exemplos"],
          linhas: [
            ["≥ 1,1 g/dL", "Hipertensão portal", "Cirrose, IC, Budd-Chiari, esteatose hepática aguda da gravidez"],
            ["< 1,1 g/dL", "Peritônio ou vazamento", "Carcinomatose, tuberculose, pancreática, biliar, linfática, infarto intestinal, nefrótica"],
          ],
        },
      ],
      oQueCai: [
        "GASA = albumina do soro − albumina da ascite",
        "GASA ≥ 1,1 g/dL = hipertensão portal (cirrose, IC, Budd-Chiari, esteatose hepática aguda da gravidez)",
        "GASA < 1,1 g/dL = peritônio/vazamento (carcinomatose, TB, pâncreas, biliar, linfática, infarto intestinal, nefrótica)",
        "Encefalopatia hepática: hepatopata ou etilista com confusão + flapping; causa = amônia não depurada",
        "Lactulose (1ª linha): bactérias do cólon → ácidos lático e acético; NH₃ vira NH₄⁺ (não absorvível) e sai nas fezes",
        "Lactulose não é antibiótico (esse é a rifaximina) e não age no cérebro",
      ],
      pegadinhas: [
        "Três causas de GASA baixo (biliar, linfática, infarto intestinal) + esteatose aguda da gravidez como única de GASA alto",
        "Lactulose com papel de flumazenil, rifaximina ou estimulante do ciclo da ureia: errado",
      ],
    },
    {
      id: "insuficiencia-cardiaca",
      titulo: "Insuficiência cardíaca",
      questoes: 3,
      quadros: [
        {
          titulo: "IC de fração reduzida: a base e quando entra cada extra",
          colunas: ["Recurso", "Quando entra", "Detalhe"],
          linhas: [
            ["Quatro classes: IECA, BRA ou sacubitril-valsartana + betabloqueador + espironolactona + iSGLT2", "Base para todos, desde o início", "O iSGLT2 não espera o paciente continuar sintomático e não depende de diabetes"],
            ["Diurético de alça", "Só enquanto houver congestão", "Não é pilar"],
            ["Sacubitril-valsartana", "Preferido ao IECA/BRA na classe funcional II–III, quando possível", "Ao trocar um IECA, esperar 36 h"],
            ["Ivabradina", "FE ≤ 35% + ritmo sinusal + FC ≥ 70 bpm", "Já com betabloqueador na dose tolerada"],
            ["Hidralazina + nitrato", "Autodeclarado negro em classe III–IV, ou quem não pode usar IECA/BRA/sacubitril-valsartana", "No primeiro caso, já com a base otimizada"],
            ["Desfibrilador (CDI), prevenção primária", "FE ≤ 35% + classe II–III apesar da terapia otimizada + ≥ 40 dias depois de infarto + expectativa de vida > 1 ano", "Reavaliar a FE após 3 a 6 meses"],
            ["Ressincronizador", "FE ≤ 35% + ritmo sinusal + sintomas apesar da terapia otimizada", "Forte: bloqueio de ramo esquerdo com QRS ≥ 150 ms. Mais fraca: ramo esquerdo com 120–149 ms, ou QRS ≥ 150 ms sem padrão de ramo esquerdo"],
          ],
        },
      ],
      oQueCai: [
        "FE reduzida: quarteto desde o início (betabloqueador + IECA/BRA/sacubitril-valsartana + espironolactona + iSGLT2), mesmo sem diabetes",
        "Betabloqueador só carvedilol, bisoprolol ou metoprolol succinato; atenolol: trocar, não aumentar",
        "Diurético de alça só alivia congestão; digoxina só reduz internação; anlodipino não muda prognóstico; AINE piora IC",
        "Sacubitril-valsartana preferido em CF II–III; ao trocar do IECA esperar 36 h. IECA: vigiar creatinina e potássio",
        "Ivabradina: FE ≤ 35% + ritmo sinusal + FC ≥ 70 bpm com betabloqueador na dose tolerada",
        "Hidralazina + nitrato: negro autodeclarado em CF III–IV com base otimizada, ou quem não pode usar IECA/BRA/ARNI",
        "CDI primário: FE ≤ 35% + CF II–III após otimizar (reavaliar em 3–6 meses) + ≥ 40 dias pós-infarto + expectativa > 1 ano",
        "Ressincronizador: FE ≤ 35% + sinusal + sintomas; forte se BRE com QRS ≥ 150 ms; fraca se BRE 120–149 ms ou QRS ≥ 150 sem BRE",
      ],
      pegadinhas: [
        "Diretriz de 2018 soma iSGLT2/ARNI só se sintomático: hoje vale o quarteto desde o início",
        "Aumentar atenolol (tem de trocar) ou trocar para carvedilol e pôr anlodipino",
        "IECA 'promove vasoconstrição'; diurético ou digoxina como se reduzissem mortalidade",
        "Ivabradina na FA; ressincronizador com QRS estreito; CDI antes de otimizar o tratamento",
      ],
    },
  ],
  raioX: {
    regras: [
      { tema: "Síndrome coronariana aguda", texto: "ECG separa com supra (reperfusão imediata, sem esperar troponina) do resto; troponina separa infarto sem supra (positiva) de angina instável (negativa)." },
      { tema: "Dissecção aguda de aorta", texto: "Dor súbita, lancinante, máxima desde o início, para o dorso, com assimetria de pulsos/PA; HAS é o principal fator. Supra de ST não exclui: não dar fibrinolítico antes de afastar." },
      { tema: "Pericardite aguda", texto: "Dor pleurítica que melhora sentado e inclinado para a frente + ≥ 1 achado (atrito, ECG, PCR alta, derrame, RM). ECG: supra de ST difuso côncavo + infra de PR; eco é o 1º exame." },
      { tema: "Endocardite: critérios de Duke", texto: "Definida: 2 maiores, 1 maior + 3 menores ou 5 menores; possível: 1 maior + 1–2 menores ou 3–4 menores. Osler doloroso (imunológico); Janeway indolor (vascular)." },
      { tema: "Endocardite: quando operar", texto: "IC (principal; edema refratário ou choque = emergência em 24 h), infecção não controlada (abscesso, hemoculturas positivas após ~1 semana) e embolia (vegetação ≥ 10 mm + embolia ou outra indicação)." },
      { tema: "Pneumonia comunitária: diagnóstico e escores", texto: "Clínica + opacidade nova (sem padrão-ouro). CURB-65: 0–1 ≈ 1,5%, 2 ≈ 9%, ≥ 3 ≈ 22% (4–5: avaliar UTI); PSI I–II ambulatório, IV–V internar." },
      { tema: "Pneumonia comunitária: duração e Pseudomonas", texto: "Estável: < 5 dias (mínimo 3); ≥ 5 dias se grave. Anaeróbio só se abscesso/empiema. Pseudomonas se isolamento prévio ou internação com ATB venoso em 90 dias; ceftriaxona não cobre." },
      { tema: "Infecção urinária", texto: "Complicada = febre, calafrio, dor lombar, repercussão sistêmica ou cateter (homem ou mulher). Cistite: fosfomicina ou nitrofurantoína, que não tratam pielonefrite; complicada: 5–7 dias com quinolona, 7 com os demais." },
      { tema: "Pielonefrite: tomografia", texto: "TC com contraste só se sepse/choque, cálculo, pH urinário ≥ 7,0, filtração ≤ 40 mL/min ou sem melhora em 48–72 h/recorrência. Nefrograma estriado é inespecífico." },
      { tema: "Sepse-3 e SOFA", texto: "Sepse = infecção + aumento agudo ≥ 2 pontos no SOFA. Choque séptico = vasopressor para PAM ≥ 65 mmHg após volume + lactato > 2 mmol/L (os dois juntos)." },
      { tema: "Sepse: primeiras horas (SSC 2026)", texto: "Triagem com NEWS/MEWS/SIRS (qSOFA sozinho não); cristaloide balanceado ≥ 30 mL/kg em 3 h; PAM 65 (60–65 se ≥ 65 anos); antibiótico até 1 h no choque/sepse provável, até 3 h se possível." },
      { tema: "Choque séptico: vasopressores", texto: "Noradrenalina 1ª linha, cedo; associar vasopressina (até 0,03 U/min) quando a dose sobe; hidrocortisona com vasopressor mantido. Dopamina não é 1ª linha; vitamina C não trata sepse." },
      { tema: "Choque: os 4 tipos", texto: "Hipovolêmico, cardiogênico e obstrutivo: débito baixo e RVS alta (PVC baixa só no hipovolêmico). Distributivo: RVS baixa, débito normal ou alto." },
      { tema: "Choque: SvcO₂", texto: "Referência ≈ 70%; baixa = débito, Hb ou oxigenação baixos ou consumo alto, mesmo com PA normal. Alta com lactato alto = falha de extração (sepse tardia, cianeto, shunt)." },
      { tema: "Artrite reumatoide", texto: "Mulheres 3:1, 35–75 anos; rigidez matinal > 1 h (artrose ≤ 30 min). Pescoço de cisne = IFP hiperestendida + IFD fletida; botoeira é o inverso." },
      { tema: "DPOC: diagnóstico e grupos (GOLD 2026)", texto: "Exige VEF1/CVF pós-broncodilatador < 0,7. Grupo E = ≥ 1 exacerbação moderada ou grave no ano; A (mMRC 0–1 e CAT < 10) × B (mMRC ≥ 2 ou CAT ≥ 10)." },
      { tema: "DPOC: oxigênio domiciliar", texto: "PaO₂ ≤ 55 mmHg ou SaO₂ ≤ 88% em repouso, estável; ou PaO₂ 55–60 com cor pulmonale, edema ou Ht > 55%. Alvo SaO₂ ≥ 90%, ≥ 15 h/dia, reavaliar em 60–90 dias." },
    ],
    quadros: [
      {
        titulo: "Síndrome coronariana aguda: o que separa as três",
        colunas: ["", "Infarto com supra de ST", "Infarto sem supra de ST", "Angina instável"],
        linhas: [
          ["ECG", "Supra de ST persistente em derivações contíguas", "Sem supra persistente", "Não diferencia do infarto sem supra"],
          ["Troponina", "Não se espera para reperfundir", "Positiva (com curva)", "Negativa (sem necrose detectável)"],
          ["O que em geral traduz", "Oclusão coronariana aguda, isquemia transmural", "Oclusão parcial ou transitória; necrose costuma ser subendocárdica", "Quadro isquêmico sem necrose detectável"],
          ["Quem define", "O ECG: pede reperfusão imediata", "A troponina", "A troponina"],
        ],
      },
    ],
    algoritmos: [
      {
        titulo: "Sepse: antibiótico, volume e alvo de pressão nas primeiras horas",
        passos: [
          cenario("Suspeita de sepse na triagem: NEWS, NEWS2, MEWS ou SIRS (qSOFA sozinho não)"),
          decisao(
            "Qual a probabilidade, e há choque?",
            ramo("Choque séptico ou sepse provável", conduta("Antibiótico imediato, até 1 h")),
            ramo("Sepse possível, sem choque", conduta("Investigação rápida; antibiótico em até 3 h se a suspeita persistir")),
            ramo("Baixa probabilidade de infecção", conduta("Investigar antes; não dar antibiótico de rotina"))
          ),
          conduta("Hipoperfusão ou choque: sugere-se cristaloide, pelo menos 30 mL/kg nas primeiras 3 h; preferir balanceado"),
          conduta("Alvo inicial: PAM de 65 mmHg. Com ≥ 65 anos, sugere-se 60 a 65"),
          avaliar("Reavaliar a resposta: lactato seriado e tempo de enchimento capilar"),
          atencao("Controle do foco cedo, junto com antibiótico e volume: antibiótico sozinho não basta"),
        ],
      },
    ],
  },
  regrasRelampago: [
    { tema: "Distúrbios hidroeletrolíticos", titulo: "Hipercalemia com ECG anormal", texto: "ECG alterado (T apiculada, QRS largo): primeiro gluconato de cálcio IV (estabiliza membrana, não baixa K). Insulina + glicose/salbutamol deslocam para a célula; só diálise e resina removem." },
    { tema: "Distúrbios hidroeletrolíticos", titulo: "Hipercalcemia e hiperpara", texto: "Cálcio > 14 mg/dL: soro fisiológico 0,9% vigoroso primeiro, depois bifosfonato IV; furosemida só após hidratar e se sobrecarga. Hiperpara primário com litíase ou idade < 50 anos: paratireoidectomia." },
    { tema: "Intoxicações", titulo: "Opioide, organofosforado e salicilato", texto: "Opioide: miose + bradipneia → ventilar e naloxona. Atropina só trata o muscarínico (não reverte fasciculação/fraqueza). Salicilato: alcalose respiratória + acidose metabólica de ânion gap alto." },
    { tema: "Lúpus eritematoso sistêmico", titulo: "LES com nefrite", texto: "Anti-Sm é o mais específico; anti-DNA e C3/C4 baixos acompanham atividade renal. Exame fundamental do rim: biópsia renal. Quadro agudo com cilindros hemáticos = proliferativo (classes III/IV)." },
    { tema: "Arritmias", titulo: "QT longo por remédio", texto: "QTc > 500 ms = alto risco de torsades. Azitromicina + hidroxicloroquina somam risco. Conduta: suspender, corrigir K e Mg; sulfato de magnésio IV na torsades." },
    { tema: "Dislipidemia e risco CV", titulo: "Estatina: intensidade e mialgia", texto: "Placa carotídea (mesmo < 50%) → alta potência: atorvastatina 40–80 mg ou rosuvastatina 20–40 mg (LDL ↓ ≥ 50%). Mialgia por estatina: proximal, bilateral e simétrica; melhora ao suspender." },
    { tema: "Dislipidemia e risco CV", titulo: "Triglicérides altos", texto: "TG sobem com álcool, açúcar, obesidade, hipotireoidismo. Tratar: cortar álcool, perder peso, exercício aeróbico, reduzir carboidratos simples. Medida 'não indicada': dieta pobre em lipídios." },
    { tema: "Doença renal crônica", titulo: "Anemia e osso", texto: "Anemia normocítica normocrômica por falta de eritropoetina; checar ferro (ferritina, saturação) antes de tratar. Hiperpara secundário: fosfato alto, cálcio baixo → PTH sobe → osteíte fibrosa cística." },
    { tema: "Encefalopatias por deficiência", titulo: "Wernicke e tiamina", texto: "Etilista + confusão + ataxia = Wernicke (não exige tríade). Tiamina parenteral antes ou junto com a glicose; hipoglicemia grave: dar glicose e tiamina logo em seguida." },
    { tema: "Hepatites virais", titulo: "Sorologia das hepatites A e B", texto: "Hepatite A aguda: anti-HAV IgM. Vacinado B: só anti-HBs+. Infecção curada: anti-HBs e anti-HBc+ (anti-HBc não aparece com vacina). HBsAg+ = vírus B presente." },
    { tema: "Hepatites virais", titulo: "Hepatite C: antivirais de ação direta", texto: "Antivirais de ação direta curam > 95% e reduzem progressão para cirrose e CHC. Curou mas já tinha cirrose: continua rastreando CHC; cura não protege de reinfecção." },
    { tema: "Lesão renal aguda", titulo: "Anti-inflamatório e contraste", texto: "AINE fecha a arteríola aferente; IECA/BRA abrem a eferente. Prevenção por contraste: hidratação IV com soro fisiológico 0,9% antes e depois; acetilcisteína e furosemida não protegem." },
    { tema: "Litíase urinária", titulo: "Cálculo de ácido úrico", texto: "Radiotransparente no RX (aparece na TC); forma-se com pH urinário < 5,5. Dissolve com remédio: alcalinizar a urina (citrato de potássio ou bicarbonato) + hidratação." },
    { tema: "Neoplasia pulmonar", titulo: "Suspeita de câncer de pulmão", texto: "Tabagista com tosse, perda de peso e lesão de 3 cm na TC: próximo passo = tecido → broncoscopia com biópsia. Lavado sozinho, RX ou observar não fecham diagnóstico." },
    { tema: "Tireoide", titulo: "Hipotireoidismo subclínico e desejo de gestar", texto: "Subclínico: confirmar em 2–3 meses. Questão 2021: levotiroxina se infértil/tentando engravidar com TSH persistentemente alto; ASRM 2024 não recomenda. TSH ≥ 10: tratar sempre." },
    { tema: "AVC", titulo: "Novo AVC isquêmico com AVC há 5 semanas", texto: "AVC isquêmico nos últimos 3 meses contraindica trombólise (listas clássicas), não a trombectomia (pedir angio-TC). Sem reperfusão: AAS + estatina alta potência; tolerar PA até 220 × 120 mmHg." },
    { tema: "AVC", titulo: "AVC isquêmico extenso: dose de heparina", texto: "Infarto extenso com edema/desvio: anticoagulação plena adiada, mesmo com FA. Acamado: enoxaparina profilática. FA estável: sem cardioversão nem amiodarona de urgência." },
    { tema: "Anafilaxia", titulo: "Primeira dose e choque refratário", texto: "Adrenalina IM na coxa (adulto 0,3–0,5 mg), repetir a cada 5–15 min; resto é coadjuvante. Hipotensão após 3 doses: pernas elevadas + cristaloide + adrenalina IV contínua (vasopressina não é rotina)." },
    { tema: "HIV e oportunistas", titulo: "Pneumocistose", texto: "CD4 < 200 + tosse seca subaguda + hipoxemia + LDH alto. Sulfametoxazol-trimetoprima; + prednisona se PaO₂ < 70 mmHg ou gradiente A-a ≥ 35. Diferencial: histoplasmose e tuberculose." },
    { tema: "Abstinência alcoólica", titulo: "Delirium tremens e convulsão", texto: "2 a 4 dias sem beber + agitação, tremor, taquicardia = delirium tremens. Tratar com benzodiazepínico (lorazepam/diazepam IV); fenitoína não funciona, haloperidol sozinho não trata." },
    { tema: "Anticoagulação", titulo: "Varfarina e INR", texto: "Varfarina: dose ajustada pelo INR, alvo 2 a 3 na FA. Diretos não se ajustam por INR: dose por função renal, idade e peso; creatinina/clearance, hemograma e função hepática ao menos 1×/ano." },
    { tema: "Cefaleias", titulo: "Cefaleia em salvas", texto: "Homem jovem, dor orbitária unilateral 15 a 180 min, sinais autonômicos, inquieto. Crise: oxigênio a 100% + sumatriptano SC. Prevenção: verapamil." },
    { tema: "Hanseníase", titulo: "Diagnóstico e classificação operacional", texto: "Paucibacilar: até 5 lesões e baciloscopia negativa (6 doses); multibacilar: ≥ 6 lesões ou baciloscopia positiva (12 doses). Mesmas 3 drogas; gestação/amamentação não contraindicam." },
    { tema: "Hipertensão secundária", titulo: "Renovascular: exame inicial", texto: "Exame inicial: ultrassom com Doppler das artérias renais; confirmar com angio-TC/angio-RM; arteriografia = padrão-ouro se for intervir. Jovem = displasia fibromuscular; idoso = aterosclerose." },
    { tema: "Infecções de pele", titulo: "Celulite não purulenta", texto: "Sem pus, estável: estreptococo → cefalexina oral. Vancomicina só se grave ou risco de estafilococo resistente; abscesso = drenar; dor desproporcional/bolhas = necrosante (cirurgia)." },
    { tema: "Insuficiência hepática aguda", titulo: "Critérios do King's College", texto: "Não paracetamol: INR > 6,5 isolado ou 3 de 5. Paracetamol: pH < 7,30 após ressuscitação volêmica isolado, ou INR > 6,5 + creatinina > 3,4 mg/dL + encefalopatia III–IV em 24 h." },
    { tema: "Miastenia gravis", titulo: "Junção neuromuscular e mecanismo", texto: "Autoanticorpo contra o receptor nicotínico de acetilcolina pós-sináptico. Neurotransmissor = acetilcolina; retículo libera cálcio. Sintomático: piridostigmina (anticolinesterásico)." },
    { tema: "Neoplasias mieloproliferativas", titulo: "LMC: confirmação", texto: "Confirma com cromossomo Filadélfia t(9;22) = BCR-ABL (cariótipo, FISH ou PCR). Fase crônica: leucostase e doença extramedular raras; hiperviscosidade. Tratamento: imatinibe." },
    { tema: "Osteoporose", titulo: "Bifosfonatos: efeito de longo prazo", texto: "Uso prolongado: fratura atípica de fêmur (dor nova em coxa/virilha → RX do fêmur); também osteonecrose de mandíbula. Bifosfonato tende a baixar o cálcio (não causa hipercalcemia)." },
    { tema: "Pericárdio e miocárdio", titulo: "Constritiva × restritiva", texto: "Constritiva: grande variação respiratória dos fluxos, septal bounce, BNP normal/pouco elevado. Restritiva: parede espessada, brilho granular (amiloidose), BNP muito alto, HP mais importante." },
    { tema: "Síncope", titulo: "Síncope reflexa (vasovagal) de baixo risco", texto: "Jovem em pé, calor, pródromos, ECG normal: tranquilizar, hidratar, manobras de contrapressão; não interna. OESIL = 0. QTc 450 ms em mulher é normal (longo: > 460 mulher, > 450 homem)." },
    { tema: "Valvopatias", titulo: "Prolapso mitral e manobras", texto: "Clique mesossistólico + sopro tardio. Valsalva/ficar de pé (ventrículo menor): clique precoce, sopro maior. Agachar/elevar pernas: clique tardio, sopro menor. Hand grip não equivale." },
  ],
};
