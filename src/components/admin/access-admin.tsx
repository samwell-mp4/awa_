import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Trash2, UserPlus } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";
import { grantPremium, revokePremium, listPremiumUsers } from "@/lib/admin-access.functions";
import { useServerFn } from "@tanstack/react-start";

export function AccessAdmin() {
  const [email, setEmail] = useState("");
  const qc = useQueryClient();
  const grantFn = useServerFn(grantPremium);
  const revokeFn = useServerFn(revokePremium);
  const listFn = useServerFn(listPremiumUsers);

  const { data: users = [] } = useQuery({
    queryKey: ["premium_users"],
    queryFn: () => listFn(),
  });

  async function grant() {
    if (!email.trim()) return toast.error("Informe o email");
    try {
      const res = await grantFn({ data: { email: email.trim() } });
      toast.success(res.message);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["premium_users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function revoke(userId: string) {
    if (!confirm("Remover acesso Premium gratuito?")) return;
    try {
      await revokeFn({ data: { userId } });
      toast.success("Acesso removido");
      qc.invalidateQueries({ queryKey: ["premium_users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-3">
          <Gift className="mt-1 h-5 w-5 flex-shrink-0 text-gold" />
          <div>
            <h2 className="font-display text-lg font-black text-cream">Isenção Premium (comunidade Pataxó)</h2>
            <p className="mt-1 text-xs text-foreground/60">
              Libere acesso Premium gratuito para membros da comunidade. O usuário precisa já ter conta criada.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Field label="Email do usuário">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pessoa@email.com"
            />
          </Field>
          <div className="flex items-end">
            <Btn onClick={grant}>
              <UserPlus className="h-4 w-4" /> Liberar Premium
            </Btn>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-display text-sm font-black uppercase tracking-wider text-cream">
          Usuários com Premium gratuito ({users.length})
        </h3>
        <div className="grid gap-2">
          {users.map((u: any) => (
            <Card key={u.user_id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-cream">{u.name || "Sem nome"}</div>
                  <div className="truncate text-xs text-foreground/60">{u.email}</div>
                </div>
                <Btn variant="danger" onClick={() => revoke(u.user_id)}>
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
            </Card>
          ))}
          {users.length === 0 && (
            <div className="rounded-2xl border border-gold/15 bg-card/30 p-6 text-center text-sm text-foreground/60">
              Nenhum usuário com isenção ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
