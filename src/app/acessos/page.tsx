"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

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

type SessionInfo = {
  userId: string | null;
  email: string;
  isAdmin: boolean;
};

type UserAccessSummary = {
  email: string;
  totalLogins: number;
  lastAccess: string | null;
  userAgents: string[];
  blocked: boolean;
  blockedId?: number;
  blockedReason?: string | null;
  blockedAt?: string | null;
};

const ADMIN_EMAIL = "igormoura@resibook.com";

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function simplifyUserAgent(value?: string | null) {
  if (!value) return "-";

  if (value.includes("Edg")) return "Edge";
  if (value.includes("Chrome")) return "Chrome";
  if (value.includes("Firefox")) return "Firefox";
  if (value.includes("Safari") && !value.includes("Chrome")) return "Safari";

  return value.slice(0, 90);
}

async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return {
      userId: null,
      email: "",
      isAdmin: false,
    };
  }

  const userId = data.session?.user?.id || null;
  const email = data.session?.user?.email?.trim().toLowerCase() || "";

  return {
    userId,
    email,
    isAdmin: email === ADMIN_EMAIL,
  };
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AcessosPage() {
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [session, setSession] = useState<SessionInfo>({
    userId: null,
    email: "",
    isAdmin: false,
  });

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

    const freshSession = await getSessionInfo();
    setSession(freshSession);
    setAuthorized(freshSession.isAdmin);
    setChecking(false);

    if (!freshSession.isAdmin) {
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
        .limit(500),

      supabase
        .from("blocked_users")
        .select("id, email, reason, blocked_at")
        .order("blocked_at", { ascending: false }),
    ]);

    const nextErrors: string[] = [];

    if (logsRes.error) {
      nextErrors.push(logsRes.error.message);
      setLogs([]);
    } else {
      setLogs((logsRes.data as LoginLog[]) || []);
    }

    if (blockedRes.error) {
      nextErrors.push(blockedRes.error.message);
      setBlockedUsers([]);
    } else {
      setBlockedUsers((blockedRes.data as BlockedUser[]) || []);
    }

    if (nextErrors.length > 0) {
      setError(nextErrors.join(" | "));
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userSummaries = useMemo<UserAccessSummary[]>(() => {
    const map = new Map<string, UserAccessSummary>();

    for (const log of logs) {
      const email = log.user_email.trim().toLowerCase();
      const existing = map.get(email);

      if (!existing) {
        map.set(email, {
          email,
          totalLogins: 1,
          lastAccess: log.created_at,
          userAgents: log.user_agent ? [simplifyUserAgent(log.user_agent)] : [],
          blocked: false,
        });
      } else {
        existing.totalLogins += 1;

        if (
          !existing.lastAccess ||
          new Date(log.created_at).getTime() > new Date(existing.lastAccess).getTime()
        ) {
          existing.lastAccess = log.created_at;
        }

        const agent = simplifyUserAgent(log.user_agent);
        if (agent !== "-" && !existing.userAgents.includes(agent)) {
          existing.userAgents.push(agent);
        }
      }
    }

    for (const blocked of blockedUsers) {
      const email = blocked.email.trim().toLowerCase();
      const existing = map.get(email);

      if (!existing) {
        map.set(email, {
          email,
          totalLogins: 0,
          lastAccess: null,
          userAgents: [],
          blocked: true,
          blockedId: blocked.id,
          blockedReason: blocked.reason,
          blockedAt: blocked.blocked_at,
        });
      } else {
        existing.blocked = true;
        existing.blockedId = blocked.id;
        existing.blockedReason = blocked.reason;
        existing.blockedAt = blocked.blocked_at;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const timeA = a.lastAccess ? new Date(a.lastAccess).getTime() : 0;
      const timeB = b.lastAccess ? new Date(b.lastAccess).getTime() : 0;
      return timeB - timeA;
    });
  }, [logs, blockedUsers]);

  const filteredSummaries = useMemo(() => {
    const q = normalize(query);

    if (!q) return userSummaries;

    return userSummaries.filter((item) => {
      return (
        normalize(item.email).includes(q) ||
        normalize(item.blockedReason).includes(q) ||
        item.userAgents.some((agent) => normalize(agent).includes(q))
      );
    });
  }, [userSummaries, query]);

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
    return userSummaries.length;
  }, [userSummaries]);

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

  const blockedCount = useMemo(() => {
    return blockedUsers.length;
  }, [blockedUsers]);

  async function blockUser(emailToBlock?: string) {
    if (!session.isAdmin || !session.userId) {
      setError("Apenas o administrador pode bloquear usuários.");
      return;
    }

    const email = (emailToBlock || blockEmail).trim().toLowerCase();

    if (!email) {
      setError("Informe o e-mail para bloquear.");
      return;
    }

    if (email === ADMIN_EMAIL) {
      setError("Você não pode bloquear o administrador.");
      return;
    }

    const alreadyBlocked = blockedUsers.some(
      (item) => item.email.trim().toLowerCase() === email
    );

    if (alreadyBlocked) {
      setError("Esse e-mail já está bloqueado.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("blocked_users").insert({
      email,
      reason: blockReason.trim() || null,
      blocked_by: session.userId,
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
    if (!session.isAdmin) {
      setError("Apenas o administrador pode desbloquear usuários.");
      return;
    }

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
            Monitore acessos, veja usuários únicos, confira o último login e
            gerencie bloqueios sem expor dados clínicos.
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Logins registrados" value={logs.length} icon={Activity} />
          <SummaryCard label="Usuários únicos" value={uniqueUsers} icon={Users} />
          <SummaryCard label="Logins hoje" value={todayCount} icon={Clock3} />
          <SummaryCard label="Bloqueados" value={blockedCount} icon={Ban} />
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
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Usuários e status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Resumo por e-mail com último acesso e situação atual.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por e-mail, motivo ou navegador..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none md:w-96"
          />
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredSummaries.map((item) => {
              const isAdminUser = item.email === ADMIN_EMAIL;

              return (
                <article
                  key={item.email}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {item.email}
                        </h3>

                        {isAdminUser ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Admin
                          </span>
                        ) : item.blocked ? (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Ativo
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Último acesso
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            {formatDate(item.lastAccess)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Total de logins
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            {item.totalLogins}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Navegadores
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.userAgents.length > 0 ? (
                            item.userAgents.slice(0, 4).map((agent) => (
                              <span
                                key={agent}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                              >
                                {agent}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">Sem informação</span>
                          )}
                        </div>
                      </div>

                      {item.blocked && (item.blockedReason || item.blockedAt) ? (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                            Motivo / bloqueio
                          </p>
                          <p className="mt-2 text-sm text-rose-900">
                            {item.blockedReason || "Sem motivo informado"}
                          </p>
                          <p className="mt-1 text-xs text-rose-700">
                            {item.blockedAt
                              ? `Bloqueado em ${formatDate(item.blockedAt)}`
                              : ""}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      {isAdminUser ? (
                        <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600">
                          Protegido
                        </span>
                      ) : item.blocked && item.blockedId ? (
                        <button
                          type="button"
                          onClick={() => unblockUser(item.blockedId!, item.email)}
                          disabled={saving}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => blockUser(item.email)}
                          disabled={saving}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Bloquear
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Logins recentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimos 500 registros de acesso do sistema.
            </p>
          </div>
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
                      Status
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
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Admin
                            </span>
                          ) : blocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                              <Ban className="h-3.5 w-3.5" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Ativo
                            </span>
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

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Observações
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Esta página usa apenas e-mail, data/hora de login e navegador para
              monitoramento administrativo. Nenhum dado clínico de pacientes é
              exibido aqui.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}