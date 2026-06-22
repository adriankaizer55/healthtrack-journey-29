import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Toggle } from "./_app.notificacoes";
import { useState } from "react";

export const Route = createFileRoute("/_app/acessibilidade/navegacao-por-voz")({ component: VoiceNav });

function VoiceNav() {
  const { voiceNav, setVoiceNav } = useApp();
  const [lang, setLang] = useState("pt-BR");

  function test() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance("Olá! Eu sou seu assistente de navegação do HealthTrack.");
    u.lang = lang;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-2xl mx-auto">
      <Link to="/acessibilidade" className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Navegação por voz</h1>
      <div className="card-soft flex items-center gap-3 mb-3">
        <div className="flex-1"><div className="font-medium">Ativar navegação por voz</div><div className="text-sm text-muted-foreground">Receba feedback falado pelas telas.</div></div>
        <Toggle checked={voiceNav} onChange={setVoiceNav} />
      </div>
      <div className="card-soft mb-3">
        <label className="text-sm font-medium">Idioma</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español</option>
        </select>
      </div>
      <button onClick={test} className="btn-brand w-full"><Volume2 className="size-4" /> Testar voz</button>
    </div>
  );
}
