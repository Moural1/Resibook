export type ToastVariant = "success" | "error" | "info";

export type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

const TOAST_EVENT = "resibook-toast";

export function showToast(payload: ToastPayload) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: payload }));
}

export function subscribeToast(
  callback: (payload: ToastPayload) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ToastPayload>;
    callback(customEvent.detail);
  };

  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}