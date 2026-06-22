import { createFileRoute } from "@tanstack/react-router";
import { useApp, type Meal } from "@/lib/app-context";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/alimentacao")({ component: Alimentacao });

const WEEK = [{d:"S",v:1800},{d:"T",v:1950},{d:"Q",v:2100},{d:"Q",v:1700},{d:"S",v:1900},{d:"S",v:2200},{d:"D",v:1800}];

function Alimentacao() {
  const { meals, addMeal } = useApp();
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const totals = useMemo(() => meals.reduce((a, m) => ({
    kcal: a.kcal + m.kcal, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 }), [meals]);

  const goals = { kcal: 2000, protein: 120, carbs: 250, fat: 65 };

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Alimentação</h1>

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setDate((d) => new Date(d.getTime() - 86400000))} className="size-11 rounded-full hover:bg-muted grid place-items-center" aria-label="Dia anterior"><ChevronLeft className="size-5" /></button>
        <div className="text-sm font-semibold">{date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</div>
        <button onClick={() => setDate((d) => new Date(d.getTime() + 86400000))} className="size-11 rounded-full hover:bg-muted grid place-items-center" aria-label="Próximo dia"><ChevronRight className="size-5" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Macro label="Calorias" value={totals.kcal} goal={goals.kcal} unit="kcal" color="from-blue-500 to-teal-500" />
        <Macro label="Proteínas" value={totals.protein} goal={goals.protein} unit="g" color="from-rose-500 to-orange-500" />
        <Macro label="Carboidratos" value={totals.carbs} goal={goals.carbs} unit="g" color="from-amber-500 to-yellow-500" />
        <Macro label="Gorduras" value={totals.fat} goal={goals.fat} unit="g" color="from-violet-500 to-fuchsia-500" />
      </div>

      <div className="card-soft mb-4">
        <div className="text-sm font-semibold mb-2">Calorias na semana</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEK}>
              <XAxis dataKey="d" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }} />
              <Line type="monotone" dataKey="v" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Refeições</h2>
        <button onClick={() => setOpen(true)} className="btn-brand"><Plus className="size-4" /> Adicionar alimento</button>
      </div>

      {meals.length === 0 ? (
        <div className="card-soft text-center py-10">
          <div className="text-5xl mb-2">🍽️</div>
          <div className="font-semibold">Nenhuma refeição registrada</div>
          <p className="text-sm text-muted-foreground">Adicione o que você comeu para acompanhar seus macros.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {meals.map((m) => (
            <li key={m.id} className="card-soft flex items-center gap-3">
              <div className="size-12 rounded-xl gradient-brand text-white grid place-items-center text-xl">{categoryEmoji(m.category)}</div>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.category} · {m.time}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{m.kcal} kcal</div>
                <div className="text-xs text-muted-foreground">P{m.protein} · C{m.carbs} · G{m.fat}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && <AddMealModal onClose={() => setOpen(false)} onAdd={(m) => { addMeal(m); toast.success("Alimento adicionado ✓"); setOpen(false); }} />}
    </div>
  );
}

function categoryEmoji(c: string) {
  return { "Café": "☕", "Almoço": "🍱", "Lanche": "🍪", "Jantar": "🍲", "Ceia": "🥛" }[c] || "🍽️";
}

function Macro({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div className="card-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1">{value}<span className="text-xs text-muted-foreground"> / {goal} {unit}</span></div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AddMealModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Omit<Meal, "id">) => void }) {
  const [m, setM] = useState({
    name: "", category: "Almoço",
    time: new Date().toTimeString().slice(0, 5),
    kcal: 0, protein: 0, carbs: 0, fat: 0,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card text-card-foreground rounded-2xl w-full max-w-md p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Adicionar alimento</h3>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full hover:bg-muted" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (m.name) onAdd(m); }} className="space-y-3">
          <Field label="Nome" value={m.name} onChange={(v) => setM({ ...m, name: v })} required />
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <select value={m.category} onChange={(e) => setM({ ...m, category: e.target.value })}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background">
              {["Café", "Almoço", "Lanche", "Jantar", "Ceia"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumF label="Calorias" value={m.kcal} onChange={(v) => setM({ ...m, kcal: v })} />
            <NumF label="Proteínas (g)" value={m.protein} onChange={(v) => setM({ ...m, protein: v })} />
            <NumF label="Carboidratos (g)" value={m.carbs} onChange={(v) => setM({ ...m, carbs: v })} />
            <NumF label="Gorduras (g)" value={m.fat} onChange={(v) => setM({ ...m, fat: v })} />
          </div>
          <Field label="Horário" type="time" value={m.time} onChange={(v) => setM({ ...m, time: v })} />
          <button className="btn-brand w-full">Salvar</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background" />
    </div>
  );
}
function NumF({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background" />
    </div>
  );
}
