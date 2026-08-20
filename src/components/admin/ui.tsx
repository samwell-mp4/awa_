import type { InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60 " +
        (props.className ?? "")
      }
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60 " +
        (props.className ?? "")
      }
    />
  );
}

export function Btn({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "danger" }) {
  const cls =
    variant === "primary"
      ? "bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]"
      : variant === "danger"
        ? "border border-destructive/50 bg-destructive/15 text-cream hover:bg-destructive/25"
        : "border border-gold/40 bg-card/40 text-gold hover:bg-gold/10";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${cls} ${
        props.className ?? ""
      }`}
    />
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card-elev rounded-2xl p-4 md:p-5">{children}</div>;
}
