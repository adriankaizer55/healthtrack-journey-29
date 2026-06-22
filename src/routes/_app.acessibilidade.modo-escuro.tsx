import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Toggle } from "./_app.notificacoes";

export const Route = createFileRoute("/_app/acessibilidade/modo-escuro")({ component: ModoEscuro });

function ModoEscuro() {
  const { theme, setTheme } = useApp();
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/acessibilidade" className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Modo escuro</h1>
      <div className="card-soft flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="font-medium">Ativar modo escuro</div>
          <div className="text-sm text-muted-foreground">Reduz o brilho da tela e o consumo de bateria.</div>
        </div>
        <Toggle checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
      </div>
      <div className="card-soft flex items-center gap-3 mb-3">
        <div className="flex-1"><div className="font-medium">Agendar</div><div className="text-sm text-muted-foreground">Do pôr ao nascer do sol</div></div>
        <Toggle checked={false} onChange={() => {}} />
      </div>
      <div className="card-soft flex items-center gap-3">
        <div className="flex-1"><div className="font-medium">Sempre ativado</div><div className="text-sm text-muted-foreground">Manter o modo escuro o tempo todo</div></div>
        <Toggle checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />
      </div>
    </div>
  );
}
