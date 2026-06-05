import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function publicUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "localhost:3000";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("github.dev") ? "https" : "http");

  return `${proto}://${host}${path}`;
}

function extractResponseText(json: any): string {
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text.trim();
  }

  if (Array.isArray(json?.output)) {
    const texts: string[] = [];

    for (const item of json.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string" && content.text.trim()) {
            texts.push(content.text.trim());
          }
        }
      }
    }

    if (texts.length > 0) {
      return texts.join("\n\n");
    }
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const patientIdRaw = String(formData.get("patient_id") ?? "").trim();
    const titulo = String(formData.get("titulo") ?? "").trim();
    const queixa = String(formData.get("queixa") ?? "").trim();
    const contexto = String(formData.get("contexto") ?? "").trim();

    if (!queixa) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=required"),
        { status: 303 }
      );
    }

    const patientId = patientIdRaw || null;

    const prompt = [
      "Você é um assistente clínico.",
      "Analise o caso abaixo e responda em português, de forma estruturada.",
      "",
      `Título: ${titulo || "Caso clínico"}`,
      `Queixa principal: ${queixa}`,
      `Contexto adicional: ${contexto || "Não informado"}`,
      "",
      "Formato obrigatório:",
      "1. Resumo do caso",
      "2. Hipóteses principais",
      "3. Pontos de atenção",
      "4. Próximos passos sugeridos",
      "5. Alertas",
    ].join("\n");

    let resposta = "";
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      resposta = "IA não configurada. Adicione OPENAI_API_KEY no arquivo .env.local e reinicie o servidor.";
    } else {
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
        }),
      });

      const json = await aiResponse.json();

      if (!aiResponse.ok) {
        const message =
          json?.error?.message ||
          "Falha ao chamar a API da OpenAI.";

        resposta = `Erro da IA: ${message}`;
      } else {
        resposta = extractResponseText(json);

        if (!resposta) {
          resposta = "A IA respondeu, mas o texto veio vazio ou em formato inesperado.";
        }
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=env"),
        { status: 303 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("ai_cases").insert([
      {
        patient_id: patientId,
        titulo: titulo || null,
        queixa,
        contexto: contexto || null,
        prompt,
        resposta,
      },
    ]);

    if (error) {
      const safeMessage = encodeURIComponent(error.message);
      return NextResponse.redirect(
        publicUrl(request, `/consulta-audio?error=db&message=${safeMessage}`),
        { status: 303 }
      );
    }

    return NextResponse.redirect(
      publicUrl(request, "/consulta-audio?success=1"),
      { status: 303 }
    );
  } catch (err: any) {
    const safeMessage = encodeURIComponent(
      err?.message || "Erro inesperado ao processar IA."
    );

    return NextResponse.redirect(
      publicUrl(request, `/consulta-audio?error=unexpected&message=${safeMessage}`),
      { status: 303 }
    );
  }
}