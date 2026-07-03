import { NextResponse } from "next/server";

function retiredRouteResponse() {
  return NextResponse.json(
    { error: "Rota experimental de análise desativada." },
    { status: 410 }
  );
}

export const GET = retiredRouteResponse;
export const POST = retiredRouteResponse;

