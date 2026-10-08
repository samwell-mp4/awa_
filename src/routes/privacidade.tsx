import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade — AWÃ TECH" }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <LegalShell title="Privacidade">
      <h1 className="font-display text-3xl font-black text-[#11231b]">Política de Privacidade</h1>
      <p className="mt-2 text-xs text-[#6b7280]">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2 className="mt-8 font-display text-xl font-bold text-[#1b4332]">1. Quem somos (Controlador)</h2>
      <p>O <b>AWÃ TECH</b> é o Controlador de dados nos termos da LGPD. Contato do encarregado: <a className="text-[#1b4332] underline hover:text-[#2d6a4f]" href="mailto:duvidas@awa-tech.store">duvidas@awa-tech.store</a>.</p>
      <p className="mt-2">Compartilhamos dados com os seguintes destinatários: <b>Paddle.com Market Limited</b> (Merchant of Record — processa pagamentos, faturas e impostos); provedores de infraestrutura em nuvem (hospedagem, banco de dados, e-mail transacional); e autoridades quando exigido por lei. Transferências internacionais seguem garantias adequadas conforme a LGPD.</p>
      <p className="mt-2">Retenção: mantemos seus dados enquanto sua conta estiver ativa e pelo prazo legal exigido após o encerramento (tipicamente 5 anos para dados fiscais). Após esse período os dados são excluídos ou anonimizados. Adotamos medidas técnicas e organizacionais adequadas de segurança (criptografia em trânsito e em repouso, controle de acesso).</p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">2. Dados que coletamos</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Cadastro: nome, e-mail, senha (criptografada).</li>
        <li>Uso: progresso nas trilhas, ranking, mensagens ao Professor Akuã.</li>
        <li>Pagamento: processado 100% pelo <b>Paddle</b> — nós recebemos apenas o status da assinatura, nunca o cartão.</li>
      </ul>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">3. Finalidade</h2>
      <p>Usamos seus dados para autenticar o acesso, personalizar o aprendizado, processar pagamentos e melhorar a plataforma. Não vendemos seus dados.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">4. Base legal (LGPD)</h2>
      <p>Consentimento (cadastro voluntário), execução de contrato (assinatura Premium) e legítimo interesse (segurança e prevenção de fraude).</p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">5. Seus direitos</h2>
      <p>Você pode acessar, corrigir ou excluir seus dados a qualquer momento em <Link to="/minha-conta" className="text-[#1b4332] underline hover:text-[#2d6a4f]">Minha conta</Link> ou pelo e-mail acima.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">6. Cookies</h2>
      <p>Usamos cookies essenciais para manter você logado. Não utilizamos cookies de publicidade.</p>
    </LegalShell>
  );
}
