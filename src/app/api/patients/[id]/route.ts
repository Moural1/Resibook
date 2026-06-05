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
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) {
        return redirectTo(
          `/pacientes?error=1&message=${encodeURIComponent(error.message)}#list`,
          request
        );
      }

      return redirectTo("/pacientes?deleted=1#list", request);
    }

    const idadeRaw = String(formData.get("idade") || "").trim();

    const payload = {
      nome: String(formData.get("nome") || "").trim(),
      idade: idadeRaw ? Number(idadeRaw) : null,
      sexo: String(formData.get("sexo") || "").trim() || null,
      especialidade: String(formData.get("especialidade") || "").trim() || null,
      queixa: String(formData.get("queixa") || "").trim() || null,
      observacoes: String(formData.get("observacoes") || "").trim() || null,
      diagnostico_principal:
        String(formData.get("diagnostico_principal") || "").trim() || null,
      medicamentos_em_uso:
        String(formData.get("medicamentos_em_uso") || "").trim() || null,
      retorno_previsto_em:
        String(formData.get("retorno_previsto_em") || "").trim() || null,
    };

    const { error } = await supabase.from("patients").update(payload).eq("id", id);

    if (error) {
      return redirectTo(
        `/pacientes?error=1&message=${encodeURIComponent(error.message)}#list`,
        request
      );
    }

    return redirectTo("/pacientes?updated=1#list", request);
  } catch (error: any) {
    return redirectTo(
      `/pacientes?error=1&message=${encodeURIComponent(error?.message || "erro")}#list`,
      request
    );
  }
}