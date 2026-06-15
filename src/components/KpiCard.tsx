import { formatNumber } from "@/lib/format";
import type { KpiSummary } from "@/lib/stats";

export function KpiCard({ kpi }: { kpi: KpiSummary }) {
  const diff =
    kpi.latest != null && kpi.average != null ? kpi.latest - kpi.average : null;

  const trend =
    diff == null || Math.abs(diff) < 0.05
      ? null
      : diff > 0
        ? "up"
        : "down";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {formatNumber(kpi.latest, kpi.decimals)}
        <span className="ml-1 text-sm font-normal text-zinc-400">
          {kpi.unit}
        </span>
      </p>
      {kpi.average != null && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Histórico: {formatNumber(kpi.average, kpi.decimals)} {kpi.unit}
          {trend && (
            <span
              className={
                trend === "up"
                  ? "ml-1 text-emerald-500"
                  : "ml-1 text-rose-500"
              }
            >
              {trend === "up" ? "▲" : "▼"}
            </span>
          )}
        </p>
      )}
      {kpi.latestMonth && (
        <p className="mt-1 text-xs text-zinc-400">Mes: {kpi.latestMonth}</p>
      )}
    </div>
  );
}
