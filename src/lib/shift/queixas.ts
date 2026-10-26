import type { NivelPrioridade } from "./triagem.ts";

/* Por queixa: sinais de alarme clicáveis (cada um com o nível de prioridade
   que sugere e a ação que dispara) e o kit que integra o caso ao resto do
   Resibook — calculadoras, fluxogramas e buscas de conduta, prescrição e CID.
   Sem doses: a conduta detalhada fica nas telas de Condutas e Prescrição. */

export type SinalAlarme = { id: string; texto: string; nivel: NivelPrioridade; acao?: string };

export type CalculadoraKit = {
  id: string;
  nome: string;
  motivo: string;
  /* Campos da calculadora que o caso consegue pré-preencher. */
  campos: string[];
  adulto?: boolean;
};

export type FluxoKit =
  | { colecao: "temas"; area: string; tema: string; titulo: string }
  | { colecao: "enamed"; area: string; bloco: string; titulo: string };

export type QueixaShift = {
  sinais: SinalAlarme[];
  calculadoras: CalculadoraKit[];
  fluxos: FluxoKit[];
  busca: { conduta: string; prescricao: string; cid: string };
};

const NEWS2: CalculadoraKit = {
  id: "news2",
  nome: "NEWS2",
  motivo: "Risco de deterioração com todos os sinais vitais",
  campos: ["rr", "spo2", "oxygen", "sbp", "pulse", "consciousness", "temperature"],
  adulto: true,
};
const QSOFA: CalculadoraKit = {
  id: "qsofa",
  nome: "qSOFA",
  motivo: "Risco de desfecho ruim na suspeita de infecção",
  campos: ["rr", "sbp", "altered"],
  adulto: true,
};
const CURB65: CalculadoraKit = {
  id: "curb65",
  nome: "CURB-65",
  motivo: "Gravidade e local de tratamento da pneumonia",
  campos: ["age", "rr", "sbp", "dbp", "confusion"],
  adulto: true,
};
const WELLS_TEP: CalculadoraKit = {
  id: "wells-pe",
  nome: "Wells TEP",
  motivo: "Probabilidade pré-teste de TEP antes do D-dímero",
  campos: ["heartRate"],
  adulto: true,
};
const GLASGOW: CalculadoraKit = { id: "glasgow", nome: "Glasgow", motivo: "Nível de consciência documentado", campos: [] };
const CHA2DS2VASC: CalculadoraKit = {
  id: "cha2ds2-vasc",
  nome: "CHA₂DS₂-VASc",
  motivo: "Anticoagulação se a síncope ou palpitação for por FA",
  campos: ["age"],
  adulto: true,
};
const CENTOR: CalculadoraKit = {
  id: "centor-mcisaac",
  nome: "Centor/McIsaac",
  motivo: "Faringite: quando testar ou tratar estreptococo",
  campos: ["age"],
};

const ENAMED_EMERGENCIA = "emergencia-pcr-choque-sepse-intoxicacoes";

export const QUEIXAS_SHIFT: Record<string, QueixaShift> = {
  "Dor torácica": {
    sinais: [
      { id: "dt-supra", texto: "ECG com supra de ST ou alteração isquêmica nova", nivel: "vermelho", acao: "Acionar o protocolo de IAM com supra e reperfusão." },
      { id: "dt-dissecao", texto: "Dor súbita, lancinante ou migratória para o dorso", nivel: "vermelho", acao: "Pensar dissecção: comparar pulsos e PA nos dois braços antes de antitrombótico." },
      { id: "dt-isquemica", texto: "Dor em aperto, irradiada para braço, mandíbula ou dorso", nivel: "laranja", acao: "ECG em até 10 minutos e troponina." },
      { id: "dt-associados", texto: "Sudorese, náusea, síncope ou dispneia associadas", nivel: "laranja", acao: "Monitorizar e repetir o ECG." },
      { id: "dt-tep", texto: "Dispneia súbita, taquicardia ou fator de risco para TEP", nivel: "laranja", acao: "Estimar a probabilidade (Wells) antes do D-dímero." },
      { id: "dt-pneumotorax", texto: "Dor pleurítica com murmúrio reduzido de um lado", nivel: "laranja", acao: "Pneumotórax: RX ou US de tórax." },
    ],
    calculadoras: [WELLS_TEP, NEWS2],
    fluxos: [
      { colecao: "enamed", area: "clinica-medica", bloco: "algoritmos-clinica-medica", titulo: "STEMI e FA — algoritmos" },
      { colecao: "enamed", area: "clinica-medica", bloco: "apostas-clinica-medica", titulo: "TEP — investigação por probabilidade" },
    ],
    busca: { conduta: "dor torácica", prescricao: "dor torácica", cid: "dor torácica" },
  },
  Dispneia: {
    sinais: [
      { id: "dp-esforco", texto: "Fala entrecortada, tiragem ou uso de musculatura acessória", nivel: "vermelho", acao: "Suporte ventilatório e sala de emergência." },
      { id: "dp-exaustao", texto: "Cianose, sonolência, confusão ou exaustão", nivel: "vermelho", acao: "Risco de parada respiratória: preparar via aérea." },
      { id: "dp-anafilaxia", texto: "Estridor, edema de face ou língua, urticária após exposição", nivel: "vermelho", acao: "Anafilaxia: adrenalina IM sem atraso." },
      { id: "dp-congestao", texto: "Ortopneia, estertores e edema (congestão)", nivel: "laranja", acao: "Perfil hemodinâmico da IC aguda." },
      { id: "dp-dor-hemoptise", texto: "Dor torácica ou hemoptise associada", nivel: "laranja", acao: "Pensar TEP e SCA." },
      { id: "dp-sibilancia", texto: "Sibilância sem resposta ao broncodilatador inicial", nivel: "laranja", acao: "Crise grave: escalonar o tratamento." },
    ],
    calculadoras: [NEWS2, WELLS_TEP, CURB65],
    fluxos: [
      { colecao: "temas", area: "clinica", tema: "insuficiencia-cardiaca", titulo: "Insuficiência cardíaca" },
      { colecao: "enamed", area: "clinica-medica", bloco: ENAMED_EMERGENCIA, titulo: "IC aguda — perfil hemodinâmico" },
    ],
    busca: { conduta: "dispneia", prescricao: "dispneia", cid: "dispneia" },
  },
  "Dor abdominal": {
    sinais: [
      { id: "da-aneurisma", texto: "Dor abdominal ou lombar com massa pulsátil ou hipotensão (> 50 anos)", nivel: "vermelho", acao: "Aneurisma roto: cirurgia vascular imediata." },
      { id: "da-peritonite", texto: "Defesa, rigidez ou descompressão brusca positiva", nivel: "laranja", acao: "Avaliação cirúrgica." },
      { id: "da-isquemia", texto: "Dor desproporcional ao exame (idoso, FA, vasculopata)", nivel: "laranja", acao: "Pensar isquemia mesentérica." },
      { id: "da-sangramento", texto: "Hematêmese, melena ou enterorragia", nivel: "laranja", acao: "Acesso calibroso, hemoglobina e endoscopia." },
      { id: "da-gestacao", texto: "Possível gestação com dor ou sangramento", nivel: "laranja", acao: "β-hCG: excluir gravidez ectópica." },
      { id: "da-colangite", texto: "Febre com icterícia ou dor em hipocôndrio direito", nivel: "laranja", acao: "Colangite: antibiótico e drenagem." },
      { id: "da-obstrucao", texto: "Parada de eliminação de gases e fezes, distensão ou vômitos fecaloides", nivel: "laranja", acao: "Obstrução intestinal." },
    ],
    calculadoras: [QSOFA],
    fluxos: [
      { colecao: "enamed", area: "cirurgia", bloco: "abdome-agudo", titulo: "Abdome agudo" },
      { colecao: "temas", area: "clinica", tema: "pancreatite", titulo: "Pancreatite" },
      { colecao: "temas", area: "cirurgia", tema: "vias-biliares", titulo: "Vias biliares" },
      { colecao: "temas", area: "cirurgia", tema: "hemorragia-digestiva", titulo: "Hemorragia digestiva" },
      { colecao: "enamed", area: "ginecologia-obstetricia", bloco: "algoritmos-ginecologia-e-obstetricia", titulo: "Gravidez ectópica" },
    ],
    busca: { conduta: "dor abdominal", prescricao: "dor abdominal", cid: "dor abdominal" },
  },
  Cefaleia: {
    sinais: [
      { id: "cf-subita", texto: "Início súbito, \"a pior da vida\"", nivel: "vermelho", acao: "Hemorragia subaracnoide: TC de crânio sem contraste." },
      { id: "cf-deficit", texto: "Déficit focal, convulsão ou rebaixamento", nivel: "vermelho", acao: "Imagem de urgência; pensar AVC." },
      { id: "cf-meningite", texto: "Febre com rigidez de nuca ou petéquias", nivel: "vermelho", acao: "Meningite: não atrasar o antibiótico pela punção." },
      { id: "cf-hic", texto: "Piora deitado ou com esforço, vômitos em jato, papiledema", nivel: "laranja", acao: "Hipertensão intracraniana: imagem." },
      { id: "cf-gestante", texto: "Gestante ou puérpera", nivel: "laranja", acao: "Pré-eclâmpsia e trombose venosa cerebral." },
      { id: "cf-nova", texto: "Cefaleia nova após os 50 anos, imunossupressão ou câncer", nivel: "amarelo", acao: "Investigar com imagem." },
    ],
    calculadoras: [GLASGOW],
    fluxos: [
      { colecao: "enamed", area: "clinica-medica", bloco: "neurologia-clinica", titulo: "Neurologia clínica" },
      { colecao: "temas", area: "go", tema: "sindromes-hipertensivas", titulo: "Síndromes hipertensivas da gestação" },
    ],
    busca: { conduta: "cefaleia", prescricao: "cefaleia", cid: "cefaleia" },
  },
  Febre: {
    sinais: [
      { id: "fb-choque", texto: "Hipotensão, extremidades frias ou enchimento capilar > 3 s", nivel: "vermelho", acao: "Sepse com choque: lactato, culturas e antibiótico na primeira hora." },
      { id: "fb-purpura", texto: "Petéquias ou púrpura", nivel: "vermelho", acao: "Meningococcemia: antibiótico imediato." },
      { id: "fb-neutropenia", texto: "Quimioterapia recente, neutropenia ou imunossupressão", nivel: "laranja", acao: "Neutropenia febril: antibiótico em até 1 hora." },
      { id: "fb-confusao", texto: "Confusão ou sonolência nova", nivel: "laranja", acao: "Sepse ou infecção do SNC." },
      { id: "fb-dengue", texto: "Alarme de dengue: dor abdominal intensa, vômitos persistentes, sangramento de mucosa, letargia", nivel: "laranja", acao: "Dengue grupo C: hidratação venosa e internação." },
      { id: "fb-lactente", texto: "Lactente com menos de 3 meses", nivel: "laranja", acao: "Avaliação para infecção bacteriana grave." },
    ],
    calculadoras: [QSOFA, NEWS2],
    fluxos: [
      { colecao: "enamed", area: "clinica-medica", bloco: ENAMED_EMERGENCIA, titulo: "Sepse x choque séptico" },
      { colecao: "enamed", area: "clinica-medica", bloco: "apostas-clinica-medica", titulo: "Sepse — tempo do antibiótico" },
      { colecao: "enamed", area: "clinica-medica", bloco: "algoritmos-clinica-medica", titulo: "Dengue — grupos C e D" },
    ],
    busca: { conduta: "febre", prescricao: "febre", cid: "febre" },
  },
  "Vômitos / diarreia": {
    sinais: [
      { id: "vd-choque", texto: "Letargia, pulso fino ou sem diurese (desidratação grave)", nivel: "vermelho", acao: "Plano C: hidratação venosa rápida." },
      { id: "vd-bilioso", texto: "Vômitos biliosos ou fecaloides, distensão", nivel: "laranja", acao: "Pensar obstrução intestinal." },
      { id: "vd-peritonite", texto: "Dor abdominal localizada ou sinais de peritonite", nivel: "laranja", acao: "Avaliação cirúrgica." },
      { id: "vd-cetoacidose", texto: "Diabético com glicemia alta ou hálito cetônico", nivel: "laranja", acao: "Cetoacidose: gasometria e cetonemia." },
      { id: "vd-moderada", texto: "Sede, olhos fundos, sinal da prega (desidratação moderada)", nivel: "amarelo", acao: "Plano B: terapia de reidratação oral supervisionada." },
      { id: "vd-sangue", texto: "Sangue nas fezes ou febre alta", nivel: "amarelo", acao: "Diarreia invasiva." },
    ],
    calculadoras: [],
    fluxos: [
      { colecao: "enamed", area: "pediatria", bloco: "diarreia-desidratacao-e-gastro-pediatrica", titulo: "Diarreia — planos B e C" },
      { colecao: "enamed", area: "clinica-medica", bloco: "algoritmos-clinica-medica", titulo: "Dengue — hidratação" },
    ],
    busca: { conduta: "diarreia", prescricao: "diarreia", cid: "diarreia" },
  },
  Vertigem: {
    sinais: [
      { id: "vt-focal", texto: "Déficit focal, disartria, diplopia ou disfagia", nivel: "vermelho", acao: "AVC de circulação posterior: protocolo de AVC." },
      { id: "vt-marcha", texto: "Não fica em pé ou não anda sem apoio", nivel: "laranja", acao: "Sinal de causa central." },
      { id: "vt-nistagmo", texto: "Nistagmo vertical, que muda de direção, ou HINTS central", nivel: "laranja", acao: "Imagem: causa central provável." },
      { id: "vt-cervical", texto: "Cefaleia nova intensa ou dor cervical", nivel: "laranja", acao: "Pensar dissecção arterial." },
      { id: "vt-vascular", texto: "Início abrupto em paciente com fatores de risco vascular", nivel: "amarelo", acao: "Baixo limiar para imagem." },
    ],
    calculadoras: [],
    fluxos: [{ colecao: "enamed", area: "clinica-medica", bloco: "neurologia-clinica", titulo: "Vertigem — VPPB x síndrome vestibular aguda" }],
    busca: { conduta: "vertigem", prescricao: "vertigem", cid: "vertigem" },
  },
  Síncope: {
    sinais: [
      { id: "sc-esforco", texto: "Síncope ao esforço ou deitado", nivel: "laranja", acao: "Causa cardíaca até prova em contrário." },
      { id: "sc-palpitacao", texto: "Palpitação antes do evento, dor torácica ou dispneia", nivel: "laranja", acao: "Monitorizar: arritmia, SCA ou TEP." },
      { id: "sc-ecg", texto: "ECG alterado (bloqueio, QT longo, Brugada, pré-excitação)", nivel: "laranja", acao: "Internar para monitorização." },
      { id: "sc-cardiopatia", texto: "Cardiopatia estrutural, IC ou morte súbita na família", nivel: "laranja", acao: "Alto risco: não liberar sem investigação." },
      { id: "sc-sangramento", texto: "Suspeita de sangramento (melena, gestação)", nivel: "laranja", acao: "Hemoglobina e β-hCG." },
      { id: "sc-trauma", texto: "Trauma significativo na queda", nivel: "amarelo", acao: "Avaliar lesões associadas." },
    ],
    calculadoras: [CHA2DS2VASC],
    fluxos: [
      { colecao: "enamed", area: "clinica-medica", bloco: "geriatria-e-cuidados-ao-idoso", titulo: "Hipotensão ortostática no idoso" },
      { colecao: "enamed", area: "clinica-medica", bloco: "algoritmos-clinica-medica", titulo: "FA — algoritmo" },
    ],
    busca: { conduta: "síncope", prescricao: "síncope", cid: "síncope" },
  },
  "Crise convulsiva": {
    sinais: [
      { id: "cv-estado", texto: "Crise > 5 min ou sem recuperar entre as crises", nivel: "vermelho", acao: "Estado de mal: benzodiazepínico agora." },
      { id: "cv-eclampsia", texto: "Gestante ou puérpera", nivel: "vermelho", acao: "Eclâmpsia: sulfato de magnésio." },
      { id: "cv-meningite", texto: "Febre com rigidez de nuca ou petéquias", nivel: "vermelho", acao: "Infecção do SNC." },
      { id: "cv-primeira", texto: "Primeira crise, déficit focal ou trauma craniano", nivel: "laranja", acao: "TC de crânio." },
      { id: "cv-alcool", texto: "Uso de álcool ou drogas, ou suspensão abrupta", nivel: "amarelo", acao: "Abstinência ou intoxicação." },
    ],
    calculadoras: [GLASGOW],
    fluxos: [
      { colecao: "temas", area: "pediatria", tema: "convulsoes", titulo: "Convulsões (pediatria)" },
      { colecao: "temas", area: "go", tema: "sindromes-hipertensivas", titulo: "Síndromes hipertensivas da gestação" },
    ],
    busca: { conduta: "convulsão", prescricao: "convulsão", cid: "convulsão" },
  },
  Lombalgia: {
    sinais: [
      { id: "lb-cauda", texto: "Retenção ou incontinência urinária, anestesia em sela", nivel: "vermelho", acao: "Cauda equina: RM e neurocirurgia de urgência." },
      { id: "lb-aneurisma", texto: "Dor lombar com hipotensão ou massa pulsátil", nivel: "vermelho", acao: "Aneurisma roto." },
      { id: "lb-motor", texto: "Déficit motor progressivo", nivel: "laranja", acao: "Compressão medular: imagem urgente." },
      { id: "lb-infeccao", texto: "Febre, droga injetável ou imunossupressão", nivel: "laranja", acao: "Infecção espinhal: imagem e culturas." },
      { id: "lb-cancer", texto: "Câncer conhecido ou perda de peso", nivel: "amarelo", acao: "Pensar metástase (compressão medular)." },
      { id: "lb-trauma", texto: "Trauma significativo ou osteoporose", nivel: "amarelo", acao: "Pensar fratura." },
    ],
    calculadoras: [],
    fluxos: [{ colecao: "enamed", area: "clinica-medica", bloco: "neurologia-clinica", titulo: "Hérnia de disco e compressão medular" }],
    busca: { conduta: "lombalgia", prescricao: "lombalgia", cid: "lombalgia" },
  },
  Tosse: {
    sinais: [
      { id: "ts-hemoptise", texto: "Hemoptise volumosa", nivel: "vermelho", acao: "Proteger via aérea; decúbito do lado que sangra." },
      { id: "ts-esforco", texto: "Esforço respiratório ou confusão", nivel: "laranja", acao: "Pneumonia grave: avaliar internação." },
      { id: "ts-pneumonia", texto: "Febre com dor pleurítica ou estertores localizados", nivel: "amarelo", acao: "Pensar pneumonia: CURB-65." },
      { id: "ts-tb", texto: "Tosse > 3 semanas, sudorese noturna ou perda de peso", nivel: "amarelo", acao: "Investigar tuberculose e isolar." },
      { id: "ts-imuno", texto: "Imunossupressão", nivel: "amarelo", acao: "Ampliar a investigação." },
    ],
    calculadoras: [CURB65, CENTOR],
    fluxos: [
      { colecao: "enamed", area: "clinica-medica", bloco: "algoritmos-clinica-medica", titulo: "TB sensível — algoritmo" },
      { colecao: "enamed", area: "clinica-medica", bloco: "infectologia-clinica", titulo: "Infectologia clínica" },
    ],
    busca: { conduta: "tosse", prescricao: "tosse", cid: "tosse" },
  },
  Icterícia: {
    sinais: [
      { id: "ic-reynolds", texto: "Hipotensão ou confusão com dor e febre", nivel: "vermelho", acao: "Colangite grave: drenagem de urgência." },
      { id: "ic-encefalopatia", texto: "Confusão ou sonolência (encefalopatia)", nivel: "vermelho", acao: "Insuficiência hepática aguda." },
      { id: "ic-charcot", texto: "Febre e dor em hipocôndrio direito", nivel: "laranja", acao: "Colangite: antibiótico e drenagem biliar." },
      { id: "ic-sangramento", texto: "Sangramento ou coagulopatia", nivel: "laranja", acao: "INR e avaliação de função hepática." },
      { id: "ic-gestante", texto: "Gestante no terceiro trimestre", nivel: "laranja", acao: "HELLP e esteatose aguda da gestação." },
    ],
    calculadoras: [],
    fluxos: [
      { colecao: "temas", area: "cirurgia", tema: "vias-biliares", titulo: "Vias biliares" },
      { colecao: "enamed", area: "cirurgia", bloco: "vias-biliares-e-pancreas-cirurgicos", titulo: "Coledocolitíase x colangite" },
      { colecao: "temas", area: "clinica", tema: "cirrose", titulo: "Cirrose e complicações" },
    ],
    busca: { conduta: "icterícia", prescricao: "icterícia", cid: "icterícia" },
  },
  "Agitação / ansiedade": {
    sinais: [
      { id: "ag-agressao", texto: "Risco iminente de agressão a si ou a outros", nivel: "vermelho", acao: "Segurança da equipe; contenção conforme protocolo." },
      { id: "ag-delirium", texto: "Confusão flutuante ou desorientação (delirium)", nivel: "laranja", acao: "Procurar causa orgânica antes de psiquiátrica." },
      { id: "ag-snm", texto: "Febre e rigidez com uso de antipsicótico", nivel: "laranja", acao: "Síndrome neuroléptica maligna." },
      { id: "ag-suicidio", texto: "Ideação suicida com plano", nivel: "laranja", acao: "Não deixar sozinho; estratificar o risco." },
      { id: "ag-substancia", texto: "Intoxicação ou abstinência de álcool ou drogas", nivel: "amarelo", acao: "Tratar a causa; checar glicemia." },
      { id: "ag-primeiro", texto: "Primeiro episódio após os 40 anos", nivel: "amarelo", acao: "Pensar causa orgânica." },
    ],
    calculadoras: [],
    fluxos: [
      { colecao: "enamed", area: "saude-mental", bloco: "psicose-agitacao-e-efeitos-adversos", titulo: "Psicose, agitação e efeitos adversos" },
      { colecao: "enamed", area: "saude-mental", bloco: "transtornos-do-humor-ansiedade-e-suicidio", titulo: "Ideação suicida — estratificar o risco" },
    ],
    busca: { conduta: "agitação", prescricao: "agitação", cid: "ansiedade" },
  },
  "Hipertensão no PA": {
    sinais: [
      { id: "ha-dor", texto: "Dor torácica ou dorsal", nivel: "vermelho", acao: "SCA ou dissecção: emergência hipertensiva." },
      { id: "ha-neuro", texto: "Déficit focal, confusão ou convulsão", nivel: "vermelho", acao: "AVC ou encefalopatia hipertensiva." },
      { id: "ha-eap", texto: "Dispneia ou edema agudo de pulmão", nivel: "vermelho", acao: "Emergência hipertensiva com congestão." },
      { id: "ha-gestante", texto: "Gestante ou puérpera", nivel: "laranja", acao: "Pré-eclâmpsia: sulfato de magnésio se houver sinal de gravidade." },
      { id: "ha-visual", texto: "Alteração visual ou cefaleia intensa", nivel: "laranja", acao: "Fundo de olho; pesquisar lesão de órgão-alvo." },
      { id: "ha-renal", texto: "Oligúria ou hematúria", nivel: "amarelo", acao: "Função renal e urina." },
    ],
    calculadoras: [],
    fluxos: [
      { colecao: "temas", area: "go", tema: "sindromes-hipertensivas", titulo: "Síndromes hipertensivas da gestação" },
      { colecao: "enamed", area: "ginecologia-obstetricia", bloco: "pre-natal-e-infeccoes-na-gestacao", titulo: "PA na gestação" },
    ],
    busca: { conduta: "hipertensão", prescricao: "hipertensão", cid: "hipertensão" },
  },
  "Picada de escorpião": {
    sinais: [
      { id: "ep-grave", texto: "Arritmia, hipotensão, dispneia ou edema pulmonar", nivel: "vermelho", acao: "Forma grave: soro antiescorpiônico e UTI." },
      { id: "ep-sistemico", texto: "Vômitos profusos, sudorese, sialorreia ou agitação", nivel: "laranja", acao: "Forma moderada: soro conforme o protocolo do Ministério." },
      { id: "ep-crianca", texto: "Criança", nivel: "laranja", acao: "Maior risco de evolução grave: manter em observação." },
    ],
    calculadoras: [],
    fluxos: [],
    busca: { conduta: "escorpião", prescricao: "escorpião", cid: "escorpião" },
  },
};

/* Para queixa livre (fora da lista), sinais universais. */
export const SINAIS_GERAIS: SinalAlarme[] = [
  { id: "gr-instavel", texto: "Instabilidade hemodinâmica ou respiratória", nivel: "vermelho", acao: "ABCDE e sala de emergência." },
  { id: "gr-consciencia", texto: "Rebaixamento, confusão, convulsão ou déficit focal", nivel: "vermelho", acao: "Glicemia e avaliação neurológica." },
  { id: "gr-dor", texto: "Dor intensa, súbita ou desproporcional", nivel: "laranja", acao: "Analgesia e investigação dirigida." },
  { id: "gr-risco", texto: "Gestação, imunossupressão ou extremos de idade", nivel: "amarelo", acao: "Limiar mais baixo para investigar." },
];

export function queixaShift(titulo: string): QueixaShift | null {
  return QUEIXAS_SHIFT[titulo] ?? null;
}

export function sinaisDaQueixa(titulo: string) {
  return queixaShift(titulo)?.sinais ?? SINAIS_GERAIS;
}

export function hrefFluxo(fluxo: FluxoKit) {
  return fluxo.colecao === "temas" ? `/fluxos/${fluxo.area}/${fluxo.tema}` : `/fluxos/enamed/${fluxo.area}/${fluxo.bloco}`;
}

/* Valores do caso no formato das calculadoras (ids dos campos). */
export type ValoresCaso = Partial<Record<string, string | number | boolean>>;

export function hrefCalculadora(calculadora: CalculadoraKit, valores: ValoresCaso) {
  const params = new URLSearchParams({ calculadora: calculadora.id });
  for (const campo of calculadora.campos) {
    const valor = valores[campo];
    if (valor !== undefined && valor !== "") params.set(campo, String(valor));
  }
  return `/calculadoras?${params.toString()}`;
}
