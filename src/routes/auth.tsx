import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Sparkles, Phone, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import authBg from "@/assets/awa-auth-bg.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  // Client-only: this page depends entirely on the browser auth session, and
  // being the redirect target of ssr:false routes made SSR emit a Suspense
  // fallback that mismatched the client render.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar ou Cadastrar — AWÃ TECH" },
      { name: "description", content: "Acesse o AWÃ TECH com sua conta ou celular. Cadastro rápido e seguro." },
      { property: "og:title", content: "Entrar ou Cadastrar — AWÃ TECH" },
      { property: "og:description", content: "Acesse o AWÃ TECH com sua conta ou celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Method = "google" | "phone";

function AuthPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("google");
  const [busy, setBusy] = useState(false);

  // Phone flow state
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const e164 = useMemo(() => normalizePhone(phone), [phone]);

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o AWÃ TECH. Tente novamente.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!e164) {
      toast.error("Informe um celular válido com DDD.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Não foi possível enviar o código.");
      return;
    }
    setStep("code");
    setResendIn(60); // Set countdown to 60 seconds
    toast.success("Enviamos um código por SMS.");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) {
      toast.error("Digite o código recebido.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error("Código inválido ou expirado.");
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10 overflow-hidden">
      <img src={authBg.url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background/95 backdrop-blur-[3px]" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-gold/90 hover:text-gold transition">
            <ArrowLeft className="h-3.5 w-3.5" /> VOLTAR
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-foreground/60">
            <ShieldCheck className="h-3 w-3 text-gold" /> CONEXÃO SEGURA
          </span>
        </div>

        <div className="card-elev rounded-3xl p-7 sm:p-8 backdrop-blur-xl bg-card/85 border border-gold/25 shadow-2xl">
          <div className="flex items-center gap-3">
            <img src={adultoLogo.url} alt="" className="h-11 w-11 rounded-2xl object-cover ring-1 ring-gold/40 shadow" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.28em] text-gold/80 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AWÃ TECH
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-cream leading-tight">
                Entrar ou criar conta
              </h1>
            </div>
          </div>

          <p className="mt-2 text-sm text-foreground/70">
            Continue com sua conta AWÃ TECH ou receba um código por SMS no seu celular.
          </p>

          {/* Method tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-gold/20 bg-background/40 p-1">
            <TabButton active={method === "google"} onClick={() => { setMethod("google"); setStep("phone"); }}>
              <div className="h-4 w-4 bg-gold/20 rounded-full flex items-center justify-center text-[8px] font-bold text-gold ring-1 ring-gold/40">A</div> AWÃ TECH
            </TabButton>
            <TabButton active={method === "phone"} onClick={() => setMethod("phone")}>
              <Phone className="h-4 w-4" /> Celular
            </TabButton>
          </div>

          {/* Google */}
          {method === "google" && (
            <div className="mt-6">
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="group relative w-full overflow-hidden rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-neutral-800 shadow-lg ring-1 ring-black/5 hover:shadow-xl hover:-translate-y-[1px] transition disabled:opacity-70 disabled:pointer-events-none"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
                    <span className="text-neutral-700">Conectando com o AWÃ TECH…</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 bg-gold/20 rounded-full flex items-center justify-center text-[10px] font-bold text-gold ring-1 ring-gold/40">A</div>
                    <span>Continuar com AWÃ TECH</span>
                  </span>
                )}
              </button>

              <ul className="mt-5 space-y-2 text-xs text-foreground/70">
                <FeatureItem>Acesso rápido, sem lembrar senha</FeatureItem>
                <FeatureItem>Seu progresso salvo em todos os aparelhos</FeatureItem>
                <FeatureItem>Nunca publicamos nada em seu nome</FeatureItem>
              </ul>
            </div>
          )}

          {/* Phone */}
          {method === "phone" && (
            <div className="mt-6">
              {step === "phone" ? (
                <form onSubmit={sendCode} className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-foreground/70">Seu celular com DDD</label>
                  <div className="flex items-stretch rounded-xl border border-gold/25 bg-background/50 focus-within:border-gold/60 transition">
                    <span className="grid place-items-center px-3 text-sm font-semibold text-gold/80 border-r border-gold/20">
                      +55
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(11) 91234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none"
                    />
                  </div>
                  <button
                    disabled={busy || !e164}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gradient-leaf)] px-4 py-3.5 text-sm font-bold text-cream shadow-[var(--shadow-glow)] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    {busy ? "Enviando..." : "Enviar código por SMS"}
                  </button>
                  <p className="text-[11px] text-foreground/55 leading-relaxed">
                    Ao continuar, você concorda com nossos{" "}
                    <Link to="/termos" className="text-gold/80 underline underline-offset-2">Termos</Link>{" "}
                    e a{" "}
                    <Link to="/privacidade" className="text-gold/80 underline underline-offset-2">Política de Privacidade</Link>.
                    Podem ser aplicadas tarifas de mensagem.
                  </p>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="flex flex-col gap-3">
                  <div className="text-xs text-foreground/70">
                    Enviamos um código para <span className="font-semibold text-cream">{e164}</span>{" "}
                    <button type="button" onClick={() => setStep("phone")} className="text-gold/80 underline underline-offset-2">
                      alterar
                    </button>
                  </div>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center tracking-[0.5em] font-mono text-lg rounded-xl border border-gold/25 bg-background/50 px-4 py-3 text-cream placeholder:text-foreground/30 focus:outline-none focus:border-gold/60"
                  />
                  <button
                    disabled={busy || code.length < 4}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gradient-leaf)] px-4 py-3.5 text-sm font-bold text-cream shadow-[var(--shadow-glow)] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {busy ? "Verificando..." : "Confirmar código"}
                  </button>
                  <button
                    type="button"
                    disabled={resendIn > 0 || busy}
                    onClick={() => sendCode()}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-background/30 px-4 py-3 text-xs font-semibold text-foreground/70 hover:text-cream hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {resendIn > 0 ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Reenviar em {resendIn}s
                      </>
                    ) : (
                      "Reenviar código por SMS"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-foreground/50">
          © {new Date().getFullYear()} AWÃ TECH • Protegido por criptografia
        </p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-gold/15 text-cream ring-1 ring-gold/40 shadow-inner"
          : "text-foreground/60 hover:text-cream hover:bg-gold/5"
      }`}
    >
      {children}
    </button>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-gold/80 shrink-0" />
      <span>{children}</span>
    </li>
  );
}


function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  // If user already included country code
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  // Default to Brazil +55
  if (digits.length >= 10) return `+55${digits}`;
  return "";
}
