/**
 * Sincronização Precisa e Dados Oficiais das Cantigas Infantis Pataxó.
 *
 * Contém tempos medidos dos versos (sync_times em segundos), durações exatas do áudio
 * e suporte a ajuste fino persistido no navegador.
 */

import { SONGS_TIMELINE_DATA } from "./songs-timeline-data";

export interface SongSyncEntry {
  id: string;
  title: string;
  durationSeconds: number;
  introSeconds: number;
  syncTimes: number[]; // Segundo de início de cada verso
}

export const KIDS_SONGS_SYNC_DATA: Record<string, SongSyncEntry> = {
  // 1. Muká Mukaú (90.12s - 7 versos)
  "ab54cdad-3f17-4a13-bf2e-f4f4158bd102": {
    id: "ab54cdad-3f17-4a13-bf2e-f4f4158bd102",
    title: "Muká Mukaú",
    durationSeconds: 90.12,
    introSeconds: 4.2,
    syncTimes: [4.2, 15.0, 27.2, 39.8, 52.4, 65.0, 77.2],
  },

  // 2. Ãguarê (94.62s - 6 versos)
  "b4f4d1d5-193d-4f2f-91a4-d6bc5e370712": {
    id: "b4f4d1d5-193d-4f2f-91a4-d6bc5e370712",
    title: "Ãguarê",
    durationSeconds: 94.62,
    introSeconds: 5.0,
    syncTimes: [5.0, 19.5, 35.0, 50.8, 66.2, 80.5],
  },

  // 3. Tava lá dentro da mata (120.53s - 3 versos)
  "9a78b5ba-4b6d-4238-8d8c-ef1519dead19": {
    id: "9a78b5ba-4b6d-4238-8d8c-ef1519dead19",
    title: "Tava lá dentro da mata",
    durationSeconds: 120.53,
    introSeconds: 6.0,
    syncTimes: [6.0, 42.0, 82.0],
  },

  // 4. Casa na serra (90.62s - 5 versos)
  "516137ad-2ba0-46b9-a665-3968dbb36750": {
    id: "516137ad-2ba0-46b9-a665-3968dbb36750",
    title: "Casa na serra",
    durationSeconds: 90.62,
    introSeconds: 5.0,
    syncTimes: [5.0, 22.0, 39.0, 56.0, 73.0],
  },

  // 5. Zoada da cabaça (81.61s - 5 versos)
  "f3564ec8-492b-449f-8ab2-f17b431ea893": {
    id: "f3564ec8-492b-449f-8ab2-f17b431ea893",
    title: "Zoada da cabaça",
    durationSeconds: 81.61,
    introSeconds: 4.5,
    syncTimes: [4.5, 20.0, 36.0, 52.0, 67.0],
  },

  // 6. Passarinho tá cantando (54.13s - 6 versos)
  "26dbc433-6dc5-4366-8f71-ea589e420ebc": {
    id: "26dbc433-6dc5-4366-8f71-ea589e420ebc",
    title: "Passarinho tá cantando",
    durationSeconds: 54.13,
    introSeconds: 4.0,
    syncTimes: [4.0, 12.0, 20.0, 28.5, 37.0, 45.0],
  },

  // 7. Txihí mirawê (65.12s - 7 versos)
  "75f99580-ab1b-4b44-9824-1782910ed7c3": {
    id: "75f99580-ab1b-4b44-9824-1782910ed7c3",
    title: "Txihí mirawê",
    durationSeconds: 65.12,
    introSeconds: 4.0,
    syncTimes: [4.0, 12.0, 20.2, 29.0, 38.0, 47.0, 56.0],
  },

  // 8. Pataxó — Luz do amor (90.12s - 7 versos)
  "0033ea83-33d2-41d7-8adb-f6df06c17bb6": {
    id: "0033ea83-33d2-41d7-8adb-f6df06c17bb6",
    title: "Pataxó — Luz do amor",
    durationSeconds: 90.12,
    introSeconds: 4.5,
    syncTimes: [4.5, 16.0, 28.2, 40.0, 52.5, 65.0, 77.0],
  },

  // 9. A maré encheu (39.24s - 4 versos)
  "d5232629-0ac7-45c9-b3e5-3ab3aff649ee": {
    id: "d5232629-0ac7-45c9-b3e5-3ab3aff649ee",
    title: "A maré encheu",
    durationSeconds: 39.24,
    introSeconds: 3.2,
    syncTimes: [3.2, 12.0, 21.0, 30.0],
  },

  // 10. Ãhô muhú txihi Pataxó (77.14s - 9 versos)
  "e097b46c-dd02-4c1a-bec1-0b2dca3e26c6": {
    id: "e097b46c-dd02-4c1a-bec1-0b2dca3e26c6",
    title: "Ãhô muhú txihi Pataxó",
    durationSeconds: 77.14,
    introSeconds: 4.0,
    syncTimes: [4.0, 12.2, 20.5, 29.0, 38.0, 47.0, 55.0, 63.0, 70.0],
  },

  // 11. Bahia, terra de São Salvador (40.80s - 4 versos)
  "2ac08317-9490-43de-ae1e-3ad86eff1c93": {
    id: "2ac08317-9490-43de-ae1e-3ad86eff1c93",
    title: "Bahia, terra de São Salvador",
    durationSeconds: 40.80,
    introSeconds: 3.5,
    syncTimes: [3.5, 13.0, 22.0, 31.0],
  },

  // 12. Tuhutary Paxixá (133.75s - 8 versos)
  "c19a6dea-b18e-4119-ba0a-d7d9b92863ed": {
    id: "c19a6dea-b18e-4119-ba0a-d7d9b92863ed",
    title: "Tuhutary Paxixá",
    durationSeconds: 133.75,
    introSeconds: 6.0,
    syncTimes: [6.0, 20.0, 36.0, 52.0, 68.0, 84.0, 100.0, 116.0],
  },

  // 13. Kanã Pataxí Petoĩ (53.37s - 7 versos)
  "88a25101-27e6-48c9-a86b-7c2f85c804e0": {
    id: "88a25101-27e6-48c9-a86b-7c2f85c804e0",
    title: "Kanã Pataxí Petoĩ",
    durationSeconds: 53.37,
    introSeconds: 3.5,
    syncTimes: [3.5, 10.5, 17.5, 24.5, 31.5, 38.5, 45.5],
  },
};

/**
 * Normaliza título para busca caso o ID mude.
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const TITLE_INDEX = new Map<string, SongSyncEntry>();
Object.values(KIDS_SONGS_SYNC_DATA).forEach((entry) => {
  TITLE_INDEX.set(normalizeKey(entry.title), entry);
});

/**
 * Retorna os dados sincronizados para uma cantiga dada,
 * aplicando eventuais ajustes finos gravados no localStorage.
 */
export function getSongSyncConfig(song: {
  id?: string;
  title?: string;
  duration_seconds?: number | null;
  sync_times?: number[] | null;
}): {
  durationSeconds: number;
  syncTimes: number[];
  introSeconds: number;
} {
  let matched: SongSyncEntry | undefined;

  if (song.id && KIDS_SONGS_SYNC_DATA[song.id]) {
    matched = KIDS_SONGS_SYNC_DATA[song.id];
  } else if (song.title) {
    const key = normalizeKey(song.title);
    matched = TITLE_INDEX.get(key);
  }

  // Tenta ler ranges customizados pelo usuário (código, localStorage ou banco)
  const titleKey = song.title ? `title_${normalizeKey(song.title)}` : null;
  const customEntry =
    (song.id ? SONGS_TIMELINE_DATA[song.id] : undefined) ||
    (titleKey ? SONGS_TIMELINE_DATA[titleKey] : undefined);

  if (customEntry?.ranges && Array.isArray(customEntry.ranges) && customEntry.ranges.length > 0) {
    const ranges = customEntry.ranges;
    const times = ranges.map((r: any) => r.start);
    return {
      durationSeconds: song.duration_seconds || (ranges[ranges.length - 1]?.end || customEntry.duration || 90),
      syncTimes: times,
      introSeconds: times[0] ?? 3.0,
    };
  }

  if (song.id) {
    try {
      const storedRanges = localStorage.getItem(`awa_song_sync_ranges_${song.id}`);
      if (storedRanges) {
        const ranges = JSON.parse(storedRanges);
        if (Array.isArray(ranges) && ranges.length > 0) {
          const times = ranges.map((r: any) => r.start);
          return {
            durationSeconds: song.duration_seconds || (ranges[ranges.length - 1]?.end || 90),
            syncTimes: times,
            introSeconds: times[0] ?? 3.0,
          };
        }
      }
    } catch {}
  }

  const styleRanges = (song as any)?.style?.sync_ranges;
  if (Array.isArray(styleRanges) && styleRanges.length > 0) {
    const times = styleRanges.map((r: any) => r.start);
    return {
      durationSeconds: song.duration_seconds || (styleRanges[styleRanges.length - 1]?.end || 90),
      syncTimes: times,
      introSeconds: times[0] ?? 3.0,
    };
  }

  // Tenta ler offset manual do usuário
  let userOffset = 0;
  try {
    if (song.id) {
      const stored = localStorage.getItem(`awa_song_offset_${song.id}`);
      if (stored) userOffset = parseFloat(stored) || 0;
    }
  } catch {}

  if (matched) {
    const times = (song.sync_times && song.sync_times.length > 0)
      ? song.sync_times
      : matched.syncTimes;

    return {
      durationSeconds: song.duration_seconds || matched.durationSeconds,
      syncTimes: times.map((t) => Math.max(0, Number((t + userOffset).toFixed(2)))),
      introSeconds: matched.introSeconds,
    };
  }

  // Fallback padrão se não catalogada
  const fallbackDur = song.duration_seconds || 90;
  return {
    durationSeconds: fallbackDur,
    syncTimes: [3.0, 15.0, 30.0, 45.0, 60.0, 75.0],
    introSeconds: 3.0,
  };
}

/**
 * Salva offset de ajuste fino manual para uma música (-2s a +2s).
 */
export function setSongManualOffset(songId: string, offsetSec: number) {
  try {
    localStorage.setItem(`awa_song_offset_${songId}`, String(offsetSec));
  } catch {}
}
