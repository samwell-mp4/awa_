import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reembolso")({
  head: () => ({ meta: [{ title: "Política de Reembolso — AWÃ TECH" }] }),
  component: ReembolsoPage,
});

function ReembolsoPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="font-display text-sm font-black uppercase tracking-wider text-cream">Reembolso</div>
          <div className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14 text-foreground/85 text-[15px] leading-relaxed">
        <h1 className="font-display text-3xl font-black text-cream">Política de Reembolso</h1>
        <p className="mt-2 text-xs text-foreground/60">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <p className="mt-4">
          Esta política se aplica às assinaturas do <b>AWÃ TECH</b>, serviço fornecido por{" "}
          <b>Adler Magno Santos</b> (nome comercial AWÃ TECH).
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-gold">Garantia de 30 dias</h2>
        <p>
          Oferecemos <b>garantia de reembolso integral em até 30 dias</b> após a contratação, sem necessidade de
          justificativa. Esse prazo atende e supera o direito de arrependimento previsto no{" "}
          <b>Art. 49 do Código de Defesa do Consumidor</b>.
        </p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Como solicitar</h2>
        <p>
          O reembolso é processado por <b>Paddle.com</b>, nosso Merchant of Record (revendedor oficial). Você pode:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>
            Acessar <a className="text-gold underline" href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a>{" "}
            com o e-mail da compra para gerenciar pagamentos e pedir reembolso; ou
          </li>
          <li>
            Enviar e-mail para{" "}
            <a className="text-gold underline" href="mailto:duvidas@awa-tech.store">duvidas@awa-tech.store</a> com o
            assunto <b>“Reembolso”</b>, incluindo o e-mail cadastrado e a data da compra.
          </li>
        </ol>
        <p className="mt-2">Processamos a solicitação em até 7 dias úteis.</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Após os 30 dias</h2>
        <p>
          Você pode cancelar a renovação a qualquer momento em{" "}
          <Link to="/minha-conta" className="text-gold underline">Minha conta</Link>. O acesso Premium continua ativo
          até o fim do período já pago. Casos excepcionais (cobrança duplicada, falha técnica que impeça o uso do
          serviço, etc.) são avaliados individualmente pelo suporte da Paddle.
        </p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Assinatura semestral</h2>
        <p>
          A garantia de 30 dias vale igualmente para o plano semestral. Após esse prazo, não há reembolso proporcional
          dos meses restantes, mas o acesso segue ativo até o fim do semestre pago.
        </p>
      </main>
    </div>
  );
}
