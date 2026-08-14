import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, Dumbbell, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  completeWorkout,
  fetchMyWorkoutCompletions,
  fetchMyWorkouts,
  fetchWorkoutExercises,
  todayISO,
} from "@/lib/queries";

export const Route = createFileRoute("/_app/treinos")({
  head: () => ({
    meta: [
      { title: "Meus treinos — HealthTrack" },
      { name: "description", content: "Veja os treinos atribuídos, os exercícios de cada série e marque como concluído." },
      { property: "og:title", content: "Meus treinos — HealthTrack" },
      { property: "og:description", content: "Treinos personalizados com exercícios, séries e repetições." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Treinos,
});

function Treinos() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [open, setOpen] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-workouts", userId],
    queryFn: () => fetchMyWorkouts(userId!),
    enabled: !!userId,
  });
  const { data: completions = [] } = useQuery({
    queryKey: ["my-workout-completions", userId],
    queryFn: () => fetchMyWorkoutCompletions(userId!),
    enabled: !!userId,
  });

  const doneToday = (id: string) => completions.some((c) => c.workout_id === id && c.completed_on === todayISO());

  const complete = useMutation({
    mutationFn: (workoutId: string) => completeWorkout(userId!, workoutId),
    onSuccess: () => {
      toast.success("Treino concluído 💪");
      void qc.invalidateQueries({ queryKey: ["my-workout-completions"] });
    },
    onError: () => toast.error("Não foi possível registrar o treino."),
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Treinos</h1>
      <p className="text-sm text-muted-foreground mb-4">Treinos enviados pelo seu profissional.</p>

      {isLoading ? (
        <div className="card-soft text-center py-10 text-muted-foreground">Carregando treinos...</div>
      ) : items.length === 0 ? (
        <div className="card-soft text-center py-10">
          <div className="text-5xl mb-2">🏋️</div>
          <div className="font-semibold">Nenhum treino atribuído</div>
          <p className="text-sm text-muted-foreground">Assim que seu profissional enviar um treino, ele aparece aqui.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(({ workout, scheduled_date }) => (
            <li key={workout.id} className="card-soft">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl gradient-brand text-white grid place-items-center"><Dumbbell className="size-5" /></div>
                <div className="flex-1">
                  <div className="font-semibold">{workout.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Timer className="size-3.5" /> {workout.duration_min} min · {workout.level}
                    {scheduled_date && <span>· {new Date(`${scheduled_date}T12:00`).toLocaleDateString("pt-BR")}</span>}
                  </div>
                </div>
                <button onClick={() => setOpen((o) => (o === workout.id ? null : workout.id))}
                  aria-label="Ver exercícios" aria-expanded={open === workout.id}
                  className="size-9 rounded-full grid place-items-center hover:bg-muted">
                  <ChevronDown className={`size-5 transition-transform ${open === workout.id ? "rotate-180" : ""}`} />
                </button>
              </div>

              {workout.description && <p className="text-sm text-muted-foreground mt-2">{workout.description}</p>}

              {open === workout.id && <Exercises workoutId={workout.id} />}

              <button onClick={() => complete.mutate(workout.id)} disabled={doneToday(workout.id) || complete.isPending}
                className={`mt-3 w-full min-h-11 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  doneToday(workout.id) ? "bg-success/15 text-success" : "gradient-brand text-white"
                }`}>
                <CheckCircle2 className="size-5" />
                {doneToday(workout.id) ? "Concluído hoje" : "Marcar como concluído"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Exercises({ workoutId }: { workoutId: string }) {
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["workout-exercises", workoutId],
    queryFn: () => fetchWorkoutExercises(workoutId),
  });
  if (isLoading) return <p className="text-sm text-muted-foreground mt-3">Carregando exercícios...</p>;
  if (exercises.length === 0) return <p className="text-sm text-muted-foreground mt-3">Nenhum exercício cadastrado.</p>;
  return (
    <ul className="mt-3 space-y-2">
      {exercises.map((e) => (
        <li key={e.id} className="rounded-xl bg-muted/60 px-3 py-2">
          <div className="font-medium text-sm">{e.name}</div>
          <div className="text-xs text-muted-foreground">
            {e.sets}x{e.reps}{e.load ? ` · ${e.load}` : ""} · descanso {e.rest_seconds}s
          </div>
          {e.notes && <div className="text-xs text-muted-foreground mt-0.5">{e.notes}</div>}
        </li>
      ))}
    </ul>
  );
}
