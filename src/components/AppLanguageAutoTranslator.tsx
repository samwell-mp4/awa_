import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { translateI18n } from "@/lib/i18n-translate.functions";

const LS_PREFIX = "awa_i18n_dom_v4_";
const ORIGINAL_TEXT = new WeakMap<Text, string>();
const ORIGINAL_ATTR = new WeakMap<Element, Record<string, string>>();
const PENDING = new Set<string>();

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS", "CODE", "PRE"]);

const SKIP_EXACT = new Set([
  "awã tech",
  "awa tech",
  "awã",
  "awa",
  "akuã",
  "akua",
  "patxôhã",
  "patxoha",
  "pataxó",
  "pataxo",
]);

const STATIC_DICT: Record<string, Record<string, string>> = {
  en: {
    "Início": "Home",
    "Trilhas": "Trails",
    "Trilhas de Estudo": "Study Trails",
    "Músicas": "Songs",
    "Músicas & Cânticos": "Songs & Chants",
    "Histórias": "Stories",
    "Histórias Ancestrais": "Ancestral Stories",
    "Jogos": "Games",
    "Jogos Culturais": "Cultural Games",
    "Números": "Numbers",
    "Aprender Números": "Learn Numbers",
    "Amizade Awã": "Awã Friendship",
    "Professor Awã": "Professor Awã",
    "Professor Akuã": "Professor Akuã",
    "Meu Progresso": "My Progress",
    "Meu Aprendizado": "My Learning",
    "Conquistas": "Achievements",
    "Língua & Conhecimento": "Language & Knowledge",
    "Cultura & Tradição": "Culture & Tradition",
    "Minha Conta & App": "My Account & App",
    "Planos & Assinatura": "Plans & Subscription",
    "Minha Conta": "My Account",
    "Instalar App": "Install App",
    "Painel Admin": "Admin Panel",
    "Painel Administrativo": "Admin Panel",
    "Sair": "Sign out",
    "Sair da conta": "Sign out",
    "Entrar": "Sign in",
    "Cadastrar": "Register",
    "Membro Awã": "Awã Member",
    "Ler História": "Read Story",
    "3 min de leitura": "3 min read",
    "Guardião da memória": "Guardian of memory",
    "Vídeo Bilíngue": "Bilingual Video",
    "Saudações": "Greetings",
    "Voltar": "Back",
    "Aprender": "Learn",
  },
  es: {
    "Início": "Inicio",
    "Trilhas": "Senderos",
    "Trilhas de Estudo": "Senderos de Estudio",
    "Músicas": "Canciones",
    "Músicas & Cânticos": "Canciones y Cantos",
    "Histórias": "Historias",
    "Histórias Ancestrais": "Historias Ancestrales",
    "Jogos": "Juegos",
    "Jogos Culturais": "Juegos Culturales",
    "Números": "Números",
    "Aprender Números": "Aprender Números",
    "Amizade Awã": "Amistad Awã",
    "Professor Awã": "Profesor Awã",
    "Professor Akuã": "Profesor Akuã",
    "Meu Progresso": "Mi Progreso",
    "Meu Aprendizado": "Mi Aprendizaje",
    "Conquistas": "Logros",
    "Língua & Conhecimento": "Lengua y Conocimiento",
    "Cultura & Tradição": "Cultura y Tradición",
    "Minha Conta & App": "Mi Cuenta y App",
    "Planos & Assinatura": "Planes y Suscripción",
    "Minha Conta": "Mi Cuenta",
    "Instalar App": "Instalar App",
    "Painel Admin": "Panel Admin",
    "Painel Administrativo": "Panel Administrativo",
    "Sair": "Cerrar sesión",
    "Sair da conta": "Cerrar sesión",
    "Entrar": "Iniciar sesión",
    "Cadastrar": "Registrarse",
    "Membro Awã": "Miembro Awã",
    "Ler História": "Leer Historia",
    "3 min de leitura": "3 min de lectura",
    "Guardião da memória": "Guardián de la memoria",
    "Vídeo Bilíngue": "Video Bilingüe",
    "Saudações": "Saludos",
    "Voltar": "Volver",
    "Aprender": "Aprender",
  },
};

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

function shouldTranslateText(text: string): boolean {
  const core = text.trim();
  if (!core || core.length < 2 || core.length > 2500) return false;
  // Must contain at least one unicode letter
  if (!/[\p{L}]/u.test(core)) return false;
  // Skip pure numbers, times, percentages, versions (e.g. "12:30", "1.0.0", "100%", "2026")
  if (/^[\d\s:.,/\\#%+-]+$/.test(core)) return false;
  // Skip pure URLs or file paths or emails
  if (/^(https?:\/\/|\/api\/|mailto:|[\w.-]+@[\w.-]+\.\w+)/i.test(core)) return false;
  // Skip exact brand / indigenous names if standing completely on their own
  if (SKIP_EXACT.has(core.toLowerCase())) return false;
  return true;
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest("[data-no-auto-translate]")) return true;
  let curr: HTMLElement | null = parent;
  while (curr && curr !== document.body) {
    if (SKIP_TAGS.has(curr.tagName)) return true;
    if (curr.getAttribute("contenteditable") === "true") return true;
    curr = curr.parentElement;
  }
  return false;
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
    if (element.closest("[data-no-auto-translate], script, style, svg")) return;
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

  // Clean up legacy broken caches on startup
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k === "awa_i18n_dom_en" || k === "awa_i18n_dom_es" || k.startsWith("awa_i18n_dom_pt"))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }, []);

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
      const staticEntries = STATIC_DICT[lang] || {};
      const mergedCache = { ...staticEntries, ...cache };

      const sources = Array.from(
        new Set([
          ...textNodes.map((node) => ORIGINAL_TEXT.get(node) ?? node.nodeValue ?? ""),
          ...attrTargets.map((target) => target.original),
        ].map((text) => text.trim()).filter((text) => text && shouldTranslateText(text))),
      );

      const apply = (dict: Record<string, string>) => {
        if (id !== runId.current || langRef.current !== lang) return;
        textNodes.forEach((node) => {
          const original = ORIGINAL_TEXT.get(node) ?? node.nodeValue ?? "";
          const { prefix, core, suffix } = splitWhitespace(original);
          const translated = dict[core] || staticEntries[core];
          if (translated) node.nodeValue = `${prefix}${cleanTranslation(translated)}${suffix}`;
        });
        attrTargets.forEach(({ element, attr, original }) => {
          const core = original.trim();
          const translated = dict[core] || staticEntries[core];
          if (translated) element.setAttribute(attr, cleanTranslation(translated));
        });
      };

      // Apply static dictionary and current cache immediately
      apply(mergedCache);

      // Find any texts still missing from cache
      const missing = sources.filter((source) => !(source in mergedCache) && !PENDING.has(`${lang}\u0001${source}`));
      if (missing.length === 0) return;

      missing.forEach((source) => PENDING.add(`${lang}\u0001${source}`));

      translateI18n({ data: { texts: missing, lang } })
        .then((res) => {
          const next = { ...cache };
          missing.forEach((source, index) => {
            const value = res.translations?.[index];
            if (value && value !== source) {
              next[source] = value;
            }
            PENDING.delete(`${lang}\u0001${source}`);
          });
          saveCache(lang, next);
          apply({ ...mergedCache, ...next });
        })
        .catch(() => {
          missing.forEach((source) => PENDING.delete(`${lang}\u0001${source}`));
        });
    };

    const schedule = () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(translatePage, 100);
    };

    schedule();
    const observer = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.type === "childList")) return;
      schedule();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      runId.current += 1;
      observer.disconnect();
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [lang]);

  return null;
}