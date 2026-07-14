export type AclsProtocol = {
  slug: string;
  title: string;
  source: string;
};

export const ACLS_PROTOCOLS: AclsProtocol[] = [
  {
    slug: "cadeia-de-sobrevivencia",
    title: "Cadeia de Sobrevivência",
    source: `# Cadeia de Sobrevivência

## Objetivo

Garantir atendimento organizado e aumentar a sobrevida e recuperação neurológica após PCR.

---

## Cadeia de sobrevivência

### 1. Prevenção e preparação
- Reconhecimento precoce da deterioração clínica
- Treinamento das equipes
- Resposta rápida

### 2. Ativação do sistema de emergência
- Acionar equipe de emergência intra ou extra-hospitalar

### 3. RCP de alta qualidade
- Compressões de alta qualidade
- Desfibrilação precoce quando indicada

### 4. Suporte Avançado de Vida
Inclui:

- Via aérea avançada
- Medicamentos
- Desfibrilação
- RCP extracorpórea (quando disponível)

### 5. Cuidados pós-PCR

- Controle hemodinâmico
- Controle direcionado de temperatura
- Reperfusão coronariana quando indicada
- Prognóstico neurológico
- Terapia intensiva

### 6. Recuperação

- Reabilitação física
- Reabilitação cognitiva
- Suporte emocional
- Apoio à família

---

## Nunca esquecer

✅ A cadeia só funciona quando TODOS os elos funcionam.

Quanto menor o atraso, maior a chance de sobrevida.`,
  },
  {
    slug: "rcp-de-alta-qualidade",
    title: "RCP de Alta Qualidade",
    source: `# RCP de Alta Qualidade

## Objetivo

Manter perfusão cerebral e coronariana até o retorno da circulação espontânea.

---

## Compressões

✔ Frequência
**100–120/min**

✔ Profundidade
**5–6 cm**

✔ Retorno completo do tórax

✔ Trocar compressor
**A cada 2 minutos**
ou antes se fadiga

✔ Troca em menos de
**5 segundos**

✔ Interrupções
**<10 segundos**

✔ Evitar hiperventilação

✔ Sempre realizar em superfície rígida

---

## Relação compressão/ventilação

Sem via aérea avançada

➡️ 30:2

Com via aérea avançada

➡️ Compressões contínuas

➡️ 1 ventilação a cada 6 segundos

---

## ETCO₂

Ideal utilizar sempre que disponível.

Serve para:

• Avaliar qualidade da RCP

• Estimar débito cardíaco

• Detectar RCE

### Valores importantes

ETCO₂ persistente

<10 mmHg

↓

Melhorar imediatamente a qualidade da RCP

Aumento súbito

>25 mmHg

↓

Sugere retorno da circulação espontânea (RCE)

---

## Nunca esquecer

🚨 Compressões salvam vidas.

Toda pausa diminui a perfusão coronariana.`,
  },
  {
    slug: "avaliacao-inicial-sbv",
    title: "Avaliação Inicial (SBV)",
    source: `# Avaliação Inicial (SBV)

## PASSO 1

☐ Segurança da cena

---

## PASSO 2

☐ Verificar responsividade

Perguntar

"VOCÊ ESTÁ BEM?"

---

## PASSO 3

☐ Acionar emergência

☐ Pedir DEA

---

## PASSO 4

Avaliar simultaneamente

☑ Respiração

☑ Pulso

Tempo máximo

**10 segundos**

---

## Resultado

### Sem pulso

➡️ Iniciar RCP imediatamente

➡️ Solicitar DEA

➡️ Seguir algoritmo de PCR

---

### Com pulso

➡️ Ventilação de resgate

**1 ventilação a cada 6 segundos**

Reavaliar pulso

**A cada 2 minutos**

---

## Gasping

⚠️ NÃO é respiração normal.

É sinal de PCR.

Conduta

➡️ Iniciar RCP imediatamente.

---

## Nunca esquecer

Na dúvida sobre presença de pulso

➡️ INICIE RCP.

Compressões desnecessárias causam menos dano que atrasar uma PCR verdadeira.`,
  },
  {
    slug: "avaliacao-primaria-abcde",
    title: "Avaliação Primária (ABCDE)",
    source: `# Avaliação Primária (ABCDE)

## A — Via aérea

Objetivos

✔ Via aérea pérvia

✔ Posicionamento adequado

✔ Confirmar tubo frequentemente

✔ Capnografia quantitativa

✔ Via aérea avançada somente quando indicada

✔ Não interromper compressões

---

## B — Respiração

Objetivos

✔ Oxigenação adequada

✔ Evitar hiperventilação

### Oxigênio

PCR

➡️ 100%

Demais pacientes

➡️ Titular para SatO₂ 95–98%

SCA

➡️ Administrar apenas se SatO₂ <90%

Pós-PCR

➡️ Meta 92–98%

---

## C — Circulação

✔ Qualidade da RCP

✔ ETCO₂

✔ Ritmo

✔ Desfibrilação

✔ Acesso IV/IO

✔ PA

✔ Perfusão

✔ Glicemia

✔ Temperatura

---

## D — Disfunção

AVDI

• Alerta

• Voz

• Dor

• Inconsciente

Avaliar pupilas

---

## E — Exposição

✔ Procurar trauma

✔ Queimaduras

✔ Braceletes médicos

✔ Exame físico completo`,
  },
  {
    slug: "avaliacao-secundaria-sample",
    title: "Avaliação Secundária",
    source: `# Avaliação Secundária

## SAMPLE

### S

Sinais e sintomas

---

### A

Alergias

---

### M

Medicações

(inclusive última dose)

---

### P

Passado médico

---

### L

Last

Última refeição

---

### E

Eventos relacionados ao quadro

---

## Durante toda avaliação

Pensar continuamente nos

5Hs

5Ts`,
  },
  {
    slug: "5hs-e-5ts",
    title: "5Hs e 5Ts",
    source: `# 5Hs e 5Ts

## 5Hs

🫁 Hipóxia

🩸 Hipovolemia

🥶 Hipotermia

🧪 Acidose (H+)

⚡ Distúrbios do potássio
- Hipercalemia
- Hipocalemia

---

## 5Ts

🫀 Trombose coronariana

🫁 Tromboembolismo pulmonar

❤️ Tamponamento cardíaco

💊 Tóxicos

🫁 Pneumotórax hipertensivo

---

## Principais causas de AESP

✔ Hipóxia

✔ Hipovolemia

São as duas causas reversíveis mais frequentes.

---

## Nunca esquecer

Durante TODA PCR pensar continuamente:

Existe alguma causa reversível?`,
  },
  {
    slug: "pcr-ritmo-chocavel",
    title: "PCR - Ritmo Chocável (FV / TV sem Pulso)",
    source: `# 🫀 PCR - RITMO CHOCÁVEL (FV / TV SEM PULSO)

⭐⭐⭐⭐⭐

⏱ Leitura: 1 minuto

---

# 🚨 RESUMO RÁPIDO

Sem pulso

↓

FV ou TV sem pulso

↓

⚡ CHOQUE

↓

RCP 2 min

↓

Reavaliar ritmo

↓

⚡ CHOQUE

↓

RCP + Epinefrina 1 mg

↓

Reavaliar ritmo

↓

⚡ CHOQUE

↓

RCP + Amiodarona 300 mg

↓

Reavaliar ritmo

↓

Continuar ciclos

↓

Pesquisar 5Hs e 5Ts durante toda ressuscitação

---

# 📌 QUANDO UTILIZAR

Paciente em PCR com:

✔ Fibrilação Ventricular (FV)

✔ Taquicardia Ventricular sem Pulso (TVSP)

---

# 🎯 OBJETIVO

Restabelecer rapidamente circulação espontânea através de:

• Desfibrilação precoce

• RCP de alta qualidade

• Drogas quando indicadas

• Correção das causas reversíveis

---

# ⚡ ALGORITMO

## 1️⃣ Confirmar PCR

✔ Inconsciente

✔ Sem pulso

✔ Respiração ausente ou gasping

↓

Iniciar RCP imediatamente

---

## 2️⃣ Conectar monitor / DEA

Identificar ritmo.

Se FV ou TVSP

↓

Desfibrilar imediatamente.

---

## 3️⃣ PRIMEIRO CHOQUE

Energia

Bifásico

**120–200 J**

(se desconhecida utilizar 200 J)

Monofásico

**360 J**

↓

Após choque

✔ NÃO verificar pulso

✔ NÃO analisar ritmo

↓

Retomar RCP imediatamente

por

**2 minutos**

---

## 4️⃣ Reavaliar ritmo

Permanece FV/TVSP

↓

SEGUNDO CHOQUE

↓

Retomar RCP

↓

Obter acesso

IV ou IO

↓

Administrar

## 💊 EPINEFRINA

**1 mg IV/IO**

Repetir

**a cada 3–5 minutos**

Flush

20 mL SF

Elevar membro

---

## 5️⃣ Reavaliar ritmo

Persistiu chocável

↓

TERCEIRO CHOQUE

↓

Retomar RCP

↓

Administrar

## 💊 AMIODARONA

Primeira dose

**300 mg IV/IO**

Persistindo

Segunda dose

**150 mg IV/IO**

---

## Alternativa

Caso Amiodarona indisponível

## 💊 LIDOCAÍNA

Primeira dose

**1–1,5 mg/kg**

Depois

0,5–0,75 mg/kg

Dose máxima

**3 mg/kg**

---

## Torsades de Pointes

Administrar

## 💊 Sulfato de Magnésio

**1–2 g IV/IO**

Diluir em 10 mL SG5%

---

# 📊 ENERGIAS

## Desfibrilação

Bifásico

120–200 J

(se desconhecida → 200 J)

Choques subsequentes

Maior energia disponível

---

Monofásico

360 J

todos os choques

---

# 💊 MEDICAÇÕES

## Epinefrina

Dose

**1 mg IV/IO**

Intervalo

**3–5 minutos**

Flush

20 mL SF

Elevar membro

---

## Amiodarona

Primeira

**300 mg**

Segunda

**150 mg**

---

## Lidocaína

1–1,5 mg/kg

↓

0,5–0,75 mg/kg

↓

Máximo

3 mg/kg

---

## Magnésio

1–2 g IV

Somente quando indicado

(Torsades)

---

# 🌬 VIA AÉREA

Pode utilizar

• Bolsa-válvula-máscara

ou

• Via aérea avançada

Se via aérea avançada

Compressões contínuas

+

1 ventilação

a cada

6 segundos

Nunca interromper compressões para intubação.

---

# 📈 ETCO₂

Sempre utilizar quando disponível.

<10 mmHg

↓

Melhorar imediatamente qualidade da RCP.

Aumento súbito

>25 mmHg

↓

Pensar em RCE.

---

# 🔎 DURANTE TODA PCR

Pesquisar continuamente

## 5Hs

✔ Hipóxia

✔ Hipovolemia

✔ H+

✔ Hipotermia

✔ Hipo/Hipercalemia

---

## 5Ts

✔ Tamponamento

✔ Pneumotórax hipertensivo

✔ Trombose coronária

✔ TEP

✔ Tóxicos

---

# ⚠️ ALERTAS

✔ Nunca atrasar choque.

✔ Compressões têm prioridade.

✔ Drogas nunca atrasam desfibrilação.

✔ Retomar RCP imediatamente após cada choque.

✔ Não verificar pulso após choque.

---

# ❌ ERROS FREQUENTES

❌ Demorar para desfibrilar

❌ Pausas longas

❌ Procurar pulso após choque

❌ Esquecer Epinefrina

❌ Esquecer Amiodarona

❌ Intubar interrompendo RCP

❌ Não procurar 5Hs e 5Ts

---

# 💎 PÉROLAS RESIBOOK

🧠 A intervenção que mais aumenta a sobrevida é a desfibrilação precoce.

🧠 Epinefrina NÃO substitui boa RCP.

🧠 Amiodarona aumenta chance de reversão do ritmo, mas não substitui choque.

🧠 Toda pausa reduz significativamente a perfusão coronariana.

---

# 📚 MODO ESTUDO

FV e TV sem pulso são ritmos chocáveis.

O tratamento é baseado em quatro pilares:

• Desfibrilação precoce;

• RCP de alta qualidade;

• Administração de epinefrina e antiarrítmicos no momento correto;

• Pesquisa e correção contínua das causas reversíveis (5Hs e 5Ts).

O choque deve ser realizado o mais precocemente possível. Após cada desfibrilação, a RCP deve ser retomada imediatamente por 2 minutos, sem checagem de pulso.

A epinefrina deve ser iniciada após o segundo choque e repetida a cada 3–5 minutos.

A amiodarona é administrada após o terceiro choque (300 mg) com dose adicional de 150 mg caso o ritmo permaneça chocável.`,
  },
  {
    slug: "pcr-ritmo-nao-chocavel",
    title: "PCR - Ritmo Não Chocável (AESP / Assistolia)",
    source: `# 🫀 PCR - RITMO NÃO CHOCÁVEL (AESP / ASSISTOLIA)

⭐⭐⭐⭐⭐

⏱ Leitura: 1 minuto

---

# 🚨 RESUMO RÁPIDO

Sem pulso

↓

Assistolia ou AESP

↓

RCP 2 minutos

↓

💊 Epinefrina 1 mg

↓

Pesquisar 5Hs e 5Ts

↓

Reavaliar ritmo

↓

Se ritmo chocável

➡️ Migrar para algoritmo de FV/TVSP

↓

Se continuar AESP/Assistolia

➡️ Continuar RCP

---

# 📌 QUANDO UTILIZAR

Paciente em PCR com:

✔ Assistolia

✔ Atividade Elétrica Sem Pulso (AESP)

---

# 🎯 OBJETIVO

Manter perfusão adequada durante a PCR enquanto identifica e corrige rapidamente causas reversíveis.

Diferentemente dos ritmos chocáveis, a prioridade é corrigir a causa da parada.

---

# ⚡ ALGORITMO

## 1️⃣ Confirmar PCR

✔ Sem pulso

✔ Sem respiração ou gasping

↓

Iniciar RCP imediatamente

---

## 2️⃣ Identificar ritmo

Monitor mostra

• Assistolia

ou

• AESP

↓

NÃO DESFIBRILAR

---

## 3️⃣ RCP

Realizar por

**2 minutos**

Compressões

100–120/min

Profundidade

5–6 cm

Pausas

<10 segundos

---

## 💊 EPINEFRINA

Administrar o mais precocemente possível.

Dose

**1 mg IV/IO**

Repetir

**a cada 3–5 minutos**

Flush

20 mL SF

Elevar membro

---

## 4️⃣ Reavaliar ritmo

Após 2 minutos

↓

Se mudou para FV/TVSP

➡️ Migrar imediatamente para algoritmo de ritmo chocável.

---

Se continua AESP/Assistolia

↓

Nova RCP

↓

Nova Epinefrina quando indicada

↓

Continuar investigação

---

# 🚫 NÃO DESFIBRILAR

Assistolia

❌ Não choca

---

AESP

❌ Não choca

---

# 🔎 BUSCAR CAUSAS REVERSÍVEIS

Durante TODA PCR.

## 5Hs

🫁 Hipóxia

🩸 Hipovolemia

🧪 Acidose

🥶 Hipotermia

⚡ Hipo/Hipercalemia

---

## 5Ts

❤️ Tamponamento cardíaco

🫁 Pneumotórax hipertensivo

🫁 Tromboembolismo pulmonar

❤️ Trombose coronária

💊 Tóxicos

---

# 📊 ETCO₂

Sempre utilizar quando disponível.

<10 mmHg

↓

Melhorar qualidade da RCP.

Aumento súbito

>25 mmHg

↓

Pensar em RCE.

---

# 🌬 VIA AÉREA

Pode ser utilizada

• Bolsa-válvula-máscara

ou

• Via aérea avançada

Após via aérea avançada

Compressões contínuas

+

1 ventilação

a cada

6 segundos

---

# ⚠️ ALERTAS

✔ Não desfibrilar AESP.

✔ Não desfibrilar assistolia.

✔ Confirmar que não se trata de FV fina antes de concluir assistolia.

✔ A prioridade é identificar a causa reversível.

---

# ❌ ERROS FREQUENTES

❌ Chocar assistolia

❌ Chocar AESP

❌ Demorar para administrar epinefrina

❌ Não procurar 5Hs e 5Ts

❌ Não confirmar cabos/eletrodos antes de diagnosticar assistolia

❌ Esquecer de migrar para algoritmo chocável quando o ritmo muda

---

# 💎 PÉROLAS RESIBOOK

🧠 A maioria das AESP é causada por hipóxia ou hipovolemia.

🧠 O tratamento da AESP é tratar a causa.

🧠 Nenhuma droga substitui boa RCP.

🧠 Assistolia quase nunca melhora sem corrigir o fator desencadeante.

---

# 📚 MODO ESTUDO

AESP e assistolia são ritmos não chocáveis.

O tratamento baseia-se em:

• RCP de alta qualidade;

• Administração precoce de epinefrina;

• Pesquisa contínua das causas reversíveis (5Hs e 5Ts);

• Reavaliação do ritmo a cada 2 minutos.

Se durante a ressuscitação surgir FV ou TV sem pulso, o paciente deve migrar imediatamente para o algoritmo de ritmos chocáveis.

Assistolia deve sempre ser confirmada em mais de uma derivação e com verificação dos cabos/eletrodos antes de manter o diagnóstico.`,
  },
  {
    slug: "bradicardia",
    title: "Bradicardia Sintomática",
    source: `# 🫀 BRADICARDIA SINTOMÁTICA

⭐⭐⭐⭐⭐

⏱ Leitura: 1 minuto

---

# 🚨 RESUMO RÁPIDO

Bradicardia

↓

Paciente sintomático?

↓

SIM

↓

Atropina 1 mg IV

↓

Sem resposta?

↓

Marcapasso Transcutâneo

↓

OU

Dopamina

↓

OU

Epinefrina

↓

Considerar marcapasso transvenoso

---

# 📌 QUANDO UTILIZAR

Paciente com FC <50 bpm E sinais de má perfusão atribuíveis à bradicardia.

---

# 🚨 CRITÉRIOS DE INSTABILIDADE

✔ Hipotensão

✔ Alteração do nível de consciência

✔ Choque

✔ Dor torácica isquêmica

✔ Insuficiência cardíaca aguda

✔ Edema agudo de pulmão

Se presentes → tratar imediatamente.

---

# ⚡ PASSO 1

ABC

Monitor cardíaco

PA

Oximetria

Acesso IV

ECG 12 derivações

Oxigênio apenas se hipoxemia.

---

# ⚡ PASSO 2

Paciente sintomático?

## NÃO

Observar

Investigar causa

Monitorização

---

## SIM

Prosseguir para tratamento.

---

# 💊 ATROPINA

Primeira escolha para a maioria das bradicardias.

Dose

**1 mg IV**

Repetir

a cada

3–5 minutos

Dose máxima

**3 mg**

---

# 🚨 QUANDO A ATROPINA PODE FALHAR

Principalmente nos bloqueios infranodais.

Exemplos

• BAV Mobitz II

• BAV 3º grau

• Ritmo de escape ventricular

Quanto mais largo o QRS, menor a chance de resposta.

Nesses casos, considerar marcapasso precocemente.

---

# ⚡ SEM RESPOSTA À ATROPINA

Escolher uma das opções:

## Marcapasso Transcutâneo

↓

OU

## Dopamina

↓

OU

## Epinefrina

---

# ⚡ MARCAPASSO TRANSCUTÂNEO

Indicação

Bradicardia instável refratária.

---

## Configuração

Posicionar pás.

Programar frequência

**60–80 bpm**

Iniciar corrente baixa

Aumentar gradualmente até captura elétrica.

Depois

Confirmar captura mecânica

➡️ Palpar pulso.

---

# ⚠️ SEDAÇÃO

Sempre que possível sedar antes do marcapasso.

Pode ser necessário:

• Fentanil

• Morfina

• Sedação mais profunda conforme intensidade da corrente

---

# 💊 DOPAMINA

Infusão contínua

**5–20 mcg/kg/min**

Titular conforme resposta.

---

# 💊 EPINEFRINA

Infusão

**2–10 mcg/min**

Titular conforme resposta clínica.

---

# 🔎 INVESTIGAR CAUSAS

IAM

Hipóxia

Hipotermia

Hipercalemia

Hipocalemia

Betabloqueadores

Bloqueadores do canal de cálcio

Digoxina

Hipertensão intracraniana

---

# 📊 DIFERENCIANDO AS BRADIARRITMIAS

## Bradicardia Sinusal

✔ Toda onda P gera QRS

✔ PR normal

---

## BAV 1º Grau

✔ Toda P conduz

✔ PR prolongado (>200 ms)

---

## Mobitz I (Wenckebach)

✔ PR aumenta progressivamente

↓

Até bloquear um QRS

Geralmente benigno.

---

## Mobitz II

✔ PR constante

↓

Bloqueio súbito do QRS

Alto risco.

---

## BAV 3º Grau

Nenhuma onda P conduz.

Átrio e ventrículo batem independentemente.

Emergência.

---

# ⚠️ ALERTAS

Atropina NÃO deve atrasar marcapasso quando claramente indicada.

Mobitz II e BAVT frequentemente necessitam marcapasso.

---

# ❌ ERROS FREQUENTES

❌ Tratar apenas a frequência

❌ Não procurar causa

❌ Insistir várias doses de atropina em BAVT

❌ Não confirmar captura mecânica

❌ Esquecer sedação do marcapasso

---

# 💎 PÉROLAS RESIBOOK

🧠 Quanto mais distal o bloqueio, pior a resposta à atropina.

🧠 Captura elétrica não significa captura mecânica.

Sempre palpar pulso.

🧠 Marcapasso transcutâneo salva tempo até o marcapasso definitivo.

---

# 📚 MODO ESTUDO

As bradicardias só devem ser tratadas quando provocam instabilidade hemodinâmica.

A atropina é a primeira opção para a maioria dos casos, porém apresenta baixa eficácia em bloqueios infranodais (Mobitz II e BAV de 3º grau).

Nessas situações, o marcapasso transcutâneo deve ser instituído precocemente, podendo ser associado à infusão de dopamina ou epinefrina enquanto se organiza o tratamento definitivo.`,
  },
  {
    slug: "taquicardia",
    title: "Taquicardia com Pulso",
    source: `# 🫀 TAQUICARDIA COM PULSO

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

FC >150 bpm

↓

Paciente INSTÁVEL?

↓

SIM

➡️ Cardioversão elétrica sincronizada

↓

NÃO

↓

QRS largo ou estreito?

↓

Regular ou irregular?

↓

Tratar conforme algoritmo

---

# 📌 QUANDO UTILIZAR

Paciente com taquicardia e presença de pulso.

---

# 🚨 CRITÉRIOS DE INSTABILIDADE

A taquicardia é considerada instável quando provoca:

✔ Hipotensão

✔ Alteração do nível de consciência

✔ Choque

✔ Dor torácica isquêmica

✔ Insuficiência cardíaca

✔ Edema agudo de pulmão

Se qualquer critério estiver presente:

➡️ CARDIOVERSÃO ELÉTRICA SINCRONIZADA IMEDIATA

---

# ⚡ PASSO 1

Realizar MOVIG

✔ Via aérea

✔ Oxigênio se hipoxemia

✔ Monitor cardíaco

✔ Oximetria

✔ PA

✔ Acesso IV

✔ ECG 12 derivações

---

# ⚡ PASSO 2

Determinar

✔ QRS estreito (<120 ms)

ou

✔ QRS largo (≥120 ms)

↓

Depois avaliar

✔ Regular

ou

✔ Irregular

---

# 🫀 TAQUICARDIA QRS ESTREITO REGULAR (TPSV)

Primeira conduta

↓

Manobra vagal

Preferir

Valsalva modificada

Alternativas

• Massagem do seio carotídeo (na ausência de contraindicações)

• Reflexo do mergulho (gelo na face)

---

## Se não resolver

### 💊 ADENOSINA

Primeira dose

**6 mg IV em bolus rápido**

+

Flush

20 mL SF

+

Elevar membro

---

Persistiu

↓

### Segunda dose

**12 mg IV**

---

Persistiu

↓

### Terceira dose

**12 mg IV**

(opcional conforme contexto)

---

Depois

↓

Betabloqueador

OU

Bloqueador do canal de cálcio

(Metoprolol ou Verapamil)

---

# ⚠️ ADENOSINA

Avisar o paciente

Pode causar

• sensação de morte

• calor

• desconforto torácico

• assistolia transitória

Tudo costuma durar poucos segundos.

---

## Contraindicações / Cautela

⚠️ Asma ou broncoespasmo

⚠️ Transplante cardíaco

⚠️ Uso de dipiridamol

Pode necessitar ajuste de dose.

---

# 🫀 TAQUICARDIA QRS LARGO REGULAR

Presumir TV até prova em contrário.

Se estável

↓

### 💊 AMIODARONA

150 mg

Diluir em

100 mL SG5%

Infundir em

10 minutos

---

Persistiu

↓

Cardioversão sincronizada.

---

Se houver suspeita de TPSV com aberrância

Pode ser tentada Adenosina.

---

# 🫀 TORSADES DE POINTES

TV polimórfica

+

QT longo

---

### Conduta

⚡ DESFIBRILAÇÃO

(não sincronizar)

+

### 💊 Sulfato de Magnésio

1–2 g IV

Diluir em

100 mL SF

Infundir em

5–10 minutos

---

⚠️ NÃO UTILIZAR AMIODARONA

Pode prolongar ainda mais o QT.

---

Sempre investigar

✔ Hipocalemia

✔ Hipomagnesemia

✔ Fármacos que prolongam QT

✔ Isquemia

---

# 🫀 FIBRILAÇÃO ATRIAL / FLUTTER

## INSTÁVEL

Se FA/Flutter for a causa da instabilidade

↓

Cardioversão sincronizada.

---

## ESTÁVEL

### Duração <48 horas

Pode ser considerada cardioversão farmacológica ou elétrica.

Flutter costuma responder melhor à cardioversão elétrica.

---

### >48 horas ou tempo desconhecido

NÃO cardioverter imediatamente.

Antes:

✔ ECO transesofágico demonstrando ausência de trombo

OU

✔ Anticoagulação adequada por pelo menos 3 semanas

---

Controle de frequência

Preferir

✔ Betabloqueadores

ou

✔ Bloqueadores do canal de cálcio

quando não houver contraindicações.

---

# ⚠️ FA ASSOCIADA À COCAÍNA

Evitar betabloqueadores na fase aguda.

Considerar

✔ Benzodiazepínicos

✔ Bloqueador do canal de cálcio

✔ Cardioversão quando indicada

---

# ⚡ CARDIOVERSÃO ELÉTRICA SINCRONIZADA

Sempre utilizar botão

## SYNC

O choque deve ocorrer sincronizado com o QRS.

Nunca realizar choque sincronizado em FV ou TV sem pulso.

---

# 📊 RESUMO DOS RITMOS

Tem onda P antes do QRS?

↓

Sim

➡️ Ritmo Sinusal

---

Onda F serrilhada?

↓

Flutter

---

QRS largo?

↓

Presumir TV

---

RR irregular?

↓

FA

---

QRS estreito regular sem onda P?

↓

TPSV

---

# ❌ ERROS FREQUENTES

❌ Esquecer de avaliar estabilidade antes do ECG.

❌ Dar Adenosina em FA irregular.

❌ Dar Amiodarona em Torsades.

❌ Esquecer botão SYNC na cardioversão.

❌ Tratar TV como se fosse TPSV.

---

# 💎 PÉROLAS RESIBOOK

🧠 Toda taquicardia de QRS largo deve ser considerada TV até prova em contrário.

🧠 Paciente instável não espera medicamento.

🧠 Torsades é a única taquicardia com pulso em que geralmente se desfibrila em vez de cardioversão sincronizada.

🧠 Antes de cardioverter uma FA, confirme que ela é realmente a causa da instabilidade.

---

# 📚 MODO ESTUDO

O primeiro passo diante de qualquer taquicardia é determinar se o paciente está estável ou instável.

Pacientes instáveis devem ser submetidos à cardioversão elétrica sincronizada imediata.

Nos pacientes estáveis, a análise do QRS (largo ou estreito) e da regularidade do ritmo direciona o tratamento.

A TPSV responde à manobra vagal e à adenosina. A TV com pulso deve ser tratada preferencialmente com amiodarona ou cardioversão conforme estabilidade. A Torsades de Pointes deve ser tratada com desfibrilação e sulfato de magnésio, evitando amiodarona. Na fibrilação atrial, a decisão de cardioversão depende da estabilidade e do tempo de evolução do episódio.`,
  },
  {
    slug: "pos-pcr",
    title: "Cuidados Pós-PCR (Pós-RCE)",
    source: `# 🫀 CUIDADOS PÓS-PCR (PÓS-RCE)

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

RCE

↓

ABCDE

↓

SatO₂ 90–98%

↓

PaCO₂ normal

↓

PAM ≥65 mmHg

↓

ECG 12 derivações

↓

Controle de temperatura

↓

Controle glicêmico

↓

Avaliação neurológica

↓

Pesquisar causa da PCR

↓

UTI

---

# 📊 METAS ESSENCIAIS

| Parâmetro | Meta |
|---|---|
| SatO₂ | 90–98% |
| PaO₂ | 60–105 mmHg |
| PaCO₂ | 35–45 mmHg |
| PAM | ≥65 mmHg |
| Temperatura | 32–37,5°C por pelo menos 36 horas se não responder a comandos |
| Glicemia | Evitar <70 mg/dL e >180 mg/dL |

---

# 📌 QUANDO UTILIZAR

Todo paciente que apresentou

✔ Retorno da Circulação Espontânea (RCE)

Após qualquer PCR.

---

# 🎯 OBJETIVOS

✔ Evitar nova PCR

✔ Preservar função cerebral

✔ Corrigir a causa da parada

✔ Reduzir mortalidade

---

# ⚡ PASSO 1 — CONFIRMAR RCE

Sinais

✔ Pulso palpável

✔ Aumento súbito do ETCO₂

✔ PA mensurável

✔ Movimento espontâneo

✔ Respiração espontânea

---

# ⚡ PASSO 2 — ABCDE

Reavaliar completamente.

---

## 🅰️ VIA AÉREA

Confirmar tubo

Capnografia contínua

Fixar TOT

Aspiração quando indicada

---

## 🅱️ RESPIRAÇÃO

Oxigênio inicialmente

100%

↓

Após estabilização

Titular

### SatO₂

**90–98%**

Evitar

❌ Hipóxia

❌ Hiperóxia

---

Meta de PaO₂

**60–105 mmHg**

---

Meta de PaCO₂

**35–45 mmHg**

Evitar hiperventilação.

---

## 🅲 CIRCULAÇÃO

Objetivos

### PAM

≥65 mmHg

---

Monitorizar

✔ ECG

✔ PA invasiva se disponível

✔ Diurese

✔ Lactato

---

# 💊 HIPOTENSÃO

Primeiro

Cristaloide

500–1000 mL

conforme contexto clínico.

↓

Reavaliar perfusão e PAM

↓

Persistindo hipotensão

↓

Vasopressor

Escolher conforme o fenótipo do choque e protocolo institucional.

Não há vasopressor específico recomendado pela AHA para o pós-PCR indiferenciado.

Opções

### Noradrenalina

✔ Epinefrina

✔ Dopamina

Titular conforme PAM e contexto clínico.

---

# ❤️ ECG

Realizar ECG de 12 derivações o mais rápido possível.

---

Se IAM com Supra

↓

Hemodinâmica imediata.

---

Mesmo sem Supra

Se choque cardiogênico

ou

arritmias ventriculares recorrentes

ou

isquemia miocárdica significativa persistente

↓

Considerar coronariografia emergencial.

---

Paciente comatoso estável

Sem supra, choque, instabilidade elétrica ou isquemia persistente

↓

Não realizar coronariografia emergencial de rotina.

---

# 🌡 CONTROLE DE TEMPERATURA

Paciente comatoso

↓

Controle ativo da temperatura.

Meta

**32–37,5°C**

(conforme protocolo institucional)

Duração

**Pelo menos 36 horas**

se permanecer sem responder a comandos.

Evitar principalmente

❌ Febre

---

# 🍬 GLICEMIA

Evitar hipoglicemia

**<70 mg/dL**

e hiperglicemia

**>180 mg/dL**

---

# 🧠 AVALIAÇÃO NEUROLÓGICA

Realizar

AVDI

ou

Escala de Glasgow

---

Avaliar

✔ Pupilas

✔ Reflexos

✔ Convulsões

---

Se suspeita de crise

↓

EEG quando disponível.

---

# 🧠 NEUROPROGNÓSTICO

Não concluir prognóstico neurológico precocemente.

Avaliação multimodal

↓

Exame clínico + EEG + imagem + biomarcadores quando disponíveis

↓

Consolidar prognóstico

**≥72 horas após normotermia**

Considerar confundidores

✔ Sedação

✔ Bloqueio neuromuscular

✔ Distúrbios metabólicos

✔ Disfunção orgânica

---

# 💊 CONVULSÕES

Tratar prontamente.

Seguir protocolo institucional.

---

# 💧 CONTROLE HIDROELETROLÍTICO

Corrigir

✔ Potássio

✔ Magnésio

✔ Cálcio

✔ Acidose

---

# 🔎 INVESTIGAR A CAUSA DA PCR

Sempre responder:

"O que provocou essa parada?"

Pesquisar

✔ IAM

✔ TEP

✔ Hipóxia

✔ Hipovolemia

✔ Distúrbios hidroeletrolíticos

✔ Intoxicações

✔ Tamponamento

✔ Pneumotórax hipertensivo

---

# 📊 ETCO₂

Monitorização contínua.

Ajuda a avaliar

✔ Ventilação

✔ Perfusão

✔ Qualidade da circulação

---

# 🚨 DESTINO

Paciente pós-PCR

↓

Internação em UTI

Monitorização contínua.

---

# ⚠️ ALERTAS

❌ Não manter hiperóxia.

❌ Evitar hiperventilação.

❌ Não esquecer ECG.

❌ Não negligenciar febre.

❌ Não esquecer causa da PCR.

❌ Não realizar prognóstico neurológico precoce.

---

# ❌ ERROS FREQUENTES

❌ Considerar atendimento encerrado após retorno do pulso.

❌ Não investigar IAM.

❌ Não controlar temperatura.

❌ Não monitorizar ETCO₂.

❌ Hiperventilar paciente.

❌ Não tratar hipotensão.

❌ Realizar coronariografia emergencial de rotina no paciente estável sem supra.

---

# 💎 PÉROLAS RESIBOOK

🧠 O cérebro continua sofrendo após o retorno da circulação.

🧠 Febre aumenta lesão neurológica.

🧠 Hipóxia e hiperóxia são igualmente prejudiciais.

🧠 Sem supra de ST, coronariografia emergencial é reservada para pacientes selecionados com choque, instabilidade elétrica ou isquemia persistente.

🧠 O tratamento da causa da PCR é tão importante quanto a própria ressuscitação.

---

# 📚 MODO ESTUDO

Os cuidados pós-PCR têm como objetivo preservar o cérebro e evitar recorrência da parada.

Após o retorno da circulação espontânea, deve-se realizar nova avaliação ABCDE, otimizar oxigenação (SatO₂ 90–98% e PaO₂ 60–105 mmHg), manter normocapnia (PaCO₂ 35–45 mmHg), garantir PAM ≥65 mmHg, realizar ECG de 12 derivações, controlar rigorosamente a temperatura por pelo menos 36 horas nos pacientes que não respondem a comandos, evitar glicemia <70 mg/dL ou >180 mg/dL, corrigir distúrbios metabólicos e investigar a causa da PCR.

No paciente sem supra de ST, a coronariografia emergencial deve ser considerada quando houver choque cardiogênico, arritmias ventriculares recorrentes ou isquemia miocárdica significativa persistente. O neuroprognóstico deve ser multimodal e consolidado pelo menos 72 horas após a normotermia, considerando os efeitos de sedativos e outros confundidores.

Todo paciente pós-PCR deve ser encaminhado para monitorização intensiva em UTI.`,
  },
  {
    slug: "drogas-acls",
    title: "Drogas do ACLS",
    source: `# 💊 DROGAS DO ACLS

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

| Droga | Principal indicação |
|---------|---------------------|
| Epinefrina | PCR / Bradicardia refratária |
| Amiodarona | FV/TVSP / TV com pulso |
| Lidocaína | Alternativa à amiodarona |
| Adenosina | TPSV regular de QRS estreito |
| Atropina | Bradicardia sintomática |
| Dopamina | Bradicardia refratária |
| Epinefrina infusão | Bradicardia refratária |
| Sulfato de Magnésio | Torsades de Pointes |

---

# 💊 EPINEFRINA (BOLUS)

## Indicações

✔ PCR (FV, TVSP, AESP e Assistolia)

---

## Dose

**1 mg IV/IO**

---

## Repetição

**A cada 3–5 minutos**

---

## Administração

✔ Flush 20 mL SF

✔ Elevar membro

---

## Observações

• Nunca atrasar RCP para administrar.

• Nos ritmos chocáveis iniciar após o 2º choque.

• Nos ritmos não chocáveis administrar o mais precocemente possível.

---

# 💊 AMIODARONA

## Indicações

✔ FV

✔ TV sem pulso

✔ TV com pulso estável

---

## PCR (FV/TVSP)

Primeira dose

**300 mg IV/IO**

Persistindo ritmo chocável

↓

Segunda dose

**150 mg IV/IO**

---

## TV COM PULSO

**150 mg**

Diluir em

100 mL SG5%

Infundir em

10 minutos

---

## Contraindicações / Cautela

⚠️ Não utilizar em Torsades de Pointes.

⚠️ Pode prolongar QT.

---

# 💊 LIDOCAÍNA

## Indicações

Alternativa quando Amiodarona indisponível.

---

## Dose inicial

**1–1,5 mg/kg IV**

---

## Doses adicionais

0,5–0,75 mg/kg

---

## Dose máxima

**3 mg/kg**

---

# 💊 ADENOSINA

## Indicação

TPSV regular

QRS estreito

---

## Dose

Primeira

**6 mg IV em bolus**

↓

Flush

20 mL SF

↓

Elevar membro

---

Persistiu

↓

**12 mg**

---

Persistiu

↓

**12 mg**

---

## Administração

Sempre em acesso proximal.

Quanto mais proximal, maior eficácia.

---

## Avisar paciente

Pode causar

✔ Calor

✔ Dor torácica

✔ Sensação de morte

✔ Assistolia transitória

---

## Contraindicações / Cautela

⚠️ Asma

⚠️ Broncoespasmo

⚠️ Transplante cardíaco

⚠️ Dipiridamol

---

# 💊 ATROPINA

## Indicação

Bradicardia sintomática.

---

## Dose

**1 mg IV**

---

## Repetição

A cada

3–5 minutos

---

## Dose máxima

**3 mg**

---

## Observações

Pouco eficaz em

• Mobitz II

• BAV 3º grau

• Bloqueios infranodais

---

# 💊 DOPAMINA

## Indicação

Bradicardia sintomática refratária.

---

## Dose

**5–20 mcg/kg/min**

---

## Administração

Infusão contínua.

Titular conforme resposta clínica.

---

# 💊 EPINEFRINA (INFUSÃO)

## Indicação

Bradicardia refratária.

---

## Dose

**2–10 mcg/min**

---

## Administração

Infusão contínua.

Titular conforme resposta.

---

# 💊 SULFATO DE MAGNÉSIO

## Indicação

Torsades de Pointes.

---

## Dose

**1–2 g IV**

Diluir em

100 mL SF

Infundir em

5–10 minutos

---

## Observações

✔ Corrige QT prolongado.

✔ Antiarrítmico de escolha no Torsades.

---

## NÃO UTILIZAR

Amiodarona no Torsades.

---

# 💊 CRISTALOIDES

## Indicação

Hipovolemia

Hipotensão

Choque

Pós-PCR

---

# 📊 RESUMO DAS DOSES

| Droga | Dose |
|--------|------|
| Epinefrina PCR | **1 mg** |
| Epinefrina Infusão | **2–10 mcg/min** |
| Atropina | **1 mg** |
| Amiodarona PCR | **300 → 150 mg** |
| Amiodarona TV | **150 mg/10 min** |
| Lidocaína | **1–1,5 mg/kg** |
| Adenosina | **6 → 12 → 12 mg** |
| Magnésio | **1–2 g** |
| Dopamina | **5–20 mcg/kg/min** |

---

# ⚠️ ALERTAS

❌ Não atrasar RCP para administrar drogas.

❌ Não usar Amiodarona em Torsades.

❌ Não insistir em Atropina nos bloqueios infranodais.

❌ Não fazer Adenosina em ritmos irregulares (FA irregular/WPW).

---

# ❌ ERROS FREQUENTES

❌ Esquecer flush após Adenosina.

❌ Administrar Adenosina lentamente.

❌ Não elevar o membro após Epinefrina.

❌ Esquecer segunda dose de Amiodarona.

❌ Confundir Epinefrina em bolus com infusão.

❌ Dar Magnésio sem suspeita de Torsades.

---

# 💎 PÉROLAS RESIBOOK

🧠 Nenhuma droga substitui uma RCP de alta qualidade.

🧠 O choque continua sendo o tratamento mais importante da FV/TV sem pulso.

🧠 Adenosina é diagnóstica e terapêutica na TPSV.

🧠 Quanto mais proximal o acesso da Adenosina, maior a chance de sucesso.

🧠 Toda TV de QRS largo deve ser considerada ventricular até prova em contrário.

---

# 📚 MODO ESTUDO

As medicações do ACLS atuam como terapias adjuvantes e nunca substituem os pilares do atendimento: RCP de alta qualidade, desfibrilação precoce quando indicada e correção das causas reversíveis.

A Epinefrina permanece a droga vasopressora de escolha durante a PCR. A Amiodarona é o antiarrítmico preferencial para FV/TV sem pulso refratária, enquanto a Lidocaína pode ser utilizada como alternativa.

Na TPSV regular de QRS estreito, a Adenosina continua sendo a medicação de primeira linha após falha das manobras vagais.

Nas bradicardias sintomáticas, a Atropina é a droga inicial, sendo Dopamina, Epinefrina em infusão e Marcapasso Transcutâneo as principais opções quando não houver resposta.`,
  },
  {
    slug: "ritmos-cardiacos",
    title: "Ritmos Cardíacos - Reconhecimento Rápido",
    source: `# 🫀 RITMOS CARDÍACOS - RECONHECIMENTO RÁPIDO

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Tem onda P?

↓

SIM

↓

Sinusal

↓

QRS largo?

↓

SIM

↓

TV até prova em contrário

↓

NÃO

↓

RR regular?

↓

SIM

↓

TPSV

↓

NÃO

↓

FA

↓

Tem onda F serrilhada?

↓

Flutter

---

# 📌 OBJETIVO

Reconhecer rapidamente o ritmo cardíaco para direcionar corretamente o algoritmo do ACLS.

---

# 🔎 PASSO A PASSO

## 1. Existe onda P?

SIM

↓

Pensar em ritmo sinusal ou bradicardia sinusal.

---

NÃO

↓

Continuar avaliação.

---

## 2. Existe onda F serrilhada?

SIM

↓

Flutter atrial.

---

## 3. O QRS é largo?

SIM

↓

Considerar Taquicardia Ventricular até prova em contrário.

Lembrar dos diferenciais:

• TSV com aberrância

• WPW

---

NÃO

↓

Continuar.

---

## 4. O RR é regular?

SIM

↓

TPSV

---

NÃO

↓

Fibrilação Atrial

---

# 📊 PRINCIPAIS RITMOS

## Ritmo Sinusal

✔ Onda P antes de todos QRS

✔ FC 60–100 bpm

✔ PR constante

Conduta

Normal.

---

## Bradicardia Sinusal

✔ Onda P presente

✔ FC <60

Conduta

Tratar apenas se sintomática.

---

## Taquicardia Sinusal

✔ Onda P presente

✔ FC >100

Conduta

Tratar causa.

Não cardioverter.

---

## Flutter Atrial

✔ Ondas F serrilhadas

✔ Geralmente regular

Conduta

Instável

↓

Cardioversão sincronizada

Estável

↓

Controle da frequência ou ritmo.

---

## Fibrilação Atrial

✔ Sem onda P

✔ RR irregular

✔ QRS geralmente estreito

Conduta

Instável

↓

Cardioversão sincronizada

Estável

↓

Controle FC

Avaliar anticoagulação

---

## TPSV

✔ Regular

✔ QRS estreito

✔ Geralmente sem onda P visível

Conduta

Manobra vagal

↓

Adenosina

↓

Betabloqueador ou BCC

---

## TV Monomórfica

✔ QRS largo

✔ Regular

✔ Geralmente sem onda P

Conduta

Instável

↓

Cardioversão

Estável

↓

Amiodarona

---

## Torsades de Pointes

✔ TV Polimórfica

✔ QT longo

Conduta

Desfibrilar

+

Magnésio

---

## Fibrilação Ventricular

✔ Caótica

✔ Sem QRS organizado

✔ Ritmo de parada

Conduta

Desfibrilação

+

RCP

---

## Assistolia

Linha praticamente reta

Confirmar em duas derivações.

Conduta

RCP

+

Epinefrina

---

## AESP

Qualquer ritmo organizado

+

SEM pulso

Conduta

RCP

+

Epinefrina

+

5Hs/5Ts

---

# ⚠️ ALERTAS

Toda TV de QRS largo deve ser considerada ventricular até prova em contrário.

Toda atividade elétrica sem pulso é AESP.

Assistolia deve ser confirmada antes do diagnóstico.

---

# ❌ ERROS FREQUENTES

❌ Confundir FA com TPSV

❌ Chocar AESP

❌ Chocar Assistolia

❌ Dar Adenosina para FA irregular

❌ Não reconhecer Torsades

---

# 💎 PÉROLAS RESIBOOK

🧠 Tem onda P → provavelmente sinusal.

🧠 Onda F → Flutter.

🧠 RR irregular → pensar primeiro em FA.

🧠 QRS largo → TV até prova em contrário.

🧠 Ritmo organizado + sem pulso = AESP.`,
  },
  {
    slug: "cardioversao-vs-desfibrilacao",
    title: "Cardioversão x Desfibrilação",
    source: `# ⚡ CARDIOVERSÃO x DESFIBRILAÇÃO

⭐⭐⭐⭐⭐

⏱ Leitura: 1 minuto

---

# 🚨 RESUMO RÁPIDO

FV

➡️ Desfibrilar

TV sem pulso

➡️ Desfibrilar

TV com pulso instável

➡️ Cardioversão sincronizada

TPSV instável

➡️ Cardioversão sincronizada

Flutter instável

➡️ Cardioversão sincronizada

FA instável

➡️ Cardioversão sincronizada

Torsades

➡️ Desfibrilar

---

# 📌 DIFERENÇA

## DESFIBRILAÇÃO

Choque NÃO sincronizado.

Utilizado em

✔ FV

✔ TV sem pulso

✔ Torsades

Botão

❌ NÃO apertar SYNC.

---

## CARDIOVERSÃO

Choque sincronizado.

O aparelho identifica o QRS.

Utilizado em

✔ FA

✔ Flutter

✔ TPSV

✔ TV com pulso

Botão

✅ Apertar SYNC.

---

# ⚡ ENERGIAS

## DESFIBRILAÇÃO

Bifásico

120–200 J

(se desconhecido usar 200 J)

Choques seguintes

Maior energia disponível.

Monofásico

360 J

---

## CARDIOVERSÃO

### TPSV

50–100 J

---

### Flutter

50–100 J

---

### FA

120–200 J bifásico

---

### TV Monomórfica

100 J

---

# ⚠️ SEDAÇÃO

Sempre que possível

Sedar antes da cardioversão.

Exceção

Paciente em risco iminente de morte.

---

# ⚠️ ALERTAS

Nunca sincronizar FV.

Nunca sincronizar TV sem pulso.

Sempre conferir se o botão SYNC permanece ligado antes de cada choque.

---

# ❌ ERROS FREQUENTES

❌ Esquecer botão SYNC.

❌ Desfibrilar FA.

❌ Cardioverter FV.

❌ Aguardar sedação em paciente extremamente instável.

---

# 💎 PÉROLAS RESIBOOK

🧠 Vivo → cardioversão.

🧠 Morto (PCR) → desfibrilação.

🧠 Torsades é a exceção: paciente pode ter pulso e ainda assim precisar de desfibrilação devido à dificuldade de sincronização e instabilidade.`,
  },
  {
    slug: "iam",
    title: "Síndrome Coronariana Aguda (SCA)",
    source: `# ❤️ SÍNDROME CORONARIANA AGUDA (SCA)

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Dor torácica

↓

ECG em até 10 minutos

↓

Supra de ST?

↓

SIM

↓

IAM COM SUPRA

↓

Reperfusão imediata

↓

NÃO

↓

Troponina

↓

Positiva

↓

IAM SEM SUPRA

↓

Estratificar risco

↓

Angiografia conforme risco

---

# 📌 QUANDO UTILIZAR

Paciente com suspeita de síndrome coronariana aguda:

✔ Dor torácica típica

✔ Equivalentes anginosos

✔ ECG sugestivo

✔ Troponina elevada

---

# 🎯 OBJETIVO

✔ Diagnóstico rápido

✔ Diferenciar IAMCSST de IAMSSST

✔ Iniciar reperfusão o mais precocemente possível

---

# 🚑 AVALIAÇÃO INICIAL

## ABCDE

↓

Monitor cardíaco

↓

PA

↓

Oximetria

↓

Acesso venoso

↓

ECG 12 derivações

↓

Troponina

---

# ⏱ TEMPOS IMPORTANTES

ECG

≤10 minutos

---

ICP Primária

≤90 minutos

(ideal)

---

Tempo máximo aceitável

≤120 minutos

---

Se ICP >120 minutos

↓

Avaliar trombólise

---

# 📊 CLASSIFICAÇÃO

## IAM COM SUPRA

✔ Supra persistente

✔ BRE novo sugestivo

✔ Equivalentes de supra

Conduta

↓

Reperfusão imediata

---

## IAM SEM SUPRA

Sem supra

+

Troponina elevada

↓

Estratificar risco

↓

Angiografia conforme risco

---

## ANGINA INSTÁVEL

Sem supra

Sem troponina

Dor típica

↓

Estratificar risco

---

# 💊 MEDICAÇÕES INICIAIS

✔ AAS

✔ Segundo antiagregante

✔ Anticoagulação

✔ Estatina alta potência

---

Oxigênio

Somente se

SatO₂ <90%

---

Nitrato

Se dor persistente

↓

Evitar em:

• IAM VD

• Hipotensão

• Uso recente de sildenafil

---

# ⚠️ ALERTAS

Nunca esperar troponina para reperfundir IAMCSST.

O ECG salva mais vidas que a troponina nas primeiras horas.

---

# ❌ ERROS FREQUENTES

❌ Demorar para fazer ECG

❌ Esperar laboratório

❌ Dar oxigênio para todo mundo

❌ Não reconhecer equivalente de supra

---

# 💎 PÉROLAS RESIBOOK

🧠 Tempo é músculo.

🧠 Todo paciente com dor torácica deve realizar ECG em até 10 minutos.

🧠 IAMCSST é diagnóstico eletrocardiográfico.`,
  },
  {
    slug: "iam-com-supra",
    title: "IAM com Supra (IAMCSST)",
    source: `# ❤️ IAM COM SUPRA (IAMCSST)

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

ECG

↓

Supra?

↓

SIM

↓

Tempo até ICP

<120 min

↓

ICP Primária

↓

>120 min

↓

Contraindicação trombólise?

↓

SIM

↓

Transferir para ICP

↓

NÃO

↓

Trombólise

↓

Angiografia 2–24 h

---

# 📌 CRITÉRIOS DE SUPRA

Elevação do ST em pelo menos duas derivações contíguas.

Limites:

Derivações gerais

≥1 mm

---

V2-V3

Homens ≥40 anos

≥2 mm

Homens <40 anos

≥2,5 mm

Mulheres

≥1,5 mm

---

# 🎯 OBJETIVO

Reperfundir a artéria culpada o mais rapidamente possível.

---

# ⚡ PASSO 1

Diagnóstico

↓

ECG até 10 minutos.

---

# ⚡ PASSO 2

Existe possibilidade de ICP em até

120 minutos?

---

## SIM

↓

ICP Primária

---

## NÃO

↓

Avaliar trombólise.

---

# 💊 MEDICAÇÕES IMEDIATAS

## AAS

300 mg

Mastigar.

---

## Segundo antiagregante

Clopidogrel

OU

Ticagrelor

(priorizar quando ICP)

---

## Anticoagulação

Conforme estratégia escolhida.

---

## Estatina

Alta potência.

Ex:

Atorvastatina 80 mg

---

## Nitrato

Se dor persistente

e

SEM contraindicações.

---

# 🚫 NÃO USAR NITRATO

Hipotensão

IAM VD

Uso recente de inibidor da PDE5

---

# ⚠️ OXIGÊNIO

Somente

SatO₂ <90%

---

# 🚨 REPERFUSÃO

Quanto mais cedo

↓

Menor área de necrose

↓

Menor mortalidade

---

# ❌ ERROS FREQUENTES

❌ Esperar troponina

❌ Atrasar ICP

❌ Não indicar trombólise quando ICP demora

❌ Dar nitrato em IAM de VD

---

# 💎 PÉROLAS RESIBOOK

🧠 ECG faz o diagnóstico.

🧠 Troponina não deve atrasar reperfusão.

🧠 Tempo é músculo.`,
  },
  {
    slug: "estrategias-reperfusao-iamcsst",
    title: "Estratégias de Reperfusão no IAMCSST",
    source: `# ❤️ ESTRATÉGIAS DE REPERFUSÃO NO IAMCSST

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

IAMCSST

↓

Pode realizar ICP em até 120 minutos?

↓

✅ SIM

➡️ ICP Primária

↓

❌ NÃO

↓

Existe contraindicação à trombólise?

↓

✅ SIM

➡️ Transferir imediatamente para ICP

↓

❌ NÃO

➡️ Trombólise imediata

↓

Reavaliar reperfusão

↓

Reperfundiu?

↓

✅ SIM

➡️ Angiografia em 2–24 horas
(Estratégia Farmacoinvasiva)

↓

❌ NÃO

➡️ ICP de Resgate

---

# 🎯 OBJETIVO

Escolher a estratégia de reperfusão que reduza ao máximo o tempo de isquemia miocárdica.

Tempo é músculo.

---

# ❤️ ICP PRIMÁRIA

## Primeira escolha sempre que possível.

### Indicações

✔ IAM com supra

✔ Início dos sintomas <12 horas

✔ Tempo porta-balão ≤90 minutos

✔ Tempo até dispositivo ≤120 minutos

---

## Vantagens

✔ Maior reperfusão

✔ Menor mortalidade

✔ Menor risco de AVC

✔ Menor reinfarto

---

# 💉 TROMBÓLISE

Utilizar quando:

✔ IAMCSST

✔ Início dos sintomas <12 horas

✔ Não será possível realizar ICP em até 120 minutos

✔ Sem contraindicações

---

## Objetivo

Administrar o trombolítico o mais precocemente possível.

Meta porta-agulha

**≤30 minutos**

---

# 🚨 SUCESSO DA TROMBÓLISE

Critérios

✔ Alívio importante da dor

✔ Redução ≥50% do supra de ST após 60–90 minutos

✔ Arritmias de reperfusão

---

## Conduta

Mesmo quando a trombólise funciona

↓

Todo paciente deverá realizar angiografia entre **2 e 24 horas**.

(Estratégia farmacoinvasiva)

---

# 🚑 ICP DE RESGATE

## Indicações

Trombólise sem sucesso.

Suspeitar quando:

✔ Dor persistente

✔ Supra permanece

✔ Redução do ST <50%

✔ Choque

✔ Instabilidade elétrica

↓

Encaminhar imediatamente para hemodinâmica.

---

# ❤️ ESTRATÉGIA FARMACOINVASIVA

Paciente trombolisado com sucesso.

↓

Angiografia obrigatória

Entre

**2 e 24 horas**

Mesmo que esteja assintomático.

---

# ⏱ TEMPOS IMPORTANTES

ECG

≤10 minutos

---

Porta-agulha

≤30 minutos

---

Porta-balão

≤90 minutos

---

Tempo máximo até ICP

≤120 minutos

---

# ⚠️ ALERTAS

Nunca esperar troponina para decidir reperfusão.

ICP continua sendo superior à trombólise.

Após trombólise bem-sucedida o tratamento NÃO termina.

Sempre encaminhar para angiografia.

---

# ❌ ERROS FREQUENTES

❌ Fazer trombólise quando existe ICP rápida disponível.

❌ Não encaminhar paciente trombolisado para cateterismo.

❌ Manter paciente em observação após trombólise sem programar angiografia.

❌ Demorar para indicar ICP de resgate.

---

# 💎 PÉROLAS RESIBOOK

🧠 ICP é sempre a estratégia preferida.

🧠 Trombólise não substitui cateterismo.

🧠 Trombólise + angiografia precoce = Estratégia Farmacoinvasiva.

🧠 Falhou trombólise → ICP de Resgate.

---

# 📚 MODO ESTUDO

A ICP primária é o tratamento de escolha para o IAM com supra sempre que puder ser realizada dentro do tempo recomendado (até 120 minutos do primeiro contato médico).

Quando esse tempo não puder ser cumprido, deve-se indicar trombólise, desde que o paciente não apresente contraindicações.

Após trombólise:

• Se houver reperfusão → realizar angiografia entre 2–24 horas (estratégia farmacoinvasiva).

• Se não houver reperfusão → encaminhar imediatamente para ICP de resgate.

A decisão entre ICP e trombólise nunca deve atrasar a reperfusão.`,
  },
  {
    slug: "trombolise-iam-com-supra",
    title: "Trombólise no IAM com Supra",
    source: `# 💉 TROMBÓLISE NO IAM COM SUPRA

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

IAMCSST

↓

ICP disponível em ≤120 min?

↓

✅ SIM

➡️ ICP Primária

↓

❌ NÃO

↓

Contraindicação à trombólise?

↓

✅ SIM

➡️ Transferir para ICP

↓

❌ NÃO

↓

Administrar trombolítico

↓

Reavaliar em 60–90 min

↓

Reperfundiu?

↓

✅ SIM

➡️ Angiografia 2–24 h

↓

❌ NÃO

➡️ ICP de Resgate

---

# 📌 INDICAÇÕES

✔ IAM com supra de ST

✔ Início dos sintomas <12 horas

✔ ICP não disponível em até 120 minutos

✔ Ausência de contraindicações

---

# 🚫 NÃO TROMBOLISAR

❌ IAM sem supra

❌ Sintomas >12 horas sem isquemia persistente

❌ Contraindicações absolutas

---

# 💊 TENECTEPLASE (TNK)

Dose única em bolus IV.

| Peso | Dose |
|------:|------:|
| <60 kg | **30 mg** |
| 60–69 kg | **35 mg** |
| 70–79 kg | **40 mg** |
| 80–89 kg | **45 mg** |
| ≥90 kg | **50 mg** |

Vantagens

✔ Dose única

✔ Administração rápida

✔ Preferida na maioria dos serviços

---

# 💊 ALTEPLASE (rt-PA)

Dose total

**100 mg**

Esquema

15 mg em bolus IV

↓

0,75 mg/kg em 30 minutos

(máximo 50 mg)

↓

0,5 mg/kg nas próximas 60 minutos

(máximo 35 mg)

Total

100 mg

---

# 💊 ANTIAGREGAÇÃO

## AAS

300 mg VO

Mastigar imediatamente.

↓

Manutenção

100 mg/dia

---

## CLOPIDOGREL

<75 anos

300 mg ataque

↓

75 mg/dia

---

≥75 anos

Não fazer ataque.

↓

75 mg/dia

---

# 💉 ANTICOAGULAÇÃO

Associar anticoagulante.

Opções

✔ Enoxaparina

✔ Heparina não fracionada

✔ Fondaparinux (situações específicas)

---

# ❤️ AVALIAÇÃO DA REPERFUSÃO

Realizar ECG

60–90 minutos

---

Critérios de sucesso

✔ Redução ≥50% do supra

✔ Melhora importante da dor

✔ Arritmias de reperfusão

---

# 🚨 TROMBÓLISE FALHOU

Critérios

❌ Supra persiste

❌ Redução <50%

❌ Dor continua

❌ Choque

↓

ICP DE RESGATE IMEDIATA

---

# ⚠️ COMPLICAÇÕES

✔ Hemorragia

✔ AVC hemorrágico

✔ Reação alérgica

✔ Arritmias de reperfusão

---

# 🚫 CONTRAINDICAÇÕES ABSOLUTAS

❌ Hemorragia intracraniana prévia

❌ AVC isquêmico <3 meses

❌ Neoplasia intracraniana

❌ MAV cerebral

❌ Trauma craniano importante <3 meses

❌ Suspeita de dissecção aguda de aorta

❌ Sangramento ativo

❌ Diátese hemorrágica importante

❌ Punção de vaso não compressível recente

---

# ⚠️ CONTRAINDICAÇÕES RELATIVAS

⚠️ HAS grave não controlada

⚠️ AVC >3 meses

⚠️ Gestação

⚠️ Úlcera péptica ativa

⚠️ Uso de anticoagulantes

⚠️ Cirurgia recente

⚠️ RCP traumática prolongada

⚠️ Insuficiência hepática avançada

⚠️ Endocardite infecciosa

---

# ❌ ERROS FREQUENTES

❌ Esperar troponina

❌ Fazer trombólise em IAM sem supra

❌ Não avaliar contraindicações

❌ Não encaminhar para angiografia após sucesso

❌ Não indicar ICP de resgate após falha

---

# 💎 PÉROLAS RESIBOOK

🧠 ICP continua sendo o tratamento de escolha.

🧠 Trombólise deve ser iniciada em até 30 minutos da chegada.

🧠 Toda trombólise deve ser seguida por angiografia.

🧠 Falha da trombólise = ICP de Resgate.

🧠 Nunca trombolisar uma dissecção de aorta.

---

# 📚 MODO ESTUDO

A trombólise está indicada quando o paciente apresenta IAM com supra, sintomas com menos de 12 horas e não é possível realizar ICP primária em até 120 minutos.

A preferência atual é pela Tenecteplase devido à facilidade de administração em bolus único.

Após a trombólise, todos os pacientes devem ser reavaliados clínica e eletrocardiograficamente em 60–90 minutos. Na presença de reperfusão, seguem para estratégia farmacoinvasiva (angiografia em 2–24 horas). Na ausência de reperfusão, está indicada ICP de resgate.`,
  },
  {
    slug: "icp-resgate",
    title: "ICP de Resgate",
    source: `# ❤️ ICP DE RESGATE

⭐⭐⭐⭐⭐

⏱ Leitura: 30 segundos

---

# Quando indicar

Falha da trombólise.

---

# Critérios

✔ Dor persistente

✔ Redução <50% do supra após 60–90 min

✔ Choque

✔ Instabilidade hemodinâmica

✔ Arritmias graves

---

# Conduta

Transferir imediatamente para hemodinâmica.

---

# Nunca esquecer

Toda trombólise deve terminar em:

✔ Angiografia (2–24 h)

ou

✔ ICP de Resgate.`,
  },
  {
    slug: "iam-sem-supra",
    title: "IAM sem Supra (IAMSSST / NSTEMI)",
    source: `# ❤️ IAM SEM SUPRA (IAMSSST / NSTEMI)

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Dor torácica

↓

ECG SEM supra

↓

Troponina

↓

Positiva

↓

IAMSSST

↓

Estratificar risco

↓

Muito Alto

↓

Angiografia <2 h

↓

Alto

↓

Angiografia <24 h

↓

Intermediário

↓

Angiografia <72 h

↓

Baixo

↓

Tratamento clínico + Teste funcional

---

# 📌 DEFINIÇÃO

Necrose miocárdica

+

Troponina elevada

+

SEM supra persistente do ST.

---

# 🎯 OBJETIVO

Identificar pacientes de alto risco que necessitam de abordagem invasiva precoce.

---

# ⚡ CONDUTA INICIAL

ABCDE

↓

Monitor

↓

ECG

↓

Troponina

↓

AAS

↓

Segundo antiagregante

↓

Anticoagulação

↓

Estatina

↓

Estratificar risco

---

# 🚨 ESTRATIFICAÇÃO

## MUITO ALTO RISCO

✔ Choque

✔ Dor refratária

✔ Arritmias graves

✔ Instabilidade hemodinâmica

✔ Edema agudo de pulmão

↓

Cateterismo

**<2 horas**

---

## ALTO RISCO

✔ Troponina positiva

✔ Alterações dinâmicas do ST

✔ GRACE >140

↓

Cateterismo

**<24 horas**

---

## RISCO INTERMEDIÁRIO

✔ Diabetes

✔ DRC

✔ FE reduzida

✔ IAM prévio

✔ Revascularização prévia

↓

Cateterismo

**<72 horas**

---

## BAIXO RISCO

↓

Tratamento clínico

↓

Teste funcional

↓

Alta quando indicado

---

# 🚫 TROMBÓLISE

NÃO FAZER

IAM sem Supra

NUNCA é indicação de trombólise.

---

# 💊 MEDICAÇÕES

AAS

+

Segundo antiagregante

+

Anticoagulação

+

Estatina alta potência

+

Betabloqueador

(se indicado)

---

# ⚠️ ALERTAS

Não esperar supra para iniciar tratamento.

Troponina elevada muda completamente a conduta.

---

# ❌ ERROS FREQUENTES

❌ Trombolisar IAMSSST.

❌ Não estratificar risco.

❌ Não solicitar troponina seriada.

❌ Não indicar cateterismo em pacientes de alto risco.

---

# 💎 PÉROLAS RESIBOOK

🧠 IAMSSST nunca recebe trombólise.

🧠 O risco define quando o paciente vai para a hemodinâmica.

🧠 Troponina positiva = necrose miocárdica.

---

# 📚 MODO ESTUDO

A estratégia no IAM sem supra baseia-se na estratificação de risco. Pacientes de muito alto risco devem ser encaminhados para angiografia em até 2 horas; alto risco, em até 24 horas; risco intermediário, em até 72 horas. Pacientes de baixo risco podem seguir tratamento clínico e avaliação funcional. A trombólise é contraindicada no IAMSSST.`,
  },
  {
    slug: "medicamentos-iam",
    title: "Medicamentos do IAM",
    source: `# 💊 MEDICAMENTOS DO IAM

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Todo IAM

↓

AAS

+

Segundo antiagregante

+

Anticoagulante

+

Estatina alta potência

↓

Nitrato (se indicado)

↓

Betabloqueador (se indicado)

↓

Morfina (casos selecionados)

↓

Oxigênio apenas se SatO₂ <90%

---

# 💊 AAS

## Indicação

Todo paciente com IAM, salvo contraindicação.

---

## Ataque

**300 mg VO mastigar**

---

## Manutenção

**100 mg/dia**

---

## Contraindicações

❌ Alergia grave

❌ Sangramento ativo importante

---

# 💊 CLOPIDOGREL

## Indicação

Segundo antiagregante.

---

### Ataque

<75 anos

**300 mg**

(alguns serviços utilizam 600 mg quando ICP primária)

---

≥75 anos

Sem dose de ataque

↓

75 mg/dia

---

## Manutenção

75 mg/dia

---

# 💊 TICAGRELOR

## Preferido quando ICP Primária

Ataque

**180 mg VO**

↓

Manutenção

90 mg

12/12 horas

---

## Evitar

✔ Sangramento ativo

✔ História de HIC

---

# 💊 PRASUGREL

## Ataque

60 mg

↓

Manutenção

10 mg/dia

---

## Contraindicações

❌ AVC prévio

❌ AIT prévio

❌ Idosos (>75 anos) - evitar, salvo situações selecionadas

❌ Peso <60 kg (considerar 5 mg)

---

# 💉 HEPARINA NÃO FRACIONADA

## ICP Primária

Bolus

**70–100 UI/kg IV**

(se não usar GP IIb/IIIa)

ou

**50–70 UI/kg**

(se usar GP IIb/IIIa)

---

# 💉 ENOXAPARINA

## IAMCSST trombolisado

<75 anos

30 mg IV

↓

1 mg/kg SC

12/12 h

---

≥75 anos

Não fazer bolus IV

↓

0,75 mg/kg SC

12/12 h

---

ClCr <30 mL/min

1 mg/kg

24/24 h

---

# 💉 FONDAPARINUX

Dose

2,5 mg SC/dia

---

## Observação

Não utilizar isoladamente durante ICP.

Necessita associação com HNF na hemodinâmica.

---

# 💊 ESTATINA

Administrar o mais precocemente possível.

---

## Atorvastatina

**80 mg**

---

## Rosuvastatina

20–40 mg

---

# 💊 NITRATO

## Indicação

Dor torácica

Hipertensão

Congestão

---

## Dose SL

Nitroglicerina

0,4 mg

A cada 5 minutos

Máximo

3 doses

---

## EV

Titular conforme PA

---

## Contraindicações

❌ PAS <90 mmHg

❌ IAM de VD

❌ Uso de Sildenafil (<24 h)

❌ Uso de Tadalafil (<48 h)

---

# 💊 BETABLOQUEADOR

## Indicação

Paciente estável

Sem choque

Sem IC aguda

---

## Metoprolol

25–50 mg VO

---

## Evitar

Choque

Bradicardia

BAV

Broncoespasmo grave

---

# 💊 MORFINA

## Indicação

Dor refratária apesar de nitrato.

---

Dose

2–4 mg IV

Pode repetir

2–8 mg

---

## Atenção

Pode atrasar absorção dos antiagregantes.

Usar apenas quando realmente necessário.

---

# 🌬 OXIGÊNIO

## Indicação

SatO₂ <90%

Dispneia

Insuficiência respiratória

---

## Não utilizar rotineiramente

Pacientes normoxêmicos.

---

# 📊 RESUMO DAS DOSES

| Medicação | Dose |
|------------|------|
| AAS | **300 mg ataque → 100 mg/dia** |
| Clopidogrel | **300 mg → 75 mg/dia** |
| Ticagrelor | **180 mg → 90 mg 12/12 h** |
| Prasugrel | **60 mg → 10 mg/dia** |
| Atorvastatina | **80 mg** |
| Nitroglicerina SL | **0,4 mg** |
| Morfina | **2–4 mg IV** |
| Enoxaparina | **1 mg/kg SC 12/12 h** |
| Fondaparinux | **2,5 mg SC** |

---

# ⚠️ ALERTAS

❌ Não administrar oxigênio rotineiramente.

❌ Não utilizar nitrato em IAM de ventrículo direito.

❌ Evitar morfina desnecessariamente.

❌ Prasugrel é contraindicado em AVC/AIT prévios.

❌ Fondaparinux isolado não deve ser usado durante ICP.

---

# ❌ ERROS FREQUENTES

❌ Esquecer o segundo antiagregante.

❌ Não iniciar estatina.

❌ Dar nitrato em paciente hipotenso.

❌ Administrar oxigênio para todos.

❌ Esquecer ajuste da enoxaparina no idoso ou na insuficiência renal.

---

# 💎 PÉROLAS RESIBOOK

🧠 Todo IAM deve receber dupla antiagregação, salvo contraindicação.

🧠 Estatina de alta potência deve ser iniciada ainda na fase aguda.

🧠 Oxigênio em excesso pode ser prejudicial.

🧠 O maior benefício no IAM continua sendo a reperfusão precoce.

---

# 📚 MODO ESTUDO

O tratamento medicamentoso do IAM é complementar à reperfusão. Todos os pacientes devem receber AAS, um segundo antiagregante, anticoagulação e estatina de alta intensidade, salvo contraindicações.

Nitratos aliviam sintomas, mas não reduzem mortalidade e são contraindicados em hipotensão, IAM de ventrículo direito e uso recente de inibidores da fosfodiesterase-5.

Betabloqueadores reduzem reinfarto e arritmias quando iniciados em pacientes hemodinamicamente estáveis. Morfina deve ser reservada para dor refratária, pois pode retardar a absorção dos antiagregantes.`,
  },
  {
    slug: "complicacoes-iam",
    title: "Complicações do IAM",
    source: `# ❤️ COMPLICAÇÕES DO IAM

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

IAM

↓

Arritmias

↓

Choque

↓

Complicações Mecânicas

↓

Insuficiência Cardíaca

↓

Pericardite

---

# ⚡ ARRITMIAS

Mais frequentes nas primeiras 24 horas.

Principais

✔ FV

✔ TV

✔ BAV

✔ Bradicardia

Conduta

Seguir protocolo ACLS.

---

# ❤️ CHOQUE CARDIOGÊNICO

## Suspeitar

Hipotensão

+

Hipoperfusão

+

Congestão

---

## Tratamento

✔ Hemodinâmica urgente

✔ Vasopressores

✔ Inotrópicos

✔ Suporte ventilatório

---

# 💔 RUPTURA DO MÚSCULO PAPILAR

Geralmente

2–7 dias.

---

Quadro

✔ Edema agudo de pulmão

✔ Novo sopro sistólico

✔ Choque

↓

Ecocardiograma

↓

Cirurgia urgente

---

# 💔 COMUNICAÇÃO INTERVENTRICULAR

Suspeitar

Novo sopro

+

Choque

↓

Ecocardiograma

↓

Correção cirúrgica

---

# 💔 RUPTURA DA PAREDE LIVRE

Complicação mais grave.

↓

Tamponamento

↓

AESP

↓

Alta mortalidade

---

# ❤️ INSUFICIÊNCIA CARDÍACA

Conduta

✔ Diuréticos

✔ Vasodilatadores

✔ Oxigênio se necessário

✔ Reperfusão

---

# ❤️ PERICARDITE

Precoce

↓

Dor pleurítica

↓

Atrito

↓

AAS em altas doses

Evitar AINEs não seletivos nas primeiras semanas.

---

# 📊 COMPLICAÇÕES MAIS COBRADAS

✔ FV

✔ TV

✔ Choque cardiogênico

✔ Ruptura de músculo papilar

✔ CIV

✔ Ruptura de parede livre

✔ Pericardite

---

# ⚠️ ALERTAS

Novo sopro após IAM = pensar em complicação mecânica até prova em contrário.

Hipotensão após IAM inferior = excluir infarto de ventrículo direito.

---

# ❌ ERROS FREQUENTES

❌ Não suspeitar de ruptura.

❌ Tratar apenas o choque sem reperfundir.

❌ Não solicitar ecocardiograma.

---

# 💎 PÉROLAS RESIBOOK

🧠 A principal causa de morte nas primeiras horas é arritmia ventricular.

🧠 Complicações mecânicas costumam aparecer entre o 2º e o 7º dia.

🧠 Novo sopro + instabilidade = ecocardiograma imediato.

---

# 📚 MODO ESTUDO

As complicações do IAM dividem-se em elétricas (FV, TV, BAV), hemodinâmicas (choque cardiogênico, insuficiência cardíaca) e mecânicas (ruptura do músculo papilar, comunicação interventricular e ruptura da parede livre). O reconhecimento precoce é essencial, pois muitas dessas complicações exigem intervenção cirúrgica ou reperfusão urgente.`,
  },
  {
    slug: "avc",
    title: "AVC - Reconhecimento e Fluxograma Inicial",
    source: `# 🧠 AVC - RECONHECIMENTO E FLUXOGRAMA INICIAL

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Suspeita de AVC

↓

Último momento visto bem

↓

ABCDE

↓

Glicemia Capilar

↓

NIHSS

↓

TC de Crânio SEM contraste

↓

Hemorragia?

↓

SIM

↓

Protocolo AVCH

↓

NÃO

↓

Elegível para trombólise?

↓

SIM

↓

Alteplase/Tenecteplase

↓

Elegível para trombectomia?

↓

SIM

↓

Hemodinâmica

↓

UTI / Unidade AVC

---

# 📌 QUANDO UTILIZAR

Todo paciente com déficit neurológico focal súbito.

---

# 🚨 SINAIS DE AVC

✔ Hemiparesia

✔ Assimetria facial

✔ Disartria

✔ Afasia

✔ Perda visual

✔ Ataxia

✔ Alteração súbita da sensibilidade

✔ Rebaixamento inexplicado

---

# 🚑 AVALIAÇÃO INICIAL

## ABCDE

↓

Monitor cardíaco

↓

PA

↓

Oximetria

↓

Acesso venoso

↓

Glicemia capilar

↓

ECG

↓

TC de crânio SEM contraste

---

# 🍬 GLICEMIA

Obrigatória.

Hipoglicemia pode simular AVC.

Corrigir imediatamente se

<60 mg/dL.

---

# ⏰ ÚLTIMO MOMENTO VISTO BEM

Registrar exatamente.

Não utilizar horário em que o paciente acordou.

Utilizar

**Last Known Well**

---

# 🧠 NIHSS

Realizar em todos os pacientes.

Utilidade

✔ Gravidade

✔ Prognóstico

✔ Elegibilidade para trombectomia

---

# 🩻 TOMOGRAFIA

Primeiro exame.

Objetivo

Excluir hemorragia.

Não esperar laudo para iniciar protocolo.

---

# 📊 DIFERENCIAR

## AVC Isquêmico

TC inicial frequentemente normal.

↓

Avaliar reperfusão.

---

## AVC Hemorrágico

Sangramento visível.

↓

Controle rigoroso da PA.

↓

Neurocirurgia quando indicada.

---

# ❤️ OXIGÊNIO

Administrar somente se

SatO₂ <94%.

---

# 🌡 TEMPERATURA

Febre piora prognóstico.

Tratar >37,5°C.

---

# 🍬 GLICEMIA

Meta

140–180 mg/dL

Evitar

Hipoglicemia

Hiperglicemia

---

# 🚫 NÃO FAZER

❌ Esperar laboratório antes da TC.

❌ Esperar neurologista para iniciar protocolo.

❌ Atrasar trombólise.

---

# ⚠️ ALERTAS

Tempo é cérebro.

Cada minuto sem reperfusão leva à perda de milhões de neurônios.

---

# ❌ ERROS FREQUENTES

❌ Não perguntar Last Known Well.

❌ Não medir glicemia.

❌ Solicitar TC com contraste.

❌ Demorar para chamar protocolo AVC.

---

# 💎 PÉROLAS RESIBOOK

🧠 Glicemia é o primeiro diagnóstico diferencial.

🧠 TC sem contraste é o exame inicial.

🧠 Todo AVC suspeito deve ser tratado como emergência absoluta.

---

# 📚 MODO ESTUDO

Todo paciente com déficit neurológico focal súbito deve ser tratado inicialmente como AVC. A avaliação deve seguir o ABCDE, com glicemia capilar imediata, determinação do horário do último momento visto bem, realização da NIHSS e tomografia de crânio sem contraste para diferenciar AVC isquêmico de hemorrágico. O principal objetivo é identificar rapidamente candidatos à reperfusão.`,
  },
  {
    slug: "avc-isquemico",
    title: "AVC Isquêmico (AVCI)",
    source: `# 🧠 AVC ISQUÊMICO (AVCI)

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

TC sem sangue

↓

Elegível para trombólise?

↓

SIM

↓

Alteplase ou Tenecteplase

↓

Grande vaso?

↓

SIM

↓

Trombectomia

↓

Internação Unidade AVC

---

# 📌 DEFINIÇÃO

Interrupção do fluxo sanguíneo cerebral por oclusão arterial.

Representa cerca de 85% dos AVC.

---

# 🎯 OBJETIVO

Restabelecer rapidamente o fluxo cerebral.

---

# ⚡ PASSO 1

Confirmar ausência de hemorragia na TC.

---

# ⚡ PASSO 2

Determinar tempo de evolução.

Até

4h30

↓

Avaliar trombólise.

Até

24 horas

↓

Avaliar trombectomia.

---

# 💉 REPERFUSÃO

## Trombólise

Até

4h30

quando elegível.

---

## Trombectomia

Até

24 horas

em pacientes selecionados.

---

# ❤️ PRESSÃO ARTERIAL

Paciente candidato à trombólise

↓

PA

<185 x 110

antes.

Após trombólise

↓

<180 x 105

por 24 horas.

---

Paciente NÃO candidato

↓

Permitir até

220 x 120

na fase aguda

(exceto indicações específicas).

---

# 🌡 CONTROLE CLÍNICO

✔ Glicemia

✔ Temperatura

✔ Saturação

✔ Monitorização cardíaca

---

# 💊 ANTIAGREGAÇÃO

Se NÃO trombolisado

↓

AAS

160–300 mg

nas primeiras

24–48 horas.

---

Se trombolisado

↓

Aguardar

24 horas

↓

Nova TC

↓

Iniciar AAS.

---

# ⚠️ ALERTAS

Nunca administrar AAS antes da TC.

Nunca iniciar antiagregação imediatamente após trombólise.

---

# ❌ ERROS FREQUENTES

❌ Não controlar PA.

❌ Dar AAS antes da imagem.

❌ Perder janela terapêutica.

❌ Não encaminhar para trombectomia.

---

# 💎 PÉROLAS RESIBOOK

🧠 Tempo é cérebro.

🧠 Trombólise e trombectomia podem ser complementares.

🧠 Todo paciente deve ser avaliado para reperfusão.

---

# 📚 MODO ESTUDO

O AVC isquêmico é uma emergência tempo-dependente. O tratamento consiste em reperfusão com trombólise intravenosa até 4 horas e 30 minutos quando indicada, e trombectomia mecânica em pacientes selecionados com oclusão de grande vaso, podendo estender-se até 24 horas conforme critérios de imagem.`,
  },
  {
    slug: "trombolise-avc-isquemico",
    title: "Trombólise no AVC Isquêmico",
    source: `# 🧠 TROMBÓLISE NO AVC ISQUÊMICO

⭐⭐⭐⭐⭐
⏱ Leitura: 3 minutos

---

# 🚨 RESUMO RÁPIDO

Déficit neurológico focal incapacitante

↓

Definir **última vez visto bem**

↓

Glicemia + NIHSS

↓

TC de crânio sem contraste

↓

Sem hemorragia

↓

Janela e critérios compatíveis?

↓

Controlar PA para **<185/110 mmHg**

↓

**Alteplase 0,9 mg/kg**
ou
**Tenecteplase 0,25 mg/kg**, conforme protocolo

↓

Manter PA **<180/105 mmHg por 24 horas**

↓

Não administrar antiagregante ou anticoagulante nas primeiras **24 horas**

↓

TC de controle antes de iniciar antitrombótico

---

# 📌 QUANDO CONSIDERAR

✔ Diagnóstico clínico de AVC isquêmico.

✔ Déficit neurológico mensurável e potencialmente incapacitante.

✔ Início dos sintomas ou última vez visto bem dentro da janela de tratamento.

✔ TC sem hemorragia intracraniana.

✔ Ausência de contraindicação relevante.

✔ Idade ≥18 anos.

O benefício é dependente do tempo: o tratamento não deve ser atrasado aguardando melhora espontânea nem exames que não sejam indispensáveis. ([professional.heart.org][1])

---

# ⏰ JANELAS

## Janela convencional

Tratamento iniciado em até:

**4 horas e 30 minutos**

a partir do início dos sintomas ou da última vez em que o paciente foi visto normal.

---

## AVC ao despertar ou início desconhecido

Pode haver indicação em pacientes selecionados por neuroimagem avançada, como:

* incompatibilidade DWI–FLAIR na ressonância;
* tecido cerebral potencialmente salvável em estudo de perfusão.

Não trombolisar automaticamente apenas porque o paciente acordou com sintomas: é necessária seleção conforme protocolo de AVC. ([professional.heart.org][1])

---

# 💊 ALTEPLASE

## Dose total

**0,9 mg/kg IV**

Dose máxima:

**90 mg**

---

## Administração

**10% da dose total em bolus IV durante 1 minuto**

↓

**90% restantes em infusão durante 60 minutos**

---

## Exemplo: paciente de 70 kg

Dose total:

**63 mg**

Bolus:

**6,3 mg**

Infusão:

**56,7 mg em 60 minutos**

A alteplase pode ser usada dentro de 3 horas e, em pacientes selecionados, entre 3 e 4,5 horas. ([professional.heart.org][1])

---

# 💊 TENECTEPLASE

## Dose

**0,25 mg/kg IV em bolus único**

Dose máxima:

**25 mg**

---

## Tabela prática

|    Peso | Dose aproximada |
| ------: | --------------: |
|   50 kg |     **12,5 mg** |
|   60 kg |       **15 mg** |
|   70 kg |     **17,5 mg** |
|   80 kg |       **20 mg** |
|   90 kg |     **22,5 mg** |
| ≥100 kg |       **25 mg** |

Pode ser utilizada conforme protocolo institucional, especialmente em pacientes também candidatos à trombectomia mecânica. Não utilizar o esquema de tenecteplase do IAM no AVC. ([professional.heart.org][1])

---

# ❤️ PRESSÃO ARTERIAL

## Antes da trombólise

PA deve estar:

**<185/110 mmHg**

---

## Após a trombólise

Manter:

**<180/105 mmHg**

durante pelo menos **24 horas**. ([AHA Journals][2])

---

# 💊 REDUÇÃO DA PA ANTES DA TROMBÓLISE

## Labetalol

**10–20 mg IV em 1–2 minutos**

Pode repetir uma vez.

---

## Nicardipina

Iniciar:

**5 mg/h IV**

Aumentar **2,5 mg/h a cada 5–15 minutos**

Máximo:

**15 mg/h**

---

## Clevidipina

Iniciar:

**1–2 mg/h IV**

Dobrar a dose a cada **2–5 minutos** até atingir a meta.

Máximo usual:

**21 mg/h**

---

## Se não for possível manter PA ≤185/110 mmHg

❌ Não administrar trombolítico.

---

# 🧪 EXAMES

## Obrigatório antes da trombólise

✔ Glicemia capilar.

✔ TC de crânio sem contraste.

---

## Não atrasar trombólise aguardando exames quando não houver suspeita de alteração

* hemograma;
* plaquetas;
* TP/INR;
* TTPa;
* função renal;
* troponina;
* radiografia de tórax.

Se houver uso de anticoagulante, coagulopatia conhecida, trombocitopenia ou outra suspeita clínica, aguardar os exames pertinentes. ([professional.heart.org][1])

---

# 🚫 PRINCIPAIS CONTRAINDICAÇÕES

## Hemorragia e sistema nervoso central

❌ Hemorragia intracraniana na TC.

❌ Suspeita de hemorragia subaracnóidea, mesmo com TC inicial normal.

❌ Hemorragia intracraniana prévia, conforme avaliação do protocolo local.

❌ Neoplasia intracraniana intra-axial, MAV ou lesão vascular com alto risco hemorrágico.

❌ Cirurgia intracraniana ou espinal recente.

❌ Trauma craniano grave recente.

---

## Pressão arterial

❌ PA persistentemente >185/110 mmHg apesar do tratamento.

---

## Sangramento

❌ Sangramento interno ativo.

❌ Suspeita de dissecção aguda de aorta.

❌ Endocardite infecciosa.

❌ Plaquetas **<100.000/mm³**.

---

## Anticoagulantes

❌ Varfarina com **INR >1,7**.

❌ Heparina não fracionada recente com TTPa elevado.

❌ Dose terapêutica de heparina de baixo peso molecular nas últimas **24 horas**.

❌ Uso recente de anticoagulante oral direto com efeito anticoagulante presumidamente ativo, salvo exclusão laboratorial validada ou reversão conforme protocolo especializado. A AHA contraindica alteplase após dose terapêutica plena de HBPM nas 24 horas anteriores. ([professional.heart.org][1])

---

## Imagem

❌ Hemorragia intracraniana.

❌ Área extensa de infarto já estabelecido com alto risco de transformação hemorrágica, conforme avaliação da equipe de AVC.

---

# ⚠️ SITUAÇÕES QUE EXIGEM DECISÃO INDIVIDUALIZADA

* AVC leve, porém incapacitante.
* AVC leve não incapacitante.
* Convulsão no início com déficit persistente possivelmente atribuível ao AVC.
* Cirurgia ou trauma importante recente.
* Sangramento gastrointestinal ou geniturinário recente.
* Gestação ou puerpério.
* IAM recente.
* Punção arterial em local não compressível.
* Idade avançada.
* Demência ou incapacidade funcional prévia.

**NIHSS baixo não exclui trombólise quando o déficit é incapacitante**, como afasia, hemianopsia, perda funcional da mão dominante ou incapacidade para deambular. Para déficit leve e não incapacitante, a alteplase não é recomendada rotineiramente. ([professional.heart.org][1])

---

# ⚡ TROMBÓLISE + TROMBECTOMIA

Paciente elegível para trombólise IV e com suspeita de oclusão de grande vaso:

✔ Administrar trombolítico sem atraso.

✔ Acionar simultaneamente a equipe de trombectomia.

✔ Não aguardar resposta clínica ao trombolítico antes de encaminhar para procedimento endovascular.

✔ A trombólise não substitui a trombectomia quando esta estiver indicada. ([professional.heart.org][1])

---

# 🩺 CUIDADOS DURANTE E APÓS A TROMBÓLISE

## Monitorização

* avaliação neurológica frequente;
* PA frequente;
* monitor cardíaco;
* oximetria;
* vigilância de sangramentos;
* unidade de AVC ou terapia intensiva conforme gravidade.

---

## Primeiras 24 horas

❌ Não administrar AAS.

❌ Não administrar clopidogrel.

❌ Não administrar heparina.

❌ Não administrar anticoagulante oral.

❌ Evitar punções arteriais, sondas e procedimentos invasivos desnecessários.

✔ Realizar TC ou RNM de controle após **24 horas** antes de iniciar antitrombótico.

O risco do uso de antitrombóticos nas primeiras 24 horas é incerto; a PA deve permanecer abaixo de 180/105 mmHg. ([professional.heart.org][1])

---

# 🚨 SUSPEITA DE HEMORRAGIA INTRACRANIANA

Suspeitar diante de:

* piora neurológica súbita;
* cefaleia intensa;
* náuseas ou vômitos;
* hipertensão aguda;
* redução do nível de consciência.

## Conduta imediata

1. **Interromper a infusão de alteplase.**
2. Solicitar **TC de crânio urgente**.
3. Colher:

   * hemograma;
   * plaquetas;
   * TP/INR;
   * TTPa;
   * fibrinogênio;
   * tipagem e prova cruzada.
4. Acionar neurologia, neurocirurgia, hematologia e banco de sangue.
5. Considerar reversão conforme protocolo institucional.

---

# 🫁 ANGIOEDEMA OROLINGUAL

Pode ocorrer após alteplase, principalmente em pacientes que utilizam IECA.

## Conduta

* interromper alteplase;
* avaliar via aérea imediatamente;
* suspender IECA;
* administrar tratamento para angioedema conforme gravidade;
* preparar intubação precoce se houver progressão.

A equipe deve estar preparada para tratar hemorragia e angioedema com comprometimento da via aérea. ([professional.heart.org][1])

---

# ❌ ERROS FREQUENTES

❌ Usar o horário em que o paciente foi encontrado em vez da última vez visto bem.

❌ Aguardar troponina ou radiografia de tórax.

❌ Excluir trombólise apenas porque o NIHSS é baixo.

❌ Trombolisar sem medir glicemia.

❌ Não controlar PA antes e depois da medicação.

❌ Administrar AAS logo após a trombólise.

❌ Aguardar resposta à trombólise antes de transferir para trombectomia.

❌ Usar a dose de tenecteplase do IAM no AVC.

---

# 💎 PÉROLAS RESIBOOK

🧠 **Alteplase: 0,9 mg/kg, máximo 90 mg; 10% em bolus e o restante em 60 minutos.**

🧠 **Tenecteplase no AVC: 0,25 mg/kg, máximo 25 mg, em bolus único.**

🧠 **PA antes: <185/110 mmHg.**

🧠 **PA depois: <180/105 mmHg por 24 horas.**

🧠 **Nenhum antiagregante ou anticoagulante antes da imagem de controle de 24 horas.**

🧠 **Trombólise não deve atrasar trombectomia.**

O protocolo preserva os tempos e a lógica presentes no seu resumo do ACLS — identificação rápida, última vez visto bem, imagem urgente, trombólise e avaliação simultânea para terapia endovascular. 

[1]: https://professional.heart.org/en/-/media/PHD-Files-2/Science-News/2/2019/2019-Guidelines-for-the-Early-Management-of-Patients-with-Acute-Ischemic-Stroke-Slide-Set.pdf?sc_lang=en "Slide Set for 2019 Update to the 2018 Guidelines for the Early Management of Acute Ischemic Stroke"
[2]: https://www.ahajournals.org/doi/10.1161/STROKEAHA.121.036143?utm_source=chatgpt.com "Blood Pressure Management for Ischemic Stroke in the ..."`,
  },
  {
    slug: "trombectomia-avc-isquemico",
    title: "Trombectomia Mecânica no AVC Isquêmico",
    source: `# 🧠 TROMBECTOMIA MECÂNICA NO AVC ISQUÊMICO

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

AVC isquêmico

↓

Suspeita de oclusão de grande vaso

↓

Angio-TC / Angio-RM

↓

Elegível?

↓

Acionar centro de trombectomia

↓

Trombólise IV se indicada

↓

NÃO esperar resposta à trombólise

↓

Trombectomia mecânica

---

# 📌 QUANDO CONSIDERAR

Paciente com AVC isquêmico e suspeita de oclusão arterial de grande vaso.

Pensar principalmente em oclusão de:

- Carótida interna intracraniana
- Segmento M1 da cerebral média
- Basilar
- Outros vasos proximais conforme avaliação especializada

---

# 🚨 SINAIS DE SUSPEITA DE GRANDE VASO

- Hemiplegia importante
- Afasia grave
- Negligência
- Desvio conjugado do olhar
- NIHSS elevado
- Alteração importante da consciência
- Síndrome de circulação posterior grave

---

# ⚡ PASSO A PASSO

## 1. Confirmar AVC isquêmico

- TC sem contraste
- Excluir hemorragia

---

## 2. Realizar imagem vascular

- Angio-TC de crânio e pescoço
- Angio-RM quando disponível

A investigação vascular não deve atrasar trombólise IV em paciente elegível.

---

## 3. Avaliar janela

### Até 6 horas

Avaliação por:

- Oclusão de grande vaso
- Gravidade clínica
- ASPECTS
- Independência funcional prévia
- Relação risco-benefício

---

### Entre 6 e 24 horas

Necessária seleção por imagem e critérios clínicos.

Podem ser utilizados:

- Perfusão por TC
- Perfusão por RM
- Difusão/perfusão
- Avaliação de tecido cerebral potencialmente salvável

A elegibilidade não deve ser definida apenas pelo relógio.

---

# 🚑 TRANSFERÊNCIA

Se o hospital não realiza trombectomia:

- Acionar imediatamente centro de referência
- Não aguardar melhora clínica
- Não aguardar resposta à alteplase ou tenecteplase
- Transferir assim que possível

---

# 💉 TROMBÓLISE ASSOCIADA

Paciente elegível para trombólise IV:

- Administrar trombolítico
- Acionar simultaneamente a equipe endovascular
- Não atrasar trombectomia

Trombólise e trombectomia são tratamentos complementares.

---

# 🩻 ASPECTS

Escala tomográfica utilizada para estimar extensão da isquemia precoce na circulação anterior.

- Valor maior: menor área de infarto estabelecido
- Valor menor: maior área de núcleo isquêmico

Não utilizar isoladamente sem considerar clínica, imagem vascular e protocolo local.

---

# ⚠️ ALERTAS

- NIHSS baixo não exclui oclusão de grande vaso.
- AVC de circulação posterior pode ter NIHSS artificialmente baixo.
- TC inicial normal não exclui AVC grave.
- Não atrasar transferência para completar exames desnecessários.
- Trombectomia pode ser benéfica em pacientes selecionados mesmo com área isquêmica extensa, conforme avaliação especializada e protocolos atuais.

---

# ❌ ERROS FREQUENTES

❌ Esperar resposta à trombólise antes de transferir.

❌ Não solicitar imagem vascular.

❌ Excluir trombectomia apenas por idade.

❌ Excluir grande vaso apenas por NIHSS baixo.

❌ Considerar que trombólise substitui trombectomia.

---

# 💎 PÉROLAS RESIBOOK

🧠 Trombólise dissolve coágulo; trombectomia remove mecanicamente.

🧠 Grande vaso exige avaliação endovascular imediata.

🧠 O paciente pode receber trombólise e trombectomia no mesmo evento.

🧠 Tempo é cérebro, mas imagem também define tecido salvável.`,
  },
  {
    slug: "cuidados-pos-trombolise",
    title: "Cuidados Pós-Trombólise",
    source: `# 🧠 CUIDADOS PÓS-TROMBÓLISE

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Trombólise realizada

↓

Unidade de AVC / UTI

↓

PA <180/105 mmHg

↓

Avaliação neurológica frequente

↓

Sem AAS, clopidogrel, heparina ou anticoagulante por 24 h

↓

TC/RM de controle em 24 h

↓

Sem sangramento

↓

Iniciar antitrombótico conforme indicação

---

# ❤️ PRESSÃO ARTERIAL

Manter durante as primeiras 24 horas:

**<180/105 mmHg**

Tratar elevações persistentes conforme protocolo institucional.

---

# 🩺 MONITORIZAÇÃO

Avaliar regularmente:

- NIHSS
- Nível de consciência
- Pupilas
- PA
- FC
- Saturação
- Sinais de sangramento
- Cefaleia
- Náuseas ou vômitos

---

# 🚫 PRIMEIRAS 24 HORAS

Não administrar:

- AAS
- Clopidogrel
- Heparina
- Enoxaparina terapêutica
- Anticoagulante oral

Evitar:

- Punção arterial
- Sonda nasogástrica
- Sonda vesical
- Cateter central
- Injeções intramusculares
- Outros procedimentos invasivos desnecessários

---

# 🩻 IMAGEM DE CONTROLE

Realizar TC ou RM após aproximadamente:

**24 horas**

Antes de iniciar antiagregante ou anticoagulante.

---

# 🚨 PIORA NEUROLÓGICA

Suspeitar de hemorragia se houver:

- Cefaleia súbita
- Vômitos
- Elevação aguda da PA
- Redução da consciência
- Piora do déficit
- Novo déficit neurológico

---

# ⚡ CONDUTA NA SUSPEITA DE HEMORRAGIA

1. Interromper alteplase se ainda estiver em infusão.
2. Solicitar TC urgente.
3. Colher hemograma, plaquetas, TP/INR, TTPa e fibrinogênio.
4. Acionar neurologia, neurocirurgia e hemoterapia.
5. Considerar crioprecipitado e outras medidas de reversão conforme protocolo.

---

# 🫁 ANGIOEDEMA OROLINGUAL

Suspeitar principalmente em uso concomitante de IECA.

Conduta:

- Interromper trombolítico
- Avaliar via aérea imediatamente
- Preparar intubação se progressão
- Tratar conforme protocolo de angioedema

---

# 🍬 GLICEMIA

Evitar:

- Hipoglicemia
- Hiperglicemia persistente

Faixa prática habitual:

**140–180 mg/dL**

---

# 🌡 TEMPERATURA

- Tratar febre
- Investigar infecção
- Evitar hipertermia

---

# 🍽 DEGLUTIÇÃO

Antes de alimentação oral:

- Realizar triagem de disfagia
- Evitar dieta oral até avaliação

---

# ⚠️ ALERTAS

- AAS somente após imagem de controle sem hemorragia.
- Não iniciar anticoagulação precoce de rotina.
- Não reduzir PA agressivamente além da meta.
- Alteração neurológica após trombólise é hemorragia até prova em contrário.

---

# 💎 PÉROLAS RESIBOOK

🧠 Pós-trombólise: PA <180/105 por 24 h.

🧠 Sem antitrombóticos por 24 h.

🧠 Nova TC antes de liberar AAS.

🧠 Piora neurológica exige TC imediata.`,
  },
  {
    slug: "medicamentos-avc-isquemico",
    title: "Medicamentos no AVC Isquêmico",
    source: `# 💊 MEDICAMENTOS NO AVC ISQUÊMICO

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 💉 ALTEPLASE

Dose:

**0,9 mg/kg IV**

Máximo:

**90 mg**

Administração:

- 10% em bolus por 1 minuto
- 90% em infusão por 60 minutos

---

# 💉 TENECTEPLASE

Dose no AVC:

**0,25 mg/kg IV em bolus único**

Máximo:

**25 mg**

⚠️ Não utilizar a dose de tenecteplase do IAM.

---

# 💊 AAS

Paciente não trombolisado:

**160–300 mg**

Iniciar geralmente dentro de 24–48 horas, após excluir hemorragia.

Paciente trombolisado:

- Aguardar 24 horas
- Realizar imagem de controle
- Iniciar se não houver sangramento

---

# 💊 DUPLA ANTIAGREGAÇÃO

Considerar em AVC menor não cardioembólico ou AIT de alto risco, em pacientes selecionados:

- AAS
- Clopidogrel

Uso geralmente por período curto, conforme protocolo de neurologia.

Não utilizar rotineiramente após AVC moderado ou grave devido ao risco hemorrágico.

---

# 💊 LABETALOL

Para controle de PA:

**10–20 mg IV em 1–2 minutos**

Pode repetir conforme resposta.

---

# 💊 NICARDIPINA

Iniciar:

**5 mg/h IV**

Aumentar:

**2,5 mg/h a cada 5–15 minutos**

Máximo:

**15 mg/h**

---

# 💊 CLEVIDIPINA

Iniciar:

**1–2 mg/h IV**

Dobrar a cada 2–5 minutos conforme resposta.

---

# 💊 ESTATINA

Considerar estatina de alta intensidade após estabilização, especialmente em doença aterosclerótica.

Exemplo:

**Atorvastatina 40–80 mg/dia**

---

# 🚫 NÃO UTILIZAR ROTINEIRAMENTE

- Heparina plena na fase hiperaguda
- Anticoagulação imediata para prevenir progressão
- Corticoide para edema cerebral isquêmico
- Anticonvulsivante profilático sem crise
- Vasodilatadores que causem queda abrupta da PA

---

# ⚠️ ALERTAS

- Não dar AAS antes de excluir sangramento.
- Não iniciar antitrombótico antes de 24 h após trombólise.
- Anticoagulação na fibrilação atrial deve ser iniciada posteriormente, conforme tamanho do infarto e risco hemorrágico.
- Não tratar PA elevada automaticamente em paciente que não receberá reperfusão.

---

# 💎 PÉROLAS RESIBOOK

🧠 AVC não trombolisado: AAS precoce após excluir hemorragia.

🧠 AVC trombolisado: AAS somente após 24 h e imagem de controle.

🧠 Tenecteplase no AVC: máximo 25 mg.

🧠 Heparina plena não é tratamento agudo de rotina do AVC isquêmico.`,
  },
  {
    slug: "avc-hemorragico",
    title: "AVC Hemorrágico — Hemorragia Intraparenquimatosa",
    source: `# 🧠 AVC HEMORRÁGICO — HEMORRAGIA INTRAPARENQUIMATOSA

⭐⭐⭐⭐⭐

⏱ Leitura: 3 minutos

---

# 🚨 RESUMO RÁPIDO

TC com hemorragia

↓

Suspender antitrombóticos

↓

Controlar PA

↓

Reverter anticoagulação

↓

Avaliar neurocirurgia

↓

Controlar PIC

↓

UTI / Unidade neurocrítica

---

# 📌 OBJETIVOS

- Evitar expansão do hematoma
- Corrigir coagulopatia
- Controlar pressão intracraniana
- Prevenir herniação
- Identificar indicação cirúrgica

---

# ⚡ PASSO A PASSO

## 1. ABCDE

- Proteger via aérea
- Oxigênio se hipoxemia
- Monitor
- Acesso venoso
- Avaliação neurológica seriada

Considerar intubação se:

- Glasgow baixo
- Perda de reflexos de proteção
- Hipoventilação
- Herniação iminente

---

## 2. Suspender antitrombóticos

Interromper:

- Varfarina
- DOAC
- Heparina
- Enoxaparina
- Antiagregantes

---

## 3. Controlar PA

Em pacientes com PAS entre aproximadamente 150 e 220 mmHg e sem contraindicação, pode-se considerar redução cuidadosa para alvo próximo de:

**140 mmHg**

Manter geralmente na faixa de:

**130–150 mmHg**

Evitar queda excessiva para menos de 130 mmHg.

A meta deve ser individualizada em hemorragias graves, hipertensão intracraniana ou necessidade cirúrgica.

---

# 💊 CONTROLE DA PA

Preferir fármacos tituláveis:

- Nicardipina
- Clevidipina
- Labetalol

Evitar hipotensão e grandes oscilações.

---

# 💉 REVERSÃO DA VARFARINA

Preferir:

- Complexo protrombínico de 4 fatores
- Vitamina K IV

Objetivo: reversão rápida do INR.

---

# 💉 REVERSÃO DA HEPARINA

Utilizar:

**Protamina**

Dose conforme quantidade e tempo desde a última heparina.

---

# 💉 REVERSÃO DA ENOXAPARINA

Protamina pode reverter parcialmente o efeito.

Dose conforme intervalo desde a última administração.

---

# 💉 REVERSÃO DO DABIGATRANA

Antídoto:

**Idarucizumabe 5 g IV**

---

# 💉 REVERSÃO DE INIBIDORES DO FATOR Xa

Para apixabana ou rivaroxabana:

- Andexanet alfa quando disponível
- Complexo protrombínico conforme protocolo local

---

# 🧠 PRESSÃO INTRACRANIANA

Suspeitar diante de:

- Rebaixamento progressivo
- Anisocoria
- Vômitos
- Bradicardia + hipertensão
- Alteração respiratória
- Herniação

---

# 💊 TERAPIA HIPEROSMOLAR

Pode ser utilizada em hipertensão intracraniana ou herniação.

Opções:

- Salina hipertônica
- Manitol

Utilizar conforme neurointensivismo e monitorização clínica/laboratorial.

Não usar profilaticamente em todos os pacientes.

---

# 🏥 NEUROCIRURGIA

Avaliação urgente em:

- Hemorragia cerebelar
- Compressão do tronco
- Hidrocefalia
- Deterioração neurológica
- Hematoma superficial selecionado
- Necessidade de derivação ventricular externa

Hemorragia cerebelar com deterioração, compressão de tronco ou hidrocefalia frequentemente exige evacuação cirúrgica imediata.

---

# ⚡ CONVULSÕES

- Tratar crises clínicas
- Considerar EEG em rebaixamento inexplicado
- Não utilizar anticonvulsivante profilático de rotina sem crise

---

# 🚫 TRANSFUSÃO DE PLAQUETAS

Não realizar rotineiramente apenas por uso prévio de AAS, salvo situação cirúrgica específica ou orientação especializada.

---

# ⚠️ ALERTAS

- Não trombolisar.
- Não dar AAS.
- Corrigir coagulopatia imediatamente.
- Evitar queda brusca da PA.
- Hemorragia cerebelar pode deteriorar rapidamente.
- Hidrocefalia exige avaliação para derivação ventricular.

---

# ❌ ERROS FREQUENTES

❌ Demorar para reverter anticoagulação.

❌ Reduzir PAS excessivamente.

❌ Usar manitol de rotina sem hipertensão intracraniana.

❌ Fazer anticonvulsivante profilático para todos.

❌ Não chamar neurocirurgia precocemente.

---

# 💎 PÉROLAS RESIBOOK

🧠 AVC hemorrágico: primeiro interromper expansão, depois tratar complicações.

🧠 Anticoagulante deve ser revertido imediatamente.

🧠 PAS muito alta piora expansão; PAS muito baixa piora perfusão cerebral.

🧠 Hemorragia cerebelar + deterioração = neurocirurgia urgente.`,
  },
  {
    slug: "fluxograma-final-avc",
    title: "Fluxograma Final do AVC",
    source: `# 🧠 FLUXOGRAMA FINAL DO AVC

⭐⭐⭐⭐⭐

⏱ Leitura: 45 segundos

---

# 🚨 ALGORITMO

Déficit neurológico focal súbito

↓

ABCDE + Glicemia

↓

Determinar última vez visto bem

↓

NIHSS

↓

TC de crânio sem contraste

↓

## TEM SANGUE?

### SIM

➡️ AVC hemorrágico

- Suspender antitrombóticos
- Controlar PA
- Reverter anticoagulação
- Avaliar neurocirurgia
- UTI

---

### NÃO

➡️ AVC isquêmico

↓

## DÉFICIT INCAPACITANTE E JANELA COMPATÍVEL?

### SIM

- PA <185/110
- Alteplase ou tenecteplase
- Meta pós-trombólise <180/105

↓

## SUSPEITA DE GRANDE VASO?

### SIM

- Angio-TC
- Acionar trombectomia
- Não esperar resposta à trombólise

---

## NÃO TROMBOLISADO

- AAS após excluir hemorragia
- Investigar etiologia
- Unidade de AVC

---

## TROMBOLISADO

- Sem antitrombóticos por 24 h
- TC/RM de controle
- Iniciar AAS somente se ausência de sangramento

---

# ⏱ METAS

- Avaliação inicial: até 10 min
- TC iniciada: até 20 min
- Interpretação de imagem: até 45 min
- Porta-agulha: até 60 min
- Transferência para trombectomia: sem atraso

---

# 🧠 NUNCA ESQUECER

- Glicemia antes de tudo
- Última vez visto bem
- TC sem contraste
- NIHSS
- Trombólise não exclui trombectomia
- Sem AAS por 24 h após trombólise
- Piora neurológica = repetir TC imediatamente`,
  },
  {
    slug: "via-aerea",
    title: "Via Aérea no ACLS",
    source: `# 🫀 VIA AÉREA NO ACLS

⭐⭐⭐⭐⭐

⏱ Leitura: 2 minutos

---

# 🚨 RESUMO RÁPIDO

Oxigenar

↓

Ventilar

↓

Bolsa-válvula-máscara

↓

Via aérea avançada se indicada

↓

Capnografia

↓

Confirmar tubo

↓

Evitar hiperventilação

---

# 📌 OBJETIVO

Garantir oxigenação e ventilação adequadas sem interromper a RCP.

---

# 🅰️ PASSO 1 — VIA AÉREA BÁSICA

Abrir via aérea

• Inclinação da cabeça + elevação do mento

Trauma

↓

Jaw Thrust

---

# 🫁 PASSO 2 — BOLSA-VÁLVULA-MÁSCARA

Primeira escolha na maioria das PCR.

Objetivos

✔ Boa vedação

✔ Elevação do tórax

✔ Oxigenação

---

Sem via aérea avançada

30 compressões

↓

2 ventilações

---

# 🩺 PASSO 3 — VIA AÉREA AVANÇADA

Indicações

✔ Ventilação inadequada

✔ PCR prolongada

✔ Proteção da via aérea

✔ Equipe treinada

Opções

• Tubo orotraqueal

• Máscara laríngea

• I-Gel

• Outros dispositivos supraglóticos

---

# 🌬 APÓS VIA AÉREA AVANÇADA

Compressões

Contínuas

+

Ventilação

1 ventilação

a cada

6 segundos

≈10/min

Nunca interromper compressões.

---

# 📈 CAPNOGRAFIA

Sempre utilizar quando disponível.

Funções

✔ Confirmar tubo

✔ Avaliar ventilação

✔ Monitorar RCP

✔ Detectar RCE

---

## ETCO₂

<10 mmHg

↓

Melhorar RCP

---

Aumento súbito >25–40 mmHg

↓

Pensar em RCE

---

# ✅ CONFIRMAÇÃO DO TOT

✔ Capnografia quantitativa (Padrão-ouro)

✔ Expansão torácica bilateral

✔ Ausculta pulmonar

✔ Ausência de ruídos no epigástrio

✔ Condensação no tubo (auxiliar)

---

# ⚠️ NÃO CONFIRMA

❌ Apenas ausculta

❌ Apenas condensação

Sempre utilizar capnografia quando disponível.

---

# ❌ ERROS FREQUENTES

❌ Hiperventilar

❌ Interromper compressões para intubar

❌ Intubar demoradamente

❌ Não confirmar tubo

❌ Esquecer capnografia

---

# 💎 PÉROLAS RESIBOOK

🧠 A melhor via aérea é aquela que não interrompe a RCP.

🧠 Intubação não é prioridade sobre compressões.

🧠 Capnografia é obrigatória sempre que disponível.

---

# 📚 MODO ESTUDO

A via aérea deve ser manejada progressivamente. A bolsa-válvula-máscara continua sendo excelente opção inicial. A via aérea avançada deve ser realizada apenas por equipe treinada e sem interromper compressões. Após sua instalação, as compressões tornam-se contínuas e a ventilação passa para 1 insuflação a cada 6 segundos. A capnografia quantitativa é o método de escolha para confirmação do tubo e monitorização da qualidade da RCP.`,
  },
];

export function getAclsProtocol(slug: string) {
  return ACLS_PROTOCOLS.find((protocol) => protocol.slug === slug);
}
