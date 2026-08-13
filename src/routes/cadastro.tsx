import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/cadastro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar conta — HealthTrack" },
      { name: "description", content: "Crie sua conta no HealthTrack e comece a acompanhar hábitos e treinos." },
      { property: "og:title", content: "Criar conta — HealthTrack" },
      { property: "og:description", content: "Crie sua conta no HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const nav = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("A senha precisa ter pelo menos 6 caracteres.");
    setBusy(true);
    const { error, needsConfirm } = await signUp(name.trim(), email.trim(), password);
    setBusy(false);
    if (error) return toast.error(error);
    if (needsConfirm) {
      setSent(true);
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
    } else {
      toast.success("Conta criada com sucesso!");
      nav({ to: "/onboarding" });
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <p className="mt-3 text-sm text-muted-foreground">Crie sua conta e comece hoje.</p>
        </div>

        {sent ? (
          <div className="card-soft text-center space-y-3">
            <div className="text-4xl">📩</div>
            <h1 className="text-lg font-semibold">Confirme seu e-mail</h1>
            <p className="text-sm text-muted-foreground">Enviamos um link de confirmação para <strong>{email}</strong>. Ao clicar no link você volta para o HealthTrack já autenticado.</p>
            <Link to="/login" className="btn-brand inline-block">Ir para o login</Link>
            <button type="button" onClick={resend} disabled={busy}
              className="w-full h-11 rounded-xl border border-border font-medium hover:bg-muted inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Enviar novo e-mail de confirmação
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card-soft space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="nome">Nome</label>
              <input id="nome" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="email">E-mail</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="pwd">Senha</label>
              <input id="pwd" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={busy} className="btn-brand w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Criar conta
            </button>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Já tenho conta</Link>
          </form>
        )}
      </div>
    </div>
  );
}
