import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const editorialFolder = process.argv[2];

if (!editorialFolder) {
  throw new Error("Informe a pasta editorial dos protocolos ACLS.");
}

const titleToSlug = new Map([
  ["5hs e 5ts", "5hs-e-5ts"],
  ["avaliacao inicial sbv", "avaliacao-inicial-sbv"],
  ["avaliacao primaria abcde", "avaliacao-primaria-abcde"],
  ["avaliacao secundaria sample", "avaliacao-secundaria-sample"],
  ["cadeia de sobrevivencia", "cadeia-de-sobrevivencia"],
  ["rcp de alta qualidade", "rcp-de-alta-qualidade"],
  ["pcr ritmo chocavel fv tv sem pulso", "pcr-ritmo-chocavel"],
  ["pcr ritmo nao chocavel aesp assistolia", "pcr-ritmo-nao-chocavel"],
  ["bradicardia sintomatica", "bradicardia"],
  ["taquicardia com pulso", "taquicardia"],
  ["drogas do acls", "drogas-acls"],
  ["ritmos cardiacos reconhecimento rapido", "ritmos-cardiacos"],
  ["cardioversao x desfibrilacao", "cardioversao-vs-desfibrilacao"],
]);

function normalizeTitle(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeTemplateLiteral(value) {
  return value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(repositoryRoot, "src", "lib", "acls-protocols.ts");
let dataSource = fs.readFileSync(dataPath, "utf8");
const imported = [];

for (const entry of fs.readdirSync(editorialFolder, { withFileTypes: true })) {
  if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".txt") continue;

  const source = fs
    .readFileSync(path.join(editorialFolder, entry.name), "utf8")
    .replace(/\r\n/g, "\n")
    .trim();
  const firstHeading = source.split("\n").find((line) => line.startsWith("# "));
  const normalizedTitle = normalizeTitle(firstHeading?.slice(2) || "");
  const slug = titleToSlug.get(normalizedTitle);

  if (!slug) {
    throw new Error(`Protocolo não reconhecido: ${entry.name}`);
  }

  const pattern = new RegExp(
    '(slug: "' + slug + '",[\\s\\S]*?source: `)[\\s\\S]*?(`,\\n  },)'
  );

  if (!pattern.test(dataSource)) {
    throw new Error(`Slug não encontrado na base ACLS: ${slug}`);
  }

  dataSource = dataSource.replace(
    pattern,
    `$1${escapeTemplateLiteral(source)}$2`
  );
  imported.push(slug);
}

fs.writeFileSync(dataPath, dataSource, "utf8");
console.log(`Protocolos importados: ${imported.join(", ")}`);
