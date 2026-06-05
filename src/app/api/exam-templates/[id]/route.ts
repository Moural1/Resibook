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
        `/exames-evolucao?error=1&message=${encodeURIComponent("supabase não configurado")}`,
        request.url
      )
    );
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "delete") {
    const { error } = await supabase
      .from("exam_templates")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/exames-evolucao?error=1&message=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/exames-evolucao?deleted=1", request.url)
    );
  }

  const categoria = String(formData.get("categoria") || "").trim() || null;
  const titulo = String(formData.get("titulo") || "").trim();
  const sexo = String(formData.get("sexo") || "").trim() || null;
  const arquivo_origem =
    String(formData.get("arquivo_origem") || "").trim() || null;
  const conteudo = String(formData.get("conteudo") || "").trim();

  const { error } = await supabase
    .from("exam_templates")
    .update({
      categoria,
      titulo,
      sexo,
      arquivo_origem,
      conteudo,
    })
    .eq("id", Number(id));

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/exames-evolucao?error=1&message=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL("/exames-evolucao?updated=1", request.url)
  );
}