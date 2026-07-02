import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
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
      const paddlePriceId = await getPaddlePriceId(options.priceId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: options.email ? { email: options.email } : undefined,
        customData: { userId: options.userId },
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
