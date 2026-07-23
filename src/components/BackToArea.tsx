import { Link } from "@tanstack/react-router";
import { useLastArea } from "@/lib/last-area";
import type { ReactNode } from "react";

/**
 * Voltar para a área atual (adulto/infantil) em vez da tela inicial.
 * Se o usuário ainda não entrou em uma área, volta para "/".
 */
export function BackToArea({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const area = useLastArea();
  return (
    <Link to={area as "/"} className={className}>
      {children}
    </Link>
  );
}
