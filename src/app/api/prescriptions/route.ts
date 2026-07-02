import { NextResponse } from "next/server";

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de prescrições desativada. Use a tela atual de Prescrição.",
    },
    { status: 410 }
  );
}

export const GET = legacyRouteResponse;
export const POST = legacyRouteResponse;


