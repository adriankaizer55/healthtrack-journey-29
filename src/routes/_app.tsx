import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({ ssr: false, component: Guard });

function Guard() {
  const { loading, userId, profile } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      nav({ to: "/login", replace: true });
      return;
    }
    // Só libera o app depois que o perfil inicial estiver preenchido.
    if (profile && !profile.onboarding_completed) nav({ to: "/onboarding", replace: true });
  }, [loading, userId, profile, nav]);

  if (loading || !userId || (profile && !profile.onboarding_completed)) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }
  return <AppShell />;
}

export { redirect, Outlet };
