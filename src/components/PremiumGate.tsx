import { Link } from "@tanstack/react-router";
import { Crown, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";

export function PremiumGate({
  children,
  title = "Conteúdo Premium",
  description = "Assine o AWÃ TECH Premium para desbloquear todo o conteúdo.",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { isPremium, loading } = useSubscription();

  if (loading || authLoading) {
    return <div className="grid min-h-[40vh] place-items-center text-foreground/60">Carregando...</div>;
  }
  if (isAdmin || isPremium) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="card-elev rounded-3xl border border-gold/30 p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--gradient-leaf)] shadow-[var(--shadow-glow)]">
          <Lock className="h-7 w-7 text-cream" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-black text-cream md:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">{description}</p>
        <Link
          to="/planos"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110"
        >
          <Crown className="h-4 w-4" /> {t("premium.verPlanos")}
        </Link>
        {!user && (
          <p className="mt-4 text-xs text-foreground/60">
            <Link to="/auth" className="text-gold hover:underline">
              {t("premium.entrarCriar")}
            </Link>{" "}
            {t("premium.primeiro")}
          </p>
        )}
      </div>
    </div>
  );
}
