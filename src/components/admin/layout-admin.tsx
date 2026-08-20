import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig, updateSiteConfig } from "@/lib/admin-layout.functions";
import { toast } from "sonner";
import { Save, Layout, Image as ImageIcon, Palette, Plus, Trash2, Sparkles, Video, Globe, Type, FileText, Languages, KeyRound, Shield, Layers } from "lucide-react";
import { Field, Input, Btn, Card, Textarea } from "./ui";
import { TemplatesAdmin } from "./templates-admin";


export function LayoutAdmin() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSiteConfig);
  const updateFn = useServerFn(updateSiteConfig);
  const [activeTab, setActiveTab] = useState<"landing" | "adulto" | "infantil" | "legendas" | "experiencia" | "conteudo" | "acesso" | "templates">("landing");


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

  const { data: menuHamb = {}, isLoading: loadingMenuHamb } = useQuery({
    queryKey: ["site_config", "menu_hamburguer"],
    queryFn: () => getFn({ data: "menu_hamburguer" }),
  });

  const [hotspotsDraft, setHotspotsDraft] = useState<any[]>([]);
  const [brandingDraft, setBrandingDraft] = useState<any>({});
  const [heroDraft, setHeroDraft] = useState<any>({});
  const [adultHeroDraft, setAdultHeroDraft] = useState<any>({});
  const [menuHambDraft, setMenuHambDraft] = useState<any>({});


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

  useEffect(() => {
    if (menuHamb) setMenuHambDraft(menuHamb);
  }, [menuHamb]);


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
      <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit overflow-x-auto max-w-full no-scrollbar">
        {[
          { id: "landing", label: "Aparência", icon: Palette },
          { id: "adulto", label: "Área Adulto", icon: Palette },
          { id: "infantil", label: "Área Infantil", icon: Sparkles },
          { id: "legendas", label: "Música & Design", icon: Type },
          { id: "conteudo", label: "Conteúdo", icon: FileText },
          { id: "templates", label: "Modelos de Telas", icon: Layers },
          { id: "acesso", label: "Segurança", icon: KeyRound },
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
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <ImageIcon className="h-5 w-5 text-gold" /> Logo & Vídeos Globais
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
            <Btn className="mt-6" onClick={() => saveConfig("branding", brandingDraft, "Branding Global")}>
              <Save className="h-4 w-4" /> Salvar Branding
            </Btn>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Palette className="h-5 w-5 text-gold" /> Tela de Fundo (Landing)
            </h3>
            <Field label="URL Imagem de Fundo (Desktop)">
              <Input 
                value={heroDraft.bg_url || ""} 
                onChange={e => setHeroDraft({...heroDraft, bg_url: e.target.value})}
              />
            </Field>
            <Btn className="mt-6" onClick={() => saveConfig("landing_hero", heroDraft, "Fundo da Landing")}>
              <Save className="h-4 w-4" /> Salvar Fundo
            </Btn>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Plus className="h-5 w-5 text-gold" /> Menu Lateral (Hambúrguer)
            </h3>
            <div className="space-y-4">
              <Field label="Título do Menu">
                <Input 
                  value={menuHambDraft.title || ""} 
                  onChange={e => setMenuHambDraft({...menuHambDraft, title: e.target.value})}
                />
              </Field>
              <Field label="Rodapé do Menu">
                <Input 
                  value={menuHambDraft.footer || ""} 
                  onChange={e => setMenuHambDraft({...menuHambDraft, footer: e.target.value})}
                />
              </Field>
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("menu_hamburguer", menuHambDraft, "Menu Hamburguer")}>
              <Save className="h-4 w-4" /> Salvar Menu Lateral
            </Btn>
          </Card>
        </div>
      )}


      {activeTab === "adulto" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Branding Section */}
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <ImageIcon className="h-5 w-5 text-gold" /> Identidade Visual Adulto
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
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
            <Btn className="mt-6" onClick={() => saveConfig("branding", brandingDraft, "Identidade Visual Adulto")}>
              <Save className="h-4 w-4" /> Salvar Branding Adulto
            </Btn>
          </Card>

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
          {/* Branding Section */}
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <ImageIcon className="h-5 w-5 text-gold" /> Identidade Visual Infantil
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
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("branding", brandingDraft, "Identidade Visual Infantil")}>
              <Save className="h-4 w-4" /> Salvar Branding Infantil
            </Btn>
          </Card>

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

      {activeTab === "templates" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Layers className="h-5 w-5 text-gold" /> Modelos de Telas (Layouts)
            </h3>
            <p className="text-xs text-foreground/60 mb-6">
              Escolha entre diferentes estilos visuais para as áreas do aplicativo. Cada modelo altera a estrutura e o design da página.
            </p>
            
            <div className="space-y-12">
              <section>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/80 mb-4 border-b border-gold/10 pb-2">Área Adulto</h4>
                <TemplatesAdmin category="adulto" />
              </section>

              <section>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/80 mb-4 border-b border-gold/10 pb-2">Área Infantil</h4>
                <TemplatesAdmin category="infantil" />
              </section>

              <section>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/80 mb-4 border-b border-gold/10 pb-2">Música & Design</h4>
                <TemplatesAdmin category="musicas" />
              </section>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "legendas" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Type className="h-5 w-5 text-gold" /> Música & Design (Legendas)
            </h3>
            <p className="text-xs text-foreground/60 mb-6">
              Ajuste o tamanho das fontes das legendas para o modo normal e maximizado (tela cheia).
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/80">Modo Normal</h4>
                <Field label="Texto Principal (Tamanho)">
                  <Input 
                    placeholder="Ex: text-base, text-lg, text-xl"
                    value={brandingDraft.caption_normal_size || ""} 
                    onChange={e => setBrandingDraft({...brandingDraft, caption_normal_size: e.target.value})}
                  />
                </Field>
                <Field label="Tradução (Tamanho)">
                  <Input 
                    placeholder="Ex: text-xs, text-sm"
                    value={brandingDraft.caption_normal_subsize || ""} 
                    onChange={e => setBrandingDraft({...brandingDraft, caption_normal_subsize: e.target.value})}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold/80">Modo Maximizado</h4>
                <Field label="Texto Principal (Tamanho)">
                  <Input 
                    placeholder="Ex: text-3xl md:text-5xl"
                    value={brandingDraft.caption_max_size || ""} 
                    onChange={e => setBrandingDraft({...brandingDraft, caption_max_size: e.target.value})}
                  />
                </Field>
                <Field label="Tradução (Tamanho)">
                  <Input 
                    placeholder="Ex: text-xl md:text-3xl"
                    value={brandingDraft.caption_max_subsize || ""} 
                    onChange={e => setBrandingDraft({...brandingDraft, caption_max_subsize: e.target.value})}
                  />
                </Field>
              </div>
            </div>

            <Btn className="mt-8" onClick={() => saveConfig("branding", brandingDraft, "Tamanho das Legendas")}>
              <Save className="h-4 w-4" /> Salvar Tamanhos
            </Btn>
          </Card>

          <Card className="bg-emerald-950/40 border-emerald-500/20">
            <h4 className="font-display font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Dica de Estilo
            </h4>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Use classes do Tailwind como <code className="text-gold">text-2xl</code> ou variantes responsivas como <code className="text-gold">text-2xl md:text-4xl</code>. 
              As alterações serão aplicadas instantaneamente no player de cantigas infantis.
            </p>
          </Card>
        </div>
      )}

      {activeTab === "conteudo" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <FileText className="h-5 w-5 text-gold" /> Textos Principais (Landing)
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título (Linha 1)">
                  <Input value={heroDraft.h1a || ""} onChange={e => setHeroDraft({...heroDraft, h1a: e.target.value})} />
                </Field>
                <Field label="Título (Destaque Gold)">
                  <Input value={heroDraft.h1b || ""} onChange={e => setHeroDraft({...heroDraft, h1b: e.target.value})} />
                </Field>
              </div>
              <Field label="Descrição / Lead">
                <Textarea value={heroDraft.lead || ""} onChange={e => setHeroDraft({...heroDraft, lead: e.target.value})} />
              </Field>
              <Field label="Texto Botão Login">
                <Input value={heroDraft.entrar_label || ""} onChange={e => setHeroDraft({...heroDraft, entrar_label: e.target.value})} />
              </Field>
            </div>
            <Btn className="mt-6" onClick={() => saveConfig("landing_hero", heroDraft, "Textos Landing")}>
              <Save className="h-4 w-4" /> Salvar Textos
            </Btn>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Languages className="h-5 w-5 text-gold" /> Idiomas & Traduções
            </h3>
            <p className="text-xs text-foreground/60 mb-4">Gerencie as traduções automáticas e mapeamento de idiomas do sistema.</p>
            <div className="flex flex-wrap gap-2">
              {["Português", "English", "Español", "Patxôhã"].map(l => (
                <span key={l} className="px-3 py-1 rounded-full bg-forest-deep/60 border border-gold/20 text-[10px] font-bold text-gold uppercase">{l}</span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "acesso" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-black text-cream">Acesso Administrativo Externo</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  Configure o login via Google (Gmail) ou credenciais de emergência para acesso rápido.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream mb-4">
              <Shield className="h-5 w-5 text-gold" /> Configurações de Segurança
            </h3>
            
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Usuário de Emergência">
                  <Input 
                    value={menuHambDraft.emergency_user || ""} 
                    onChange={e => setMenuHambDraft({...menuHambDraft, emergency_user: e.target.value})}
                    placeholder="Padrão: admin"
                  />
                </Field>
                <Field label="Senha de Emergência">
                  <Input 
                    type="password"
                    value={menuHambDraft.emergency_pass || ""} 
                    onChange={e => setMenuHambDraft({...menuHambDraft, emergency_pass: e.target.value})}
                    placeholder="Padrão: awa2026"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-forest-deep/40 border border-gold/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${menuHambDraft.auto_google_login ? 'bg-gold/20 text-gold' : 'bg-neutral-500/20 text-neutral-400'}`}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-cream">Entrar automaticamente com Google (OAuth)</div>
                    <div className="text-xs text-foreground/60">Pula a tela de login se você já estiver logado no Google e for admin.</div>
                  </div>
                </div>
                <button
                  onClick={() => setMenuHambDraft({...menuHambDraft, auto_google_login: !menuHambDraft.auto_google_login})}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${menuHambDraft.auto_google_login ? 'bg-gold' : 'bg-neutral-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${menuHambDraft.auto_google_login ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <Btn className="mt-8" onClick={() => saveConfig("menu_hamburguer", menuHambDraft, "Segurança & Acesso")}>
              <Save className="h-4 w-4" /> Salvar Configurações
            </Btn>
          </Card>
        </div>
      )}


    </div>

  );
}

