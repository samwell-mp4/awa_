import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

type Trail = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  order_index: number;
  default_progress: number;
};

export function TrailsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
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

  const [draft, setDraft] = useState({ name: "", description: "", order_index: 0, default_progress: 0, image_url: "" });

  async function add() {
    if (!draft.name) return toast.error("Nome obrigatório");
    const { error } = await supabase.from("trails").insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Trilha criada");
    setDraft({ name: "", description: "", order_index: 0, default_progress: 0, image_url: "" });
    qc.invalidateQueries({ queryKey: ["trails"] });
  }

  async function update(t: Trail) {
    const { error } = await supabase.from("trails").update({
      name: t.name,
      description: t.description,
      image_url: t.image_url,
      order_index: t.order_index,
      default_progress: t.default_progress,
    }).eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["trails"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta trilha?")) return;
    const { error } = await supabase.from("trails").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida");
    qc.invalidateQueries({ queryKey: ["trails"] });
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-lg font-black text-cream mb-3">Nova trilha</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field label="URL da imagem"><Input value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Descrição"><Textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem"><Input type="number" value={draft.order_index} onChange={(e) => setDraft({ ...draft, order_index: +e.target.value })} /></Field>
            <Field label="Progresso %"><Input type="number" min={0} max={100} value={draft.default_progress} onChange={(e) => setDraft({ ...draft, default_progress: +e.target.value })} /></Field>
          </div>
        </div>
        <Btn onClick={add} className="mt-4"><Plus className="h-4 w-4" /> Criar trilha</Btn>
      </Card>

      <div className="grid gap-3">
        {data.map((t) => (
          <TrailRow key={t.id} trail={t} onSave={update} onDelete={remove} />
        ))}
      </div>
    </div>
  );
}

function TrailRow({ trail, onSave, onDelete }: { trail: Trail; onSave: (t: Trail) => void; onDelete: (id: string) => void }) {
  const [t, setT] = useState(trail);
  return (
    <Card>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome"><Input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></Field>
          <Field label="URL da imagem"><Input value={t.image_url ?? ""} onChange={(e) => setT({ ...t, image_url: e.target.value })} /></Field>
          <Field label="Descrição"><Textarea rows={2} value={t.description ?? ""} onChange={(e) => setT({ ...t, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ordem"><Input type="number" value={t.order_index} onChange={(e) => setT({ ...t, order_index: +e.target.value })} /></Field>
            <Field label="Progresso %"><Input type="number" value={t.default_progress} onChange={(e) => setT({ ...t, default_progress: +e.target.value })} /></Field>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2">
          <Btn onClick={() => onSave(t)}><Save className="h-4 w-4" /> Salvar</Btn>
          <Btn variant="danger" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>
    </Card>
  );
}
