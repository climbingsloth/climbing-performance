export const SESSION_CATEGORIES = [
  "Force max bras/gainage/doigts",
  "Suspension",
  "Doigts",
  "Bras",
  "Gainage",
  "Capacité aérobie",
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
  "Force max bras/gainage/doigts": "bg-[#e74c3c]",
  Suspension: "bg-[#e74c3c]/70",
  Doigts: "bg-[#e74c3c]/50",
  Bras: "bg-[#e67e22]",
  Gainage: "bg-[#f39c12]",
  "Capacité aérobie": "bg-[#9b59b6]",
  "Autre physique": "bg-zinc-400",
  Mental: "bg-[#3498db]",
  "Souplesse/Mobilité": "bg-[#3498db]/60",
  "Technico-tactique": "bg-[#2ecc71]",
  Bloc: "bg-[#f1c40f]",
  Paroi: "bg-[#f1c40f]/60",
  Récupération: "bg-[#2ecc71]/60",
  Compétition: "bg-[#9b59b6]",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-[#2c3e50]";
}
