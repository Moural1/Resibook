"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AccessLog = {
  id: number;
  user_id: string | null;
  user_email: string;
  path: string;
  page_title: string | null;
  user_agent: string | null;
  created_at: string;
};

const ADMIN_EMAIL = "igormoura@resibook.com";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function simplifyUserAgent(value?: string | null) {
  if (!value) return "-";

  if (value.includes("Edg")) return "Edge";
  if (value.includes("Chrome")) return "Chrome";
  if (value.includes("Firefox")) return "Firefox";
  if (value.includes("Safari") && !value.includes("Chrome")) return "Safari";

  return value.slice(0, 90);
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function AcessosPage() {
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email?.trim().toLowerCase() || "";

    const isAdmin = email === ADMIN_EMAIL;

    setAuthorized(isAdmin);
    setChecking(false);

    if (!isAdmin) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("access_logs")
      .select("id, user_id, user_email, path, page_title, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      setError(error.message);
      setLogs([]);
    } else {
      setLogs((data as AccessLog[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);

    if (!q) return logs;

    return logs.filter((item) => {
      return (
        normalize(item.user_email).includes(q) ||
        normalize(item.path).includes(q) ||
        normalize(item.page_title).includes(q) ||
        normalize(item.user_agent).includes(q)
      );
    });
  }, [logs, query]);

  const uniqueUsers = useMemo(() => {
    return new Set(logs.map((item) => item.user_email)).size;
  }, [logs]);

  const todayCount = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    return logs.filter((item) => {
      const date = new Date(item.created_at);
      return (
        date.getFullYear() === y &&
        date.getMonth() === m &&
        date.getDate() === d
      );
    }).length;
  }, [logs]);

  if (checking || loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600 shadow-sm">
        Carregando acessos...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Apenas o administrador pode visualizar os registros de acesso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Administração
            </span>

            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Logs de acesso
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Acessos ao ResiBook
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Veja quem acessou o sistema, qual página abriu, data/hora e
            navegador.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Registros
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {logs.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Usuários únicos
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {uniqueUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Acessos hoje
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {todayCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Histórico recente
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Exibindo os últimos 500 registros.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por e-mail, rota ou navegador..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:w-96"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum acesso encontrado.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Data / hora
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Usuário
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Página
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Navegador
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {item.user_email}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {item.path}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.page_title || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {simplifyUserAgent(item.user_agent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
