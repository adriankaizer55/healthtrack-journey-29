import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({ ssr: false, component: Guard });

function Guard() {
  const { loading, userId } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !userId) nav({ to: "/login", replace: true });
  }, [loading, userId, nav]);

  if (loading || !userId) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="size-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }
  return <AppShell />;
}

export { redirect, Outlet };
