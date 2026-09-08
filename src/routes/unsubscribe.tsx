import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoSrc from "@/assets/awa-tech-logo.webp";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Cancelar inscrição — AWÃ TECH" },
      { name: "description", content: "Cancelar inscrição da lista de e-mails do AWÃ TECH." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: UnsubscribePage,
});

type Status = "loading" | "confirm" | "already" | "invalid" | "success" | "error";

function UnsubscribePage() {
  const { token } = useSearch({ from: "/unsubscribe" });
  const [status, setStatus] = useState<Status>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      if (!token) return setStatus("invalid");
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setStatus("invalid");
        else if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("confirm");
        else setStatus("invalid");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    validate();
    return () => { cancelled = true; };
  }, [token]);

  async function handleConfirm() {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setStatus("success");
      else if (data.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] px-4 py-10 text-cream">
      <div className="mx-auto max-w-md rounded-3xl border border-gold/30 bg-card/60 p-8 text-center shadow-lg backdrop-blur">
        <img src={logoSrc} alt="AWÃ TECH" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 font-display text-2xl font-black">Cancelar inscrição</h1>

        {status === "loading" && <p className="mt-4 text-sm text-foreground/70">Verificando...</p>}

        {status === "confirm" && (
          <>
            <p className="mt-4 text-sm text-foreground/80">
              Confirma que deseja parar de receber e-mails do AWÃ TECH?
            </p>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-display text-sm font-black text-forest-deep transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Processando..." : "Confirmar cancelamento"}
            </button>
          </>
        )}

        {status === "already" && (
          <p className="mt-4 text-sm text-foreground/80">
            Este e-mail já foi cancelado. Você não receberá mais mensagens.
          </p>
        )}

        {status === "success" && (
          <p className="mt-4 text-sm text-leaf">
            Pronto! Você foi removido da nossa lista de e-mails.
          </p>
        )}

        {status === "invalid" && (
          <p className="mt-4 text-sm text-foreground/70">
            Link inválido ou expirado.
          </p>
        )}

        {status === "error" && (
          <p className="mt-4 text-sm text-red-300">
            Não foi possível processar. Tente novamente mais tarde.
          </p>
        )}
      </div>
    </div>
  );
}
