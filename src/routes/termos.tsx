import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — HealthTrack" },
      { name: "description", content: "Leia os Termos de Uso do HealthTrack e saiba como nossa plataforma de saúde e bem-estar funciona." },
      { property: "og:title", content: "Termos de Uso — HealthTrack" },
      { property: "og:description", content: "Leia os Termos de Uso do HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Termos,
});

function Termos() {
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
        <h1 className="text-2xl font-bold mt-2 mb-4">Termos de Uso</h1>
        <div className="card-soft space-y-3 text-sm leading-relaxed">
          <p>Estes Termos de Uso regulam o uso da plataforma HealthTrack.</p>
          <p>
            Ao criar sua conta e utilizar o aplicativo, você concorda em usar os recursos de forma responsável,
            não compartilhar suas credenciais de acesso e fornecer informações verdadeiras.
          </p>
          <p>
            O HealthTrack é uma ferramenta de acompanhamento de hábitos, treinos e bem-estar. As informações
            exibidas no aplicativo não substituem orientação médica ou profissional de saúde.
          </p>
          <p>
            Você pode encerrar o uso e solicitar a exclusão dos seus dados a qualquer momento, conforme nossa{" "}
            <Link to="/privacidade" className="text-primary font-medium hover:underline">Política de Privacidade</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}