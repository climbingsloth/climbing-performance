"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";

function currentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export default function ResultatsPage() {
  const { athletes, seasonResults, addSeasonResult } = useStore();
  const [athleteId, setAthleteId] = useState("");
  const [season, setSeason] = useState(currentSeason());
  const [competition, setCompetition] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const selectedAthleteId = athleteId || athletes[0]?.id || "";

  const grouped = useMemo(() => {
    const bySeason = new Map<string, typeof seasonResults>();
    for (const r of seasonResults.filter(
      (r) => r.athleteId === selectedAthleteId,
    )) {
      const list = bySeason.get(r.season) ?? [];
      list.push(r);
      bySeason.set(r.season, list);
    }
    return [...bySeason.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [seasonResults, selectedAthleteId]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAthleteId || !season.trim() || !competition.trim() || !date || !result.trim()) {
      setError("Saison, compétition, date et résultat sont obligatoires.");
      return;
    }
    addSeasonResult({
      athleteId: selectedAthleteId,
      season: season.trim(),
      competition: competition.trim(),
      date,
      result: result.trim(),
      notes: notes.trim(),
    });
    setCompetition("");
    setResult("");
    setNotes("");
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Résultats par saison</h1>
        <p className="mt-1 text-zinc-600">
          Compétitions et performances de chaque athlète, saison par saison.
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

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Saison</label>
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="2025-2026"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Compétition</label>
          <input
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            placeholder="Championnat régional jeunes"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
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
          <label className="mb-1 block text-sm font-medium">Résultat</label>
          <input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="1re place, voie 7a+..."
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Observations du coach..."
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Ajouter le résultat
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{error}</p>
        )}
      </form>

      <div className="space-y-4">
        {grouped.map(([seasonLabel, results]) => (
          <div
            key={seasonLabel}
            className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <h2 className="border-b border-zinc-200 px-4 py-3 font-semibold">
              Saison {seasonLabel}{" "}
              <span className="text-sm font-normal text-zinc-500">
                ({results.length} résultat{results.length > 1 ? "s" : ""})
              </span>
            </h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Compétition</th>
                  <th className="px-4 py-2 font-medium">Résultat</th>
                  <th className="px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {results
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((r) => (
                    <tr key={r.id} className="border-t border-zinc-100">
                      <td className="px-4 py-2">{formatDateFr(r.date)}</td>
                      <td className="px-4 py-2">{r.competition}</td>
                      <td className="px-4 py-2 font-medium">{r.result}</td>
                      <td className="px-4 py-2 text-zinc-600">{r.notes || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-500 shadow-sm">
            Aucun résultat enregistré pour cet athlète.
          </p>
        )}
      </div>
    </div>
  );
}
