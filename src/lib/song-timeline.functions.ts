import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RangeSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string().optional(),
  translation: z.string().optional(),
});

const SaveInputSchema = z.object({
  songId: z.string(),
  songTitle: z.string(),
  duration: z.number(),
  ranges: z.array(RangeSchema),
});

export type SaveSongTimelineInput = z.infer<typeof SaveInputSchema>;

export const saveSongTimelineToCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveInputSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");

      const cwd = process.cwd();
      const targetFilePath = path.resolve(cwd, "src/data/songs-timeline-data.ts");

      // Read existing file content
      let existingContent = "";
      try {
        existingContent = fs.readFileSync(targetFilePath, "utf-8");
      } catch {
        existingContent = "";
      }

      // Parse current object from file
      let currentData: Record<string, any> = {};
      const match = existingContent.match(
        /export const SONGS_TIMELINE_DATA:[^=]*=\s*(\{[\s\S]*\});\s*$/
      );
      if (match && match[1]) {
        try {
          const fn = new Function(`return (${match[1]});`);
          currentData = fn() || {};
        } catch {
          currentData = {};
        }
      }

      // Update entry for this song
      currentData[data.songId] = {
        id: data.songId,
        title: data.songTitle,
        duration: data.duration,
        ranges: data.ranges,
        updatedAt: new Date().toISOString(),
      };

      // Also index by normalized title key so it can be resolved by title
      const normalizedKey = data.songTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

      if (normalizedKey) {
        currentData[`title_${normalizedKey}`] = {
          id: data.songId,
          title: data.songTitle,
          duration: data.duration,
          ranges: data.ranges,
          updatedAt: new Date().toISOString(),
        };

        // Aliases para variações comuns como "tava lá dentro" vs "tava dentro"
        const altKey = normalizedKey.includes("tavaladentrodamata")
          ? normalizedKey.replace("tavaladentrodamata", "tavadentrodamata")
          : normalizedKey.includes("tavadentrodamata")
          ? normalizedKey.replace("tavadentrodamata", "tavaladentrodamata")
          : null;

        if (altKey) {
          currentData[`title_${altKey}`] = {
            id: data.songId,
            title: data.songTitle,
            duration: data.duration,
            ranges: data.ranges,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // Generate updated file content
      const newFileContent = `/**
 * Registro de Sincronização e Linha do Tempo das Músicas (Salvo Diretamente no Código).
 *
 * Este arquivo é atualizado automaticamente pelo Editor de Timeline.
 * Cada música contém a lista de versos com segundo de início e fim.
 */

export interface SavedSongRange {
  start: number;
  end: number;
  text?: string;
  translation?: string;
}

export interface SavedSongTimeline {
  id: string;
  title: string;
  duration: number;
  ranges: SavedSongRange[];
  updatedAt: string;
}

export const SONGS_TIMELINE_DATA: Record<string, SavedSongTimeline> = ${JSON.stringify(
        currentData,
        null,
        2
      )};
`;

      fs.writeFileSync(targetFilePath, newFileContent, "utf-8");

      return {
        success: true,
        savedSongId: data.songId,
        savedRangesCount: data.ranges.length,
        filePath: "src/data/songs-timeline-data.ts",
      };
    } catch (err: any) {
      console.error("[saveSongTimelineToCode] Error:", err);
      throw new Error(`Erro ao salvar no código: ${err.message || String(err)}`);
    }
  });
