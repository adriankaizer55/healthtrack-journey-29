import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import {
  ACTIVITY_LEVELS,
  AVAILABLE_TIMES,
  EXPERIENCE_LEVELS,
  GENDERS,
  GOALS,
  PREFERRED_ACTIVITIES,
  TOTAL_STEPS,
  activityLabel,
  experienceLabel,
  finishOnboarding,
  goalLabel,
  saveOnboardingProgress,
  targetWeightQuestion,
  timeLabel,
  type OnboardingDraft,
} from "@/lib/onboarding";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Vamos conhecer você — HealthTrack" },
      { name: "description", content: "Configure seu perfil no HealthTrack: objetivo, peso, altura, rotina de treinos e preferências." },
      { property: "og:title", content: "Vamos conhecer você — HealthTrack" },
      { property: "og:description", content: "Personalize sua experiência no HealthTrack em poucos passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const EMPTY: OnboardingDraft = {
  name: "",
  goal: null,
  goal_other: null,
  current_weight: null,
  target_weight: null,
  height_cm: null,
  birth_date: null,
  gender: null,
  activity_level: null,
  training_frequency: null,
  experience_level: null,
  preferred_activities: [],
  available_time: null,
};

function Onboarding() {
  const nav = useNavigate();
  const { loading, userId, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sem sessão → login. Onboarding já concluído → dashboard.
  useEffect(() => {
    if (loading) return;
    if (!userId) nav({ to: "/login", replace: true });
    else if (profile?.onboarding_completed) nav({ to: "/dashboard", replace: true });
  }, [loading, userId, profile, nav]);

  // Retoma de onde o usuário parou.
  useEffect(() => {
    if (hydrated || !profile) return;
    setDraft({
      name: profile.name || "",
      goal: profile.goal ?? null,
      goal_other: profile.goal_other ?? null,
      current_weight: profile.current_weight ?? null,
      target_weight: profile.target_weight ?? null,
      height_cm: profile.height_cm ?? null,
      birth_date: profile.birth_date ?? null,
      gender: profile.gender ?? null,
      activity_level: profile.activity_level ?? null,
      training_frequency: profile.training_frequency ?? null,
      experience_level: profile.experience_level ?? null,
      preferred_activities: profile.preferred_activities ?? [],
      available_time: profile.available_time ?? null,
    });
    setStep(Math.min(Math.max(profile.onboarding_step || 1, 1), TOTAL_STEPS));
    setHydrated(true);
  }, [profile, hydrated]);

  const set = <K extends keyof OnboardingDraft>(k: K, v: OnboardingDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const pct = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  function validate(): string | null {
    switch (step) {
      case 1:
        return draft.name.trim().length >= 2 ? null : "Informe seu nome.";
      case 2:
        if (!draft.goal) return "Selecione seu objetivo.";
        if (draft.goal === "other" && !draft.goal_other?.trim()) return "Descreva seu objetivo.";
        return null;
      case 3:
        if (!draft.current_weight || draft.current_weight <= 0 || draft.current_weight > 500)
          return "Informe seu peso atual.";
        return null;
      case 4:
        if (!draft.target_weight || draft.target_weight <= 0 || draft.target_weight > 500)
          return "Informe sua meta de peso.";
        return null;
      case 5:
        if (!draft.height_cm || draft.height_cm <= 0 || draft.height_cm > 260)
          return "Informe sua altura em centímetros.";
        return null;
      case 6:
        return draft.activity_level ? null : "Selecione seu nível de atividade.";
      case 7:
        return draft.training_frequency ? null : "Escolha quantos dias por semana pretende treinar.";
      case 8:
        return draft.experience_level ? null : "Selecione seu nível de experiência.";
      case 9:
        return draft.preferred_activities.length > 0 ? null : "Escolha ao menos uma atividade.";
      case 10:
        return draft.available_time ? null : "Escolha o tempo disponível para treinar.";
      default:
        return null;
    }
  }

  async function next() {
    const err = validate();
    if (err) return toast.error(err);
    if (!userId) return;
    const target = step + 1;
    setBusy(true);
    try {
      await saveOnboardingProgress(userId, draft, Math.min(target, TOTAL_STEPS));
      setStep(Math.min(target, TOTAL_STEPS + 1));
    } catch {
      toast.error("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    if (!userId) return;
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      const saved = step;
      setStep(s);
      const err = validate();
      setStep(saved);
      if (err) {
        setStep(s);
        return toast.error(err);
      }
    }
    setBusy(true);
    try {
      await finishOnboarding(userId, draft);
      await refreshProfile();
      toast.success("Perfil configurado! Bem-vindo ao HealthTrack.");
      nav({ to: "/dashboard", replace: true });
    } catch {
      toast.error("Não foi possível concluir agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !userId) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const isSummary = step > TOTAL_STEPS;

  return (
    <div className="min-h-dvh bg-background px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-6">
          <Logo size={44} />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{isSummary ? "Resumo" : `Etapa ${step} de ${TOTAL_STEPS}`}</span>
            <span>{Math.round(isSummary ? 100 : pct)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-brand transition-all" style={{ width: `${isSummary ? 100 : pct}%` }} />
          </div>
        </div>

        {step === 1 && (
          <Section title="Olá! Vamos conhecer você." subtitle="Como podemos chamar você?">
            <Field label="Nome completo">
              <input value={draft.name} onChange={(e) => set("name", e.target.value)} autoComplete="name"
                placeholder="Seu nome" className={inputCls} />
            </Field>
          </Section>
        )}

        {step === 2 && (
          <Section title="Qual é o seu principal objetivo?" subtitle="Isso nos ajuda a personalizar sua experiência no HealthTrack.">
            <div className="grid sm:grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button key={g.id} type="button" onClick={() => set("goal", g.id)}
                  className={`card-soft text-left min-h-24 transition-all ${draft.goal === g.id ? "ring-2 ring-primary" : ""}`}>
                  <div className="text-3xl">{g.icon}</div>
                  <div className="mt-2 font-semibold text-sm">{g.label}</div>
                </button>
              ))}
            </div>
            {draft.goal === "other" && (
              <div className="mt-4">
                <Field label="Descreva seu objetivo">
                  <input value={draft.goal_other ?? ""} onChange={(e) => set("goal_other", e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}
          </Section>
        )}

        {step === 3 && (
          <Section title="Vamos falar sobre seu peso." subtitle="Informe seu peso atual em quilos.">
            <Field label="Peso atual (kg)">
              <input type="number" inputMode="decimal" step="0.1" min="1" max="500" placeholder="62,3"
                value={draft.current_weight ?? ""} onChange={(e) => set("current_weight", e.target.value ? Number(e.target.value) : null)}
                className={inputCls} />
            </Field>
          </Section>
        )}

        {step === 4 && (
          <Section title={targetWeightQuestion(draft.goal)} subtitle="Você poderá ajustar isso depois no seu perfil.">
            <Field label="Peso desejado (kg)">
              <input type="number" inputMode="decimal" step="0.1" min="1" max="500" placeholder="68,0"
                value={draft.target_weight ?? ""} onChange={(e) => set("target_weight", e.target.value ? Number(e.target.value) : null)}
                className={inputCls} />
            </Field>
          </Section>
        )}

        {step === 5 && (
          <Section title="Agora precisamos de algumas informações para personalizar sua experiência.">
            <Field label="Altura (cm)">
              <input type="number" inputMode="numeric" min="1" max="260" placeholder="175"
                value={draft.height_cm ?? ""} onChange={(e) => set("height_cm", e.target.value ? Number(e.target.value) : null)}
                className={inputCls} />
            </Field>
            <Field label="Data de nascimento (opcional)">
              <input type="date" value={draft.birth_date ?? ""} onChange={(e) => set("birth_date", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Sexo / gênero (opcional)">
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <button key={g.id} type="button" onClick={() => set("gender", draft.gender === g.id ? null : g.id)}
                    className={`h-12 rounded-xl border text-sm font-medium ${draft.gender === g.id ? "border-primary ring-2 ring-primary/40" : "border-border hover:bg-muted"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>
          </Section>
        )}

        {step === 6 && (
          <Section title="Como é seu nível atual de atividade?">
            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((a) => (
                <button key={a.id} type="button" onClick={() => set("activity_level", a.id)}
                  className={`card-soft w-full text-left flex items-center justify-between min-h-16 transition-all ${draft.activity_level === a.id ? "ring-2 ring-primary" : ""}`}>
                  <div>
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.desc}</div>
                  </div>
                  {draft.activity_level === a.id && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 7 && (
          <Section title="Quantos dias por semana você pretende treinar?">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button key={n} type="button" onClick={() => set("training_frequency", n)}
                  className={`h-16 rounded-xl border font-bold text-lg ${draft.training_frequency === n ? "gradient-brand text-white border-transparent" : "border-border hover:bg-muted"}`}>
                  {n}
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 8 && (
          <Section title="Qual é o seu nível de experiência?">
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((e) => (
                <button key={e.id} type="button" onClick={() => set("experience_level", e.id)}
                  className={`card-soft w-full text-left flex items-center justify-between min-h-14 transition-all ${draft.experience_level === e.id ? "ring-2 ring-primary" : ""}`}>
                  <span className="font-semibold">{e.label}</span>
                  {draft.experience_level === e.id && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 9 && (
          <Section title="Que atividades você gosta?" subtitle="Escolha quantas quiser.">
            <div className="grid grid-cols-2 gap-2">
              {PREFERRED_ACTIVITIES.map((a) => {
                const on = draft.preferred_activities.includes(a);
                return (
                  <button key={a} type="button"
                    onClick={() => set("preferred_activities", on ? draft.preferred_activities.filter((x) => x !== a) : [...draft.preferred_activities, a])}
                    className={`min-h-14 rounded-xl border px-3 text-sm font-medium ${on ? "border-primary ring-2 ring-primary/40" : "border-border hover:bg-muted"}`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {step === 10 && (
          <Section title="Quanto tempo você normalmente tem disponível para treinar?">
            <div className="space-y-2">
              {AVAILABLE_TIMES.map((t) => (
                <button key={t} type="button" onClick={() => set("available_time", t)}
                  className={`card-soft w-full text-left flex items-center justify-between min-h-14 ${draft.available_time === t ? "ring-2 ring-primary" : ""}`}>
                  <span className="font-semibold">{timeLabel(t)}</span>
                  {draft.available_time === t && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {isSummary && (
          <Section title="Confira seu perfil" subtitle="Você pode alterar tudo depois no seu perfil.">
            <div className="card-soft space-y-2">
              <Row k="Nome" v={draft.name} />
              <Row k="Objetivo" v={draft.goal === "other" ? draft.goal_other || "Outro" : goalLabel(draft.goal)} />
              <Row k="Peso atual" v={`${draft.current_weight ?? "—"} kg`} />
              <Row k="Peso desejado" v={`${draft.target_weight ?? "—"} kg`} />
              <Row k="Altura" v={`${draft.height_cm ?? "—"} cm`} />
              {draft.birth_date && <Row k="Nascimento" v={new Date(`${draft.birth_date}T00:00:00`).toLocaleDateString("pt-BR")} />}
              <Row k="Nível de atividade" v={activityLabel(draft.activity_level)} />
              <Row k="Treinos por semana" v={`${draft.training_frequency ?? "—"} dias`} />
              <Row k="Experiência" v={experienceLabel(draft.experience_level)} />
              <Row k="Tempo disponível" v={timeLabel(draft.available_time)} />
              <Row k="Preferências" v={draft.preferred_activities.join(", ") || "—"} />
            </div>
          </Section>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12 rounded-xl border border-border font-medium hover:bg-muted">← Voltar</button>
          )}
          {isSummary ? (
            <button type="button" onClick={finish} disabled={busy}
              className="btn-brand flex-1 h-12 inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Finalizar configuração
            </button>
          ) : (
            <button type="button" onClick={next} disabled={busy}
              className="btn-brand flex-1 h-12 inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 w-full h-12 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 mb-4 text-sm text-muted-foreground">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold text-right">{v}</span>
    </div>
  );
}
