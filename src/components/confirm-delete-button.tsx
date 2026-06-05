"use client";

type Props = {
  label?: string;
  confirmText?: string;
  className?: string;
};

export default function ConfirmDeleteButton({
  label = "Apagar",
  confirmText = "Tem certeza que deseja apagar?",
  className = "",
}: Props) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm(confirmText);
        if (!ok) e.preventDefault();
      }}
      className={
        className ||
        "rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
      }
    >
      {label}
    </button>
  );
}