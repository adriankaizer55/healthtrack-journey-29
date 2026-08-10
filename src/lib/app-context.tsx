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
  goal: Goal;
  setGoal: (g: Goal) => void;
  weight: number;
  setWeight: (n: number) => void;
  targetWeight: number;
  setTargetWeight: (n: number) => void;
  activity: Activity;
  setActivity: (a: Activity) => void;
  unit: "kg" | "lb";
  setUnit: (u: "kg" | "lb") => void;

  habits: Habit[];
  toggleHabit: (id: string) => void;

  meals: Meal[];
  addMeal: (m: Omit<Meal, "id">) => void;

  waterCups: number; // 0..8 (250ml each)
  setWaterCups: (n: number) => void;
  streak: number;

  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  contrast: Contrast;
  setContrast: (c: Contrast) => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  simpleRead: boolean;
  setSimpleRead: (b: boolean) => void;
  voiceNav: boolean;
  setVoiceNav: (b: boolean) => void;

  notifPrefs: { hidratacao: boolean; habitos: boolean; ia: boolean; relatorio: boolean };
  setNotifPref: (k: keyof State["notifPrefs"], v: boolean) => void;
};

const Ctx = createContext<State | null>(null);

const DEFAULT_HABITS: Habit[] = [
  {
    id: "h1",
    name: "Beber água",
    icon: "💧",
    color: "bg-sky-500",
    goal: "2L",
    value: "1.5L",
    done: false,
  },
  {
    id: "h2",
    name: "Caminhar",
    icon: "🚶",
    color: "bg-emerald-500",
    goal: "8000 passos",
    value: "5200",
    done: true,
  },
  {
    id: "h3",
    name: "Meditar",
    icon: "🧘",
    color: "bg-violet-500",
    goal: "10 min",
    value: "10 min",
    done: true,
  },
  {
    id: "h4",
    name: "Dormir bem",
    icon: "😴",
    color: "bg-indigo-500",
    goal: "8h",
    value: "7h30",
    done: false,
  },
  {
    id: "h5",
    name: "Treino",
    icon: "🏋️",
    color: "bg-orange-500",
    goal: "30 min",
    value: "0",
    done: false,
  },
  {
    id: "h6",
    name: "Frutas",
    icon: "🍎",
    color: "bg-rose-500",
    goal: "3 porções",
    value: "2",
    done: false,
  },
];

const DEFAULT_MEALS: Meal[] = [
  {
    id: "m1",
    name: "Aveia com banana",
    category: "Café",
    time: "07:30",
    kcal: 320,
    protein: 12,
    carbs: 55,
    fat: 6,
  },
  {
    id: "m2",
    name: "Frango grelhado com arroz",
    category: "Almoço",
    time: "12:30",
    kcal: 540,
    protein: 42,
    carbs: 60,
    fat: 12,
  },
  {
    id: "m3",
    name: "Iogurte com castanhas",
    category: "Lanche",
    time: "16:00",
    kcal: 220,
    protein: 14,
    carbs: 18,
    fat: 10,
  },
];

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState(() =>
    loadLS("ht_user", { name: "Adrian", email: "adrian@email.com" }),
  );
  const [goal, setGoal] = useState<Goal>(() => loadLS("ht_goal", "perder"));
  const [weight, setWeight] = useState<number>(() => loadLS("ht_weight", 78));
  const [targetWeight, setTargetWeight] = useState<number>(() => loadLS("ht_tweight", 72));
  const [activity, setActivity] = useState<Activity>(() => loadLS("ht_activity", "moderado"));
  const [unit, setUnit] = useState<"kg" | "lb">(() => loadLS("ht_unit", "kg"));
  const [habits, setHabits] = useState<Habit[]>(() => loadLS("ht_habits", DEFAULT_HABITS));
  const [meals, setMeals] = useState<Meal[]>(() => loadLS("ht_meals", DEFAULT_MEALS));
  const [waterCups, setWaterCups] = useState<number>(() => loadLS("ht_water", 4));
  const [streak] = useState(7);
  const [theme, setThemeState] = useState<"light" | "dark">(() => loadLS("ht_theme", "light"));
  const [contrast, setContrastState] = useState<Contrast>(() => loadLS("ht_contrast", "off"));
  const [fontScale, setFontScaleState] = useState<number>(() => loadLS("ht_font", 1));
  const [simpleRead, setSimpleRead] = useState<boolean>(() => loadLS("ht_simple", false));
  const [voiceNav, setVoiceNav] = useState<boolean>(() => loadLS("ht_voice", false));
  const [notifPrefs, setNotifPrefs] = useState(() =>
    loadLS("ht_notif", { hidratacao: true, habitos: true, ia: false, relatorio: true }),
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.remove("hc-bw", "hc-yellow", "hc-blue");
    if (contrast !== "off") root.classList.add(`hc-${contrast}`);
    root.style.setProperty("--app-font-scale", String(fontScale));
    saveLS("ht_theme", theme);
    saveLS("ht_contrast", contrast);
    saveLS("ht_font", fontScale);
  }, [theme, contrast, fontScale]);

  useEffect(() => {
    saveLS("ht_habits", habits);
  }, [habits]);
  useEffect(() => {
    saveLS("ht_meals", meals);
  }, [meals]);
  useEffect(() => {
    saveLS("ht_water", waterCups);
  }, [waterCups]);
  useEffect(() => {
    saveLS("ht_user", user);
  }, [user]);
  useEffect(() => {
    saveLS("ht_notif", notifPrefs);
  }, [notifPrefs]);

  const value: State = {
    user,
    setUser: (u) => setUserState((p) => ({ ...p, ...u })),
    goal,
    setGoal,
    weight,
    setWeight,
    targetWeight,
    setTargetWeight,
    activity,
    setActivity,
    unit,
    setUnit,
    habits,
    toggleHabit: (id) =>
      setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, done: !h.done } : h))),
    meals,
    addMeal: (m) => setMeals((ms) => [...ms, { ...m, id: `m${Date.now()}` }]),
    waterCups,
    setWaterCups: (n) => setWaterCups(Math.max(0, Math.min(8, n))),
    streak,
    theme,
    setTheme: setThemeState,
    contrast,
    setContrast: setContrastState,
    fontScale,
    setFontScale: setFontScaleState,
    simpleRead,
    setSimpleRead,
    voiceNav,
    setVoiceNav,
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
