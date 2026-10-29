// Ligações entre temas (topicos_medicos), flashcards e modelos de prescrição.
//
// Cada base veio de uma importação diferente e não há chave em comum, então a
// ligação é por texto: título do tema, tags e palavras distintivas. Área e
// palavras genéricas ("doença", "aguda", "pediatria") não bastam sozinhas,
// para não sugerir cards só porque são da mesma especialidade.

export type LinkTopic = {
  id: number;
  area?: string | null;
  titulo: string;
  tags?: string | null;
};

export type LinkCard = {
  id: string | number;
  area?: string | null;
  materia?: string | null;
  tipo?: string | null;
  frente?: string | null;
  verso?: string | null;
};

export type LinkTemplate = {
  id: number;
  titulo: string;
  categoria?: string | null;
};

const STOPWORDS = new Set([
  "a", "o", "as", "os", "ao", "aos", "e", "ou", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
  "com", "sem", "para", "por", "pelo", "pela", "um", "uma", "x", "vs",
]);

// Palavras que aparecem em muitos temas e não identificam nenhum.
const GENERIC = new Set([
  "doenca", "sindrome", "aguda", "agudo", "cronica", "cronico", "tipo", "manejo", "conduta", "tratamento",
  "diagnostico", "abordagem", "avaliacao", "geral", "gerais", "outra", "principal", "clinica", "clinico",
  "medica", "pediatria", "cirurgia", "preventiva", "ginecologia", "obstetricia", "gastro", "neonatologia",
  "complicacao", "complicacoe", "paciente", "adulto", "crianca", "infancia", "febre", "dor", "trauma",
  "urgencia", "emergencia", "exame", "neonatal",
]);

export function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function singular(word: string) {
  return word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word;
}

function words(value?: string | null) {
  return normalizeText(value).split(" ").filter(Boolean).map(singular);
}

function distinctive(value?: string | null) {
  return Array.from(new Set(words(value).filter((word) => word.length >= 3 && !STOPWORDS.has(word) && !GENERIC.has(word))));
}

/** Frase contida como palavras inteiras ("ira" não casa com "mira"). */
function containsPhrase(haystack: string, phrase: string) {
  if (!phrase) return false;
  return ` ${haystack} `.includes(` ${phrase} `);
}

const phraseCache = new WeakMap<LinkTopic, ReturnType<typeof buildTopicPhrases>>();
// Texto do card já normalizado e com espaços nas pontas, para busca por
// palavra inteira sem recriar strings a cada comparação.
const cardTextCache = new WeakMap<LinkCard, { front: string; back: string; frontWords: Set<string> }>();

function topicPhrases(topic: LinkTopic) {
  let cached = phraseCache.get(topic);
  if (!cached) {
    cached = buildTopicPhrases(topic);
    phraseCache.set(topic, cached);
  }
  return cached;
}

function buildTopicPhrases(topic: LinkTopic) {
  // "Adrenal: Insuficiência Adrenal" → também "insuficiencia adrenal".
  const parts = topic.titulo.split(/[:/,(]| e | - /i).map((part) => words(part).join(" ")).filter((part) => part.length >= 3);
  const tags = (topic.tags || "")
    .split(/[,;\n]+/)
    .map((tag) => words(tag).join(" "))
    .filter((tag) => tag.length >= 2 && !GENERIC.has(tag));
  return { title: words(topic.titulo).join(" "), parts, tags, titleTokens: distinctive(topic.titulo) };
}

function hasPhrase(padded: string, phrase: string) {
  return Boolean(phrase) && padded.includes(` ${phrase} `);
}

function cardText(card: LinkCard) {
  let cached = cardTextCache.get(card);
  if (!cached) {
    const frontList = words(card.frente);
    cached = { front: ` ${frontList.join(" ")} `, back: ` ${words(card.verso).join(" ")} `, frontWords: new Set(frontList) };
    cardTextCache.set(card, cached);
  }
  return cached;
}

// Quantos cards citam cada tag na pergunta, por lista de cards.
const frequencyCache = new WeakMap<LinkCard[], Map<string, number>>();
const BROAD_TAG_CARDS = 8;

function cardsCiting(tag: string, cards: LinkCard[]) {
  let cache = frequencyCache.get(cards);
  if (!cache) {
    cache = new Map();
    frequencyCache.set(cards, cache);
  }
  const cached = cache.get(tag);
  if (cached !== undefined) return cached;
  const count = cards.filter((card) => hasPhrase(cardText(card).front, tag)).length;
  cache.set(tag, count);
  return count;
}

/** Pontua um card para um tema; 0 quando não há ligação de verdade.
    Com a lista completa de cards, tags de uma palavra citadas por poucos cards
    ("pneumotorax", "acalasia") contam como específicas. */
export function scoreCardForTopic(topic: LinkTopic, card: LinkCard, corpus?: LinkCard[]) {
  const { title, parts, tags, titleTokens } = topicPhrases(topic);
  const { front, back, frontWords } = cardText(card);
  let score = 0;
  let anchored = false;

  if (hasPhrase(front, title)) {
    score += 14;
    anchored = true;
  } else if (hasPhrase(back, title)) {
    score += 6;
    anchored = true;
  }

  for (const part of parts) {
    if (part === title || GENERIC.has(part)) continue;
    if (hasPhrase(front, part)) {
      score += 8;
      anchored = true;
    } else if (hasPhrase(back, part)) score += 2;
  }

  // Tag de uma palavra só ("choque", "hiv", "anemia") é ampla demais para
  // ligar sozinha; duas tags diferentes na pergunta ligam.
  let singleTagHits = 0;
  for (const tag of tags) {
    const specific =
      tag.includes(" ") ||
      titleTokens.includes(tag) ||
      (corpus !== undefined && tag.length >= 5 && cardsCiting(tag, corpus) <= BROAD_TAG_CARDS);
    if (hasPhrase(front, tag)) {
      score += specific ? 6 : 3;
      if (specific) anchored = true;
      else singleTagHits += 1;
    } else if (hasPhrase(back, tag)) score += 1;
  }
  if (singleTagHits >= 2) anchored = true;

  const hits = titleTokens.filter((token) => frontWords.has(token)).length;
  const needed = titleTokens.length >= 2 ? Math.max(2, Math.ceil(titleTokens.length / 2)) : 1;
  if (titleTokens.length && hits >= needed) {
    score += 4 * hits;
    anchored = true;
  }

  if (!anchored) return 0;
  if (topic.area && card.area && normalizeText(topic.area).split(" ")[0] === normalizeText(card.area).split(" ")[0]) score += 1;
  return score;
}

export function relatedCardsForTopic<T extends LinkCard>(topic: LinkTopic, cards: T[], limit = 6) {
  return cards
    .map((card) => ({ card, score: scoreCardForTopic(topic, card, cards) }))
    .filter((entry) => entry.score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.card);
}

/** Tema mais provável de um flashcard (para "ver tema" a partir do card). */
export function topicForCard<T extends LinkTopic>(card: LinkCard, topics: T[], corpus?: LinkCard[]) {
  let best: { topic: T; score: number } | null = null;
  for (const topic of topics) {
    const score = scoreCardForTopic(topic, card, corpus);
    if (score >= 8 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}

/** Modelos de prescrição cujo título corresponde ao tema. */
export function templatesForTopic<T extends LinkTemplate>(topic: LinkTopic, templates: T[], limit = 3) {
  const { title, parts, tags } = topicPhrases(topic);
  const phrases = [title, ...parts, ...tags.filter((tag) => tag.length >= 4)];
  return templates
    .map((template) => {
      const name = words(template.titulo).join(" ");
      let score = 0;
      for (const phrase of phrases) {
        if (containsPhrase(name, phrase) || (name.length >= 4 && containsPhrase(phrase, name))) score += phrase === title ? 10 : 5;
      }
      return { template, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.template);
}
