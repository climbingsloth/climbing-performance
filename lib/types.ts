export type Sex = "M" | "F";

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: Sex;
  level: string;
  createdAt: string;
}

export interface Measurement {
  id: string;
  athleteId: string;
  date: string;
  heightCm: number;
  weightKg: number;
  sittingHeightCm: number;
}

export interface WellnessEntry {
  id: string;
  athleteId: string;
  date: string;
  sleep: number;
  stress: number;
  motivation: number;
  fatigue: number;
  soreness: number;
}

export interface TestDefinition {
  id: string;
  name: string;
  unit: string;
}

export interface TestResult {
  id: string;
  athleteId: string;
  testId: string;
  date: string;
  value: number;
}

export interface SeasonResult {
  id: string;
  athleteId: string;
  season: string;
  competition: string;
  date: string;
  result: string;
  notes: string;
}

export interface TrainingSession {
  id: string;
  athleteId: string;
  planningId: string | null;
  date: string;
  title: string;
  durationMin: number;
  notes: string;
}

export interface Planning {
  id: string;
  athleteId: string;
  objective: string;
  objectiveDate: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}
