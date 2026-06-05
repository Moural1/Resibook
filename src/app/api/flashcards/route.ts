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

    const frente = String(formData.get("frente") || "").trim();
    const verso = String(formData.get("verso") || "").trim();
    const source_group = String(formData.get("source_group") || "Manual").trim();
    const source_file = String(formData.get("source_file") || "manual").trim();
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!frente || !verso) {
      return redirectTo(
        "/flashcards?error=1&message=frente%20e%20verso%20sao%20obrigatorios",
        request
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("flashcards").insert({
      frente,
      verso,
      source_group,
      source_file,
      tags,
    });

    if (error) {
      return redirectTo(
        `/flashcards?error=1&message=${encodeURIComponent(error.message)}`,
        request
      );
    }

    return redirectTo("/flashcards?success=1", request);
  } catch (error: any) {
    return redirectTo(
      `/flashcards?error=1&message=${encodeURIComponent(error?.message || "erro")}`,
      request
    );
  }
}