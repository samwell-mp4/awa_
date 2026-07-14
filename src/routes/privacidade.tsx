import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade — AWÃ TECH" }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="font-display text-sm font-black uppercase tracking-wider text-cream">Privacidade</div>
          <div className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14 text-foreground/85 text-[15px] leading-relaxed">
        <h1 className="font-display text-3xl font-black text-cream">Política de Privacidade</h1>
        <p className="mt-2 text-xs text-foreground/60">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="mt-8 font-display text-xl font-bold text-gold">1. Quem somos (Controlador)</h2>
        <p>O <b>AWÃ TECH</b>, operado por <b>Adler Magno Santos</b> (CPF 859.648.465-56), é o Controlador de dados nos termos da LGPD. Contato do encarregado: <a className="text-gold underline" href="mailto:adlermagno8@gmail.com">adlermagno8@gmail.com</a>.</p>
        <p className="mt-2">Compartilhamos dados com os seguintes destinatários: <b>Paddle.com Market Limited</b> (Merchant of Record — processa pagamentos, faturas e impostos); provedores de infraestrutura em nuvem (hospedagem, banco de dados, e-mail transacional); e autoridades quando exigido por lei. Transferências internacionais seguem garantias adequadas conforme a LGPD.</p>
        <p className="mt-2">Retenção: mantemos seus dados enquanto sua conta estiver ativa e pelo prazo legal exigido após o encerramento (tipicamente 5 anos para dados fiscais). Após esse período os dados são excluídos ou anonimizados. Adotamos medidas técnicas e organizacionais adequadas de segurança (criptografia em trânsito e em repouso, controle de acesso).</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">2. Dados que coletamos</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Cadastro: nome, e-mail, senha (criptografada).</li>
          <li>Uso: progresso nas trilhas, ranking, mensagens ao Professor Akuã.</li>
          <li>Pagamento: processado 100% pelo <b>Paddle</b> — nós recebemos apenas o status da assinatura, nunca o cartão.</li>
        </ul>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">3. Finalidade</h2>
        <p>Usamos seus dados para autenticar o acesso, personalizar o aprendizado, processar pagamentos e melhorar a plataforma. Não vendemos seus dados.</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">4. Base legal (LGPD)</h2>
        <p>Consentimento (cadastro voluntário), execução de contrato (assinatura Premium) e legítimo interesse (segurança e prevenção de fraude).</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">5. Seus direitos</h2>
        <p>Você pode acessar, corrigir ou excluir seus dados a qualquer momento em <Link to="/minha-conta" className="text-gold underline">Minha conta</Link> ou pelo e-mail acima.</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">6. Cookies</h2>
        <p>Usamos cookies essenciais para manter você logado. Não utilizamos cookies de publicidade.</p>
      </main>
    </div>
  );
}
