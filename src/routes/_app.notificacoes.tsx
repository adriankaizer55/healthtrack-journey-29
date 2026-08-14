import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { fetchNotifications, markNotificationRead } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — HealthTrack" },
      { name: "description", content: "Veja seus avisos de hábitos, treinos e mensagens e ajuste os lembretes." },
      { property: "og:title", content: "Notificações — HealthTrack" },
      { property: "og:description", content: "Avisos e preferências de lembretes do HealthTrack." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notificacoes,
});

const OPTIONS: { key: keyof ReturnType<typeof useApp>["notifPrefs"]; label: string; desc: string }[] = [
  { key: "hidratacao", label: "Lembretes de hidratação", desc: "A cada 2 horas, das 8h às 22h" },
  { key: "habitos", label: "Hábitos diários", desc: "Resumo da manhã e da noite" },
  { key: "ia", label: "Sugestões da IA Coach", desc: "Dicas personalizadas no seu ritmo" },
  { key: "relatorio", label: "Relatório semanal", desc: "Seu progresso toda segunda" },
];

function Notificacoes() {
  const qc = useQueryClient();
  const { notifPrefs, setNotifPref } = useApp();
  const { userId } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  });

  const refresh = () => void qc.invalidateQueries({ queryKey: ["notifications"] });

  const read = useMutation({ mutationFn: (id: string) => markNotificationRead(id), onSuccess: refresh });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Notificações</h1>

      <h2 className="font-semibold mb-2">Recentes</h2>
      {isLoading ? (
        <div className="card-soft text-center py-8 text-muted-foreground">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="card-soft text-center py-8">
          <Bell className="size-8 mx-auto text-muted-foreground mb-2" />
          <div className="font-medium">Nada por aqui ainda</div>
          <p className="text-sm text-muted-foreground">Avisos de hábitos, treinos e mensagens aparecem aqui.</p>
        </div>
      ) : (
        <ul className="space-y-2 mb-6">
          {items.map((n) => (
            <li key={n.id} className={`card-soft flex items-start gap-3 ${n.read_at ? "opacity-70" : ""}`}>
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {n.title}
                  {!n.read_at && <span className="size-2 rounded-full bg-primary" />}
                </div>
                {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at as string).toLocaleString("pt-BR")}
                </div>
              </div>
              {!n.read_at && (
                <button onClick={() => read.mutate(n.id)} className="text-xs text-primary font-semibold min-h-9 px-2">Marcar lida</button>
              )}
              <button onClick={() => remove.mutate(n.id)} aria-label="Remover notificação"
                className="size-9 rounded-full grid place-items-center text-muted-foreground hover:text-destructive hover:bg-muted"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="font-semibold mb-2">Preferências</h2>
      <ul className="space-y-2">
        {OPTIONS.map((o) => (
          <li key={o.key} className="card-soft flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium">{o.label}</div>
              <div className="text-sm text-muted-foreground">{o.desc}</div>
            </div>
            <Toggle checked={notifPrefs[o.key]} onChange={(v) => { setNotifPref(o.key, v); toast.success("Configurações salvas ✓"); }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} aria-pressed={checked}
      className={`relative w-12 h-7 rounded-full transition-colors ${checked ? "gradient-brand" : "bg-muted"}`}>
      <span className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
