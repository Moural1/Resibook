# ResiBook — Ajuste de busca v1

Esse pacote melhora a busca geral do site e das páginas internas.

## O que muda

- Resultados com título/nome/código igual ao que você digitou aparecem primeiro.
- Campos importantes pesam mais: título, nome do paciente, código CID, nome da conduta, nome do modelo.
- Texto grande de conteúdo ainda é pesquisável, mas pesa menos, para não jogar coisa aleatória na frente.
- Busca com várias palavras fica mais precisa: por exemplo, `dor cabeça` tenta exigir as duas palavras relevantes.
- Ignora acentos, pontuação e palavras fracas como `de`, `da`, `do`, `com`, `para`.
- Afeta a busca global do topo e as buscas internas de pacientes, prescrições, exames/evolução, tópicos, flashcards, condutas, CIDs e modelos.

## Como aplicar

Coloque este ZIP na raiz do projeto, onde ficam `package.json` e `src`.

Depois rode no terminal:

```bash
unzip resibook-ajustes-busca-v1.zip
cp -r resibook-ajustes-busca-v1/SUBSTITUIR-NO-PROJETO/* .
npx tsc --noEmit
npm run dev
```

Se o `npx tsc --noEmit` passar sem erro, pode testar no navegador.

## Arquivos substituídos

- `src/lib/search.ts`
- `src/components/topbar.tsx`
- `src/components/cids-browser.tsx`
- `src/components/flashcards-browser.tsx`
- `src/components/prescription-templates-browser.tsx`
- `src/components/prescription-templates-live.tsx`
- `src/app/api/global-search/route.ts`
- `src/app/exames-evolucao/page.tsx`
- `src/app/topicos/page.tsx`
- `src/app/flashcards-dificeis/page.tsx`
- `src/app/flashcards/page.tsx`
- `src/app/cids/page.tsx`
- `src/app/pacientes/page.tsx`
- `src/app/prescricao/page.tsx`
- `src/app/modelos-prescricao/page.tsx`
