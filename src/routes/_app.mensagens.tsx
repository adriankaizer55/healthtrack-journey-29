import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Chat } from "@/components/Chat";
import { useAuth } from "@/lib/auth-context";
import { fetchAdmins } from "@/lib/queries";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_app/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens — HealthTrack" },
      { name: "description", content: "Converse com seu acompanhamento no HealthTrack e tire suas dúvidas." },
      { property: "og:title", content: "Mensagens — HealthTrack" },
      { property: "og:description", content: "Chat com seu acompanhamento no HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mensagens,
});

function Mensagens() {
  const { userId } = useAuth();
  const { data: admins = [], isLoading } = useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
  const admin = admins[0];

  return (
    <div>
      <PageHeader title="Mensagens" />
      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        <div className="card-soft p-0 overflow-hidden">
          {isLoading ? (
            <div className="h-[60vh] grid place-items-center text-sm text-muted-foreground">Carregando…</div>
          ) : userId && admin ? (
            <Chat meId={userId} otherId={admin.id} otherName={admin.name || "Equipe HealthTrack"} />
          ) : (
            <div className="h-[40vh] grid place-items-center text-sm text-muted-foreground px-6 text-center">
              Nenhum acompanhamento disponível para conversa no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
