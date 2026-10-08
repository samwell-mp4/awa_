import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: string;
  badge?: string;
  stats?: {
    current: number;
    total: number;
    unit?: string;
  };
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  badge,
  stats,
  action,
  className = "",
}: PageHeaderProps) {
  const percent = stats && stats.total > 0 ? Math.round((stats.current / stats.total) * 100) : 0;

  return (
    <header className={`mb-6 md:mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Navegação estrutural" className="mb-2.5 flex items-center gap-1.5 text-xs text-[#d4a373]">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />}
                {b.href && !isLast ? (
                  <Link to={b.href as any} className="hover:text-[#ffd166] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-[#fdfaf3]" : ""}>{b.label}</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#ffd166] tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full border border-[#8d5b2d] bg-[#331f13] px-2.5 py-0.5 text-xs font-semibold text-[#ffd166]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm sm:text-base text-[#d4a373] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Stats and Action CTA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {stats && (
            <div className="flex flex-col items-start sm:items-end rounded-xl border border-[#6d4220] bg-[#24150a] px-3.5 py-2 shadow-sm">
              <div className="text-xs font-medium text-[#d4a373]">
                {stats.current} de {stats.total} {stats.unit ?? "concluídos"} ({percent}%)
              </div>
              <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-full bg-[#180d05]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ffd166] to-[#4ade80] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {action && (
            action.href ? (
              <Link
                to={action.href as any}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] px-4 py-2.5 text-sm font-bold text-[#0d2818] shadow transition hover:brightness-110 active:scale-95"
              >
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] px-4 py-2.5 text-sm font-bold text-[#0d2818] shadow transition hover:brightness-110 active:scale-95"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
