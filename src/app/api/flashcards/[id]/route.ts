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
    const intent = String(formData.get("intent") || "");

    if (intent !== "delete") {
      return redirectTo("/flashcards#list", request);
    }

    const supabase = getSupabase();

    await supabase.from("flashcard_reviews").delete().eq("flashcard_id", id);

    const { error } = await supabase.from("flashcards").delete().eq("id", id);

    if (error) {
      return redirectTo(
        `/flashcards?error=1&message=${encodeURIComponent(error.message)}#list`,
        request
      );
    }

    return redirectTo("/flashcards?deleted=1#list", request);
  } catch (error: any) {
    return redirectTo(
      `/flashcards?error=1&message=${encodeURIComponent(error?.message || "erro")}#list`,
      request
    );
  }
}