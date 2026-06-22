import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/privacidade")({ component: Privacidade });

function Privacidade() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Privacidade (LGPD)</h1>
      <div className="card-soft space-y-3 text-sm leading-relaxed">
        <p>Seus dados pessoais e de saúde são tratados com responsabilidade e armazenados localmente no seu dispositivo.</p>
        <p>Você tem direito de acessar, corrigir, exportar e excluir suas informações a qualquer momento, conforme a Lei Geral de Proteção de Dados (LGPD).</p>
        <p>Não compartilhamos seus dados com terceiros sem o seu consentimento explícito.</p>
      </div>
      <button onClick={() => toast.success("Exportação iniciada ✓")} className="btn-brand w-full mt-4"><Download className="size-4" /> Exportar meus dados</button>
    </div>
  );
}
