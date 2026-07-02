import { NextResponse } from "next/server";

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de consulta desativada. Use o prontuário ou a consulta por áudio.",
    },
    { status: 410 }
  );
}

export const GET = legacyRouteResponse;
export const PATCH = legacyRouteResponse;
export const PUT = legacyRouteResponse;
export const DELETE = legacyRouteResponse;


