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
];

export function getAclsProtocol(slug: string) {
  return ACLS_PROTOCOLS.find((protocol) => protocol.slug === slug);
}
