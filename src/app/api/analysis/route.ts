import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const nome = body?.nome || body?.paciente || "Paciente";
    const queixa = body?.queixa || body?.queixa_principal || "";
    const informacoes = body?.informacoes || body?.observacoes || "";

    const resumo = [
      `Paciente: ${nome}`,
      queixa ? `Queixa principal: ${queixa}` : "",
      informacoes ? `Informações adicionais: ${informacoes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      ok: true,
      analysis: resumo || "Nenhuma informação clínica enviada para análise.",
      message:
        "Rota de análise ativa. Integração com IA pode ser adicionada depois.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível processar a análise.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Não autenticado" },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, message: "API de análise ativa." });
}

