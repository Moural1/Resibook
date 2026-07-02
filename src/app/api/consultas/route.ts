import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ConsultationInput = {
  patient_id?: string | null;
  nome?: string;
  queixa?: string;
  historia?: string;
  comorbidades?: string;
  medicacoes?: string;
  exame_fisico?: string;
  exames_disponiveis?: string;
  observacoes?: string;
  resumo?: string;
  conduta?: string;
  prescricao?: string;
  analysis?: unknown;
};

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as ConsultationInput | null;
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const patient_id = body.patient_id || null;
  const nome = String(body.nome || "").trim();
  const queixa = String(body.queixa || "").trim();
  const tipo = "consulta-audio";

  if (patient_id) {
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patient_id)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Paciente não pertence ao usuário autenticado" },
        { status: 403 }
      );
    }
  }
  const transcricao = [
    body.historia ? `História clínica: ${body.historia}` : null,
    body.comorbidades ? `Comorbidades: ${body.comorbidades}` : null,
    body.medicacoes ? `Medicações: ${body.medicacoes}` : null,
    body.exame_fisico ? `Exame físico: ${body.exame_fisico}` : null,
    body.exames_disponiveis ? `Exames disponíveis: ${body.exames_disponiveis}` : null,
    body.observacoes ? `Observações: ${body.observacoes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const resumo = String(body.resumo || "").trim() || null;
  const conduta = String(body.conduta || "").trim() || null;
  const prescricao = String(body.prescricao || "").trim() || null;
  const analysis = body.analysis ? JSON.stringify(body.analysis) : null;

  if (!nome || !queixa) {
    return NextResponse.json(
      { error: "Nome e queixa são obrigatórios" },
      { status: 400 }
    );
  }

  const { data: created, error } = await supabase
    .from("consultas")
    .insert({
      user_id: authData.user.id,
      patient_id,
      nome,
      queixa,
      tipo,
      transcricao,
      resumo,
      conduta,
      prescricao,
      descricao: analysis || transcricao,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("activity_logs").insert({
    user_id: authData.user.id,
    entity_type: "consulta",
    action: "create_consulta",
    meta: { nome, queixa, patient_id },
  });

  return NextResponse.json({ ok: true, id: created?.id ?? null });
}

