import { Award } from "lucide-react";
import { rankingSeed } from "@/lib/home-content";

export function RankingCard() {
  return (
    <div className="card-elev rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
          <Award className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-black text-cream">
          Top aprendizes da semana
        </h3>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {rankingSeed.map((u) => (
          <li
            key={u.name}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-gold/20 bg-card/60 px-3 py-2.5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf/25 text-xs font-bold text-cream">
              {u.initials}
            </span>
            <span className="truncate text-sm font-semibold text-cream">{u.name}</span>
            <span className="text-xs font-bold text-gold">{u.points} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
