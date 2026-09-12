import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getNumbersConfig, updateNumbersConfig } from "@/lib/numbers.functions";
import { getSiteConfig, updateSiteConfig } from "@/lib/admin-layout.functions";
import { toast } from "sonner";
import { Save, Plus, Trash2, Hash, Volume2, Type, Layout, Upload, Loader2 } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";
import { supabase } from "@/integrations/supabase/client";

export function NumbersAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getNumbersConfig);
  const updateFn = useServerFn(updateNumbersConfig);
  const getSiteConfigFn = useServerFn(getSiteConfig);
  const updateSiteConfigFn = useServerFn(updateSiteConfig);

  const { data: pageConfig } = useQuery({
    queryKey: ["site_config", "numbers_page_config"],
    queryFn: () => getSiteConfigFn({ data: "numbers_page_config" }),
  });

  const [title, setTitle] = useState("Números em Patxôhã");
  const [subtitle, setSubtitle] = useState("Aprenda a contar na língua do povo Pataxó");

  useEffect(() => {
    if (pageConfig) {
      setTitle(pageConfig.title || "Números em Patxôhã");
      setSubtitle(pageConfig.subtitle || "Aprenda a contar na língua do povo Pataxó");
    }
  }, [pageConfig]);

  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ["site_config", "aprender_numeros"],
    queryFn: () => getFn(),
    staleTime: 0,
  });

  const [draft, setDraft] = useState<any[]>([]);

  useEffect(() => {
    if (config && Array.isArray(config)) {
      setDraft(JSON.parse(JSON.stringify(config))); // Deep copy to avoid reference issues
    } else if (config === null) {
      setDraft([
        { pt: "Um", pat: "Kutkuxú", audio: "/__l5e/assets-v1/08f75264-6b72-4498-bef9-7a75bc90bcb2/numero-01.mp3" },
        { pt: "Dois", pat: "Mokoi", audio: "/__l5e/assets-v1/f4507219-b0ff-4fd9-9ffe-01c9e5379c9a/numero-02.mp3" },
        { pt: "Três", pat: "Kaikui", audio: "/__l5e/assets-v1/ad4c0682-26bb-4876-87bf-be6bd79b3152/numero-03.mp3" },
        { pt: "Quatro", pat: "Bap", audio: "/__l5e/assets-v1/451dcc6d-e165-44b2-9aa8-a0c15f83d787/numero-04.mp3" },
        { pt: "Cinco", pat: "Mankoi", audio: "/__l5e/assets-v1/d246c347-4973-462a-a1fd-00f596650131/numero-05.mp3" },
        { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/__l5e/assets-v1/9d117b85-b44e-4fca-b8cf-0f3045fa0a4e/numero-06.mp3" },
        { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/__l5e/assets-v1/59aa9a56-77a4-473a-b59c-8ad620c03921/numero-07.mp3" },
        { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/__l5e/assets-v1/45c268fb-8e7f-4b57-a0f2-00aa2c92397d/numero-08.mp3" },
        { pt: "Nove", pat: "Bap hãpõhã", audio: "/__l5e/assets-v1/1ef7dd5b-a98c-48a6-8114-d93078f0b68d/numero-09.mp3" },
        { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/__l5e/assets-v1/fd7108f9-465d-4e28-bdb5-ab3f4fcde5bd/numero-10.mp3" },
      ]);
    }
  }, [config]);

  async function save() {
    const tid = toast.loading("Salvando alterações...");
    try {
      // Ensure we are sending the most up-to-date draft
      await updateFn({ data: [...draft] });
      await updateSiteConfigFn({ 
        data: { 
          key: "numbers_page_config", 
          value: { title, subtitle } 
        } 
      });
      
      // Invalidate all related queries
      await qc.invalidateQueries({ queryKey: ["site_config"] });
      await qc.invalidateQueries({ queryKey: ["aprender_numeros_content"] });
      
      // Force a refetch to ensure local state is in sync with DB
      await refetch();
      
      void notifyContentUpdated();
      toast.success("Configuração de números salva!", { id: tid });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar", { id: tid });
    }
  }

  if (isLoading) return <div className="py-10 text-center text-foreground/60">Carregando números...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-8 p-4 rounded-2xl border border-gold/10 bg-black/20 space-y-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream">
            <Layout className="h-5 w-5 text-gold" /> Títulos da Página
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título Principal">
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ex: Números em Patxôhã"
              />
            </Field>
            <Field label="Subtítulo">
              <Input 
                value={subtitle} 
                onChange={e => setSubtitle(e.target.value)} 
                placeholder="Ex: Aprenda a contar..."
              />
            </Field>
          </div>
        </div>

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
              <div className="flex flex-col gap-3">
                <Field label="Português">
                  <Input 
                    value={n.pt} 
                    onChange={e => {
                      const copy = [...draft];
                      copy[i] = { ...copy[i], pt: e.target.value };
                      setDraft(copy);
                    }} 
                  />
                </Field>
                <Field label="Patxôhã">
                  <Input 
                    value={n.pat} 
                    onChange={e => {
                      const copy = [...draft];
                      copy[i] = { ...copy[i], pat: e.target.value };
                      setDraft(copy);
                    }} 
                  />
                </Field>
              </div>
              <div className="flex flex-col gap-3">
                <NumberAudioUpload
                  label="Áudio (Upload ou URL)"
                  value={n.audio || ""}
                  onChange={v => {
                    const copy = [...draft];
                    copy[i] = { ...copy[i], audio: v };
                    setDraft(copy);
                  }}
                  accept="audio/*"
                />
                {n.audio && (
                  <Btn variant="outline" className="py-1 text-xs" onClick={() => {
                    const a = new Audio(n.audio);
                    a.play().catch(e => toast.error("Erro ao tocar: " + e.message));
                  }}>
                    <Volume2 className="h-3 w-3 mr-1" /> Testar Áudio
                  </Btn>
                )}
              </div>
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

function NumberAudioUpload({
  label,
  value,
  onChange,
  accept,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept: string;
}) {
  const [busy, setBusy] = useState(false);
  
  const onFile = async (file: File) => {
    const prefix = `numbers/audio`;
    const ext = file.name.split(".").pop() || "mp3";
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    
    setBusy(true);
    const tid = toast.loading("Enviando áudio...");
    
    try {
      const { error } = await supabase.storage.from("songs").upload(path, file);
      if (error) throw error;
      
      const { data } = await supabase.storage.from("songs").createSignedUrl(path, 60 * 60 * 24 * 365);
      onChange(data?.signedUrl || "");
      toast.success("Áudio enviado!", { id: tid });
    } catch (err: any) {
      toast.error("Erro no upload: " + err.message, { id: tid });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label}>
      <div className="flex flex-col gap-2">
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="https://..." 
          className="w-full"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-gold/40 bg-card/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Enviando..." : "Gravar/Enviar Áudio"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </Field>
  );
}
