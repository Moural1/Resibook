"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Edit3,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from "lucide-react";

type UserForm = {
  nome: string;
  cargo: string;
  especialidade: string;
  crm: string;
  telefone: string;
  instituicao: string;
};

const emptyForm: UserForm = {
  nome: "",
  cargo: "",
  especialidade: "",
  crm: "",
  telefone: "",
  instituicao: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function FieldView({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 min-h-6 break-words text-sm font-medium text-slate-900">
        {value?.trim() ? value : "-"}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

export default function UsuarioPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);

  const [form, setForm] = useState<UserForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUser() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setError(error?.message || "Não foi possível carregar o usuário.");
      setLoading(false);
      return;
    }

    const metadata = data.user.user_metadata || {};

    setEmail(data.user.email || "");
    setUserId(data.user.id || "");
    setCreatedAt(data.user.created_at || null);
    setLastSignInAt(data.user.last_sign_in_at || null);

    setForm({
      nome: String(metadata.nome || metadata.name || ""),
      cargo: String(metadata.cargo || ""),
      especialidade: String(metadata.especialidade || ""),
      crm: String(metadata.crm || ""),
      telefone: String(metadata.telefone || ""),
      instituicao: String(metadata.instituicao || ""),
    });

    setLoading(false);
  }

  useEffect(() => {
    loadUser();
  }, []);

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.updateUser({
      data: {
        nome: form.nome.trim(),
        name: form.nome.trim(),
        cargo: form.cargo.trim(),
        especialidade: form.especialidade.trim(),
        crm: form.crm.trim(),
        telefone: form.telefone.trim(),
        instituicao: form.instituicao.trim(),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Dados do usuário salvos com sucesso.");
      setEditing(false);
      await loadUser();
    }

    setSaving(false);
  }

  function handleCancel() {
    setEditing(false);
    setError("");
    setSuccess("");
    loadUser();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Usuário
              </span>

              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Perfil profissional
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Perfil do usuário
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Visualize e edite seus dados profissionais básicos usados no
              ResiBook.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                <Edit3 className="h-4 w-4" />
                Editar perfil
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Erro: {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[86px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : !editing ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FieldView label="Nome" value={form.nome} icon={User} />
            <FieldView label="Cargo" value={form.cargo} icon={BadgeCheck} />
            <FieldView
              label="Especialidade"
              value={form.especialidade}
              icon={Stethoscope}
            />
            <FieldView label="CRM / registro" value={form.crm} icon={ShieldCheck} />
            <FieldView label="Telefone" value={form.telefone} icon={Phone} />
            <FieldView
              label="Instituição"
              value={form.instituicao}
              icon={Building2}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InputField
                label="Nome"
                value={form.nome}
                onChange={(value) => updateForm("nome", value)}
                placeholder="Seu nome"
                icon={User}
              />

              <InputField
                label="Cargo"
                value={form.cargo}
                onChange={(value) => updateForm("cargo", value)}
                placeholder="Ex.: Médico"
                icon={BadgeCheck}
              />

              <InputField
                label="Especialidade"
                value={form.especialidade}
                onChange={(value) => updateForm("especialidade", value)}
                placeholder="Ex.: Psiquiatria"
                icon={Stethoscope}
              />

              <InputField
                label="CRM / registro"
                value={form.crm}
                onChange={(value) => updateForm("crm", value)}
                placeholder="Ex.: CRM-MG 000000"
                icon={ShieldCheck}
              />

              <InputField
                label="Telefone"
                value={form.telefone}
                onChange={(value) => updateForm("telefone", value)}
                placeholder="Telefone profissional"
                icon={Phone}
              />

              <InputField
                label="Instituição"
                value={form.instituicao}
                onChange={(value) => updateForm("instituicao", value)}
                placeholder="Hospital, clínica ou serviço"
                icon={Building2}
              />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Dados de acesso
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informações técnicas da autenticação.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FieldView label="E-mail" value={email} icon={Mail} />
            <FieldView label="ID do usuário" value={userId} icon={ShieldCheck} />
            <FieldView
              label="Conta criada em"
              value={formatDate(createdAt)}
              icon={CalendarClock}
            />
            <FieldView
              label="Último login"
              value={formatDate(lastSignInAt)}
              icon={CalendarClock}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                Perfil salvo no Supabase
              </h2>

              <p className="mt-2 text-sm leading-7 text-emerald-950">
                As alterações desta página são salvas no metadata do usuário
                autenticado. Elas ficam vinculadas ao login atual e podem ser
                usadas futuramente em relatórios, assinatura de documentos e
                identificação profissional.
              </p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}