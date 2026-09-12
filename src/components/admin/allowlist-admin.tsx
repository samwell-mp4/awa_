import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Mail, Phone, Trash2, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Btn, Card, Field, Input } from "./ui";
import { addAllowlist, listAllowlist, removeAllowlist } from "@/lib/admin-access.functions";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AllowlistAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAllowlist);
  const addFn = useServerFn(addAllowlist);
  const removeFn = useServerFn(removeAllowlist);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<"ambos" | "adulto" | "infantil">("ambos");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["login_allowlist"],
    queryFn: () => listFn(),
    refetchInterval: 30_000,
  });

  async function add() {
    if (!email.trim() && !phone.trim()) return toast.error("Informe email ou celular");
    try {
      const res = await addFn({ data: { email: email.trim() || undefined, phone: phone.trim() || undefined, note: note.trim() || undefined, plan } });
      toast.success(
        res?.activated
          ? "Acesso liberado e ativado na hora para essa pessoa"
          : "Acesso liberado — será ativado automaticamente quando a pessoa criar a conta",
      );
      setEmail("");
      setPhone("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["login_allowlist"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }


  async function remove(id: string, label: string) {
    if (!confirm(`Remover acesso de ${label}?`)) return;
    try {
      await removeFn({ data: { id } });
      toast.success("Acesso removido");
      qc.invalidateQueries({ queryKey: ["login_allowlist"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-3">
          <KeyRound className="mt-1 h-5 w-5 flex-shrink-0 text-gold" />
          <div>
            <h2 className="font-display text-lg font-black text-cream">Liberação de acesso ao aplicativo</h2>
            <p className="mt-1 text-xs text-foreground/60">
              Somente o administrador e as pessoas listadas aqui conseguem criar conta e entrar no AWÃ TECH.
              Informe um email <strong>ou</strong> um celular (formato internacional, ex: <code>+5573999999999</code>).
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="Email">
            <Input type="email" placeholder="pessoa@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Celular (com +55)">
            <Input type="tel" placeholder="+5573999999999" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Observação (opcional)">
            <Input placeholder="Ex: Professora Ana" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <div className="mb-1.5 text-xs font-semibold text-foreground/70">Áreas liberadas</div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gold/20 bg-background/40 p-1">
            {([
              { v: "ambos", l: "Adulto + Infantil" },
              { v: "adulto", l: "Somente Adulto" },
              { v: "infantil", l: "Somente Infantil" },
            ] as const).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setPlan(o.v)}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  plan === o.v
                    ? "bg-gold/15 text-cream ring-1 ring-gold/40"
                    : "text-foreground/60 hover:bg-gold/5 hover:text-cream"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Btn onClick={add}><UserPlus className="h-4 w-4" /> Liberar acesso</Btn>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-display text-sm font-black uppercase tracking-wider text-cream">
          Liberados ({entries.length})
        </h3>
        <div className="grid gap-2">
          {isLoading && (
            <div className="rounded-2xl border border-gold/15 bg-card/30 p-6 text-center text-sm text-foreground/60">
              Carregando...
            </div>
          )}
          {!isLoading && entries.length === 0 && (
            <div className="rounded-2xl border border-gold/15 bg-card/30 p-6 text-center text-sm text-foreground/60">
              Nenhum email ou celular liberado ainda. Apenas o administrador consegue entrar.
            </div>
          )}
          {entries.map((e: any) => (
            <Card key={e.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.email && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-2.5 py-1 text-xs font-semibold text-leaf">
                        <Mail className="h-3.5 w-3.5" /> {e.email}
                      </span>
                    )}
                    {e.phone && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">
                        <Phone className="h-3.5 w-3.5" /> {e.phone}
                      </span>
                    )}
                  </div>
                  {e.note && <div className="mt-1 truncate text-sm text-foreground/70">{e.note}</div>}
                  <div className="mt-0.5 text-[11px] text-foreground/50">Adicionado: {fmt(e.created_at)}</div>
                </div>
                <Btn variant="danger" onClick={() => remove(e.id, e.email || e.phone)}>
                  <Trash2 className="h-4 w-4" /> Remover
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
