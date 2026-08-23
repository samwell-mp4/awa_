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
        { pt: "Um", pat: "Kutkuxú", audio: "/__l5e/assets-v1/0a50107c-35c2-459b-9fc1-399a0d2aa745/numero-01.mp3" },
        { pt: "Dois", pat: "Mokoi", audio: "/__l5e/assets-v1/bb18fb52-b9a0-43ea-94c5-92fb76ae4062/numero-02.mp3" },
        { pt: "Três", pat: "Kaikui", audio: "/__l5e/assets-v1/4945f279-0e97-441a-87ed-dd4cab73ac5f/numero-03.mp3" },
        { pt: "Quatro", pat: "Bap", audio: "/__l5e/assets-v1/791b663e-0798-467d-80d5-6ee8c5a8d6cb/numero-04.mp3" },
        { pt: "Cinco", pat: "Mankoi", audio: "/__l5e/assets-v1/ad724985-187f-430e-a325-4f2f8f1f38ce/numero-05.mp3" },
        { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/__l5e/assets-v1/972dcad9-9c23-4362-a12d-4ac55bbc2374/numero-06.mp3" },
        { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/__l5e/assets-v1/670234f5-0285-450b-93ab-6626f2ce3cd9/numero-07.mp3" },
        { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/__l5e/assets-v1/98aec23b-5271-4e94-9e2b-85e9ebd0db77/numero-08.mp3" },
        { pt: "Nove", pat: "Bap hãpõhã", audio: "/__l5e/assets-v1/b8705bf6-a6e4-4b13-b82a-3f61933b5e50/numero-09.mp3" },
        { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/__l5e/assets-v1/c0bea070-f28f-4014-a5b7-0ca815f4f09f/numero-10.mp3" },
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
