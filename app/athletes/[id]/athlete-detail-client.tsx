"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  ageLabel,
  bmi,
  formatDateFr,
  heightVelocity,
  predictedAphpv,
} from "@/lib/growth";
import {
  WEEK_DAYS,
  isoOf,
  monthGrid,
  weekDaysOf,
  weekNumber,
  weekStartOf,
} from "@/lib/calendar";
import { categoryColor } from "@/lib/categories";

const tabs = [
  { key: "calendrier", label: "Calendrier" },
  { key: "monitoring", label: "Monitoring" },
  { key: "mensurations", label: "Mensurations" },
  { key: "tests", label: "Tests" },
  { key: "resultats", label: "Résultats" },
  { key: "bien-etre", label: "Bien-être" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function AthleteDetailClient({
  athleteId,
}: {
  athleteId: string;
}) {
  const {
    athletes,
    measurements,
    wellness,
    testDefinitions,
    testResults,
    seasonResults,
    trainingSessions,
    plannings,
  } = useStore();
  const [tab, setTab] = useState<TabKey>("calendrier");
  const [planningId, setPlanningId] = useState("");

  const athlete = athletes.find((a) => a.id === athleteId);
  const todayIso = new Date().toISOString().slice(0, 10);

  const athletePlannings = useMemo(
    () => plannings.filter((p) => p.athleteId === athleteId),
    [plannings, athleteId],
  );
  const selectedPlanningId =
    planningId && athletePlannings.some((p) => p.id === planningId)
      ? planningId
      : athletePlannings[0]?.id ?? "";
  const planning = athletePlannings.find((p) => p.id === selectedPlanningId);

  const [weekStart, setWeekStart] = useState(() =>
    weekStartOf(todayIso),
  );
  const days = useMemo(() => weekDaysOf(weekStart), [weekStart]);
  const monthOfWeek = useMemo(() => {
    const d = new Date(weekStart);
    return monthGrid(d.getFullYear(), d.getMonth());
  }, [weekStart]);

  const athleteSessions = useMemo(
    () =>
      trainingSessions.filter(
        (s) =>
          s.athleteId === athleteId &&
          (!selectedPlanningId || s.planningId === selectedPlanningId || !s.planningId),
      ),
    [trainingSessions, athleteId, selectedPlanningId],
  );
  const athleteMeasurements = useMemo(
    () =>
      measurements
        .filter((m) => m.athleteId === athleteId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [measurements, athleteId],
  );
  const athleteWellness = useMemo(
    () =>
      wellness
        .filter((w) => w.athleteId === athleteId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [wellness, athleteId],
  );
  const athleteTests = useMemo(
    () => testResults.filter((r) => r.athleteId === athleteId),
    [testResults, athleteId],
  );
  const athleteResults = useMemo(
    () =>
      seasonResults
        .filter((r) => r.athleteId === athleteId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [seasonResults, athleteId],
  );
  const athleteComps = athleteResults;

  const latestMeasurement = athleteMeasurements[0];
  const prediction =
    athlete && latestMeasurement
      ? predictedAphpv(athlete, latestMeasurement)
      : null;
  const velocity = heightVelocity(
    measurements.filter((m) => m.athleteId === athleteId),
  );
  const wellnessAvg = useMemo(() => {
    const last7 = athleteWellness.slice(0, 7);
    if (!last7.length) return null;
    const avg = (k: "sleep" | "stress" | "motivation" | "fatigue" | "soreness") =>
      last7.reduce((s, w) => s + w[k], 0) / last7.length;
    return {
      sleep: avg("sleep"),
      stress: avg("stress"),
      motivation: avg("motivation"),
      fatigue: avg("fatigue"),
      soreness: avg("soreness"),
    };
  }, [athleteWellness]);

  const categories = useMemo(() => {
    const set = new Set(athleteSessions.map((s) => s.category));
    return [...set];
  }, [athleteSessions]);

  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      { sessions: typeof athleteSessions; objectives: typeof athletePlannings; comps: typeof athleteComps }
    >();
    const get = (date: string) => {
      const e = map.get(date) ?? { sessions: [], objectives: [], comps: [] };
      map.set(date, e);
      return e;
    };
    for (const s of athleteSessions) get(s.date).sessions.push(s);
    for (const p of athletePlannings) get(p.objectiveDate).objectives.push(p);
    for (const c of athleteComps) get(c.date).comps.push(c);
    return map;
  }, [athleteSessions, athletePlannings, athleteComps]);

  if (!athlete) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-600">Athlète introuvable.</p>
        <Link href="/athletes" className="text-sm font-medium text-brand underline">
          ← Retour aux athlètes
        </Link>
      </div>
    );
  }

  const weekEnd = isoOf(
    new Date(
      new Date(weekStart).getFullYear(),
      new Date(weekStart).getMonth(),
      new Date(weekStart).getDate() + 6,
    ),
  );
  const monthLabel = new Date(weekStart).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/athletes"
            className="text-sm font-medium text-brand underline"
          >
            ← Athlètes
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {athlete.firstName} {athlete.lastName}
          </h1>
          <p className="text-sm text-zinc-600">
            {ageLabel(athlete.birthDate, todayIso)} ·{" "}
            {athlete.sex === "M" ? "Garçon" : "Fille"} · {athlete.level}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "bg-brand text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calendrier" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Planification :</label>
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
                  {p.objective}
                </option>
              ))}
            </select>
            {planning && (
              <Link
                href={`/planning/${planning.id}`}
                className="text-sm font-medium text-brand underline"
              >
                Détail de la planification →
              </Link>
            )}
            <Link
              href={`/planning?athlete=${athleteId}`}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              + Gérer les planifications
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() =>
                  setWeekStart(
                    isoOf(
                      new Date(
                        new Date(weekStart).getFullYear(),
                        new Date(weekStart).getMonth(),
                        new Date(weekStart).getDate() - 7,
                      ),
                    ),
                  )
                }
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
              >
                ← Semaine précédente
              </button>
              <h2 className="text-sm font-semibold">
                S{weekNumber(weekStart)} · {formatDateFr(weekStart)} →{" "}
                {formatDateFr(weekEnd)}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setWeekStart(weekStartOf(todayIso))}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={() =>
                    setWeekStart(
                      isoOf(
                        new Date(
                          new Date(weekStart).getFullYear(),
                          new Date(weekStart).getMonth(),
                          new Date(weekStart).getDate() + 7,
                        ),
                      ),
                    )
                  }
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
                >
                  Semaine suivante →
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-2 py-2 text-xs font-semibold text-zinc-500">
                      Type
                    </th>
                    {days.map((d, i) => (
                      <th
                        key={d}
                        className={`px-2 py-2 text-center text-xs font-semibold ${
                          d === todayIso ? "text-brand" : "text-zinc-500"
                        }`}
                      >
                        {WEEK_DAYS[i]}
                        <span className="block text-sm">
                          {Number(d.slice(8, 10))}/{Number(d.slice(5, 7))}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-2 py-4 text-center text-zinc-500"
                      >
                        Aucune séance planifiée cette semaine.
                      </td>
                    </tr>
                  )}
                  {categories.map((cat) => (
                    <tr key={cat} className="border-b border-zinc-100">
                      <td className="px-2 py-1.5 text-xs font-medium">
                        <span
                          className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-middle ${categoryColor(cat)}`}
                        />
                        {cat}
                      </td>
                      {days.map((d) => {
                        const cells = athleteSessions.filter(
                          (s) => s.date === d && s.category === cat,
                        );
                        return (
                          <td key={d} className="px-1 py-1 align-top">
                            {cells.map((s) => (
                              <p
                                key={s.id}
                                className={`mb-1 truncate rounded px-1.5 py-1 text-[11px] text-white ${categoryColor(cat)}`}
                                title={`${s.title} — ${s.durationMin} min${s.notes ? ` — ${s.notes}` : ""}`}
                              >
                                {s.title} ({s.durationMin}′)
                              </p>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold capitalize">
              {monthLabel} — grandes dates
            </h2>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className="bg-zinc-50 px-2 py-1.5 text-center text-xs font-semibold text-zinc-500"
                >
                  {d}
                </div>
              ))}
              {monthOfWeek.flat().map((cell, i) => {
                const ev = cell ? eventsByDate.get(cell) : undefined;
                return (
                  <div
                    key={i}
                    className={`min-h-16 bg-white p-1 ${
                      cell ? "" : "bg-zinc-50"
                    } ${cell === todayIso ? "ring-2 ring-inset ring-brand" : ""}`}
                  >
                    {cell && (
                      <p className="text-xs font-semibold text-zinc-500">
                        {Number(cell.slice(8, 10))}
                      </p>
                    )}
                    <div className="mt-0.5 space-y-0.5">
                      {ev?.objectives.map((p) => (
                        <p
                          key={p.id}
                          className="truncate rounded bg-event-purple px-1 text-[10px] font-medium text-white"
                          title={`Objectif : ${p.objective}`}
                        >
                          🎯 {p.objective}
                        </p>
                      ))}
                      {ev?.comps.map((c) => (
                        <p
                          key={c.id}
                          className="truncate rounded bg-event-red px-1 text-[10px] font-medium text-white"
                          title={c.competition}
                        >
                          🏆 {c.competition}
                        </p>
                      ))}
                      {ev && ev.sessions.length > 0 && (
                        <p className="px-1 text-[10px] text-zinc-500">
                          {ev.sessions.length} séance
                          {ev.sessions.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "monitoring" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Âge prédit au pic de croissance</p>
            <p className="text-xl font-bold">
              {prediction ? `${prediction.aphv.toFixed(1)} ans` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Décalage maturatif</p>
            <p className="text-xl font-bold">
              {prediction ? `${prediction.offset.toFixed(2)} an(s)` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">IMC (dernière mesure)</p>
            <p className="text-xl font-bold">
              {latestMeasurement
                ? bmi(latestMeasurement.weightKg, latestMeasurement.heightCm).toFixed(1)
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Vitesse de croissance</p>
            <p className="text-xl font-bold">
              {velocity.length
                ? `${velocity[velocity.length - 1].cmPerYear.toFixed(1)} cm/an`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-4">
            <p className="mb-2 text-sm font-semibold">
              Bien-être — moyenne 7 jours
            </p>
            {wellnessAvg ? (
              <div className="flex flex-wrap gap-4 text-sm">
                <span>Sommeil {wellnessAvg.sleep.toFixed(1)}/10</span>
                <span>Stress {wellnessAvg.stress.toFixed(1)}/10</span>
                <span>Motivation {wellnessAvg.motivation.toFixed(1)}/10</span>
                <span>Fatigue {wellnessAvg.fatigue.toFixed(1)}/10</span>
                <span>Courbatures {wellnessAvg.soreness.toFixed(1)}/10</span>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Aucune donnée.</p>
            )}
          </div>
        </div>
      )}

      {tab === "mensurations" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/mensurations?athlete=${athleteId}`}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              + Saisir une mensuration
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Taille (cm)</th>
                <th className="px-4 py-2 font-medium">Poids (kg)</th>
                <th className="px-4 py-2 font-medium">Taille assise (cm)</th>
                <th className="px-4 py-2 font-medium">IMC</th>
                <th className="px-4 py-2 font-medium">Âge prédit au PHV</th>
              </tr>
            </thead>
            <tbody>
              {athleteMeasurements.map((m) => {
                const pred = predictedAphpv(athlete, m);
                return (
                  <tr key={m.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2">{formatDateFr(m.date)}</td>
                    <td className="px-4 py-2">{m.heightCm.toFixed(1)}</td>
                    <td className="px-4 py-2">{m.weightKg.toFixed(1)}</td>
                    <td className="px-4 py-2">{m.sittingHeightCm.toFixed(1)}</td>
                    <td className="px-4 py-2">{bmi(m.weightKg, m.heightCm).toFixed(1)}</td>
                    <td className="px-4 py-2">{pred ? `${pred.aphv.toFixed(1)} ans` : "—"}</td>
                  </tr>
                );
              })}
              {athleteMeasurements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    Aucune mensuration.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === "tests" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/tests?athlete=${athleteId}`}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              + Saisir un test
            </Link>
          </div>
          {testDefinitions.map((t) => {
            const rs = athleteTests
              .filter((r) => r.testId === t.id)
              .sort((a, b) => a.date.localeCompare(b.date));
            if (!rs.length) return null;
            const delta = rs[rs.length - 1].value - rs[0].value;
            return (
              <div
                key={t.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold">
                  {t.name} <span className="text-sm font-normal text-zinc-500">({t.unit})</span>
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {rs[0].value} → {rs[rs.length - 1].value} {t.unit} (
                  <span className={delta >= 0 ? "font-medium text-green-700" : "font-medium text-red-700"}>
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)}
                  </span>
                  )
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {rs.map((r) => `${formatDateFr(r.date)} : ${r.value}`).join(" · ")}
                </p>
              </div>
            );
          })}
          {athleteTests.length === 0 && (
            <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-500 shadow-sm">
              Aucun test enregistré.
            </p>
          )}
        </div>
      )}

      {tab === "resultats" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/resultats?athlete=${athleteId}`}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              + Saisir un résultat
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Saison</th>
                <th className="px-4 py-2 font-medium">Compétition</th>
                <th className="px-4 py-2 font-medium">Résultat</th>
                <th className="px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {athleteResults.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2">{formatDateFr(r.date)}</td>
                  <td className="px-4 py-2">{r.season}</td>
                  <td className="px-4 py-2">{r.competition}</td>
                  <td className="px-4 py-2 font-medium">{r.result}</td>
                  <td className="px-4 py-2 text-zinc-600">{r.notes || "—"}</td>
                </tr>
              ))}
              {athleteResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    Aucun résultat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === "bien-etre" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/bien-etre?athlete=${athleteId}`}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              + Saisir une journée
            </Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Sommeil</th>
                <th className="px-4 py-2 font-medium">Stress</th>
                <th className="px-4 py-2 font-medium">Motivation</th>
                <th className="px-4 py-2 font-medium">Fatigue</th>
                <th className="px-4 py-2 font-medium">Courbatures</th>
              </tr>
            </thead>
            <tbody>
              {athleteWellness.map((w) => (
                <tr key={w.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2">{formatDateFr(w.date)}</td>
                  <td className="px-4 py-2">{w.sleep}/10</td>
                  <td className="px-4 py-2">{w.stress}/10</td>
                  <td className="px-4 py-2">{w.motivation}/10</td>
                  <td className="px-4 py-2">{w.fatigue}/10</td>
                  <td className="px-4 py-2">{w.soreness}/10</td>
                </tr>
              ))}
              {athleteWellness.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    Aucune saisie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
