import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Garante que o usuário autenticado tenha perfil e função (role).
 * O primeiro usuário criado na plataforma se torna administrador.
 */
export const bootstrapUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const claims = context.claims as { email?: string; user_metadata?: { name?: string; full_name?: string; avatar_url?: string } };
    const email = claims?.email ?? "";
    const name = data.name || claims?.user_metadata?.name || claims?.user_metadata?.full_name || email.split("@")[0] || "Usuário";
    const avatar = claims?.user_metadata?.avatar_url ?? null;

    const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("profiles").insert({ id: userId, name, email, avatar_url: avatar });
    } else {
      await supabaseAdmin.from("profiles").update({ last_seen_at: new Date().toISOString(), email }).eq("id", userId);
    }

    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    if (!roles || roles.length === 0) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      const role = (count ?? 0) === 0 ? "admin" : "user";
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
      return { role };
    }
    return { role: roles.some((r) => r.role === "admin") ? "admin" : "user" };
  });

async function assertAdmin(context: { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> }; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

/** Admin: define a função de um usuário. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "admin" | "user" }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: exclui definitivamente um usuário. */
export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (data.userId === context.userId) throw new Error("Você não pode excluir a si mesmo");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
