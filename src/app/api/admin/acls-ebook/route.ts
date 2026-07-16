import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResibookAdmin } from "@/lib/auth-role";
import { BUNDLED_ACLS_EBOOK_DOCUMENT } from "@/lib/acls-ebook-source";
import {
  prepareAclsEbookDocumentForEditing,
  validateAclsEbookDocument,
  type AclsEbookDocument,
} from "@/lib/acls-ebook-schema";

const DOCUMENT_KEY = "acls";
const MAX_DOCUMENT_BYTES = 2_000_000;

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: "Sessão não autenticada.", status: 401 } as const;
  if (!isResibookAdmin(user)) return { error: "Ação permitida apenas ao administrador.", status: 403 } as const;
  return { supabase, user };
}

function validateIncomingDocument(value: unknown) {
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_DOCUMENT_BYTES) return { error: "O eBook excedeu o limite seguro de edição.", document: null };
  const validation = validateAclsEbookDocument(value);
  if (!validation.valid) return { error: validation.errors.join(" "), document: null };
  return { error: null, document: validation.document };
}

export async function GET() {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const [draftResult, publicationResult, revisionsResult] = await Promise.all([
    authorization.supabase.from("acls_ebook_drafts").select("content, revision, updated_at").eq("document_key", DOCUMENT_KEY).maybeSingle(),
    authorization.supabase.from("acls_ebook_publications").select("revision, published_at").eq("document_key", DOCUMENT_KEY).maybeSingle(),
    authorization.supabase.from("acls_ebook_revisions").select("revision, created_at").eq("document_key", DOCUMENT_KEY).order("revision", { ascending: false }).limit(20),
  ]);
  const firstError = draftResult.error || publicationResult.error || revisionsResult.error;
  if (firstError) {
    return NextResponse.json({
      error: "O armazenamento do editor ACLS ainda não está disponível.",
      code: firstError.code,
    }, { status: 503 });
  }

  const saved = draftResult.data?.content ? validateAclsEbookDocument(draftResult.data.content) : null;
  const baseDocument = saved?.valid ? saved.document : BUNDLED_ACLS_EBOOK_DOCUMENT;
  return NextResponse.json({
    document: prepareAclsEbookDocumentForEditing(baseDocument),
    revision: draftResult.data?.revision ?? 0,
    updatedAt: draftResult.data?.updated_at ?? null,
    publishedRevision: publicationResult.data?.revision ?? 0,
    publishedAt: publicationResult.data?.published_at ?? null,
    revisions: revisionsResult.data ?? [],
  });
}

export async function PUT(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => null) as { document?: unknown; expectedRevision?: unknown } | null;
  const expectedRevision = Number(body?.expectedRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) return NextResponse.json({ error: "Revisão do rascunho inválida." }, { status: 400 });
  const checked = validateIncomingDocument(body?.document);
  if (!checked.document) return NextResponse.json({ error: checked.error }, { status: 400 });

  if (expectedRevision === 0) {
    const { data, error } = await authorization.supabase.from("acls_ebook_drafts").insert({
      document_key: DOCUMENT_KEY,
      content: checked.document,
      revision: 1,
      updated_by: authorization.user.id,
    }).select("revision, updated_at").single();
    if (error) return NextResponse.json({ error: "O rascunho já foi criado em outra sessão. Recarregue o editor.", code: error.code }, { status: 409 });
    return NextResponse.json(data);
  }

  const nextRevision = expectedRevision + 1;
  const { data, error } = await authorization.supabase.from("acls_ebook_drafts").update({
    content: checked.document,
    revision: nextRevision,
    updated_by: authorization.user.id,
  }).eq("document_key", DOCUMENT_KEY).eq("revision", expectedRevision).select("revision, updated_at").maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível salvar o rascunho.", code: error.code }, { status: 503 });
  if (!data) return NextResponse.json({ error: "O rascunho foi alterado em outra sessão. Recarregue antes de salvar." }, { status: 409 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => null) as { expectedRevision?: unknown } | null;
  const expectedRevision = Number(body?.expectedRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) return NextResponse.json({ error: "Salve o rascunho antes de publicar." }, { status: 400 });
  const { data, error } = await authorization.supabase.rpc("publish_acls_ebook", { p_expected_revision: expectedRevision });
  if (error) {
    const conflict = error.code === "40001";
    return NextResponse.json({ error: conflict ? "O rascunho mudou em outra sessão. Recarregue o editor." : "Não foi possível publicar o eBook.", code: error.code }, { status: conflict ? 409 : 503 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdmin();
  if ("error" in authorization) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => null) as { revision?: unknown; expectedRevision?: unknown } | null;
  const revision = Number(body?.revision);
  const expectedRevision = Number(body?.expectedRevision);
  if (!Number.isInteger(revision) || revision < 1 || !Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return NextResponse.json({ error: "Revisão de restauração inválida." }, { status: 400 });
  }
  const { data: historic, error: historyError } = await authorization.supabase.from("acls_ebook_revisions").select("content").eq("document_key", DOCUMENT_KEY).eq("revision", revision).maybeSingle();
  if (historyError || !historic?.content) return NextResponse.json({ error: "Versão publicada não encontrada." }, { status: 404 });
  const checked = validateIncomingDocument(historic.content);
  if (!checked.document) return NextResponse.json({ error: "A versão histórica está inválida." }, { status: 409 });
  const { data, error } = await authorization.supabase.from("acls_ebook_drafts").update({
    content: checked.document as AclsEbookDocument,
    revision: expectedRevision + 1,
    updated_by: authorization.user.id,
  }).eq("document_key", DOCUMENT_KEY).eq("revision", expectedRevision).select("revision, updated_at").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "O rascunho mudou em outra sessão. Recarregue o editor." }, { status: 409 });
  return NextResponse.json({ ...data, document: checked.document });
}
