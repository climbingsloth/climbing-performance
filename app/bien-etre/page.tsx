"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";

const fields = [
  { key: "sleep", label: "Sommeil" },
  { key: "stress", label: "Stress" },
  { key: "motivation", label: "Motivation" },
  { key: "fatigue", label: "Fatigue" },
  { key: "soreness", label: "Courbatures" },
] as const;

type FieldKey = (typeof fields)[number]["key"];

export default function BienEtrePage() {
  const { athletes, wellness, addWellness } = useStore();
  const [athleteId, setAthleteId] = useState("");
  const [date, setDate] = useState("");
  const [scores, setScores] = useState<Record<FieldKey, number>>({
    sleep: 7,
    stress: 3,
    motivation: 7,
    fatigue: 3,
    soreness: 2,
  });
  const [error, setError] = useState("");

  const selectedId = athleteId || athletes[0]?.id || "";

  const entries = useMemo(
    () =>
      wellness
        .filter((w) => w.athleteId === selectedId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [wellness, selectedId],
  );

  const weekAverage = useMemo(() => {
    const last7 = entries.slice(0, 7);
    if (last7.length === 0) return null;
    const avg = (key: FieldKey) =>
      last7.reduce((sum, e) => sum + e[key], 0) / last7.length;
    return {
      count: last7.length,
      sleep: avg("sleep"),
      stress: avg("stress"),
      motivation: avg("motivation"),
      fatigue: avg("fatigue"),
      soreness: avg("soreness"),
    };
  }, [entries]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    if (!selectedId) {
      setError("Ajoutez d'abord un athlète dans l'onglet Athlètes.");
      return;
    }
    if (!date) {
      setError("Choisissez une date.");
      return;
    }
    const duplicate = wellness.some(
      (w) => w.athleteId === selectedId && w.date === effectiveDate,
    );
    if (duplicate) {
      setError("Une saisie existe déjà pour cet athlète à cette date.");
      return;
    }
    addWellness({ athleteId: selectedId, date: effectiveDate, ...scores });
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bien-être quotidien</h1>
        <p className="mt-1 text-zinc-600">
          Note de 0 à 10 chaque jour : sommeil, stress, motivation, fatigue et
          courbatures.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Athlète</label>
          <select
            value={selectedId}
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

      {weekAverage && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {fields.map((f) => (
            <div
              key={f.key}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-zinc-500">Moyenne 7 jours — {f.label}</p>
              <p className="text-xl font-bold">
                {weekAverage[f.key].toFixed(1)}/10
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 flex justify-between text-sm font-medium">
                <span>{f.label}</span>
                <span className="font-bold">{scores[f.key]}/10</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={scores[f.key]}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [f.key]: Number(e.target.value) }))
                }
                className="w-full accent-brand"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Enregistrer la journée
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              {fields.map((f) => (
                <th key={f.key} className="px-4 py-3 font-medium">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((w) => {
              const mean =
                (w.sleep + w.stress + w.motivation + w.fatigue + w.soreness) / 5;
              return (
                <tr key={w.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">{formatDateFr(w.date)}</td>
                  {fields.map((f) => (
                    <td key={f.key} className="px-4 py-3">
                      {w[f.key]}/10
                    </td>
                  ))}
                  <td className="px-4 py-3 font-medium">{mean.toFixed(1)}</td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  Aucune saisie pour cet athlète.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
