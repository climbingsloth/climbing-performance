"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";
import { SESSION_CATEGORIES, categoryColor } from "@/lib/categories";

function isoOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekStartOf(dateIso: string): string {
  const d = new Date(dateIso);
  const monday = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() - ((d.getDay() + 6) % 7),
  );
  return isoOf(monday);
}

function weekNumber(dateIso: string): number {
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

export default function PlanningDetailClient({
  planningId,
}: {
  planningId: string;
}) {
  const { athletes, plannings, trainingSessions, seasonResults } = useStore();

  const planning = plannings.find((p) => p.id === planningId);
  const athlete = athletes.find((a) => a.id === planning?.athleteId);

  const weeks = useMemo(() => {
    if (!planning) return [];
    const list: string[] = [];
    let cursor = weekStartOf(planning.startDate);
    const end = weekStartOf(planning.endDate);
    let guard = 0;
    while (cursor <= end && guard < 60) {
      list.push(cursor);
      const d = new Date(cursor);
      cursor = isoOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
      guard++;
    }
    return list;
  }, [planning]);

  const sessions = useMemo(
    () =>
      trainingSessions.filter(
        (s) => s.planningId === planningId && s.athleteId === planning?.athleteId,
      ),
    [trainingSessions, planningId, planning?.athleteId],
  );

  const comps = useMemo(
    () =>
      planning
        ? seasonResults.filter(
            (c) =>
              c.athleteId === planning.athleteId &&
              c.date >= planning.startDate &&
              c.date <= planning.endDate,
          )
        : [],
    [seasonResults, planning],
  );

  if (!planning) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-600">Planification introuvable.</p>
        <Link href="/planning" className="text-sm font-medium underline">
          ← Retour au planning
        </Link>
      </div>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const isPast = planning.objectiveDate < todayIso;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/planning" className="text-sm font-medium underline">
          ← Retour au planning
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{planning.objective}</h1>
        <p className="mt-1 text-zinc-600">
          {athlete
            ? `${athlete.firstName} ${athlete.lastName} — `
            : ""}
          du {formatDateFr(planning.startDate)} au{" "}
          {formatDateFr(planning.endDate)} · objectif le{" "}
          {formatDateFr(planning.objectiveDate)}
          {isPast && (
            <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
              objectif passé
            </span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                Catégorie
              </th>
              {weeks.map((w) => (
                <th
                  key={w}
                  className={`px-2 py-2 text-center text-xs font-semibold ${
                    weekStartOf(planning.objectiveDate) === w
                      ? "text-purple-700"
                      : "text-zinc-500"
                  }`}
                >
                  S{weekNumber(w)}
                  <span className="block font-normal text-zinc-400">
                    {formatDateFr(w)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SESSION_CATEGORIES.map((cat) => (
              <tr key={cat} className="border-b border-zinc-100 last:border-0">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 text-xs font-medium">
                  <span
                    className={`mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle ${categoryColor(cat)}`}
                  />
                  {cat}
                </td>
                {weeks.map((w) => {
                  const cellSessions = sessions.filter(
                    (s) => s.category === cat && weekStartOf(s.date) === w,
                  );
                  const cellComps = comps.filter(
                    (c) => weekStartOf(c.date) === w,
                  );
                  return (
                    <td key={w} className="px-1 py-1 align-top">
                      <div className="space-y-1">
                        {cellSessions.map((s) => (
                          <p
                            key={s.id}
                            className={`rounded px-1 py-0.5 text-[11px] text-white ${categoryColor(cat)}`}
                            title={`${s.title} — ${s.durationMin} min${s.notes ? ` — ${s.notes}` : ""}`}
                          >
                            {s.title} ({s.durationMin}′)
                          </p>
                        ))}
                        {cellComps.map((c) => (
                          <p
                            key={c.id}
                            className="rounded bg-red-500 px-1 py-0.5 text-[11px] font-medium text-white"
                            title={c.competition}
                          >
                            🏆 {c.competition}
                          </p>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-500">
        Chaque colonne = une semaine de la planification (S = numéro de
        semaine ISO). La colonne violette correspond à la semaine de
        l&apos;objectif.
      </p>
    </div>
  );
}
