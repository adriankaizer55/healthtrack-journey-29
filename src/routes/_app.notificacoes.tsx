import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notificacoes")({ component: Notificacoes });

const OPTIONS: { key: keyof ReturnType<typeof useApp>["notifPrefs"]; label: string; desc: string }[] = [
  { key: "hidratacao", label: "Lembretes de hidratação", desc: "A cada 2 horas, das 8h às 22h" },
  { key: "habitos", label: "Hábitos diários", desc: "Resumo da manhã e da noite" },
  { key: "ia", label: "Sugestões da IA Coach", desc: "Dicas personalizadas no seu ritmo" },
  { key: "relatorio", label: "Relatório semanal", desc: "Seu progresso toda segunda" },
];

function Notificacoes() {
  const { notifPrefs, setNotifPref } = useApp();
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Notificações</h1>
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
