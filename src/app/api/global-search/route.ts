import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSearchScore } from "@/lib/search";
import { clinicalCalculators } from "@/lib/clinical-calculators";

type SearchResult = {
  id: string;
  type:
    | "paciente"
    | "prescricao"
    | "modelo_prescricao"
    | "exame"
    | "topico"
    | "flashcard"
    | "cid"
    | "calculadora";
  title: string;
  subtitle: string;
  href: string;
  badge: string;
};

const GUEST_EMAIL = "convidado@resibook.com";

function getSupabase(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesSearch(parts: Array<string | null | undefined>, query: string) {
  const q = normalize(query);
  if (!q) return false;

  const haystack = parts.map(normalize).join(" ");
  return haystack.includes(q);
}

function getAccessToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const sbAccessToken = request.cookies.get("sb-access-token")?.value;
  if (sbAccessToken) return sbAccessToken;

  const sbProjectCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.endsWith("-auth-token"));

  if (!sbProjectCookie?.value) return null;

  try {
    const parsed = JSON.parse(sbProjectCookie.value);

    if (Array.isArray(parsed)) {
      return parsed[0] || null;
    }

    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const q = query.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json({ results: [] });
  }

  const supabase = getSupabase(accessToken);

  if (!supabase) {
    return NextResponse.json({ results: [] });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user?.id || !user.email) {
    return NextResponse.json({ results: [] });
  }

  const userId = user.id;
  const email = user.email.trim().toLowerCase();
  const isGuest = email === GUEST_EMAIL;

  const patientsPromise = isGuest
    ? Promise.resolve({ data: [], error: null })
    : supabase
        .from("patients")
        .select(
          "id, nome, especialidade, queixa, observacoes, diagnostico_principal"
        )
        .eq("user_id", userId)
        .limit(60);

  const prescriptionsPromise = isGuest
    ? Promise.resolve({ data: [], error: null })
    : supabase
        .from("prescriptions")
        .select("id, paciente_nome, medicamento, posologia, orientacoes")
        .eq("user_id", userId)
        .limit(60);

  const prescriptionTemplatesPromise = supabase
    .from("prescription_templates")
    .select("id, titulo, categoria, conteudo, observacoes, source_file")
    .limit(80);

  const examsPromise = supabase
    .from("exam_templates")
    .select("id, titulo, categoria, conteudo, sexo, arquivo_origem, source_file")
    .limit(80);

  const topicosPromise = supabase
    .from("topicos_medicos")
    .select(
      "id, area, titulo, resumo, diagnostico, criterios, exames, tratamento, conduta_urgencia, internacao_referencia, pegadinhas, tags, fonte"
    )
    .limit(80);

  const flashcardsPromise = isGuest
    ? Promise.resolve({ data: [], error: null })
    : supabase
        .from("flashcards")
        .select("id, area, materia, tipo, frente, verso")
        .limit(80);

  const cidsPromise = supabase
    .from("cids")
    .select("id, codigo, descricao, grupo, area, tags")
    .limit(80);

  const [
    patientsRes,
    prescriptionsRes,
    templatesRes,
    examsRes,
    topicosRes,
    flashcardsRes,
    cidsRes,
  ] = await Promise.all([
    patientsPromise,
    prescriptionsPromise,
    prescriptionTemplatesPromise,
    examsPromise,
    topicosPromise,
    flashcardsPromise,
    cidsPromise,
  ]);

  const results: SearchResult[] = [];

  for (const item of patientsRes.data || []) {
    if (
      includesSearch(
        [
          item.nome,
          item.especialidade,
          item.queixa,
          item.observacoes,
          item.diagnostico_principal,
        ],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "paciente",
        title: item.nome || "Paciente",
        subtitle:
          item.queixa ||
          item.diagnostico_principal ||
          item.especialidade ||
          "Cadastro clínico",
        href: `/pacientes?q=${encodeURIComponent(item.nome || q)}`,
        badge: "Paciente",
      });
    }
  }

  for (const item of prescriptionsRes.data || []) {
    if (
      includesSearch(
        [item.medicamento, item.paciente_nome, item.posologia, item.orientacoes],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "prescricao",
        title: item.medicamento || "Prescrição",
        subtitle:
          item.paciente_nome || item.posologia || item.orientacoes || "Prescrição clínica",
        href: `/prescricao?q=${encodeURIComponent(item.medicamento || q)}`,
        badge: "Prescrição",
      });
    }
  }

  for (const item of templatesRes.data || []) {
    if (
      includesSearch(
        [
          item.titulo,
          item.categoria,
          item.conteudo,
          item.observacoes,
          item.source_file,
        ],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "modelo_prescricao",
        title: item.titulo || "Prescrição pronta",
        subtitle: item.categoria || item.source_file || "Biblioteca de plantão",
        href: `/prescricao?q=${encodeURIComponent(item.titulo || q)}`,
        badge: "Modelo",
      });
    }
  }

  for (const item of examsRes.data || []) {
    if (
      includesSearch(
        [
          item.titulo,
          item.categoria,
          item.conteudo,
          item.sexo,
          item.arquivo_origem,
          item.source_file,
        ],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "exame",
        title: item.titulo || "Exame / Evolução",
        subtitle:
          item.categoria ||
          item.arquivo_origem ||
          item.source_file ||
          "Biblioteca clínica",
        href: `/exames-evolucao?q=${encodeURIComponent(item.titulo || q)}`,
        badge: "Exame",
      });
    }
  }

  for (const item of topicosRes.data || []) {
    if (
      includesSearch(
        [
          item.area,
          item.titulo,
          item.resumo,
          item.diagnostico,
          item.criterios,
          item.exames,
          item.tratamento,
          item.conduta_urgencia,
          item.internacao_referencia,
          item.pegadinhas,
          item.tags,
          item.fonte,
        ],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "topico",
        title: item.titulo || "Tópico médico",
        subtitle: item.area || item.resumo || "Biblioteca médica",
        href: `/topicos?q=${encodeURIComponent(item.titulo || q)}`,
        badge: "Tópico",
      });
    }
  }

  for (const item of flashcardsRes.data || []) {
    if (
      includesSearch(
        [item.frente, item.verso, item.area, item.materia, item.tipo],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "flashcard",
        title: item.frente || "Flashcard",
        subtitle: item.materia || item.area || item.tipo || "Revisão clínica",
        href: `/flashcards?q=${encodeURIComponent(item.frente || q)}`,
        badge: "Flashcard",
      });
    }
  }

  for (const item of cidsRes.data || []) {
    if (
      includesSearch(
        [item.codigo, item.descricao, item.grupo, item.area, item.tags],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "cid",
        title: item.codigo
          ? `${item.codigo} — ${item.descricao || "CID"}`
          : item.descricao || "CID",
        subtitle: item.grupo || item.area || "CID-10",
        href: `/cids?q=${encodeURIComponent(item.codigo || item.descricao || q)}`,
        badge: "CID",
      });
    }
  }

  if (!isGuest) {
    for (const item of clinicalCalculators) {
      if (
        includesSearch(
          [item.name, item.shortName, item.category, item.description],
          q
        )
      ) {
        results.push({
          id: item.id,
          type: "calculadora",
          title: item.name,
          subtitle: item.category,
          href: `/calculadoras?calculadora=${encodeURIComponent(item.id)}`,
          badge: "Calculadora",
        });
      }
    }
  }

  const typeBoost: Record<SearchResult["type"], number> = {
    paciente: 9,
    modelo_prescricao: 8,
    prescricao: 7,
    topico: 6,
    exame: 5,
    cid: 4,
    flashcard: 3,
    calculadora: 6.5,
  };

  const orderedResults = results
    .sort((a, b) => {
      const scoreA =
        getSearchScore(
          [
            { value: a.title, weight: 10 },
            { value: a.subtitle, weight: 4 },
            { value: a.badge, weight: 2 },
          ],
          q
        ) + typeBoost[a.type];
      const scoreB =
        getSearchScore(
          [
            { value: b.title, weight: 10 },
            { value: b.subtitle, weight: 4 },
            { value: b.badge, weight: 2 },
          ],
          q
        ) + typeBoost[b.type];

      return scoreB - scoreA;
    })
    .slice(0, 12);

  return NextResponse.json({
    results: orderedResults,
  });
}

