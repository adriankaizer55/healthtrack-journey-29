import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { Bot, MoreVertical, Paperclip, Send, Play, Droplet, RotateCcw, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ia-coach")({
  head: () => ({
    meta: [
      { title: "IA Coach — seu parceiro de saúde no HealthTrack" },
      {
        name: "description",
        content: "Converse com o IA Coach do HealthTrack sobre hábitos, treinos, alimentação, hidratação e motivação.",
      },
      { property: "og:title", content: "IA Coach — seu parceiro de saúde no HealthTrack" },
      { property: "og:description", content: "Conselhos personalizados de bem-estar em tempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IACoach,
});

type Msg = { id: string; role: "user" | "ai"; text?: string; card?: "workout" | "water" };

const SUGGESTIONS = [
  "Monte um treino de 20 minutos pra hoje",
  "Como manter minha sequência de hábitos?",
  "Ideias de jantar leve e proteico",
  "Estou sem motivação, me ajuda?",
];

function IACoach() {
  const { user, waterCups, habits } = useApp() as ReturnType<typeof useApp> & {
    habits?: { name: string; done: boolean }[];
  };
  const greeting: Msg[] = [
    { id: "1", role: "ai", text: `Oi, ${user.name}! 👋 Que bom te ver por aqui. Como você está se sentindo hoje?` },
    { id: "2", role: "ai", text: "Posso ajudar com treinos, alimentação, hidratação, sono e motivação. Me conta o que você precisa." },
    { id: "3", role: "ai", card: "workout" },
  ];
  const [messages, setMessages] = useState<Msg[]>(greeting);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [streaming]);

  async function ask(question: string) {
    const value = question.trim();
    if (!value || streaming) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text: value };
    const aiId = `a-${Date.now()}`;
    const history = messages
      .filter((m) => m.text)
      .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), text: m.text! }));

    setMessages((m) => [...m, userMsg, { id: aiId, role: "ai", text: "" }]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const doneHabits = (habits ?? []).filter((h) => h.done).map((h) => h.name);
    const context = `Nome: ${user.name}. Copos de água hoje: ${waterCups} de 8.${
      doneHabits.length ? ` Hábitos já concluídos hoje: ${doneHabits.join(", ")}.` : ""
    }`;

    try {
      const res = await fetch("/api/ia-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", text: value }], context }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "O IA Coach está indisponível agora.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        acc += decoder.decode(chunk, { stream: true });
        setMessages((m) => m.map((msg) => (msg.id === aiId ? { ...msg, text: acc } : msg)));
      }

      if (!acc.trim()) {
        setMessages((m) =>
          m.map((msg) => (msg.id === aiId ? { ...msg, text: "Não consegui responder agora. Pode tentar de novo?" } : msg)),
        );
      } else if (/água|agua|hidrat/i.test(value + acc)) {
        setMessages((m) => [...m, { id: `c-${Date.now()}`, role: "ai", card: "water" }]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setMessages((m) => m.filter((msg) => msg.id !== aiId || (msg.text ?? "").length > 0));
      } else {
        setMessages((m) => m.filter((msg) => msg.id !== aiId));
        toast.error((err as Error).message);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  const onlyGreeting = messages.length <= 3;

  return (
    <div className="flex flex-col h-dvh lg:h-screen">
      <header className="px-4 lg:px-8 py-3 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="size-10 rounded-full gradient-brand grid place-items-center text-white">
          <Bot className="size-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">IA Coach</div>
          <div className="text-xs text-muted-foreground">{streaming ? "Escrevendo…" : "Seu parceiro de saúde"}</div>
        </div>
        <button
          onClick={() => {
            abortRef.current?.abort();
            setMessages(greeting);
          }}
          aria-label="Começar nova conversa"
          title="Começar nova conversa"
          className="size-10 rounded-full hover:bg-muted grid place-items-center"
        >
          <RotateCcw className="size-5" />
        </button>
        <button aria-label="Mais opções" className="size-10 rounded-full hover:bg-muted grid place-items-center">
          <MoreVertical className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="size-8 rounded-full gradient-brand grid place-items-center text-white shrink-0">
                <Bot className="size-4" />
              </div>
            )}
            {typeof m.text === "string" && (
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                {m.text || <span className="inline-flex gap-1 items-center text-muted-foreground text-sm">Pensando…</span>}
              </div>
            )}
            {m.card === "workout" && (
              <div className="card-soft max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-orange-500/15 text-orange-500 grid place-items-center text-2xl">🏃</div>
                  <div className="flex-1">
                    <div className="font-semibold">Treino leve de hoje</div>
                    <div className="text-xs text-muted-foreground">20 min · ~150 kcal</div>
                  </div>
                </div>
                <button className="btn-brand w-full mt-3" onClick={() => void ask("Me guia nesse treino leve de 20 minutos")}>
                  <Play className="size-4" /> Começar agora
                </button>
              </div>
            )}
            {m.card === "water" && (
              <div className="card-soft max-w-[85%]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-xl bg-sky-500/15 text-sky-500 grid place-items-center">
                    <Droplet className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Hidratação</div>
                    <div className="text-xs text-muted-foreground">{waterCups}/8 copos</div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-sky-500" style={{ width: `${(waterCups / 8) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border bg-card/80 backdrop-blur px-4 lg:px-8 py-3 sticky bottom-16 lg:bottom-0">
        {onlyGreeting && !streaming && (
          <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void ask(s)}
                className="shrink-0 text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <button type="button" aria-label="Anexar" className="size-11 rounded-full hover:bg-muted grid place-items-center">
            <Paperclip className="size-5" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            aria-label="Mensagem para o IA Coach"
            className="flex-1 h-11 px-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {streaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Parar resposta"
              className="size-11 rounded-full bg-muted grid place-items-center"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              aria-label="Enviar"
              disabled={!input.trim()}
              className="size-11 rounded-full gradient-brand text-white grid place-items-center disabled:opacity-50"
            >
              <Send className="size-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
