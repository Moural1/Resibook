import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Rota de registro de logo desativada. O app usa os arquivos da pasta public.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Rota desativada.",
    },
    { status: 410 }
  );
}