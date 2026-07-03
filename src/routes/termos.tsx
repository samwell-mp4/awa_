import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Termos de uso — AWÃ TECH" }] }),
  component: TermosPage,
});

function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="font-display text-sm font-black uppercase tracking-wider text-cream">{title}</div>
          <div className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14 text-foreground/85 text-[15px] leading-relaxed">
        {children}
      </main>
    </div>
  );
}

function TermosPage() {
  return (
    <LegalShell title="Termos de uso">
      <h1 className="font-display text-3xl font-black text-cream">Termos de uso</h1>
      <p className="mt-2 text-xs text-foreground/60">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2 className="mt-8 font-display text-xl font-bold text-gold">1. Aceitação</h2>
      <p>Ao criar uma conta ou assinar o <b>AWÃ TECH</b>, operado por <b>Akuã</b> ("nós"), você concorda com estes Termos. Se não concordar, não use a plataforma.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">2. Serviço</h2>
      <p>O AWÃ TECH é uma plataforma educacional de ensino da língua Patxôhã (povo Pataxó) e culturas indígenas brasileiras, oferecendo dicionário, trilhas, vídeos, músicas, jogos e um assistente de IA (Professor Akuã).</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">3. Planos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li><b>Básico</b> (grátis): saudações, home, planos e biografia.</li>
        <li><b>Premium Mensal</b>: R$ 29,90/mês, cobrado automaticamente a cada mês.</li>
        <li><b>Premium Semestral</b>: R$ 149,90 a cada 6 meses.</li>
      </ul>
      <p className="mt-2">A cobrança é processada por <b>Paddle.com</b>, nosso Merchant of Record. A renovação é automática até o cancelamento.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">4. Cancelamento</h2>
      <p>Você pode cancelar a qualquer momento pelo menu <b>Minha conta → Gerenciar assinatura</b>. O acesso Premium permanece disponível até o fim do período já pago.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">5. Reembolso</h2>
      <p>Consulte nossa <Link to="/reembolso" className="text-gold underline">Política de Reembolso</Link>.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">6. Uso aceitável</h2>
      <p>Você concorda em não copiar, redistribuir ou explorar comercialmente o conteúdo Patxôhã sem autorização, respeitando os direitos culturais e coletivos do povo Pataxó.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">7. Contato</h2>
      <p>Dúvidas: <a className="text-gold underline" href="mailto:adlermagno8@gmail.com">adlermagno8@gmail.com</a>.</p>
    </LegalShell>
  );
}

export { LegalShell };
