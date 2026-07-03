import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function publicUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "localhost:3000";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("github.dev") ? "https" : "http");

  return `${proto}://${host}${path}`;
}

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
  error?: { message?: string };
};

function detectDirectIdentifier(value: string) {
  const checks = [
    { label: "CPF", pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
    { label: "CNS", pattern: /\b\d{3}[ .-]?\d{4}[ .-]?\d{4}[ .-]?\d{4}\b/ },
    { label: "e-mail", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
    { label: "telefone", pattern: /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]\d{4}\b/ },
    { label: "identificador rotulado", pattern: /\b(?:cpf|cns|telefone|celular|e-?mail)\s*:/i },
  ];

  return checks.find(({ pattern }) => pattern.test(value))?.label || null;
}

function extractResponseText(json: OpenAIResponse): string {
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
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(publicUrl(request, "/login"), {
        status: 303,
      });
    }

    const formData = await request.formData();

    const patientIdRaw = String(formData.get("patient_id") ?? "").trim();
    const titulo = String(formData.get("titulo") ?? "").trim();
    const queixa = String(formData.get("queixa") ?? "").trim();
    const contexto = String(formData.get("contexto") ?? "").trim();
    const deidentified = String(formData.get("deidentified") ?? "") === "confirmed";

    if (!queixa) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=required"),
        { status: 303 }
      );
    }

    if (titulo.length > 160 || queixa.length > 6000 || contexto.length > 6000) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=length"),
        { status: 303 }
      );
    }

    if (!deidentified) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=deidentified"),
        { status: 303 }
      );
    }

    const identifier = detectDirectIdentifier([titulo, queixa, contexto].join("\n"));
    if (identifier) {
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=identifiers"),
        { status: 303 }
      );
    }

    const patientId = patientIdRaw || null;

    if (patientId) {
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("id", patientId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError || !patient) {
        return NextResponse.redirect(
          publicUrl(request, "/consulta-audio?error=patient"),
          { status: 303 }
        );
      }
    }

    const prompt = [
      "Você é um assistente clínico.",
      "Analise o caso abaixo e responda em português, de forma estruturada.",
      "O caso foi enviado de forma desidentificada. Não tente inferir a identidade do paciente.",
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
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=unavailable"),
        { status: 303 }
      );
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

      const json = (await aiResponse.json()) as OpenAIResponse;

      if (!aiResponse.ok) {
        console.error("Falha na análise por IA", aiResponse.status, json?.error?.message);
        return NextResponse.redirect(
          publicUrl(request, "/consulta-audio?error=unavailable"),
          { status: 303 }
        );
      } else {
        resposta = extractResponseText(json);

        if (!resposta) {
          resposta = "A IA respondeu, mas o texto veio vazio ou em formato inesperado.";
        }
      }
    }

    const { error } = await supabase.from("ai_cases").insert([
      {
        user_id: user.id,
        patient_id: patientId,
        titulo: titulo || null,
        queixa,
        contexto: contexto || null,
        prompt,
        resposta,
      },
    ]);

    if (error) {
      console.error("Falha ao salvar caso clínico", error.message);
      return NextResponse.redirect(
        publicUrl(request, "/consulta-audio?error=db"),
        { status: 303 }
      );
    }

    return NextResponse.redirect(
      publicUrl(request, "/consulta-audio?success=1"),
      { status: 303 }
    );
  } catch (error: unknown) {
    console.error("Falha inesperada ao processar IA", error);

    return NextResponse.redirect(
      publicUrl(request, "/consulta-audio?error=unexpected"),
      { status: 303 }
    );
  }
}

