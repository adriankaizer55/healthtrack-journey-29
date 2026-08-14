import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Target, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { createGoal, deleteGoal, fetchGoals, updateGoal, type Goal } from "@/lib/queries";

export const Route = createFileRoute("/_app/metas")({
  head: () => ({
    meta: [
      { title: "Minhas metas — HealthTrack" },
      { name: "description", content: "Defina metas de saúde e acompanhe seu progresso no HealthTrack." },
      { property: "og:title", content: "Minhas metas — HealthTrack" },
      { property: "og:description", content: "Defina metas de saúde e acompanhe seu progresso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Metas,
});

function Metas() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("100");
  const [deadline, setDeadline] = useState("");

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId!) as Promise<Goal[]>,
    enabled: !!userId,
  });

  const refresh = () => void qc.invalidateQueries({ queryKey: ["goals"] });

  const create = useMutation({
    mutationFn: () => createGoal(userId!, { title: title.trim(), target: Number(target) || 100, deadline: deadline || null }),
    onSuccess: () => { toast.success("Meta criada ✓"); setTitle(""); setTarget("100"); setDeadline(""); setOpen(false); refresh(); },
    onError: () => toast.error("Não foi possível criar a meta."),
  });

  const bump = useMutation({
    mutationFn: (g: { id: string; progress: number; target: number }) => {
      const progress = Math.max(0, Math.min(g.target, g.progress));
      return updateGoal(g.id, { progress, status: progress >= g.target ? "concluida" : "em_andamento" });
    },
    onSuccess: refresh,
    onError: () => toast.error("Não foi possível atualizar a meta."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => { toast.success("Meta removida"); refresh(); },
    onError: () => toast.error("Não foi possível remover a meta."),
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Metas</h1>
        <button onClick={() => setOpen((o) => !o)}
          className="gradient-brand text-white rounded-full px-4 min-h-11 flex items-center gap-2 font-semibold shadow-md">
          {open ? <X className="size-4" /> : <Plus className="size-4" />}{open ? "Cancelar" : "Nova meta"}
        </button>
      </div>

      {open && (
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }} className="card-soft mb-4 space-y-3">
          <div>
            <label className="text-sm font-semibold" htmlFor="gtitle">Título</label>
            <input id="gtitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Caminhar 100 km"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 min-h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold" htmlFor="gtarget">Alvo</label>
              <input id="gtarget" type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 min-h-11" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="gdate">Prazo</label>
              <input id="gdate" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 min-h-11" />
            </div>
          </div>
          <button type="submit" disabled={create.isPending} className="w-full gradient-brand text-white rounded-xl min-h-11 font-semibold disabled:opacity-60">
            {create.isPending ? "Salvando..." : "Criar meta"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="card-soft text-center py-10 text-muted-foreground">Carregando metas...</div>
      ) : goals.length === 0 ? (
        <div className="card-soft text-center py-10">
          <div className="text-5xl mb-2">🎯</div>
          <div className="font-semibold">Nenhuma meta ainda</div>
          <p className="text-sm text-muted-foreground">Crie sua primeira meta e acompanhe a evolução.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => {
            const pct = g.target ? Math.min(100, Math.round((Number(g.progress) / Number(g.target)) * 100)) : 0;
            return (
              <li key={g.id} className="card-soft">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-teal/15 text-teal grid place-items-center"><Target className="size-5" /></div>
                  <div className="flex-1">
                    <div className="font-semibold">{g.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {Number(g.progress)} / {Number(g.target)}
                      {g.deadline && ` · até ${new Date(`${g.deadline}T12:00`).toLocaleDateString("pt-BR")}`}
                      {g.status === "concluida" && " · concluída ✓"}
                    </div>
                  </div>
                  <button onClick={() => bump.mutate({ id: g.id, progress: Number(g.progress) - 1, target: Number(g.target) })}
                    aria-label="Diminuir progresso" className="size-9 rounded-full border border-border grid place-items-center"><Minus className="size-4" /></button>
                  <button onClick={() => bump.mutate({ id: g.id, progress: Number(g.progress) + 1, target: Number(g.target) })}
                    aria-label="Aumentar progresso" className="size-9 rounded-full gradient-brand text-white grid place-items-center"><Plus className="size-4" /></button>
                  <button onClick={() => remove.mutate(g.id)} aria-label={`Remover ${g.title}`}
                    className="size-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-muted"><Trash2 className="size-4" /></button>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-brand" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
