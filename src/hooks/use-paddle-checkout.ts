import { useState } from "react";
import { initializePaddle, getPaddleEnvironment } from "@/lib/paddle";
import { createPaddleCheckout } from "@/lib/paddle-checkout.functions";
import { toast } from "sonner";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    priceId: string;
    userId: string;
    email?: string;
    successUrl?: string;
    /** Restringe os meios de pagamento (ex.: ["pix"] ou ["card"]). Vazio = todos. */
    allowedPaymentMethods?: string[];
  }) => {
    setLoading(true);
    try {
      await initializePaddle();
      // Server binds custom_data.userId to the authenticated caller. We do
      // NOT pass customData from the browser — that would let a buyer redirect
      // the subscription to any account via devtools.
      const { transactionId } = await createPaddleCheckout({
        data: { priceId: options.priceId, environment: getPaddleEnvironment() },
      });

      window.Paddle.Checkout.open({
        transactionId,
        customer: options.email ? { email: options.email } : undefined,
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/planos?checkout=success`,
          allowLogout: false,
          variant: "one-page",
          locale: "pt",
          ...(options.allowedPaymentMethods?.length
            ? { allowedPaymentMethods: options.allowedPaymentMethods }
            : {}),
        },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      // Mensagens já traduzidas pelo servidor aparecem como estão.
      toast.error(
        /[À-ú]/.test(msg) && !msg.startsWith("Paddle")
          ? msg
          : "Não foi possível abrir o pagamento agora. Tente novamente em alguns minutos.",
      );
    } finally {

      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
