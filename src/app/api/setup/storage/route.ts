import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Rota de setup desativada em produção. Configure buckets diretamente pelo painel do Supabase.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Rota de setup desativada.",
    },
    { status: 410 }
  );
}