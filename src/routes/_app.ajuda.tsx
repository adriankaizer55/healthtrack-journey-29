import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/ajuda")({ component: Ajuda });

const FAQ = [
  { q: "Como adicionar um novo hábito?", a: "Em breve você poderá criar hábitos personalizados na tela de Hábitos." },
  { q: "Meus dados são privados?", a: "Sim, seus dados são armazenados localmente e protegidos conforme a LGPD." },
  { q: "Como o IA Coach funciona?", a: "Ele usa seu histórico e metas para sugerir ações de bem-estar." },
  { q: "Posso exportar meus dados?", a: "Sim, em Privacidade você encontra a opção de exportar tudo." },
];

function Ajuda() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/mais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Ajuda</h1>
      <h2 className="font-semibold mb-2">Perguntas frequentes</h2>
      <ul className="space-y-2 mb-4">
        {FAQ.map((f, i) => (
          <li key={i} className="card-soft">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center text-left min-h-11">
              <span className="font-medium">{f.q}</span>
              <ChevronDown className={`size-5 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>}
          </li>
        ))}
      </ul>
      <button className="btn-brand w-full">Fale conosco</button>
    </div>
  );
}
