# ResiBook — Condutas V3

Este pacote foi feito em cima do ZIP atual que você mandou (`resibook-atual.zip`).

## O que muda

- Cria a rota nova `/condutas`.
- Mantém `/flashcards-dificeis` como redirecionamento para `/condutas`, para não quebrar link antigo.
- Troca o item da lateral para apontar direto para `/condutas`.
- Troca o ícone de Condutas para `ClipboardCheck`, diferente do ícone de Tópicos.
- Atualiza o dashboard para abrir `/condutas`.
- Atualiza a busca global para incluir Condutas e enviar resultados marcados para `/condutas`.
- Melhora o layout da página de Condutas:
  - itens fechados por padrão;
  - abre uma conduta por vez;
  - mostra visão rápida;
  - organiza o conteúdo em blocos clínicos;
  - divide textos longos em listas quando possível;
  - permite copiar a conduta completa;
  - permite copiar seções específicas;
  - mantém a lógica de vir dos flashcards marcados como difíceis.
- Mantém a limpeza do botão de copiar e adiciona opção de texto personalizado no botão.

## Como aplicar

Coloque `resibook-condutas-v3.zip` na raiz do projeto, no mesmo lugar onde ficam `package.json`, `src` e `public`.

Depois rode:

```bash
unzip -o resibook-condutas-v3.zip
cp -r resibook-condutas-v3/SUBSTITUIR-NO-PROJETO/* .
npx tsc --noEmit
npm run dev
```

## Depois de testar

Se estiver tudo certo:

```bash
git status
git add .
git commit -m "Cria rota de condutas medicas"
git push
```

## Arquivos alterados

```txt
src/app/condutas/layout.tsx
src/app/condutas/page.tsx
src/app/flashcards-dificeis/page.tsx
src/app/dashboard/page.tsx
src/components/app-shell.tsx
src/components/copy-button.tsx
src/components/topbar.tsx
```
