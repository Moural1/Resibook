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
];

export function getAclsProtocol(slug: string) {
  return ACLS_PROTOCOLS.find((protocol) => protocol.slug === slug);
}
