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
        },
      });
    } catch (e: any) {
      toast.error("Não foi possível abrir o checkout: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
