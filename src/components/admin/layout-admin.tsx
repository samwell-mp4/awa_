import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig, updateSiteConfig } from "@/lib/admin-layout.functions";
import { toast } from "sonner";
import { Save, Layout, Image as ImageIcon, Palette, Type, Plus, Trash2 } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";

export function LayoutAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSiteConfig);
  const updateFn = useServerFn(updateSiteConfig);

  const { data: hotspots = [], isLoading: loadingHotspots } = useQuery({
    queryKey: ["site_config", "infantil_hotspots"],
    queryFn: () => getFn("infantil_hotspots"),
  });

  const { data: branding = {}, isLoading: loadingBranding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn("branding"),
  });

  const [hotspotsDraft, setHotspotsDraft] = useState<any[]>([]);
  const [brandingDraft, setBrandingDraft] = useState<any>({});

  useEffect(() => {
    if (hotspots) setHotspotsDraft(hotspots);
  }, [hotspots]);

  useEffect(() => {
    if (branding) setBrandingDraft(branding);
  }, [branding]);

  async function saveHotspots() {
    try {
      await updateFn({ key: "infantil_hotspots", value: hotspotsDraft });
      toast.success("Menu infantil atualizado!");
      qc.invalidateQueries({ queryKey: ["site_config", "infantil_hotspots"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function saveBranding() {
    try {
      await updateFn({ key: "branding", value: brandingDraft });
      toast.success("Identidade visual atualizada!");
      qc.invalidateQueries({ queryKey: ["site_config", "branding"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
          <ImageIcon className="h-5 w-5 text-gold" /> Identidade Visual
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Logo Infantil (URL)">
            <Input 
              value={brandingDraft.infantil_logo_url || ""} 
              onChange={e => setBrandingDraft({...brandingDraft, infantil_logo_url: e.target.value})}
            />
          </Field>
          <Field label="Vídeo Menu Infantil (URL)">
            <Input 
              value={brandingDraft.infantil_menu_video_url || ""} 
              onChange={e => setBrandingDraft({...brandingDraft, infantil_menu_video_url: e.target.value})}
            />
          </Field>
          <Field label="Logo Adulto (URL)">
            <Input 
              value={brandingDraft.adulto_logo_url || ""} 
              onChange={e => setBrandingDraft({...brandingDraft, adulto_logo_url: e.target.value})}
            />
          </Field>
        </div>
        <Btn className="mt-6" onClick={saveBranding}>
          <Save className="h-4 w-4" /> Salvar Identidade
        </Btn>
      </Card>

      <Card>
        <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
          <Palette className="h-5 w-5 text-gold" /> Menu Infantil (Atalhos)
        </h3>
        <div className="space-y-4">
          {hotspotsDraft.map((h, i) => (
            <div key={i} className="grid gap-3 p-4 rounded-2xl border border-gold/10 bg-black/20 md:grid-cols-[1fr_1fr_80px_100px_auto]">
              <Field label="Chave Tradução">
                <Input value={h.key} onChange={e => {
                  const copy = [...hotspotsDraft];
                  copy[i].key = e.target.value;
                  setHotspotsDraft(copy);
                }} />
              </Field>
              <Field label="Rota (URL)">
                <Input value={h.to} onChange={e => {
                  const copy = [...hotspotsDraft];
                  copy[i].to = e.target.value;
                  setHotspotsDraft(copy);
                }} />
              </Field>
              <Field label="Emoji">
                <Input value={h.emoji} onChange={e => {
                  const copy = [...hotspotsDraft];
                  copy[i].emoji = e.target.value;
                  setHotspotsDraft(copy);
                }} />
              </Field>
              <Field label="Cor">
                <Input type="color" value={h.color} onChange={e => {
                  const copy = [...hotspotsDraft];
                  copy[i].color = e.target.value;
                  setHotspotsDraft(copy);
                }} className="h-10 p-1" />
              </Field>
              <div className="flex items-end pb-1">
                <Btn variant="danger" onClick={() => {
                  setHotspotsDraft(hotspotsDraft.filter((_, idx) => idx !== i));
                }}>
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </div>
            </div>
          ))}
          <Btn variant="outline" onClick={() => setHotspotsDraft([...hotspotsDraft, { key: "", to: "", emoji: "✨", color: "#000000" }])}>
            <Plus className="h-4 w-4" /> Adicionar Atalho
          </Btn>
        </div>
        <Btn className="mt-6" onClick={saveHotspots}>
          <Save className="h-4 w-4" /> Salvar Menu
        </Btn>
      </Card>
    </div>
  );
}
