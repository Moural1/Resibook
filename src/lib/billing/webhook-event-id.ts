export function buildWebhookEventId(input: {
  bodyEventId?: string | number | null;
  requestId?: string | null;
  notificationType: string;
  dataId: string;
  action?: string | null;
}) {
  if (input.bodyEventId !== undefined && input.bodyEventId !== null) {
    return `event:${String(input.bodyEventId).slice(0, 220)}`;
  }
  if (input.requestId) return `request:${input.requestId.slice(0, 218)}`;
  return `fallback:${input.notificationType}:${input.dataId}:${input.action || "unknown"}`.slice(
    0,
    240
  );
}
