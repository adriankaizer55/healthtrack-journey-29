import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Toggle } from "./_app.notificacoes";

export const Route = createFileRoute("/_app/acessibilidade/leitura-simplificada")({
  component: LeituraSimples,
});

function LeituraSimples() {
  const { simpleRead, setSimpleRead } = useApp();
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link
        to="/acessibilidade"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Leitura simplificada</h1>
      <div className="card-soft flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="font-medium">Ativar leitura simplificada</div>
          <div className="text-sm text-muted-foreground">Frases mais curtas e diretas.</div>
        </div>
        <Toggle checked={simpleRead} onChange={setSimpleRead} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="card-soft">
          <div className="text-xs font-semibold text-muted-foreground mb-1">ANTES</div>
          <p className="text-sm">
            A ingestão regular de água ao longo do dia contribui significativamente para o
            funcionamento adequado dos processos metabólicos do organismo.
          </p>
        </div>
        <div className="card-soft border-teal/40 bg-teal/5">
          <div className="text-xs font-semibold text-teal mb-1">DEPOIS</div>
          <p className="text-sm">Beba água. Ajuda seu corpo a funcionar bem.</p>
        </div>
      </div>
    </div>
  );
}
