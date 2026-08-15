import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Chat } from "@/components/Chat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { computeStreak } from "@/lib/queries";
import { activityLabel, experienceLabel, goalLabel, timeLabel } from "@/lib/onboarding";

export const Route = createFileRoute("/admin/users/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do usuário — Administração HealthTrack" },
      { name: "description", content: "Perfil, hábitos, treinos, progresso, metas e mensagens do usuário." },
      { property: "og:title", content: "Detalhes do usuário — HealthTrack" },
      { property: "og:description", content: "Acompanhe o progresso individual do usuário." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UserDetail,
});

const TABS = ["Perfil", "Hábitos", "Treinos", "Progresso", "Metas", "Mensagens"] as const;

function UserDetail() {
  const { id } = useParams({ from: "/admin/users/$id" });
  const { userId: meId } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Perfil");

  const { data } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const [profile, habits, workouts, completions, workoutDone, goals] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("habit_assignments").select("habit:habits(*)").eq("user_id", id),
        supabase.from("workout_assignments").select("workout:workouts(*)").eq("user_id", id),
        supabase.from("habit_completions").select("completed_on, habit_id").eq("user_id", id),
        supabase.from("workout_completions").select("completed_on, workout_id").eq("user_id", id),
        supabase.from("goals").select("*").eq("user_id", id),
      ]);
      return {
        profile: profile.data,
        habits: (habits.data ?? []).map((h) => h.habit as unknown as { id: string; name: string; icon: string; target: string | null }),
        workouts: (workouts.data ?? []).map((w) => w.workout as unknown as { id: string; name: string; category: string }),
        completions: completions.data ?? [],
        workoutDone: workoutDone.data ?? [],
        goals: goals.data ?? [],
      };
    },
  });

  const p = data?.profile;
  const streak = computeStreak((data?.completions ?? []).map((c) => c.completed_on as string));
  const name = data?.profile?.name ?? "Usuário";
  const todayDone = (data?.completions ?? []).filter((c) => c.completed_on === new Date().toISOString().slice(0, 10)).length;
  const rate = data?.habits.length ? Math.round((todayDone / data.habits.length) * 100) : 0;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="card-soft mt-4 flex items-center gap-4">
        <div className="size-14 rounded-full gradient-brand grid place-items-center text-white text-xl font-bold">{name[0]?.toUpperCase()}</div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{name}</h1>
          <p className="text-sm text-muted-foreground truncate">{data?.profile?.email}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap min-h-11 ${tab === t ? "gradient-brand text-white" : "bg-muted text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Perfil" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <Stat label="Sequência atual" value={`${streak.current} dias`} />
              <Stat label="Maior sequência" value={`${streak.best} dias`} />
              <Stat label="Dias com check-in" value={String(streak.totalDays)} />
            </div>
            <div className="card-soft">
              <h2 className="font-semibold mb-3">Perfil do usuário</h2>
              <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                <Info k="Nome" v={p?.name || "—"} />
                <Info k="E-mail" v={p?.email || "—"} />
                <Info k="Objetivo" v={p?.goal === "other" ? (p?.goal_other as string) || "Outro" : goalLabel(p?.goal as string)} />
                <Info k="Peso atual" v={p?.current_weight != null ? `${p.current_weight} kg` : "—"} />
                <Info k="Peso desejado" v={p?.target_weight != null ? `${p.target_weight} kg` : "—"} />
                <Info k="Altura" v={p?.height_cm != null ? `${p.height_cm} cm` : "—"} />
                <Info k="Data de nascimento" v={p?.birth_date ? new Date(`${p.birth_date}T00:00:00`).toLocaleDateString("pt-BR") : "—"} />
                <Info k="Nível de atividade" v={activityLabel(p?.activity_level as string)} />
                <Info k="Frequência de treino" v={p?.training_frequency ? `${p.training_frequency} dias/semana` : "—"} />
                <Info k="Experiência" v={experienceLabel(p?.experience_level as string)} />
                <Info k="Tempo disponível" v={timeLabel(p?.available_time as number)} />
                <Info k="Preferências" v={(p?.preferred_activities as string[] | null)?.join(", ") || "—"} />
                <Info k="Data de cadastro" v={p?.created_at ? new Date(p.created_at as string).toLocaleDateString("pt-BR") : "—"} />
                <Info k="Onboarding concluído" v={p?.onboarding_completed ? "Sim" : "Não"} />
              </dl>
            </div>
          </div>
        )}

        {tab === "Hábitos" && (
          <ul className="space-y-2">
            {data?.habits.length === 0 && <Empty text="Nenhum hábito atribuído." />}
            {data?.habits.map((h) => (
              <li key={h.id} className="card-soft flex items-center gap-3">
                <span className="text-xl">{h.icon}</span>
                <div className="flex-1"><div className="font-medium text-sm">{h.name}</div><div className="text-xs text-muted-foreground">{h.target ?? "—"}</div></div>
                <span className="text-xs text-muted-foreground">
                  {(data?.completions ?? []).filter((c) => c.habit_id === h.id).length} conclusões
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === "Treinos" && (
          <ul className="space-y-2">
            {data?.workouts.length === 0 && <Empty text="Nenhum treino atribuído." />}
            {data?.workouts.map((w) => (
              <li key={w.id} className="card-soft flex items-center justify-between">
                <div><div className="font-medium text-sm">{w.name}</div><div className="text-xs text-muted-foreground">{w.category}</div></div>
                <span className="text-xs text-muted-foreground">{(data?.workoutDone ?? []).filter((c) => c.workout_id === w.id).length} realizados</span>
              </li>
            ))}
          </ul>
        )}

        {tab === "Progresso" && (
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat label="Hábitos concluídos hoje" value={`${todayDone}/${data?.habits.length ?? 0}`} />
            <Stat label="Taxa de conclusão hoje" value={`${rate}%`} />
            <Stat label="Treinos realizados" value={String(data?.workoutDone.length ?? 0)} />
          </div>
        )}

        {tab === "Metas" && (
          <ul className="space-y-2">
            {data?.goals.length === 0 && <Empty text="Nenhuma meta cadastrada." />}
            {data?.goals.map((g) => (
              <li key={g.id as string} className="card-soft">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{g.title as string}</span>
                  <span className="text-xs text-muted-foreground">{Math.round((Number(g.progress) / Number(g.target || 1)) * 100)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-brand" style={{ width: `${Math.min(100, (Number(g.progress) / Number(g.target || 1)) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "Mensagens" && meId && (
          <div className="card-soft p-0 overflow-hidden"><Chat meId={meId} otherId={id} otherName={name} /></div>
        )}
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <li className="card-soft text-center text-sm text-muted-foreground py-8 list-none">{text}</li>;
}
