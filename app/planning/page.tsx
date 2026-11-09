"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";
import type { Planning, SeasonResult, TrainingSession } from "@/lib/types";

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface DayEvents {
  sessions: TrainingSession[];
  comps: SeasonResult[];
  objectives: Planning[];
}

function buildEventsByDate(
  trainingSessions: TrainingSession[],
  seasonResults: SeasonResult[],
  plannings: Planning[],
  athleteId: string,
  planningId: string,
): Map<string, DayEvents> {
  const map = new Map<string, DayEvents>();
  const get = (date: string): DayEvents => {
    const list = map.get(date) ?? { sessions: [], comps: [], objectives: [] };
    map.set(date, list);
    return list;
  };
  for (const s of trainingSessions) {
    if (s.athleteId !== athleteId) continue;
    if (planningId && s.planningId && s.planningId !== planningId) continue;
    get(s.date).sessions.push(s);
  }
  for (const c of seasonResults) {
    if (c.athleteId === athleteId) get(c.date).comps.push(c);
  }
  for (const p of plannings) {
    get(p.objectiveDate).objectives.push(p);
  }
  return map;
}

function monthGrid(year: number, month: number): string[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: string[] = [];
  for (let i = 0; i < startOffset; i++) cells.push("");
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push("");
  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function PlanningPage() {
  const {
    athletes,
    plannings,
    trainingSessions,
    seasonResults,
    addPlanning,
    addTrainingSession,
  } = useStore();

  const [athleteId, setAthleteId] = useState("");
  const [planningId, setPlanningId] = useState("");
  const todayIso = new Date().toISOString().slice(0, 10);
  const [viewDate, setViewDate] = useState(todayIso);
  const [objTitle, setObjTitle] = useState("");
  const [objDate, setObjDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sDate, setSDate] = useState("");
  const [sTitle, setSTitle] = useState("");
  const [sDuration, setSDuration] = useState("");
  const [sNotes, setSNotes] = useState("");
  const [error, setError] = useState("");

  const selectedAthleteId = athleteId || athletes[0]?.id || "";
  const athletePlannings = useMemo(
    () =>
      plannings
        .filter((p) => p.athleteId === selectedAthleteId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [plannings, selectedAthleteId],
  );
  const selectedPlanningId =
    planningId && athletePlannings.some((p) => p.id === planningId)
      ? planningId
      : athletePlannings[0]?.id ?? "";

  const grid = useMemo(() => {
    const v = new Date(viewDate);
    return monthGrid(v.getFullYear(), v.getMonth());
  }, [viewDate]);

  const eventsByDate = useMemo(
    () =>
      buildEventsByDate(
        trainingSessions,
        seasonResults,
        athletePlannings,
        selectedAthleteId,
        selectedPlanningId,
      ),
    [trainingSessions, seasonResults, athletePlannings, selectedAthleteId, selectedPlanningId],
  );

  function shiftMonth(delta: number) {
    const v = new Date(viewDate);
    const d = new Date(v.getFullYear(), v.getMonth() + delta, 1);
    setViewDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }

  function onAddPlanning(e: FormEvent) {
    e.preventDefault();
    if (!selectedAthleteId || !objTitle.trim() || !objDate || !startDate || !endDate) {
      setError("Objectif, date d'objectif, début et fin sont obligatoires.");
      return;
    }
    if (endDate < startDate || objDate < startDate || objDate > endDate) {
      setError("Les dates doivent être cohérentes : début ≤ objectif ≤ fin.");
      return;
    }
    addPlanning({
      athleteId: selectedAthleteId,
      objective: objTitle.trim(),
      objectiveDate: objDate,
      startDate,
      endDate,
    });
    setObjTitle("");
    setObjDate("");
    setStartDate("");
    setEndDate("");
    setError("");
  }

  function onAddSession(e: FormEvent) {
    e.preventDefault();
    const d = parseInt(sDuration, 10);
    if (!selectedAthleteId || !sDate || !sTitle.trim() || Number.isNaN(d) || d <= 0) {
      setError("Date, titre et durée (en minutes, > 0) sont obligatoires.");
      return;
    }
    addTrainingSession({
      athleteId: selectedAthleteId,
      planningId: selectedPlanningId || null,
      date: sDate,
      title: sTitle.trim(),
      durationMin: d,
      notes: sNotes.trim(),
    });
    setSTitle("");
    setSDuration("");
    setSNotes("");
    setError("");
  }

  const monthName = new Date(viewDate).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Planning d&apos;entraînement</h1>
        <p className="mt-1 text-zinc-600">
          Chaque planification est liée à un objectif et à un athlète, avec des
          dates configurables. Vue calendrier des séances et compétitions.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Athlète</label>
          <select
            value={selectedAthleteId}
            onChange={(e) => {
              setAthleteId(e.target.value);
              setPlanningId("");
            }}
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
        <div>
          <label className="mb-1 block text-sm font-medium">Planification</label>
          <select
            value={selectedPlanningId}
            onChange={(e) => setPlanningId(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {athletePlannings.length === 0 && (
              <option value="">Aucune planification</option>
            )}
            {athletePlannings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.objective} ({formatDateFr(p.startDate)} →{" "}
                {formatDateFr(p.endDate)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={onAddPlanning}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold">Nouvelle planification</h2>
          <input
            value={objTitle}
            onChange={(e) => setObjTitle(e.target.value)}
            placeholder="Objectif (ex. Coupe régionale U17)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date de l&apos;objectif
            </label>
            <input
              type="date"
              value={objDate}
              onChange={(e) => setObjDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Créer la planification
          </button>
        </form>

        <form
          onSubmit={onAddSession}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2"
        >
          <h2 className="font-semibold">Nouvelle séance</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                value={sDate}
                onChange={(e) => setSDate(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Séance</label>
              <input
                value={sTitle}
                onChange={(e) => setSTitle(e.target.value)}
                placeholder="Bloc — force doigts"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Durée (min)</label>
              <input
                type="number"
                min={1}
                value={sDuration}
                onChange={(e) => setSDuration(e.target.value)}
                placeholder="90"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <input
                value={sNotes}
                onChange={(e) => setSNotes(e.target.value)}
                placeholder="Détail..."
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Ajouter la séance
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => shiftMonth(-1)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            ← Mois précédent
          </button>
          <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewDate(todayIso)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => shiftMonth(1)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              Mois suivant →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200">
          {weekDays.map((d) => (
            <div
              key={d}
              className="bg-zinc-50 px-2 py-2 text-center text-xs font-semibold text-zinc-500"
            >
              {d}
            </div>
          ))}
          {grid.flat().map((cell, i) => {
            const events = cell ? eventsByDate.get(cell) : undefined;
            const isToday = cell === todayIso;
            return (
              <div
                key={i}
                className={`min-h-24 bg-white p-1.5 ${
                  cell ? "" : "bg-zinc-50"
                } ${isToday ? "ring-2 ring-inset ring-zinc-900" : ""}`}
              >
                {cell && (
                  <p
                    className={`text-xs font-semibold ${
                      isToday ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {Number(cell.slice(8, 10))}
                  </p>
                )}
                <div className="mt-1 space-y-1">
                  {events?.objectives.map((p) => (
                    <p
                      key={p.id}
                      className="truncate rounded bg-purple-100 px-1 py-0.5 text-[11px] font-medium text-purple-900"
                      title={`Objectif : ${p.objective}`}
                    >
                      🎯 {p.objective}
                    </p>
                  ))}
                  {events?.comps.map((c) => (
                    <p
                      key={c.id}
                      className="truncate rounded bg-red-100 px-1 py-0.5 text-[11px] font-medium text-red-900"
                      title={c.competition}
                    >
                      🏆 {c.competition}
                    </p>
                  ))}
                  {events?.sessions.map((s) => (
                    <p
                      key={s.id}
                      className="truncate rounded bg-zinc-900 px-1 py-0.5 text-[11px] text-white"
                      title={`${s.title} — ${s.durationMin} min`}
                    >
                      {s.title} ({s.durationMin} min)
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600">
          <span>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-zinc-900 align-middle" />
            Séance d&apos;entraînement
          </span>
          <span>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-red-100 align-middle" />
            Compétition
          </span>
          <span>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-purple-100 align-middle" />
            Date d&apos;objectif
          </span>
        </div>
      </div>
    </div>
  );
}
