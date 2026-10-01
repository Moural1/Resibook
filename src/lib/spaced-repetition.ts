/* Revisão espaçada dos flashcards (variação simplificada do SM-2).
   Datas são dias locais no formato AAAA-MM-DD. */

export type ReviewGrade = "again" | "good" | "easy";

export type CardSchedule = {
  flashcard_id: string;
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_on: string;
};

export const NEW_CARDS_PER_DAY = 15;
const MIN_EASE = 1.3;
const MAX_INTERVAL = 365;

export function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(day: string, amount: number) {
  const [year, month, date] = day.split("-").map(Number);
  return localDay(new Date(year, month - 1, date + amount));
}

export function nextSchedule(
  flashcardId: string,
  previous: CardSchedule | undefined,
  grade: ReviewGrade,
  today: string
): CardSchedule {
  const ease = previous?.ease ?? 2.5;
  const interval = previous?.interval_days ?? 0;
  const repetitions = previous?.repetitions ?? 0;
  const lapses = previous?.lapses ?? 0;

  if (grade === "again") {
    return {
      flashcard_id: flashcardId,
      ease: Math.max(MIN_EASE, round2(ease - 0.2)),
      interval_days: 1,
      repetitions: 0,
      lapses: lapses + 1,
      due_on: addDays(today, 1),
    };
  }

  const nextRepetitions = repetitions + 1;
  let nextInterval: number;
  let nextEase = ease;

  if (grade === "good") {
    nextInterval = nextRepetitions === 1 ? 1 : nextRepetitions === 2 ? 3 : Math.round(Math.max(interval, 1) * ease);
  } else {
    nextEase = round2(ease + 0.15);
    nextInterval = nextRepetitions === 1 ? 4 : Math.round(Math.max(interval, 1) * ease * 1.3);
  }

  nextInterval = Math.min(MAX_INTERVAL, Math.max(nextInterval, grade === "easy" ? interval + 1 : nextInterval));

  return {
    flashcard_id: flashcardId,
    ease: nextEase,
    interval_days: nextInterval,
    repetitions: nextRepetitions,
    lapses,
    due_on: addDays(today, nextInterval),
  };
}

/* Rótulo curto do próximo intervalo, para os botões de resposta. */
export function intervalLabel(days: number) {
  if (days <= 1) return "amanhã";
  if (days < 30) return `${days} dias`;
  const months = Math.round(days / 30);
  return months <= 1 ? "1 mês" : `${months} meses`;
}

export function buildDailyQueue(
  cardIds: string[],
  schedules: Map<string, CardSchedule>,
  today: string,
  newStudiedToday: number
) {
  const due = cardIds
    .filter((id) => {
      const schedule = schedules.get(id);
      return schedule && schedule.due_on <= today;
    })
    .sort((a, b) => schedules.get(a)!.due_on.localeCompare(schedules.get(b)!.due_on));
  const newLimit = Math.max(0, NEW_CARDS_PER_DAY - newStudiedToday);
  const fresh = cardIds.filter((id) => !schedules.has(id)).slice(0, newLimit);
  return { due, fresh, queue: [...due, ...fresh] };
}

/* Dias seguidos com revisão, terminando hoje ou ontem. */
export function studyStreak(days: string[], today: string) {
  const set = new Set(days);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
