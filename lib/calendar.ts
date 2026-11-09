export const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function isoOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function weekStartOf(dateIso: string): string {
  const d = new Date(dateIso);
  const monday = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() - ((d.getDay() + 6) % 7),
  );
  return isoOf(monday);
}

export function weekNumber(dateIso: string): number {
  const d = new Date(dateIso);
  const target = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return (
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000),
    )
  );
}

export function monthGrid(year: number, month: number): string[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: string[] = [];
  for (let i = 0; i < startOffset; i++) cells.push("");
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(isoOf(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push("");
  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function weekDaysOf(weekStartIso: string): string[] {
  const monday = new Date(weekStartIso);
  const cells: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i,
    );
    cells.push(isoOf(d));
  }
  return cells;
}
