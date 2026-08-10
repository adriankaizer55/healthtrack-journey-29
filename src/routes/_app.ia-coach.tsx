import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { Bot, MoreVertical, Mic, Paperclip, Send, Play, Droplet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/_app/ia-coach")({ component: IACoach });

type Msg = { id: string; role: "user" | "ai"; text?: string; card?: "workout" | "water" };

function IACoach() {
  const { user, waterCups } = useApp();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "1",
      role: "ai",
      text: `Oi, ${user.name}! 👋 Que bom te ver por aqui. Como você está se sentindo hoje?`,
    },
    {
      id: "2",
      role: "ai",
      text: "Vi que você está em uma sequência incrível de hábitos. Que tal um treino leve hoje para manter o ritmo?",
    },
    { id: "3", role: "ai", card: "workout" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    const text = input;
    setInput("");
    setTimeout(() => {
      const responses = [
        `Entendi, ${user.name}. Vamos com calma — pequenos passos consistentes valem mais que esforços enormes ocasionais. 💙`,
        `Ótima pergunta! Lembre-se: hidratação é fundamental. Você já bebeu ${waterCups} copos hoje. Que tal mais um?`,
        `Estou aqui pra te apoiar. Posso sugerir uma rotina personalizada se você quiser?`,
      ];
      const reply: Msg = {
        id: String(Date.now() + 1),
        role: "ai",
        text: responses[Math.floor(Math.random() * responses.length)],
      };
      const extra: Msg | null = /água|agua|hidrata/i.test(text)
        ? { id: String(Date.now() + 2), role: "ai", card: "water" }
        : null;
      setMessages((m) => (extra ? [...m, reply, extra] : [...m, reply]));
    }, 600);
  }

  return (
    <div className="flex flex-col h-dvh lg:h-screen">
      <header className="px-4 lg:px-8 py-3 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="size-10 rounded-full gradient-brand grid place-items-center text-white">
          <Bot className="size-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">IA Coach</div>
          <div className="text-xs text-muted-foreground">Seu parceiro de saúde</div>
        </div>
        <button
          aria-label="Mais opções"
          className="size-10 rounded-full hover:bg-muted grid place-items-center"
        >
          <MoreVertical className="size-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "ai" && (
              <div className="size-8 rounded-full gradient-brand grid place-items-center text-white shrink-0">
                <Bot className="size-4" />
              </div>
            )}
            {m.text && (
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}
              >
                {m.text}
              </div>
            )}
            {m.card === "workout" && (
              <div className="card-soft max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-orange-500/15 text-orange-500 grid place-items-center text-2xl">
                    🏃
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Treino leve de hoje</div>
                    <div className="text-xs text-muted-foreground">20 min · ~150 kcal</div>
                  </div>
                </div>
                <button className="btn-brand w-full mt-3">
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
                  <div
                    className="h-full bg-sky-500"
                    style={{ width: `${(waterCups / 8) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border bg-card/80 backdrop-blur px-4 lg:px-8 py-3 sticky bottom-16 lg:bottom-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <button
            type="button"
            aria-label="Anexar"
            className="size-11 rounded-full hover:bg-muted grid place-items-center"
          >
            <Paperclip className="size-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo..."
            className="flex-1 h-11 px-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            aria-label="Microfone"
            className="size-11 rounded-full hover:bg-muted grid place-items-center"
          >
            <Mic className="size-5" />
          </button>
          <button
            aria-label="Enviar"
            className="size-11 rounded-full gradient-brand text-white grid place-items-center"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
