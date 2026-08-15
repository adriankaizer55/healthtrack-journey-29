import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Droplet, Dumbbell, Check } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { goalLabel } from "@/lib/onboarding";
import { useAuth } from "@/lib/auth-context";
import {
  computeStreak,
  dateISO,
  fetchGoals,
  fetchMyCompletions,
  fetchMyHabits,
  fetchMyWorkoutCompletions,
  fetchMyWorkouts,
  fetchNotifications,
  todayISO,
  type Goal,
} from "@/lib/queries";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — HealthTrack" },
      { name: "description", content: "Seu resumo diário de hábitos, treinos, metas e hidratação no HealthTrack." },
      { property: "og:title", content: "Painel — HealthTrack" },
      { property: "og:description", content: "Resumo diário de hábitos, treinos, metas e hidratação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const DAYS = ["S", "T", "Q", "Q", "S", "S", "D"];

function last7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return dateISO(d);
  });
}

function Dashboard() {
  const { waterCups } = useApp();
  const { userId, profile } = useAuth();
  const name = profile?.name?.split(" ")[0] || "por aqui";

  const days = useMemo(last7, []);

  const { data: habits = [] } = useQuery({
    queryKey: ["my-habits", userId],
    queryFn: () => fetchMyHabits(userId!),
    enabled: !!userId,
  });
  const { data: completions = [] } = useQuery({
    queryKey: ["my-completions-all", userId],
    queryFn: () => fetchMyCompletions(userId!, "2000-01-01", todayISO()),
    enabled: !!userId,
  });
  const { data: workouts = [] } = useQuery({
    queryKey: ["my-workouts", userId],
    queryFn: () => fetchMyWorkouts(userId!),
    enabled: !!userId,
  });
  const { data: workoutDone = [] } = useQuery({
    queryKey: ["my-workout-completions", userId],
    queryFn: () => fetchMyWorkoutCompletions(userId!),
    enabled: !!userId,
  });
  const { data: goals = [] } = useQuery({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId!) as Promise<Goal[]>,
    enabled: !!userId,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  });

  const today = todayISO();
  const doneToday = completions.filter((c) => c.completed_on === today);
  const isDone = (id: string) => doneToday.some((c) => c.habit_id === id);
  const streak = computeStreak(completions.map((c) => c.completed_on as string)).current;
  const unread = notifications.filter((n) => !n.read_at).length;
  const week = days.map((iso, i) => ({ d: DAYS[i], v: completions.filter((c) => c.completed_on === iso).length }));
  const workoutsToday = workoutDone.filter((c) => c.completed_on === today).length;
  const activeGoals = goals.filter((g) => g.status !== "concluida");

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full gradient-brand grid place-items-center text-white font-bold text-lg">
            {(profile?.name || "H")[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">Olá, {name} 👋</p>
            <p className="text-sm text-muted-foreground">Vamos cuidar de você hoje?</p>
          </div>
        </div>
        <Link to="/notificacoes" aria-label="Notificações" className="size-11 rounded-full grid place-items-center hover:bg-muted relative">
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />}
        </Link>
      </div>

      {/* Perfil do onboarding (dados reais) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Link to="/perfil" className="card-soft hover:shadow-md transition-all">
          <p className="text-xs text-muted-foreground">Seu objetivo</p>
          <p className="mt-1 font-semibold text-sm">
            {profile?.goal === "other" ? profile?.goal_other || "Outro" : goalLabel(profile?.goal)}
          </p>
        </Link>
        <Link to="/perfil" className="card-soft hover:shadow-md transition-all">
          <p className="text-xs text-muted-foreground">Peso atual</p>
          <p className="mt-1 font-semibold text-sm">{profile?.current_weight != null ? `${profile.current_weight} kg` : "—"}</p>
        </Link>
        <Link to="/perfil" className="card-soft hover:shadow-md transition-all">
          <p className="text-xs text-muted-foreground">Meta</p>
          <p className="mt-1 font-semibold text-sm">{profile?.target_weight != null ? `${profile.target_weight} kg` : "—"}</p>
        </Link>
        <Link to="/treinos" className="card-soft hover:shadow-md transition-all">
          <p className="text-xs text-muted-foreground">Treinos por semana</p>
          <p className="mt-1 font-semibold text-sm">{profile?.training_frequency ? `${profile.training_frequency} dias` : "—"}</p>
        </Link>
      </div>


      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hábitos da semana */}
        <div className="card-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Hábitos nos últimos 7 dias</h2>
            <Link to="/habitos" className="text-sm text-primary font-medium">Ver tudo</Link>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week}>
                <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
                <Bar dataKey="v" fill="url(#dbg)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="dbg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streak */}
        <div className="card-soft flex flex-col items-center justify-center text-center">
          <div className="text-5xl">🔥</div>
          <div className="text-3xl font-bold mt-1">{streak} {streak === 1 ? "dia" : "dias"}</div>
          <p className="text-sm text-muted-foreground">seguidos cuidando de você</p>
        </div>

        {/* Atividades de hoje */}
        <div className="card-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Atividades de hoje</h2>
            <Link to="/habitos" className="text-sm text-primary font-medium">Ver tudo</Link>
          </div>
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum hábito ainda. Crie o primeiro em Hábitos.</p>
          ) : (
            <ul className="space-y-2">
              {habits.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-muted grid place-items-center">{h.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.target ?? "Diário"}</div>
                  </div>
                  {isDone(h.id) ? (
                    <div className="size-7 rounded-full bg-success/20 text-success grid place-items-center"><Check className="size-4" /></div>
                  ) : <div className="size-7 rounded-full border-2 border-border" />}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Treinos */}
        <Link to="/treinos" className="card-soft hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-orange-500/15 text-orange-500 grid place-items-center"><Dumbbell className="size-5" /></div>
            <h2 className="font-semibold">Treinos</h2>
          </div>
          <div className="text-3xl font-bold">{workouts.length}<span className="text-base text-muted-foreground"> atribuídos</span></div>
          <p className="mt-2 text-xs text-muted-foreground">{workoutsToday > 0 ? `${workoutsToday} concluído(s) hoje 💪` : "Nenhum concluído hoje"}</p>
        </Link>

        {/* Metas */}
        <Link to="/metas" className="card-soft lg:col-span-2 hover:shadow-md transition-all">
          <h2 className="font-semibold mb-2">Metas em andamento</h2>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma meta ativa. Defina uma em Metas.</p>
          ) : (
            <ul className="space-y-3">
              {activeGoals.slice(0, 3).map((g) => {
                const pct = g.target ? Math.min(100, Math.round((Number(g.progress) / Number(g.target)) * 100)) : 0;
                return (
                  <li key={g.id}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full gradient-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Link>

        {/* Hidratação */}
        <Link to="/hidratacao" className="card-soft hover:shadow-md transition-all flex items-center gap-4">
          <div className="size-12 rounded-xl bg-sky-500/15 text-sky-500 grid place-items-center"><Droplet className="size-6" /></div>
          <div className="flex-1">
            <div className="font-semibold">Hidratação</div>
            <div className="text-sm text-muted-foreground">{waterCups} de 8 copos · {waterCups * 250}ml</div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${(waterCups / 8) * 100}%` }} />
            </div>
          </div>
        </Link>

        <div className="card-soft lg:col-span-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{doneToday.length} de {habits.length} hábitos concluídos hoje</div>
            <div className="text-xs text-muted-foreground">Cada dia conta — continue no seu ritmo.</div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-success/15 text-success text-sm font-semibold">
            {habits.length ? Math.round((doneToday.length / habits.length) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
