import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Save,
  Volume2,
  Music2,
  FolderOpen,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { Field, Input, Textarea, Btn, Card, UploadOrUrl, AudioPreviewPlayer } from "./ui";
import { getTrilhaAudioUrl } from "@/lib/trilhas-audio-catalog";

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

type Trail = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  order_index: number;
  default_progress: number;
};

type TrailWord = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  category: string;
  language: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
};

async function uploadTrailAudioFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `trilhas/audio/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("songs").upload(path, file, {
    contentType: file.type || "audio/mpeg",
    upsert: false,
  });
  if (upErr) throw upErr;
  const { data, error: signErr } = await supabase.storage.from("songs").createSignedUrl(path, FIVE_YEARS);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Falha ao gerar link do áudio");
  return data.signedUrl;
}

async function uploadTrailCoverFile(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `trails/covers/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("songs").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (upErr) throw upErr;
  const { data, error: signErr } = await supabase.storage.from("songs").createSignedUrl(path, FIVE_YEARS);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Falha ao gerar link da imagem");
  return data.signedUrl;
}

export function TrailsAdmin() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"steps" | "trails">("steps");

  const { data: trails = [], isLoading: trailsLoading } = useQuery({
    queryKey: ["trails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trails")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as Trail[];
    },
  });

  const [selectedTrailId, setSelectedTrailId] = useState<string>("");

  useEffect(() => {
    if (trails.length > 0 && !selectedTrailId) {
      setSelectedTrailId(trails[0].id);
    }
  }, [trails, selectedTrailId]);

  const selectedTrail = useMemo(
    () => trails.find((t) => t.id === selectedTrailId) || trails[0],
    [trails, selectedTrailId]
  );

  return (
    <div className="space-y-6">
      {/* Abas Superiores */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/15 pb-4">
        <div>
          <h2 className="font-display text-xl font-black text-cream flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-gold" /> Trilhas & Áudios Gravados
          </h2>
          <p className="text-xs text-foreground/70 mt-1">
            Gerencie os passos individuais, envie arquivos de áudio gravados de cada palavra e organize as trilhas de aprendizado.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-black/30 rounded-xl">
          <button
            onClick={() => setActiveTab("steps")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "steps"
                ? "bg-gold text-forest-deep shadow-lg"
                : "text-foreground/70 hover:text-cream"
            }`}
          >
            <Volume2 className="h-4 w-4" /> Passos & Áudios das Trilhas
          </button>
          <button
            onClick={() => setActiveTab("trails")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "trails"
                ? "bg-gold text-forest-deep shadow-lg"
                : "text-foreground/70 hover:text-cream"
            }`}
          >
            <Layers className="h-4 w-4" /> Configuração das Trilhas
          </button>
        </div>
      </div>

      {activeTab === "steps" ? (
        <TrailStepsManager
          trails={trails}
          selectedTrail={selectedTrail}
          onSelectTrail={(id) => setSelectedTrailId(id)}
        />
      ) : (
        <TrailsConfigManager trails={trails} />
      )}
    </div>
  );
}

/* =========================================================================
   GERENCIADOR DE PASSOS / PALAVRAS E UPLOAD DE ÁUDIOS INDIVIDUAIS
   ========================================================================= */

function TrailStepsManager({
  trails,
  selectedTrail,
  onSelectTrail,
}: {
  trails: Trail[];
  selectedTrail?: Trail;
  onSelectTrail: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterAudio, setFilterAudio] = useState<"all" | "with-audio" | "without-audio">("all");

  const trailCategory = selectedTrail?.name ?? "Saudações";

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["trail_words", trailCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("*")
        .eq("category", trailCategory)
        .order("term_pt");
      if (error) throw error;
      return (data || []) as TrailWord[];
    },
    enabled: Boolean(trailCategory),
  });

  const defaultNewDraft: Omit<TrailWord, "id"> = {
    term_indigenous: "",
    term_pt: "",
    category: trailCategory,
    language: "Patxôhã",
    pronunciation: "",
    example: "",
    audio_url: "",
  };

  const [newDraft, setNewDraft] = useState(defaultNewDraft);
  const [adding, setAdding] = useState(false);

  // Sincroniza categoria quando seleciona outra trilha
  useEffect(() => {
    setNewDraft((prev) => ({ ...prev, category: trailCategory }));
  }, [trailCategory]);

  async function handleAddStep() {
    if (!newDraft.term_indigenous.trim() || !newDraft.term_pt.trim()) {
      return toast.error("Preencha o termo em Patxôhã e a tradução em Português.");
    }
    setAdding(true);
    try {
      const { error } = await supabase.from("dictionary").insert({
        term_indigenous: newDraft.term_indigenous.trim(),
        term_pt: newDraft.term_pt.trim(),
        category: trailCategory,
        language: newDraft.language || "Patxôhã",
        pronunciation: newDraft.pronunciation?.trim() || null,
        example: newDraft.example?.trim() || null,
        audio_url: newDraft.audio_url?.trim() || null,
      });
      if (error) throw error;

      toast.success(`Passo adicionado à trilha "${trailCategory}"!`);
      setNewDraft({
        term_indigenous: "",
        term_pt: "",
        category: trailCategory,
        language: "Patxôhã",
        pronunciation: "",
        example: "",
        audio_url: "",
      });

      qc.invalidateQueries({ queryKey: ["trail_words", trailCategory] });
      qc.invalidateQueries({ queryKey: ["trilha-words"] });
      qc.invalidateQueries({ queryKey: ["dict_admin"] });
      qc.invalidateQueries({ queryKey: ["dictionary"] });
    } catch (err: any) {
      toast.error("Erro ao adicionar passo: " + err.message);
    } finally {
      setAdding(false);
    }
  }

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      const matchesSearch =
        !q ||
        w.term_indigenous.toLowerCase().includes(q) ||
        w.term_pt.toLowerCase().includes(q) ||
        (w.pronunciation && w.pronunciation.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const hasCustomAudio = Boolean(w.audio_url);
      const hasCatalogAudio = Boolean(getTrilhaAudioUrl(w));
      const hasAnyAudio = hasCustomAudio || hasCatalogAudio;

      if (filterAudio === "with-audio") return hasAnyAudio;
      if (filterAudio === "without-audio") return !hasAnyAudio;
      return true;
    });
  }, [words, search, filterAudio]);

  const audioStats = useMemo(() => {
    let custom = 0;
    let catalog = 0;
    let none = 0;
    words.forEach((w) => {
      if (w.audio_url) custom++;
      else if (getTrilhaAudioUrl(w)) catalog++;
      else none++;
    });
    return { custom, catalog, none, total: words.length };
  }, [words]);

  return (
    <div className="space-y-6">
      {/* Seletor de Trilha Ativa */}
      <Card className="bg-forest-deep/40 border border-gold/20">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gold flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Selecione a Trilha para gerenciar os passos:
            </span>
            <div className="flex items-center gap-3 text-xs text-foreground/70">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {audioStats.custom} áudios enviados
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {audioStats.catalog} no catálogo
              </span>
              {audioStats.none > 0 && (
                <span className="inline-flex items-center gap-1.5 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  {audioStats.none} sem áudio
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {trails.map((t) => {
              const isSelected = t.id === selectedTrail?.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTrail(t.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 border ${
                    isSelected
                      ? "bg-gold text-forest-deep border-gold shadow-md scale-102"
                      : "bg-black/30 border-gold/20 text-cream hover:bg-black/50 hover:border-gold/50"
                  }`}
                >
                  <span>{t.name}</span>
                  {isSelected && (
                    <span className="bg-forest-deep text-gold text-[10px] px-2 py-0.5 rounded-full font-black">
                      {words.length} passos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Formulário: Adicionar Novo Passo à Trilha */}
      <Card className="border border-gold/25 bg-black/20">
        <h3 className="font-display text-lg font-black text-cream mb-1 flex items-center gap-2">
          <Plus className="h-5 w-5 text-gold" /> Adicionar Novo Passo na Trilha:{" "}
          <span className="text-gold underline">{trailCategory}</span>
        </h3>
        <p className="text-xs text-foreground/60 mb-4">
          Cadastre uma nova palavra ou frase e anexe diretamente o arquivo de áudio gravado (.mp3, .wav, .ogg, .m4a).
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Termo Patxôhã (Palavra / Frase)">
            <Input
              value={newDraft.term_indigenous}
              onChange={(e) => setNewDraft({ ...newDraft, term_indigenous: e.target.value })}
              placeholder="Ex: Akxãy"
            />
          </Field>
          <Field label="Tradução em Português">
            <Input
              value={newDraft.term_pt}
              onChange={(e) => setNewDraft({ ...newDraft, term_pt: e.target.value })}
              placeholder="Ex: Olá / Tudo bem"
            />
          </Field>
          <Field label="Pronúncia (Opcional)">
            <Input
              value={newDraft.pronunciation ?? ""}
              onChange={(e) => setNewDraft({ ...newDraft, pronunciation: e.target.value })}
              placeholder="Ex: ah-k-shá-y"
            />
          </Field>
          <Field label="Língua">
            <Input
              value={newDraft.language}
              onChange={(e) => setNewDraft({ ...newDraft, language: e.target.value })}
              placeholder="Patxôhã"
            />
          </Field>

          <div className="md:col-span-2">
            <UploadOrUrl
              label="Áudio Individual deste Passo (Gravação em Arquivo ou Link)"
              value={newDraft.audio_url ?? ""}
              onChange={(url) => setNewDraft({ ...newDraft, audio_url: url })}
              onFile={async (file) => {
                const toastId = toast.loading("Enviando arquivo de áudio...");
                try {
                  const url = await uploadTrailAudioFile(file);
                  setNewDraft((prev) => ({ ...prev, audio_url: url }));
                  toast.success("Áudio enviado com sucesso!", { id: toastId });
                } catch (e: any) {
                  toast.error("Falha no upload: " + e.message, { id: toastId });
                }
              }}
              accept="audio/*"
              placeholder="https://... ou clique abaixo para enviar o arquivo"
            />
          </div>

          <div className="md:col-span-2">
            <Field label="Exemplo de Uso Cultural (Opcional)">
              <Textarea
                rows={2}
                value={newDraft.example ?? ""}
                onChange={(e) => setNewDraft({ ...newDraft, example: e.target.value })}
                placeholder="Ex: Akxãy txai, como você está?"
              />
            </Field>
          </div>
        </div>

        <Btn onClick={handleAddStep} disabled={adding} className="mt-4">
          <Plus className="h-4 w-4" /> {adding ? "Salvando Passo..." : "Adicionar Passo à Trilha"}
        </Btn>
      </Card>

      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar palavras na trilha ${trailCategory}...`}
            className="pl-10 w-full"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterAudio("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterAudio === "all" ? "bg-gold/20 text-gold" : "text-foreground/60 hover:text-cream"
            }`}
          >
            Todos ({words.length})
          </button>
          <button
            onClick={() => setFilterAudio("with-audio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterAudio === "with-audio"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-foreground/60 hover:text-cream"
            }`}
          >
            Com Áudio ({audioStats.custom + audioStats.catalog})
          </button>
          <button
            onClick={() => setFilterAudio("without-audio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterAudio === "without-audio"
                ? "bg-rose-500/20 text-rose-400"
                : "text-foreground/60 hover:text-cream"
            }`}
          >
            Sem Áudio ({audioStats.none})
          </button>
        </div>
      </div>

      {/* Lista de Passos Existentes */}
      {isLoading ? (
        <div className="py-12 text-center text-foreground/60">Carregando passos da trilha...</div>
      ) : filteredWords.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-foreground/60 text-sm">Nenhum passo encontrado para esta trilha com os filtros atuais.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWords.map((word) => (
            <TrailWordRow
              key={word.id}
              word={word}
              trailCategory={trailCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   LINHA DE EDIÇÃO DE UM PASSO DA TRILHA (PALAVRA + ÁUDIO INDIVIDUAL)
   ========================================================================= */

function TrailWordRow({
  word,
  trailCategory,
}: {
  word: TrailWord;
  trailCategory: string;
}) {
  const qc = useQueryClient();
  const [w, setW] = useState(word);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setW(word);
  }, [word]);

  const catalogAudio = useMemo(() => getTrilhaAudioUrl(w), [w]);
  const effectiveAudio = w.audio_url || catalogAudio;

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("dictionary")
        .update({
          term_indigenous: w.term_indigenous.trim(),
          term_pt: w.term_pt.trim(),
          category: w.category.trim(),
          language: w.language || "Patxôhã",
          pronunciation: w.pronunciation?.trim() || null,
          example: w.example?.trim() || null,
          audio_url: w.audio_url?.trim() || null,
        })
        .eq("id", w.id);

      if (error) throw error;
      toast.success(`Passo "${w.term_indigenous}" salvo com sucesso!`);
      qc.invalidateQueries({ queryKey: ["trail_words", trailCategory] });
      qc.invalidateQueries({ queryKey: ["trilha-words"] });
      qc.invalidateQueries({ queryKey: ["dict_admin"] });
      qc.invalidateQueries({ queryKey: ["dictionary"] });
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o passo "${w.term_indigenous}" (${w.term_pt}) da trilha?`)) {
      return;
    }
    setDeleting(true);
    try {
      const { error } = await supabase.from("dictionary").delete().eq("id", w.id);
      if (error) throw error;
      toast.success(`Passo excluído com sucesso!`);
      qc.invalidateQueries({ queryKey: ["trail_words", trailCategory] });
      qc.invalidateQueries({ queryKey: ["trilha-words"] });
      qc.invalidateQueries({ queryKey: ["dict_admin"] });
      qc.invalidateQueries({ queryKey: ["dictionary"] });
    } catch (e: any) {
      toast.error("Erro ao excluir: " + e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleUploadAudio(file: File) {
    const tid = toast.loading("Enviando áudio...");
    try {
      const url = await uploadTrailAudioFile(file);
      setW((prev) => ({ ...prev, audio_url: url }));

      // Salva imediatamente no banco para conveniência do usuário
      const { error } = await supabase
        .from("dictionary")
        .update({ audio_url: url })
        .eq("id", w.id);

      if (error) throw error;
      toast.success("Áudio enviado e salvo no banco de dados!", { id: tid });
      qc.invalidateQueries({ queryKey: ["trail_words", trailCategory] });
      qc.invalidateQueries({ queryKey: ["trilha-words"] });
    } catch (err: any) {
      toast.error("Erro no envio do áudio: " + err.message, { id: tid });
    }
  }

  return (
    <Card className="border border-gold/15 bg-card/60 hover:border-gold/30 transition">
      <div className="flex flex-col gap-4">
        {/* Cabeçalho da Palavra com Status do Áudio */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gold/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-cream">
              {w.term_indigenous}
            </span>
            <span className="text-xs text-foreground/50">—</span>
            <span className="text-xs font-semibold text-gold">{w.term_pt}</span>
          </div>

          <div className="flex items-center gap-2">
            {w.audio_url ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Áudio enviado ao banco
              </span>
            ) : catalogAudio ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Volume2 className="h-3.5 w-3.5" /> Áudio do catálogo local
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 text-foreground/50 border border-white/10">
                Sem áudio
              </span>
            )}
          </div>
        </div>

        {/* Campos de Edição */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Patxôhã">
            <Input
              value={w.term_indigenous}
              onChange={(e) => setW({ ...w, term_indigenous: e.target.value })}
            />
          </Field>
          <Field label="Português">
            <Input
              value={w.term_pt}
              onChange={(e) => setW({ ...w, term_pt: e.target.value })}
            />
          </Field>
          <Field label="Pronúncia">
            <Input
              value={w.pronunciation ?? ""}
              onChange={(e) => setW({ ...w, pronunciation: e.target.value })}
              placeholder="Opcional"
            />
          </Field>
          <Field label="Categoria">
            <Input
              value={w.category}
              onChange={(e) => setW({ ...w, category: e.target.value })}
            />
          </Field>

          {/* Upload e Player de Áudio */}
          <div className="sm:col-span-2 lg:col-span-4">
            <UploadOrUrl
              label="Áudio Individual (Envie arquivo .mp3/.wav/.ogg ou insira link)"
              value={w.audio_url ?? ""}
              onChange={(v) => setW({ ...w, audio_url: v })}
              onFile={handleUploadAudio}
              accept="audio/*"
              placeholder="https://... ou clique para escolher um arquivo do computador"
            />

            {/* Prévia do Áudio Atual (seja do banco ou do catálogo) */}
            {effectiveAudio && (
              <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-gold/15">
                <span className="text-[11px] font-bold text-gold shrink-0 flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5" /> Ouvir prévia:
                </span>
                <AudioPreviewPlayer src={effectiveAudio} className="flex-1 border-0 bg-transparent p-0" />
              </div>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <Field label="Exemplo de Uso">
              <Textarea
                rows={2}
                value={w.example ?? ""}
                onChange={(e) => setW({ ...w, example: e.target.value })}
                placeholder="Exemplo de frase na aldeia..."
              />
            </Field>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gold/10">
          <Btn onClick={handleSave} disabled={saving} className="py-2 text-xs">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
          </Btn>
          <Btn
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            className="py-2 text-xs"
            title="Excluir este passo da trilha"
          >
            <Trash2 className="h-4 w-4" />
          </Btn>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   GERENCIADOR DE CONFIGURAÇÃO DAS TRILHAS (CRIAR, EDITAR CAPAS E DADOS)
   ========================================================================= */

function TrailsConfigManager({ trails }: { trails: Trail[] }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    order_index: (trails.length || 0) + 1,
    default_progress: 0,
    image_url: "",
  });
  const [creating, setCreating] = useState(false);

  async function handleAddTrail() {
    if (!draft.name.trim()) return toast.error("Nome da trilha é obrigatório");
    setCreating(true);
    try {
      const { error } = await supabase.from("trails").insert({
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        order_index: draft.order_index,
        default_progress: draft.default_progress,
        image_url: draft.image_url.trim() || null,
      });
      if (error) throw error;

      toast.success("Nova trilha criada com sucesso!");
      setDraft({
        name: "",
        description: "",
        order_index: (trails.length || 0) + 2,
        default_progress: 0,
        image_url: "",
      });
      qc.invalidateQueries({ queryKey: ["trails"] });
    } catch (e: any) {
      toast.error("Erro ao criar trilha: " + e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateTrail(t: Trail) {
    const { error } = await supabase
      .from("trails")
      .update({
        name: t.name,
        description: t.description,
        image_url: t.image_url,
        order_index: t.order_index,
        default_progress: t.default_progress,
      })
      .eq("id", t.id);

    if (error) return toast.error(error.message);
    toast.success(`Trilha "${t.name}" salva com sucesso!`);
    qc.invalidateQueries({ queryKey: ["trails"] });
  }

  async function handleRemoveTrail(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a trilha "${name}"?`)) return;
    const { error } = await supabase.from("trails").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Trilha removida com sucesso!");
    qc.invalidateQueries({ queryKey: ["trails"] });
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gold/25 bg-black/20">
        <h3 className="font-display text-lg font-black text-cream mb-2 flex items-center gap-2">
          <Plus className="h-5 w-5 text-gold" /> Criar Nova Trilha
        </h3>
        <p className="text-xs text-foreground/60 mb-4">
          Crie uma nova trilha temática para o aplicativo.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome da Trilha">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ex: Frutas e Alimentos"
            />
          </Field>

          <UploadOrUrl
            label="Imagem de Capa da Trilha"
            value={draft.image_url}
            onChange={(url) => setDraft({ ...draft, image_url: url })}
            onFile={async (file) => {
              const tid = toast.loading("Enviando capa da trilha...");
              try {
                const url = await uploadTrailCoverFile(file);
                setDraft((prev) => ({ ...prev, image_url: url }));
                toast.success("Capa enviada!", { id: tid });
              } catch (e: any) {
                toast.error("Erro no upload da capa: " + e.message, { id: tid });
              }
            }}
            accept="image/*"
            placeholder="https://... ou envie do computador"
          />

          <Field label="Descrição">
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Apresentação da trilha para os alunos..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem de Exibição">
              <Input
                type="number"
                value={draft.order_index}
                onChange={(e) => setDraft({ ...draft, order_index: +e.target.value })}
              />
            </Field>
            <Field label="Progresso Inicial %">
              <Input
                type="number"
                min={0}
                max={100}
                value={draft.default_progress}
                onChange={(e) => setDraft({ ...draft, default_progress: +e.target.value })}
              />
            </Field>
          </div>
        </div>

        <Btn onClick={handleAddTrail} disabled={creating} className="mt-4">
          <Plus className="h-4 w-4" /> {creating ? "Criando Trilha..." : "Criar Trilha"}
        </Btn>
      </Card>

      <div className="space-y-4">
        <h3 className="font-display text-base font-black text-cream flex items-center gap-2">
          <Layers className="h-4 w-4 text-gold" /> Trilhas Cadastradas ({trails.length})
        </h3>

        <div className="grid gap-3">
          {trails.map((t) => (
            <TrailRow
              key={t.id}
              trail={t}
              onSave={handleUpdateTrail}
              onDelete={handleRemoveTrail}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrailRow({
  trail,
  onSave,
  onDelete,
}: {
  trail: Trail;
  onSave: (t: Trail) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [t, setT] = useState(trail);

  useEffect(() => {
    setT(trail);
  }, [trail]);

  return (
    <Card className="border border-gold/15 bg-card/60">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome da Trilha">
            <Input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} />
          </Field>

          <UploadOrUrl
            label="Imagem de Capa (Upload ou URL)"
            value={t.image_url ?? ""}
            onChange={(v) => setT({ ...t, image_url: v })}
            onFile={async (file) => {
              const tid = toast.loading("Enviando capa...");
              try {
                const url = await uploadTrailCoverFile(file);
                setT((prev) => ({ ...prev, image_url: url }));
                toast.success("Capa atualizada!", { id: tid });
              } catch (e: any) {
                toast.error("Erro no upload: " + e.message, { id: tid });
              }
            }}
            accept="image/*"
          />

          <Field label="Descrição">
            <Textarea
              rows={2}
              value={t.description ?? ""}
              onChange={(e) => setT({ ...t, description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem">
              <Input
                type="number"
                value={t.order_index}
                onChange={(e) => setT({ ...t, order_index: +e.target.value })}
              />
            </Field>
            <Field label="Progresso %">
              <Input
                type="number"
                value={t.default_progress}
                onChange={(e) => setT({ ...t, default_progress: +e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-row md:flex-col justify-end gap-2">
          <Btn onClick={() => onSave(t)} className="text-xs">
            <Save className="h-4 w-4" /> Salvar
          </Btn>
          <Btn
            variant="danger"
            onClick={() => onDelete(t.id, t.name)}
            className="text-xs"
            title="Excluir trilha"
          >
            <Trash2 className="h-4 w-4" />
          </Btn>
        </div>
      </div>
    </Card>
  );
}
