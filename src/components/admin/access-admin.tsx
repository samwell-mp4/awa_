import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Crown, Gift, Search, Shield, Trash2, UserPlus, Users, ShieldAlert, ShieldCheck, ShieldClose } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";
import {
  grantPremium,
  revokePremium,
  listAllUsers,
} from "@/lib/admin-access.functions";
import { checkPermission } from "@/lib/permissions.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

type UserPermission = {
  id: string;
  user_id: string;
  permission: string;
  created_at: string;
};

const PERMISSIONS = [
  { k: "edit_covers", label: "Editar Capas de Músicas", desc: "Permite fazer upload de novas capas para as cantigas." },
  { k: "edit_lyrics", label: "Editar Letras", desc: "Permite alterar os textos e traduções das músicas." },
  { k: "edit_layout", label: "Editar Layout", desc: "Permite mudar tamanhos de fonte e cores das legendas." },
  { k: "manage_permissions", label: "Gerenciar Permissões", desc: "Permite dar acesso a outros usuários (Admin Jr)." },
];

export function AccessAdmin() {
  const [email, setEmail] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [canManage, setCanManage] = useState(false);

  const qc = useQueryClient();
  const grantFn = useServerFn(grantPremium);
  const revokeFn = useServerFn(revokePremium);
  const usersFn = useServerFn(listAllUsers);
  const checkPerm = useServerFn(checkPermission);

  useEffect(() => {
    checkPerm({ data: { permission: "manage_permissions" } }).then(setCanManage);
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all_users"],
    queryFn: () => usersFn(),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  // Novos cadastros aparecem na hora (sem esperar o refetch periódico)
  useEffect(() => {
    const ch = supabase
      .channel("admin-new-signups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          qc.invalidateQueries({ queryKey: ["all_users"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "login_allowlist" },
        () => {
          qc.invalidateQueries({ queryKey: ["all_users"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);


  const { data: allPermissions = [] } = useQuery({
    queryKey: ["admin_user_permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_permissions").select("*");
      if (error) throw error;
      return data as UserPermission[];
    },
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

  async function togglePermission(userId: string, permission: string) {
    if (!canManage) {
      toast.error("Você não tem permissão para gerenciar outros usuários.");
      return;
    }
    setLoadingPerm(true);
    const existing = allPermissions.find(p => p.user_id === userId && p.permission === permission);
    
    if (existing) {
      const { error } = await supabase.from("user_permissions").delete().eq("id", existing.id);
      if (error) toast.error(error.message);
      else toast.success("Permissão removida");
    } else {
      const { error } = await supabase.from("user_permissions").insert({ user_id: userId, permission });
      if (error) toast.error(error.message);
      else toast.success("Permissão concedida");
    }
    qc.invalidateQueries({ queryKey: ["admin_user_permissions"] });
    setLoadingPerm(false);
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-display font-black text-sm ${activeTab === "users" ? "bg-gold text-forest-deep shadow-glow" : "text-foreground/60 hover:text-cream"}`}
        >
          <Crown className="h-4 w-4" /> Acesso Premium
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-display font-black text-sm ${activeTab === "permissions" ? "bg-emerald-500 text-white shadow-glow" : "text-foreground/60 hover:text-cream"}`}
        >
          <Shield className="h-4 w-4" /> Permissões (Admin Jr)
        </button>
      </div>

      {activeTab === "users" ? (
        <>
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
              <Field label="Email do usuário (Gmail ou outro)">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pessoa@gmail.com"
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
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-100/80 leading-relaxed">
              <strong className="text-emerald-300 block mb-1">Permissões Granulares</strong>
              Use esta seção para dar acesso limitado a usuários específicos. Eles não serão administradores totais, mas poderão editar partes do site como capas de músicas ou letras.
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-cream">
              Diretório de Permissões ({filtered.length})
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

          <div className="grid gap-4">
            {filtered.map((u: any) => {
              const userPerms = allPermissions.filter(perm => perm.user_id === u.user_id);
              return (
                <Card key={u.user_id} className={userPerms.length > 0 ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="truncate font-display text-base font-black text-cream">{u.name || u.email || "Sem nome"}</div>
                      {userPerms.length > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3" /> {userPerms.length} Habilitadas
                        </span>
                      )}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-2">
                      {PERMISSIONS.map(perm => {
                        const has = userPerms.some(up => up.permission === perm.k);
                        return (
                          <button
                            key={perm.k}
                            onClick={() => togglePermission(u.user_id, perm.k)}
                            disabled={loadingPerm || (!canManage && perm.k === "manage_permissions")}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition text-left group ${has ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/20 border-white/5 hover:border-white/20"}`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg ${has ? "bg-emerald-500 text-white" : "bg-white/5 text-foreground/40"}`}>
                              {has ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-black ${has ? "text-emerald-400" : "text-cream"}`}>{perm.label}</div>
                              <div className="text-[10px] text-foreground/50 mt-1 leading-tight">{perm.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
