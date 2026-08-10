import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Toggle } from "./_app.notificacoes";

export const Route = createFileRoute("/_app/acessibilidade/alto-contraste")({
  component: AltoContraste,
});

const MODES = [
  { id: "bw", label: "Preto e branco" },
  { id: "yellow", label: "Amarelo sobre preto" },
  { id: "blue", label: "Azul intenso" },
] as const;

function AltoContraste() {
  const { contrast, setContrast } = useApp();
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link
        to="/acessibilidade"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Alto contraste</h1>
      <div className="card-soft flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="font-medium">Ativar alto contraste</div>
        </div>
        <Toggle checked={contrast !== "off"} onChange={(v) => setContrast(v ? "bw" : "off")} />
      </div>
      <div className="card-soft space-y-2">
        <div className="font-medium mb-1">Modo</div>
        {MODES.map((m) => (
          <label key={m.id} className="flex items-center gap-3 min-h-11 cursor-pointer">
            <input
              type="radio"
              name="hc"
              checked={contrast === m.id}
              onChange={() => setContrast(m.id)}
              className="size-4 accent-primary"
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
