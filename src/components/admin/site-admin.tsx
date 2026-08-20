import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Sparkles, MessageSquare, Volume2, Languages, ArrowLeftRight } from "lucide-react";
import { Field, Input, Textarea, Btn, Card } from "./ui";

export function SiteAdmin() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "professor" | "tradutor">("overview");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: "overview", label: "Geral", icon: Sparkles },
          { id: "professor", label: "Professor Akuã", icon: MessageSquare },
          { id: "tradutor", label: "Tradutor", icon: Languages },
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

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "professor" && <ProfessorAdmin />}
      {activeTab === "tradutor" && <TradutorAdmin />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-black text-cream">Gestão de Inteligência Artificial</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Configure as instruções e comportamentos do Professor Akuã e do Tradutor Automático.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <MessageSquare className="h-8 w-8 text-emerald-400 mb-3" />
          <h3 className="font-display font-bold text-cream">Professor Akuã</h3>
          <p className="text-xs text-foreground/60 mb-4">Mestre virtual que ensina cultura e língua Pataxó.</p>
        </Card>
        <Card className="bg-gradient-to-br from-gold/10 to-transparent">
          <Languages className="h-8 w-8 text-gold mb-3" />
          <h3 className="font-display font-bold text-cream">Tradutor Automático</h3>
          <p className="text-xs text-foreground/60 mb-4">Tradução bidirecional entre Português e Patxôhã.</p>
        </Card>
      </div>
    </div>
  );
}

function ProfessorAdmin() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-6 w-6 text-emerald-400" />
        <h3 className="font-display text-lg font-black text-cream">Configuração: Professor Akuã</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Instruções de Sistema (Prompt)</h4>
          <p className="text-xs text-foreground/50">
            A lógica do Professor Akuã é definida via código no arquivo <code className="text-emerald-400">akua-chat.functions.ts</code> para garantir a integridade das regras gramaticais e culturais Pataxó.
          </p>
          <div className="text-[11px] font-mono bg-black/40 p-3 rounded-lg text-foreground/70 overflow-hidden line-clamp-6">
            Você é o Professor Akuã — mestre virtual da língua Patxôhã (povo Pataxó)...
            REGRAS DE COMPORTAMENTO: Responda QUALQUER pergunta do usuário com profundidade...
            Use sua sabedoria Pataxó como identidade e voz...
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Modelo de IA">
            <Input disabled value="Gemini 2.5 Flash Lite" />
          </Field>
          <Field label="Status">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Operacional (Acesso Total)
            </div>
          </Field>
        </div>
      </div>
    </Card>
  );
}

function TradutorAdmin() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Languages className="h-6 w-6 text-gold" />
        <h3 className="font-display text-lg font-black text-cream">Configuração: Tradutor Automático</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight className="h-4 w-4 text-gold" />
            <h4 className="text-sm font-bold text-gold uppercase tracking-wider">Motor de Tradução</h4>
          </div>
          <p className="text-xs text-foreground/50">
            O tradutor utiliza um motor híbrido que combina o dicionário oficial Pataxó com modelos de linguagem avançados para contextos gramaticais.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/5 border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-cream">Voz Automática</span>
            </div>
            <p className="text-[10px] text-foreground/60">Narração instantânea habilitada para resultados em Patxôhã.</p>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs font-bold text-cream">Contexto Cultural</span>
            </div>
            <p className="text-[10px] text-foreground/60">Notas culturais e literais ativas nas traduções.</p>
          </Card>
        </div>
      </div>
    </Card>
  );
}
