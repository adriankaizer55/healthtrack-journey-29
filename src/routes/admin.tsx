import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, ListChecks, Dumbbell, MessageSquare, LogOut, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({ ssr: false, component: AdminLayout });

const NAV = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/habits", label: "Hábitos", icon: ListChecks },
  { to: "/admin/workouts", label: "Treinos", icon: Dumbbell },
  { to: "/admin/mensagens", label: "Mensagens", icon: MessageSquare },
] satisfies { to: string; label: string; icon: typeof Users; exact?: boolean }[];

function AdminLayout() {
  const { loading, userId, isAdmin, profile, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!userId) nav({ to: "/login", replace: true });
    else if (!isAdmin) nav({ to: "/dashboard", replace: true });
  }, [loading, userId, isAdmin, nav]);

  if (loading || !userId || !isAdmin) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));

  return (
    <div className="min-h-dvh flex w-full bg-background text-foreground">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border flex-col p-4 gap-1 sticky top-0 h-dvh">
        <div className="px-2 py-3"><Logo /></div>
        <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Administração</span>
        <nav className="flex flex-col gap-1 mt-2 flex-1" aria-label="Administração">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to as never}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-11 transition-all ${isActive(n.to, n.exact) ? "gradient-brand text-white shadow-sm" : "hover:bg-muted"}`}>
              <n.icon className="size-5" /><span className="font-medium">{n.label}</span>
            </Link>
          ))}
          <div className="h-px bg-border my-3" />
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-11 hover:bg-muted text-muted-foreground">
            <ArrowLeft className="size-5" /><span>Área do usuário</span>
          </Link>
          <button onClick={async () => { await signOut(); nav({ to: "/login", replace: true }); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-11 hover:bg-destructive/10 text-destructive mt-auto">
            <LogOut className="size-5" /><span>Sair</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <Logo size={32} />
          <span className="text-sm text-muted-foreground truncate">{profile?.name}</span>
        </header>
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-t border-border" aria-label="Administração">
        <ul className="grid grid-cols-5">
          {NAV.map((n) => (
            <li key={n.to}>
              <Link to={n.to as never} className={`flex flex-col items-center gap-1 py-2.5 min-h-14 ${isActive(n.to, n.exact) ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="size-5" /><span className="text-[10px] font-medium">{n.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
