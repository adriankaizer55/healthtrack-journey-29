import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import {
  computeStreak,
  fetchMyCompletions,
  fetchMyWorkoutCompletions,
  todayISO,
  updateMyProfile,
} from "@/lib/queries";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — HealthTrack" },
      { name: "description", content: "Atualize seus dados, veja seu streak e conquistas no HealthTrack." },
      { property: "og:title", content: "Meu perfil — HealthTrack" },
      { property: "og:description", content: "Dados pessoais, streak e conquistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const nav = useNavigate();
  const { userId, email, profile, refreshProfile, signOut } = useAuth();
  const { unit, setUnit } = useApp();
  const [name, setName] = useState("");
  const [weight, setWeight] = useState(0);
  const [targetWeight, setTargetWeight] = useState(0);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setWeight(Number(profile.current_weight ?? 0));
    setTargetWeight(Number(profile.target_weight ?? 0));
  }, [profile]);

  const { data: completions = [] } = useQuery({
    queryKey: ["my-completions-all", userId],
    queryFn: () => fetchMyCompletions(userId!, "2000-01-01", todayISO()),
    enabled: !!userId,
  });
  const { data: workoutDone = [] } = useQuery({
    queryKey: ["my-workout-completions", userId],
    queryFn: () => fetchMyWorkoutCompletions(userId!),
    enabled: !!userId,
  });

  const stats = useMemo(() => computeStreak(completions.map((c) => c.completed_on as string)), [completions]);

  const badges = [
    { id: 1, name: "Primeira semana", emoji: "🏅", unlocked: stats.totalDays >= 7 },
    { id: 2, name: "Streak de 7 dias", emoji: "🔥", unlocked: stats.best >= 7 },
    { id: 3, name: "30 dias ativos", emoji: "☀️", unlocked: stats.totalDays >= 30 },
    { id: 4, name: "Mestre dos hábitos", emoji: "🏆", unlocked: completions.length >= 100 },
    { id: 5, name: "Primeiro treino", emoji: "💪", unlocked: workoutDone.length >= 1 },
    { id: 6, name: "Maratonista", emoji: "🏃", unlocked: workoutDone.length >= 20 },
  ];

  const save = useMutation({
    mutationFn: () =>
      updateMyProfile(userId!, {
        name: name.trim(),
        current_weight: weight > 0 ? weight : null,
        target_weight: targetWeight > 0 ? targetWeight : null,
      }),
    onSuccess: async () => { await refreshProfile(); toast.success("Perfil salvo ✓"); },
    onError: () => toast.error("Não foi possível salvar o perfil."),
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Perfil</h1>

      <div className="card-soft text-center mb-4">
        <div className="size-24 rounded-full gradient-brand grid place-items-center text-white text-3xl font-bold mx-auto">
          {(name || "H")[0]?.toUpperCase()}
        </div>
        <div className="mt-3 font-semibold text-lg">{name || "Sem nome"}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
        <div className="mt-3 flex justify-center gap-6 text-sm">
          <div><div className="font-bold text-lg">{stats.current}</div><div className="text-muted-foreground text-xs">streak atual</div></div>
          <div><div className="font-bold text-lg">{stats.best}</div><div className="text-muted-foreground text-xs">melhor streak</div></div>
          <div><div className="font-bold text-lg">{stats.totalDays}</div><div className="text-muted-foreground text-xs">dias ativos</div></div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) save.mutate(); }} className="card-soft space-y-3 mb-4">
        <Field label="Nome" value={name} onChange={setName} />
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input value={email ?? ""} disabled className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-muted text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumF label="Peso atual" value={weight} onChange={setWeight} />
          <NumF label="Meta" value={targetWeight} onChange={setTargetWeight} />
        </div>
        <div>
          <label className="text-sm font-medium">Unidade</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["kg", "lb"] as const).map((u) => (
              <button type="button" key={u} onClick={() => setUnit(u)}
                className={`h-11 rounded-xl font-medium ${unit === u ? "gradient-brand text-white" : "bg-muted text-muted-foreground"}`}>{u}</button>
            ))}
          </div>
        </div>
        <button disabled={save.isPending} className="btn-brand w-full disabled:opacity-60">{save.isPending ? "Salvando..." : "Salvar"}</button>
      </form>

      <h2 className="text-lg font-bold mb-2">Conquistas</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {badges.map((b) => (
          <div key={b.id} className={`card-soft text-center ${b.unlocked ? "" : "opacity-40 grayscale"}`}>
            <div className="text-3xl">{b.emoji}</div>
            <div className="text-xs font-medium mt-1">{b.name}</div>
          </div>
        ))}
      </div>

      <button onClick={async () => { await signOut(); nav({ to: "/login" }); }}
        className="w-full h-12 rounded-xl border border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10">
        <LogOut className="size-5" /> Sair da conta
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background" />
    </div>
  );
}
function NumF({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background" />
    </div>
  );
}
