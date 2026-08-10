import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/hidratacao")({ component: Hidratacao });

const WEEK = [6, 7, 5, 8, 4, 6, 7].map((v, i) => ({
  d: ["S", "T", "Q", "Q", "S", "S", "D"][i],
  v,
}));

function Hidratacao() {
  const { waterCups, setWaterCups } = useApp();
  const [tab, setTab] = useState<"dia" | "semana" | "mes">("dia");
  const pct = (waterCups / 8) * 100;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
      <Link
        to="/habitos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Hidratação</h1>

      <div className="flex gap-2 mb-5">
        {(["dia", "semana", "mes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-11 rounded-xl font-medium capitalize ${tab === t ? "gradient-brand text-white" : "bg-muted text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card-soft text-center mb-4">
        <CircleProgress value={pct} label={`${Math.round(pct)}%`} />
        <div className="mt-2 text-sm text-muted-foreground">{waterCups * 250} ml de 2000 ml</div>
      </div>

      {tab === "dia" && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = i < waterCups;
              return (
                <button
                  key={i}
                  onClick={() => setWaterCups(filled ? i : i + 1)}
                  aria-label={`Copo ${i + 1}`}
                  className={`aspect-[3/4] rounded-2xl border-2 ${filled ? "border-sky-500 bg-sky-500/15" : "border-dashed border-border bg-muted/30"} grid place-items-center text-2xl transition-all`}
                >
                  <span>{filled ? "💧" : ""}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setWaterCups(waterCups - 1)}
              className="size-12 rounded-xl border border-border grid place-items-center"
              aria-label="Remover copo"
            >
              <Minus className="size-5" />
            </button>
            <button
              onClick={() => {
                setWaterCups(waterCups + 1);
                toast.success("Água registrada ✓");
              }}
              className="btn-brand flex-1"
            >
              <Plus className="size-4" /> Adicionar água
            </button>
          </div>
        </>
      )}

      {tab !== "dia" && (
        <div className="card-soft">
          <div className="text-sm font-semibold mb-2">
            {tab === "semana" ? "Últimos 7 dias" : "Últimos 30 dias"}
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
                <XAxis dataKey="d" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar dataKey="v" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card-soft mt-4 bg-teal/10 border-teal/30">
        <div className="text-xs font-semibold text-teal mb-1">DICA DO DIA</div>
        <p className="text-sm">
          Beba um copo de água ao acordar — ajuda na hidratação celular e no metabolismo. 💧
        </p>
      </div>
    </div>
  );
}

function CircleProgress({ value, label }: { value: number; label: string }) {
  const r = 56,
    c = 2 * Math.PI * r;
  return (
    <div className="relative size-40 mx-auto">
      <svg viewBox="0 0 140 140" className="-rotate-90 size-40">
        <circle cx="70" cy="70" r={r} stroke="var(--muted)" strokeWidth="14" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke="#0EA5E9"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-2xl font-bold">{label}</div>
    </div>
  );
}
