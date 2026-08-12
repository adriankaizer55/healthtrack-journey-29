import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { assignWorkout, fetchAllProfiles, fetchAllWorkouts, fetchWorkoutAssignments, fetchWorkoutExercises, unassignWorkout } from "@/lib/queries";

export const Route = createFileRoute("/admin/workouts")({
  head: () => ({
    meta: [
      { title: "Treinos — Administração HealthTrack" },
      { name: "description", content: "Monte treinos com exercícios, séries e cargas e atribua aos usuários." },
      { property: "og:title", content: "Treinos — Administração HealthTrack" },
      { property: "og:description", content: "Gestão de treinos da plataforma HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminWorkouts,
});

const EMPTY = { name: "", description: "", category: "musculacao", duration_min: 45, level: "iniciante" };
const EMPTY_EX = { name: "", sets: 3, reps: "10", load: "", rest_seconds: 60, notes: "" };
const inputCls = "w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring";

function AdminWorkouts() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [ex, setEx] = useState(EMPTY_EX);

  const { data: workouts = [], isLoading } = useQuery({ queryKey: ["workouts"], queryFn: fetchAllWorkouts });
  const { data: users = [] } = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles });
  const { data: assignments = [] } = useQuery({ queryKey: ["workout-assignments"], queryFn: fetchWorkoutAssignments });
  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises", expanded],
    queryFn: () => fetchWorkoutExercises(expanded as string),
    enabled: !!expanded,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["workouts"] });
    void qc.invalidateQueries({ queryKey: ["workout-assignments"] });
    void qc.invalidateQueries({ queryKey: ["exercises"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("workouts").insert({
        name: form.name.trim(),
        description: form.description || null,
        category: form.category,
        duration_min: Number(form.duration_min) || 45,
        level: form.level,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Treino criado."); setForm(EMPTY); setOpen(false); refresh(); },
    onError: () => toast.error("Não foi possível criar o treino."),
  });

  const duplicate = useMutation({
    mutationFn: async (id: string) => {
      const source = workouts.find((w) => w.id === id);
      if (!source) return;
      const { data, error } = await supabase.from("workouts").insert({
        name: `${source.name} (cópia)`, description: source.description, category: source.category,
        duration_min: source.duration_min, level: source.level,
      }).select("id").single();
      if (error) throw error;
      const list = await fetchWorkoutExercises(id);
      if (list.length) {
        await supabase.from("workout_exercises").insert(list.map((e) => ({
          workout_id: data.id, name: e.name, description: e.description, sets: e.sets, reps: e.reps,
          load: e.load, rest_seconds: e.rest_seconds, notes: e.notes, position: e.position,
        })));
      }
    },
    onSuccess: () => { toast.success("Treino duplicado."); refresh(); },
  });

  const addExercise = useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase.from("workout_exercises").insert({
        workout_id: workoutId, name: ex.name.trim(), sets: Number(ex.sets) || 3, reps: ex.reps || "10",
        load: ex.load || null, rest_seconds: Number(ex.rest_seconds) || 60, notes: ex.notes || null,
        position: exercises.length,
      });
      if (error) throw error;
    },
    onSuccess: () => { setEx(EMPTY_EX); refresh(); },
    onError: () => toast.error("Não foi possível adicionar o exercício."),
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Treinos</h1>
        <button onClick={() => setOpen((o) => !o)} className="btn-brand inline-flex items-center gap-2"><Plus className="size-4" /> Novo treino</button>
      </div>

      {open && (
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="card-soft mt-4 grid sm:grid-cols-2 gap-3">
          <label className="block text-sm sm:col-span-2"><span className="font-medium">Nome</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label className="block text-sm"><span className="font-medium">Categoria</span>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`mt-1 ${inputCls}`} /></label>
          <label className="block text-sm"><span className="font-medium">Duração (min)</span>
            <input type="number" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })} className={`mt-1 ${inputCls}`} /></label>
          <label className="block text-sm"><span className="font-medium">Nível</span>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={`mt-1 ${inputCls}`}>
              <option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
            </select></label>
          <label className="block text-sm sm:col-span-2"><span className="font-medium">Descrição</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`mt-1 ${inputCls} h-20 py-2`} /></label>
          <button type="submit" className="btn-brand sm:col-span-2">Salvar treino</button>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {isLoading && [0, 1].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        {!isLoading && workouts.length === 0 && (
          <div className="card-soft text-center py-10">
            <p className="font-medium">Nenhum treino criado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Crie um treino e adicione exercícios.</p>
          </div>
        )}
        {workouts.map((w) => {
          const assigned = assignments.filter((a) => a.workout_id === w.id);
          return (
            <div key={w.id} className="card-soft">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <button onClick={() => setExpanded(expanded === w.id ? null : w.id)} className="font-semibold text-left hover:underline">{w.name}</button>
                  <div className="text-xs text-muted-foreground">{w.category} · {w.duration_min} min · {w.level}</div>
                </div>
                <button onClick={() => duplicate.mutate(w.id)} title="Duplicar" className="size-9 grid place-items-center rounded-lg hover:bg-muted"><Copy className="size-4" /></button>
                <button onClick={() => setAssigning(assigning === w.id ? null : w.id)} title="Atribuir" className="size-9 grid place-items-center rounded-lg hover:bg-muted"><Users className="size-4" /></button>
                <button onClick={async () => { if (confirm("Excluir treino?")) { await supabase.from("workouts").delete().eq("id", w.id); refresh(); } }}
                  className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
              </div>

              {assigning === w.id && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Atribuir a usuários ({assigned.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {users.map((u) => {
                      const has = assigned.some((a) => a.user_id === u.id);
                      return (
                        <button key={u.id}
                          onClick={async () => {
                            try {
                              if (has) await unassignWorkout(w.id, u.id); else await assignWorkout(w.id, [u.id]);
                              refresh();
                            } catch { toast.error("Falha ao atualizar atribuição."); }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${has ? "gradient-brand text-white border-transparent" : "border-border hover:bg-muted"}`}>
                          {u.name || u.email}
                        </button>
                      );
                    })}
                    {users.length === 0 && <span className="text-xs text-muted-foreground">Nenhum usuário cadastrado.</span>}
                  </div>
                </div>
              )}

              {expanded === w.id && (
                <div className="mt-3 border-t border-border pt-3 space-y-2">
                  {exercises.length === 0 && <p className="text-sm text-muted-foreground">Nenhum exercício ainda.</p>}
                  {exercises.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-3 text-sm">
                      <span className="size-7 rounded-lg bg-muted grid place-items-center text-xs font-bold">{i + 1}</span>
                      <div className="flex-1">
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.sets} séries · {e.reps} reps{e.load ? ` · ${e.load}` : ""} · {e.rest_seconds}s descanso</div>
                      </div>
                      <button onClick={async () => { await supabase.from("workout_exercises").delete().eq("id", e.id); refresh(); }}
                        className="size-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
                    </div>
                  ))}
                  <form onSubmit={(evt) => { evt.preventDefault(); addExercise.mutate(w.id); }} className="grid sm:grid-cols-5 gap-2 pt-2">
                    <input required placeholder="Exercício" value={ex.name} onChange={(e) => setEx({ ...ex, name: e.target.value })} className={`${inputCls} sm:col-span-2`} />
                    <input type="number" placeholder="Séries" value={ex.sets} onChange={(e) => setEx({ ...ex, sets: Number(e.target.value) })} className={inputCls} />
                    <input placeholder="Reps" value={ex.reps} onChange={(e) => setEx({ ...ex, reps: e.target.value })} className={inputCls} />
                    <input placeholder="Carga" value={ex.load} onChange={(e) => setEx({ ...ex, load: e.target.value })} className={inputCls} />
                    <input type="number" placeholder="Descanso (s)" value={ex.rest_seconds} onChange={(e) => setEx({ ...ex, rest_seconds: Number(e.target.value) })} className={inputCls} />
                    <input placeholder="Observações" value={ex.notes} onChange={(e) => setEx({ ...ex, notes: e.target.value })} className={`${inputCls} sm:col-span-3`} />
                    <button type="submit" className="btn-brand sm:col-span-1">Adicionar</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
