"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../components/copy-button";
import { QUICK_COMPLAINTS, type QuickComplaint } from "@/lib/clinical-quick-complaints";
import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Gauge,
  Search,
  ShieldAlert,
  Stethoscope,
  Tags,
} from "lucide-react";

type CaseProfile = {
  title: string;
  differentials: string[];
  redFlags: string[];
  initialActions: string[];
  examFocus: string[];
};

const DEFAULT_PROFILE: CaseProfile = {
  title: "Avaliação clínica inicial",
  differentials: [
    "Causas prevalentes para a queixa",
    "Diagnósticos tempo-dependentes",
    "Condições que mudam conduta imediata",
  ],
  redFlags: [
    "Instabilidade hemodinâmica ou respiratória",
    "Rebaixamento do nível de consciência",
    "Dor intensa, progressiva ou atípica",
    "Imunossupressão, gestação, extremos de idade ou comorbidades relevantes",
  ],
  initialActions: [
    "Definir prioridade de atendimento",
    "Rever sinais vitais e glicemia se indicado",
    "Checar alergias, medicações em uso, gestação e função renal/hepática",
    "Registrar hipótese principal, diagnósticos diferenciais e plano",
  ],
  examFocus: [
    "Exames direcionados pela hipótese principal",
    "ECG se dor torácica, síncope, dispneia ou alteração clínica relevante",
    "Imagem ou laboratório se houver sinal de gravidade",
  ],
};

const CASE_PROFILES: Record<string, CaseProfile> = {
  "Dor torácica": {
    title: "Dor torácica no PA",
    differentials: ["SCA/IAM", "TEP", "Dissecção de aorta", "Pneumotórax", "Dor musculoesquelética/refluxo"],
    redFlags: ["Dor opressiva ou irradiada", "Sudorese, síncope ou hipotensão", "Dispneia ou hipoxemia", "Déficit de pulso ou dor migratória"],
    initialActions: ["ECG precoce", "Monitorização e acesso venoso conforme gravidade", "Estratificar risco e tempo de início", "Checar contraindicações antes de qualquer medicação"],
    examFocus: ["ECG seriado", "Troponina conforme protocolo", "RX de tórax se indicado", "D-dímero/angioTC se suspeita de TEP conforme probabilidade"],
  },
  Dispneia: {
    title: "Dispneia aguda",
    differentials: ["Asma/DPOC", "Pneumonia", "Insuficiência cardíaca", "TEP", "Anafilaxia"],
    redFlags: ["SpO2 baixa", "Uso de musculatura acessória", "Cianose ou exaustão", "Confusão, sonolência ou silêncio auscultatório"],
    initialActions: ["Avaliar via aérea, respiração e circulação", "Oxigênio conforme saturação e contexto", "Ausculta, sinais de congestão e perfusão", "Considerar isolamento se síndrome infecciosa respiratória"],
    examFocus: ["Oximetria contínua", "Gasometria se grave", "RX de tórax", "ECG e marcadores conforme suspeita"],
  },
  "Dor abdominal": {
    title: "Dor abdominal",
    differentials: ["Abdome agudo cirúrgico", "Apendicite/colecistite", "Pancreatite", "Obstrução", "Causas ginecológicas/urinárias"],
    redFlags: ["Peritonite", "Vômitos persistentes", "Febre com toxemia", "Sangramento, síncope ou instabilidade"],
    initialActions: ["Localizar dor e tempo de evolução", "Pesquisar defesa, descompressão brusca e massas", "Checar gestação quando aplicável", "Evitar mascarar sinais antes de reavaliar quando quadro cirúrgico é possível"],
    examFocus: ["Hemograma e bioquímica conforme contexto", "EAS/urocultura se urinário", "Beta-hCG quando aplicável", "US/TC conforme hipótese e gravidade"],
  },
  Cefaleia: {
    title: "Cefaleia",
    differentials: ["Migrânea", "HSA", "Meningite", "AVC", "Hipertensão com lesão de órgão-alvo"],
    redFlags: ["Pior cefaleia da vida ou início súbito", "Déficit neurológico", "Febre/rigidez de nuca", "Papiledema, rebaixamento ou crise convulsiva"],
    initialActions: ["Pesquisar SNOOP e exame neurológico", "Verificar PA e sinais infecciosos", "Definir necessidade de imagem antes de punção", "Reavaliar resposta e persistência de sinais de alarme"],
    examFocus: ["TC de crânio se alarme", "Laboratório conforme suspeita", "Punção lombar se indicada após segurança", "ECG/labs se crise hipertensiva suspeita"],
  },
  Febre: {
    title: "Febre no PA",
    differentials: ["IVAS/influenza/COVID", "ITU", "Pneumonia", "Dengue/arbovirose", "Sepse"],
    redFlags: ["Hipotensão, confusão ou extremidades frias", "Dispneia/hipoxemia", "Petéquias ou sangramento", "Imunossupressão ou neutropenia"],
    initialActions: ["Procurar foco e critérios de sepse", "Hidratação e antitérmico se indicado", "Avaliar risco epidemiológico", "Definir necessidade de antibiótico, coleta e observação"],
    examFocus: ["Hemograma conforme quadro", "EAS se sintomas urinários ou sem foco", "RX se respiratório", "Lactato/culturas se sepse provável"],
  },
  "Vômitos / diarreia": {
    title: "Vômitos e diarreia",
    differentials: ["Gastroenterite", "Desidratação", "Dengue", "Abdome agudo", "Distúrbio metabólico"],
    redFlags: ["Sinais de choque ou desidratação importante", "Sangue nas fezes", "Dor abdominal localizada ou peritonite", "Idoso, gestante, lactente ou imunossuprimido"],
    initialActions: ["Classificar hidratação", "Checar glicemia se prostração", "Avaliar necessidade de hidratação oral/venosa", "Rever sinais de dengue e causas cirúrgicas"],
    examFocus: ["Eletrólitos se grave ou persistente", "Função renal se desidratação", "Hemograma se febre alta/sangramento", "Imagem se suspeita cirúrgica"],
  },
  "Crise convulsiva": {
    title: "Crise convulsiva",
    differentials: ["Epilepsia", "Hipoglicemia", "Intoxicação/abstinência", "Infecção SNC", "Lesão estrutural/AVC"],
    redFlags: ["Crise prolongada ou recorrente", "Rebaixamento persistente", "Trauma, febre ou rigidez de nuca", "Primeira crise ou déficit focal"],
    initialActions: ["Proteger via aérea e lateralizar se possível", "Checar glicemia capilar", "Cronometrar crise e período pós-ictal", "Buscar gatilhos, drogas e adesão medicamentosa"],
    examFocus: ["Glicemia imediata", "Eletrólitos se indicado", "TC se primeira crise, trauma ou déficit", "Investigação infecciosa se febre/meningismo"],
  },
  "Hipertensão no PA": {
    title: "PA elevada no PA",
    differentials: ["Elevação pressórica assintomática", "Urgência hipertensiva", "Emergência hipertensiva", "Dor/ansiedade/abstinência", "Lesão de órgão-alvo"],
    redFlags: ["Dor torácica", "Déficit neurológico", "Dispneia/congestão", "Alteração visual, confusão ou oligúria"],
    initialActions: ["Repetir PA com técnica adequada", "Pesquisar lesão de órgão-alvo", "Tratar sintoma e causa desencadeante", "Evitar queda brusca sem emergência definida"],
    examFocus: ["ECG se sintomas ou risco", "Função renal e urina se indicado", "Troponina/RX conforme dor ou dispneia", "TC de crânio se déficit ou rebaixamento"],
  },
};

function getProfile(complaintTitle: string) {
  return CASE_PROFILES[complaintTitle] || DEFAULT_PROFILE;
}

function getComplaintByTitle(title: string) {
  const normalized = title.trim().toLowerCase();
  return QUICK_COMPLAINTS.find((item) => item.title.toLowerCase() === normalized) || null;
}

function buildHref(path: string, query: string) {
  const clean = query.trim();
  return clean ? `${path}?q=${encodeURIComponent(clean)}` : path;
}

function buildCaseText(params: {
  complaint: string;
  age: string;
  sex: string;
  severity: string;
  vitals: Record<string, string>;
  redFlags: string;
  notes: string;
  profile: CaseProfile;
  alerts: string[];
}) {
  const vitalsText = Object.entries(params.vitals)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join(" | ");

  return [
    "CASO RÁPIDO - RESIBOOK",
    `Queixa: ${params.complaint || "não definida"}`,
    `Paciente: ${params.age || "idade não informada"} | ${params.sex || "sexo não informado"}`,
    `Gravidade inicial: ${params.severity}`,
    vitalsText ? `Sinais vitais: ${vitalsText}` : "Sinais vitais: não preenchidos",
    params.alerts.length ? `Alertas: ${params.alerts.join("; ")}` : "Alertas: sem alerta automático pelos campos preenchidos",
    params.redFlags ? `Sinais de alarme descritos: ${params.redFlags}` : "",
    params.notes ? `Anotações: ${params.notes}` : "",
    "",
    "Hipóteses para lembrar:",
    ...params.profile.differentials.map((item) => `- ${item}`),
    "",
    "Ações iniciais:",
    ...params.profile.initialActions.map((item) => `- ${item}`),
    "",
    "Exames/avaliação:",
    ...params.profile.examFocus.map((item) => `- ${item}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CasoRapidoPage() {
  const searchParams = useSearchParams();

  const [complaint, setComplaint] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [severity, setSeverity] = useState("A definir");
  const [redFlags, setRedFlags] = useState("");
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({
    pa: "",
    fc: "",
    fr: "",
    temp: "",
    spo2: "",
    glicemia: "",
  });

  useEffect(() => {
    const urlQuery = searchParams.get("q") || searchParams.get("busca") || "";
    if (urlQuery) setComplaint(urlQuery);
  }, [searchParams]);

  const activeComplaint = useMemo(() => {
    return getComplaintByTitle(complaint) || QUICK_COMPLAINTS.find((item) => {
      const value = complaint.trim().toLowerCase();
      return value && item.terms.some((term) => term.toLowerCase().includes(value));
    }) || null;
  }, [complaint]);

  const workingComplaint = activeComplaint?.title || complaint.trim();
  const profile = getProfile(activeComplaint?.title || "");

  const alerts = useMemo(() => {
    const next: string[] = [];
    const spo2 = Number(vitals.spo2.replace(",", "."));
    const fc = Number(vitals.fc.replace(",", "."));
    const fr = Number(vitals.fr.replace(",", "."));
    const temp = Number(vitals.temp.replace(",", "."));
    const glicemia = Number(vitals.glicemia.replace(",", "."));

    if (spo2 && spo2 < 92) next.push("SpO2 baixa");
    if (fc && (fc < 50 || fc > 120)) next.push("Frequência cardíaca fora da faixa esperada");
    if (fr && (fr < 8 || fr > 30)) next.push("Frequência respiratória preocupante");
    if (temp && temp >= 38.5) next.push("Febre alta");
    if (glicemia && glicemia < 70) next.push("Hipoglicemia possível");
    if (redFlags.trim()) next.push("Sinais de alarme descritos manualmente");

    return next;
  }, [vitals, redFlags]);

  const caseText = buildCaseText({
    complaint: workingComplaint,
    age,
    sex,
    severity,
    vitals,
    redFlags,
    notes,
    profile,
    alerts,
  });

  function updateVital(key: keyof typeof vitals, value: string) {
    setVitals((current) => ({ ...current, [key]: value }));
  }

  function pickComplaint(item: QuickComplaint) {
    setComplaint(item.title);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Assistente de plantão
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Caso rápido
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                Estruture a primeira abordagem, destaque gravidade e abra os módulos do ResiBook já filtrados pela queixa.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <Stat label="Queixa" value={workingComplaint ? "Ativa" : "Livre"} />
              <Stat label="Alertas" value={alerts.length} />
              <Stat label="Plano" value="Pronto" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 md:p-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Queixa principal">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={complaint}
                      onChange={(event) => setComplaint(event.target.value)}
                      placeholder="Ex.: cefaleia, dor torácica, dispneia..."
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </Field>

                <Field label="Gravidade inicial">
                  <select
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option>A definir</option>
                    <option>Baixa complexidade</option>
                    <option>Observação</option>
                    <option>Urgência</option>
                    <option>Emergência</option>
                  </select>
                </Field>

                <Field label="Idade">
                  <input
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Ex.: 62 anos"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </Field>

                <Field label="Sexo">
                  <select
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Não informado</option>
                    <option>Feminino</option>
                    <option>Masculino</option>
                    <option>Outro / não especificado</option>
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  ["pa", "PA", "Ex.: 140x90"],
                  ["fc", "FC", "bpm"],
                  ["fr", "FR", "irpm"],
                  ["temp", "Temp.", "°C"],
                  ["spo2", "SpO2", "%"],
                  ["glicemia", "Glicemia", "mg/dL"],
                ] as const).map(([key, label, placeholder]) => (
                  <Field key={key} label={label}>
                    <input
                      value={vitals[key]}
                      onChange={(event) => updateVital(key, event.target.value)}
                      placeholder={placeholder}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </Field>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <Field label="Sinais de alarme percebidos">
                <textarea
                  rows={3}
                  value={redFlags}
                  onChange={(event) => setRedFlags(event.target.value)}
                  placeholder="Ex.: dor súbita, déficit focal, hipotensão, rigidez de nuca..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </Field>

              <div className="mt-4">
                <Field label="Anotações rápidas">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="História curta, exame físico, contexto ou pendências."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Plano operacional
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {profile.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Revise, copie e siga para o módulo necessário com a mesma queixa.
                  </p>
                </div>

                <CopyButton text={caseText} label="Copiar caso" copiedLabel="Copiado" />
              </div>

              {alerts.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                    <div>
                      <p className="text-sm font-semibold text-rose-900">
                        Alertas do preenchimento
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {alerts.map((item) => (
                          <span key={item} className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <PlanBlock title="Hipóteses" items={profile.differentials} icon={Stethoscope} />
                <PlanBlock title="Não perder" items={profile.redFlags} icon={ShieldAlert} />
                <PlanBlock title="Exames" items={profile.examFocus} icon={FileText} />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Ações iniciais</p>
                <ul className="mt-3 space-y-2">
                  {profile.initialActions.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <ClipboardCheck className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <ModuleLink href={buildHref("/condutas", workingComplaint)} title="Condutas" icon={ClipboardList} />
              <ModuleLink href={buildHref("/prescricao", workingComplaint)} title="Prescrição" icon={ClipboardList} />
              <ModuleLink href={buildHref("/exames-evolucao", workingComplaint)} title="Exames / evolução" icon={FileText} />
              <ModuleLink href={buildHref("/cids", workingComplaint)} title="CID" icon={Tags} />
              <ModuleLink href="/pacientes" title="Paciente" icon={Activity} />
              <ModuleLink href="/dashboard" title="Dashboard" icon={Gauge} />
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Entradas rápidas
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Comece pela síndrome
            </h2>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {QUICK_COMPLAINTS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => pickComplaint(item)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                activeComplaint?.title === item.title
                  ? "border-slate-300 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PlanBlock({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-950">{title}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleLink({
  href,
  title,
  icon: Icon,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-950">{title}</p>
    </Link>
  );
}
