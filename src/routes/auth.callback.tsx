import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Confirmando acesso — HealthTrack" },
      { name: "description", content: "Finalizando a confirmação de e-mail e criando sua sessão no HealthTrack." },
      { property: "og:title", content: "Confirmando acesso — HealthTrack" },
      { property: "og:description", content: "Finalizando sua autenticação no HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const errDesc = url.searchParams.get("error_description") ?? hash.get("error_description");
      const code = url.searchParams.get("code");
      const type = url.searchParams.get("type") ?? hash.get("type");
      const tokenHash = url.searchParams.get("token_hash");

      if (errDesc) {
        if (alive) setError(errDesc);
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "signup" | "email" | "recovery" | "invite" | "email_change",
          });
          if (error) throw error;
        }
        // implicit flow (#access_token=...) is handled automatically by detectSessionInUrl

        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("Sessão não encontrada após a confirmação.");

        if (type === "recovery") {
          nav({ to: "/reset-password", replace: true });
          return;
        }

        const [{ data: roles }, { data: prof }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", data.session.user.id),
          supabase.from("profiles").select("onboarding_completed").eq("id", data.session.user.id).maybeSingle(),
        ]);
        const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
        if (isAdmin) nav({ to: "/admin", replace: true });
        else nav({ to: prof?.onboarding_completed ? "/dashboard" : "/onboarding", replace: true });
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, [nav]);

  async function resend() {
    if (!email.trim()) return toast.error("Informe seu e-mail.");
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Novo e-mail de confirmação enviado.");
  }

  if (!error) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} />
          <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Confirmando seu acesso…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8"><Logo size={56} /></div>
        <div className="card-soft space-y-4 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-lg font-semibold">Não foi possível confirmar seu e-mail.</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/login" className="btn-brand inline-block">Voltar para o login</Link>
          <div className="pt-2 space-y-2 text-left">
            <label className="text-sm font-medium" htmlFor="resend-email">Enviar novo e-mail de confirmação</label>
            <input id="resend-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            <button type="button" onClick={resend} disabled={busy}
              className="w-full h-11 rounded-xl border border-border font-medium hover:bg-muted inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Enviar novo e-mail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
