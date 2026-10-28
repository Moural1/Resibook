"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

type Strength = { label: string; tone: string; width: string };

/* Força aproximada só para orientar: tamanho e variedade de caracteres. */
function passwordStrength(value: string): Strength | null {
  if (!value) return null;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  if (value.length < MIN_LENGTH) return { label: "Curta demais", tone: "bg-rose-500", width: "w-1/4" };
  if (value.length >= 12 && classes >= 3) return { label: "Forte", tone: "bg-emerald-500", width: "w-full" };
  if (value.length >= 10 && classes >= 2) return { label: "Boa", tone: "bg-cyan-600", width: "w-3/4" };
  return { label: "Fraca", tone: "bg-amber-500", width: "w-1/2" };
}

export default function AccountPasswordForm({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const strength = passwordStrength(next);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (next.length < MIN_LENGTH) return setError(`A nova senha precisa ter pelo menos ${MIN_LENGTH} caracteres.`);
    if (next !== confirmation) return setError("A confirmação não é igual à nova senha.");
    if (next === current) return setError("A nova senha precisa ser diferente da atual.");

    setSaving(true);
    try {
      const supabase = createClient();
      // Confere a senha atual antes de trocar: protege uma sessão esquecida aberta.
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (signInError) {
        setError("A senha atual não confere.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) {
        setError(
          updateError.code === "weak_password"
            ? "Essa senha é fraca demais. Use mais caracteres, misturando letras, números e símbolos."
            : "Não foi possível trocar a senha agora. Tente novamente em instantes."
        );
        return;
      }
      setCurrent("");
      setNext("");
      setConfirmation("");
      setSuccess("Senha alterada. Use a nova senha no próximo login.");
    } catch {
      setError("Não foi possível trocar a senha agora. Tente novamente em instantes.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100";

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:max-w-xl" noValidate>
      {[
        { id: "senha-atual", label: "Senha atual", value: current, set: setCurrent, auto: "current-password" },
        { id: "senha-nova", label: "Nova senha", value: next, set: setNext, auto: "new-password" },
        { id: "senha-confirmar", label: "Confirmar nova senha", value: confirmation, set: setConfirmation, auto: "new-password" },
      ].map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="text-sm font-medium text-slate-600">
            {field.label}
          </label>
          <div className="relative mt-1">
            {field.id === "senha-atual" ? (
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            ) : (
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
            <input
              id={field.id}
              type={visible ? "text" : "password"}
              value={field.value}
              onChange={(event) => field.set(event.target.value)}
              autoComplete={field.auto}
              className={fieldClass}
            />
          </div>
          {field.id === "senha-nova" && strength ? (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${strength.tone} ${strength.width}`} />
              </div>
              <span className="text-xs font-semibold text-slate-600">{strength.label}</span>
            </div>
          ) : null}
        </div>
      ))}

      <p className="text-xs leading-5 text-slate-500">
        Use pelo menos {MIN_LENGTH} caracteres. O ideal são 12 ou mais, misturando letras maiúsculas,
        minúsculas, números e símbolos, e sem repetir senhas de outros sites.
      </p>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p> : null}
      {success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{success}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || !current || !next || !confirmation}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Trocando..." : "Trocar senha"}
        </button>
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {visible ? "Ocultar senhas" : "Mostrar senhas"}
        </button>
      </div>
    </form>
  );
}
