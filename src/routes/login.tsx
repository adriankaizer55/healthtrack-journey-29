import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size={56} />
          <p className="mt-3 text-sm text-muted-foreground">
            Mais acessível. Mais humano. Mais você.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/dashboard" });
          }}
          className="card-soft space-y-4"
        >
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              defaultValue="adrian@email.com"
              className="mt-1 w-full h-11 px-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="pwd">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                id="pwd"
                type={show ? "text" : "password"}
                required
                defaultValue="••••••••"
                className="w-full h-11 px-3 pr-11 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-lg hover:bg-muted"
              >
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 min-h-11">
              <input type="checkbox" defaultChecked className="size-4 accent-primary" /> Lembrar de
              mim
            </label>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <button type="submit" className="btn-brand w-full">
            Entrar
          </button>
          <Link
            to="/cadastro"
            className="block text-center w-full h-11 leading-[44px] rounded-xl border border-border font-medium hover:bg-muted"
          >
            Criar uma conta
          </Link>
          <Link
            to="/ajuda"
            className="block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Precisa de ajuda?
          </Link>
        </form>
      </div>
    </div>
  );
}
