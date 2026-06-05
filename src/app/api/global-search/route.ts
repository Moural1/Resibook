import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SearchResult = {
  id: string;
  type: "paciente" | "prescricao" | "exame" | "flashcard" | "cid";
  title: string;
  subtitle: string;
  href: string;
  badge: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
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

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ results: [] });
  }

  const query = request.nextUrl.searchParams.get("q") || "";
  const q = query.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const [patientsRes, templatesRes, examsRes, flashcardsRes, cidsRes] =
    await Promise.all([
      supabase.from("patients").select("*").limit(100),
      supabase.from("prescription_templates").select("*").limit(100),
      supabase.from("exam_templates").select("*").limit(100),
      supabase.from("flashcards").select("*").limit(100),
      supabase.from("cids").select("*").limit(100),
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
          item.queixa || item.diagnostico_principal || item.especialidade || "Cadastro clínico",
        href: "/pacientes",
        badge: "Paciente",
      });
    }
  }

  for (const item of templatesRes.data || []) {
    if (
      includesSearch(
        [item.titulo, item.categoria, item.conteudo, item.observacoes, item.source_file],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "prescricao",
        title: item.titulo || "Prescrição pronta",
        subtitle: item.categoria || item.source_file || "Biblioteca de plantão",
        href: "/prescricao",
        badge: "Prescrição",
      });
    }
  }

  for (const item of examsRes.data || []) {
    if (
      includesSearch(
        [item.titulo, item.categoria, item.conteudo, item.sexo, item.source_file],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "exame",
        title: item.titulo || "Exame / Evolução",
        subtitle: item.categoria || item.source_file || "Biblioteca clínica",
        href: "/exames-evolucao",
        badge: "Exames",
      });
    }
  }

  for (const item of flashcardsRes.data || []) {
    if (
      includesSearch(
        [item.frente, item.verso, item.source_group, item.source_file, ...(item.tags || [])],
        q
      )
    ) {
      results.push({
        id: String(item.id),
        type: "flashcard",
        title: item.frente || "Flashcard",
        subtitle: item.source_group || item.source_file || "Revisão clínica",
        href: "/flashcards",
        badge: "Flashcard",
      });
    }
  }

  for (const item of cidsRes.data || []) {
    if (
      includesSearch([item.codigo, item.descricao, item.grupo, item.area, item.tags], q)
    ) {
      results.push({
        id: String(item.id),
        type: "cid",
        title: `${item.codigo} — ${item.descricao}`,
        subtitle: item.grupo || item.area || "CID-10",
        href: "/cids",
        badge: "CID",
      });
    }
  }

  return NextResponse.json({
    results: results.slice(0, 12),
  });
}