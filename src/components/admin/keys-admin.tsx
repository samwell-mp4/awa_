import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Key, Globe, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui";
import { getSiteKeys } from "@/lib/admin-access.functions";

export function KeysAdmin() {
  const getKeys = useServerFn(getSiteKeys);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["site_keys"],
    queryFn: () => getKeys(),
  });

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar", err);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center text-foreground/60">Carregando chaves...</div>;
  }

  const items = [
    {
      id: "supabase_url",
      label: "Supabase URL",
      value: data?.supabase_url,
      icon: Globe,
      desc: "Endereço base do banco de dados e autenticação.",
    },
    {
      id: "supabase_anon",
      label: "Supabase Anon Key",
      value: data?.supabase_anon_key,
      icon: Key,
      desc: "Chave pública para acesso anônimo ao backend (publishable).",
    },
    {
      id: "paddle_env",
      label: "Ambiente Paddle",
      value: data?.paddle_env === "sandbox" ? "Teste (Sandbox)" : "Produção (Live)",
      icon: ShieldCheck,
      desc: "Define se os pagamentos são simulados ou reais.",
    },
    {
      id: "company_logo",
      label: "Logo da Empresa",
      value: "/og-awa-tech.png",
      icon: CheckCircle2,
      desc: "Logo oficial para compartilhamento e metadados.",
    },
    {
      id: "company_name",
      label: "Nome da Empresa",
      value: "AWÃ TECH",
      icon: CheckCircle2,
      desc: "Nome oficial da plataforma.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-black text-cream">Chaves de API e Identificadores</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Estes valores são usados para conectar o site aos serviços de nuvem e pagamentos.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-black text-cream">{item.label}</h4>
                  <p className="text-xs text-foreground/60">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="max-w-[200px] truncate rounded-lg bg-black/40 px-3 py-1.5 font-mono text-xs text-gold/90 sm:max-w-[300px]">
                  {item.value || "Não configurado"}
                </div>
                {item.value && (
                  <button
                    onClick={() => copy(item.value!, item.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold transition hover:bg-gold/15"
                    title="Copiar"
                  >
                    {copied === item.id ? (
                      <CheckCircle2 className="h-4 w-4 text-leaf" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-xs text-foreground/60 italic">
        Nota: A chave secreta do Supabase (Service Role) e chaves privadas do Paddle não são exibidas aqui por segurança, 
        pois possuem permissões administrativas totais.
      </div>
    </div>
  );
}
