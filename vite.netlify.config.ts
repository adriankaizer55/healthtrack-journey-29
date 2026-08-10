// Static build config for Netlify Drop (drag & drop of the output folder).
// Usage: bun run build:static  -> outputs dist-static/
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const routes = [
  "/",
  "/login",
  "/cadastro",
  "/onboarding",
  "/dashboard",
  "/habitos",
  "/alimentacao",
  "/hidratacao",
  "/ia-coach",
  "/mais",
  "/perfil",
  "/notificacoes",
  "/ajuda",
  "/privacidade",
  "/sobre",
  "/acessibilidade",
  "/acessibilidade/modo-escuro",
  "/acessibilidade/alto-contraste",
  "/acessibilidade/fonte-grande",
  "/acessibilidade/leitura-simplificada",
  "/acessibilidade/navegacao-por-voz",
];

export default defineConfig({
  tanstackStart: {

    spa: { enabled: true },
    prerender: { enabled: true, crawlLinks: true },
    pages: routes.map((path) => ({ path, prerender: { enabled: true } })),
  },
  nitro: false,
});
