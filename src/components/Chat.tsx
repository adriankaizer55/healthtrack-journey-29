import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchConversation, markConversationRead, sendMessage } from "@/lib/queries";

export function Chat({ meId, otherId, otherName }: { meId: string; otherId: string; otherName: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const key = useMemo(() => ["conversation", meId, otherId], [meId, otherId]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchConversation(meId, otherId),
  });

  useEffect(() => {
    void markConversationRead(meId, otherId);
    const channel = supabase
      .channel(`chat-${meId}-${otherId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        void qc.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [meId, otherId, qc, key]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-[60vh] lg:h-[70vh]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-full gradient-brand grid place-items-center text-white font-bold">{otherName[0]?.toUpperCase()}</div>
        <div>
          <div className="font-semibold text-sm">{otherName}</div>
          <div className="text-xs text-muted-foreground">Conversa direta</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando mensagens…</p>}
        {!isLoading && messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Diga um olá! 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "gradient-brand text-white" : "bg-muted"}`}>
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at as string).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  {mine && (m.read_at ? " · Visualizado" : " · Enviado")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const value = text.trim();
          if (!value) return;
          setText("");
          try {
            await sendMessage(meId, otherId, value);
            await qc.invalidateQueries({ queryKey: key });
          } catch {
            toast.error("Não foi possível enviar a mensagem.");
          }
        }}
        className="border-t border-border p-3 flex items-center gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem…"
          className="flex-1 h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" aria-label="Enviar" className="size-11 rounded-xl gradient-brand text-white grid place-items-center">
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
