import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapUser } from "./user.functions";
import { translateAuthError } from "@/lib/auth-errors";

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  last_seen_at: string | null;
  goal: string | null;
  goal_other: string | null;
  current_weight: number | null;
  target_weight: number | null;
  start_weight: number | null;
  height_cm: number | null;
  birth_date: string | null;
  gender: string | null;
  activity_level: string | null;
  training_frequency: number | null;
  experience_level: string | null;
  preferred_activities: string[] | null;
  available_time: number | null;
  onboarding_completed: boolean;
  onboarding_step: number;
};

type AuthState = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  role: "admin" | "user" | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  const load = useCallback(async (uid: string) => {
    try {
      await bootstrapUser({ data: {} });
    } catch {
      /* já existente ou offline */
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setRole(r?.some((x) => x.role === "admin") ? "admin" : "user");
  }, []);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "TOKEN_REFRESHED") return;
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      setEmail(session?.user?.email ?? null);
      if (!uid) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }
      void load(uid).finally(() => setLoading(false));
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      setEmail(data.session?.user?.email ?? null);
      if (!uid) return setLoading(false);
      void load(uid).finally(() => setLoading(false));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const value: AuthState = {
    loading,
    userId,
    email,
    profile,
    role,
    isAdmin: role === "admin",
    signIn: async (mail, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      return error ? { error: translateAuthError(error.message) } : {};
    },
    signUp: async (name, mail, password) => {
      const { data, error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: { data: { name, full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { error: translateAuthError(error.message) };
      return { needsConfirm: !data.session };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    requestPasswordReset: async (mail) => {
      const { error } = await supabase.auth.resetPasswordForEmail(mail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      return error ? { error: translateAuthError(error.message) } : {};
    },
    refreshProfile: async () => {
      if (userId) await load(userId);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
