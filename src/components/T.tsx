import { useAutoTranslate } from "@/hooks/use-auto-translate";

/**
 * Translates its single string child to the current UI language.
 * Falls back to the original PT text while loading.
 */
export function T({ children }: { children: string }) {
  const [translated] = useAutoTranslate([children]);
  return <>{translated}</>;
}
