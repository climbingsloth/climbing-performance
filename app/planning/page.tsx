"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";
import type { TrainingSession } from "@/lib/types";

function isoWeek(dateIso: string): { year: number; week: number } {
  const d = new Date(dateIso);
  const target = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000),
    );
  return { year: target.getUTCFullYear(), week };
}

function monthLabel(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function weekLabel(dateIso: string): string {
  const { year, week } = isoWeek(dateIso);
  return `Semaine ${week} — ${year}`;
}

export default function PlanningPage() {
  const { athletes, trainingSessions, addTrainingSession } = useStore();
  const [athleteId, setAthleteId] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const selectedAthleteId = athleteId || athletes[0]?.id || "";

  const sessions = useMemo(
    () =>
      trainingSessions
        .filter((s) => s.athleteId === selectedAthleteId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [trainingSessions, selectedAthleteId],
  );

  const groupedByWeek = useMemo(() => {
    const map = new Map<string, TrainingSession[]>();
    for (const s of sessions) {
      const key = weekLabel(s.date);
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const { year, week } = isoWeek(todayIso);
    const currentMonth = todayIso.slice(0, 7);
    const weekSessions = sessions.filter((s) => {
      const w = isoWeek(s.date);
      return w.year === year && w.week === week;
    });
    const monthSessions = sessions.filter((s) => s.date.slice(0, 7) === currentMonth);
    return {
      weekCount: weekSessions.length,
      weekMinutes: weekSessions.reduce((sum, s) => sum + s.durationMin, 0),
      monthCount: monthSessions.length,
      monthMinutes: monthSessions.reduce((sum, s) => sum + s.durationMin, 0),
    };
  }, [sessions]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const d = parseInt(duration, 10);
    if (!selectedAthleteId || !date || !title.trim() || Number.isNaN(d) || d <= 0) {
      setError("Date, titre et durée (en minutes, > 0) sont obligatoires.");
      return;
    }
    addTrainingSession({
      athleteId: selectedAthleteId,
      date,
      title: title.trim(),
      durationMin: d,
      notes: notes.trim(),
    });
    setTitle("");
    setDuration("");
    setNotes("");
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Planning d&apos;entraînement</h1>
        <p className="mt-1 text-zinc-600">
          Planifiez les séances de chaque athlète, regroupées par semaine et
          par mois.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Athlète</label>
          <select
            value={selectedAthleteId}
            onChange={(e) => setAthleteId(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {athletes.length === 0 && <option value="">Aucun athlète</option>}
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Séances cette semaine</p>
          <p className="text-xl font-bold">{stats.weekCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Temps cette semaine</p>
          <p className="text-xl font-bold">{stats.weekMinutes} min</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Séances ce mois-ci</p>
          <p className="text-xl font-bold">{stats.monthCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Temps ce mois-ci</p>
          <p className="text-xl font-bold">{stats.monthMinutes} min</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Séance</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bloc — force doigts"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Durée (min)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="90"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Détail de la séance..."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Ajouter
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>
        )}
      </form>

      <div className="space-y-4">
        {groupedByWeek.map(([week, weekSessions]) => (
          <div
            key={week}
            className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <h2 className="border-b border-zinc-200 px-4 py-3 font-semibold">
              {week}{" "}
              <span className="text-sm font-normal capitalize text-zinc-500">
                ({monthLabel(weekSessions[0].date)})
              </span>
            </h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Séance</th>
                  <th className="px-4 py-2 font-medium">Durée</th>
                  <th className="px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {weekSessions.map((s) => (
                  <tr key={s.id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">{formatDateFr(s.date)}</td>
                    <td className="px-4 py-2 font-medium">{s.title}</td>
                    <td className="px-4 py-2">{s.durationMin} min</td>
                    <td className="px-4 py-2 text-zinc-600">{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {groupedByWeek.length === 0 && (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-500 shadow-sm">
            Aucune séance planifiée pour cet athlète.
          </p>
        )}
      </div>
    </div>
  );
}
