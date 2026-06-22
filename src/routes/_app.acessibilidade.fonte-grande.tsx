import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/_app/acessibilidade/fonte-grande")({ component: FonteGrande });

function FonteGrande() {
  const { fontScale, setFontScale } = useApp();
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/acessibilidade" className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Fonte grande</h1>
      <div className="card-soft">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Tamanho da fonte</span>
          <span className="text-sm text-muted-foreground">{Math.round(fontScale * 100)}%</span>
        </div>
        <input type="range" min={0.85} max={1.5} step={0.05} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))}
          className="w-full accent-primary" />
        <div className="mt-4 p-4 rounded-xl bg-muted">
          <div className="text-xs text-muted-foreground mb-1">PRÉVIA</div>
          <p>Esse é um texto de exemplo. Ajuste o tamanho conforme sua preferência para uma leitura confortável.</p>
        </div>
      </div>
    </div>
  );
}
