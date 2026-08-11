import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAreaGuard, type AreaPlan } from "@/lib/area-guard";

/**
 * Wraps a premium area page. Access is verified in the browser (after mount)
 * and children only render once the plan check passes.
 */
export function AreaGate({ plan, children }: { plan: AreaPlan; children: ReactNode }) {
  const ready = useAreaGuard(plan);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/70">
        <Loader2 className="h-8 w-8 animate-spin" aria-label="Carregando" />
      </div>
    );
  }

  return <>{children}</>;
}
