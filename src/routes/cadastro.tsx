import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useState } from "react";

export const Route = createFileRoute("/cadastro")({ component: Cadastro });

function Cadastro() {
  const nav = useNavigate();
  const { setUser } = useApp();
  const [name, setName] = useState("Adrian");
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-dvh px-4 py-6 bg-background">
      <div className="max-w-md mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-11">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground mb-6">Comece sua jornada de bem-estar.</p>
        <form onSubmit={(e) => { e.preventDefault(); setUser({ name, email }); nav({ to: "/onboarding" }); }} className="card-soft space-y-4">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" type="email" value={email} onChange={setEmail} />
          <Field label="Senha" type="password" />
          <Field label="Confirmar senha" type="password" />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1 size-4 accent-primary" />
            <span>Aceito os termos de uso e a política de privacidade</span>
          </label>
          <button className="btn-brand w-full">Cadastrar</button>
          <Link to="/login" className="block text-center text-sm text-muted-foreground">Já tem conta? <span className="text-primary font-medium">Entrar</span></Link>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} required
        className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
