import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, Trash2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProfiles } from "@/lib/queries";
import { deleteUser, setUserRole } from "@/lib/user.functions";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Usuários — Administração HealthTrack" },
      { name: "description", content: "Gerencie usuários, permissões e status de acesso no HealthTrack." },
      { property: "og:title", content: "Usuários — Administração HealthTrack" },
      { property: "og:description", content: "Gerencie usuários da plataforma HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: users = [], isLoading } = useQuery({ queryKey: ["profiles"], queryFn: fetchAllProfiles });
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await supabase.from("user_roles").select("user_id, role")).data ?? [],
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["profiles"] });
    void qc.invalidateQueries({ queryKey: ["roles"] });
  };

  const toggleActive = useMutation({
    mutationFn: async (u: { id: string; active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ active: !u.active }).eq("id", u.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status atualizado."); refresh(); },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const promote = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "user" }) => setUserRole({ data: v }),
    onSuccess: () => { toast.success("Função atualizada."); refresh(); },
    onError: () => toast.error("Não foi possível atualizar a função."),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: () => { toast.success("Usuário excluído."); refresh(); },
    onError: (e: Error) => toast.error(e.message || "Não foi possível excluir."),
  });

  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
      <div className="relative mt-4 max-w-sm">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail"
          className="w-full h-11 pl-9 pr-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card-soft mt-6 text-center py-10">
          <p className="font-medium">Nenhum usuário encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">Novos cadastros aparecem aqui automaticamente.</p>
        </div>
      ) : (
        <div className="mt-6 card-soft overflow-x-auto p-0">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Função</th>
                <th className="p-3">Status</th><th className="p-3">Onboarding</th><th className="p-3">Cadastro</th><th className="p-3">Último acesso</th><th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isAdmin = roles.some((r) => r.user_id === u.id && r.role === "admin");
                return (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">
                      <Link to="/admin/users/$id" params={{ id: u.id }} className="hover:underline text-primary">{u.name || "—"}</Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${isAdmin ? "bg-primary/15 text-primary" : "bg-muted"}`}>
                        {isAdmin ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.onboarding_completed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {u.onboarding_completed ? "Concluído" : "Pendente"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(u.created_at as string).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 text-muted-foreground">{u.last_seen_at ? new Date(u.last_seen_at as string).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button title={isAdmin ? "Tornar usuário" : "Tornar admin"} onClick={() => promote.mutate({ userId: u.id, role: isAdmin ? "user" : "admin" })}
                          className="size-9 grid place-items-center rounded-lg hover:bg-muted"><Shield className="size-4" /></button>
                        <button title={u.active ? "Desativar" : "Ativar"} onClick={() => toggleActive.mutate({ id: u.id, active: !!u.active })}
                          className="size-9 grid place-items-center rounded-lg hover:bg-muted">
                          {u.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                        </button>
                        <button title="Excluir" onClick={() => { if (confirm(`Excluir ${u.name}? Essa ação é definitiva.`)) remove.mutate(u.id); }}
                          className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
