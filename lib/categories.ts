export const SESSION_CATEGORIES = [
  "Force max bras/gainage/doigts",
  "Suspension",
  "Doigts",
  "Bras",
  "Gainage",
  "Autre physique",
  "Mental",
  "Souplesse/Mobilité",
  "Technico-tactique",
  "Bloc",
  "Paroi",
  "Récupération",
  "Compétition",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Force max bras/gainage/doigts": "bg-red-500",
  Suspension: "bg-red-300",
  Doigts: "bg-red-200",
  Bras: "bg-orange-300",
  Gainage: "bg-orange-200",
  "Autre physique": "bg-zinc-300",
  Mental: "bg-blue-400",
  "Souplesse/Mobilité": "bg-blue-200",
  "Technico-tactique": "bg-green-400",
  Bloc: "bg-yellow-300",
  Paroi: "bg-yellow-200",
  Récupération: "bg-emerald-200",
  Compétition: "bg-purple-400",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-zinc-900";
}
