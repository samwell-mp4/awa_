import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Eye,
  History,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import {
  analyzeAndSaveMedia,
  deleteMedia,
  discardDraft,
  getDraft,
  listMedia,
  listVersions,
  publishDraft,
  restoreVersion,
  saveDraft,
} from "@/lib/visual-editor.functions";
import { notifyContentUpdated } from "@/lib/notify-content-updated";
import { Btn, Card, Field, Input, Textarea } from "./ui";
import { SongStyleEditor } from "./song-style-admin";

const ONE_YEAR = 60 * 60 * 24 * 365;

type FieldKind = "text" | "long" | "color" | "image" | "select";

type FieldDef = { key: string; label: string; kind: FieldKind; options?: string[] };

type SectionDef = {
  key: string;
  label: string;
  page: string;
  preview: string;
  fields: FieldDef[];
};

const LAYOUTS = ["centralizado", "esquerda", "dividido", "cartoes", "mosaico"];

const SECTIONS: SectionDef[] = [
  {
    key: "landing_hero",
    label: "Tela inicial (escolha de área)",
    page: "Landing",
    preview: "/",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      { key: "description", label: "Texto de apoio", kind: "long" },
      { key: "background_url", label: "Foto de fundo", kind: "image" },
      { key: "overlay_color", label: "Cor do véu sobre a foto", kind: "color" },
      { key: "accent_color", label: "Cor de destaque", kind: "color" },
      { key: "cta_label", label: "Texto do botão", kind: "text" },
      { key: "layout", label: "Layout", kind: "select", options: LAYOUTS },
    ],
  },
  {
    key: "adult_hero",
    label: "Página inicial adulta",
    page: "Adulto",
    preview: "/adulto",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      { key: "description", label: "Texto de apoio", kind: "long" },
      { key: "background_url", label: "Foto de fundo", kind: "image" },
      { key: "accent_color", label: "Cor de destaque", kind: "color" },
      { key: "layout", label: "Layout", kind: "select", options: LAYOUTS },
    ],
  },
  {
    key: "musicas_page",
    label: "Página de músicas (adulto)",
    page: "Músicas",
    preview: "/musicas",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      { key: "background_url", label: "Foto de fundo", kind: "image" },
      { key: "card_color", label: "Cor dos cartões", kind: "color" },
      { key: "text_color", label: "Cor do texto", kind: "color" },
      { key: "layout", label: "Layout", kind: "select", options: LAYOUTS },
    ],
  },
  {
    key: "musicas_infantil_page",
    label: "Página de cantigas (infantil)",
    page: "Cantigas",
    preview: "/musicas-infantil",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      { key: "background_url", label: "Foto de fundo", kind: "image" },
      { key: "card_color", label: "Cor dos cartões", kind: "color" },
      { key: "panel_color", label: "Cor do painel da letra", kind: "color" },
      { key: "layout", label: "Layout", kind: "select", options: LAYOUTS },
    ],
  },
  {
    key: "historias_page",
    label: "Histórias e narrativas",
    page: "Histórias",
    preview: "/historias",
    fields: [
      { key: "title", label: "Título", kind: "text" },
      { key: "subtitle", label: "Subtítulo", kind: "text" },
      { key: "background_url", label: "Foto de fundo", kind: "image" },
      { key: "card_color", label: "Cor dos cartões", kind: "color" },
      { key: "layout", label: "Layout", kind: "select", options: LAYOUTS },
    ],
  },
  {
    key: "branding",
    label: "Identidade visual do site",
    page: "Geral",
    preview: "/",
    fields: [
      { key: "logo_url", label: "Logo", kind: "image" },
      { key: "logo_infantil_url", label: "Logo infantil", kind: "image" },
      { key: "primary_color", label: "Cor principal", kind: "color" },
      { key: "accent_color", label: "Cor de destaque", kind: "color" },
      { key: "tagline", label: "Frase da marca", kind: "text" },
    ],
  },
];

type Media = {
  id: string;
  url: string;
  filename: string | null;
  storage_path: string | null;
  ai_description: string | null;
  ai_tags: string[];
  ai_suggested_pages: string[];
  ai_palette: string[];
  ai_layout_hint: string | null;
};

async function uploadMediaFile(file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `library/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("site-media").createSignedUrl(path, ONE_YEAR);
  if (signErr) throw signErr;
  return { url: data.signedUrl, path };
}

export function VisualEditorAdmin() {
  const [tab, setTab] = useState<"paginas" | "biblioteca" | "musicas">("paginas");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["paginas", "Páginas do site"],
            ["biblioteca", "Biblioteca de imagens (IA)"],
            ["musicas", "Estilo das músicas"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
              tab === k ? "bg-gold/25 text-gold" : "border border-gold/25 text-foreground/70 hover:bg-gold/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "paginas" && <PagesEditor />}
      {tab === "biblioteca" && <MediaLibrary />}
      {tab === "musicas" && <SongStyleEditor />}
    </div>
  );
}

/* ------------------------------- páginas ------------------------------- */

function PagesEditor() {
  const qc = useQueryClient();
  const [sectionKey, setSectionKey] = useState(SECTIONS[0].key);
  const section = SECTIONS.find((s) => s.key === sectionKey)!;

  const getCfg = useServerFn(getSiteConfig);
  const getDraftFn = useServerFn(getDraft);
  const saveDraftFn = useServerFn(saveDraft);
  const publishFn = useServerFn(publishDraft);
  const discardFn = useServerFn(discardDraft);
  const versionsFn = useServerFn(listVersions);
  const restoreFn = useServerFn(restoreVersion);

  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const published = useQuery({
    queryKey: ["site_config", sectionKey],
    queryFn: () => getCfg({ data: sectionKey }),
  });
  const draft = useQuery({
    queryKey: ["site_draft", sectionKey],
    queryFn: () => getDraftFn({ data: sectionKey }),
  });
  const versions = useQuery({
    queryKey: ["site_versions", sectionKey],
    queryFn: () => versionsFn({ data: sectionKey }),
    enabled: showHistory,
  });

  useEffect(() => {
    const base = (draft.data?.value as Record<string, any>) ?? (published.data as Record<string, any>) ?? {};
    setValues(base && typeof base === "object" ? { ...base } : {});
  }, [sectionKey, draft.data, published.data]);

  const hasDraft = !!draft.data;
  const extraKeys = useMemo(
    () => Object.keys(values).filter((k) => !section.fields.some((f) => f.key === k)),
    [values, section],
  );

  function set(key: string, v: any) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function doSaveDraft(silent = false) {
    setBusy("save");
    try {
      await saveDraftFn({ data: { key: sectionKey, value: values } });
      await qc.invalidateQueries({ queryKey: ["site_draft", sectionKey] });
      if (!silent) toast.success("Rascunho salvo — nada foi publicado ainda.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function doPublish() {
    setBusy("publish");
    try {
      await saveDraftFn({ data: { key: sectionKey, value: values } });
      await publishFn({ data: { key: sectionKey } });
      await qc.invalidateQueries({ queryKey: ["site_config", sectionKey] });
      await qc.invalidateQueries({ queryKey: ["site_draft", sectionKey] });
      notifyContentUpdated();
      toast.success("Publicado! As mudanças já estão no ar.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function doDiscard() {
    setBusy("discard");
    try {
      await discardFn({ data: sectionKey });
      await qc.invalidateQueries({ queryKey: ["site_draft", sectionKey] });
      toast.success("Rascunho descartado.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function doRestore(id: string) {
    setBusy("restore");
    try {
      await restoreFn({ data: id });
      await qc.invalidateQueries({ queryKey: ["site_draft", sectionKey] });
      toast.success("Versão trazida como rascunho. Confira e publique.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Página</span>
          <select
            value={sectionKey}
            onChange={(e) => setSectionKey(e.target.value)}
            className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2 text-sm text-cream"
          >
            {SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          {hasDraft && (
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
              Rascunho não publicado
            </span>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          {section.fields.map((f) => (
            <FieldEditor
              key={f.key}
              def={f}
              value={values[f.key] ?? ""}
              onChange={(v) => set(f.key, v)}
              onPickImage={() => setPickerFor(f.key)}
            />
          ))}
          {extraKeys.map((k) => (
            <div key={k} className="flex items-end gap-2">
              <div className="flex-1">
                <Field label={k}>
                  <Input value={String(values[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
                </Field>
              </div>
              <Btn
                variant="danger"
                onClick={() => setValues((prev) => {
                  const next = { ...prev };
                  delete next[k];
                  return next;
                })}
              >
                <Trash2 className="h-4 w-4" />
              </Btn>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Btn
            variant="outline"
            onClick={() => {
              const name = window.prompt("Nome do novo elemento (ex.: aviso_topo)");
              if (name) set(name.trim(), "");
            }}
          >
            <Plus className="h-4 w-4" /> Novo elemento
          </Btn>
          <Btn variant="outline" onClick={() => setShowPreview((v) => !v)}>
            <Eye className="h-4 w-4" /> {showPreview ? "Fechar prévia" : "Ver prévia"}
          </Btn>
          <Btn variant="outline" onClick={() => setShowHistory((v) => !v)}>
            <History className="h-4 w-4" /> Histórico
          </Btn>
          <Btn variant="outline" disabled={busy !== null} onClick={() => doSaveDraft()}>
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
            rascunho
          </Btn>
          {hasDraft && (
            <Btn variant="danger" disabled={busy !== null} onClick={doDiscard}>
              <X className="h-4 w-4" /> Descartar rascunho
            </Btn>
          )}
          <Btn disabled={busy !== null} onClick={doPublish}>
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{" "}
            Publicar
          </Btn>
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          Nada vai ao ar sem você clicar em <strong>Publicar</strong>. O valor anterior fica guardado no histórico.
        </p>
      </Card>

      {showPreview && (
        <Card>
          <LocalPreview section={section} values={values} />
          <div className="mt-3 overflow-hidden rounded-2xl border border-gold/20">
            <iframe
              title="Prévia da página publicada"
              src={section.preview}
              className="h-[520px] w-full bg-black"
            />
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            Acima: como o bloco vai ficar. Abaixo: a página como está publicada agora.
          </p>
        </Card>
      )}

      {showHistory && (
        <Card>
          <h4 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-gold">
            Versões anteriores
          </h4>
          {versions.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
          ) : (versions.data ?? []).length === 0 ? (
            <p className="text-sm text-foreground/60">Nenhuma versão guardada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {(versions.data ?? []).map((v: any) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gold/15 bg-card/40 px-3 py-2"
                >
                  <span className="text-xs text-foreground/70">
                    {new Date(v.created_at).toLocaleString("pt-BR")} {v.note ? `· ${v.note}` : ""}
                  </span>
                  <Btn variant="outline" disabled={busy !== null} onClick={() => doRestore(v.id)}>
                    <RotateCcw className="h-4 w-4" /> Restaurar
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {pickerFor && (
        <MediaPicker
          onClose={() => setPickerFor(null)}
          onPick={(m) => {
            set(pickerFor, m.url);
            if (m.ai_palette?.[0] && values["accent_color"] === undefined) set("accent_color", m.ai_palette[0]);
            setPickerFor(null);
            toast.success("Imagem aplicada no rascunho.");
          }}
        />
      )}
    </div>
  );
}

function FieldEditor({
  def,
  value,
  onChange,
  onPickImage,
}: {
  def: FieldDef;
  value: any;
  onChange: (v: any) => void;
  onPickImage: () => void;
}) {
  if (def.kind === "long") {
    return (
      <div className="md:col-span-2">
        <Field label={def.label}>
          <Textarea rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </Field>
      </div>
    );
  }
  if (def.kind === "color") {
    return (
      <Field label={def.label}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(String(value)) ? String(value) : "#1f8a4c"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 rounded-lg border border-gold/25 bg-transparent"
          />
          <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="flex-1" />
        </div>
      </Field>
    );
  }
  if (def.kind === "select") {
    return (
      <Field label={def.label}>
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border border-gold/25 bg-card/60 px-3 py-2.5 text-sm text-cream"
        >
          <option value="">Padrão</option>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  if (def.kind === "image") {
    return (
      <Field label={def.label}>
        <div className="flex items-center gap-2">
          {value ? (
            <img src={String(value)} alt="" className="h-14 w-20 rounded-lg border border-gold/25 object-cover" />
          ) : (
            <div className="grid h-14 w-20 place-items-center rounded-lg border border-dashed border-gold/25 text-gold/60">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
          <Btn variant="outline" type="button" onClick={onPickImage}>
            <ImageIcon className="h-4 w-4" /> Escolher
          </Btn>
          {value && (
            <Btn variant="danger" type="button" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" />
            </Btn>
          )}
        </div>
      </Field>
    );
  }
  return (
    <Field label={def.label}>
      <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function LocalPreview({ section, values }: { section: SectionDef; values: Record<string, any> }) {
  const bg = values["background_url"];
  const accent = values["accent_color"] || values["primary_color"] || "#d9a534";
  const align = values["layout"] === "esquerda" ? "text-left items-start" : "text-center items-center";
  return (
    <div
      className={`relative flex min-h-[220px] flex-col justify-center gap-2 overflow-hidden rounded-2xl border border-gold/25 p-6 ${align}`}
      style={
        bg
          ? { backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: "linear-gradient(140deg,#12281c,#1c3a26)" }
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: values["overlay_color"] ? `${values["overlay_color"]}66` : "rgba(0,0,0,0.35)" }}
      />
      <div className={`relative flex flex-col gap-2 ${align}`}>
        <h3 className="font-display text-2xl font-black text-cream">{values["title"] || section.label}</h3>
        {values["subtitle"] && <p className="text-sm font-semibold text-cream/85">{values["subtitle"]}</p>}
        {values["description"] && <p className="max-w-xl text-xs text-cream/70">{values["description"]}</p>}
        <span
          className="mt-2 inline-flex w-fit rounded-full px-4 py-2 text-xs font-black text-black"
          style={{ background: accent }}
        >
          {values["cta_label"] || "Começar"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ biblioteca ----------------------------- */

function MediaLibrary() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMedia);
  const analyzeFn = useServerFn(analyzeAndSaveMedia);
  const delFn = useServerFn(deleteMedia);
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["media_library"],
    queryFn: () => listFn({}) as Promise<Media[]>,
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url, path } = await uploadMediaFile(file);
        const res = await analyzeFn({
          data: { url, storage_path: path, filename: file.name, mime_type: file.type },
        });
        if (res.aiError) toast.warning(res.aiError);
        else toast.success(`${file.name}: a IA sugeriu onde usar.`);
      }
      await qc.invalidateQueries({ queryKey: ["media_library"] });
    } catch (e: any) {
      toast.error("Erro ao enviar: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gold/30 p-6 text-center">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          ) : (
            <Upload className="h-6 w-6 text-gold" />
          )}
          <span className="font-display text-sm font-bold text-cream">
            Enviar fotos do celular ou do computador
          </span>
          <span className="text-xs text-foreground/60">
            A IA analisa cada foto e sugere página, cores e enquadramento. Nada é publicado automaticamente.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </Card>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gold" />
      ) : items.length === 0 ? (
        <p className="text-sm text-foreground/60">Nenhuma imagem na biblioteca ainda.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <Card key={m.id}>
              <img src={m.url} alt="" className="mb-2 h-40 w-full rounded-xl object-cover" />
              <p className="text-xs font-semibold text-cream">{m.filename}</p>
              {m.ai_description && <p className="mt-1 text-xs text-foreground/70">{m.ai_description}</p>}
              {m.ai_suggested_pages?.length > 0 && (
                <p className="mt-1 text-xs text-gold">
                  <Sparkles className="mr-1 inline h-3 w-3" /> Sugestão: {m.ai_suggested_pages.join(", ")}
                </p>
              )}
              {m.ai_layout_hint && <p className="mt-1 text-xs text-foreground/60">{m.ai_layout_hint}</p>}
              {m.ai_palette?.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {m.ai_palette.map((c) => (
                    <span
                      key={c}
                      title={c}
                      className="h-5 w-5 rounded-full border border-white/30"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Btn
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(m.url);
                    toast.success("Link copiado.");
                  }}
                >
                  Copiar link
                </Btn>
                <Btn
                  variant="danger"
                  onClick={async () => {
                    await delFn({ data: m.id });
                    await qc.invalidateQueries({ queryKey: ["media_library"] });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaPicker({ onClose, onPick }: { onClose: () => void; onPick: (m: Media) => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMedia);
  const analyzeFn = useServerFn(analyzeAndSaveMedia);
  const [uploading, setUploading] = useState(false);
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["media_library"],
    queryFn: () => listFn({}) as Promise<Media[]>,
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const file = files[0];
      const { url, path } = await uploadMediaFile(file);
      const res = await analyzeFn({
        data: { url, storage_path: path, filename: file.name, mime_type: file.type },
      });
      await qc.invalidateQueries({ queryKey: ["media_library"] });
      if (res.aiError) toast.warning(res.aiError);
      if (res.media) onPick(res.media as Media);
    } catch (e: any) {
      toast.error("Erro ao enviar: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gold/25 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-cream">Escolher imagem</h3>
          <Btn variant="outline" onClick={onClose}>
            <X className="h-4 w-4" /> Fechar
          </Btn>
        </div>
        <label className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gold/30 px-4 py-3 text-sm font-bold text-cream">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Upload className="h-4 w-4 text-gold" />}
          Enviar nova foto (a IA analisa e já aplica no rascunho)
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files)} />
        </label>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((m) => (
              <button
                key={m.id}
                onClick={() => onPick(m)}
                className="overflow-hidden rounded-xl border border-gold/20 text-left hover:border-gold/60"
              >
                <img src={m.url} alt="" className="h-28 w-full object-cover" />
                <span className="block px-2 py-1 text-[11px] text-foreground/70">
                  {m.ai_suggested_pages?.[0] ?? m.filename}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
