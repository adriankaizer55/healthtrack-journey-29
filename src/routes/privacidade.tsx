import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade (LGPD) — HealthTrack" },
      { name: "description", content: "Saiba como o HealthTrack trata seus dados pessoais e de saúde, em conformidade com a Lei Geral de Proteção de Dados (LGPD)." },
      { property: "og:title", content: "Privacidade (LGPD) — HealthTrack" },
      { property: "og:description", content: "Saiba como o HealthTrack trata seus dados pessoais, em conformidade com a LGPD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  const { userId } = useAuth();

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size={48} />
        </div>
        <Link
          to={userId ? "/mais" : "/login"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11 hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {userId ? "Voltar" : "Voltar ao login"}
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-4">Privacidade (LGPD)</h1>
        <div className="card-soft space-y-3 text-sm leading-relaxed">
          <p>Seus dados pessoais e de saúde são tratados com responsabilidade e segurança.</p>
          <p>Você tem direito de acessar, corrigir, exportar e excluir suas informações a qualquer momento, conforme a Lei Geral de Proteção de Dados (LGPD).</p>
          <p>Não compartilhamos seus dados com terceiros sem o seu consentimento explícito.</p>
        </div>
        <button onClick={() => toast.success("Exportação iniciada ✓")} className="btn-brand w-full mt-4">
          <Download className="size-4" /> Exportar meus dados
        </button>
      </div>
    </div>
  );
}