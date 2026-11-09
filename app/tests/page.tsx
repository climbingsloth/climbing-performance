"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { formatDateFr } from "@/lib/growth";

function TestsPageInner() {
  const {
    athletes,
    testDefinitions,
    testResults,
    addTestDefinition,
    addTestResult,
  } = useStore();
  const searchParams = useSearchParams();
  const athleteParam = searchParams.get("athlete") ?? "";

  const [athleteId, setAthleteId] = useState(athleteParam);
  const [newTestName, setNewTestName] = useState("");
  const [newTestUnit, setNewTestUnit] = useState("");
  const [testId, setTestId] = useState("");
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const selectedAthleteId = athleteId || athletes[0]?.id || "";
  const selectedTestId = testId || testDefinitions[0]?.id || "";

  const athleteResults = useMemo(
    () =>
      testResults
        .filter((r) => r.athleteId === selectedAthleteId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [testResults, selectedAthleteId],
  );

  const byTest = useMemo(() => {
    const map = new Map<string, typeof athleteResults>();
    for (const r of athleteResults) {
      const list = map.get(r.testId) ?? [];
      list.push(r);
      map.set(r.testId, list);
    }
    return map;
  }, [athleteResults]);

  function onAddTest(e: FormEvent) {
    e.preventDefault();
    if (!newTestName.trim()) return;
    addTestDefinition({
      name: newTestName.trim(),
      unit: newTestUnit.trim() || "points",
    });
    setNewTestName("");
    setNewTestUnit("");
  }

  function onAddResult(e: FormEvent) {
    e.preventDefault();
    const v = parseFloat(value);
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    if (!selectedAthleteId || !selectedTestId || !date || Number.isNaN(v)) {
      setError("Athlète, test, date et valeur sont obligatoires.");
      return;
    }
    addTestResult({
      athleteId: selectedAthleteId,
      testId: selectedTestId,
      date: effectiveDate,
      value: v,
    });
    setValue("");
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tests physiques</h1>
        <p className="mt-1 text-zinc-600">
          Définissez vos propres tests (force des doigts, force des bras, ...)
          puis saisissez les résultats datés de chaque athlète.
        </p>
      </div>

      {athleteParam && (
        <Link
          href={`/athletes/${athleteParam}`}
          className="text-sm font-medium text-brand underline"
        >
          ← Fiche de l&apos;athlète
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onAddTest}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold">Nouveau test</h2>
          <input
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            placeholder="Nom du test (ex. Force des doigts)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            value={newTestUnit}
            onChange={(e) => setNewTestUnit(e.target.value)}
            placeholder="Unité (kg, s, points...)"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Ajouter le test
          </button>
        </form>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">
            Tests disponibles ({testDefinitions.length})
          </h2>
          <ul className="flex flex-wrap gap-2">
            {testDefinitions.map((t) => (
              <li
                key={t.id}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm"
              >
                {t.name} <span className="text-zinc-500">({t.unit})</span>
              </li>
            ))}
            {testDefinitions.length === 0 && (
              <li className="text-sm text-zinc-500">Aucun test défini.</li>
            )}
          </ul>
        </div>
      </div>

      <form
        onSubmit={onAddResult}
        className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Athlète</label>
          <select
            value={selectedAthleteId}
            onChange={(e) => setAthleteId(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Test</label>
          <select
            value={selectedTestId}
            onChange={(e) => setTestId(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {testDefinitions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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
          <label className="mb-1 block text-sm font-medium">Valeur</label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="ex. 42"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Enregistrer
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-5">{error}</p>
        )}
      </form>

      <div className="space-y-4">
        {testDefinitions.map((t) => {
          const results = (byTest.get(t.id) ?? []).sort((a, b) =>
            a.date.localeCompare(b.date),
          );
          if (results.length === 0) return null;
          const first = results[0];
          const last = results[results.length - 1];
          const delta = last.value - first.value;
          return (
            <div
              key={t.id}
              className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 px-4 py-3">
                <h2 className="font-semibold">
                  {t.name} <span className="text-sm font-normal text-zinc-500">({t.unit})</span>
                </h2>
                <p className="text-sm text-zinc-600">
                  {first.value} → {last.value} {t.unit} (
                  <span className={delta >= 0 ? "text-green-700" : "text-red-700"}>
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)}
                  </span>
                  )
                </p>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-t border-zinc-100">
                      <td className="px-4 py-2">{formatDateFr(r.date)}</td>
                      <td className="px-4 py-2 font-medium">
                        {r.value} {t.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {athleteResults.length === 0 && (
          <p className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-zinc-500 shadow-sm">
            Aucun résultat pour cet athlète.
          </p>
        )}
      </div>
    </div>
  );
}

export default function TestsPage() {
  return (
    <Suspense fallback={null}>
      <TestsPageInner />
    </Suspense>
  );
}
