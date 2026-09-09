import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Chat } from "@/components/Chat";
import { useAuth } from "@/lib/auth-context";
import { fetchAdmins, fetchMyThreads } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
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
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: admins = [], isLoading: loadingAdmins } = useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
  const { data: threads = [], isLoading: loadingThreads } = useQuery({
    queryKey: ["my-threads", userId],
    queryFn: () => fetchMyThreads(userId as string),
    enabled: !!userId,
  });

  // Mantém a lista de conversas atualizada em tempo real.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`threads-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void qc.invalidateQueries({ queryKey: ["my-threads", userId] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  const contacts = useMemo(() => {
    const nameById = new Map(admins.map((a) => [a.id, a.name || "Equipe HealthTrack"]));
    const list: { id: string; name: string; preview: string | null; unread: number; lastAt: string | null }[] = [];

    // Conversas já existentes primeiro (inclui qualquer membro da equipe que já escreveu).
    for (const t of threads) {
      list.push({
        id: t.otherId,
        name: nameById.get(t.otherId) || "Equipe HealthTrack",
        preview: t.lastMessage,
        unread: t.unread,
        lastAt: t.lastAt,
      });
    }
    // Depois, membros da equipe sem conversa iniciada.
    for (const a of admins) {
      if (list.some((c) => c.id === a.id)) continue;
      list.push({ id: a.id, name: a.name || "Equipe HealthTrack", preview: null, unread: 0, lastAt: null });
    }
    return list;
  }, [admins, threads]);

  const loading = loadingAdmins || loadingThreads;

  // Seleciona automaticamente a conversa mais recente (ou a primeira da equipe).
  useEffect(() => {
    if (selected || contacts.length === 0) return;
    const withUnread = contacts.find((c) => c.unread > 0);
    setSelected((withUnread ?? contacts[0]).id);
  }, [contacts, selected]);

  const active = contacts.find((c) => c.id === selected);

  return (
    <div>
      <PageHeader title="Mensagens" />
      <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="card-soft h-[60vh] grid place-items-center text-sm text-muted-foreground">Carregando…</div>
        ) : contacts.length === 0 ? (
          <div className="card-soft h-[40vh] grid place-items-center text-sm text-muted-foreground px-6 text-center">
            Nenhum acompanhamento disponível para conversa no momento.
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            {contacts.length > 1 && (
              <div className="card-soft p-0 overflow-hidden lg:col-span-1">
                <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                  {contacts.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelected(c.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted ${selected === c.id ? "bg-muted" : ""}`}
                      >
                        <div className="size-9 rounded-full gradient-brand grid place-items-center text-white font-bold shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.preview || "Iniciar conversa"}</div>
                        </div>
                        {c.unread > 0 && (
                          <span className="ml-auto shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold grid place-items-center">
                            {c.unread}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className={`card-soft p-0 overflow-hidden ${contacts.length > 1 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              {userId && active ? (
                <Chat meId={userId} otherId={active.id} otherName={active.name} />
              ) : (
                <div className="h-[60vh] grid place-items-center text-sm text-muted-foreground">
                  Selecione uma conversa.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
