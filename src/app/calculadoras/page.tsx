"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import CopyButton from "@/components/copy-button";
import ModulePageHeader from "@/components/module-page-header";
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

function CalculatorWorkspace({ calculator }: { calculator: ClinicalCalculator }) {
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
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Critérios presentes
              </p>
              <div className="grid gap-3 xl:grid-cols-2">
                {booleanFields.map((field) => (
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
  const searchParams = useSearchParams();
  const requestedCalculator = searchParams.get("calculadora");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState(() =>
    clinicalCalculators.some((item) => item.id === requestedCalculator)
      ? requestedCalculator!
      : clinicalCalculators[0].id
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(clinicalCalculators.map((item) => item.category))).sort(
        (a, b) => a.localeCompare(b, "pt-BR")
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    return clinicalCalculators.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesQuery =
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.shortName).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.description).includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const selected =
    filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  function chooseCalculator(id: string) {
    setSelectedId(id);
    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById("calculator-workspace")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }

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
          { label: "Categorias", value: categories.length },
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

      <section className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar calculadora..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-600 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

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
              className="max-h-[calc(100vh-250px)] space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
              aria-label="Lista de calculadoras"
            >
              {filtered.map((item) => {
                const active = item.id === selected?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseCalculator(item.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-cyan-200 bg-cyan-50 text-cyan-950"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {item.shortName}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {item.category}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </nav>
          )}
        </aside>

        <main id="calculator-workspace" className="scroll-mt-24">
          {selected ? (
            <CalculatorWorkspace key={selected.id} calculator={selected} />
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

