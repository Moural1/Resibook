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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nome = String(formData.get("nome") || "").trim();
    const idadeRaw = String(formData.get("idade") || "").trim();
    const sexo = String(formData.get("sexo") || "").trim() || null;
    const especialidade = String(formData.get("especialidade") || "").trim() || null;
    const queixa = String(formData.get("queixa") || "").trim() || null;
    const observacoes = String(formData.get("observacoes") || "").trim() || null;

    if (!nome) {
      return redirectTo("/pacientes?error=1&message=nome%20obrigatorio#list", request);
    }

    const idade = idadeRaw ? Number(idadeRaw) : null;
    const supabase = getSupabase();

    const { error } = await supabase.from("patients").insert({
      nome,
      idade,
      sexo,
      especialidade,
      queixa,
      observacoes,
    });

    if (error) {
      return redirectTo(
        `/pacientes?error=1&message=${encodeURIComponent(error.message)}#list`,
        request
      );
    }

    return redirectTo("/pacientes?success=1#list", request);
  } catch (error: any) {
    return redirectTo(
      `/pacientes?error=1&message=${encodeURIComponent(error?.message || "erro")}#list`,
      request
    );
  }
}