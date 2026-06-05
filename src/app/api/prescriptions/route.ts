import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function publicUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "localhost:3000";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("github.dev") ? "https" : "http");

  return `${proto}://${host}${path}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const patientIdRaw = String(formData.get("patient_id") ?? "").trim();
    const pacienteNome = String(formData.get("paciente_nome") ?? "").trim();
    const medicamento = String(formData.get("medicamento") ?? "").trim();
    const posologia = String(formData.get("posologia") ?? "").trim();
    const duracao = String(formData.get("duracao") ?? "").trim();
    const via = String(formData.get("via") ?? "").trim();
    const orientacoes = String(formData.get("orientacoes") ?? "").trim();

    if (!pacienteNome || !medicamento) {
      return NextResponse.redirect(publicUrl(request, "/prescricao?error=required"), {
        status: 303,
      });
    }

    const patientId = patientIdRaw || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(publicUrl(request, "/prescricao?error=env"), {
        status: 303,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("prescriptions").insert([
      {
        patient_id: patientId,
        paciente_nome: pacienteNome,
        medicamento,
        posologia: posologia || null,
        duracao: duracao || null,
        via: via || null,
        orientacoes: orientacoes || null,
      },
    ]);

    if (error) {
      const safeMessage = encodeURIComponent(error.message);
      return NextResponse.redirect(
        publicUrl(request, `/prescricao?error=db&message=${safeMessage}`),
        { status: 303 }
      );
    }

    return NextResponse.redirect(publicUrl(request, "/prescricao?success=1"), {
      status: 303,
    });
  } catch {
    return NextResponse.redirect(publicUrl(request, "/prescricao?error=unexpected"), {
      status: 303,
    });
  }
}