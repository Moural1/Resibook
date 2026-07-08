import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_ECG_MODEL = "gpt-4.1-mini";
const FALLBACK_ECG_MODEL = "gpt-4o-mini";
const MAX_IMAGE_CHARS = 6_500_000;

type EcgManualData = Record<string, unknown>;

function readOutputText(payload: unknown) {
  const record = payload as { output_text?: unknown; output?: unknown };
  if (typeof record.output_text === "string") return record.output_text;
  if (!Array.isArray(record.output)) return "";
  return record.output
    .flatMap((item) => {
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      const item = content as { text?: unknown };
      return typeof item.text === "string" ? item.text : "";
    })
    .filter(Boolean)
    .join("\n");
}

function parseJsonObject(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function validImageDataUrl(value: unknown) {
  if (typeof value !== "string") return false;
  if (value.length > MAX_IMAGE_CHARS) return false;
  return /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

function getOpenAiDiagnostic(payload: unknown) {
  const error = (payload as { error?: unknown } | null)?.error;
  const record = error && typeof error === "object"
    ? error as Record<string, unknown>
    : {};
  return {
    message: typeof record.message === "string" ? record.message : "",
    code: typeof record.code === "string" ? record.code : "",
    type: typeof record.type === "string" ? record.type : "",
    param: typeof record.param === "string" ? record.param : "",
  };
}

function safeOpenAiMessage(status: number, payload: unknown) {
  const diagnostic = getOpenAiDiagnostic(payload);
  const text = `${diagnostic.message} ${diagnostic.code} ${diagnostic.type} ${diagnostic.param}`.toLowerCase();
  if (status === 401) return "Chave da OpenAI inválida ou sem permissão. Confira OPENAI_API_KEY na Vercel.";
  if (status === 429) return "Limite/crédito da OpenAI indisponível agora. Confira billing/usage da conta OpenAI.";
  if (status === 413 || text.includes("too large") || text.includes("image")) {
    return "A imagem do ECG ficou grande demais para análise. Tente uma foto mais leve ou recortada.";
  }
  if (text.includes("model") || status === 404 || status === 400) {
    return "Modelo de IA indisponível para sua chave. Remova RESIBOOK_ECG_AI_MODEL ou use gpt-4.1-mini.";
  }
  return "Não foi possível analisar a imagem do ECG agora.";
}

async function callOpenAiVision(input: {
  apiKey: string;
  model: string;
  prompt: string;
  imageDataUrl: string;
}) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: input.prompt },
            { type: "input_image", image_url: input.imageDataUrl },
          ],
        },
      ],
    }),
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sessão não autenticada." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "ecg_ai_not_configured",
        message: "Análise visual por IA ainda não está configurada no servidor.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    imageDataUrl?: unknown;
    manualData?: EcgManualData;
  } | null;
  if (!validImageDataUrl(body?.imageDataUrl)) {
    return NextResponse.json(
      { error: "invalid_ecg_image", message: "Envie uma imagem PNG, JPG ou WEBP válida do ECG." },
      { status: 400 }
    );
  }

  const manualData = body?.manualData && typeof body.manualData === "object"
    ? body.manualData
    : {};
  const prompt = [
    "Você é um assistente clínico para leitura estruturada de ECG.",
    "Analise a imagem apenas como apoio visual e cruze com os dados manuais enviados.",
    "Não dê laudo definitivo, não descarte IAM/arritmia e não invente medidas se a imagem não permitir.",
    "Priorize qualidade da imagem, coerência com dados preenchidos, red flags aparentes e campos que precisam revisão humana.",
    "Responda somente JSON válido com este formato:",
    "{",
    '  "quality": "boa|regular|ruim",',
    '  "visualSummary": "resumo curto do que é visível",',
    '  "possibleFindings": ["achados visuais possíveis, com linguagem cautelosa"],',
    '  "manualCrossCheck": ["concordâncias ou conflitos entre imagem e campos manuais"],',
    '  "redFlags": ["red flags visuais ou manuais que pedem revisão imediata"],',
    '  "limitations": ["limitações da imagem/análise"],',
    '  "suggestedReview": ["o que o médico deve checar no traçado original"]',
    "}",
    "",
    `Dados manuais preenchidos: ${JSON.stringify(manualData).slice(0, 8000)}`,
  ].join("\n");

  const preferredModel = process.env.RESIBOOK_ECG_AI_MODEL || DEFAULT_ECG_MODEL;
  let { response, payload } = await callOpenAiVision({
    apiKey,
    model: preferredModel,
    prompt,
    imageDataUrl: body!.imageDataUrl as string,
  });

  const shouldTryFallback =
    !response.ok &&
    preferredModel !== FALLBACK_ECG_MODEL &&
    [400, 404].includes(response.status);
  if (shouldTryFallback) {
    ({ response, payload } = await callOpenAiVision({
      apiKey,
      model: FALLBACK_ECG_MODEL,
      prompt,
      imageDataUrl: body!.imageDataUrl as string,
    }));
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "ecg_ai_failed",
        message: safeOpenAiMessage(response.status, payload),
      },
      { status: 503 }
    );
  }

  const parsed = parseJsonObject(readOutputText(payload));
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      {
        error: "ecg_ai_invalid_response",
        message: "A IA respondeu fora do formato esperado. Revise manualmente o ECG.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ analysis: parsed });
}
