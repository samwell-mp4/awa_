import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plus, Trash2, X } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

type Mission = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  points: number;
  is_active: boolean;
};

export function MissionAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["missions_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_mission").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((m) => ({ ...m, options: Array.isArray(m.options) ? m.options : [] })) as Mission[];
    },
  });

  async function create() {
    const { error } = await supabase.from("daily_mission").insert({
      question: "Nova pergunta?",
      options: ["Opção A", "Opção B"],
      correct_index: 0,
      points: 10,
      is_active: false,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["missions_all"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg font-black text-cream">Missões do dia</h2>
        <Btn onClick={create}><Plus className="h-4 w-4" /> Nova missão</Btn>
      </div>
      {data.map((m) => <MissionRow key={m.id} mission={m} />)}
    </div>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const qc = useQueryClient();
  const [m, setM] = useState(mission);
  useEffect(() => setM(mission), [mission]);

  function setOpt(i: number, val: string) {
    const opts = [...m.options]; opts[i] = val; setM({ ...m, options: opts });
  }
  function addOpt() { setM({ ...m, options: [...m.options, ""] }); }
  function removeOpt(i: number) {
    const opts = m.options.filter((_, idx) => idx !== i);
    setM({ ...m, options: opts, correct_index: Math.min(m.correct_index, opts.length - 1) });
  }

  async function save() {
    const { error } = await supabase.from("daily_mission").update({
      question: m.question, options: m.options, correct_index: m.correct_index,
      points: m.points, is_active: m.is_active,
    }).eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    qc.invalidateQueries({ queryKey: ["missions_all"] });
    qc.invalidateQueries({ queryKey: ["daily_mission"] });
  }
  async function remove() {
    if (!confirm("Excluir?")) return;
    await supabase.from("daily_mission").delete().eq("id", m.id);
    qc.invalidateQueries({ queryKey: ["missions_all"] });
  }

  return (
    <Card>
      <Field label="Pergunta"><Textarea rows={2} value={m.question} onChange={(e) => setM({ ...m, question: e.target.value })} /></Field>
      <div className="mt-3 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">Alternativas (marque a correta)</div>
        {m.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" name={`correct-${m.id}`} checked={m.correct_index === i} onChange={() => setM({ ...m, correct_index: i })} />
            <Input value={opt} onChange={(e) => setOpt(i, e.target.value)} className="flex-1" />
            <button onClick={() => removeOpt(i)} className="text-foreground/50 hover:text-destructive"><X className="h-4 w-4" /></button>
          </div>
        ))}
        <Btn variant="outline" onClick={addOpt}><Plus className="h-4 w-4" /> Adicionar alternativa</Btn>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Field label="Pontos"><Input type="number" value={m.points} onChange={(e) => setM({ ...m, points: +e.target.value })} className="w-24" /></Field>
        <label className="inline-flex items-center gap-2 text-sm text-cream mt-5">
          <input type="checkbox" checked={m.is_active} onChange={(e) => setM({ ...m, is_active: e.target.checked })} /> Ativa
        </label>
        <div className="ml-auto flex gap-2 mt-5">
          <Btn onClick={save}><Save className="h-4 w-4" /> Salvar</Btn>
          <Btn variant="danger" onClick={remove}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      </div>
    </Card>
  );
}
