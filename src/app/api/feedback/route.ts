import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_CATEGORIES = new Set([
  "Não entendi como usar",
  "Não achei o que procurei",
  "Conteúdo incompleto",
  "Visual confuso",
  "Sugestão de melhoria",
]);

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Faça login para enviar feedback." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const message = normalizeText(body?.message, 1200);
  const pagePath = normalizeText(body?.pagePath, 240) || null;
  const requestedCategory = normalizeText(body?.category, 80);
  const category = ALLOWED_CATEGORIES.has(requestedCategory)
    ? requestedCategory
    : "Sugestão de melhoria";

  if (message.length < 5) {
    return NextResponse.json(
      { error: "Escreva um feedback um pouco mais completo." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    category,
    message,
    page_path: pagePath,
  });

  if (error) {
    console.error("[feedback] insert_failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Não foi possível salvar o feedback agora." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
