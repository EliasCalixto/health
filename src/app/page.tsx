import { NOTION_TOKEN } from "@/lib/config";
import { formatDate } from "@/lib/format";
import {
  getHealthPageIntro,
  getMonthlySummary,
  getTherapySessions,
  getWorkouts,
} from "@/lib/notion";
import { summarizeWorkoutsByType } from "@/lib/stats";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { MonthlyDashboard } from "@/components/MonthlyDashboard";
import { SectionCard } from "@/components/SectionCard";
import { TherapyList } from "@/components/TherapyList";
import { WorkoutsTable } from "@/components/WorkoutsTable";
import { WorkoutTypeChart } from "@/components/WorkoutTypeChart";
import { WorkoutTypeSummaryTable } from "@/components/WorkoutTypeSummaryTable";

export default async function Home() {
  if (!NOTION_TOKEN) {
    return <SetupNotice />;
  }

  let months, workouts, therapy, intro;
  try {
    [months, workouts, therapy, intro] = await Promise.all([
      getMonthlySummary(),
      getWorkouts(),
      getTherapySessions(),
      getHealthPageIntro().catch(() => null),
    ]);
  } catch (error) {
    return <ErrorNotice error={error} />;
  }

  const workoutTypes = summarizeWorkoutsByType(workouts);
  const lastUpdated = [
    months.at(-1)?.date,
    workouts[0]?.date,
  ]
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">🩺 Health Dashboard</h1>
        {intro && (
          <p className="mt-2 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
            <InlineMarkdown text={intro} />
          </p>
        )}
        {lastUpdated && (
          <p className="mt-1 text-xs text-zinc-400">
            Última actualización de datos: {formatDate(lastUpdated)}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-400">
          Página generada el {formatDate(new Date().toISOString())}
        </p>
      </header>

      <MonthlyDashboard months={months} />

      <SectionCard
        title="🏋️ Entrenamientos"
        description={`${workouts.length} sesiones registradas`}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <WorkoutTypeChart data={workoutTypes} />
          <WorkoutTypeSummaryTable data={workoutTypes} />
        </div>
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Últimas sesiones
          </h3>
          <WorkoutsTable workouts={workouts.slice(0, 15)} />
        </div>
      </SectionCard>

      <SectionCard title="🧠 Therapy">
        <TherapyList sessions={therapy} />
      </SectionCard>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">🩺 Health Dashboard</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Falta configurar la conexión con Notion. Define las variables de entorno{" "}
        <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">NOTION_TOKEN</code> con
        el secreto de tu integración interna de Notion y opcionalmente{" "}
        <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">NOTION_PAGE_ID</code> con
        el ID de tu página &quot;Health&quot;. Recuerda compartir la página y sus bases de datos con la
        integración desde Notion.
      </p>
    </div>
  );
}

function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">🩺 Health Dashboard</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        No se pudo cargar la información de Notion: {message}
      </p>
      <p className="text-sm text-zinc-400">
        Verifica que NOTION_TOKEN sea válido y que la integración tenga acceso a la página
        &quot;Health&quot; y a sus bases de datos (📅 Resumen Mensual, 🏃 Entrenamientos, 🧠 Therapy).
      </p>
    </div>
  );
}
