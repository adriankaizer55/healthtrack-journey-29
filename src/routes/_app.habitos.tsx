import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { Check, Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/habitos")({ component: Habitos });

const DAYS = ["S", "T", "Q", "Q", "S", "S", "D"];
const WEEK = [3, 5, 4, 6, 4, 2, 6].map((v, i) => ({ d: DAYS[i], v }));

function Habitos() {
  const nav = useNavigate();
  const { habits, toggleHabit, streak } = useApp();
  const today = new Date().getDay();
  const [selected, setSelected] = useState(today);
  const done = habits.filter((h) => h.done).length;
  const total = habits.length;
  const allDone = done === total;
  const pct = useMemo(() => (done / total) * 100, [done, total]);

  function onToggle(id: string, name: string) {
    toggleHabit(id);
    const h = habits.find((x) => x.id === id);
    if (!h?.done) toast.success(`Hábito "${name}" concluído ✓`);
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hábitos</h1>

      {/* Days selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`shrink-0 size-11 rounded-full font-semibold transition-all ${selected === i ? "gradient-brand text-white shadow-md" : "bg-muted text-muted-foreground"}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card-soft flex items-center gap-4">
          <CircleProgress value={pct} label={`${done}/${total}`} />
          <div>
            <div className="font-semibold">Progresso de hoje</div>
            <div className="text-sm text-muted-foreground">{done} hábitos concluídos</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-orange-500 font-semibold"><Flame className="size-4" /> {streak} dias</div>
          </div>
        </div>
        <div className="card-soft">
          <div className="text-sm font-semibold mb-2">Últimos 7 dias</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
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
          <div className="font-bold">Você completou todos os hábitos de hoje!</div>
          <div className="text-sm opacity-90">Continue assim, {`{name}`} — seu corpo agradece.</div>
        </div>
      )}

      <ul className="space-y-2">
        {habits.length === 0 ? (
          <li className="card-soft text-center py-10">
            <div className="text-5xl mb-2">🌱</div>
            <div className="font-semibold">Nenhum hábito ainda</div>
            <p className="text-sm text-muted-foreground">Comece criando um hábito saudável hoje.</p>
          </li>
        ) : habits.map((h) => (
          <li key={h.id} className="card-soft flex items-center gap-3">
            <div className={`size-11 rounded-xl ${h.color} text-white grid place-items-center text-xl`}>{h.icon}</div>
            <button
              onClick={() => h.id === "h1" ? nav({ to: "/hidratacao" }) : onToggle(h.id, h.name)}
              className="flex-1 text-left min-h-11">
              <div className="font-semibold">{h.name}</div>
              <div className="text-xs text-muted-foreground">{h.value} / {h.goal}</div>
            </button>
            <button onClick={() => onToggle(h.id, h.name)} aria-label={h.done ? "Desmarcar" : "Marcar"}
              className={`size-9 rounded-full grid place-items-center transition-all ${h.done ? "bg-success text-white" : "border-2 border-border"}`}>
              {h.done && <Check className="size-5" />}
            </button>
          </li>
        ))}
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
