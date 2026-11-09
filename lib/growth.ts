import type { Athlete, Measurement } from "./types";

export function decimalAge(birthDate: string, atDate: string): number {
  const birth = new Date(birthDate);
  const at = new Date(atDate);
  return (at.getTime() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
}

export function maturityOffset(
  sex: Athlete["sex"],
  ageYears: number,
  heightCm: number,
  sittingHeightCm: number,
  weightKg: number,
): number {
  const legLength = heightCm - sittingHeightCm;
  const weightHeightRatio = (weightKg / heightCm) * 100;
  if (sex === "M") {
    return (
      -9.236 +
      0.0002708 * legLength * sittingHeightCm -
      0.001663 * ageYears * legLength +
      0.007216 * ageYears * sittingHeightCm +
      0.02292 * weightHeightRatio
    );
  }
  return (
    -9.376 +
    0.0001882 * legLength * sittingHeightCm +
    0.0022 * ageYears * legLength +
    0.005841 * ageYears * sittingHeightCm -
    0.002658 * ageYears * weightKg +
    0.07693 * weightHeightRatio
  );
}

export function predictedAphpv(
  athlete: Athlete,
  measurement: Measurement,
): { age: number; offset: number; aphv: number } | null {
  if (!athlete.birthDate) return null;
  const age = decimalAge(athlete.birthDate, measurement.date);
  const offset = maturityOffset(
    athlete.sex,
    age,
    measurement.heightCm,
    measurement.sittingHeightCm,
    measurement.weightKg,
  );
  return { age, offset, aphv: age - offset };
}

export function heightVelocity(
  measurements: Measurement[],
): { date: string; cmPerYear: number }[] {
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const points: { date: string; cmPerYear: number }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const years =
      (new Date(curr.date).getTime() - new Date(prev.date).getTime()) /
      (365.25 * 24 * 3600 * 1000);
    if (years > 0) {
      points.push({
        date: curr.date,
        cmPerYear: ((curr.heightCm - prev.heightCm) / years) * 1,
      });
    }
  }
  return points;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function ageLabel(birthDate: string, atDate: string): string {
  const age = decimalAge(birthDate, atDate);
  return `${age.toFixed(1)} ans`;
}
