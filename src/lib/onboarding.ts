import { supabase } from "@/integrations/supabase/client";

export const GOALS = [
  { id: "weight_loss", icon: "🎯", label: "Perder peso" },
  { id: "muscle_gain", icon: "💪", label: "Ganhar massa muscular" },
  { id: "maintain_weight", icon: "⚖️", label: "Manter o peso" },
  { id: "conditioning", icon: "🏃", label: "Melhorar o condicionamento físico" },
  { id: "health_habits", icon: "❤️", label: "Melhorar minha saúde e meus hábitos" },
  { id: "other", icon: "✨", label: "Outro" },
] as const;

export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
  { id: "lightly_active", label: "Pouco ativo", desc: "1-2 dias por semana" },
  { id: "moderately_active", label: "Moderadamente ativo", desc: "3-4 dias por semana" },
  { id: "very_active", label: "Muito ativo", desc: "5-6 dias por semana" },
  { id: "extremely_active", label: "Extremamente ativo", desc: "Todos os dias / atleta" },
] as const;

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Iniciante" },
  { id: "intermediate", label: "Intermediário" },
  { id: "advanced", label: "Avançado" },
] as const;

export const PREFERRED_ACTIVITIES = [
  "Musculação",
  "Caminhada",
  "Corrida",
  "Ciclismo",
  "Treino funcional",
  "Alongamento",
  "Cardio",
  "Esportes",
  "Outro",
] as const;

export const AVAILABLE_TIMES = [15, 30, 45, 60, 90] as const;

export const GENDERS = [
  { id: "female", label: "Feminino" },
  { id: "male", label: "Masculino" },
  { id: "other", label: "Outro" },
  { id: "prefer_not_to_say", label: "Prefiro não informar" },
] as const;

export function goalLabel(id: string | null | undefined) {
  return GOALS.find((g) => g.id === id)?.label ?? "—";
}
export function activityLabel(id: string | null | undefined) {
  return ACTIVITY_LEVELS.find((a) => a.id === id)?.label ?? "—";
}
export function experienceLabel(id: string | null | undefined) {
  return EXPERIENCE_LEVELS.find((e) => e.id === id)?.label ?? "—";
}
export function timeLabel(min: number | null | undefined) {
  if (!min) return "—";
  return min >= 90 ? "90 minutos ou mais" : `${min} minutos`;
}
export function targetWeightQuestion(goal: string | null | undefined) {
  if (goal === "maintain_weight") return "Qual peso você deseja manter?";
  return "Qual é o seu peso desejado?";
}

export type OnboardingDraft = {
  name: string;
  goal: string | null;
  goal_other: string | null;
  current_weight: number | null;
  target_weight: number | null;
  height_cm: number | null;
  birth_date: string | null;
  gender: string | null;
  activity_level: string | null;
  training_frequency: number | null;
  experience_level: string | null;
  preferred_activities: string[];
  available_time: number | null;
};

export const TOTAL_STEPS = 10;

/** Salva o progresso parcial do onboarding no perfil do usuário. */
export async function saveOnboardingProgress(
  userId: string,
  patch: Partial<OnboardingDraft>,
  step: number,
) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, onboarding_step: step })
    .eq("id", userId);
  if (error) throw error;
}

/** Conclui o onboarding e marca o perfil como configurado. */
export async function finishOnboarding(userId: string, draft: OnboardingDraft) {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...draft,
      start_weight: draft.current_weight,
      onboarding_step: TOTAL_STEPS,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
}
