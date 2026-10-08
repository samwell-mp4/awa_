import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  mode?: "kids" | "adulto";
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  mode = "kids",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isAdult = mode === "adulto";

  // Generate visible page numbers for desktop
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Paginação de conteúdo"
      className={`w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-between sm:justify-center gap-2 px-1 py-4 select-none ${className}`}
    >
      {/* Botão Anterior */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-xl border text-xs font-bold transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0 shadow-xs ${
          isAdult
            ? "border-[#e8e4dc] bg-white text-[#11231b] hover:border-[#1b4332] hover:bg-[#f4f2ec]"
            : "border-[#633916] bg-[#1e1107] text-[#fefae0] hover:border-[#ffd166]"
        }`}
        aria-label="Página anterior"
      >
        <ChevronLeft className={`h-4 w-4 shrink-0 ${isAdult ? "text-[#1b4332]" : "text-[#ffd166]"}`} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Indicador Central Mobile (< sm): Ultracompacto e centrado, nunca ultrapassa telas estreitas */}
      <div className="flex sm:hidden items-center justify-center flex-1 px-1">
        <span className={`inline-flex items-center justify-center min-h-[38px] px-3.5 rounded-xl border text-xs font-bold whitespace-nowrap shadow-xs tracking-wide ${
          isAdult
            ? "bg-white border-[#e8e4dc] text-[#11231b]"
            : "bg-[#251408] border-[#633916] text-[#ffd166]"
        }`}>
          {currentPage} <span className={isAdult ? "text-[#6b7280] mx-1" : "text-[#d4a373]/60 mx-1"}>/</span> {totalPages}
        </span>
      </div>

      {/* Números das páginas Desktop (>= sm) */}
      <div className="hidden sm:flex items-center gap-1.5">
        {visiblePages.map((pageNum, idx) => {
          const prevPage = visiblePages[idx - 1];
          const showEllipsis = prevPage && pageNum - prevPage > 1;

          return (
            <React.Fragment key={pageNum}>
              {showEllipsis && (
                <span className={`px-1 text-xs font-bold ${isAdult ? "text-[#6b7280]" : "text-[#d4a373]"}`}>...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-h-[40px] min-w-[40px] rounded-xl text-xs font-bold transition active:scale-95 shadow-xs ${
                  currentPage === pageNum
                    ? isAdult
                      ? "bg-[#1b4332] text-white border border-[#1b4332]"
                      : "bg-[#ffd166] text-[#1a0e04] shadow-md border border-[#ffd166]"
                    : isAdult
                      ? "border border-[#e8e4dc] bg-white text-[#4b5563] hover:border-[#1b4332] hover:text-[#11231b]"
                      : "border border-[#633916] bg-[#1e1107] text-[#fefae0]/80 hover:text-[#ffd166] hover:border-[#ffd166]/50"
                }`}
                aria-current={currentPage === pageNum ? "page" : undefined}
                aria-label={`Ir para a página ${pageNum}`}
              >
                {pageNum}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Botão Próxima */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-xl border text-xs font-bold transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0 shadow-xs ${
          isAdult
            ? "border-[#e8e4dc] bg-white text-[#11231b] hover:border-[#1b4332] hover:bg-[#f4f2ec]"
            : "border-[#633916] bg-[#1e1107] text-[#fefae0] hover:border-[#ffd166]"
        }`}
        aria-label="Próxima página"
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className={`h-4 w-4 shrink-0 ${isAdult ? "text-[#1b4332]" : "text-[#ffd166]"}`} />
      </button>
    </nav>
  );
}
