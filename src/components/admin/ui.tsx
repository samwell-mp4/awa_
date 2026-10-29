import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes } from "react";

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

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`card-elev rounded-2xl p-4 md:p-5 ${className ?? ""}`}>{children}</div>;
}

export function AudioPreviewPlayer({ src, className = "" }: { src: string; className?: string }) {
  if (!src) return null;
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-gold/20 bg-black/40 px-3 py-1.5 ${className}`}>
      <audio controls src={src} preload="metadata" className="h-8 max-w-full flex-1" />
    </div>
  );
}

export function UploadOrUrl({
  label,
  value,
  onChange,
  onFile,
  accept,
  busy: externalBusy,
  placeholder = "https://...",
  previewAudio,
  previewImage,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File) => Promise<void> | void;
  accept: string;
  busy?: boolean;
  placeholder?: string;
  previewAudio?: boolean;
  previewImage?: boolean;
}) {
  const [internalBusy, setInternalBusy] = useState(false);
  const busy = externalBusy || internalBusy;
  const isAudio = previewAudio ?? accept.includes("audio");
  const isImage = previewImage ?? accept.includes("image");

  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Input
            className="flex-1 text-xs"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-foreground/50 hover:text-destructive px-2 py-1 rounded"
              title="Limpar campo"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-gold/40 bg-card/60 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition active:scale-95">
            {busy ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            ) : (
              <span className="text-sm">📁</span>
            )}
            {busy ? "Enviando arquivo..." : "Escolher do Computador/Celular"}
            <input
              type="file"
              accept={accept}
              disabled={busy}
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setInternalBusy(true);
                try {
                  await onFile(f);
                } finally {
                  setInternalBusy(false);
                  e.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>

        {isAudio && value && (
          <div className="mt-1">
            <AudioPreviewPlayer src={value} />
          </div>
        )}

        {isImage && value && (
          <div className="mt-1 flex items-center gap-3">
            <img
              src={value}
              alt="Prévia"
              className="h-14 w-14 rounded-lg object-cover border border-gold/20 bg-black/40"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <span className="text-[11px] text-foreground/60">Prévia da imagem</span>
          </div>
        )}
      </div>
    </Field>
  );
}

