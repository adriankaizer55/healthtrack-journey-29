import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Droplet, Flame, Check } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

const WEIGHT_DATA = [
  { d: "Sem 1", w: 81.1 }, { d: "Sem 2", w: 80.2 }, { d: "Sem 3", w: 79.4 },
  { d: "Sem 4", w: 78.8 }, { d: "Sem 5", w: 78.3 }, { d: "Sem 6", w: 78.0 },
];

function Dashboard() {
  const { user, habits, waterCups, streak, weight, targetWeight } = useApp();
  const done = habits.filter((h) => h.done).length;
  const kcal = 1240, kcalGoal = 2000;
  const lost = (81.1 - weight).toFixed(1);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full gradient-brand grid place-items-center text-white font-bold text-lg">{user.name[0]}</div>
          <div>
            <p className="text-sm text-muted-foreground">Olá, {user.name}! 👋</p>
            <p className="text-lg font-semibold">Vamos cuidar de você hoje?</p>
          </div>
        </div>
        <Link to="/notificacoes" aria-label="Notificações" className="size-11 rounded-full grid place-items-center hover:bg-muted relative">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weight progress */}
        <div className="card-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Progresso de peso</h2>
            <span className="text-xs px-2 py-1 rounded-lg bg-teal/15 text-teal font-semibold">Meta {targetWeight} kg</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEIGHT_DATA}>
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
                  <Line type="monotone" dataKey="w" stroke="url(#g1)" strokeWidth={3} dot={{ r: 3 }} />
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <CircleProgress value={Math.min(100, ((81.1 - weight) / (81.1 - targetWeight)) * 100)} label={`-${lost} kg`} />
          </div>
        </div>

        {/* Streak */}
        <div className="card-soft flex flex-col items-center justify-center text-center">
          <div className="text-5xl">🔥</div>
          <div className="text-3xl font-bold mt-1">{streak} dias</div>
          <p className="text-sm text-muted-foreground">seguidos cuidando de você</p>
        </div>

        {/* Activities */}
        <div className="card-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Atividades de hoje</h2>
            <Link to="/habitos" className="text-sm text-primary font-medium">Ver tudo</Link>
          </div>
          <ul className="space-y-2">
            {habits.slice(0, 4).map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <div className={`size-9 rounded-xl ${h.color} text-white grid place-items-center`}>{h.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.value} / {h.goal}</div>
                </div>
                {h.done ? <div className="size-7 rounded-full bg-success/20 text-success grid place-items-center"><Check className="size-4" /></div>
                  : <div className="size-7 rounded-full border-2 border-border" />}
              </li>
            ))}
          </ul>
        </div>

        {/* Calories */}
        <div className="card-soft">
          <h2 className="font-semibold mb-2">Calorias hoje</h2>
          <div className="text-3xl font-bold">{kcal}<span className="text-base text-muted-foreground"> / {kcalGoal} kcal</span></div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-brand" style={{ width: `${(kcal / kcalGoal) * 100}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">+12% vs. semana passada</p>
        </div>

        {/* Hydration */}
        <Link to="/hidratacao" className="card-soft hover:shadow-md transition-all lg:col-span-3 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-sky-500/15 text-sky-500 grid place-items-center"><Droplet className="size-6" /></div>
          <div className="flex-1">
            <div className="font-semibold">Hidratação</div>
            <div className="text-sm text-muted-foreground">{waterCups} de 8 copos · {waterCups * 250}ml</div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${(waterCups / 8) * 100}%` }} />
            </div>
          </div>
          <Flame className="size-5 text-muted-foreground" aria-hidden />
        </Link>

        <div className="card-soft lg:col-span-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{done} de {habits.length} hábitos concluídos</div>
            <div className="text-xs text-muted-foreground">Você está indo muito bem essa semana!</div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-success/15 text-success text-sm font-semibold">+12%</span>
        </div>
      </div>
    </div>
  );
}

function CircleProgress({ value, label }: { value: number; label: string }) {
  const r = 32, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="-rotate-90 size-20">
        <circle cx="40" cy="40" r={r} stroke="var(--muted)" strokeWidth="8" fill="none" />
        <circle cx="40" cy="40" r={r} stroke="url(#cg)" strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} />
        <defs>
          <linearGradient id="cg" x1="0" x2="1">
            <stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-bold">{label}</div>
    </div>
  );
}
