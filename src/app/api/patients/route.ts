import { NextResponse } from "next/server";

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de pacientes desativada. Use a tela atual de Pacientes.",
    },
    { status: 410 }
  );
}

export const GET = legacyRouteResponse;
export const POST = legacyRouteResponse;


