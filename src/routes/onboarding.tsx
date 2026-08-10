import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const GOALS = [
  { id: "perder", label: "Perder peso", icon: "📉" },
  { id: "manter", label: "Manter peso", icon: "⚖️" },
  { id: "ganhar", label: "Ganhar massa", icon: "💪" },
  { id: "saude", label: "Melhorar saúde", icon: "❤️" },
] as const;
const ACTIVITY = [
  { id: "sedentario", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
  { id: "leve", label: "Leve", desc: "1-3 dias/semana" },
  { id: "moderado", label: "Moderado", desc: "3-5 dias/semana" },
  { id: "intenso", label: "Intenso", desc: "6-7 dias/semana" },
] as const;

function Onboarding() {
  const nav = useNavigate();
  const app = useApp();
  const [step, setStep] = useState(1);
  const pct = (step / 4) * 100;

  return (
    <div className="min-h-dvh bg-background px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Etapa {step} de 4</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {step === 1 && (
          <Section title="Qual é seu objetivo?">
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => app.setGoal(g.id)}
                  className={`card-soft text-left transition-all ${app.goal === g.id ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="text-3xl">{g.icon}</div>
                  <div className="mt-2 font-semibold">{g.label}</div>
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 2 && (
          <Section title="Seu peso">
            <NumField label="Peso atual (kg)" value={app.weight} onChange={app.setWeight} />
            <NumField
              label="Peso meta (kg)"
              value={app.targetWeight}
              onChange={app.setTargetWeight}
            />
          </Section>
        )}

        {step === 3 && (
          <Section title="Nível de atividade">
            <div className="space-y-3">
              {ACTIVITY.map((a) => (
                <button
                  key={a.id}
                  onClick={() => app.setActivity(a.id)}
                  className={`card-soft w-full text-left flex items-center justify-between transition-all ${app.activity === a.id ? "ring-2 ring-primary" : ""}`}
                >
                  <div>
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
                  </div>
                  {app.activity === a.id && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 4 && (
          <Section title={`Tudo pronto, ${app.user.name}!`}>
            <div className="card-soft space-y-2">
              <Row k="Objetivo" v={GOALS.find((g) => g.id === app.goal)?.label || "—"} />
              <Row k="Peso atual" v={`${app.weight} kg`} />
              <Row k="Meta" v={`${app.targetWeight} kg`} />
              <Row k="Atividade" v={ACTIVITY.find((a) => a.id === app.activity)?.label || "—"} />
            </div>
          </Section>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12 rounded-xl border border-border font-medium"
            >
              Voltar
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-brand flex-1 h-12">
              Continuar
            </button>
          ) : (
            <button onClick={() => nav({ to: "/dashboard" })} className="btn-brand flex-1 h-12">
              Começar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
