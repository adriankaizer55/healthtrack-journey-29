import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Chat } from "@/components/Chat";
import { useAuth } from "@/lib/auth-context";
import { fetchAllProfiles } from "@/lib/queries";

export const Route = createFileRoute("/admin/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens — Administração HealthTrack" },
      { name: "description", content: "Converse diretamente com os usuários da plataforma HealthTrack." },
      { property: "og:title", content: "Mensagens — Administração HealthTrack" },
      { property: "og:description", content: "Chat entre administrador e usuários." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  const { userId } = useAuth();
  const { data: users = [] } = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles });
  const [selected, setSelected] = useState<string | null>(null);
  const other = users.find((u) => u.id === selected);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card-soft p-0 overflow-hidden lg:col-span-1">
          <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
            {users.filter((u) => u.id !== userId).map((u) => (
              <li key={u.id}>
                <button onClick={() => setSelected(u.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted ${selected === u.id ? "bg-muted" : ""}`}>
                  <div className="size-9 rounded-full gradient-brand grid place-items-center text-white font-bold">{(u.name || u.email)[0]?.toUpperCase()}</div>
                  <div className="min-w-0"><div className="text-sm font-medium truncate">{u.name || "—"}</div><div className="text-xs text-muted-foreground truncate">{u.email}</div></div>
                </button>
              </li>
            ))}
            {users.length <= 1 && <li className="px-4 py-8 text-sm text-muted-foreground text-center">Nenhum usuário cadastrado ainda.</li>}
          </ul>
        </div>
        <div className="card-soft p-0 overflow-hidden lg:col-span-2">
          {userId && other ? (
            <Chat meId={userId} otherId={other.id} otherName={other.name || other.email} />
          ) : (
            <div className="h-[60vh] grid place-items-center text-sm text-muted-foreground">Selecione um usuário para conversar.</div>
          )}
        </div>
      </div>
    </div>
  );
}
