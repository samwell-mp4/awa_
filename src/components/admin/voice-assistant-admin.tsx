import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ASSISTANT_CONFIG, useAssistantConfig, type AssistantConfig } from "@/components/voice-assistant/VoiceAssistant";
import { Btn, Field, Input } from "./ui";

export function VoiceAssistantAdmin() {
  const qc = useQueryClient();
  const { data } = useAssistantConfig();
  const [cfg, setCfg] = useState<AssistantConfig>(DEFAULT_ASSISTANT_CONFIG);
  const [newWord, setNewWord] = useState({ term_indigenous: "", term_pt: "", pronunciation: "", example: "" });

  useEffect(() => {
    if (data) setCfg(data);
  }, [data]);

  const misses = useQuery({
    queryKey: ["assistant_misses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistant_misses")
        .select("id,term,question,resolved,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  async function save() {
    const { error } = await supabase.from("site_config").upsert({ key: "voice_assistant", value: cfg, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Assistente atualizado");
    qc.invalidateQueries({ queryKey: ["site_config", "voice_assistant"] });
  }

  async function addWord() {
    if (!newWord.term_indigenous.trim() || !newWord.term_pt.trim()) return toast.error("Preencha a palavra e a tradução");
    const { error } = await supabase.from("dictionary").insert({
      term_indigenous: newWord.term_indigenous.trim(),
      term_pt: newWord.term_pt.trim(),
      pronunciation: newWord.pronunciation.trim() || null,
      example: newWord.example.trim() || null,
      language: "Patxôhã",
    });
    if (error) return toast.error(error.message);
    toast.success("Palavra adicionada à base");
    setNewWord({ term_indigenous: "", term_pt: "", pronunciation: "", example: "" });
  }

  async function resolveMiss(id: string, term: string) {
    await supabase.from("assistant_misses").update({ resolved: true }).eq("id", id);
    setNewWord((w) => ({ ...w, term_pt: term }));
    misses.refetch();
  }

  async function removeMiss(id: string) {
    await supabase.from("assistant_misses").delete().eq("id", id);
    misses.refetch();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-display text-lg font-black text-cream">Configuração</h3>
        <label className="flex items-center gap-2 text-sm text-cream">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} />
          Assistente ativo (bolinha visível no site)
        </label>
        <Field label="Nome do assistente">
          <Input value={cfg.name} onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
        </Field>
        <Field label="Imagem da bolinha (URL, opcional)">
          <Input value={cfg.icon_url} placeholder="https://..." onChange={(e) => setCfg({ ...cfg, icon_url: e.target.value })} />
        </Field>
        <Btn onClick={save}>Salvar</Btn>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-black text-cream">Adicionar palavra, frase ou pronúncia à base</h3>
        <p className="text-xs text-foreground/60">Para editar ou apagar palavras existentes, use a seção Dicionário. O assistente usa a base atualizada em até 10 minutos.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Patxôhã (palavra ou frase)">
            <Input value={newWord.term_indigenous} onChange={(e) => setNewWord({ ...newWord, term_indigenous: e.target.value })} />
          </Field>
          <Field label="Português">
            <Input value={newWord.term_pt} onChange={(e) => setNewWord({ ...newWord, term_pt: e.target.value })} />
          </Field>
          <Field label="Pronúncia">
            <Input value={newWord.pronunciation} onChange={(e) => setNewWord({ ...newWord, pronunciation: e.target.value })} />
          </Field>
          <Field label="Exemplo de frase">
            <Input value={newWord.example} onChange={(e) => setNewWord({ ...newWord, example: e.target.value })} />
          </Field>
        </div>
        <Btn onClick={addWord}>Adicionar à base</Btn>
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-black text-cream">Traduções não encontradas</h3>
        {misses.isLoading && <p className="text-sm text-foreground/60">Carregando…</p>}
        {misses.data?.length === 0 && <p className="text-sm text-foreground/60">Nenhuma até agora.</p>}
        <ul className="space-y-2">
          {misses.data?.map((m) => (
            <li key={m.id} className={`flex flex-wrap items-center gap-2 rounded-xl border border-gold/20 p-3 text-sm ${m.resolved ? "opacity-50" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-cream">{m.term}</div>
                {m.question && <div className="truncate text-xs text-foreground/60">“{m.question}”</div>}
                <div className="text-[10px] text-foreground/40">{new Date(m.created_at).toLocaleString("pt-BR")}</div>
              </div>
              {!m.resolved && (
                <Btn variant="outline" onClick={() => resolveMiss(m.id, m.term)}>
                  Cadastrar
                </Btn>
              )}
              <Btn variant="danger" onClick={() => removeMiss(m.id)}>
                Apagar
              </Btn>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
