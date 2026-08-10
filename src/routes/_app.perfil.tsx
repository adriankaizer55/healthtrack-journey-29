import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { ArrowLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BADGES = [
  { id: 1, name: "Primeira semana", emoji: "🏅", unlocked: true },
  { id: 2, name: "30 dias hidratado", emoji: "💧", unlocked: false },
  { id: 3, name: "Madrugador", emoji: "☀️", unlocked: true },
  { id: 4, name: "Mestre dos hábitos", emoji: "🏆", unlocked: false },
  { id: 5, name: "Foco total", emoji: "🎯", unlocked: true },
  { id: 6, name: "Maratonista", emoji: "🏃", unlocked: false },
];

export const Route = createFileRoute("/_app/perfil")({ component: Perfil });

function Perfil() {
  const nav = useNavigate();
  const { user, setUser, weight, setWeight, targetWeight, setTargetWeight, unit, setUnit } =
    useApp();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link
        to="/mais"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Perfil</h1>

      <div className="card-soft text-center mb-4">
        <button
          className="relative size-24 rounded-full gradient-brand grid place-items-center text-white text-3xl font-bold mx-auto"
          aria-label="Trocar foto"
        >
          {name[0]?.toUpperCase()}
          <span className="absolute bottom-0 right-0 size-7 rounded-full bg-card border-2 border-card grid place-items-center text-xs">
            📷
          </span>
        </button>
        <div className="mt-3 font-semibold text-lg">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setUser({ name, email });
          toast.success("Configurações salvas ✓");
        }}
        className="card-soft space-y-3 mb-4"
      >
        <Field label="Nome" value={name} onChange={setName} />
        <Field label="E-mail" type="email" value={email} onChange={setEmail} />
        <div className="grid grid-cols-2 gap-3">
          <NumF label="Peso atual" value={weight} onChange={setWeight} />
          <NumF label="Meta" value={targetWeight} onChange={setTargetWeight} />
        </div>
        <div>
          <label className="text-sm font-medium">Unidade</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["kg", "lb"] as const).map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setUnit(u)}
                className={`h-11 rounded-xl font-medium ${unit === u ? "gradient-brand text-white" : "bg-muted text-muted-foreground"}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-brand w-full">Salvar</button>
      </form>

      <h2 className="text-lg font-bold mb-2">Conquistas</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {BADGES.map((b) => (
          <div
            key={b.id}
            className={`card-soft text-center ${b.unlocked ? "" : "opacity-40 grayscale"}`}
          >
            <div className="text-3xl">{b.emoji}</div>
            <div className="text-xs font-medium mt-1">{b.name}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => nav({ to: "/login" })}
        className="w-full h-12 rounded-xl border border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10"
      >
        <LogOut className="size-5" /> Sair da conta
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background"
      />
    </div>
  );
}
function NumF({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background"
      />
    </div>
  );
}
