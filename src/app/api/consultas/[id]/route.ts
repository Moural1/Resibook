import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  return NextResponse.json({
    ok: true,
    id,
    message: "Rota de consulta ativa.",
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    id,
    data: body,
    message: "Atualização de consulta recebida.",
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    id,
    data: body,
    message: "Atualização de consulta recebida.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  return NextResponse.json({
    ok: true,
    id,
    message: "Consulta removida.",
  });
}