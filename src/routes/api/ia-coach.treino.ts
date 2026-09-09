import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ia-coach/treino")({
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

        let body: { text?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response(JSON.stringify({ error: "Requisição inválida." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const text = (body.text ?? "").trim();
        if (!text) {
          return new Response(JSON.stringify({ error: "Nenhum treino para salvar." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const schema = {
          type: "object",
          additionalProperties: false,
          required: ["name", "description", "duration_min", "level", "exercises"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            duration_min: { type: "integer" },
            level: { type: "string", enum: ["iniciante", "intermediario", "avancado"] },
            exercises: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "sets", "reps", "load", "rest_seconds", "notes"],
                properties: {
                  name: { type: "string" },
                  sets: { type: "integer" },
                  reps: { type: "string" },
                  load: { type: ["string", "null"] },
                  rest_seconds: { type: "integer" },
                  notes: { type: ["string", "null"] },
                },
              },
            },
          },
        };

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.4-mini",
            instructions:
              "Extraia o treino descrito pelo IA Coach em dados estruturados, em português do Brasil. " +
              "Dê um nome curto ao treino (ex.: 'Treino leve de corpo inteiro'). " +
              "Liste apenas exercícios de fato mencionados, com séries, repetições e descanso em segundos. " +
              "Se algo não for informado, use valores razoáveis (3 séries, 10 repetições, 60s de descanso).",
            input: [{ role: "user", content: [{ type: "input_text", text }] }],
            stream: true,
            store: false,
            text: { format: { type: "json_schema", name: "treino", strict: true, schema } },
          }),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("ia-coach treino gateway error", upstream.status, detail.slice(0, 500));
          const message =
            upstream.status === 402
              ? "Os créditos de IA acabaram. Adicione créditos para continuar."
              : upstream.status === 429
                ? "Muitas solicitações em pouco tempo. Tente novamente em alguns segundos."
                : "Não consegui montar o treino agora. Tente novamente em instantes.";
          return new Response(JSON.stringify({ error: message }), {
            status: upstream.status === 402 || upstream.status === 429 ? upstream.status : 502,
            headers: { "Content-Type": "application/json" },
          });
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

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
              if (event.type === "response.output_text.delta" && event.delta) acc += event.delta;
            } catch {
              // ignora fragmentos incompletos
            }
          }
        }

        try {
          const parsed = JSON.parse(acc.trim()) as unknown;
          return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
        } catch {
          return new Response(JSON.stringify({ error: "Não consegui entender esse treino. Peça um treino mais detalhado." }), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
