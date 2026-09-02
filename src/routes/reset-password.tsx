import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — HealthTrack" },
      { name: "description", content: "Defina uma nova senha para sua conta HealthTrack." },
      { property: "og:title", content: "Nova senha — HealthTrack" },
      { property: "og:description", content: "Defina uma nova senha no HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8"><Logo size={56} /></div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 6) return toast.error("A senha precisa ter pelo menos 6 caracteres.");
            setBusy(true);
            const { error } = await supabase.auth.updateUser({ password });
            setBusy(false);
            if (error) return toast.error(translateAuthError(error.message));
            toast.success("Senha atualizada!");
            nav({ to: "/dashboard", replace: true });
          }}
          className="card-soft space-y-4"
        >
          <h1 className="text-lg font-semibold">Definir nova senha</h1>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha"
            className="w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={busy} className="btn-brand w-full disabled:opacity-60">Salvar senha</button>
        </form>
      </div>
    </div>
  );
}
