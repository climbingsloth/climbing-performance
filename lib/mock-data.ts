import type {
  Athlete,
  Measurement,
  Planning,
  SeasonResult,
  TestDefinition,
  TestResult,
  TrainingSession,
  WellnessEntry,
} from "./types";

export const demoAthletes: Athlete[] = [
  {
    id: "ath-1",
    firstName: "Lucas",
    lastName: "Martin",
    birthDate: "2012-03-15",
    sex: "M",
    level: "Compétition jeunes",
    createdAt: "2025-09-01",
  },
  {
    id: "ath-2",
    firstName: "Emma",
    lastName: "Dubois",
    birthDate: "2011-07-22",
    sex: "F",
    level: "Compétition jeunes",
    createdAt: "2025-09-01",
  },
  {
    id: "ath-3",
    firstName: "Nathan",
    lastName: "Petit",
    birthDate: "2013-11-02",
    sex: "M",
    level: "Loisir encadré",
    createdAt: "2025-09-05",
  },
  {
    id: "ath-4",
    firstName: "Chloé",
    lastName: "Roux",
    birthDate: "2010-01-30",
    sex: "F",
    level: "Compétition adultes",
    createdAt: "2025-09-10",
  },
];

export const demoMeasurements: Measurement[] = [
  { id: "m-1", athleteId: "ath-1", date: "2025-09-10", heightCm: 152.5, weightKg: 42.0, sittingHeightCm: 79.0 },
  { id: "m-2", athleteId: "ath-1", date: "2026-01-15", heightCm: 155.2, weightKg: 43.5, sittingHeightCm: 80.1 },
  { id: "m-3", athleteId: "ath-1", date: "2026-05-20", heightCm: 157.8, weightKg: 45.2, sittingHeightCm: 81.0 },
  { id: "m-4", athleteId: "ath-2", date: "2025-09-12", heightCm: 158.0, weightKg: 46.5, sittingHeightCm: 83.5 },
  { id: "m-5", athleteId: "ath-2", date: "2026-02-01", heightCm: 160.5, weightKg: 48.0, sittingHeightCm: 84.2 },
  { id: "m-6", athleteId: "ath-2", date: "2026-06-10", heightCm: 161.8, weightKg: 48.8, sittingHeightCm: 84.6 },
  { id: "m-7", athleteId: "ath-3", date: "2025-10-05", heightCm: 146.0, weightKg: 38.2, sittingHeightCm: 77.0 },
  { id: "m-8", athleteId: "ath-3", date: "2026-03-01", heightCm: 148.5, weightKg: 39.0, sittingHeightCm: 78.0 },
  { id: "m-9", athleteId: "ath-4", date: "2025-09-20", heightCm: 168.0, weightKg: 58.0, sittingHeightCm: 88.5 },
  { id: "m-10", athleteId: "ath-4", date: "2026-04-01", heightCm: 168.6, weightKg: 58.4, sittingHeightCm: 88.7 },
];

export const demoWellness: WellnessEntry[] = [
  { id: "w-1", athleteId: "ath-1", date: "2026-11-05", sleep: 8, stress: 3, motivation: 8, fatigue: 4, soreness: 2 },
  { id: "w-2", athleteId: "ath-1", date: "2026-11-06", sleep: 7, stress: 4, motivation: 7, fatigue: 5, soreness: 3 },
  { id: "w-3", athleteId: "ath-1", date: "2026-11-07", sleep: 9, stress: 2, motivation: 9, fatigue: 3, soreness: 1 },
  { id: "w-4", athleteId: "ath-2", date: "2026-11-06", sleep: 6, stress: 5, motivation: 6, fatigue: 6, soreness: 4 },
  { id: "w-5", athleteId: "ath-2", date: "2026-11-07", sleep: 8, stress: 3, motivation: 8, fatigue: 4, soreness: 2 },
];

export const demoTestDefinitions: TestDefinition[] = [
  { id: "t-grip", name: "Force de préhension (dynamomètre)", unit: "kg" },
  { id: "t-finger", name: "Force des doigts (poutre 20 mm)", unit: "kg" },
  { id: "t-pullup", name: "Tractions lestées", unit: "kg ajoutés" },
];

export const demoTestResults: TestResult[] = [
  { id: "r-1", athleteId: "ath-1", testId: "t-grip", date: "2026-09-15", value: 38 },
  { id: "r-2", athleteId: "ath-1", testId: "t-grip", date: "2026-11-06", value: 41 },
  { id: "r-3", athleteId: "ath-1", testId: "t-finger", date: "2026-09-15", value: 12 },
  { id: "r-4", athleteId: "ath-1", testId: "t-finger", date: "2026-11-06", value: 14 },
  { id: "r-5", athleteId: "ath-2", testId: "t-grip", date: "2026-09-18", value: 35 },
  { id: "r-6", athleteId: "ath-2", testId: "t-grip", date: "2026-11-05", value: 36 },
];

export const demoSeasonResults: SeasonResult[] = [
  {
    id: "s-1",
    athleteId: "ath-1",
    season: "2025-2026",
    competition: "Championnat régional jeunes",
    date: "2026-03-14",
    result: "3e place, voie 7a+",
    notes: "Bonne gestion, à travailler sur la lecture de voie.",
  },
  {
    id: "s-2",
    athleteId: "ath-1",
    season: "2025-2026",
    competition: "Coupe de France jeunes",
    date: "2026-05-02",
    result: "12e place",
    notes: "",
  },
  {
    id: "s-3",
    athleteId: "ath-2",
    season: "2025-2026",
    competition: "Championnat régional jeunes",
    date: "2026-03-14",
    result: "1re place, voie 6c",
    notes: "Excellente saison, pic de forme atteint.",
  },
  {
    id: "s-4",
    athleteId: "ath-2",
    season: "2024-2025",
    competition: "Championnat régional jeunes",
    date: "2025-04-20",
    result: "4e place",
    notes: "Progression nette sur la puissance.",
  },
];

export const demoPlannings: Planning[] = [
  {
    id: "p-1",
    athleteId: "ath-1",
    objective: "Coupe régionale U15/U17 Bloc — Chaumont",
    objectiveDate: "2026-11-29",
    startDate: "2026-11-02",
    endDate: "2026-11-29",
    createdAt: "2026-11-01",
  },
  {
    id: "p-2",
    athleteId: "ath-1",
    objective: "Championnat de France jeunes bloc",
    objectiveDate: "2027-01-17",
    startDate: "2026-12-01",
    endDate: "2027-01-17",
    createdAt: "2026-11-01",
  },
  {
    id: "p-3",
    athleteId: "ath-2",
    objective: "Coupe régionale U15/U17 — saison 2026-2027",
    objectiveDate: "2026-12-12",
    startDate: "2026-11-09",
    endDate: "2026-12-12",
    createdAt: "2026-11-01",
  },
];

export const demoTrainingSessions: TrainingSession[] = [
  { id: "ts-1", athleteId: "ath-1", planningId: "p-1", date: "2026-11-09", title: "Bloc — force doigts", durationMin: 90, category: "Doigts", notes: "4x7 tractions poutre 20mm" },
  { id: "ts-2", athleteId: "ath-1", planningId: "p-1", date: "2026-11-10", title: "Voie — lecture", durationMin: 75, category: "Paroi", notes: "Travail lecture à vue" },
  { id: "ts-3", athleteId: "ath-1", planningId: "p-1", date: "2026-11-11", title: "Renforcement core", durationMin: 45, category: "Gainage", notes: "" },
  { id: "ts-4", athleteId: "ath-1", planningId: "p-2", date: "2026-12-16", title: "Bloc — puissance", durationMin: 90, category: "Bloc", notes: "Campus board modéré" },
  { id: "ts-5", athleteId: "ath-2", planningId: "p-3", date: "2026-11-09", title: "Endurance de voie", durationMin: 80, category: "Paroi", notes: "4x4 voies enchaînées" },
  { id: "ts-6", athleteId: "ath-2", planningId: "p-3", date: "2026-11-12", title: "Technique — pieds", durationMin: 60, category: "Technico-tactique", notes: "" },
];
