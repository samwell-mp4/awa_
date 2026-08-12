import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Loader2, Volume2, User, Globe } from "lucide-react";
import { toast } from "sonner";
import { getUserSettings, updateUserSettings } from "@/lib/user-settings.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const getSettings = useServerFn(getUserSettings);
  const updateSettings = useServerFn(updateUserSettings);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => getSettings(),
  });

  const mutation = useMutation({
    mutationFn: (newSettings: any) => updateSettings({ data: newSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success(t("settings.saved", "Configurações salvas com sucesso!"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("settings.error", "Erro ao salvar configurações."));
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-forest)]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      voice_model: formData.get("voice_model"),
      assistant_name: formData.get("assistant_name"),
      language: formData.get("language"),
      respostas_em_voz: formData.get("respostas_em_voz") === "on",
    };
    mutation.mutate(data);

  };

  const safeSettings = (settings || {}) as any;

  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] pb-12">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.16_0.04_145/0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/minha-conta"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold/90 hover:text-gold transition"
          >
            <ArrowLeft className="h-4 w-4" /> {t("common.back", "Voltar")}
          </Link>
          <h1 className="font-display text-lg font-black text-cream">
            {t("settings.title", "Configurações")}
          </h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-2xl px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Model Section */}
          <section className="rounded-3xl border border-gold/20 bg-card/40 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cream">
                  {t("settings.voiceModel", "Modelo de Voz")}
                </h2>
                <p className="text-xs text-foreground/60">
                  {t("settings.voiceModelDesc", "Escolha a inteligência por trás do áudio")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Equilíbrio entre rapidez e qualidade (Padrão)" },
                { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Modelo clássico e estável" },
                { id: "openai/tts-1-hd", name: "OpenAI TTS HD", desc: "Voz ultra-realista de alta definição" },
              ].map((model) => (
                <label
                  key={model.id}
                  className="relative flex cursor-pointer items-start gap-4 rounded-2xl border border-gold/10 bg-forest-deep/30 p-4 transition hover:border-gold/30"
                >
                  <input
                    type="radio"
                    name="voice_model"
                    value={model.id}
                    defaultChecked={safeSettings.voice_model === model.id}
                    className="mt-1 h-4 w-4 border-gold/40 bg-transparent text-gold focus:ring-gold/20"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-cream">{model.name}</div>
                    <div className="text-[11px] text-foreground/50">{model.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
117: 
118:           {/* Respostas em Voz Switch */}
119:           <section className="rounded-3xl border border-gold/20 bg-card/40 p-6 backdrop-blur-md">
120:             <div className="flex items-center justify-between gap-3">
121:               <div className="flex items-center gap-3">
122:                 <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold">
123:                   <Volume2 className="h-5 w-5" />
124:                 </div>
125:                 <div>
126:                   <h2 className="text-base font-bold text-cream">
127:                     {t("settings.voiceResponses", "Respostas em Voz")}
128:                   </h2>
129:                   <p className="text-xs text-foreground/60">
130:                     {t("settings.voiceResponsesDesc", "Ativar narração automática do assistente")}
131:                   </p>
132:                 </div>
133:               </div>
134:               <label className="relative inline-flex cursor-pointer items-center">
135:                 <input
136:                   type="checkbox"
137:                   name="respostas_em_voz"
138:                   defaultChecked={safeSettings.respostas_em_voz !== false}
139:                   className="peer sr-only"
140:                 />
141:                 <div className="peer h-6 w-11 rounded-full bg-forest-deep/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gold/20 after:bg-cream after:transition-all after:content-[''] peer-checked:bg-gold peer-checked:after:translate-x-full peer-checked:after:border-white focus:outline-none"></div>
142:               </label>
143:             </div>
144:           </section>


          {/* Assistant Name Section */}
          <section className="rounded-3xl border border-gold/20 bg-card/40 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cream">
                  {t("settings.assistant", "Assistente Virtual")}
                </h2>
                <p className="text-xs text-foreground/60">
                  {t("settings.assistantDesc", "Como você quer chamar seu mestre virtual")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gold/80">
                {t("settings.assistantName", "Nome do Assistente")}
              </label>
              <input
                type="text"
                name="assistant_name"
                defaultValue={safeSettings.assistant_name}
                placeholder="Ex: Professor Akuã"
                className="w-full rounded-2xl border border-gold/25 bg-forest-deep/30 px-4 py-3 text-sm text-cream placeholder:text-foreground/30 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </section>

          {/* Language Section */}
          <section className="rounded-3xl border border-gold/20 bg-card/40 p-6 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cream">
                  {t("settings.language", "Idioma Preferencial")}
                </h2>
                <p className="text-xs text-foreground/60">
                  {t("settings.languageDesc", "Idioma das explicações e interface")}
                </p>
              </div>
            </div>

            <select
              name="language"
              defaultValue={safeSettings.language}
              className="w-full rounded-2xl border border-gold/25 bg-forest-deep/30 px-4 py-3 text-sm text-cream focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (United States)</option>
              <option value="es-ES">Español (España)</option>
              <option value="pat">Patxôhã (Pataxó)</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-display text-base font-black uppercase text-forest-deep shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {t("settings.save", "Salvar Configurações")}
          </button>
        </form>
      </main>
    </div>
  );
}
