import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, ListChecks, Dumbbell, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dateISO, fetchAdminStats } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel do administrador — HealthTrack" },
      { name: "description", content: "Visão geral de usuários, hábitos, treinos e conclusões na plataforma HealthTrack." },
      { property: "og:title", content: "Painel do administrador — HealthTrack" },
      { property: "og:description", content: "Métricas e evolução dos usuários do HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHome,
});

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function AdminHome() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const iso = dateISO(d);
    return { day: WD[d.getDay()], iso, total: (data?.week ?? []).filter((w) => w === iso).length };
  });

  const growth = (() => {
    const users = data?.users ?? [];
    return Array.from({ length: 6 }, (_, i) => {
      const limit = new Date(Date.now() - (5 - i) * 7 * 864e5);
      return {
        label: `Sem ${i + 1}`,
        total: users.filter((u) => new Date(u.created_at as string) <= limit).length,
      };
    });
  })();

  const cards = [
    { label: "Total de usuários", value: data?.totalUsers ?? 0, icon: Users },
    { label: "Usuários ativos", value: data?.activeUsers ?? 0, icon: Activity },
    { label: "Hábitos ativos", value: data?.activeHabits ?? 0, icon: ListChecks },
    { label: "Treinos ativos", value: data?.activeWorkouts ?? 0, icon: Dumbbell },
    { label: "Conclusões hoje", value: data?.completionsToday ?? 0, icon: CheckCircle2 },
    { label: "Taxa de conclusão", value: `${data?.completionRate ?? 0}%`, icon: TrendingUp },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Painel administrativo</h1>
      <p className="text-sm text-muted-foreground mt-1">Acompanhe a plataforma em tempo real.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {cards.map((c) => (
          <div key={c.label} className="card-soft">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <c.icon className="size-4" />{c.label}
            </div>
            <div className="text-2xl lg:text-3xl font-bold mt-2">{isLoading ? <span className="inline-block h-7 w-14 rounded bg-muted animate-pulse" /> : c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="card-soft">
          <h2 className="font-semibold mb-3">Conclusões de hábitos (7 dias)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft">
          <h2 className="font-semibold mb-3">Evolução dos usuários</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
                <Line type="monotone" dataKey="total" stroke="#14B8A6" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Link to="/admin/users" className="card-soft hover:shadow-md transition-all font-medium">Gerenciar usuários →</Link>
        <Link to="/admin/habits" className="card-soft hover:shadow-md transition-all font-medium">Criar hábitos →</Link>
        <Link to="/admin/workouts" className="card-soft hover:shadow-md transition-all font-medium">Criar treinos →</Link>
      </div>
    </div>
  );
}
