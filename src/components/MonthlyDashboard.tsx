"use client";

import { useMemo, useState } from "react";
import { buildKpiSummaries } from "@/lib/stats";
import type { MonthlySummary } from "@/lib/types";
import { KpiCard } from "./KpiCard";
import { MetricTrendChart } from "./MetricTrendChart";
import { SectionCard } from "./SectionCard";

type Period = "all" | "thisMonth" | "lastMonth" | "thisYear" | "lastYear" | `year:${number}`;

function filterMonths(months: MonthlySummary[], period: Period): MonthlySummary[] {
  if (period === "all") return months;

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  return months.filter((m) => {
    const d = new Date(m.date);
    const year = d.getFullYear();
    const month = d.getMonth();

    switch (period) {
      case "thisMonth":
        return year === thisYear && month === thisMonth;
      case "lastMonth": {
        const lastMonth = new Date(thisYear, thisMonth - 1, 1);
        return year === lastMonth.getFullYear() && month === lastMonth.getMonth();
      }
      case "thisYear":
        return year === thisYear;
      case "lastYear":
        return year === thisYear - 1;
      default:
        return year === Number(period.slice("year:".length));
    }
  });
}

export function MonthlyDashboard({ months }: { months: MonthlySummary[] }) {
  const [period, setPeriod] = useState<Period>("all");

  const olderYears = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const years = new Set(months.map((m) => new Date(m.date).getFullYear()));
    return Array.from(years)
      .filter((year) => year < thisYear - 1)
      .sort((a, b) => a - b);
  }, [months]);

  const filteredMonths = useMemo(() => filterMonths(months, period), [months, period]);
  const kpis = useMemo(() => buildKpiSummaries(filteredMonths), [filteredMonths]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          Periodo
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10"
          >
            <option value="all">Todo</option>
            <option value="thisMonth">Este mes</option>
            <option value="lastMonth">Mes anterior</option>
            <option value="thisYear">Este año</option>
            <option value="lastYear">Año anterior</option>
            {olderYears.map((year) => (
              <option key={year} value={`year:${year}`}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Pasos por día" description="Promedio diario por mes">
          <MetricTrendChart
            data={filteredMonths}
            series={[{ dataKey: "steps", label: "Pasos/día", color: "#3b82f6" }]}
          />
        </SectionCard>

        <SectionCard title="Sueño" description="Horas promedio por noche">
          <MetricTrendChart
            data={filteredMonths}
            series={[{ dataKey: "sleepHours", label: "Sueño (h)", color: "#8b5cf6" }]}
          />
        </SectionCard>

        <SectionCard title="Corazón" description="FC en reposo y HRV (SDNN)">
          <MetricTrendChart
            data={filteredMonths}
            series={[
              { dataKey: "restingHeartRate", label: "FC reposo (bpm)", color: "#ef4444" },
              { dataKey: "hrv", label: "HRV (ms)", color: "#10b981" },
            ]}
          />
        </SectionCard>

        <SectionCard title="VO₂máx" description="Capacidad cardiorrespiratoria">
          <MetricTrendChart
            data={filteredMonths}
            series={[{ dataKey: "vo2max", label: "VO₂máx", color: "#f59e0b" }]}
          />
        </SectionCard>

        <SectionCard title="Energía y ejercicio" description="Promedios diarios por mes">
          <MetricTrendChart
            data={filteredMonths}
            series={[
              { dataKey: "energy", label: "Energía activa (Cal)", color: "#f97316", yAxisId: "right" },
              { dataKey: "exerciseMinutes", label: "Ejercicio (min)", color: "#06b6d4" },
            ]}
          />
        </SectionCard>

        <SectionCard title="Pisos subidos" description="Promedio diario por mes">
          <MetricTrendChart
            data={filteredMonths}
            series={[{ dataKey: "floors", label: "Pisos/día", color: "#84cc16" }]}
          />
        </SectionCard>
      </div>
    </div>
  );
}
