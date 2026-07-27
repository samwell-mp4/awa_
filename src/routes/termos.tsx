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
      <p className="mt-2 text-xs text-foreground/60">
        Última atualização: {new Date().toLocaleDateString("pt-BR")}
      </p>

      <h2 className="mt-8 font-display text-xl font-bold text-gold">1. Quem somos</h2>
      <p>
        O <b>AWÃ TECH</b> é operado por <b>Adler Magno Santos</b>, pessoa física inscrita no CPF sob nº
        <b> 859.648.465-56</b>, sediado no Brasil ("nós", "nosso"). Ao criar uma conta ou assinar, você
        ("usuário") celebra um contrato conosco nos termos deste documento. Se não concordar, não use a
        plataforma.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">2. Serviço</h2>
      <p>
        O AWÃ TECH é uma plataforma educacional dedicada ao ensino da língua Patxôhã (povo Pataxó) e das culturas
        indígenas brasileiras, oferecendo dicionário, trilhas, vídeos, músicas, jogos e um assistente de IA
        (Professor Akuã). Você declara ter capacidade legal para contratar ou, se menor, agir com autorização de
        responsável.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">3. Planos e cobrança</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li><b>Básico</b> (grátis): saudações, home, planos e biografia.</li>
        <li><b>Premium Mensal</b>: R$ 29,90/mês, renovação automática mensal.</li>
        <li><b>Premium Semestral</b>: R$ 149,90 a cada 6 meses, renovação automática.</li>
      </ul>
      <p className="mt-2">
        A cobrança, faturamento, impostos e emissão de recibos são processados por <b>Paddle.com Market Limited</b>,
        nosso <b>Merchant of Record</b>. Ao comprar, você também aceita os{" "}
        <a
          className="text-gold underline"
          href="https://www.paddle.com/legal/checkout-buyer-terms"
          target="_blank"
          rel="noreferrer"
        >
          Termos do Comprador da Paddle
        </a>
        , que regulam pagamento, cobrança, tributos, cancelamentos e reembolsos.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">4. Cancelamento e reembolso</h2>
      <p>
        Você pode cancelar a qualquer momento em <b>Minha conta → Gerenciar assinatura</b>. O acesso Premium
        permanece disponível até o fim do período já pago. Reembolsos seguem nossa{" "}
        <Link to="/reembolso" className="text-gold underline">Política de Reembolso</Link> (garantia de 14 dias).
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">5. Conta e segurança</h2>
      <p>
        Você é responsável por manter a confidencialidade das suas credenciais e por toda atividade realizada na
        sua conta. Deve fornecer informações verdadeiras e mantê-las atualizadas.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">6. Uso aceitável</h2>
      <p>Você concorda em não:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>usar a plataforma para fins ilegais, fraudulentos ou de spam;</li>
        <li>copiar, redistribuir ou explorar comercialmente conteúdo Patxôhã sem autorização, respeitando os direitos culturais e coletivos do povo Pataxó;</li>
        <li>violar direitos de propriedade intelectual de terceiros;</li>
        <li>tentar acessar áreas restritas, contornar limites técnicos, executar engenharia reversa ou introduzir malware;</li>
        <li>coletar dados de outros usuários sem consentimento (scraping, sondagem, etc.).</li>
      </ul>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">7. Propriedade intelectual</h2>
      <p>
        A plataforma AWÃ TECH — software, design, marca, logotipos, textos, áudios, vídeos e demais materiais
        produzidos por nós ou nossos licenciadores — é protegida por direitos autorais e demais leis aplicáveis, e
        permanece de nossa titularidade. Concedemos a você uma licença <b>limitada, pessoal, não exclusiva e
        intransferível</b> de uso, apenas conforme o plano contratado. Conteúdos originários da tradição oral e
        cultural do povo Pataxó pertencem coletivamente à comunidade Pataxó e são disponibilizados aqui para fins
        educacionais.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">8. Garantias e limitação de responsabilidade</h2>
      <p>
        O serviço é fornecido <b>"no estado em que se encontra" (as-is)</b>, sem garantia de funcionamento
        ininterrupto ou livre de erros. Na máxima extensão permitida por lei, afastamos garantias implícitas de
        adequação a finalidade específica. Não nos responsabilizamos por danos indiretos, lucros cessantes, perda
        de dados ou perda de oportunidade. Nossa responsabilidade agregada por qualquer reivindicação relacionada
        ao serviço fica limitada ao total pago por você nos 12 meses anteriores ao evento que gerou a
        reivindicação. Nada nestes Termos exclui responsabilidades que não possam ser excluídas por lei
        (por exemplo, dolo, morte ou dano pessoal).
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">9. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar seu acesso, com ou sem aviso prévio, em caso de: (a) violação destes Termos
        ou da Política de Uso Aceitável; (b) inadimplência ou estorno de pagamento; (c) risco de fraude, abuso ou
        segurança; ou (d) exigência legal. Você pode encerrar sua conta a qualquer momento. Após o encerramento,
        seus dados podem ser retidos pelo período legalmente exigido e depois excluídos ou anonimizados.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">10. Conteúdo de IA (Professor Akuã)</h2>
      <p>
        As respostas do assistente de IA são geradas automaticamente e podem conter imprecisões. Não substituem
        aconselhamento profissional. Você é responsável pelos prompts enviados e pelo uso que faz das respostas,
        e deve ter direitos sobre qualquer conteúdo que enviar.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">11. Alterações destes Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. Alterações materiais serão comunicadas por e-mail ou dentro
        da plataforma. O uso continuado após a data de vigência implica aceitação.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">12. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da <b>República Federativa do Brasil</b>. Fica eleito o foro do
        domicílio do consumidor para dirimir controvérsias.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-gold">13. Contato</h2>
      <p>
        Dúvidas:{" "}
        <a className="text-gold underline" href="mailto:duvidas@awa-tech.store">
          duvidas@awa-tech.store
        </a>
        .
      </p>
    </LegalShell>
  );
}

export { LegalShell };
