import React from "react";
import { CheckCircle2, Circle, Clock, Lock, Sparkles } from "lucide-react";

export type LearningStatus = "nao_iniciado" | "em_andamento" | "concluido" | "bloqueado" | "novo";

interface LearningStatusBadgeProps {
  status: LearningStatus;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function LearningStatusBadge({
  status,
  label,
  size = "md",
  className = "",
}: LearningStatusBadgeProps) {
  const configs: Record<
    LearningStatus,
    { text: string; icon: React.ComponentType<{ className?: string }>; style: string }
  > = {
    nao_iniciado: {
      text: "Não iniciado",
      icon: Circle,
      style: "border-[#6d4220] bg-[#24150a] text-[#d4a373]",
    },
    em_andamento: {
      text: "Em andamento",
      icon: Clock,
      style: "border-[#f59e0b]/50 bg-[#3d240f] text-[#ffd166]",
    },
    concluido: {
      text: "Concluído",
      icon: CheckCircle2,
      style: "border-[#4ade80]/50 bg-[#163824] text-[#4ade80]",
    },
    bloqueado: {
      text: "Bloqueado",
      icon: Lock,
      style: "border-[#4a2e18]/40 bg-[#1a0e06] text-[#8c6747]",
    },
    novo: {
      text: "Novo",
      icon: Sparkles,
      style: "border-[#ffd166]/60 bg-[#42280d] text-[#ffd166]",
    },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;
  const displayText = label ?? cfg.text;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-sm ${cfg.style} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
      <span>{displayText}</span>
    </span>
  );
}
