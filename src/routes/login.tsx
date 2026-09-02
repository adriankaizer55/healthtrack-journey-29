import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — HealthTrack" },
      { name: "description", content: "Acesse sua conta HealthTrack e acompanhe hábitos, treinos e progresso." },
      { property: "og:title", content: "Entrar — HealthTrack" },
      { property: "og:description", content: "Acesse sua conta HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { signIn, userId, isAdmin, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && userId) nav({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
  }, [loading, userId, isAdmin, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) toast.error(error === "Invalid login credentials" ? "E-mail ou senha inválidos." : error);
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.redirected) return; // o navegador está indo para o Google
      if (result.error) {
        toast.error("Não foi possível entrar com Google.");
        return;
      }
      // sessão já definida pelo popup — decide o destino
      nav({ to: "/auth/callback", replace: true });
    } catch {
      toast.error("Não foi possível entrar com Google.");
    }
  }


  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <p className="mt-3 text-sm text-muted-foreground">Mais acessível. Mais humano. Mais você.</p>
        </div>

        <form onSubmit={onSubmit} className="card-soft space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="email">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="pwd">Senha</label>
            <div className="relative mt-1">
              <input id="pwd" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 pr-11 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-lg hover:bg-muted">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end text-sm">
            <Link to="/recuperar-senha" className="text-primary font-medium hover:underline">Esqueci minha senha</Link>
          </div>
          <button type="submit" disabled={busy} className="btn-brand w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />} Entrar
          </button>
          <button type="button" onClick={google} className="w-full h-11 rounded-xl border border-border font-medium hover:bg-muted">
            Entrar com Google
          </button>
<Link to="/cadastro" className="block text-center w-full h-11 leading-[44px] rounded-xl border border-border font-medium hover:bg-muted">Criar uma conta</Link>
          <Link to="/ajuda" className="block text-center text-sm text-muted-foreground hover:text-foreground">Precisa de ajuda?</Link>
          <div className="pt-3 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao entrar, você declara estar de acordo com a nossa{" "}
              <Link to="/privacidade" className="text-primary font-medium hover:underline">Política de Privacidade</Link>{" "}
              e com o tratamento dos seus dados pessoais conforme a{" "}
              <Link to="/privacidade" className="text-primary font-medium hover:underline">LGPD</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
