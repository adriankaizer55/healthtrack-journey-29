import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAdmins,
  fetchAllConversations,
  fetchAllProfiles,
  fetchUserMessages,
  markConversationRead,
  sendMessage,
} from "@/lib/queries";

export const Route = createFileRoute("/admin/mensagens")({
  head: () => ({
    meta: [
      { title: "Conversas dos usuários — Administração HealthTrack" },
      { name: "description", content: "Veja todas as conversas dos usuários do HealthTrack e responda diretamente." },
      { property: "og:title", content: "Conversas dos usuários — Administração HealthTrack" },
      { property: "og:description", content: "Central de mensagens da equipe HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMessages,
});

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function AdminMessages() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles });
  const { data: admins = [] } = useQuery({ queryKey: ["admins"], queryFn: fetchAdmins });
  const adminIds = useMemo(() => admins.map((a) => a.id), [admins]);

  const { data: threads = [], isLoading: loadingThreads } = useQuery({
    queryKey: ["admin-threads", userId, adminIds.join(",")],
    queryFn: () => fetchAllConversations(userId!, adminIds),
    enabled: !!userId && admins.length > 0,
  });

  const byId = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const adminSet = useMemo(() => new Set(adminIds), [adminIds]);

  // conversas existentes + todos os usuários (para iniciar uma nova conversa)
  const rows = useMemo(() => {
    const map = new Map<string, { userId: string; lastAt: string | null; lastMessage: string; unread: number; total: number }>();
    for (const t of threads) map.set(t.userId, t);
    for (const p of profiles) {
      if (p.id === userId || adminSet.has(p.id)) continue;
      if (!map.has(p.id)) map.set(p.id, { userId: p.id, lastAt: null, lastMessage: "", unread: 0, total: 0 });
    }
    const list = [...map.values()];
    const q = term.trim().toLowerCase();
    return list
      .filter((r) => {
        if (!q) return true;
        const p = byId.get(r.userId);
        return `${p?.name ?? ""} ${p?.email ?? ""}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.unread !== b.unread) return b.unread - a.unread;
        if (a.lastAt && b.lastAt) return a.lastAt < b.lastAt ? 1 : -1;
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return (byId.get(a.userId)?.name ?? "").localeCompare(byId.get(b.userId)?.name ?? "");
      });
  }, [threads, profiles, userId, adminSet, byId, term]);

  useEffect(() => {
    if (!selected && rows.length > 0) setSelected(rows[0]!.userId);
  }, [rows, selected]);

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["admin-conversation", selected],
    queryFn: () => fetchUserMessages(selected!),
    enabled: !!selected,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void qc.invalidateQueries({ queryKey: ["admin-threads"] });
        void qc.invalidateQueries({ queryKey: ["admin-conversation"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  useEffect(() => {
    if (!userId || !selected) return;
    void markConversationRead(userId, selected).then(() => qc.invalidateQueries({ queryKey: ["admin-threads"] }));
  }, [userId, selected, qc, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selected]);

  const other = selected ? byId.get(selected) : undefined;
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !userId || !selected) return;
    setText("");
    try {
      await sendMessage(userId, selected, value);
      await qc.invalidateQueries({ queryKey: ["admin-conversation"] });
      await qc.invalidateQueries({ queryKey: ["admin-threads"] });
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    }
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversas dos usuários</h1>
          <p className="text-sm text-muted-foreground">Acompanhe todas as conversas e responda diretamente.</p>
        </div>
        <span className="text-sm px-3 py-1.5 rounded-full bg-muted">
          {threads.length} conversa(s){totalUnread > 0 ? ` · ${totalUnread} não lida(s)` : ""}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card-soft p-0 overflow-hidden lg:col-span-1 flex flex-col">
          <div className="p-3 border-b border-border relative">
            <Search className="size-4 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar usuário…"
              aria-label="Buscar usuário"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <ul className="divide-y divide-border max-h-[62vh] lg:max-h-[70vh] overflow-y-auto">
            {loadingThreads && <li className="px-4 py-6 text-sm text-muted-foreground">Carregando conversas…</li>}
            {rows.map((r) => {
              const p = byId.get(r.userId);
              const name = p?.name || p?.email || "Usuário";
              return (
                <li key={r.userId}>
                  <button
                    onClick={() => setSelected(r.userId)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted ${selected === r.userId ? "bg-muted" : ""}`}
                  >
                    <div className="size-9 rounded-full gradient-brand grid place-items-center text-white font-bold shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate flex-1">{name}</span>
                        {r.lastAt && <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(r.lastAt)}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.lastMessage || "Nenhuma mensagem ainda"}
                      </div>
                    </div>
                    {r.unread > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] grid place-items-center font-bold">
                        {r.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {!loadingThreads && rows.length === 0 && (
              <li className="px-4 py-8 text-sm text-muted-foreground text-center">Nenhum usuário encontrado.</li>
            )}
          </ul>
        </div>

        <div className="card-soft p-0 overflow-hidden lg:col-span-2">
          {other && userId ? (
            <div className="flex flex-col h-[60vh] lg:h-[76vh]">
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="size-9 rounded-full gradient-brand grid place-items-center text-white font-bold">
                  {(other.name || other.email || "U")[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{other.name || other.email}</div>
                  <div className="text-xs text-muted-foreground truncate">{other.email}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loadingMessages && <p className="text-sm text-muted-foreground">Carregando mensagens…</p>}
                {!loadingMessages && messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Diga um olá! 👋</p>
                )}
                {messages.map((m) => {
                  const mine = m.sender_id === userId;
                  const fromTeam = adminSet.has(m.sender_id as string);
                  const senderName = byId.get(m.sender_id as string)?.name || "Equipe";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? "gradient-brand text-white" : fromTeam ? "bg-secondary text-secondary-foreground" : "bg-muted"
                        }`}
                      >
                        {!mine && fromTeam && <div className="text-[10px] font-semibold mb-0.5">{senderName} (equipe)</div>}
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at as string).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {mine && (m.read_at ? " · Visualizado" : " · Enviado")}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="border-t border-border p-3 flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Responder…"
                  aria-label="Responder"
                  className="flex-1 h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="submit" aria-label="Enviar" className="size-11 rounded-xl gradient-brand text-white grid place-items-center">
                  <Send className="size-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-[60vh] grid place-items-center text-sm text-muted-foreground gap-2 text-center px-6">
              <MessageSquare className="size-8 opacity-40 mx-auto" />
              Selecione uma conversa para ler e responder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
