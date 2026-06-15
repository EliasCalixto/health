import type { MonthlySummary, Workout, WorkoutTypeSummary } from "./types";

export type MetricKey = keyof Pick<
  MonthlySummary,
  | "steps"
  | "energy"
  | "exerciseMinutes"
  | "sleepHours"
  | "floors"
  | "restingHeartRate"
  | "hrv"
  | "vo2max"
>;

export type KpiSummary = {
  key: MetricKey;
  label: string;
  unit: string;
  value: number | null;
  comparison: number | null;
  decimals: number;
  // Si un valor más alto es más saludable (pasos, HRV...) o no (FC en reposo).
  higherIsBetter: boolean;
};

const KPI_DEFS: {
  key: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  higherIsBetter: boolean;
}[] = [
  { key: "steps", label: "Pasos por día", unit: "pasos", decimals: 0, higherIsBetter: true },
  { key: "sleepHours", label: "Sueño por noche", unit: "h", decimals: 1, higherIsBetter: true },
  { key: "restingHeartRate", label: "FC en reposo", unit: "bpm", decimals: 1, higherIsBetter: false },
  { key: "hrv", label: "HRV (SDNN)", unit: "ms", decimals: 1, higherIsBetter: true },
  { key: "vo2max", label: "VO₂máx", unit: "mL/min·kg", decimals: 1, higherIsBetter: true },
  { key: "exerciseMinutes", label: "Ejercicio por día", unit: "min", decimals: 0, higherIsBetter: true },
  { key: "energy", label: "Energía activa diaria", unit: "Cal", decimals: 0, higherIsBetter: true },
  { key: "floors", label: "Pisos por día", unit: "pisos", decimals: 1, higherIsBetter: true },
];

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function averageOf(months: MonthlySummary[], key: MetricKey): number | null {
  return average(months.filter((m) => m[key] != null).map((m) => m[key] as number));
}

export function buildKpiSummaries(
  months: MonthlySummary[],
  comparisonMonths: MonthlySummary[],
): KpiSummary[] {
  return KPI_DEFS.map(({ key, label, unit, decimals, higherIsBetter }) => ({
    key,
    label,
    unit,
    decimals,
    higherIsBetter,
    value: averageOf(months, key),
    comparison: averageOf(comparisonMonths, key),
  }));
}

export function summarizeWorkoutsByType(workouts: Workout[]): WorkoutTypeSummary[] {
  const groups = new Map<string, Workout[]>();

  for (const workout of workouts) {
    const type = workout.type ?? "Otro";
    const list = groups.get(type) ?? [];
    list.push(workout);
    groups.set(type, list);
  }

  return Array.from(groups.entries())
    .map(([type, list]) => {
      const heartRates = list
        .map((w) => w.avgHeartRate)
        .filter((v): v is number => v != null);

      return {
        type,
        sessions: list.length,
        totalDurationMinutes: sum(list.map((w) => w.durationMinutes)),
        totalDistanceKm: sum(list.map((w) => w.distanceKm)),
        totalEnergyKcal: sum(list.map((w) => w.energyKcal)),
        avgHeartRate: heartRates.length > 0 ? average(heartRates) : null,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);
}

function sum(values: (number | null)[]): number {
  return values.reduce((total: number, v) => total + (v ?? 0), 0);
}
