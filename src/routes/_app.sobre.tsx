import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_app/sobre")({ component: Sobre });

function Sobre() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link
        to="/mais"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Sobre o app</h1>
      <div className="card-soft text-center">
        <div className="flex justify-center mb-3">
          <Logo size={56} />
        </div>
        <p className="text-sm text-muted-foreground mb-4">Versão 1.0.0</p>
        <p className="text-sm leading-relaxed">
          Nossa missão é tornar o cuidado com a saúde algo simples, humano e acessível para todos. O
          HealthTrack acompanha sua jornada com leveza, respeitando seu ritmo.
        </p>
      </div>
    </div>
  );
}
