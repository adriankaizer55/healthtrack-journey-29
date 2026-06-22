import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Bell, Accessibility, Shield, HelpCircle, Info, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/mais")({ component: Mais });

const ITEMS = [
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/acessibilidade", label: "Acessibilidade", icon: Accessibility },
  { to: "/privacidade", label: "Privacidade (LGPD)", icon: Shield },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle },
  { to: "/sobre", label: "Sobre o app", icon: Info },
] as const;

function Mais() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mais</h1>
      <ul className="space-y-2">
        {ITEMS.map((it) => (
          <li key={it.to}>
            <Link to={it.to} className="card-soft flex items-center gap-3 hover:shadow-md transition-all min-h-14">
              <div className="size-10 rounded-xl bg-muted text-primary grid place-items-center"><it.icon className="size-5" /></div>
              <span className="flex-1 font-medium">{it.label}</span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <Link to="/login" className="card-soft flex items-center gap-3 hover:bg-destructive/10 transition-all min-h-14 text-destructive">
            <div className="size-10 rounded-xl bg-destructive/15 grid place-items-center"><LogOut className="size-5" /></div>
            <span className="flex-1 font-medium">Sair da conta</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
