import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isResibookAdmin, LEGACY_ADMIN_EMAIL } from "@/lib/auth-role";

async function authorizeAdmin() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { error: "Sessão administrativa não confirmada.", status: 401 };
  }
  if (!isResibookAdmin(data.user)) {
    return { error: "Ação permitida apenas ao administrador.", status: 403 };
  }

  return { user: data.user };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "Gerenciamento de contas não configurado no servidor.",
        code: "service_role_missing",
      },
      { status: 503 }
    );
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at || null,
      isAdmin: isResibookAdmin(user),
    })),
  });
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "Convites não configurados no servidor.",
        code: "service_role_missing",
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;
  const email = body?.email?.trim().toLowerCase() || "";
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
  }

  const redirectTo = `${new URL(request.url).origin}/redefinir-senha`;
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, email });
}

export async function DELETE(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status }
    );
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "Exclusão de contas não configurada no servidor.",
        code: "service_role_missing",
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;
  const email = body?.email?.trim().toLowerCase() || "";
  if (!email) {
    return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
  }
  if (email === LEGACY_ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "A conta administradora é protegida." },
      { status: 400 }
    );
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const target = data.users.find(
    (user) => user.email?.trim().toLowerCase() === email
  );
  if (!target) {
    return NextResponse.json(
      { error: "Conta de autenticação não encontrada." },
      { status: 404 }
    );
  }
  if (isResibookAdmin(target)) {
    return NextResponse.json(
      { error: "Contas administradoras são protegidas." },
      { status: 400 }
    );
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(target.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, email });
}

