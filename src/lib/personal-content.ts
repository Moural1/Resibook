export const PERSONAL_CONTENT_TYPES = [
  "prescription",
  "flashcard",
  "evolution_model",
  "topic_note",
  "conduct_note",
  "exam_model",
  "orientation",
] as const;

export type PersonalContentType = (typeof PERSONAL_CONTENT_TYPES)[number];

export const PERSONAL_CONTENT_LABELS: Record<PersonalContentType, string> = {
  prescription: "Prescrição",
  flashcard: "Flashcard",
  evolution_model: "Modelo de evolução",
  topic_note: "Nota de tópico",
  conduct_note: "Nota de conduta",
  exam_model: "Modelo de exame",
  orientation: "Orientação",
};

export type PersonalContentItem = {
  id: string;
  user_id: string;
  item_type: PersonalContentType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  source_global_id: string | null;
  is_favorite: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export function isPersonalContentType(
  value: unknown
): value is PersonalContentType {
  return (
    typeof value === "string" &&
    PERSONAL_CONTENT_TYPES.includes(value as PersonalContentType)
  );
}
