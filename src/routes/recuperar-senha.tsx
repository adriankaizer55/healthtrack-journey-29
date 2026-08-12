import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/recuperar-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar senha — HealthTrack" },
      { name: "description", content: "Receba um link para redefinir a senha da sua conta HealthTrack." },
      { property: "og:title", content: "Recuperar senha — HealthTrack" },
      { property: "og:description", content: "Redefina a senha da sua conta HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recuperar,
});

function Recuperar() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8"><Logo size={56} /></div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await requestPasswordReset(email.trim());
            if (error) return toast.error(error);
            setSent(true);
          }}
          className="card-soft space-y-4"
        >
          <h1 className="text-lg font-semibold">Recuperar senha</h1>
          {sent ? (
            <p className="text-sm text-muted-foreground">Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Informe seu e-mail e enviaremos um link de redefinição.</p>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="submit" className="btn-brand w-full">Enviar link</button>
            </>
          )}
          <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">Voltar ao login</Link>
        </form>
      </div>
    </div>
  );
}
