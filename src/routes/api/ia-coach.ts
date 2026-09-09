import { createFileRoute } from "@tanstack/react-router";

type ChatTurn = { role: "user" | "assistant"; text: string };

export const Route = createFileRoute("/api/ia-coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "IA não configurada." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { messages?: ChatTurn[]; context?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response(JSON.stringify({ error: "Requisição inválida." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const turns = (body.messages ?? [])
          .filter((m) => typeof m?.text === "string" && m.text.trim().length > 0)
          .slice(-20);

        if (turns.length === 0) {
          return new Response(JSON.stringify({ error: "Nenhuma mensagem enviada." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const instructions = [
          "Você é o IA Coach do HealthTrack, um parceiro de saúde e bem-estar brasileiro.",
          "Responda SEMPRE em português do Brasil, em tom caloroso, acolhedor e motivador.",
          "Seja objetivo: no máximo 3 parágrafos curtos ou uma lista curta. Use emojis com moderação.",
          "Dê sugestões práticas sobre hábitos, treinos, alimentação, hidratação, sono e motivação.",
          "Faça uma pergunta de acompanhamento no fim para manter a conversa viva.",
          "Nunca dê diagnóstico médico; em sinais de risco, recomende procurar um profissional de saúde.",
          body.context ? `Contexto do usuário: ${body.context}` : "",
        ]
          .filter(Boolean)
          .join(" ");

        const input = turns.map((m) => ({
          role: m.role,
          content: [
            {
              type: m.role === "assistant" ? "output_text" : "input_text",
              text: m.text,
            },
          ],
        }));

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions,
            input,
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 402
              ? "Os créditos de IA acabaram. Adicione créditos para continuar conversando."
              : upstream.status === 429
                ? "Muitas mensagens em pouco tempo. Tente novamente em alguns segundos."
                : "O IA Coach está indisponível agora. Tente novamente em instantes.";
          console.error("ia-coach gateway error", upstream.status, detail.slice(0, 500));
          return new Response(JSON.stringify({ error: message }), {
            status: upstream.status === 402 || upstream.status === 429 ? upstream.status : 502,
            headers: { "Content-Type": "application/json" },
          });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const reader = upstream.body.getReader();

        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lastBreak = buffer.lastIndexOf("\n");
                if (lastBreak === -1) continue;
                const chunk = buffer.slice(0, lastBreak);
                buffer = buffer.slice(lastBreak + 1);
                for (const line of chunk.split("\n")) {
                  if (!line.startsWith("data:")) continue;
                  const payload = line.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const event = JSON.parse(payload) as { type?: string; delta?: string };
                    if (event.type === "response.output_text.delta" && event.delta) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    // ignora fragmentos incompletos
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});
