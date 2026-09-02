import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Home, ListChecks, UtensilsCrossed, Bot, Menu, Bell, User, Settings, PersonStanding, HelpCircle, Shield, Info, LogOut, Droplet, MessageSquare, Dumbbell, Target, CalendarDays, Shield as ShieldIcon } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/habitos", label: "Hábitos", icon: ListChecks },
  { to: "/alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { to: "/ia-coach", label: "IA Coach", icon: Bot },
  { to: "/mais", label: "Mais", icon: Menu },
] as const;

const SIDE_EXTRA = [
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/hidratacao", label: "Hidratação", icon: Droplet },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/acessibilidade", label: "Acessibilidade", icon: PersonStanding },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle },
  { to: "/privacidade", label: "Privacidade", icon: Shield },
  { to: "/sobre", label: "Sobre", icon: Info },
] as const;

export function AppShell() {
  const { isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-dvh flex w-full bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border flex-col p-4 gap-1 sticky top-0 h-dvh">
        <div className="px-2 py-3"><Logo /></div>
        <nav className="flex flex-col gap-1 mt-2" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-11 ${isActive(n.to) ? "gradient-brand text-white shadow-sm" : "hover:bg-muted text-foreground"}`}>
              <n.icon className="size-5" /><span className="font-medium">{n.label}</span>
            </Link>
          ))}
          <div className="h-px bg-border my-3" />
          {SIDE_EXTRA.map((n) => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-11 ${isActive(n.to) ? "bg-muted text-primary font-semibold" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
              <n.icon className="size-5" /><span>{n.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-primary font-semibold min-h-11">
              <ShieldIcon className="size-5" /><span>Administração</span>
            </Link>
          )}
          <button onClick={async () => { await signOut(); nav({ to: "/login", replace: true }); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive mt-auto min-h-11">
            <LogOut className="size-5" /><span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Botão flutuante de acessibilidade */}
      <Link
        to="/acessibilidade"
        aria-label="Abrir opções de acessibilidade"
        className="fixed right-4 bottom-24 lg:bottom-6 z-50 size-14 rounded-full grid place-items-center bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <PersonStanding className="size-8" />
      </Link>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-t border-border" aria-label="Navegação">
        <ul className="grid grid-cols-5">
          {NAV.map((n) => {
            const active = isActive(n.to);
            return (
              <li key={n.to}>
                <Link to={n.to} className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-14 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <n.icon className={`size-5 ${active ? "stroke-[2.5]" : ""}`} />
                  <span className="text-[11px] font-medium">{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}
