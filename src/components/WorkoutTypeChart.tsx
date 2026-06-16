"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WorkoutTypeSummary } from "@/lib/types";

const COLORS: Record<string, string> = {
  Caminata: "#8dbad6",
  Correr: "#f8ccad",
  Core: "#8ea9db",
  Fútbol: "#b9f5c4",
  "Saltar cuerda": "#fd9a9a",
  "Fitness Gaming": "#fef2cb",
  Otro: "#abb9d4",
};

export function WorkoutTypeChart({ data }: { data: WorkoutTypeSummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-black/10 dark:stroke-white/10" />
        <XAxis dataKey="type" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={32} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelStyle={{ fontWeight: 600 }}
          formatter={(value) => [`${value} sesiones`, ""]}
        />
        <Bar dataKey="sessions" name="Sesiones" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.type} fill={COLORS[entry.type] ?? COLORS.Otro} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
