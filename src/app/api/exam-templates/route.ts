import { NextResponse } from "next/server";

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de modelos de exames desativada. Use a tela atual de Exames / Evolução.",
    },
    { status: 410 }
  );
}

export const GET = legacyRouteResponse;
export const POST = legacyRouteResponse;


