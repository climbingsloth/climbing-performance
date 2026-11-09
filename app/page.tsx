import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord coach</h1>
        <p className="mt-1 text-zinc-600">
          Suivi des athlètes d&apos;escalade : croissance, bien-être, tests,
          résultats et entraînement.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/athletes"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Athlètes</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Liste des athlètes et ajout d&apos;un nouveau profil.
          </p>
        </Link>
        <Link
          href="/mensurations"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Mensurations &amp; croissance</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Taille, poids, taille assise et estimation du pic de croissance
            (PHV).
          </p>
        </Link>
        <Link
          href="/bien-etre"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Bien-être quotidien</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Sommeil, stress, motivation, fatigue et courbatures sur 10.
          </p>
        </Link>
        <Link
          href="/resultats"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Résultats par saison</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Compétitions et performances de chaque saison.
          </p>
        </Link>
        <Link
          href="/tests"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Tests physiques</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Force des bras, force des doigts et tests personnalisés.
          </p>
        </Link>
        <Link
          href="/planning"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold">Planning d&apos;entraînement</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Séances journalières, hebdomadaires, mensuelles et annuelles.
          </p>
        </Link>
      </div>
    </div>
  );
}
