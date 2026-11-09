"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import {
  bmi,
  formatDateFr,
  heightVelocity,
  predictedAphpv,
} from "@/lib/growth";

export default function MensurationsPage() {
  const { athletes, measurements, addMeasurement } = useStore();
  const [athleteId, setAthleteId] = useState("");
  const [date, setDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sittingHeight, setSittingHeight] = useState("");
  const [error, setError] = useState("");

  const selectedId = athleteId || athletes[0]?.id || "";
  const selected = athletes.find((a) => a.id === selectedId);

  const athleteMeasurements = useMemo(
    () =>
      measurements
        .filter((m) => m.athleteId === selectedId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [measurements, selectedId],
  );

  const latest = athleteMeasurements[0];
  const prediction = selected && latest ? predictedAphpv(selected, latest) : null;
  const velocity = selected
    ? heightVelocity(measurements.filter((m) => m.athleteId === selectedId))
    : [];

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const s = parseFloat(sittingHeight);
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    if (!selectedId || !date || Number.isNaN(h) || Number.isNaN(w) || Number.isNaN(s)) {
      setError("Tous les champs sont obligatoires (valeurs numériques).");
      return;
    }
    if (s >= h) {
      setError("La taille assise doit être inférieure à la taille debout.");
      return;
    }
    addMeasurement({
      athleteId: selectedId,
      date: effectiveDate,
      heightCm: h,
      weightKg: w,
      sittingHeightCm: s,
    });
    setHeight("");
    setWeight("");
    setSittingHeight("");
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mensurations &amp; croissance</h1>
        <p className="mt-1 text-zinc-600">
          Taille, poids et taille assise pour suivre la croissance et estimer le
          pic de croissance (PHV, méthode de Mirwald 2002).
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

      {prediction && latest && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Âge à la mesure</p>
            <p className="text-xl font-bold">{prediction.age.toFixed(1)} ans</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Décalage maturatif (PHV)</p>
            <p className="text-xl font-bold">
              {prediction.offset.toFixed(2)} an{prediction.offset > 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Âge prédit au pic de croissance</p>
            <p className="text-xl font-bold">{prediction.aphv.toFixed(1)} ans</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">IMC</p>
            <p className="text-xl font-bold">{bmi(latest.weightKg, latest.heightCm).toFixed(1)}</p>
          </div>
        </div>
      )}

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
          <label className="mb-1 block text-sm font-medium">Taille (cm)</label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="152.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Poids (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="42.0"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Taille assise (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={sittingHeight}
            onChange={(e) => setSittingHeight(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="79.0"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Enregistrer
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Taille (cm)</th>
              <th className="px-4 py-3 font-medium">Poids (kg)</th>
              <th className="px-4 py-3 font-medium">Taille assise (cm)</th>
              <th className="px-4 py-3 font-medium">IMC</th>
              <th className="px-4 py-3 font-medium">Âge prédit au PHV</th>
              <th className="px-4 py-3 font-medium">Vitesse de croissance</th>
            </tr>
          </thead>
          <tbody>
            {athleteMeasurements.map((m) => {
              const pred = selected ? predictedAphpv(selected, m) : null;
              const vel = velocity.find((v) => v.date === m.date);
              return (
                <tr key={m.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">{formatDateFr(m.date)}</td>
                  <td className="px-4 py-3">{m.heightCm.toFixed(1)}</td>
                  <td className="px-4 py-3">{m.weightKg.toFixed(1)}</td>
                  <td className="px-4 py-3">{m.sittingHeightCm.toFixed(1)}</td>
                  <td className="px-4 py-3">{bmi(m.weightKg, m.heightCm).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    {pred ? `${pred.aphv.toFixed(1)} ans` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {vel ? `${vel.cmPerYear.toFixed(1)} cm/an` : "—"}
                  </td>
                </tr>
              );
            })}
            {athleteMeasurements.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                  Aucune mensuration enregistrée pour cet athlète.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
