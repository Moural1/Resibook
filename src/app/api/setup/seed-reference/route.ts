import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Rota de seed desativada em produção. Inserções de referência devem ser feitas por SQL controlado.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Rota de seed desativada.",
    },
    { status: 410 }
  );
}