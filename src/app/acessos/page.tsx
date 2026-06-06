"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginLog = {
  id: number;
  user_id: string | null;
  user_email: string;
  user_agent: string | null;
  created_at: string;
};

type BlockedUser = {
  id: number;
  email: string;
  reason: string | null;
  blocked_at: string;
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

  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const [query, setQuery] = useState("");
  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setSuccess("");

    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email?.trim().toLowerCase() || "";

    const isAdmin = email === ADMIN_EMAIL;

    setAuthorized(isAdmin);
    setChecking(false);

    if (!isAdmin) {
      setLogs([]);
      setBlockedUsers([]);
      setLoading(false);
      return;
    }

    const [logsRes, blockedRes] = await Promise.all([
      supabase
        .from("login_logs")
        .select("id, user_id, user_email, user_agent, created_at")
        .order("created_at", { ascending: false })
        .limit(300),

      supabase
        .from("blocked_users")
        .select("id, email, reason, blocked_at")
        .order("blocked_at", { ascending: false }),
    ]);

    if (logsRes.error) {
      setError(logsRes.error.message);
      setLogs([]);
    } else {
      setLogs((logsRes.data as LoginLog[]) || []);
    }

    if (blockedRes.error) {
      setError(blockedRes.error.message);
      setBlockedUsers([]);
    } else {
      setBlockedUsers((blockedRes.data as BlockedUser[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredLogs = useMemo(() => {
    const q = normalize(query);

    if (!q) return logs;

    return logs.filter((item) => {
      return (
        normalize(item.user_email).includes(q) ||
        normalize(item.user_agent).includes(q)
      );
    });
  }, [logs, query]);

  const uniqueUsers = useMemo(() => {
    return new Set(logs.map((item) => item.user_email.toLowerCase())).size;
  }, [logs]);

  const todayCount = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    return logs.filter((item) => {
      const date = new Date(item.created_at);

      return (
        date.getFullYear() === y &&
        date.getMonth() === m &&
        date.getDate() === d
      );
    }).length;
  }, [logs]);

  async function blockUser(emailToBlock?: string) {
    const email = (emailToBlock || blockEmail).trim().toLowerCase();

    if (!email) {
      setError("Informe o e-mail para bloquear.");
      return;
    }

    if (email === ADMIN_EMAIL) {
      setError("Você não pode bloquear o administrador.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || null;

    const { error } = await supabase.from("blocked_users").insert({
      email,
      reason: blockReason.trim() || null,
      blocked_by: userId,
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setError("Esse e-mail já está bloqueado.");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(`${email} bloqueado com sucesso.`);
      setBlockEmail("");
      setBlockReason("");
      await load();
    }

    setSaving(false);
  }

  async function unblockUser(id: number, email: string) {
    const confirmed = window.confirm(`Desbloquear ${email}?`);

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("blocked_users").delete().eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`${email} desbloqueado com sucesso.`);
      await load();
    }

    setSaving(false);
  }

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
              Logins e bloqueios
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Acessos ao ResiBook
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Veja quem logou no aplicativo, data/hora do acesso e bloqueie
            usuários quando necessário.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              Erro: {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Logins registrados
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
              Logins hoje
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {todayCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Bloquear usuário
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            O bloqueio impede que o e-mail continue usando o aplicativo após o
            login.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={blockEmail}
            onChange={(event) => setBlockEmail(event.target.value)}
            placeholder="email@exemplo.com"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />

          <input
            value={blockReason}
            onChange={(event) => setBlockReason(event.target.value)}
            placeholder="Motivo opcional"
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
          />

          <button
            type="button"
            onClick={() => blockUser()}
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bloquear
          </button>
        </div>

        {blockedUsers.length > 0 ? (
          <div className="mt-5 space-y-3">
            {blockedUsers.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-rose-900">
                    {item.email}
                  </p>

                  <p className="mt-1 text-xs text-rose-700">
                    Bloqueado em {formatDate(item.blocked_at)}
                    {item.reason ? ` • ${item.reason}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => unblockUser(item.id, item.email)}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700"
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nenhum usuário bloqueado.
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Logins recentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Exibindo os últimos 300 logins/sessões.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por e-mail ou navegador..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:w-96"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum login encontrado.
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
                      Navegador
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredLogs.map((item) => {
                    const email = item.user_email.trim().toLowerCase();
                    const blocked = blockedUsers.some(
                      (blockedUser) =>
                        blockedUser.email.trim().toLowerCase() === email
                    );

                    return (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {formatDate(item.created_at)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {item.user_email}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {simplifyUserAgent(item.user_agent)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {email === ADMIN_EMAIL ? (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                              Admin
                            </span>
                          ) : blocked ? (
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                              Bloqueado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => blockUser(email)}
                              disabled={saving}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                            >
                              Bloquear
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}