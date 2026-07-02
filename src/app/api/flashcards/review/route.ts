import { NextResponse } from "next/server";

function legacyRouteResponse() {
  return NextResponse.json(
    {
      error:
        "Rota antiga de revisão desativada. Use a tela atual de Flashcards.",
    },
    { status: 410 }
  );
}

export const GET = legacyRouteResponse;
export const POST = legacyRouteResponse;


