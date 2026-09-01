"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  Clock3,
  RotateCcw,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import CopyButton from "@/components/copy-button";
import ModulePageHeader from "@/components/module-page-header";
import NoResultSearchLogger from "@/components/no-result-search-logger";
import ResibookGuard from "@/components/resibook-guard";
import { createClient } from "@/lib/supabase/client";
import {
  clinicalCalculators,
  getCalculatorInitialValues,
  validateCalculatorValues,
  type CalculatorField,
  type CalculatorResult,
  type CalculatorValue,
  type CalculatorValues,
  type ClinicalCalculator,
} from "@/lib/clinical-calculators";

type CalculatorCollection = "all" | "favorites" | "recent";

const CALCULATOR_FAVORITES_KEY = "resibook-calculator-favorites-v1";
const CALCULATOR_RECENTS_KEY = "resibook-calculator-recents-v1";

function calculatorStorageKey(key: string, userId: string) {
  return `${key}:${userId}`;
}

const calculatorAreas = [
  "Emergência",
  "Cardiovascular",
  "Neuro e trauma",
  "Rim e metabolismo",
  "Obstetrícia",
  "Clínica geral",
] as const;

const quickAccessIds = [
  "curb65",
  "ckd-epi-2021",
  "glasgow",
  "preeclampsia-aspirin-risk",
];

function getCalculatorArea(calculator: ClinicalCalculator) {
  const category = normalize(calculator.category);
  if (
    category.includes("emergencia") ||
    category.includes("infectologia") ||
    category.includes("tromboembolismo")
  ) {
    return "Emergência";
  }
  if (category.includes("cardiologia")) return "Cardiovascular";
  if (category.includes("neurologia") || category.includes("trauma")) {
    return "Neuro e trauma";
  }
  if (
    category.includes("nefrologia") ||
    category.includes("acido-base")
  ) {
    return "Rim e metabolismo";
  }
  if (category.includes("obstetricia")) return "Obstetrícia";
  return "Clínica geral";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function NumberField({
  field,
  value,
  values,
  onChange,
}: {
  field: CalculatorField;
  value: CalculatorValue;
  values: CalculatorValues;
  onChange: (value: CalculatorValue) => void;
}) {
  const unit = field.unitByValue
    ? field.unitByValue.units[String(values[field.unitByValue.fieldId] ?? "")] ||
      field.unit
    : field.unit;

  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{field.label}</span>
      {field.help ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {field.help}
        </span>
      ) : null}
      <div className="relative mt-2">
        <input
          type="number"
          value={String(value ?? "")}
          min={field.min}
          max={field.max}
          step={field.step}
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-20 text-sm text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
            {unit}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: CalculatorField;
  value: CalculatorValue;
  onChange: (value: CalculatorValue) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{field.label}</span>
      {field.help ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {field.help}
        </span>
      ) : null}
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BooleanField({
  field,
  value,
  onChange,
}: {
  field: CalculatorField;
  value: CalculatorValue;
  onChange: (value: CalculatorValue) => void;
}) {
  const answered = typeof value === "boolean";
  return (
    <fieldset className={`rounded-xl border p-3.5 transition ${answered ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/40"}`}>
      <legend className="sr-only">{field.label}</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 text-slate-800">
          {field.label}
          </span>
          {field.help ? (
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {field.help}
            </span>
          ) : null}
        </span>
        <span className="grid shrink-0 grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { label: "Não", nextValue: false },
            { label: "Sim", nextValue: true },
          ].map((option) => {
            const active = value === option.nextValue;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.nextValue)}
                aria-pressed={active}
                className={`min-w-16 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-cyan-800 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {active ? <Check className="mr-1 inline h-3 w-3" /> : null}
                {option.label}
              </button>
            );
          })}
        </span>
      </div>
    </fieldset>
  );
}

function CalculatorFieldControl({
  field,
  value,
  values,
  onChange,
}: {
  field: CalculatorField;
  value: CalculatorValue;
  values: CalculatorValues;
  onChange: (value: CalculatorValue) => void;
}) {
  if (field.type === "boolean") {
    return <BooleanField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "select") {
    return <SelectField field={field} value={value} onChange={onChange} />;
  }
  return <NumberField field={field} value={value} values={values} onChange={onChange} />;
}

function ResultPanel({ result }: { result: CalculatorResult }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white">
      <div className="border-b border-cyan-100 bg-cyan-50/60 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-800">
          Resultado calculado
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums text-slate-950">
                {result.value}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {result.label}
              </span>
            </div>
            <p className="mt-2 text-base font-semibold text-cyan-950">
              {result.classification}
            </p>
          </div>
          <CopyButton
            text={result.copyText}
            label="Copiar para evolução"
            copiedLabel="Copiado"
          />
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Interpretação
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {result.interpretation}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Próximo passo sugerido
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {result.recommendation}
          </p>
        </div>
      </div>

      {result.breakdown?.length ? (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Composição
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.breakdown.map((item) => (
              <span
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-t border-amber-100 bg-amber-50/60 px-5 py-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="text-xs font-semibold text-amber-900">Limitações</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              {result.limitations}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalculatorWorkspace({
  calculator,
  onUsed,
}: {
  calculator: ClinicalCalculator;
  onUsed: (calculatorId: string) => void;
}) {
  const [values, setValues] = useState<CalculatorValues>(() =>
    getCalculatorInitialValues(calculator)
  );
  const [calculatedResult, setCalculatedResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState("");

  function updateValue(fieldId: string, value: CalculatorValue) {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setCalculatedResult(null);
    setError("");
  }

  function calculate() {
    const validationError = validateCalculatorValues(calculator, values);
    if (validationError) {
      setError(validationError);
      setCalculatedResult(null);
      return;
    }
    const nextResult = calculator.calculate(values);
    if (!nextResult) {
      setError("Preencha todos os campos numéricos obrigatórios para calcular.");
      setCalculatedResult(null);
      return;
    }
    setError("");
    setCalculatedResult(nextResult);
    onUsed(calculator.id);
  }

  function reset() {
    setValues(getCalculatorInitialValues(calculator));
    setCalculatedResult(null);
    setError("");
  }

  const numberAndSelectFields = calculator.fields.filter(
    (field) => field.type !== "boolean"
  );
  const booleanFields = calculator.fields.filter(
    (field) => field.type === "boolean"
  );
  const booleanGroups = Array.from(
    booleanFields.reduce((groups, field) => {
      const group = field.group || "Critérios presentes";
      const current = groups.get(group) || [];
      current.push(field);
      groups.set(group, current);
      return groups;
    }, new Map<string, CalculatorField[]>())
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                {calculator.category}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {calculator.name}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {calculator.description}
              </p>
            </div>
            <a
              href={calculator.reference.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-cyan-800"
            >
              <BookOpen className="h-4 w-4" />
              Referência
            </a>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          {numberAndSelectFields.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {numberAndSelectFields.map((field) => (
                <CalculatorFieldControl
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  values={values}
                  onChange={(value) => updateValue(field.id, value)}
                />
              ))}
            </div>
          ) : null}

          {booleanFields.length ? (
            <div className="space-y-5">
              {booleanGroups.map(([group, fields]) => (
                <div key={group}>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {group}
                  </p>
                  <div className="grid gap-3 xl:grid-cols-2">
                    {fields.map((field) => (
                      <CalculatorFieldControl
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        values={values}
                        onChange={(value) => updateValue(field.id, value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={calculate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-800 px-5 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              <Calculator className="h-4 w-4" />
              Calcular
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>
      </section>

      {calculatedResult ? <ResultPanel result={calculatedResult} /> : null}

      <p className="px-1 text-xs text-slate-400">
        Fonte: {calculator.reference.label}
      </p>
    </div>
  );
}

function CalculadorasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCalculator = searchParams.get("calculadora");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [collection, setCollection] = useState<CalculatorCollection>("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedId, setSelectedId] = useState(() =>
    clinicalCalculators.some((item) => item.id === requestedCalculator)
      ? requestedCalculator!
      : clinicalCalculators[0].id
  );

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id || "");
    });
  }, []);

  useEffect(() => {
    function readStoredIds(key: string) {
      try {
        const parsed = JSON.parse(
          window.localStorage.getItem(
            calculatorStorageKey(key, currentUserId)
          ) || "[]"
        );
        return Array.isArray(parsed)
          ? parsed.filter(
              (id): id is string =>
                typeof id === "string" &&
                clinicalCalculators.some((calculator) => calculator.id === id)
            )
          : [];
      } catch {
        return [];
      }
    }

    if (!currentUserId) {
      setFavoriteIds([]);
      setRecentIds([]);
      return;
    }

    setFavoriteIds(readStoredIds(CALCULATOR_FAVORITES_KEY));
    setRecentIds(readStoredIds(CALCULATOR_RECENTS_KEY));
  }, [currentUserId]);

  useEffect(() => {
    if (
      requestedCalculator &&
      clinicalCalculators.some((item) => item.id === requestedCalculator)
    ) {
      setSelectedId(requestedCalculator);
    }
  }, [requestedCalculator]);

  const quickAccessCalculators = useMemo(
    () =>
      quickAccessIds
        .map((id) => clinicalCalculators.find((item) => item.id === id))
        .filter((item): item is ClinicalCalculator => Boolean(item)),
    []
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    const nextItems = clinicalCalculators.filter((item) => {
      const matchesArea = !area || getCalculatorArea(item) === area;
      const matchesQuery =
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.shortName).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(getCalculatorArea(item)).includes(q);
      const matchesCollection =
        collection === "all" ||
        (collection === "favorites" && favoriteIds.includes(item.id)) ||
        (collection === "recent" && recentIds.includes(item.id));
      return matchesArea && matchesQuery && matchesCollection;
    });

    if (collection === "recent") {
      return nextItems.sort(
        (a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)
      );
    }
    return nextItems;
  }, [area, collection, favoriteIds, query, recentIds]);

  const selected =
    filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  function rememberRecent(id: string) {
    if (!currentUserId) return;
    setRecentIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 6);
      window.localStorage.setItem(
        calculatorStorageKey(CALCULATOR_RECENTS_KEY, currentUserId),
        JSON.stringify(next)
      );
      return next;
    });
  }

  function toggleFavorite(id: string) {
    if (!currentUserId) return;
    setFavoriteIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      window.localStorage.setItem(
        calculatorStorageKey(CALCULATOR_FAVORITES_KEY, currentUserId),
        JSON.stringify(next)
      );
      return next;
    });
  }

  function chooseCalculator(id: string, revealFromQuickAccess = false) {
    if (revealFromQuickAccess) {
      setQuery("");
      setArea("");
      setCollection("all");
    }
    setSelectedId(id);
    rememberRecent(id);
    router.replace(`/calculadoras?calculadora=${encodeURIComponent(id)}`, {
      scroll: false,
    });
    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById("calculator-workspace")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }

  function clearFilters() {
    setQuery("");
    setArea("");
    setCollection("all");
  }

  const hasActiveFilters = Boolean(query || area || collection !== "all");

  return (
    <div className="space-y-5">
      <ModulePageHeader
        eyebrow="Apoio à decisão"
        title="Calculadoras clínicas"
        description="Escores e fórmulas para uso rápido no plantão, com interpretação, próximo passo e registro pronto para evolução."
        badges={[
          { label: "Uso profissional", tone: "cyan" },
          { label: "Cálculo local", tone: "slate" },
        ]}
        metrics={[
          { label: "Calculadoras", value: clinicalCalculators.length },
          { label: "Áreas clínicas", value: calculatorAreas.length },
        ]}
        notice={
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-sm leading-6 text-slate-600">
              As calculadoras auxiliam a tomada de decisão, mas não substituem
              julgamento clínico, protocolos locais ou avaliação individual.
            </p>
          </div>
        }
      />

      <section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        aria-label="Localizar calculadora"
      >
        <div className="border-b border-slate-200 p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por escore, especialidade ou finalidade..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div
              className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-50 p-1"
              role="tablist"
              aria-label="Coleção de calculadoras"
            >
              {[
                { id: "all" as const, label: "Todas", icon: Calculator },
                { id: "favorites" as const, label: "Favoritas", icon: Star },
                { id: "recent" as const, label: "Recentes", icon: Clock3 },
              ].map((option) => {
                const Icon = option.icon;
                const active = collection === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCollection(option.id)}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setArea("")}
              aria-pressed={!area}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                !area
                  ? "border-cyan-700 bg-cyan-800 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              Todas as áreas
            </button>
            {calculatorAreas.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setArea(item)}
                aria-pressed={area === item}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  area === item
                    ? "border-cyan-700 bg-cyan-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div>

        {!hasActiveFilters ? (
          <div className="p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Acesso rápido
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-900">
                  Ferramentas frequentes no atendimento
                </h2>
              </div>
              <Sparkles className="h-4 w-4 text-cyan-700" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {quickAccessCalculators.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseCalculator(item.id, true)}
                  className="group flex min-h-20 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/60"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.shortName}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-slate-500">
                      {getCalculatorArea(item)}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-700" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <NoResultSearchLogger
        term={query}
        resultCount={filtered.length}
        context="calculadoras"
      />
      <ResibookGuard context="calculadora" />

      <section className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-3 lg:sticky lg:top-24">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
              <Search className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Nenhuma calculadora encontrada
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ajuste a busca ou limpe o filtro de categoria.
              </p>
            </div>
          ) : (
            <nav
              className="max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:max-h-[calc(100vh-150px)]"
              aria-label="Lista de calculadoras"
            >
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {filtered.length} ferramentas
                </p>
                <span className="text-[10px] font-medium text-slate-400">
                  {area || "Todas as áreas"}
                </span>
              </div>
              <div className="space-y-1.5">
              {filtered.map((item) => {
                const active = item.id === selected?.id;
                const favorite = favoriteIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center rounded-xl border transition ${
                      active
                        ? "border-cyan-200 bg-cyan-50 text-cyan-950"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => chooseCalculator(item.id)}
                      className="min-w-0 flex-1 px-3 py-3 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">
                        {item.shortName}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {getCalculatorArea(item)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      disabled={!currentUserId}
                      aria-label={favorite ? `Remover ${item.shortName} dos favoritos` : `Favoritar ${item.shortName}`}
                      aria-pressed={favorite}
                      className="mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-amber-600 disabled:cursor-wait disabled:opacity-40"
                    >
                      <Star className={`h-4 w-4 ${favorite ? "fill-amber-400 text-amber-500" : ""}`} />
                    </button>
                    <ChevronRight className="mr-2 h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                );
              })}
              </div>
            </nav>
          )}
        </aside>

        <main id="calculator-workspace" className="scroll-mt-24">
          {selected ? (
            <CalculatorWorkspace
              key={selected.id}
              calculator={selected}
              onUsed={rememberRecent}
            />
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center shadow-sm">
              <Search className="mx-auto h-6 w-6 text-slate-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Nenhuma calculadora encontrada
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ajuste a busca ou selecione outra categoria.
              </p>
            </section>
          )}
        </main>
      </section>
    </div>
  );
}

export default function CalculadorasPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Carregando calculadoras...
        </div>
      }
    >
      <CalculadorasContent />
    </Suspense>
  );
}

