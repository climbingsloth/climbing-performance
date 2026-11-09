# Climbing Performance

Dashboard de suivi d'athlètes d'escalade (coach, puis parents/athlètes) :

- mensurations (taille, poids, taille assise) et estimation du pic de croissance (PHV, méthode de Mirwald 2002),
- bien-être quotidien sur 10 (sommeil, stress, motivation, fatigue, courbatures),
- résultats sportifs par saison,
- tests physiques personnalisables (force des bras, force des doigts, ...),
- planning d'entraînement journalier / hebdomadaire / mensuel / annuel.

## Stack

- Next.js 16 (React 19, TypeScript, Tailwind CSS 4)
- Données stockées localement (localStorage) pour le MVP ; migration prévue vers Supabase (PostgreSQL + auth + rôles) puis déploiement sur Vercel.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Vérifications

```bash
npm run lint
npm run build
```
