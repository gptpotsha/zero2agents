/**
 * Активность за последние N недель: сетка квадратов в стиле GitHub heatmap.
 * Серверный компонент — принимает Map<дата, число уроков>.
 */
const LEVEL_CLASSES = [
  "bg-muted", // 0
  "bg-primary/25", // 1-2
  "bg-primary/45", // 3-4
  "bg-primary/70", // 5-6
  "bg-primary", // 7+
];

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function ActivityHeatmap({ activeDates, weeks = 13 }: { activeDates: Map<string, number>; weeks?: number }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Выравниваем на начало недели (Пн)
  const dow = (today.getDay() + 6) % 7; // 0=Пн
  const end = today.getTime();
  const start = end - (weeks * 7 - 1 - (6 - dow)) * DAY_MS;

  const columns: { date: string; count: number; future: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: { date: string; count: number; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const ts = start + (w * 7 + d) * DAY_MS;
      const key = toDate(ts);
      col.push({ date: key, count: activeDates.get(key) ?? 0, future: ts > end });
    }
    columns.push(col);
  }

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} урок(ов)`}
                aria-hidden={cell.future}
                className={`h-[10px] w-[10px] rounded-[2px] ${
                  cell.future ? "bg-transparent" : LEVEL_CLASSES[levelFor(cell.count)]
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>меньше</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span>больше</span>
      </div>
    </div>
  );
}

function toDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
