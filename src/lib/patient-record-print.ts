// Prontuário em PDF (impressão do navegador).
//
// Documento no formato de prontuário: cabeçalho compacto, identificação em
// tabela, alerta de alergia em destaque, seções tipográficas sem caixas,
// tabelas para problemas, exames e retornos, numeração de páginas e espaço
// para assinatura e CRM. Seções sem registro não aparecem.

export type PrintRecordInput = {
  mode: "complete" | "summary";
  emittedAt: string;
  patient: {
    nome: string;
    sexo?: string | null;
    idade?: number | null;
    nascimento?: string;
    telefone?: string | null;
    especialidade?: string | null;
    plano?: string | null;
    carteirinha?: string | null;
    local?: string | null;
    retorno?: string;
    cadastro?: string;
    crm?: string | null;
    alergias?: string | null;
    comorbidades?: string | null;
    riscos: string[];
    queixa?: string | null;
    hma?: string | null;
    hpp?: string | null;
    medicamentos?: string | null;
    exameFisico?: string | null;
    hipotese?: string | null;
    conduta?: string | null;
    observacoes?: string | null;
  };
  consultations: Array<{
    date: string;
    queixa?: string | null;
    hma?: string | null;
    exameFisico?: string | null;
    hipotese?: string | null;
    conduta?: string | null;
    observacoes?: string | null;
    retorno?: string;
  }>;
  problems: Array<{ titulo: string; tipo?: string | null; status?: string | null; prioridade?: number | null; observacoes?: string | null }>;
  notes: Array<{ date: string; titulo?: string | null; conteudo: string }>;
  exams: Array<{ nome: string; status?: string | null; indicacao?: string | null; resultado?: string | null; impacto?: string | null }>;
  followups: Array<{ previsto: string; realizado?: string; motivo?: string | null; status?: string | null; observacoes?: string | null }>;
  prescriptions: Array<{ date: string; titulo: string; texto: string }>;
};

export function escapeHtml(value?: string | null) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function text(value?: string | null) {
  return escapeHtml(value?.trim()).replace(/\n/g, "<br />");
}

// Texto dentro de content: "..." do CSS (rodapé de página).
function cssString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/</g, "\\3C ").replace(/\n/g, " ");
}

function field(label: string, value?: string | null) {
  if (!value?.trim()) return "";
  return `<div class="field"><div class="label">${escapeHtml(label)}</div><div class="value">${text(value)}</div></div>`;
}

function section(title: string, body: string) {
  if (!body.trim()) return "";
  return `<section class="block"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function table(headers: string[], rows: string[][]) {
  if (!rows.length) return "";
  return `<table class="grid"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

export function buildPatientRecordHtml(input: PrintRecordInput) {
  const { patient, mode } = input;
  const summary = mode === "summary";
  const docTitle = summary ? "Resumo clínico" : "Prontuário médico";
  const subtitle = [
    patient.sexo,
    typeof patient.idade === "number" ? `${patient.idade} anos` : "",
    patient.nascimento ? `nasc. ${patient.nascimento}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const identity: Array<[string, string | null | undefined]> = [
    ["Telefone", patient.telefone],
    ["Convênio", [patient.plano, patient.carteirinha].filter(Boolean).join(" · ")],
    ["Especialidade", patient.especialidade],
    ["Local de atendimento", patient.local],
    ["Retorno previsto", patient.retorno],
    ["Cadastro", patient.cadastro],
  ];
  const identityCells = identity.filter(([, value]) => value && value !== "-");

  const alerts = [
    patient.alergias?.trim()
      ? `<div class="allergy"><strong>Alergias:</strong> ${text(patient.alergias)}</div>`
      : "",
    patient.comorbidades?.trim() || patient.riscos.length
      ? `<div class="risk">${patient.comorbidades?.trim() ? `<strong>Comorbidades:</strong> ${text(patient.comorbidades)}` : ""}${
          patient.riscos.length
            ? `${patient.comorbidades?.trim() ? " &nbsp;·&nbsp; " : ""}<strong>Atenção:</strong> ${patient.riscos.map(escapeHtml).join(", ")}`
            : ""
        }</div>`
      : "",
  ].join("");

  const base = [
    field("Queixa principal", patient.queixa),
    field("História da doença atual", patient.hma),
    field("Antecedentes", patient.hpp),
    field("Medicamentos em uso", patient.medicamentos),
    field("Exame físico", patient.exameFisico),
    field("Hipótese diagnóstica", patient.hipotese),
    field("Conduta", patient.conduta),
    field("Observações", patient.observacoes),
  ].join("");

  const consultations = (summary ? input.consultations.slice(0, 3) : input.consultations)
    .map(
      (item) => `
        <article class="entry">
          <div class="entry-head"><span class="date">${escapeHtml(item.date)}</span><span class="entry-title">${escapeHtml(item.queixa || "Consulta")}</span></div>
          ${field("História", item.hma)}
          ${field("Exame físico", item.exameFisico)}
          ${field("Hipótese diagnóstica", item.hipotese)}
          ${field("Conduta", item.conduta)}
          ${field("Observações", item.observacoes)}
          ${item.retorno ? field("Retorno previsto", item.retorno) : ""}
        </article>`
    )
    .join("");

  const problems = table(
    ["Problema", "Tipo", "Situação", "Observações"],
    input.problems.map((item) => [
      `<strong>${escapeHtml(item.titulo)}</strong>${item.prioridade != null ? `<div class="muted">Prioridade ${item.prioridade}</div>` : ""}`,
      escapeHtml(item.tipo),
      escapeHtml(item.status),
      text(item.observacoes),
    ])
  );

  const notes = (summary ? input.notes.slice(0, 3) : input.notes)
    .map(
      (item) => `
        <article class="entry">
          <div class="entry-head"><span class="date">${escapeHtml(item.date)}</span><span class="entry-title">${escapeHtml(item.titulo || "Evolução")}</span></div>
          <div class="value">${text(item.conteudo)}</div>
        </article>`
    )
    .join("");

  const exams = table(
    ["Exame", "Situação", "Indicação", "Resultado e impacto"],
    input.exams.map((item) => [
      `<strong>${escapeHtml(item.nome)}</strong>`,
      escapeHtml(item.status),
      text(item.indicacao),
      [item.resultado ? text(item.resultado) : "", item.impacto ? `<div class="muted">${text(item.impacto)}</div>` : ""].join(""),
    ])
  );

  const followups = table(
    ["Previsto", "Motivo", "Situação", "Observações"],
    input.followups.map((item) => [
      `<strong>${escapeHtml(item.previsto)}</strong>${item.realizado ? `<div class="muted">Realizado ${escapeHtml(item.realizado)}</div>` : ""}`,
      escapeHtml(item.motivo || "Retorno"),
      escapeHtml(item.status),
      text(item.observacoes),
    ])
  );

  const prescriptions = (summary ? input.prescriptions.slice(0, 5) : input.prescriptions)
    .map(
      (item) => `
        <article class="entry">
          <div class="entry-head"><span class="date">${escapeHtml(item.date)}</span><span class="entry-title">${escapeHtml(item.titulo)}</span></div>
          <div class="rx">${text(item.texto)}</div>
        </article>`
    )
    .join("");

  const footer = `ResiBook · ${docTitle} de ${patient.nome} · Documento confidencial`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(docTitle)} - ${escapeHtml(patient.nome)}</title>
<style>
  @page {
    size: A4;
    margin: 16mm 15mm 18mm;
    @bottom-left { content: "${cssString(footer)}"; font: 7.5pt -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #94a3b8; }
    @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 7.5pt -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #94a3b8; }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: -apple-system, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
    font-size: 10pt; line-height: 1.5; color: #0f172a;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .doc { max-width: 760px; margin: 0 auto; padding: 24px 0; }
  @media print { .doc { max-width: none; padding: 0; } }
  .top { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 2px solid #155e75; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .logo { width: 22px; height: 22px; border-radius: 6px; background: #155e75; color: #fff; font-weight: 700; font-size: 11pt; display: flex; align-items: center; justify-content: center; }
  .brand strong { display: block; font-size: 10.5pt; letter-spacing: -0.01em; }
  .brand span { display: block; font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.12em; }
  .meta { text-align: right; font-size: 8pt; color: #64748b; }
  .patient { margin-top: 16px; }
  .patient h1 { margin: 0; font-size: 19pt; letter-spacing: -0.02em; line-height: 1.2; }
  .patient p { margin: 3px 0 0; color: #475569; font-size: 9.5pt; }
  .ids { display: flex; flex-wrap: wrap; gap: 1px; margin-top: 12px; background: #e2e8f0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .ids div { flex: 1 1 30%; padding: 6px 10px; background: #fff; }
  .ids span { display: block; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
  .ids b { font-weight: 600; font-size: 9.5pt; }
  .allergy { margin-top: 12px; padding: 7px 10px; border-left: 3px solid #e11d48; background: #fff1f2; color: #881337; border-radius: 4px; }
  .risk { margin-top: 6px; padding: 6px 10px; border-left: 3px solid #d97706; background: #fffbeb; color: #78350f; border-radius: 4px; font-size: 9pt; }
  .block { margin-top: 18px; }
  h2 { margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #155e75; break-after: avoid; }
  .field { margin-bottom: 7px; break-inside: avoid; }
  .label { font-size: 8pt; font-weight: 700; color: #334155; }
  .value { white-space: normal; }
  .entry { padding: 8px 0 6px; border-bottom: 1px dashed #e2e8f0; break-inside: avoid; }
  .entry:last-child { border-bottom: 0; }
  .entry-head { display: flex; gap: 10px; align-items: baseline; margin-bottom: 4px; }
  .date { font-size: 8.5pt; font-weight: 700; color: #155e75; white-space: nowrap; }
  .entry-title { font-weight: 600; }
  .rx { padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 9.5pt; }
  table.grid { width: 100%; border-collapse: collapse; font-size: 9pt; }
  table.grid th { text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; padding: 4px 6px; border-bottom: 1px solid #cbd5e1; }
  table.grid td { padding: 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  table.grid tr { break-inside: avoid; }
  .muted { color: #64748b; font-size: 8.5pt; }
  .sign { display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; margin-top: 44px; break-inside: avoid; }
  .sign div { border-top: 1px solid #475569; padding-top: 5px; font-size: 8.5pt; color: #475569; }
  .sign small { display: block; color: #94a3b8; }
  .note { margin-top: 18px; font-size: 7.5pt; color: #94a3b8; }
</style>
</head>
<body>
<main class="doc">
  <header class="top">
    <div class="brand"><div class="logo">R</div><div><strong>ResiBook</strong><span>${escapeHtml(docTitle)}</span></div></div>
    <div class="meta">Emitido em ${escapeHtml(input.emittedAt)}</div>
  </header>

  <div class="patient">
    <h1>${escapeHtml(patient.nome)}</h1>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
  </div>
  ${identityCells.length ? `<div class="ids">${identityCells.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("")}</div>` : ""}
  ${alerts}

  ${section("Dados clínicos", base)}
  ${section("Lista de problemas", problems)}
  ${section(summary ? "Últimas consultas" : "Consultas", consultations)}
  ${section(summary ? "Últimas evoluções" : "Evoluções", notes)}
  ${summary ? "" : section("Exames", exams)}
  ${summary ? "" : section("Retornos", followups)}
  ${section(summary ? "Prescrições recentes" : "Prescrições", prescriptions)}

  <div class="sign">
    <div>Médico responsável — assinatura e carimbo<small>${escapeHtml(patient.crm ? `CRM ${patient.crm}` : "CRM")}</small></div>
    <div>Local e data<small>${escapeHtml(patient.local || "")}</small></div>
  </div>
  <p class="note">Documento confidencial com dados de saúde (LGPD). Guarde e compartilhe apenas com quem tem dever de sigilo.</p>
</main>
</body>
</html>`;
}
