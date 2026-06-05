import { createClient } from "@supabase/supabase-js";
import { redirectTo } from "@/lib/redirect-to";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env ausente");
  }

  return createClient(url, key);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const intent = String(formData.get("intent") || "update");
    const supabase = getSupabase();

    if (intent === "delete") {
      const { error } = await supabase.from("exam_templates").delete().eq("id", id);

      if (error) {
        return redirectTo(
          `/exames-evolucao?error=1&message=${encodeURIComponent(error.message)}#list`,
          request
        );
      }

      return redirectTo("/exames-evolucao?deleted=1#list", request);
    }

    const payload = {
      categoria: String(formData.get("categoria") || "").trim(),
      titulo: String(formData.get("titulo") || "").trim(),
      conteudo: String(formData.get("conteudo") || "").trim(),
      sexo: String(formData.get("sexo") || "").trim() || null,
      source_file: String(formData.get("source_file") || "manual").trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("exam_templates").update(payload).eq("id", id);

    if (error) {
      return redirectTo(
        `/exames-evolucao?error=1&message=${encodeURIComponent(error.message)}#list`,
        request
      );
    }

    return redirectTo("/exames-evolucao?updated=1#list", request);
  } catch (error: any) {
    return redirectTo(
      `/exames-evolucao?error=1&message=${encodeURIComponent(error?.message || "erro")}#list`,
      request
    );
  }
}