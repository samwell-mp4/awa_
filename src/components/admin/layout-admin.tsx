import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig, updateSiteConfig } from "@/lib/admin-layout.functions";
import { toast } from "sonner";
import { Save, Layout, Image as ImageIcon, Palette, Plus, Trash2, Sparkles, Video } from "lucide-react";
import { Field, Input, Btn, Card } from "./ui";

export function LayoutAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSiteConfig);
  const updateFn = useServerFn(updateSiteConfig);
  const [activeTab, setActiveTab] = useState<"landing" | "adulto" | "infantil">("landing");


  const { data: landingHero = {}, isLoading: loadingHero } = useQuery({
    queryKey: ["site_config", "landing_hero"],
    queryFn: () => getFn({ data: "landing_hero" }),
  });

  const { data: hotspots = [], isLoading: loadingHotspots } = useQuery({
    queryKey: ["site_config", "infantil_hotspots"],
    queryFn: () => getFn({ data: "infantil_hotspots" }),
  });

  const { data: branding = {}, isLoading: loadingBranding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  const { data: adultHero = {}, isLoading: loadingAdultHero } = useQuery({
    queryKey: ["site_config", "adult_hero"],
    queryFn: () => getFn({ data: "adult_hero" }),
  });

  const [hotspotsDraft, setHotspotsDraft] = useState<any[]>([]);
  const [brandingDraft, setBrandingDraft] = useState<any>({});
  const [heroDraft, setHeroDraft] = useState<any>({});
  const [adultHeroDraft, setAdultHeroDraft] = useState<any>({});


  useEffect(() => {
    if (hotspots) setHotspotsDraft(hotspots);
  }, [hotspots]);

  useEffect(() => {
    if (branding) setBrandingDraft(branding);
  }, [branding]);

  useEffect(() => {
    if (landingHero) setHeroDraft(landingHero);
  }, [landingHero]);

  useEffect(() => {
    if (adultHero) setAdultHeroDraft(adultHero);
  }, [adultHero]);


  async function saveConfig(key: string, value: any, label: string) {
    try {
      await updateFn({ data: { key, value } });
      toast.success(`${label} atualizado!`);
      qc.invalidateQueries({ queryKey: ["site_config", key] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit">
        {[
          { id: "landing", label: "Geral & Landing", icon: Layout },
          { id: "adulto", label: "Área Adulto", icon: Palette },
          { id: "infantil", label: "Área Infantil", icon: Sparkles },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === t.id 
                ? "bg-gold text-forest-deep shadow-lg" 
                : "text-foreground/60 hover:text-cream hover:bg-white/5"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "landing" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Landing Hero Section */}
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Layout className="h-5 w-5 text-gold" /> Landing Page (Escolha de Perfil)
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título Principal (Linha 1)">
                  <Input 
                    value={heroDraft.h1a || ""} 
                    onChange={e => setHeroDraft({...heroDraft, h1a: e.target.value})}
                    placeholder="Ex: Línguas indígenas,"
                  />
                </Field>
                <Field label="Título Principal (Destaque Gold)">
                  <Input 
                    value={heroDraft.h1b || ""} 
                    onChange={e => setHeroDraft({...heroDraft, h1b: e.target.value})}
                    placeholder="Ex: culturas vivas."
                  />
                </Field>
              </div>
              <Field label="Texto de Apoio (Lead)">
                <Input 
                  value={heroDraft.lead || ""} 
                  onChange={e => setHeroDraft({...heroDraft, lead: e.target.value})}
                  placeholder="Descrição curta abaixo do título..."
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="URL Imagem de Fundo (Desktop)">
                  <Input 
                    value={heroDraft.bg_url || ""} 
                    onChange={e => setHeroDraft({...heroDraft, bg_url: e.target.value})}
                  />
                </Field>
                <Field label="Texto Botão Login">
                  <Input 
                    value={heroDraft.entrar_label || ""} 
                    onChange={e => setHeroDraft({...heroDraft, entrar_label: e.target.value})}
                  />
                </Field>
              </div>
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("landing_hero", heroDraft, "Hero da Landing")}>
              <Save className="h-4 w-4" /> Salvar Landing Page
            </Btn>
          </Card>

          {/* Branding Section */}
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <ImageIcon className="h-5 w-5 text-gold" /> Identidade Visual & Logos
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
              <Field label="Vídeo Apresentação Adulto (URL)">
                <Input 
                  value={brandingDraft.adulto_video_url || ""} 
                  onChange={e => setBrandingDraft({...brandingDraft, adulto_video_url: e.target.value})}
                />
              </Field>
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("branding", brandingDraft, "Identidade Visual")}>
              <Save className="h-4 w-4" /> Salvar Branding
            </Btn>
          </Card>
        </div>
      )}

      {activeTab === "adulto" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Palette className="h-5 w-5 text-gold" /> Personalização Área Adulto
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título Hero (Parte 1)">
                  <Input 
                    value={adultHeroDraft.title1 || ""} 
                    onChange={e => setAdultHeroDraft({...adultHeroDraft, title1: e.target.value})}
                  />
                </Field>
                <Field label="Título Hero (Parte 2 - Verde)">
                  <Input 
                    value={adultHeroDraft.title2 || ""} 
                    onChange={e => setAdultHeroDraft({...adultHeroDraft, title2: e.target.value})}
                  />
                </Field>
                <Field label="Título Hero (Parte 3)">
                  <Input 
                    value={adultHeroDraft.title3 || ""} 
                    onChange={e => setAdultHeroDraft({...adultHeroDraft, title3: e.target.value})}
                  />
                </Field>
                <Field label="Título Hero (Parte 4 - Gold)">
                  <Input 
                    value={adultHeroDraft.title4 || ""} 
                    onChange={e => setAdultHeroDraft({...adultHeroDraft, title4: e.target.value})}
                  />
                </Field>
              </div>
              <Field label="Subtítulo">
                <Input 
                  value={adultHeroDraft.subtitle || ""} 
                  onChange={e => setAdultHeroDraft({...adultHeroDraft, subtitle: e.target.value})}
                />
              </Field>
              <Field label="URL Imagem de Fundo Hero">
                <Input 
                  value={adultHeroDraft.hero_img_url || ""} 
                  onChange={e => setAdultHeroDraft({...adultHeroDraft, hero_img_url: e.target.value})}
                />
              </Field>
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("adult_hero", adultHeroDraft, "Hero Adulto")}>
              <Save className="h-4 w-4" /> Salvar Configuração Adulto
            </Btn>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gold/10 text-gold">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-cream">Destaques Contextuais</h4>
                <p className="text-xs text-foreground/60">As missões e vídeos são gerenciados nas abas específicas.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "infantil" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Infantil Hotspots Section */}
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Palette className="h-5 w-5 text-gold" /> Menu Infantil (Atalhos do Mapa)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gold/80">Atalhos no Grid</h4>
                <Btn variant="outline" onClick={() => setHotspotsDraft([...hotspotsDraft, { key: "", to: "", emoji: "✨", color: "#000000" }])}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar Atalho
                </Btn>
              </div>
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
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("infantil_hotspots", hotspotsDraft, "Menu Infantil")}>
              <Save className="h-4 w-4" /> Salvar Atalhos Infantil
            </Btn>
          </Card>
        </div>
      )}

      {/* Advanced Permissions Notice */}
      <Card>
        <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
          <Sparkles className="h-5 w-5 text-gold" /> Permissões Avançadas
        </h3>
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-gold">
            <Sparkles className="h-4 w-4" /> Acesso total sem restrições liberado para administradores.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-black/20 p-3 text-xs text-cream">
              <span className="text-lg">✅</span> Editar layout adulto e infantil
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/20 p-3 text-xs text-cream">
              <span className="text-lg">✅</span> Alterar hotspots e navegação
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/20 p-3 text-xs text-cream">
              <span className="text-lg">✅</span> Gerenciar logos e vídeos globais
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/20 p-3 text-xs text-cream">
              <span className="text-lg">✅</span> Acesso irrestrito ao sistema
            </div>
          </div>
        </div>
      </Card>
    </div>

  );
}

