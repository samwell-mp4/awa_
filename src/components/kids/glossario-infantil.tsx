import { speak } from "@/lib/speak";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";
import { TTSSubtitles } from "@/components/TTSSubtitles";
import { useState } from "react";


interface GlossaryItem {
  patxoha: string;
  portugues: string;
  audioId: string;
}

const GLOSSARY_DATA: { category: string; items: GlossaryItem[] }[] = [
  {
    category: "common.trailSaudacoes",
    items: [
      { patxoha: "AWÃ", portugues: "VIDA", audioId: "awa-vida" },
      { patxoha: "KIRIRI", portugues: "OLÁ / SAUDAÇÃO", audioId: "kiriri" },
    ],
  },
  {
    category: "common.trailNatureza",
    items: [
      { patxoha: "ÉHÉ", portugues: "TERRA", audioId: "ehe-terra" },
      { patxoha: "KÍRIRI", portugues: "SOL", audioId: "kiriri-sol" },
      { patxoha: "WÁ", portugues: "ÁGUA", audioId: "wa-agua" },
    ],
  },
  {
    category: "common.trailFamilia",
    items: [
      { patxoha: "AWÁ", portugues: "PESSOA / GENTE", audioId: "awa-pessoa" },
      { patxoha: "TUPÃ", portugues: "GRANDE ESPÍRITO", audioId: "tupa" },
    ],
  },
  {
    category: "common.trailAnimais",
    items: [
      { patxoha: "KÃ-KÃ", portugues: "PASSARO", audioId: "ka-ka" },
      { patxoha: "YACÁ", portugues: "CÃO", audioId: "yaca-cao" },
    ],
  },
];

export function GlossarioInfantil() {
  const { t } = useTranslation();
  const [activeCharIndex, setActiveCharIndex] = useState<{ [key: string]: number }>({});

  const handlePlay = (item: GlossaryItem) => {
    speak(
      `${item.patxoha}. ${item.portugues}`,
      "pt-BR",
      1,
      () => setActiveCharIndex((prev) => ({ ...prev, [item.audioId]: 0 })),
      () => setActiveCharIndex((prev) => ({ ...prev, [item.audioId]: -1 })),
      (idx) => setActiveCharIndex((prev) => ({ ...prev, [item.audioId]: idx }))
    );
  };


  return (
    <div className="mt-8 space-y-6">
      {GLOSSARY_DATA.map((group) => (
        <div key={group.category} className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-emerald-800/60">
            {t(group.category)}
          </h3>
          <div className="grid gap-3">
            {group.items.map((item) => (
              <button
                key={item.audioId}
                onClick={() => handlePlay(item)}
                className="flex flex-col items-stretch rounded-2xl border-l-[6px] border-[#8B4513] bg-[#f8f2e9] p-4 text-left transition active:scale-[0.98] shadow-sm hover:bg-[#f0e8dc]"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex flex-col">
                    <span className="font-display text-xl font-black text-[#603000]">
                      {item.patxoha}
                    </span>
                    <span className="text-base font-bold text-[#254117]">
                      {item.portugues}
                    </span>
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#8B4513] text-white shadow-md">
                    <Volume2 className="h-5 w-5" />
                  </div>
                </div>
                {activeCharIndex[item.audioId] !== undefined && activeCharIndex[item.audioId] >= 0 && (
                  <TTSSubtitles 
                    text={`${item.patxoha}. ${item.portugues}`} 
                    charIndex={activeCharIndex[item.audioId]} 
                    className="bg-[#8B4513]/10 border-[#8B4513]/20"
                    activeColor="text-[#8B4513]"
                    inactiveColor="text-[#8B4513]/40"
                  />
                )}

              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
