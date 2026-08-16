import { Card, Btn } from "./ui";
import { Sparkles, FileCode, Shield, Database, Settings } from "lucide-react";

export function SiteAdmin() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-cream">Controle Total do Sistema</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Gerencie a infraestrutura, arquivos e configurações avançadas do AWÃ TECH.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="h-5 w-5 text-gold" />
            <h3 className="font-display font-bold text-cream">Arquivos & Código</h3>
          </div>
          <p className="text-xs text-foreground/60 mb-4">
            Acesso ao repositório de assets, scripts de tradução e componentes visuais.
          </p>
          <Btn className="w-full" variant="outline">Abrir Explorador</Btn>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-gold" />
            <h3 className="font-display font-bold text-cream">Banco de Dados</h3>
          </div>
          <p className="text-xs text-foreground/60 mb-4">
            Gerenciamento de tabelas, migrações e políticas de segurança (RLS).
          </p>
          <Btn className="w-full" variant="outline">Gerenciar Tabelas</Btn>
        </Card>
      </div>

      <Card>
        <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
          <Settings className="h-5 w-5 text-gold" /> Configurações de Administrador
        </h3>
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-gold mb-4">
            <Sparkles className="h-4 w-4" /> Suas permissões de nível mestre estão ativas.
          </p>
          <ul className="space-y-3">
            {[
              "Acesso irrestrito a todas as rotas e funções",
              "Capacidade de alterar temas e tokens globais",
              "Gerenciamento completo de usuários e permissões",
              "Bypass de paywall e limites de uso de IA",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs text-cream/90">
                <span className="text-leaf">●</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
