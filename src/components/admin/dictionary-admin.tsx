import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, Search, Download, Upload, Loader2 } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";


type Entry = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  language: string;
  category: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
};

const defaultDraft = {
  term_indigenous: "", term_pt: "", language: "Tupi-Guarani", category: "Geral",
  pronunciation: "", example: "", audio_url: "",
};

export function DictionaryAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(defaultDraft);

  const { data = [] } = useQuery({
    queryKey: ["dict_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dictionary").select("*").order("term_indigenous");
      if (error) throw error;
      return data as Entry[];
    },
  });

  const filtered = data.filter((e) => {
    const q = search.toLowerCase().trim();
    return !q || e.term_indigenous.toLowerCase().includes(q) || e.term_pt.toLowerCase().includes(q);
  });

  const [importing, setImporting] = useState(false);

  async function importPdfDictionary() {
    setImporting(true);
    try {
      const patxohaDict = ((await import("@/data/patxoha-dictionary.json")) as any).default as any[];
      if (!confirm(`Reatualizar o dicionário Patxôhã do começo com ${patxohaDict.length} palavras do PDF? As entradas Patxôhã atuais serão substituídas para remover duplicatas.`)) { setImporting(false); return; }
      const { error: deleteError } = await supabase.from("dictionary").delete().eq("language", "Patxôhã");
      if (deleteError) throw deleteError;

      const seen = new Set<string>();
      const toInsert = (patxohaDict as any[]).filter((e) => {
        const key = `${String(e.term_indigenous || "").trim().toLowerCase()}|${String(e.term_pt || "").trim().toLowerCase()}|Patxôhã`;
        if (seen.has(key)) return false;
        seen.add(key);
        return e.term_indigenous && e.term_pt;
      });
      const batchSize = 500;
      let done = 0;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        const { error } = await supabase.from("dictionary").insert(batch);
        if (error) throw error;
        done += batch.length;
        toast.message(`Reatualizando... ${done}/${toInsert.length}`);
      }
      toast.success(`${done} palavras reatualizadas do PDF`);
      qc.invalidateQueries({ queryKey: ["dict_admin"] });
      qc.invalidateQueries({ queryKey: ["dictionary"] });
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setImporting(false);
    }
  }

  async function add() {
    if (!draft.term_indigenous || !draft.term_pt) return toast.error("Termos obrigatórios");
    const { error } = await supabase.from("dictionary").insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Palavra adicionada");
    setDraft(defaultDraft);
    qc.invalidateQueries({ queryKey: ["dict_admin"] });
    qc.invalidateQueries({ queryKey: ["dictionary"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-black text-cream">Importar dicionário Patxôhã</h2>
            <p className="text-xs text-foreground/60 mt-1">3.192 palavras extraídas do PDF oficial. Reatualiza do começo e remove duplicatas antigas.</p>
          </div>
          <Btn onClick={importPdfDictionary} disabled={importing}>
            <Download className="h-4 w-4" /> {importing ? "Reatualizando..." : "Reatualizar do PDF"}
          </Btn>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-black text-cream mb-3">Nova palavra</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Termo indígena"><Input value={draft.term_indigenous} onChange={(e) => setDraft({ ...draft, term_indigenous: e.target.value })} /></Field>
          <Field label="Tradução (PT)"><Input value={draft.term_pt} onChange={(e) => setDraft({ ...draft, term_pt: e.target.value })} /></Field>
          <Field label="Língua"><Input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} /></Field>
          <Field label="Categoria"><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Saudações / Família / ..." /></Field>
          <Field label="Pronúncia"><Input value={draft.pronunciation} onChange={(e) => setDraft({ ...draft, pronunciation: e.target.value })} /></Field>
          <UploadOrUrl
            label="Áudio (Upload ou URL)"
            value={draft.audio_url || ""}
            onChange={(v: string) => setDraft({ ...draft, audio_url: v })}
            onFile={async (file: File) => {
              const path = `dictionary/audio/${crypto.randomUUID()}-${file.name}`;
              const { error } = await supabase.storage.from("songs").upload(path, file);
              if (error) return toast.error(error.message);
              const { data } = await supabase.storage.from("songs").createSignedUrl(path, 60 * 60 * 24 * 365);
              setDraft({ ...draft, audio_url: data?.signedUrl || "" });
              toast.success("Áudio enviado!");
            }}
            accept="audio/*"
          />
          <div className="md:col-span-2">
            <Field label="Exemplo"><Textarea rows={2} value={draft.example} onChange={(e) => setDraft({ ...draft, example: e.target.value })} /></Field>
          </div>
        </div>
        <Btn className="mt-4" onClick={add}><Plus className="h-4 w-4" /> Adicionar palavra</Btn>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-10 w-full" />
      </div>

      <div className="grid gap-3">
        {filtered.map((e) => <EntryRow key={e.id} entry={e} />)}
        {filtered.length === 0 && <div className="text-center text-foreground/60 py-6">Nenhuma palavra.</div>}
      </div>
    </div>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const qc = useQueryClient();
  const [e, setE] = useState(entry);
  useEffect(() => setE(entry), [entry]);

  async function save() {
    const { error } = await supabase.from("dictionary").update({
      term_indigenous: e.term_indigenous, term_pt: e.term_pt, language: e.language,
      category: e.category, pronunciation: e.pronunciation, example: e.example, audio_url: e.audio_url,
    }).eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["dict_admin"] });
    qc.invalidateQueries({ queryKey: ["dictionary"] });
  }
  async function remove() {
    if (!confirm("Excluir?")) return;
    await supabase.from("dictionary").delete().eq("id", e.id);
    qc.invalidateQueries({ queryKey: ["dict_admin"] });
    qc.invalidateQueries({ queryKey: ["dictionary"] });
  }
  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Indígena"><Input value={e.term_indigenous} onChange={(ev) => setE({ ...e, term_indigenous: ev.target.value })} /></Field>
        <Field label="Português"><Input value={e.term_pt} onChange={(ev) => setE({ ...e, term_pt: ev.target.value })} /></Field>
        <Field label="Língua"><Input value={e.language} onChange={(ev) => setE({ ...e, language: ev.target.value })} /></Field>
        <Field label="Categoria"><Input value={e.category} onChange={(ev) => setE({ ...e, category: ev.target.value })} /></Field>
        <Field label="Pronúncia"><Input value={e.pronunciation ?? ""} onChange={(ev) => setE({ ...e, pronunciation: ev.target.value })} /></Field>
        <UploadOrUrl
          label="Áudio (Upload ou URL)"
          value={e.audio_url ?? ""}
          onChange={(v: string) => setE({ ...e, audio_url: v })}
          onFile={async (file: File) => {

            const path = `dictionary/audio/${crypto.randomUUID()}-${file.name}`;
            const { error } = await supabase.storage.from("songs").upload(path, file);
            if (error) return toast.error(error.message);
            const { data } = await supabase.storage.from("songs").createSignedUrl(path, 60 * 60 * 24 * 365);
            setE({ ...e, audio_url: data?.signedUrl || "" });
            toast.success("Áudio enviado!");
          }}
          accept="audio/*"
        />

        <div className="md:col-span-3">
          <Field label="Exemplo"><Textarea rows={2} value={e.example ?? ""} onChange={(ev) => setE({ ...e, example: ev.target.value })} /></Field>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Btn onClick={save}><Save className="h-4 w-4" /> Salvar</Btn>
        <Btn variant="danger" onClick={remove}><Trash2 className="h-4 w-4" /></Btn>
      </div>
    </Card>
  );
}

function UploadOrUrl({
  label,
  value,
  onChange,
  onFile,
  accept,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File) => void;
  accept: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        <Input 
          className="w-full text-xs" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder="https://..." 
        />
        <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-gold/40 bg-card/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Enviando..." : "Gravar/Enviar Arquivo"}
          <input type="file" accept={accept} className="hidden" onChange={async e => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try { 
              await onFile(f); 
            } finally { 
              setBusy(false); 
              e.currentTarget.value = "";
            }
          }} />
        </label>
      </div>
    </Field>
  );
}


