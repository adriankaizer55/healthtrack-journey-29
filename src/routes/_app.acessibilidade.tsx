import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/acessibilidade")({ component: AcessibilidadeLayout });

function AcessibilidadeLayout() {
  return <Outlet />;
}
