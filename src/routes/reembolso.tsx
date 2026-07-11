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

        <h2 className="mt-8 font-display text-xl font-bold text-gold">Direito de arrependimento (7 dias)</h2>
        <p>Conforme o <b>Art. 49 do Código de Defesa do Consumidor</b>, você tem <b>7 dias corridos</b> após a contratação para pedir o cancelamento com reembolso integral, sem justificativa.</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Como solicitar</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Envie um e-mail para <a className="text-gold underline" href="mailto:adlermagno8@gmail.com">adlermagno8@gmail.com</a> com o assunto <b>“Reembolso”</b>.</li>
          <li>Inclua o e-mail cadastrado e a data da compra.</li>
          <li>Processaremos o reembolso via Paddle em até <b>7 dias úteis</b>.</li>
        </ol>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Após os 7 dias</h2>
        <p>Você pode cancelar a renovação a qualquer momento em <Link to="/minha-conta" className="text-gold underline">Minha conta</Link>. Não haverá reembolso proporcional do período já iniciado, mas o acesso Premium continua até o fim do período pago.</p>

        <h2 className="mt-6 font-display text-xl font-bold text-gold">Assinatura semestral</h2>
        <p>Reembolso integral apenas se solicitado nos 7 primeiros dias. Após esse prazo, não é feito reembolso proporcional dos meses restantes — mas o acesso segue ativo até o fim do semestre.</p>
      </main>
    </div>
  );
}
