import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de prescriptions desativada. Use a tela atual de Prescrição.",
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