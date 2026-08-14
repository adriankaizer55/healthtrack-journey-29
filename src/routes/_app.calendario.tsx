import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { dateISO, fetchMyCompletions, fetchMyWorkoutCompletions } from "@/lib/queries";

export const Route = createFileRoute("/_app/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — HealthTrack" },
      { name: "description", content: "Veja no calendário os dias em que você concluiu hábitos e treinos." },
      { property: "og:title", content: "Calendário — HealthTrack" },
      { property: "og:description", content: "Histórico visual dos seus hábitos e treinos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calendario,
});

const WD = ["S", "T", "Q", "Q", "S", "S", "D"];

function Calendario() {
  const { userId } = useAuth();
  const [ref, setRef] = useState(() => new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const from = dateISO(first);
  const to = dateISO(last);

  const { data: habitDays = [] } = useQuery({
    queryKey: ["cal-habits", userId, from, to],
    queryFn: () => fetchMyCompletions(userId!, from, to),
    enabled: !!userId,
  });
  const { data: workoutDays = [] } = useQuery({
    queryKey: ["cal-workouts", userId],
    queryFn: () => fetchMyWorkoutCompletions(userId!),
    enabled: !!userId,
  });

  const habitSet = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of habitDays) m.set(c.completed_on as string, (m.get(c.completed_on as string) ?? 0) + 1);
    return m;
  }, [habitDays]);
  const workoutSet = useMemo(
    () => new Set(workoutDays.map((c) => c.completed_on as string)),
    [workoutDays],
  );

  const lead = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: last.getDate() }, (_, i) => dateISO(new Date(year, month, i + 1))),
  ];
  const todayStr = dateISO(new Date());

  return (
    <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calendário</h1>

      <div className="card-soft">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setRef(new Date(year, month - 1, 1))} aria-label="Mês anterior"
            className="size-10 rounded-full grid place-items-center hover:bg-muted"><ChevronLeft className="size-5" /></button>
          <div className="font-semibold capitalize">
            {ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </div>
          <button onClick={() => setRef(new Date(year, month + 1, 1))} aria-label="Próximo mês"
            className="size-10 rounded-full grid place-items-center hover:bg-muted"><ChevronRight className="size-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          {WD.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((iso, i) => {
            if (!iso) return <div key={`e${i}`} />;
            const count = habitSet.get(iso) ?? 0;
            const hasWorkout = workoutSet.has(iso);
            return (
              <div key={iso}
                className={`aspect-square rounded-xl grid place-items-center text-sm relative ${
                  count > 0 ? "gradient-brand text-white font-semibold" : "bg-muted/60"
                } ${iso === todayStr ? "ring-2 ring-primary" : ""}`}>
                {Number(iso.slice(-2))}
                {hasWorkout && <span className="absolute bottom-1 size-1.5 rounded-full bg-orange-400" />}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded gradient-brand" /> hábitos concluídos</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-orange-400" /> treino</span>
        </div>
      </div>
    </div>
  );
}
