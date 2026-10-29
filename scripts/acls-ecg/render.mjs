/* Gera os traçados de ECG do eBook ACLS (public/acls-ebook/source/images).
   Os traçados são sintéticos, desenhados por scripts/acls-ecg/tracados.html,
   sem imagens de terceiros. Requer Playwright com Chromium (não é dependência
   do app): npx -p playwright node scripts/acls-ecg/render.mjs */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const here = new URL(".", import.meta.url);
const out = fileURLToPath(new URL("../../public/acls-ebook/source/images/", import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 700, height: 900 } });
await page.goto(new URL("tracados.html", here).href);
for (const strip of await page.locator("svg").all()) {
  const id = await strip.getAttribute("id");
  await strip.screenshot({ path: `${out}${id}.png` });
  console.log(id);
}
await browser.close();
