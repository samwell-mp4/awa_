import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTemplates } from "@/lib/templates.functions";
import { getSiteConfig } from "@/lib/admin-layout.functions";

export function useActiveTemplate(category: "adulto" | "infantil" | "musicas") {
  const getTemplatesFn = useServerFn(getTemplates);
  const getConfigFn = useServerFn(getSiteConfig);

  const { data: templates = [] } = useQuery({
    queryKey: ["ui_templates", category],
    queryFn: () => getTemplatesFn({ data: category }),
  });

  const { data: activeName } = useQuery({
    queryKey: ["site_config", `active_template_${category}`],
    queryFn: () => getConfigFn({ data: `active_template_${category}` }),
  });

  const active = templates.find((t: any) => t.name === activeName) || templates[0];
  
  return {
    template: active,
    config: active?.config || {},
    style: active?.config?.style || "default"
  };
}
