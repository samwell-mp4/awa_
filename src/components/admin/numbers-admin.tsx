import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getNumbersConfig, updateNumbersConfig } from "@/lib/numbers.functions";
import { toast } from "sonner";
import { Save, Plus, Trash2, Hash, Volume2, Type } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";

export function NumbersAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getNumbersConfig);
  const updateFn = useServerFn(updateNumbersConfig);

  const { data: config, isLoading } = useQuery({
    queryKey: ["site_config", "aprender_numeros"],
    queryFn: () => getFn(),
  });

  const [draft, setDraft] = useState<any[]>([]);

  useEffect(() => {
    if (config && Array.isArray(config)) {
      setDraft(config);
    } else if (config === null || (Array.isArray(config) && config.length === 0)) {
      // Default seed if empty
      setDraft([
        { pt: "Um", pat: "Kutkuxú", audio: "/audios/numero-01.wav" },
        { pt: "Dois", pat: "Mokoi", audio: "/audios/numero-02.wav" },
        { pt: "Três", pat: "Kaikui", audio: "/audios/numero-03.wav" },
        { pt: "Quatro", pat: "Bap", audio: "/audios/numero-04.wav" },
        { pt: "Cinco", pat: "Mankoi", audio: "/audios/numero-05.wav" },
        { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/audios/numero-06.wav" },
        { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/audios/numero-07.wav" },
        { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/audios/numero-08.wav" },
        { pt: "Nove", pat: "Bap hãpõhã", audio: "/audios/numero-09.wav" },
        { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/audios/numero-10.wav" },
      ]);
    }
  }, [config]);

  async function save() {
    try {
      await updateFn({ data: draft });
      toast.success("Configuração de números salva!");
      qc.invalidateQueries({ queryKey: ["site_config", "aprender_numeros"] });
      qc.invalidateQueries({ queryKey: ["aprender_numeros_content"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (isLoading) return <div className="py-10 text-center text-foreground/60">Carregando números...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream">
            <Hash className="h-5 w-5 text-gold" /> Editar Números e Áudios
          </h3>
          <Btn variant="outline" onClick={() => setDraft([...draft, { pt: "", pat: "", audio: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Adicionar Número
          </Btn>
        </div>

        <div className="space-y-4">
          {draft.map((n, i) => (
            <div key={i} className="grid gap-3 p-4 rounded-2xl border border-gold/10 bg-black/20 md:grid-cols-[1fr_1fr_2fr_auto]">
              <Field label="Português">
                <Input 
                  value={n.pt} 
                  onChange={e => {
                    const copy = [...draft];
                    copy[i].pt = e.target.value;
                    setDraft(copy);
                  }} 
                />
              </Field>
              <Field label="Patxôhã">
                <Input 
                  value={n.pat} 
                  onChange={e => {
                    const copy = [...draft];
                    copy[i].pat = e.target.value;
                    setDraft(copy);
                  }} 
                />
              </Field>
              <Field label="URL do Áudio">
                <div className="flex gap-2">
                  <Input 
                    value={n.audio} 
                    onChange={e => {
                      const copy = [...draft];
                      copy[i].audio = e.target.value;
                      setDraft(copy);
                    }} 
                    className="flex-1"
                  />
                  {n.audio && (
                    <button 
                      onClick={() => new Audio(n.audio).play()}
                      className="p-2.5 rounded-xl bg-gold/20 text-gold hover:bg-gold/30"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Field>
              <div className="flex items-end pb-1">
                <Btn variant="danger" onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <Btn className="mt-8 w-full" onClick={save}>
          <Save className="h-4 w-4" /> Salvar Alterações
        </Btn>
      </Card>
    </div>
  );
}
