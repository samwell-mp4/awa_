import { Link } from "@tanstack/react-router";
import { Crown, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";

export function PremiumGate({
  children,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return <>{children}</>;
}

