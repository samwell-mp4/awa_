import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { translateI18n } from "@/lib/i18n-translate.functions";

const LS_PREFIX = "awa_i18n_dom_";
const ORIGINAL_TEXT = new WeakMap<Text, string>();
const ORIGINAL_ATTR = new WeakMap<Element, Record<string, string>>();
const PENDING = new Set<string>();

const SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "svg",
  "canvas",
  "code",
  "pre",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[data-no-auto-translate]",
].join(",");

const COMMON_PORTUGUESE_WORDS = new Set([
  "abaixo",
  "abrindo",
  "assinaturas",
  "cobrado",
  "contrate",
  "duas",
  "economize",
  "equivale",
  "escolha",
  "independentes",
  "libera",
  "liberado",
  "meses",
  "melhor",
  "necessária",
  "outro",
  "pagamento",
  "requer",
  "separada",
  "usada",
  "valor",
  "acesso",
  "alterar",
  "aparelhos",
  "aplicadas",
  "aprenda",
  "aprendidas",
  "aprendizado",
  "assinar",
  "assinatura",
  "automaticamente",
  "baixar",
  "biografia",
  "cadastro",
  "cadastrar",
  "cancelar",
  "carregando",
  "cancele",
  "canto",
  "celular",
  "completo",
  "concorda",
  "confirmar",
  "conhecer",
  "conta",
  "conteúdo",
  "continue",
  "criar",
  "dados",
  "dicionário",
  "digite",
  "enviamos",
  "enviando",
  "enviar",
  "entrar",
  "existente",
  "família",
  "grátis",
  "gratuito",
  "histórias",
  "início",
  "informe",
  "instalar",
  "jogos",
  "lacuna",
  "lembrar",
  "mensagem",
  "mensal",
  "músicas",
  "natureza",
  "nome",
  "nunca",
  "palavras",
  "planos",
  "podem",
  "política",
  "pontos",
  "português",
  "privacidade",
  "professor",
  "progresso",
  "publicamos",
  "quem",
  "recebido",
  "reembolso",
  "reenviar",
  "renova",
  "salvar",
  "salvo",
  "seguro",
  "semestral",
  "senha",
  "somos",
  "sua",
  "tarifas",
  "termos",
  "todos",
  "tradutor",
  "trilhas",
  "válido",
  "verificando",
  "vídeos",
  "voltar",
]);

function cacheKey(lang: string) {
  return LS_PREFIX + lang;
}

function loadCache(lang: string): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(cacheKey(lang)) ?? "{}");
  } catch {
    return {};
  }
}

function saveCache(lang: string, cache: Record<string, string>) {
  try {
    window.localStorage.setItem(cacheKey(lang), JSON.stringify(cache));
  } catch {
    /* ignore quota */
  }
}

function splitWhitespace(value: string) {
  const prefix = value.match(/^\s*/)?.[0] ?? "";
  const suffix = value.match(/\s*$/)?.[0] ?? "";
  return { prefix, core: value.trim(), suffix };
}

function cleanTranslation(value: string) {
  return value.replace(/^\s*\d+[.)]\s*/, "").trim();
}

function hasPortugueseSignal(text: string) {
  const normalized = text.trim().toLowerCase();
  if (!normalized || normalized.length < 2) return false;
  if (/^(awã tech|akuã|akuá!?|patxôhã|pataxó|premium|android|iphone|pwa)$/i.test(normalized)) {
    return false;
  }
  if (/[áàâãéêíóôõúç]/i.test(normalized)) return true;
  const words = normalized.match(/[a-záàâãéêíóôõúç]+/gi) ?? [];
  return words.some((word) => COMMON_PORTUGUESE_WORDS.has(word));
}

function shouldTranslateText(text: string) {
  const core = text.trim();
  if (!core || core.length > 1200) return false;
  if (!/[\p{L}]/u.test(core)) return false;
  return hasPortugueseSignal(core);
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(SKIP_SELECTOR));
}

function collectTextNodes(root: ParentNode) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      const original = ORIGINAL_TEXT.get(node as Text) ?? node.nodeValue ?? "";
      return shouldTranslateText(original) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

function collectAttributeNodes(root: ParentNode) {
  const targets: { element: Element; attr: "placeholder" | "aria-label" | "title"; original: string }[] = [];
  const elements = Array.from(root.querySelectorAll("input, textarea, button, a, [title], [aria-label]"));
  elements.forEach((element) => {
    if (element.closest(SKIP_SELECTOR)) return;
    (["placeholder", "aria-label", "title"] as const).forEach((attr) => {
      const value = element.getAttribute(attr);
      if (!value) return;
      const stored = ORIGINAL_ATTR.get(element)?.[attr] ?? value;
      if (shouldTranslateText(stored)) targets.push({ element, attr, original: stored });
    });
  });
  return targets;
}

export function AppLanguageAutoTranslator() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase();
  const runId = useRef(0);
  const langRef = useRef(lang);
  const timeoutRef = useRef<number | null>(null);

  langRef.current = lang;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.body;
    if (!root) return;

    const translatePage = () => {
      const id = ++runId.current;
      const textNodes = collectTextNodes(root);
      const attrTargets = collectAttributeNodes(root);

      textNodes.forEach((node) => {
        if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue ?? "");
      });
      attrTargets.forEach(({ element, attr, original }) => {
        const current = ORIGINAL_ATTR.get(element) ?? {};
        if (!current[attr]) ORIGINAL_ATTR.set(element, { ...current, [attr]: original });
      });

      if (lang === "pt" || lang === "pat") {
        textNodes.forEach((node) => {
          const original = ORIGINAL_TEXT.get(node);
          if (original !== undefined && node.nodeValue !== original) node.nodeValue = original;
        });
        attrTargets.forEach(({ element, attr }) => {
          const original = ORIGINAL_ATTR.get(element)?.[attr];
          if (original !== undefined && element.getAttribute(attr) !== original) {
            element.setAttribute(attr, original);
          }
        });
        return;
      }

      const cache = loadCache(lang);
      const sources = Array.from(
        new Set([
          ...textNodes.map((node) => ORIGINAL_TEXT.get(node) ?? node.nodeValue ?? ""),
          ...attrTargets.map((target) => target.original),
        ].map((text) => text.trim()).filter((text) => text && shouldTranslateText(text))),
      );
      const missing = sources.filter((source) => !(source in cache) && !PENDING.has(`${lang}\u0001${source}`));

      const apply = (dict: Record<string, string>) => {
        if (id !== runId.current || langRef.current !== lang) return;
        textNodes.forEach((node) => {
          const original = ORIGINAL_TEXT.get(node) ?? node.nodeValue ?? "";
          const { prefix, core, suffix } = splitWhitespace(original);
          const translated = dict[core];
          if (translated) node.nodeValue = `${prefix}${cleanTranslation(translated)}${suffix}`;
        });
        attrTargets.forEach(({ element, attr, original }) => {
          const translated = dict[original.trim()];
          if (translated) element.setAttribute(attr, cleanTranslation(translated));
        });
      };

      apply(cache);
      if (missing.length === 0) return;

      missing.forEach((source) => PENDING.add(`${lang}\u0001${source}`));

      translateI18n({ data: { texts: missing, lang } })
        .then((res) => {
          const next = { ...cache };
          missing.forEach((source, index) => {
            const value = res.translations?.[index];
            next[source] = value || source;
            PENDING.delete(`${lang}\u0001${source}`);
          });
          saveCache(lang, next);
          apply(next);
        })
        .catch(() => {
          missing.forEach((source) => PENDING.delete(`${lang}\u0001${source}`));
        });
    };

    const schedule = () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(translatePage, 120);
    };

    schedule();
    const observer = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.type === "childList")) return;
      schedule();
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      runId.current += 1;
      observer.disconnect();
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [lang]);

  return null;
}