import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalShell } from "./termos";

export const Route = createFileRoute("/reembolso")({
  head: () => ({ meta: [{ title: "Política de Reembolso — AWÃ TECH" }] }),
  component: ReembolsoPage,
});

function ReembolsoPage() {
  return (
    <LegalShell title="Reembolso">
      <h1 className="font-display text-3xl font-black text-[#11231b]">Política de Reembolso</h1>
      <p className="mt-2 text-xs text-[#6b7280]">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2 className="mt-8 font-display text-xl font-bold text-[#1b4332]">Garantia de 14 dias</h2>
      <p>
        Oferecemos <b>garantia de reembolso integral em até 14 dias</b> após a contratação, sem necessidade de
        justificativa. Esse prazo atende e supera o direito de arrependimento previsto no{" "}
        <b>Art. 49 do Código de Defesa do Consumidor</b>.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">Como solicitar</h2>
      <p>
        O reembolso é processado por <b>Paddle.com</b>, nosso Merchant of Record (revendedor oficial). Você pode:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-6">
        <li>
          Acessar <a className="text-[#1b4332] underline hover:text-[#2d6a4f]" href="https://paddle.net">paddle.net</a>{" "}
          com o e-mail da compra para gerenciar pagamentos e pedir reembolso; ou
        </li>
        <li>
          Enviar e-mail para{" "}
          <a className="text-[#1b4332] underline hover:text-[#2d6a4f]" href="mailto:duvidas@awa-tech.store">duvidas@awa-tech.store</a> com o
          assunto <b>“Reembolso”</b>, incluindo o e-mail cadastrado e a data da compra.
        </li>
      </ol>
      <p className="mt-2">Processamos a solicitação em até 7 dias úteis.</p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">Após os 14 dias</h2>
      <p>
        Você pode cancelar a renovação a qualquer momento em{" "}
        <Link to="/minha-conta" className="text-[#1b4332] underline hover:text-[#2d6a4f]">Minha conta</Link>. O acesso Premium continua ativo
        até o fim do período já pago. Casos excepcionais (cobrança duplicada, falha técnica que impeça o uso do
        serviço, etc.) são avaliados individualmente pelo suporte da Paddle.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold text-[#1b4332]">Assinatura semestral</h2>
      <p>
        A garantia de 14 dias vale igualmente para o plano semestral. Após esse prazo, não há reembolso proporcional
        dos meses restantes, mas o acesso segue ativo até o fim do semestre pago.
      </p>
    </LegalShell>
  );
}
