import { supabase } from "@/integrations/supabase/client";

export const todayISO = () => new Date().toISOString().slice(0, 10);
export function dateISO(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export type Habit = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  frequency: string;
  target: string | null;
  time_of_day: string | null;
  active: boolean;
  start_date: string;
};

export type Workout = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration_min: number;
  level: string;
  active: boolean;
};

export type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  description: string | null;
  sets: number;
  reps: string;
  load: string | null;
  rest_seconds: number;
  notes: string | null;
  position: number;
};

/* ---------- usuário ---------- */

export async function fetchMyHabits(userId: string) {
  const { data, error } = await supabase
    .from("habit_assignments")
    .select("id, active, habit:habits(*)")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return (data ?? [])
    .map((r) => r.habit as unknown as Habit)
    .filter((h) => h && h.active);
}

export async function fetchMyCompletions(userId: string, from: string, to: string) {
  const { data, error } = await supabase
    .from("habit_completions")
    .select("habit_id, completed_on")
    .eq("user_id", userId)
    .gte("completed_on", from)
    .lte("completed_on", to);
  if (error) throw error;
  return data ?? [];
}

export async function toggleCompletion(userId: string, habitId: string, day: string, done: boolean) {
  if (done) {
    const { error } = await supabase
      .from("habit_completions")
      .delete()
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("completed_on", day);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("habit_completions")
      .insert({ user_id: userId, habit_id: habitId, completed_on: day });
    if (error) throw error;
  }
}

export async function fetchMyWorkouts(userId: string) {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("id, scheduled_date, workout:workouts(*)")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return (data ?? [])
    .map((r) => ({ scheduled_date: r.scheduled_date as string | null, workout: r.workout as unknown as Workout }))
    .filter((r) => r.workout && r.workout.active);
}

export async function fetchWorkoutExercises(workoutId: string) {
  const { data, error } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_id", workoutId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Exercise[];
}

export async function fetchMyWorkoutCompletions(userId: string) {
  const { data, error } = await supabase
    .from("workout_completions")
    .select("workout_id, completed_on")
    .eq("user_id", userId)
    .order("completed_on", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function completeWorkout(userId: string, workoutId: string) {
  const { error } = await supabase
    .from("workout_completions")
    .upsert({ user_id: userId, workout_id: workoutId, completed_on: todayISO() }, { onConflict: "workout_id,user_id,completed_on" });
  if (error) throw error;
}

export async function fetchGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

/* ---------- mensagens ---------- */

export async function fetchConversation(meId: string, otherId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${meId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${meId})`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(_meId: string, otherId: string, message: string) {
  const { error } = await supabase.rpc("send_direct_message", {
    _receiver_id: otherId,
    _message: message,
  });
  if (error) throw error;
}

export async function markConversationRead(meId: string, otherId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", meId)
    .eq("sender_id", otherId)
    .is("read_at", null);
}

export type AdminThread = {
  userId: string;
  lastAt: string;
  lastMessage: string;
  unread: number;
  total: number;
};

/** Admin: todas as conversas da plataforma agrupadas por usuário. */
export async function fetchAllConversations(meId: string, adminIds: string[]) {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, message, created_at, read_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const admins = new Set(adminIds);
  const threads = new Map<string, AdminThread>();
  for (const m of data ?? []) {
    const sender = m.sender_id as string;
    const receiver = m.receiver_id as string;
    let userId = !admins.has(sender) ? sender : !admins.has(receiver) ? receiver : sender === meId ? receiver : sender;
    if (userId === meId) userId = sender === meId ? receiver : sender;
    const entry =
      threads.get(userId) ?? { userId, lastAt: m.created_at as string, lastMessage: m.message as string, unread: 0, total: 0 };
    entry.total += 1;
    if (receiver === meId && !m.read_at) entry.unread += 1;
    threads.set(userId, entry);
  }
  return [...threads.values()].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}

/** Admin: histórico completo de mensagens de um usuário (com qualquer membro da equipe). */
export async function fetchUserMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdmins() {
  const { data, error } = await supabase.rpc("admin_contacts");
  if (error) throw error;
  return (data ?? []) as { id: string; name: string; avatar_url: string | null }[];
}

/** Todas as pessoas com quem eu já troquei mensagens, com contagem de não lidas. */
export async function fetchMyThreads(meId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, message, created_at, read_at")
    .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const threads = new Map<string, { otherId: string; lastAt: string; lastMessage: string; unread: number }>();
  for (const m of data ?? []) {
    const otherId = m.sender_id === meId ? (m.receiver_id as string) : (m.sender_id as string);
    if (otherId === meId) continue;
    const entry = threads.get(otherId) ?? {
      otherId,
      lastAt: m.created_at as string,
      lastMessage: m.message as string,
      unread: 0,
    };
    if (m.receiver_id === meId && !m.read_at) entry.unread += 1;
    threads.set(otherId, entry);
  }
  return [...threads.values()].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}

/* ---------- admin ---------- */

export async function fetchAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllHabits() {
  const { data, error } = await supabase.from("habits").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Habit[];
}

export async function fetchAllWorkouts() {
  const { data, error } = await supabase.from("workouts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Workout[];
}

export async function fetchHabitAssignments() {
  const { data, error } = await supabase.from("habit_assignments").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchWorkoutAssignments() {
  const { data, error } = await supabase.from("workout_assignments").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function assignHabit(habitId: string, userIds: string[]) {
  if (userIds.length === 0) return;
  const { error } = await supabase
    .from("habit_assignments")
    .upsert(userIds.map((u) => ({ habit_id: habitId, user_id: u, active: true })), { onConflict: "habit_id,user_id" });
  if (error) throw error;
  await supabase.from("notifications").insert(
    userIds.map((u) => ({ user_id: u, type: "habito", title: "Novo hábito atribuído", body: "Você recebeu um novo hábito.", link: "/habitos" })),
  );
}

export async function unassignHabit(habitId: string, userId: string) {
  const { error } = await supabase.from("habit_assignments").delete().eq("habit_id", habitId).eq("user_id", userId);
  if (error) throw error;
}

export async function assignWorkout(workoutId: string, userIds: string[]) {
  if (userIds.length === 0) return;
  const { error } = await supabase
    .from("workout_assignments")
    .upsert(userIds.map((u) => ({ workout_id: workoutId, user_id: u, active: true })), { onConflict: "workout_id,user_id" });
  if (error) throw error;
  await supabase.from("notifications").insert(
    userIds.map((u) => ({ user_id: u, type: "treino", title: "Novo treino atribuído", body: "Você recebeu um novo treino.", link: "/treinos" })),
  );
}

export async function unassignWorkout(workoutId: string, userId: string) {
  const { error } = await supabase.from("workout_assignments").delete().eq("workout_id", workoutId).eq("user_id", userId);
  if (error) throw error;
}


export async function fetchAdminStats() {
  const today = todayISO();
  const [users, habits, workouts, completions, weekCompletions] = await Promise.all([
    supabase.from("profiles").select("id, active, last_seen_at, created_at, goal, onboarding_completed, training_frequency"),
    supabase.from("habits").select("id, active"),
    supabase.from("workouts").select("id, active"),
    supabase.from("habit_completions").select("id").eq("completed_on", today),
    supabase.from("habit_completions").select("completed_on").gte("completed_on", dateISO(new Date(Date.now() - 6 * 864e5))),
  ]);
  const assignments = await supabase.from("habit_assignments").select("id").eq("active", true);
  const totalAssign = assignments.data?.length ?? 0;
  const list = users.data ?? [];
  const onboarded = list.filter((u) => u.onboarding_completed);
  const goalCounts = new Map<string, number>();
  for (const u of onboarded) if (u.goal) goalCounts.set(u.goal, (goalCounts.get(u.goal) ?? 0) + 1);
  const freqs = onboarded.map((u) => Number(u.training_frequency)).filter((n) => n > 0);
  return {
    onboardedUsers: onboarded.length,
    pendingOnboarding: list.length - onboarded.length,
    topGoals: [...goalCounts.entries()].sort((a, b) => b[1] - a[1]).map(([goal, count]) => ({ goal, count })),
    avgFrequency: freqs.length ? Math.round((freqs.reduce((a, b) => a + b, 0) / freqs.length) * 10) / 10 : 0,
    totalUsers: users.data?.length ?? 0,
    activeUsers: (users.data ?? []).filter((u) => u.active).length,
    activeHabits: (habits.data ?? []).filter((h) => h.active).length,
    activeWorkouts: (workouts.data ?? []).filter((w) => w.active).length,
    completionsToday: completions.data?.length ?? 0,
    completionRate: totalAssign ? Math.round(((completions.data?.length ?? 0) / totalAssign) * 100) : 0,
    week: (weekCompletions.data ?? []).map((c) => c.completed_on as string),
    users: users.data ?? [],
  };
}

/* ---------- streak / estatísticas ---------- */

export function computeStreak(days: string[]) {
  const set = new Set(days);
  let current = 0;
  const d = new Date();
  while (set.has(dateISO(d))) {
    current++;
    d.setDate(d.getDate() - 1);
  }
  const sorted = [...set].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev) {
      const diff = (new Date(day).getTime() - new Date(prev).getTime()) / 864e5;
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = day;
  }
  return { current, best, totalDays: set.size };
}

/* ---------- perfil / metas ---------- */

export async function updateMyProfile(
  userId: string,
  patch: {
    name?: string;
    avatar_url?: string | null;
    current_weight?: number | null;
    target_weight?: number | null;
    height_cm?: number | null;
    goal?: string | null;
    training_frequency?: number | null;
  },
) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target: number;
  progress: number;
  deadline: string | null;
  status: string;
  created_at: string;
};

export async function createGoal(userId: string, g: { title: string; description?: string; target: number; deadline?: string | null }) {
  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    created_by: userId,
    title: g.title,
    description: g.description || null,
    target: g.target,
    deadline: g.deadline || null,
  });
  if (error) throw error;
}

export async function updateGoal(id: string, patch: { progress?: number; status?: string; title?: string; target?: number; deadline?: string | null }) {
  const { error } = await supabase.from("goals").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
