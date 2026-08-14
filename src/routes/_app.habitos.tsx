import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Flame, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  computeStreak,
  dateISO,
  fetchMyCompletions,
  fetchMyHabits,
  toggleCompletion,
  type Habit,
} from "@/lib/queries";

export const Route = createFileRoute("/_app/habitos")({
  head: () => ({
    meta: [
      { title: "Meus hábitos — HealthTrack" },
      { name: "description", content: "Acompanhe e marque seus hábitos diários no HealthTrack." },
      { property: "og:title", content: "Meus hábitos — HealthTrack" },
      { property: "og:description", content: "Acompanhe e marque seus hábitos diários no HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Habitos,
});

const DAYS = ["S", "T", "Q", "Q", "S", "S", "D"];
const DAY_LABELS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
const ICONS = ["💧", "🚶", "🧘", "😴", "🏋️", "🍎", "📚", "🥗"];
const COLORS = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-indigo-500", "bg-orange-500", "bg-rose-500"];

/** Datas (segunda→domingo) da semana atual */
function weekDates() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return dateISO(d);
  });
}

function Habitos() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { userId, profile } = useAuth();
  const userName = profile?.name?.split(" ")[0] || "você";

  const [days, setDays] = useState<string[]>([]);
  const [today, setToday] = useState(0);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const idx = (new Date().getDay() + 6) % 7;
    setDays(weekDates());
    setToday(idx);
    setSelected(idx);
  }, []);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["my-habits", userId],
    queryFn: () => fetchMyHabits(userId!),
    enabled: !!userId,
  });

  const from = days[0] ?? "";
  const to = days[6] ?? "";
  const { data: completions = [] } = useQuery({
    queryKey: ["my-completions", userId, from, to],
    queryFn: () => fetchMyCompletions(userId!, from, to),
    enabled: !!userId && !!from,
  });

  const { data: allCompletions = [] } = useQuery({
    queryKey: ["my-completions-all", userId],
    queryFn: () => fetchMyCompletions(userId!, "2000-01-01", dateISO(new Date())),
    enabled: !!userId,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["my-habits"] });
    void qc.invalidateQueries({ queryKey: ["my-completions"] });
    void qc.invalidateQueries({ queryKey: ["my-completions-all"] });
  };

  const streak = useMemo(
    () => computeStreak(allCompletions.map((c) => c.completed_on as string)).current,
    [allCompletions],
  );

  const selectedDate = days[selected] ?? "";
  const isToday = selected === today;
  const isDone = (h: Habit) => completions.some((c) => c.habit_id === h.id && c.completed_on === selectedDate);

  const done = habits.filter(isDone).length;
  const total = habits.length;
  const allDone = total > 0 && done === total;
  const pct = total ? (done / total) * 100 : 0;

  const week = useMemo(
    () => DAYS.map((d, i) => ({ d, v: completions.filter((c) => c.completed_on === days[i]).length })),
    [completions, days],
  );

  const toggle = useMutation({
    mutationFn: (h: Habit) => toggleCompletion(userId!, h.id, selectedDate, isDone(h)),
    onSuccess: (_r, h) => {
      if (!isDone(h)) toast.success(`Hábito "${h.name}" concluído ✓`);
      refresh();
    },
    onError: () => toast.error("Não foi possível atualizar o hábito."),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          name: name.trim(),
          icon,
          target: goal.trim() || "1x por dia",
          category: "pessoal",
          created_by: userId!,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: aErr } = await supabase
        .from("habit_assignments")
        .insert({ habit_id: data.id, user_id: userId!, active: true });
      if (aErr) throw aErr;
    },
    onSuccess: () => {
      toast.success(`Hábito "${name.trim()}" criado`);
      setName(""); setGoal(""); setIcon(ICONS[0]); setOpen(false);
      refresh();
    },
    onError: () => toast.error("Não foi possível criar o hábito."),
  });

  const remove = useMutation({
    mutationFn: async (h: Habit) => {
      const { error } = await supabase.from("habits").delete().eq("id", h.id);
      if (error) throw error;
    },
    onSuccess: (_r, h) => { toast.success(`Hábito "${h.name}" removido`); refresh(); },
    onError: () => toast.error("Este hábito foi enviado pelo seu profissional e não pode ser removido."),
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <button onClick={() => setOpen((o) => !o)}
          className="gradient-brand text-white rounded-full px-4 min-h-11 flex items-center gap-2 font-semibold shadow-md">
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? "Cancelar" : "Novo hábito"}
        </button>
      </div>

      {open && (
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="card-soft mb-4 space-y-3">
          <div>
            <label className="text-sm font-semibold" htmlFor="hname">Nome do hábito</label>
            <input id="hname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Alongar"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 min-h-11" />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="hgoal">Meta</label>
            <input id="hgoal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex.: 10 min"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 min-h-11" />
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">Ícone</div>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)} aria-label={`Ícone ${i}`}
                  className={`size-11 rounded-xl text-xl grid place-items-center ${icon === i ? "gradient-brand text-white" : "bg-muted"}`}>{i}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={create.isPending}
            className="w-full gradient-brand text-white rounded-xl min-h-11 font-semibold disabled:opacity-60">
            {create.isPending ? "Salvando..." : "Adicionar hábito"}
          </button>
        </form>
      )}

      {/* Days selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelected(i)} aria-pressed={selected === i}
            className={`shrink-0 size-11 rounded-full font-semibold transition-all relative ${selected === i ? "gradient-brand text-white shadow-md" : "bg-muted text-muted-foreground"}`}>
            {d}
            {i === today && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card-soft flex items-center gap-4">
          <CircleProgress value={pct} label={`${done}/${total}`} />
          <div>
            <div className="font-semibold">{isToday ? "Progresso de hoje" : `Progresso de ${DAY_LABELS[selected]}`}</div>
            <div className="text-sm text-muted-foreground">{done} hábitos concluídos</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-orange-500 font-semibold"><Flame className="size-4" /> {streak} dias</div>
          </div>
        </div>
        <div className="card-soft">
          <div className="text-sm font-semibold mb-2">Esta semana</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week}>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
                <Bar dataKey="v" fill="url(#bg)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {allDone && (
        <div className="card-soft mb-4 text-center gradient-brand text-white animate-pulse">
          <div className="text-3xl mb-1">🎉</div>
          <div className="font-bold">Você completou todos os hábitos de {isToday ? "hoje" : DAY_LABELS[selected]}!</div>
          <div className="text-sm opacity-90">Continue assim, {userName} — seu corpo agradece.</div>
        </div>
      )}

      <ul className="space-y-2">
        {isLoading ? (
          <li className="card-soft text-center py-10 text-muted-foreground">Carregando seus hábitos...</li>
        ) : habits.length === 0 ? (
          <li className="card-soft text-center py-10">
            <div className="text-5xl mb-2">🌱</div>
            <div className="font-semibold">Nenhum hábito ainda</div>
            <p className="text-sm text-muted-foreground">Crie um hábito ou aguarde a atribuição do seu profissional.</p>
          </li>
        ) : habits.map((h, idx) => {
          const dayDone = isDone(h);
          return (
            <li key={h.id} className="card-soft flex items-center gap-3">
              <div className={`size-11 rounded-xl ${COLORS[idx % COLORS.length]} text-white grid place-items-center text-xl`}>{h.icon}</div>
              <button
                onClick={() => (h.name.toLowerCase().includes("água") && isToday ? nav({ to: "/hidratacao" }) : toggle.mutate(h))}
                className="flex-1 text-left min-h-11">
                <div className="font-semibold">{h.name}</div>
                <div className="text-xs text-muted-foreground">
                  {h.target ? `Meta: ${h.target}` : h.frequency === "diario" ? "Diário" : h.frequency}
                </div>
              </button>
              <button onClick={() => toggle.mutate(h)} aria-label={dayDone ? "Desmarcar" : "Marcar"}
                className={`size-9 rounded-full grid place-items-center transition-all ${dayDone ? "bg-success text-white" : "border-2 border-border"}`}>
                {dayDone && <Check className="size-5" />}
              </button>
              <button onClick={() => remove.mutate(h)} aria-label={`Remover ${h.name}`}
                className="size-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-muted transition-all">
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CircleProgress({ value, label }: { value: number; label: string }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="-rotate-90 size-20">
        <circle cx="40" cy="40" r={r} stroke="var(--muted)" strokeWidth="8" fill="none" />
        <circle cx="40" cy="40" r={r} stroke="url(#cg2)" strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} />
        <defs><linearGradient id="cg2" x1="0" x2="1"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#14B8A6" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-bold">{label}</div>
    </div>
  );
}
