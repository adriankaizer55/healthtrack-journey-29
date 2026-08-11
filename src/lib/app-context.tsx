import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Goal = "perder" | "manter" | "ganhar" | "saude";
type Activity = "sedentario" | "leve" | "moderado" | "intenso";
type Contrast = "off" | "bw" | "yellow" | "blue";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: string;
  value: string;
  done: boolean;
};

export type Meal = {
  id: string;
  name: string;
  category: string;
  time: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type State = {
  user: { name: string; email: string };
  setUser: (u: Partial<State["user"]>) => void;
  goal: Goal; setGoal: (g: Goal) => void;
  weight: number; setWeight: (n: number) => void;
  targetWeight: number; setTargetWeight: (n: number) => void;
  activity: Activity; setActivity: (a: Activity) => void;
  unit: "kg" | "lb"; setUnit: (u: "kg" | "lb") => void;

  habits: Habit[];
  toggleHabit: (id: string) => void;
  addHabit: (h: Omit<Habit, "id" | "done">) => void;
  removeHabit: (id: string) => void;
  doneByDay: Record<number, string[]>;
  toggleHabitDay: (day: number, id: string) => void;

  meals: Meal[];
  addMeal: (m: Omit<Meal, "id">) => void;

  waterCups: number;          // 0..8 (250ml each)
  setWaterCups: (n: number) => void;
  streak: number;

  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  contrast: Contrast; setContrast: (c: Contrast) => void;
  fontScale: number; setFontScale: (n: number) => void;
  simpleRead: boolean; setSimpleRead: (b: boolean) => void;
  voiceNav: boolean; setVoiceNav: (b: boolean) => void;

  notifPrefs: { hidratacao: boolean; habitos: boolean; ia: boolean; relatorio: boolean };
  setNotifPref: (k: keyof State["notifPrefs"], v: boolean) => void;
};

const Ctx = createContext<State | null>(null);

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Beber água", icon: "💧", color: "bg-sky-500", goal: "2L", value: "1.5L", done: false },
  { id: "h2", name: "Caminhar", icon: "🚶", color: "bg-emerald-500", goal: "8000 passos", value: "5200", done: true },
  { id: "h3", name: "Meditar", icon: "🧘", color: "bg-violet-500", goal: "10 min", value: "10 min", done: true },
  { id: "h4", name: "Dormir bem", icon: "😴", color: "bg-indigo-500", goal: "8h", value: "7h30", done: false },
  { id: "h5", name: "Treino", icon: "🏋️", color: "bg-orange-500", goal: "30 min", value: "0", done: false },
  { id: "h6", name: "Frutas", icon: "🍎", color: "bg-rose-500", goal: "3 porções", value: "2", done: false },
];

const DEFAULT_MEALS: Meal[] = [
  { id: "m1", name: "Aveia com banana", category: "Café", time: "07:30", kcal: 320, protein: 12, carbs: 55, fat: 6 },
  { id: "m2", name: "Frango grelhado com arroz", category: "Almoço", time: "12:30", kcal: 540, protein: 42, carbs: 60, fat: 12 },
  { id: "m3", name: "Iogurte com castanhas", category: "Lanche", time: "16:00", kcal: 220, protein: 14, carbs: 18, fat: 10 },
];

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function saveLS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUserState] = useState({ name: "Adrian", email: "adrian@email.com" });
  const [goal, setGoal] = useState<Goal>("perder");
  const [weight, setWeight] = useState<number>(78);
  const [targetWeight, setTargetWeight] = useState<number>(72);
  const [activity, setActivity] = useState<Activity>("moderado");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [waterCups, setWaterCups] = useState<number>(4);
  const [streak] = useState(7);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [contrast, setContrastState] = useState<Contrast>("off");
  const [fontScale, setFontScaleState] = useState<number>(1);
  const [simpleRead, setSimpleRead] = useState<boolean>(false);
  const [voiceNav, setVoiceNav] = useState<boolean>(false);
  const [notifPrefs, setNotifPrefs] = useState({ hidratacao: true, habitos: true, ia: false, relatorio: true });

  // Restaura dados salvos apenas após a hidratação (evita divergência SSR/cliente)
  useEffect(() => {
    setUserState((p) => loadLS("ht_user", p));
    setGoal((p) => loadLS("ht_goal", p));
    setWeight((p) => loadLS("ht_weight", p));
    setTargetWeight((p) => loadLS("ht_tweight", p));
    setActivity((p) => loadLS("ht_activity", p));
    setUnit((p) => loadLS("ht_unit", p));
    setHabits((p) => loadLS("ht_habits", p));
    setMeals((p) => loadLS("ht_meals", p));
    setWaterCups((p) => loadLS("ht_water", p));
    setThemeState((p) => loadLS("ht_theme", p));
    setContrastState((p) => loadLS("ht_contrast", p));
    setFontScaleState((p) => loadLS("ht_font", p));
    setSimpleRead((p) => loadLS("ht_simple", p));
    setVoiceNav((p) => loadLS("ht_voice", p));
    setNotifPrefs((p) => loadLS("ht_notif", p));
    setHydrated(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.remove("hc-bw", "hc-yellow", "hc-blue");
    if (contrast !== "off") root.classList.add(`hc-${contrast}`);
    root.style.setProperty("--app-font-scale", String(fontScale));
    if (!hydrated) return;
    saveLS("ht_theme", theme);
    saveLS("ht_contrast", contrast);
    saveLS("ht_font", fontScale);
  }, [theme, contrast, fontScale, hydrated]);

  useEffect(() => { if (hydrated) saveLS("ht_habits", habits); }, [habits, hydrated]);
  useEffect(() => { if (hydrated) saveLS("ht_meals", meals); }, [meals, hydrated]);
  useEffect(() => { if (hydrated) saveLS("ht_water", waterCups); }, [waterCups, hydrated]);
  useEffect(() => { if (hydrated) saveLS("ht_user", user); }, [user, hydrated]);
  useEffect(() => { if (hydrated) saveLS("ht_notif", notifPrefs); }, [notifPrefs, hydrated]);


  const value: State = {
    user,
    setUser: (u) => setUserState((p) => ({ ...p, ...u })),
    goal, setGoal,
    weight, setWeight,
    targetWeight, setTargetWeight,
    activity, setActivity,
    unit, setUnit,
    habits,
    toggleHabit: (id) => setHabits((hs) => hs.map((h) => h.id === id ? { ...h, done: !h.done } : h)),
    addHabit: (h) => setHabits((hs) => [...hs, { ...h, id: `h${Date.now()}`, done: false }]),
    removeHabit: (id) => setHabits((hs) => hs.filter((h) => h.id !== id)),
    meals,
    addMeal: (m) => setMeals((ms) => [...ms, { ...m, id: `m${Date.now()}` }]),
    waterCups,
    setWaterCups: (n) => setWaterCups(Math.max(0, Math.min(8, n))),
    streak,
    theme, setTheme: setThemeState,
    contrast, setContrast: setContrastState,
    fontScale, setFontScale: setFontScaleState,
    simpleRead, setSimpleRead,
    voiceNav, setVoiceNav,
    notifPrefs,
    setNotifPref: (k, v) => setNotifPrefs((p) => ({ ...p, [k]: v })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
