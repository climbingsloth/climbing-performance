"use client";

import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { ageLabel } from "@/lib/growth";
import type { Sex } from "@/lib/types";

export default function AthletesClient({ today }: { today: string }) {
  const { athletes, addAthlete, removeAthlete } = useStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<Sex>("M");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      setError("Prénom, nom et date de naissance sont obligatoires.");
      return;
    }
    addAthlete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      sex,
      level: level.trim() || "Non précisé",
    });
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setLevel("");
    setError("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Athlètes</h1>
        <p className="mt-1 text-zinc-600">
          {athletes.length} athlète{athletes.length > 1 ? "s" : ""} suivi
          {athletes.length > 1 ? "s" : ""}.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Prénom</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Lucas"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Martin"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date de naissance
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sexe</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="M">Garçon</option>
            <option value="F">Fille</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Niveau</label>
          <input
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Compétition jeunes"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Ajouter l&apos;athlète
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">
            {error}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Athlète</th>
              <th className="px-4 py-3 font-medium">Âge</th>
              <th className="px-4 py-3 font-medium">Sexe</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((a) => (
              <tr key={a.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {a.firstName} {a.lastName}
                </td>
                <td className="px-4 py-3">{ageLabel(a.birthDate, today)}</td>
                <td className="px-4 py-3">{a.sex === "M" ? "Garçon" : "Fille"}</td>
                <td className="px-4 py-3">{a.level}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeAthlete(a.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {athletes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  Aucun athlète pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
