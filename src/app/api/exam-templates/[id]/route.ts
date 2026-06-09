import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de exam_templates desativada. Use a tela atual de Exames / Evolução.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Rota antiga desativada.",
    },
    { status: 410 }
  );
}