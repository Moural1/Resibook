import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase();
  const { id } = await context.params;

  if (!supabase) {
    return NextResponse.redirect(
      new URL(
        `/prescricao?error=1&message=${encodeURIComponent("supabase não configurado")}`,
        request.url
      )
    );
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "delete") {
    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/prescricao?error=1&message=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(new URL("/prescricao?deleted=1", request.url));
  }

  const patient_id_raw = String(formData.get("patient_id") || "").trim();
  const paciente_nome = String(formData.get("paciente_nome") || "").trim() || null;
  const medicamento = String(formData.get("medicamento") || "").trim() || null;
  const posologia = String(formData.get("posologia") || "").trim() || null;
  const duracao = String(formData.get("duracao") || "").trim() || null;
  const via = String(formData.get("via") || "").trim() || null;
  const orientacoes = String(formData.get("orientacoes") || "").trim() || null;

  const patient_id = patient_id_raw || null;

  const { error } = await supabase
    .from("prescriptions")
    .update({
      patient_id,
      paciente_nome,
      medicamento,
      posologia,
      duracao,
      via,
      orientacoes,
    })
    .eq("id", Number(id));

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/prescricao?error=1&message=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL("/prescricao?updated=1", request.url));
}