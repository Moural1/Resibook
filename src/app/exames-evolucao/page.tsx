"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import CopyButton from "../../components/copy-button";
import ConfirmDeleteButton from "../../components/confirm-delete-button";
import ExamTemplatesLive from "../../components/exam-templates-live";

type ExamTemplate = {
  id: number;
  categoria: string | null;
  titulo: string;
  sexo: string | null;
  arquivo_origem: string | null;
  conteudo: string;
  created_at: string;
};

type ExamDraft = {
  categoria: string;
  titulo: string;
  sexo: string;
  arquivo_origem: string;
  conteudo: string;
};

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export default function ExamesEvolucaoPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [templates, setTemplates] = useState<ExamTemplate[]>([]);

  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [sexo, setSexo] = useState("");
  const [arquivoOrigem, setArquivoOrigem] = useState("");
  const [conteudo, setConteudo] = useState("");

  const [success, setSuccess] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSuccess(params.get("success") === "1");
    setUpdated(params.get("updated") === "1");
    setDeleted(params.get("deleted") === "1");
    setError(params.get("message") ? decodeURIComponent(params.get("message") || "") : "");

    if (
      params.get("success") === "1" ||
      params.get("updated") === "1" ||
      params.get("deleted") === "1" ||
      params.get("error") === "1"
    ) {
      const cleanUrl =
        window.location.pathname +
        (initialQuery ? `?q=${encodeURIComponent(initialQuery)}` : "");
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [refreshKey, initialQuery]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data } = await supabase
        .from("exam_templates")
        .select("*")
        .order("created_at", { ascending: false });

      setTemplates((data as ExamTemplate[]) || []);
    }

    load();
  }, [refreshKey]);

  const total = useMemo(() => templates.length, [templates]);

  function handleUseTemplate(draft: ExamDraft) {
    setCategoria(draft.categoria || "");
    setTitulo(draft.titulo || "");
    setSexo(draft.sexo || "");
    setArquivoOrigem(draft.arquivo_origem || "");
    setConteudo(draft.conteudo || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Exames para solicitar
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Exames e evolução clínica
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Biblioteca prática com blocos estruturados para uso clínico real.
            </p>
          </div>

          <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {total} {total === 1 ? "item" : "itens"}
          </div>
        </div>

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Bloco criado.
          </div>
        ) : null}

        {updated ? (
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            Bloco atualizado.
          </div>
        ) : null}

        {deleted ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bloco apagado.
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Erro: {error || "não foi possível concluir."}
          </div>
        ) : null}

        <form
          action="/api/exam-templates"
          method="POST"
          className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Novo bloco
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Clique em um modelo da biblioteca e preencha este formulário automaticamente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <input
                name="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex.: Conduta"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Título
              </label>
              <input
                name="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Manejo sintomático"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sexo
              </label>
              <input
                name="sexo"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                placeholder="Opcional"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Arquivo origem / contexto
              </label>
              <input
                name="arquivo_origem"
                value={arquivoOrigem}
                onChange={(e) => setArquivoOrigem(e.target.value)}
                placeholder="Ex.: EXAMES_EVOLUÇÃO.pdf"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Conteúdo do bloco
            </label>
            <textarea
              name="conteudo"
              rows={10}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Digite o conteúdo clínico..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setCategoria("");
                setTitulo("");
                setSexo("");
                setArquivoOrigem("");
                setConteudo("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
            >
              Limpar formulário
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white"
            >
              Adicionar bloco
            </button>
          </div>
        </form>
      </section>

      <ExamTemplatesLive
        templates={templates}
        onUseTemplate={handleUseTemplate}
        initialQuery={initialQuery}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Blocos salvos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Histórico completo vindo da base de dados.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-400">
            {templates.length} registros
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum bloco encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.categoria || "Sem categoria"}
                      </span>

                      {item.sexo ? (
                        <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                          {item.sexo}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {item.titulo}
                    </h3>

                    {item.arquivo_origem ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.arquivo_origem}
                      </p>
                    ) : null}
                  </div>

                  <CopyButton text={item.conteudo} />
                </div>

                <div className="mt-4 rounded-2xl bg-[#07183d] px-4 py-4">
                  <pre className="whitespace-pre-wrap font-mono text-[15px] leading-7 text-slate-100">
                    {item.conteudo}
                  </pre>
                </div>

                <details className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                    Editar ou apagar este bloco
                  </summary>

                  <form
                    action={`/api/exam-templates/${item.id}`}
                    method="POST"
                    className="mt-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Categoria
                        </label>
                        <input
                          name="categoria"
                          defaultValue={item.categoria ?? ""}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Título
                        </label>
                        <input
                          name="titulo"
                          defaultValue={item.titulo}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Sexo
                        </label>
                        <input
                          name="sexo"
                          defaultValue={item.sexo ?? ""}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Arquivo origem
                        </label>
                        <input
                          name="arquivo_origem"
                          defaultValue={item.arquivo_origem ?? ""}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Conteúdo
                      </label>
                      <textarea
                        name="conteudo"
                        rows={10}
                        defaultValue={item.conteudo}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
                      />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
                      >
                        Salvar edição
                      </button>

                      <ConfirmDeleteButton confirmText="Tem certeza que deseja apagar este bloco?" />
                    </div>
                  </form>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}