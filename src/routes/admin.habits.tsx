import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { assignHabit, fetchAllHabits, fetchAllProfiles, fetchHabitAssignments, unassignHabit } from "@/lib/queries";

export const Route = createFileRoute("/admin/habits")({
  head: () => ({
    meta: [
      { title: "Hábitos — Administração HealthTrack" },
      { name: "description", content: "Crie, edite e atribua hábitos aos usuários do HealthTrack." },
      { property: "og:title", content: "Hábitos — Administração HealthTrack" },
      { property: "og:description", content: "Gestão de hábitos da plataforma HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHabits,
});

const EMPTY = { name: "", description: "", category: "saude", icon: "✅", frequency: "diario", target: "", time_of_day: "" };

function AdminHabits() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const { data: habits = [], isLoading } = useQuery({ queryKey: ["habits"], queryFn: fetchAllHabits });
  const { data: users = [] } = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles });
  const { data: assignments = [] } = useQuery({ queryKey: ["habit-assignments"], queryFn: fetchHabitAssignments });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["habits"] });
    void qc.invalidateQueries({ queryKey: ["habit-assignments"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("habits").insert({
        name: form.name.trim(),
        description: form.description || null,
        category: form.category,
        icon: form.icon || "✅",
        frequency: form.frequency,
        target: form.target || null,
        time_of_day: form.time_of_day || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Hábito criado."); setForm(EMPTY); setOpen(false); refresh(); },
    onError: () => toast.error("Não foi possível criar o hábito."),
  });

  const toggleActive = useMutation({
    mutationFn: async (h: { id: string; active: boolean }) => {
      const { error } = await supabase.from("habits").update({ active: !h.active }).eq("id", h.id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Hábito excluído."); refresh(); },
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Hábitos</h1>
        <button onClick={() => setOpen((o) => !o)} className="btn-brand inline-flex items-center gap-2">
          <Plus className="size-4" /> Novo hábito
        </button>
      </div>

      {open && (
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="card-soft mt-4 grid sm:grid-cols-2 gap-3">
          <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Ícone (emoji)"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputCls} /></Field>
          <Field label="Categoria">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {["saude", "hidratacao", "movimento", "mente", "sono", "alimentacao"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Frequência">
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className={inputCls}>
              <option value="diario">Diário</option><option value="semanal">Semanal</option><option value="personalizado">Personalizado</option>
            </select>
          </Field>
          <Field label="Meta"><input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="2L, 30 min…" className={inputCls} /></Field>
          <Field label="Horário"><input type="time" value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })} className={inputCls} /></Field>
          <div className="sm:col-span-2">
            <Field label="Descrição"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 py-2`} /></Field>
          </div>
          <button type="submit" disabled={create.isPending} className="btn-brand sm:col-span-2 disabled:opacity-60">Salvar hábito</button>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {isLoading && [0, 1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        {!isLoading && habits.length === 0 && (
          <div className="card-soft text-center py-10">
            <p className="font-medium">Nenhum hábito criado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Crie o primeiro hábito e atribua aos usuários.</p>
          </div>
        )}
        {habits.map((h) => {
          const assigned = assignments.filter((a) => a.habit_id === h.id);
          return (
            <div key={h.id} className="card-soft">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {h.category} · {h.frequency}{h.target ? ` · ${h.target}` : ""}{h.time_of_day ? ` · ${h.time_of_day}` : ""}
                  </div>
                </div>
                <button onClick={() => toggleActive.mutate({ id: h.id, active: h.active })}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${h.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {h.active ? "Ativo" : "Inativo"}
                </button>
                <button onClick={() => setAssigning(assigning === h.id ? null : h.id)} title="Atribuir"
                  className="size-9 grid place-items-center rounded-lg hover:bg-muted"><Users className="size-4" /></button>
                <button onClick={() => { if (confirm("Excluir hábito?")) remove.mutate(h.id); }}
                  className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
              </div>

              {assigning === h.id && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Atribuir a usuários ({assigned.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {users.map((u) => {
                      const has = assigned.some((a) => a.user_id === u.id);
                      return (
                        <button key={u.id}
                          onClick={async () => {
                            try {
                              if (has) await unassignHabit(h.id, u.id);
                              else await assignHabit(h.id, [u.id]);
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputCls = "w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="font-medium">{label}</span><div className="mt-1">{children}</div></label>;
}
