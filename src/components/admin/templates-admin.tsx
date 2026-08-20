import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTemplates, setActiveTemplate } from "@/lib/templates.functions";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { toast } from "sonner";
import { Check, Layout, Loader2, Sparkles } from "lucide-react";
import { Btn, Card } from "./ui";

interface TemplatesAdminProps {
  category: "adulto" | "infantil" | "musicas";
}

export function TemplatesAdmin({ category }: TemplatesAdminProps) {
  const qc = useQueryClient();
  const getTemplatesFn = useServerFn(getTemplates);
  const setTemplateFn = useServerFn(setActiveTemplate);
  const getConfigFn = useServerFn(getSiteConfig);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["ui_templates", category],
    queryFn: () => getTemplatesFn({ data: category }),
  });

  const { data: activeTemplateName } = useQuery({
    queryKey: ["site_config", `active_template_${category}`],
    queryFn: () => getConfigFn({ data: `active_template_${category}` }),
  });

  async function applyTemplate(name: string) {
    try {
      await setTemplateFn({ data: { category, templateName: name } });
      toast.success(`Modelo "${name}" aplicado com sucesso!`);
      qc.invalidateQueries({ queryKey: ["site_config", `active_template_${category}`] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t: any) => {
          const isActive = activeTemplateName === t.name;
          return (
            <Card key={t.id} className={`relative overflow-hidden transition-all ${isActive ? 'ring-2 ring-gold border-gold/50' : 'hover:border-white/20'}`}>
              <div className="aspect-video w-full bg-black/40 relative group">
                {t.preview_url ? (
                  <img src={t.preview_url} alt={t.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-foreground/20">
                    <Layout className="h-12 w-12" />
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                    <div className="bg-gold text-forest-deep px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                      <Check className="h-3 w-3" /> Ativo
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="font-display font-bold text-cream mb-1">{t.name}</h4>
                <p className="text-[10px] text-foreground/50 uppercase tracking-widest mb-4">
                  {category === 'adulto' ? 'Área Adulto' : category === 'infantil' ? 'Área Infantil' : 'Player de Música'}
                </p>
                
                <Btn 
                  variant={isActive ? "outline" : "primary"} 
                  className="w-full text-xs py-2"
                  disabled={isActive}
                  onClick={() => applyTemplate(t.name)}
                >
                  {isActive ? "Modelo Atual" : "Aplicar Modelo"}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
          <Sparkles className="h-8 w-8 text-gold/20 mx-auto mb-3" />
          <p className="text-foreground/50">Nenhum modelo customizado disponível para esta categoria.</p>
        </div>
      )}
    </div>
  );
}
