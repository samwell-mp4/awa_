import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Crown, Gift, Search, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";
import {
  grantPremium,
  revokePremium,
  listAllUsers,
} from "@/lib/admin-access.functions";
import { useServerFn } from "@tanstack/react-start";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AccessAdmin() {
  const [email, setEmail] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const grantFn = useServerFn(grantPremium);
  const revokeFn = useServerFn(revokePremium);
  const usersFn = useServerFn(listAllUsers);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all_users"],
    queryFn: () => usersFn(),
    refetchInterval: 15_000,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u: any) =>
        u.email.toLowerCase().includes(term) || (u.name ?? "").toLowerCase().includes(term),
    );
  }, [users, q]);

  const stats = useMemo(() => {
    const total = users.length;
    const paying = users.filter((u: any) => u.subscription?.status === "active" || u.subscription?.status === "trialing").length;
    const manual = users.filter((u: any) => u.is_premium_manual).length;
    const admins = users.filter((u: any) => u.is_admin).length;
    return { total, paying, manual, admins };
  }, [users]);

  async function grant(target?: string, opts?: { permanent?: boolean }) {
    const value = (target ?? email).trim();
    if (!value) return toast.error("Informe o email");
    const isPerm = opts?.permanent ?? permanent;
    try {
      const res = await grantFn({ data: { email: value, permanent: isPerm } });
      toast.success(res.message);
      if (!target) setEmail("");
      qc.invalidateQueries({ queryKey: ["all_users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function revoke(userId: string, name: string) {
    if (!confirm(`Remover acesso Premium gratuito de ${name}?`)) return;
    try {
      await revokeFn({ data: { userId } });
      toast.success("Acesso removido");
      qc.invalidateQueries({ queryKey: ["all_users"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-5">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-leaf" />
            <div>
              <div className="text-2xl font-black text-cream">{stats.total}</div>
              <div className="text-xs text-foreground/60">Usuários totais</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-gold" />
            <div>
              <div className="text-2xl font-black text-cream">{stats.paying}</div>
              <div className="text-xs text-foreground/60">Assinantes ativos</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-gold" />
            <div>
              <div className="text-2xl font-black text-cream">{stats.manual}</div>
              <div className="text-xs text-foreground/60">Liberados manualmente</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-leaf" />
            <div>
              <div className="text-2xl font-black text-cream">{stats.admins}</div>
              <div className="text-xs text-foreground/60">Administradores</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Liberação por email */}
      <Card>
        <div className="flex items-start gap-3">
          <Gift className="mt-1 h-5 w-5 flex-shrink-0 text-gold" />
          <div>
            <h2 className="font-display text-lg font-black text-cream">Liberar Premium por email</h2>
            <p className="mt-1 text-xs text-foreground/60">
              Use para membros da comunidade Pataxó ou convidados. O usuário precisa ter conta criada.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Field label="Email do usuário (Domínio empresarial awa-tech.store)">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@exemplo.com"
              onKeyDown={(e) => e.key === "Enter" && grant()}
            />
          </Field>
          <div className="flex items-end">
            <Btn onClick={() => grant()}>
              <UserPlus className="h-4 w-4" /> Liberar Premium
            </Btn>
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-foreground/70">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(e) => setPermanent(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          <span>
            <strong className="text-gold">Permanente</strong> (sem expirar). Se desmarcado, libera
            por <strong>1 mês</strong>.
          </span>
        </label>
      </Card>

      {/* Diretório de usuários */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-cream">
            Quem está acessando ({filtered.length})
          </h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por email ou nome..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid gap-2">
          {isLoading && (
            <div className="rounded-2xl border border-gold/15 bg-card/30 p-6 text-center text-sm text-foreground/60">
              Carregando usuários...
            </div>
          )}
          {!isLoading &&
            filtered.map((u: any) => {
              const isPaying =
                u.subscription?.status === "active" || u.subscription?.status === "trialing";
              return (
                <Card key={u.user_id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {u.photo_url ? (
                        <img
                          src={u.photo_url}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-leaf/20 font-black text-leaf">
                          {(u.name || u.email || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-cream">
                            {u.name || "Sem nome"}
                          </span>
                          {u.is_admin && (
                            <span className="rounded-full bg-leaf/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-leaf">
                              Admin
                            </span>
                          )}
                          {u.is_premium_manual && (
                            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-gold">
                              {u.premium_permanent ? "Permanente" : "Liberado"}
                            </span>
                          )}
                          {isPaying && (
                            <span className="rounded-full bg-gold/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-gold">
                              Assinante
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-foreground/60">{u.email}</div>
                        <div className="mt-0.5 text-[11px] text-foreground/50">
                          Cadastro: {fmt(u.created_at)} · Último acesso: {fmt(u.last_sign_in_at)}
                          {u.is_premium_manual && !u.premium_permanent && u.premium_expires_at && (
                            <> · <span className="text-gold/80">Expira: {fmt(u.premium_expires_at)}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {u.is_premium_manual ? (
                        <>
                          {!u.premium_permanent && (
                            <Btn onClick={() => grant(u.email, { permanent: true })}>
                              <Crown className="h-4 w-4" /> Tornar permanente
                            </Btn>
                          )}
                          <Btn variant="danger" onClick={() => revoke(u.user_id, u.name || u.email)}>
                            <Trash2 className="h-4 w-4" /> Revogar
                          </Btn>
                        </>
                      ) : (
                        !isPaying &&
                        !u.is_admin && (
                          <>
                            <Btn onClick={() => grant(u.email, { permanent: false })}>
                              <Crown className="h-4 w-4" /> 1 mês
                            </Btn>
                            <Btn onClick={() => grant(u.email, { permanent: true })}>
                              <Crown className="h-4 w-4" /> Permanente
                            </Btn>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          {!isLoading && filtered.length === 0 && (
            <div className="rounded-2xl border border-gold/15 bg-card/30 p-6 text-center text-sm text-foreground/60">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
