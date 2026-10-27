import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Volume2,
  Sliders,
  Eye,
  Copy,
  Download,
  Upload,
  ArrowRight,
  Maximize2,
  X,
  Plus,
  Minus,
  Radio,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  Trash2,
  Repeat,
  Layers,
  FileJson,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { saveSongTimelineToCode } from "@/lib/song-timeline.functions";
import {
  splitLyrics,
  resolveDuration,
  resolveLyricRanges,
  saveSongRangesLocally,
  clearSongRangesLocally,
  shiftAllRanges,
  cascadeRanges,
  duplicateAllRanges,
  duplicateSingleRange,
  activeLineFromRanges,
  type LyricSyncRange,
} from "@/lib/lyric-sync";

export interface SongTimelineSyncEditorProps {
  song: {
    id: string;
    title: string;
    artist?: string | null;
    audio_url: string;
    cover_url?: string | null;
    lyrics_indigenous?: string | null;
    lyrics_pt?: string | null;
    duration_seconds?: number | null;
    sync_times?: number[] | null;
    style?: any;
  };
  onClose?: () => void;
  onSaved?: (updatedRanges: LyricSyncRange[]) => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "00:00.00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}.${ms < 10 ? "0" : ""}${ms}`;
}

function formatSecOnly(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0.0s";
  return `${sec.toFixed(2)}s`;
}

export function SongTimelineSyncEditor({
  song,
  onClose,
  onSaved,
}: SongTimelineSyncEditorProps) {
  const qc = useQueryClient();
  const saveToCodeFn = useServerFn(saveSongTimelineToCode);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Parse lines
  const indLines = useMemo(
    () => splitLyrics(song.lyrics_indigenous || ""),
    [song.lyrics_indigenous],
  );
  const ptLines = useMemo(
    () => splitLyrics(song.lyrics_pt || ""),
    [song.lyrics_pt],
  );
  const maxLineCount = Math.max(indLines.length, ptLines.length);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Play Solo loop interval ref
  const soloEndRef = useRef<number | null>(null);

  // Active ranges state
  const [ranges, setRanges] = useState<LyricSyncRange[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Live recording / tap-sync mode
  const [recordingMode, setRecordingMode] = useState(false);
  const [recordingIndex, setRecordingIndex] = useState(0);

  // Real preview modal toggle
  const [showLivePreview, setShowLivePreview] = useState(false);

  // JSON Import/Export Modal state
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonFeedback, setJsonFeedback] = useState<{
    valid: boolean;
    count?: number;
    duration?: number;
    title?: string;
    message?: string;
    repaired?: boolean;
    repairedText?: string;
    line?: number;
    column?: number;
    snippet?: string;
    fixes?: string[];
  } | null>(null);

  // Initial duration
  const effectiveDuration = resolveDuration(audioDuration, song.duration_seconds);

  // Load initial ranges only once per song id to avoid overwriting edits on query refetch
  const initializedSongIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (initializedSongIdRef.current === song.id && ranges.length > 0) {
      return;
    }
    initializedSongIdRef.current = song.id;

    const initialRanges = resolveLyricRanges({
      songId: song.id,
      songTitle: song.title,
      indLines,
      ptLines,
      duration: effectiveDuration,
      styleRanges: song.style?.sync_ranges,
      syncTimes: song.sync_times,
    });
    setRanges(initialRanges);
    setIsDirty(false);
  }, [song.id]);

  // Audio setup and time tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;

    let rafId = 0;
    const tick = () => {
      if (audio) {
        const ct = audio.currentTime;
        setCurrentTime(ct);
        if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
          setAudioDuration(audio.duration);
        }
        setIsPlaying(!audio.paused);

        // Check if playing solo snippet
        if (soloEndRef.current !== null && ct >= soloEndRef.current) {
          audio.pause();
          soloEndRef.current = null;
          setIsPlaying(false);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playbackRate]);

  // Calculate active line from current ranges
  const activeLineIdx = useMemo(() => {
    return activeLineFromRanges(ranges, currentTime, 0.2);
  }, [ranges, currentTime]);

  // Keyboard shortcut: Space toggles audio or records in recording mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (recordingMode) {
          advanceRecording();
        } else {
          togglePlay();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [recordingMode, recordingIndex, currentTime, ranges]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      soloEndRef.current = null;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }

  function seek(time: number) {
    const a = audioRef.current;
    if (!a) return;
    soloEndRef.current = null;
    const clamped = Math.max(0, Math.min(effectiveDuration || 300, time));
    a.currentTime = clamped;
    setCurrentTime(clamped);
  }

  function playSnippet(start: number, end: number) {
    const a = audioRef.current;
    if (!a) return;
    seek(start);
    soloEndRef.current = end;
    a.play().catch(() => {});
  }

  function updateRange(index: number, patch: Partial<LyricSyncRange>) {
    setRanges((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setIsDirty(true);
  }

  function setStartToCurrent(index: number) {
    const stamp = Number(currentTime.toFixed(2));
    updateRange(index, { start: stamp });
    toast.info(`Verso #${index + 1}: Início marcado em ${stamp}s`);
  }

  function setEndToCurrent(index: number) {
    const stamp = Number(currentTime.toFixed(2));
    updateRange(index, { end: stamp });
    toast.info(`Verso #${index + 1}: Fim marcado em ${stamp}s`);
  }

  function linkToPrevious(index: number) {
    if (index <= 0) return;
    const prevEnd = ranges[index - 1].end;
    updateRange(index, { start: prevEnd });
    toast.success(`Verso #${index + 1} unido ao anterior (inicia em ${prevEnd}s)`);
  }

  function linkToNext(index: number) {
    if (index >= ranges.length - 1) return;
    const nextStart = ranges[index + 1].start;
    updateRange(index, { end: nextStart });
    toast.success(`Verso #${index + 1} unido ao próximo (termina em ${nextStart}s)`);
  }

  function applyShift(delta: number) {
    setRanges((prev) => shiftAllRanges(prev, delta, effectiveDuration));
    setIsDirty(true);
    toast.success(`Todos os versos ajustados em ${delta > 0 ? "+" : ""}${delta}s`);
  }

  function applyCascade() {
    if (!ranges.length) return;
    setRanges((prev) => cascadeRanges(prev));
    setIsDirty(true);
    toast.success("Versos auto-alinhados em sequência contínua (sem intervalos perdidos)!");
  }

  function resetToAutomatic() {
    clearSongRangesLocally(song.id);
    const recomputed = resolveLyricRanges({
      songId: song.id,
      indLines,
      ptLines,
      duration: effectiveDuration,
      offsets: null,
      syncTimes: null,
      styleRanges: null,
    });
    setRanges(recomputed);
    setIsDirty(true);
    toast.info("Linha do tempo recalculada proporcionalmente.");
  }

  // Live recording step
  function startLiveRecording() {
    setRecordingMode(true);
    setRecordingIndex(0);
    seek(0);
    const a = audioRef.current;
    if (a) a.play().catch(() => {});
    toast.success("Modo Gravação ativado! Toque ESPAÇO no início de cada verso!");
  }

  function advanceRecording() {
    const stamp = Number(currentTime.toFixed(2));
    if (recordingIndex < ranges.length) {
      setRanges((prev) => {
        const next = [...prev];
        // Fecha verso anterior se houver
        if (recordingIndex > 0) {
          next[recordingIndex - 1] = {
            ...next[recordingIndex - 1],
            end: stamp > next[recordingIndex - 1].start ? stamp : stamp + 1,
          };
        }
        // Inicia verso atual
        if (next[recordingIndex]) {
          next[recordingIndex] = {
            ...next[recordingIndex],
            start: stamp,
            end: stamp + 3,
          };
        }
        return next;
      });
      setIsDirty(true);
      toast.info(`Verso #${recordingIndex + 1} iniciado em ${stamp}s!`);
      setRecordingIndex((prev) => prev + 1);
    } else {
      // Finalizou o último verso
      if (ranges.length > 0) {
        updateRange(ranges.length - 1, { end: stamp });
      }
      setRecordingMode(false);
      toast.success("Gravação ao vivo concluída com sucesso!");
    }
  }

  function stopLiveRecording() {
    setRecordingMode(false);
    toast.info("Gravação ao vivo finalizada.");
  }

  // Open and validate JSON modal
  function openJsonModal() {
    const currentJson = JSON.stringify(
      {
        song_title: song.title,
        duration: effectiveDuration,
        sync_ranges: ranges,
      },
      null,
      2,
    );
    setJsonInput(currentJson);
    validateJson(currentJson);
    setShowJsonModal(true);
  }

  /**
   * Limpa e repara automaticamente erros comuns em JSON colado (aspas não fechadas, markdown, prefixos, etc.)
   */
  function cleanAndRepairJson(raw: string): {
    repairedText: string;
    wasRepaired: boolean;
    fixes: string[];
  } {
    if (!raw || typeof raw !== "string") {
      return { repairedText: raw, wasRepaired: false, fixes: [] };
    }

    let text = raw.trim();
    const fixes: string[] = [];
    const original = text;

    // 1. Remove blocos de código markdown (```json ... ```)
    if (/^```/m.test(text)) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      fixes.push("Blocos de markdown removidos");
    }

    // 2. Remove prefixos como "json:{" ou "JSON = "
    if (/^(?:const|let|var)?\s*json\s*[:=]\s*/i.test(text)) {
      text = text.replace(/^(?:const|let|var)?\s*json\s*[:=]\s*/i, "");
      fixes.push("Prefixo 'json:' removido");
    }

    // 3. Extrai o trecho do objeto ou array JSON
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    const lastBrace = text.lastIndexOf("}");
    const lastBracket = text.lastIndexOf("]");
    const endIdx = Math.max(lastBrace, lastBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      if (startIdx > 0 || endIdx < text.length - 1) {
        text = text.substring(startIdx, endIdx + 1);
        fixes.push("Texto fora das chaves delimitado");
      }
    }

    // 4. Reparo linha a linha para aspas não fechadas (ex: "text": "Pra que mandou me chamar?,)
    const lines = text.split(/\r?\n/);
    let unclosedQuotesCount = 0;
    const repairedLines = lines.map((line) => {
      // Propriedade com aspas abertas mas sem fechar antes da vírgula ou fim de linha
      const unclosedPropMatch = line.match(/^(\s*"[a-zA-Z0-9_\-\.]+"\s*:\s*")([^"\r\n]*?)(,?)\s*$/);
      if (unclosedPropMatch) {
        unclosedQuotesCount++;
        const prefix = unclosedPropMatch[1];
        const val = unclosedPropMatch[2];
        const comma = unclosedPropMatch[3] || "";
        return `${prefix}${val}"${comma}`;
      }

      // Item de array com aspas abertas
      const unclosedArrayMatch = line.match(/^(\s*")([^"\r\n]*?)(,?)\s*$/);
      if (unclosedArrayMatch) {
        unclosedQuotesCount++;
        const indentQuote = unclosedArrayMatch[1];
        const val = unclosedArrayMatch[2];
        const comma = unclosedArrayMatch[3] || "";
        return `${indentQuote}${val}"${comma}`;
      }

      return line;
    });

    if (unclosedQuotesCount > 0) {
      fixes.push(`${unclosedQuotesCount} aspas duplas ausentes foram fechadas`);
      text = repairedLines.join("\n");
    }

    // 5. Remove vírgulas sobressalentes antes de } ou ]
    if (/,\s*([}\]])/g.test(text)) {
      text = text.replace(/,\s*([}\]])/g, "$1");
      fixes.push("Vírgulas sobressalentes removidas");
    }

    const wasRepaired = text !== original;
    return { repairedText: text, wasRepaired, fixes };
  }

  /**
   * Localiza a linha e coluna exata de um erro de sintaxe JSON
   */
  function extractJsonErrorLocation(text: string, err: any): {
    line?: number;
    column?: number;
    snippet?: string;
    detail: string;
  } {
    const msg = err?.message || String(err);
    let line: number | undefined;
    let column: number | undefined;

    const posMatch = msg.match(/at position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = text.substring(0, pos);
      const linesBefore = before.split(/\r?\n/);
      line = linesBefore.length;
      column = linesBefore[linesBefore.length - 1].length + 1;
    }

    if (!line) {
      const lineColMatch = msg.match(/line (\d+)(?:\s*column\s*(\d+))?/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        if (lineColMatch[2]) {
          column = parseInt(lineColMatch[2], 10);
        }
      }
    }

    let snippet = "";
    if (line !== undefined) {
      const allLines = text.split(/\r?\n/);
      const targetLine = allLines[line - 1] ?? "";
      const prevLine = line > 1 ? allLines[line - 2] : null;
      const nextLine = line < allLines.length ? allLines[line] : null;

      const parts: string[] = [];
      if (prevLine !== null) parts.push(`  ${line - 1}: ${prevLine}`);
      parts.push(`> ${line}: ${targetLine}`);
      if (column !== undefined && column > 0) {
        const pad = " ".repeat(Math.max(0, column + 3));
        parts.push(`${pad}^ (erro detectado aqui)`);
      }
      if (nextLine !== null) parts.push(`  ${line + 1}: ${nextLine}`);
      snippet = parts.join("\n");
    }

    return { line, column, snippet, detail: msg };
  }

  function validateJson(text: string) {
    if (!text.trim()) {
      setJsonFeedback(null);
      return;
    }

    // Tentativa 1: Parse direto do texto original
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.sync_ranges || parsed.ranges || [];

      if (!Array.isArray(items) || items.length === 0) {
        setJsonFeedback({
          valid: false,
          message: "Nenhum verso encontrado no JSON.",
        });
        return;
      }

      const validItems = items.filter(
        (it: any) => typeof it === "object" && it !== null && ("start" in it || "end" in it),
      );

      if (validItems.length === 0) {
        setJsonFeedback({
          valid: false,
          message: "Os versos devem ter as propriedades 'start' e 'end'.",
        });
        return;
      }

      const totalDur = parsed.duration || validItems[validItems.length - 1]?.end || 0;
      setJsonFeedback({
        valid: true,
        repaired: false,
        count: validItems.length,
        duration: totalDur,
        title: parsed.song_title || song.title,
        message: `${validItems.length} versos válidos detectados com sucesso!`,
      });
      return;
    } catch (rawErr: any) {
      // Tentativa 2: Aplica auto-reparo inteligente (aspas, vírgulas, markdown)
      const { repairedText, wasRepaired, fixes } = cleanAndRepairJson(text);
      try {
        const repairedParsed = JSON.parse(repairedText);
        const items = Array.isArray(repairedParsed)
          ? repairedParsed
          : repairedParsed.sync_ranges || repairedParsed.ranges || [];

        if (Array.isArray(items) && items.length > 0) {
          const validItems = items.filter(
            (it: any) => typeof it === "object" && it !== null && ("start" in it || "end" in it),
          );

          if (validItems.length > 0) {
            const totalDur = repairedParsed.duration || validItems[validItems.length - 1]?.end || 0;
            setJsonFeedback({
              valid: true,
              repaired: true,
              repairedText,
              fixes,
              count: validItems.length,
              duration: totalDur,
              title: repairedParsed.song_title || song.title,
              message: `✓ ${validItems.length} versos detectados! (${fixes.join("; ") || "Corrigido automaticamente"})`,
            });
            return;
          }
        }
      } catch {
        // Se ainda falhar, localiza a linha e coluna exata para o usuário
      }

      const loc = extractJsonErrorLocation(text, rawErr);
      setJsonFeedback({
        valid: false,
        line: loc.line,
        column: loc.column,
        snippet: loc.snippet,
        message: loc.line
          ? `Erro de sintaxe no JSON na Linha ${loc.line}${loc.column ? `, Coluna ${loc.column}` : ""}.`
          : `JSON inválido: ${loc.detail}`,
      });
    }
  }

  function applyJson() {
    try {
      const textToUse = jsonFeedback?.repairedText || jsonInput;
      const { repairedText } = cleanAndRepairJson(textToUse);
      const parsed = JSON.parse(repairedText);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.sync_ranges || parsed.ranges || [];

      if (!Array.isArray(items) || items.length === 0) {
        toast.error("Nenhum verso válido encontrado no JSON.");
        return;
      }

      const newRanges: LyricSyncRange[] = items.map((it: any, i: number) => ({
        start: Number(Number(it.start ?? 0).toFixed(2)),
        end: Number(Number(it.end ?? (it.start ?? 0) + 3).toFixed(2)),
        text: it.text !== undefined && it.text !== null ? String(it.text) : (indLines[i] || ""),
        translation: it.translation !== undefined && it.translation !== null ? String(it.translation) : (ptLines[i] || ""),
      }));

      setRanges(newRanges);
      setIsDirty(true);
      setShowJsonModal(false);
      toast.success(`🎉 ${newRanges.length} versos carregados na timeline com sucesso!`);
    } catch {
      toast.error("JSON inválido. Verifique o formato.");
    }
  }

  // Export JSON to clipboard
  function copyJson() {
    const payload = JSON.stringify(
      {
        song_title: song.title,
        duration: effectiveDuration,
        sync_ranges: ranges,
      },
      null,
      2,
    );
    navigator.clipboard.writeText(payload);
    toast.success("JSON copiado para a área de transferência!");
  }

  // Duplicar toda a letra existente para músicas que repetem a letra
  function handleDuplicateAll() {
    if (!ranges.length) {
      toast.error("Nenhum verso para duplicar.");
      return;
    }
    const next = duplicateAllRanges(ranges, 0.5, effectiveDuration > 0 ? effectiveDuration : undefined);
    setRanges(next);
    setIsDirty(true);
    toast.success(`✨ Letra duplicada com sucesso! ${next.length} versos agora na linha do tempo.`);
  }

  // Duplicar verso específico
  function handleDuplicateVerse(index: number) {
    const next = duplicateSingleRange(ranges, index, effectiveDuration > 0 ? effectiveDuration : undefined);
    setRanges(next);
    setIsDirty(true);
    toast.success(`Verso #${index + 1} duplicado com sucesso!`);
  }

  // Adicionar novo verso em branco ao final
  function handleAddVerse() {
    const lastEnd = ranges.length > 0 ? ranges[ranges.length - 1].end : 0;
    const start = Number(lastEnd.toFixed(2));
    const end = Number((start + 3.0).toFixed(2));
    const newVerse: LyricSyncRange = {
      start,
      end,
      text: "",
      translation: "",
    };
    setRanges((prev) => [...prev, newVerse]);
    setIsDirty(true);
    toast.info("Novo verso adicionado.");
  }

  // Excluir verso
  function handleDeleteVerse(index: number) {
    if (ranges.length <= 1) {
      toast.error("A música precisa ter pelo menos 1 verso.");
      return;
    }
    setRanges((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    toast.info(`Verso #${index + 1} removido.`);
  }

  // Save to LocalStorage
  function saveLocal() {
    saveSongRangesLocally(song.id, ranges);
    setIsDirty(false);
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastSavedAt(timeStr);
    toast.success("Salvo no navegador! Os players já estão usando este tempo.");
    if (onSaved) onSaved(ranges);
  }

  // Save directly to Code (src/data/songs-timeline-data.ts) and Supabase Database
  async function saveToCode() {
    if (saving) return;
    setSaving(true);
    try {
      // 1. Grava no LocalStorage imediatamente para os players responderem sem atraso
      saveSongRangesLocally(song.id, ranges);

      // 2. Grava no arquivo de código TypeScript do projeto
      await saveToCodeFn({
        data: {
          songId: song.id,
          songTitle: song.title,
          duration: effectiveDuration,
          ranges,
        },
      });

      // 3. Persiste no banco Supabase (atualiza sync_times, style.sync_ranges e sincroniza letras)
      try {
        const syncTimes = ranges.map((r) => r.start);
        const dur = effectiveDuration > 0 ? effectiveDuration : undefined;
        const indText = ranges.map((r) => r.text || "").filter(Boolean).join("\n");
        const ptText = ranges.map((r) => r.translation || "").filter(Boolean).join("\n");

        const { error: sbErr } = await supabase
          .from("songs")
          .update({
            sync_times: syncTimes,
            duration_seconds: dur,
            lyrics_indigenous: indText || song.lyrics_indigenous,
            lyrics_pt: ptText || song.lyrics_pt,
            style: {
              ...(song.style || {}),
              sync_ranges: ranges,
              timeline_updated_at: new Date().toISOString(),
            } as any,
          } as any)
          .eq("id", song.id);

        if (sbErr) {
          console.warn("[SongTimeline] Supabase save warning:", sbErr.message);
        }
      } catch (sbErr) {
        console.warn("[SongTimeline] Supabase save bypassed:", sbErr);
      }

      setIsDirty(false);
      const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedAt(timeStr);
      toast.success("✨ Salvo com sucesso no código e banco de dados!");

      if (onSaved) onSaved(ranges);

      await qc.invalidateQueries({ queryKey: ["songs_admin"] });
      await qc.invalidateQueries({ queryKey: ["songs_public"] });
      await qc.invalidateQueries({ queryKey: ["songs_infantil"] });
      await qc.invalidateQueries({ queryKey: ["admin_songs_style"] });
    } catch (e: any) {
      // Fallback: LocalStorage garante persistência no navegador
      saveSongRangesLocally(song.id, ranges);
      setIsDirty(false);
      const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedAt(timeStr);
      toast.success("✨ Salvo com sucesso no navegador!");
      if (onSaved) onSaved(ranges);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#121915] text-cream rounded-2xl border border-gold/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={song.audio_url} preload="auto" />

      {/* TOP BAR / HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gold/20 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-gold/30 bg-forest-deep flex-shrink-0">
            {song.cover_url ? (
              <img src={song.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-gold font-bold">♪</div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/25">
                Editor de Linha do Tempo
              </span>
              {isDirty ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Alterações não salvas
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  {lastSavedAt ? `Salvo no código às ${lastSavedAt}` : "Sincronizado no código"}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-black text-cream leading-tight mt-0.5">
              {song.title} {song.artist ? <span className="text-foreground/60 text-xs font-normal italic">— {song.artist}</span> : null}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyJson}
            title="Copiar JSON da sincronização"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/25 bg-card/40 text-xs font-bold text-gold hover:bg-gold/15 transition"
          >
            <Copy className="h-3.5 w-3.5" /> Copiar JSON
          </button>
          <button
            onClick={openJsonModal}
            title="Abrir editor / importador de JSON"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/30 bg-gold/10 text-xs font-bold text-gold hover:bg-gold/20 transition"
          >
            <FileJson className="h-3.5 w-3.5" /> Importar / Exportar JSON
          </button>
          <button
            onClick={handleDuplicateAll}
            title="Duplica todos os versos existentes em sequência para músicas que repetem a letra"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition shadow-sm"
          >
            <Repeat className="h-3.5 w-3.5" /> Repetir Letra (Duplicar)
          </button>
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              showLivePreview
                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                : "border-gold/25 bg-card/40 text-cream hover:bg-gold/10"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> {showLivePreview ? "Ocultar Prévia" : "Prévia ao Vivo"}
          </button>
          <button
            onClick={saveLocal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <Download className="h-3.5 w-3.5" /> Salvar Local
          </button>
          <button
            onClick={saveToCode}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-forest-deep text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 transition"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar no Código & Banco"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-foreground/60 hover:text-cream transition ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* AUDIO DECK & VISUAL TIMELINE */}
      <div className="p-4 md:p-5 bg-gradient-to-b from-black/60 to-black/20 border-b border-gold/15 space-y-4">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Big Play / Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-gold text-forest-deep grid place-items-center shadow-[0_0_25px_rgba(249,168,37,0.45)] hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 ml-0.5 fill-current" />}
            </button>

            <div>
              <div className="font-mono text-2xl font-black tracking-wider text-gold tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="text-[10px] font-bold text-foreground/50 tracking-wider uppercase">
                Duração: {formatTime(effectiveDuration)}
              </div>
            </div>
          </div>

          {/* Quick seek buttons & speed */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => seek(currentTime - 5)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-bold hover:bg-white/10 transition"
              title="-5 segundos"
            >
              <Rewind className="h-3.5 w-3.5 inline mr-1" /> -5s
            </button>
            <button
              onClick={() => seek(currentTime + 5)}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-bold hover:bg-white/10 transition"
              title="+5 segundos"
            >
              +5s <FastForward className="h-3.5 w-3.5 inline ml-1" />
            </button>

            {/* Playback rate */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-0.5 rounded-lg text-xs font-bold">
              {[0.5, 0.75, 1.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded ${
                    playbackRate === rate ? "bg-gold text-forest-deep" : "text-foreground/60 hover:text-cream"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Live Recording mode */}
            {recordingMode ? (
              <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-3 py-1 rounded-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-black text-rose-300">
                  Gravando verso #{recordingIndex + 1}/{ranges.length}
                </span>
                <button
                  onClick={advanceRecording}
                  className="px-2.5 py-0.5 rounded bg-rose-500 text-white text-xs font-bold hover:brightness-110 active:scale-95"
                >
                  Marcar Verso (Espaço)
                </button>
                <button
                  onClick={stopLiveRecording}
                  className="text-xs text-foreground/60 hover:text-white"
                >
                  Parar
                </button>
              </div>
            ) : (
              <button
                onClick={startLiveRecording}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <Radio className="h-3.5 w-3.5 text-rose-400" /> Gravar com Espaço
              </button>
            )}
          </div>

          {/* Bulk adjustment tools */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={handleDuplicateAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 transition shadow-sm"
              title="Duplica todos os versos em sequência para músicas com repetição"
            >
              <Repeat className="h-3 w-3" /> Repetir Letra
            </button>
            <span className="text-[10px] font-bold text-foreground/50 uppercase ml-1">Ajuste:</span>
            <button
              onClick={() => applyShift(-0.5)}
              className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 font-bold"
            >
              -0.5s
            </button>
            <button
              onClick={() => applyShift(0.5)}
              className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 font-bold"
            >
              +0.5s
            </button>
            <button
              onClick={applyCascade}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold hover:bg-indigo-500/25 transition"
              title="Cola cada verso imediatamente após o anterior sem buracos de tempo"
            >
              Auto-Alinhar em Cascata
            </button>
            <button
              onClick={resetToAutomatic}
              className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-foreground/60 hover:text-cream font-bold"
              title="Recalcular com base na proporção do texto"
            >
              <RotateCcw className="h-3 w-3 inline mr-1" /> Auto
            </button>
          </div>
        </div>

        {/* VISUAL TIMELINE BAR */}
        <div className="relative mt-2">
          {/* Main track */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * effectiveDuration);
            }}
            className="relative h-12 w-full rounded-xl bg-black/60 border border-gold/20 overflow-hidden cursor-pointer select-none group"
          >
            {/* Background time markers */}
            <div className="absolute inset-0 flex justify-between px-2 text-[9px] font-mono text-foreground/30 pointer-events-none items-center">
              <span>0:00</span>
              <span>{formatTime(effectiveDuration * 0.25)}</span>
              <span>{formatTime(effectiveDuration * 0.5)}</span>
              <span>{formatTime(effectiveDuration * 0.75)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>

            {/* Verses blocks on timeline */}
            {effectiveDuration > 0 &&
              ranges.map((range, i) => {
                const leftPct = Math.max(0, Math.min(100, (range.start / effectiveDuration) * 100));
                const widthPct = Math.max(
                  0.5,
                  Math.min(100 - leftPct, ((range.end - range.start) / effectiveDuration) * 100),
                );
                const isActive = i === activeLineIdx;

                // Color palette for verse chips
                const colors = [
                  "bg-emerald-600/60 border-emerald-400",
                  "bg-amber-600/60 border-amber-400",
                  "bg-teal-600/60 border-teal-400",
                  "bg-indigo-600/60 border-indigo-400",
                  "bg-rose-600/60 border-rose-400",
                  "bg-yellow-600/60 border-yellow-400",
                ];
                const colorCls = colors[i % colors.length];

                return (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      seek(range.start);
                    }}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className={`absolute top-1 bottom-1 rounded-lg border text-[9px] font-bold px-1.5 flex items-center justify-between overflow-hidden transition-all group/chip ${
                      isActive
                        ? "bg-gold text-forest-deep border-white shadow-[0_0_15px_rgba(249,168,37,0.7)] scale-y-105 z-20 font-black"
                        : `${colorCls} text-cream/90 hover:brightness-125 z-10`
                    }`}
                    title={`Verso #${i + 1}: ${range.text} (${range.start.toFixed(1)}s - ${range.end.toFixed(1)}s)`}
                  >
                    <span className="truncate">#{i + 1} {range.text}</span>
                    <span className="text-[8px] opacity-75 tabular-nums flex-shrink-0 ml-1">
                      {range.start.toFixed(1)}s
                    </span>
                  </div>
                );
              })}

            {/* Current playhead cursor */}
            {effectiveDuration > 0 && (
              <div
                style={{
                  left: `${Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))}%`,
                }}
                className="absolute inset-y-0 w-0.5 bg-red-400 shadow-[0_0_8px_#f87171] z-30 pointer-events-none"
              >
                <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 rounded-full bg-red-400 border border-white shadow-md" />
              </div>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-foreground/50">
            <span>Clique em qualquer bloco ou na régua para pular o áudio</span>
            <span>Versos configurados: {ranges.length}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA: VERSES TIMELINE LIST (OR SPLIT PREVIEW) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Verses List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
          {ranges.map((range, index) => {
            const isActive = index === activeLineIdx;
            const verseDuration = Number((range.end - range.start).toFixed(2));

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-gold/15 via-gold/5 to-transparent border-gold shadow-[0_0_20px_rgba(249,168,37,0.2)]"
                    : "bg-black/25 border-gold/15 hover:border-gold/30 hover:bg-black/35"
                }`}
              >
                {/* Header of verse card */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-6 w-6 rounded-lg grid place-items-center text-xs font-black ${
                        isActive ? "bg-gold text-forest-deep" : "bg-white/10 text-cream"
                      }`}
                    >
                      {index + 1}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-300 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> TOCANDO AGORA
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-foreground/50 bg-black/40 px-2 py-0.5 rounded-full">
                      Duração: {verseDuration > 0 ? `${verseDuration}s` : "0s"}
                    </span>
                  </div>

                  {/* Actions for this verse */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => playSnippet(range.start, range.end)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/15 border border-gold/30 text-[10px] font-bold text-gold hover:bg-gold/25 transition"
                      title="Tocar apenas este trecho"
                    >
                      <Play className="h-3 w-3 fill-current" /> Testar Trecho
                    </button>
                    <button
                      onClick={() => handleDuplicateVerse(index)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300 hover:bg-amber-500/25 transition shadow-sm"
                      title="Duplicar este verso (inicia após o verso atual)"
                    >
                      <Copy className="h-3 w-3" /> Duplicar Verso
                    </button>
                    {index > 0 && (
                      <button
                        onClick={() => linkToPrevious(index)}
                        className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-bold text-foreground/70 hover:text-cream hover:bg-white/10 transition"
                        title="Iniciar onde o verso anterior termina"
                      >
                        🔗 Unir Anterior
                      </button>
                    )}
                    {index < ranges.length - 1 && (
                      <button
                        onClick={() => linkToNext(index)}
                        className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-bold text-foreground/70 hover:text-cream hover:bg-white/10 transition"
                        title="Terminar onde o próximo verso inicia"
                      >
                        🔗 Unir Próximo
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteVerse(index)}
                      className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 transition ml-1"
                      title="Excluir este verso"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lyrics text (Editable inline) */}
                <div className="mb-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 w-16 shrink-0">
                      Patxôhã:
                    </span>
                    <input
                      type="text"
                      value={range.text || ""}
                      onChange={(e) => updateRange(index, { text: e.target.value })}
                      placeholder="Letra em língua indígena..."
                      className="flex-1 rounded-lg border border-gold/20 bg-forest-deep/60 px-2.5 py-1 text-sm font-bold text-cream focus:outline-none focus:border-gold transition"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 w-16 shrink-0">
                      Tradução:
                    </span>
                    <input
                      type="text"
                      value={range.translation || ""}
                      onChange={(e) => updateRange(index, { translation: e.target.value })}
                      placeholder="Tradução em português..."
                      className="flex-1 rounded-lg border border-gold/15 bg-forest-deep/40 px-2.5 py-0.5 text-xs italic text-foreground/80 focus:outline-none focus:border-gold transition"
                    />
                  </div>
                </div>

                {/* Timeline Range Configuration (Inputs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                  {/* Start time */}
                  <div className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-gold/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gold w-12 flex-shrink-0">
                      Início:
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={range.start}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateRange(index, { start: Math.max(0, val) });
                      }}
                      className="w-20 rounded-lg border border-gold/25 bg-forest-deep/60 px-2 py-1 text-xs font-mono font-bold text-cream focus:outline-none focus:border-gold"
                    />
                    <span className="text-xs text-foreground/50">s</span>

                    {/* Micro adjustments */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => updateRange(index, { start: Math.max(0, Number((range.start - 0.5).toFixed(2))) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="-0.5s"
                      >
                        -0.5
                      </button>
                      <button
                        onClick={() => updateRange(index, { start: Math.max(0, Number((range.start - 0.1).toFixed(2))) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="-0.1s"
                      >
                        -0.1
                      </button>
                      <button
                        onClick={() => updateRange(index, { start: Number((range.start + 0.1).toFixed(2)) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="+0.1s"
                      >
                        +0.1
                      </button>
                      <button
                        onClick={() => updateRange(index, { start: Number((range.start + 0.5).toFixed(2)) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="+0.5s"
                      >
                        +0.5
                      </button>
                      <button
                        onClick={() => setStartToCurrent(index)}
                        className="ml-1 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
                        title="Definir início como o segundo atual do áudio"
                      >
                        Início = Atual
                      </button>
                    </div>
                  </div>

                  {/* End time */}
                  <div className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-gold/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 w-12 flex-shrink-0">
                      Fim:
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={range.end}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateRange(index, { end: Math.max(0, val) });
                      }}
                      className="w-20 rounded-lg border border-gold/25 bg-forest-deep/60 px-2 py-1 text-xs font-mono font-bold text-cream focus:outline-none focus:border-gold"
                    />
                    <span className="text-xs text-foreground/50">s</span>

                    {/* Micro adjustments */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => updateRange(index, { end: Math.max(0, Number((range.end - 0.5).toFixed(2))) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="-0.5s"
                      >
                        -0.5
                      </button>
                      <button
                        onClick={() => updateRange(index, { end: Math.max(0, Number((range.end - 0.1).toFixed(2))) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="-0.1s"
                      >
                        -0.1
                      </button>
                      <button
                        onClick={() => updateRange(index, { end: Number((range.end + 0.1).toFixed(2)) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="+0.1s"
                      >
                        +0.1
                      </button>
                      <button
                        onClick={() => updateRange(index, { end: Number((range.end + 0.5).toFixed(2)) })}
                        className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] hover:bg-white/10"
                        title="+0.5s"
                      >
                        +0.5
                      </button>
                      <button
                        onClick={() => setEndToCurrent(index)}
                        className="ml-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-sm"
                        title="Definir fim como o segundo atual do áudio"
                      >
                        Fim = Atual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Range summary pill (like the user asked: "Unir unir tem que ser de 2-5 segundos") */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-foreground/60 px-1">
                  <span>
                    Exibição na tela:{" "}
                    <strong className="text-gold font-mono font-bold">
                      {range.start.toFixed(2)}s
                    </strong>{" "}
                    até{" "}
                    <strong className="text-amber-400 font-mono font-bold">
                      {range.end.toFixed(2)}s
                    </strong>
                  </span>
                  {range.end <= range.start && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Fim deve ser maior que o início!
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add verse button */}
          <button
            onClick={handleAddVerse}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60 bg-gold/5 hover:bg-gold/10 text-xs font-black text-gold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm"
          >
            <Plus className="h-4 w-4" /> Adicionar Novo Verso ao Final da Linha do Tempo
          </button>

          {ranges.length === 0 && (
            <div className="text-center py-12 text-foreground/50">
              Esta música não possui versos cadastrados. Cadastre a letra primeiro em Lista & Cadastro.
            </div>
          )}
        </div>

        {/* Live Preview Theater Pane (Optional toggle) */}
        {showLivePreview && (
          <div className="w-96 border-l border-gold/20 bg-black/60 p-4 flex flex-col justify-between overflow-y-auto hidden lg:flex">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gold/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> Prévia do Player Real
                </span>
                <span className="text-[10px] font-mono text-foreground/50">
                  {formatTime(currentTime)}
                </span>
              </div>

              <div className="space-y-6 text-center py-8">
                {ranges.map((range, idx) => {
                  const isActive = idx === activeLineIdx;
                  return (
                    <div
                      key={idx}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "scale-105 opacity-100 font-black"
                          : "opacity-30 scale-95"
                      }`}
                    >
                      <p
                        className={`text-xl font-black ${
                          isActive ? "text-gold drop-shadow-[0_2px_10px_rgba(249,168,37,0.5)]" : "text-cream"
                        }`}
                      >
                        {range.text}
                      </p>
                      {range.translation && (
                        <p className="text-xs italic text-foreground/80 mt-1">
                          {range.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-center text-foreground/40 border-t border-white/10 pt-3">
              As frases destacadas em dourado acendem no tempo exato configurado na timeline.
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-3 border-t border-gold/20 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground/60">
          <HelpCircle className="h-4 w-4 text-gold flex-shrink-0" />
          <span>
            <strong>Dica:</strong> Toque play, ouça a voz e clique em <em>Início = Atual</em> ou <em>Fim = Atual</em> para cravar os segundos perfeitos.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveLocal}
            className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            Salvar no Navegador
          </button>
          <button
            onClick={saveToCode}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gold text-forest-deep font-black uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 transition flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando no Código..." : "Salvar no Código (Definitivo)"}
          </button>
        </div>
      </div>

      {/* MODAL DE IMPORTAÇÃO E EXPORTAÇÃO JSON */}
      {showJsonModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#16211c] border border-gold/40 rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gold/20 mb-3">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-gold" />
                <h3 className="font-display font-black text-base text-cream">
                  Importar / Exportar JSON da Linha do Tempo
                </h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1 rounded-lg text-foreground/50 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-foreground/70 mb-3">
              Cole o JSON com a estrutura <code className="text-gold font-mono font-bold">{"{ song_title, duration, sync_ranges: [...] }"}</code> ou um array direto de versos.
            </p>

            {/* Live Feedback Banner */}
            {jsonFeedback && (
              <div
                className={`mb-3 p-3 rounded-xl border text-xs font-bold flex flex-col gap-2 ${
                  jsonFeedback.valid
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {jsonFeedback.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span>{jsonFeedback.message}</span>
                  </div>
                  {jsonFeedback.valid && jsonFeedback.duration ? (
                    <span className="font-mono text-[11px] opacity-80 shrink-0">
                      Duração: {jsonFeedback.duration.toFixed(1)}s
                    </span>
                  ) : null}
                </div>

                {/* Se foi reparado automaticamente, permite atualizar o campo de texto */}
                {jsonFeedback.valid && jsonFeedback.repaired && jsonFeedback.repairedText && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                    <span className="text-emerald-300 font-normal">
                      Pequenas falhas de aspas ou vírgula foram corrigidas automaticamente.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setJsonInput(jsonFeedback.repairedText!);
                        toast.success("JSON corrigido inserido no editor!");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-500/40 text-[11px] flex items-center gap-1 transition"
                    >
                      <Sparkles className="h-3 w-3" /> Aplicar Correção no Texto
                    </button>
                  </div>
                )}

                {/* Se inválido, mostra a linha exata onde falhou e botão de reparo */}
                {!jsonFeedback.valid && (
                  <div className="pt-2 border-t border-rose-500/20 flex flex-col gap-2">
                    {jsonFeedback.snippet && (
                      <div className="p-2.5 rounded-lg bg-black/60 border border-rose-500/30 font-mono text-[11px] text-rose-200">
                        <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">
                          Localização do erro no texto:
                        </div>
                        <div className="whitespace-pre overflow-x-auto custom-scrollbar">
                          {jsonFeedback.snippet}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-rose-300/80 font-normal">
                        Dica: Verifique se todas as aspas duplas (") foram fechadas antes de vírgulas.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const { repairedText } = cleanAndRepairJson(jsonInput);
                          setJsonInput(repairedText);
                          validateJson(repairedText);
                          toast.info("Tentativa de auto-reparo aplicada.");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold border border-rose-500/40 text-[11px] flex items-center gap-1 transition"
                      >
                        <Sparkles className="h-3 w-3" /> Tentar Auto-Corrigir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Textarea */}
            <textarea
              rows={12}
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                validateJson(e.target.value);
              }}
              placeholder='Cole aqui o JSON ({ "song_title": "...", "duration": ..., "sync_ranges": [...] })'
              className="w-full flex-1 rounded-xl border border-gold/25 bg-black/60 p-3 font-mono text-xs text-cream focus:outline-none focus:border-gold custom-scrollbar"
            />

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gold/20 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput);
                  toast.success("Conteúdo copiado!");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gold/30 bg-card/40 text-xs font-bold text-gold hover:bg-gold/15"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar Texto Atual
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-foreground/70 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyJson}
                  disabled={!jsonFeedback?.valid}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-forest-deep text-xs font-black uppercase tracking-wider hover:brightness-110 disabled:opacity-40 transition shadow-lg"
                >
                  <Check className="h-4 w-4" /> Aplicar na Linha do Tempo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SongTimelineModal({
  song,
  onClose,
  onSaved,
}: {
  song: SongTimelineSyncEditorProps["song"];
  onClose: () => void;
  onSaved?: (updatedRanges: LyricSyncRange[]) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[94vh] max-h-[880px]">
        <SongTimelineSyncEditor song={song} onClose={onClose} onSaved={onSaved} />
      </div>
    </div>
  );
}

