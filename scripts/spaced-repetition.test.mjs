import assert from "node:assert/strict";
import test from "node:test";

import {
  addDays,
  buildDailyQueue,
  intervalLabel,
  nextSchedule,
  studyStreak,
} from "../src/lib/spaced-repetition.ts";

const TODAY = "2026-10-01";

test("intervalos crescem com acertos e voltam a 1 dia no erro", () => {
  const first = nextSchedule("c1", undefined, "good", TODAY);
  assert.equal(first.interval_days, 1);
  assert.equal(first.due_on, "2026-10-02");
  const second = nextSchedule("c1", first, "good", first.due_on);
  assert.equal(second.interval_days, 3);
  const third = nextSchedule("c1", second, "good", second.due_on);
  assert.equal(third.interval_days, 8);
  const lapse = nextSchedule("c1", third, "again", third.due_on);
  assert.equal(lapse.interval_days, 1);
  assert.equal(lapse.repetitions, 0);
  assert.equal(lapse.lapses, 1);
  assert.ok(lapse.ease < third.ease);
});

test("fácil adia mais que bom e a facilidade nunca cai abaixo de 1,3", () => {
  const good = nextSchedule("c", undefined, "good", TODAY);
  const easy = nextSchedule("c", undefined, "easy", TODAY);
  assert.ok(easy.interval_days > good.interval_days);
  let schedule;
  for (let index = 0; index < 20; index += 1) schedule = nextSchedule("c", schedule, "again", TODAY);
  assert.equal(schedule.ease, 1.3);
});

test("fila do dia traz vencidos primeiro e respeita o limite de novos", () => {
  const schedules = new Map([
    ["a", { flashcard_id: "a", ease: 2.5, interval_days: 3, repetitions: 2, lapses: 0, due_on: "2026-09-30" }],
    ["b", { flashcard_id: "b", ease: 2.5, interval_days: 3, repetitions: 2, lapses: 0, due_on: "2026-10-05" }],
  ]);
  const ids = ["a", "b", ...Array.from({ length: 30 }, (_, index) => `n${index}`)];
  const { due, fresh, queue } = buildDailyQueue(ids, schedules, TODAY, 10);
  assert.deepEqual(due, ["a"]);
  assert.equal(fresh.length, 5);
  assert.equal(queue[0], "a");
});

test("sequência conta dias seguidos até hoje ou ontem", () => {
  assert.equal(studyStreak(["2026-09-29", "2026-09-30", TODAY], TODAY), 3);
  assert.equal(studyStreak(["2026-09-29", "2026-09-30"], TODAY), 2);
  assert.equal(studyStreak(["2026-09-28"], TODAY), 0);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(intervalLabel(1), "amanhã");
  assert.equal(intervalLabel(45), "2 meses");
});
