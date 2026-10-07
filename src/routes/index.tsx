import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "HealthTrack — saúde e bem-estar" },
    { name: "description", content: "Acompanhe seus hábitos, treinos e bem-estar no HealthTrack." },
    { property: "og:title", content: "HealthTrack — saúde e bem-estar" },
    { property: "og:description", content: "Sua rotina de saúde, hábitos e treinos em um só lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  const nav = useNavigate();

  useEffect(() => {
    // Supabase pode redirecionar o link de confirmação para a Site URL ("/").
    // Nesse caso preservamos os parâmetros e delegamos ao callback de autenticação.
    const url = new URL(window.location.href);
    const hash = url.hash.replace(/^#/, "");
    const hasAuthParams =
      url.searchParams.has("code") ||
      url.searchParams.has("token_hash") ||
      url.searchParams.has("error_description") ||
      hash.includes("access_token=") ||
      hash.includes("error_description=");

    if (hasAuthParams) {
      window.location.replace(`/auth/callback${url.search}${url.hash}`);
      return;
    }
    nav({ to: "/login", replace: true });
  }, [nav]);

  return (
    <div className="min-h-dvh grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo size={48} />
        <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    </div>
  );
}
