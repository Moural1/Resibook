/* Gera src/app/dark-theme.css a partir da paleta padrão do Tailwind.
   Uso: node scripts/generate-dark-theme.mjs

   Estratégia: no tema escuro, cada escala de cor é espelhada (50↔950,
   100↔900, ...), então fundos claros viram escuros e textos escuros viram
   claros sem tocar em nenhuma tela. Preenchimentos sólidos (bg-*-500 a 950)
   mantêm a cor original, para botões com texto branco continuarem legíveis.
   A sidebar já é escura e mantém a paleta original. */
import { readFileSync, writeFileSync } from "node:fs";

const theme = readFileSync(new URL("../node_modules/tailwindcss/theme.css", import.meta.url), "utf8");
const palette = new Map();
for (const match of theme.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) {
  const [, family, shade, value] = match;
  if (!palette.has(family)) palette.set(family, new Map());
  palette.get(family).set(shade, value.trim());
}

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const mirror = (shade) => SHADES[SHADES.length - 1 - SHADES.indexOf(shade)];
const SCOPE = 'html[data-theme="dark"] body:not([data-resibook-surface="public"])';

const SURFACE = "#111c2e";
/* Fundos neutros bem claros (50/100) viram tons próximos da superfície, não
   quase pretos: painéis internos ficam sutis em vez de buracos escuros. */
const NEUTRAL_SOFT = { "50": "#0e1829", "100": "#0b1422" };
const SOFT_NEUTRALS = Object.fromEntries(["slate", "gray", "zinc", "neutral", "stone"].map((name) => [name, NEUTRAL_SOFT]));
const PAGE = "#0a1322";

const mirrored = [];
const original = [];
const fills = [];
for (const [family, shades] of palette) {
  for (const shade of SHADES) {
    if (!shades.has(shade)) continue;
    mirrored.push(`  --color-${family}-${shade}: ${SOFT_NEUTRALS[family]?.[shade] ?? shades.get(mirror(shade))};`);
    original.push(`  --color-${family}-${shade}: ${shades.get(shade)};`);
    if (Number(shade) >= 500) {
      const value = shades.get(shade);
      fills.push(
        `${SCOPE} .bg-${family}-${shade}, ${SCOPE} .hover\\:bg-${family}-${shade}:hover { background-color: ${value}; }`,
        `${SCOPE} .bg-${family}-${shade}.border-${family}-${shade} { border-color: ${value}; }`
      );
    }
  }
}

const cyan = palette.get("cyan");
const css = `/* GERADO por scripts/generate-dark-theme.mjs. Não editar à mão. */

${SCOPE} {
  color-scheme: dark;
  --color-white: ${SURFACE};
  --color-black: #f8fafc;
  --rb-accent: ${cyan.get("800")};
  --rb-accent-strong: ${cyan.get("700")};
${mirrored.join("\n")}
  background: ${PAGE};
  color: ${palette.get("slate").get("200")};
}

/* A sidebar já é escura: mantém a paleta original. */
${SCOPE} .app-sidebar-panel {
  --color-white: #fff;
  --color-black: #000;
${original.join("\n")}
}

/* Preenchimentos sólidos mantêm a cor original (botões, selos, alertas). */
${fills.join("\n")}

/* Texto branco continua branco. */
${SCOPE} :is(.text-white, .hover\\:text-white:hover, .group:hover .group-hover\\:text-white) { color: #fff; }
`;

writeFileSync(new URL("../src/app/dark-theme.css", import.meta.url), css);
console.log(`dark-theme.css: ${mirrored.length} cores espelhadas, ${fills.length} preenchimentos`);
