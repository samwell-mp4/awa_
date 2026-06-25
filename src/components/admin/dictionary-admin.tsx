import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, Search, Download } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";
import patxohaDict from "@/data/patxoha-dictionary.json";

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
        <h2 className="font-display text-lg font-black text-cream mb-3">Nova palavra</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Termo indígena"><Input value={draft.term_indigenous} onChange={(e) => setDraft({ ...draft, term_indigenous: e.target.value })} /></Field>
          <Field label="Tradução (PT)"><Input value={draft.term_pt} onChange={(e) => setDraft({ ...draft, term_pt: e.target.value })} /></Field>
          <Field label="Língua"><Input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} /></Field>
          <Field label="Categoria"><Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Saudações / Família / ..." /></Field>
          <Field label="Pronúncia"><Input value={draft.pronunciation} onChange={(e) => setDraft({ ...draft, pronunciation: e.target.value })} /></Field>
          <Field label="URL de áudio (opcional)"><Input value={draft.audio_url} onChange={(e) => setDraft({ ...draft, audio_url: e.target.value })} /></Field>
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
        <Field label="Áudio (URL)"><Input value={e.audio_url ?? ""} onChange={(ev) => setE({ ...e, audio_url: ev.target.value })} /></Field>
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
