/** Локальная дата YYYY-MM-DD (общая для сервера и тестов). */
export function localDate(ts: number = Date.now()): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Чистая логика стрика по набору дат активности — тестируется без БД.
 * @param perDayUnique отсортированный массив дат YYYY-MM-DD с активностью
 * @param todayKey дата «сегодня»
 */
export function computeStreakFromDates(perDayUnique: string[], todayKey: string): { current: number; longest: number } {
  const dates = [...new Set(perDayUnique)].sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of dates) {
    const ts = new Date(d + "T00:00:00").getTime();
    run = prev !== null && ts - prev === DAY_MS ? run + 1 : 1;
    prev = ts;
    longest = Math.max(longest, run);
  }
  const todayTs = new Date(todayKey + "T00:00:00").getTime();
  const yesterdayKey = new Date(todayTs - DAY_MS).toISOString().slice(0, 10);
  // NB: toISOString — UTC; для локальных дат ниже считаем по ms-арифметике
  const yKey = localDateFor(todayTs - DAY_MS);
  void yesterdayKey;

  let current = 0;
  let cursor = dates.includes(todayKey) ? todayKey : dates.includes(yKey) ? yKey : null;
  while (cursor && dates.includes(cursor)) {
    current += 1;
    const ts = new Date(cursor + "T00:00:00").getTime();
    cursor = localDateFor(ts - DAY_MS);
  }
  return { current, longest: Math.max(longest, current) };
}

function localDateFor(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
