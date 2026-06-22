import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Moon, Contrast, Type, BookOpen, Mic } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Toggle } from "./_app.notificacoes";

export const Route = createFileRoute("/_app/acessibilidade")({ component: Acessibilidade });

function Acessibilidade() {
  const app = useApp();
  const ITEMS = [
    { to: "/acessibilidade/modo-escuro", label: "Modo escuro", icon: Moon, on: app.theme === "dark" },
    { to: "/acessibilidade/alto-contraste", label: "Alto contraste", icon: Contrast, on: app.contrast !== "off" },
    { to: "/acessibilidade/fonte-grande", label: "Fonte grande", icon: Type, on: app.fontScale > 1 },
    { to: "/acessibilidade/leitura-simplificada", label: "Leitura simplificada", icon: BookOpen, on: app.simpleRead },
    { to: "/acessibilidade/navegacao-por-voz", label: "Navegação por voz", icon: Mic, on: app.voiceNav },
  ] as const;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Acessibilidade</h1>
      <p className="text-sm text-muted-foreground mb-4">Ajustes que tornam o app mais confortável para você.</p>
      <ul className="space-y-2">
        {ITEMS.map((it) => (
          <li key={it.to} className="card-soft flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted text-primary grid place-items-center"><it.icon className="size-5" /></div>
            <span className="flex-1 font-medium">{it.label}</span>
            <Toggle checked={it.on} onChange={() => {}} />
            <Link to={it.to} aria-label={`Abrir ${it.label}`} className="size-10 grid place-items-center rounded-full hover:bg-muted"><ChevronRight className="size-5 text-muted-foreground" /></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
