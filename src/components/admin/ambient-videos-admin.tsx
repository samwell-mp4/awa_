import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Save, MapPin, Video, Info } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

type AmbientVideo = {
  id: string;
  name: string;
  video_url: string;
  poster_url: string | null;
  order_index: number;
};

export function AmbientVideosAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["ambient_videos_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambient_videos")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as AmbientVideo[];
    },
  });

  const [draft, setDraft] = useState<Omit<AmbientVideo, "id">>({ 
    name: "", 
    video_url: "", 
    poster_url: "", 
    order_index: 0 
  });

  async function add() {
    if (!draft.name || !draft.video_url) return toast.error("Nome e URL do vídeo são obrigatórios");
    const { error } = await supabase.from("ambient_videos").insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Registro adicionado");
    setDraft({ name: "", video_url: "", poster_url: "", order_index: data.length + 1 });
    qc.invalidateQueries({ queryKey: ["ambient_videos_admin"] });
  }

  async function update(v: AmbientVideo) {
    const { error } = await supabase.from("ambient_videos").update({
      name: v.name,
      video_url: v.video_url,
      poster_url: v.poster_url,
      order_index: v.order_index,
    }).eq("id", v.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["ambient_videos_admin"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir este vídeo/registro?")) return;
    const { error } = await supabase.from("ambient_videos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    qc.invalidateQueries({ queryKey: ["ambient_videos_admin"] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-black text-cream mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-gold" /> Novo Vídeo ou Registro
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome/Título"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Rituais na Aldeia Velha" /></Field>
          <Field label="URL do Vídeo (.mp4)"><Input value={draft.video_url} onChange={(e) => setDraft({ ...draft, video_url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="URL da Capa (opcional)"><Input value={draft.poster_url ?? ""} onChange={(e) => setDraft({ ...draft, poster_url: e.target.value })} placeholder="https://..." /></Field>
          <div className="hidden"><Field label="Ordem de exibição"><Input type="number" value={draft.order_index} onChange={(e) => setDraft({ ...draft, order_index: +e.target.value })} /></Field></div>
        </div>
        <Btn onClick={add} className="mt-6 w-full md:w-auto"><Plus className="h-4 w-4" /> Adicionar</Btn>
      </Card>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-black text-cream flex items-center gap-2">
          <Video className="h-6 w-6 text-gold" /> Vídeos e Registros Atuais
        </h3>
        <div className="grid gap-4">
          {data.length === 0 ? (
            <div className="text-center py-10 text-foreground/50 border border-dashed border-gold/20 rounded-2xl">
              Nenhum registro encontrado no banco de dados.
            </div>
          ) : (
            data.map((v) => (
              <AmbientVideoRow key={v.id} video={v} onSave={update} onDelete={remove} />
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 flex gap-3 text-sm text-foreground/70">
        <Info className="h-5 w-5 shrink-0 text-gold" />
        <p>
          Estes vídeos são exibidos na seção de <strong>Vídeos e Registros</strong>. 
          Certifique-se de usar URLs diretas para arquivos .mp4 para garantir a compatibilidade.
        </p>
      </div>
    </div>
  );
}

function AmbientVideoRow({ video, onSave, onDelete }: { video: AmbientVideo; onSave: (v: AmbientVideo) => void; onDelete: (id: string) => void }) {
  const [v, setV] = useState(video);
  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome/Título"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="URL do Vídeo"><Input value={v.video_url} onChange={(e) => setV({ ...v, video_url: e.target.value })} /></Field>
          <Field label="URL da Capa"><Input value={v.poster_url ?? ""} onChange={(e) => setV({ ...v, poster_url: e.target.value })} /></Field>
          <div className="hidden"><Field label="Ordem"><Input type="number" value={v.order_index} onChange={(e) => setV({ ...v, order_index: +e.target.value })} /></Field></div>
        </div>
        <div className="flex flex-row md:flex-col gap-2">
          <Btn onClick={() => onSave(v)}><Save className="h-4 w-4" /> Salvar</Btn>
          <Btn variant="danger" onClick={() => onDelete(v.id)}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>
      {v.video_url && (
        <div className="mt-4 aspect-video max-h-48 overflow-hidden rounded-xl border border-gold/10 bg-black/20">
          <video src={v.video_url} className="h-full w-full object-cover" />
        </div>
      )}
    </Card>
  );
}
