import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  if (!Number.isFinite(end)) return null;
  return Math.ceil((end - Date.now()) / (24 * 3600 * 1000));
}

export function PlanExpiryBanner() {
  const { user, isAdmin } = useAuth();
  const { subscription, isPremium } = useSubscription();
  if (!user || isAdmin) return null;
  if (!subscription || !isPremium) return null;

  const days = daysUntil(subscription.current_period_end);
  if (days === null) return null;
  if (days > 7 || days < 0) return null;

  const isCanceled = subscription.status === "canceled" || subscription.cancel_at_period_end;
  const isPastDue = subscription.status === "past_due";

  const message = isPastDue
    ? `Pagamento pendente. Regularize para não perder o acesso.`
    : isCanceled
      ? `Sua assinatura foi cancelada e será encerrada em ${days} ${days === 1 ? "dia" : "dias"}.`
      : `Seu plano vence em ${days} ${days === 1 ? "dia" : "dias"}. Renove para não perder o acesso.`;

  return (
    <div className="w-full border-b border-orange-400/50 bg-orange-500/15 px-4 py-2 text-center text-xs md:text-sm">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-orange-100">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          {message}
        </span>
        <Link
          to="/minha-conta"
          className="rounded-full bg-gold px-3 py-1 font-bold text-forest-deep transition hover:brightness-110"
        >
          Gerenciar plano
        </Link>
      </div>
    </div>
  );
}
