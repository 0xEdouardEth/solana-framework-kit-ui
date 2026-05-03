import type { Labels } from "@/config";
import { useConfig } from "@/config";
import { useEffect, useMemo, useState } from "react";
import { en } from "./locales/en";

/** Supported locale codes. */
const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "zh", "ja", "pt", "ru", "ko", "ar"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Static map of locale loaders so bundlers (Vite, webpack) can statically
 * analyse the imports and emit separate chunks per language.
 */
const loaders: Record<SupportedLocale, () => Promise<Labels>> = {
  en: async () => en,
  fr: () => import("./locales/fr").then((m) => m.fr),
  es: () => import("./locales/es").then((m) => m.es),
  de: () => import("./locales/de").then((m) => m.de),
  zh: () => import("./locales/zh").then((m) => m.zh),
  ja: () => import("./locales/ja").then((m) => m.ja),
  pt: () => import("./locales/pt").then((m) => m.pt),
  ru: () => import("./locales/ru").then((m) => m.ru),
  ko: () => import("./locales/ko").then((m) => m.ko),
  ar: () => import("./locales/ar").then((m) => m.ar),
};

/** In-memory cache so each locale is fetched at most once per session. */
const cache = new Map<string, Labels>([["en", en]]);

/**
 * Loads a locale asynchronously, falling back to English on error.
 * Results are cached for the lifetime of the page.
 */
async function loadLocale(locale: string): Promise<Labels> {
  const cached = cache.get(locale);
  if (cached) return cached;

  const loader = loaders[locale as SupportedLocale];
  if (!loader) return en;

  try {
    const labels = await loader();
    cache.set(locale, labels);
    return labels;
  } catch {
    return en;
  }
}

/**
 * Resolves the active locale from the browser's navigator.language,
 * falling back to "en" if the detected language is not supported.
 */
export function resolveLocale(): string {
  if (typeof navigator === "undefined" || !navigator.language) return "en";
  const lang = navigator.language.split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(lang as SupportedLocale) ? lang : "en";
}

/**
 * Resolves the full Labels object for a given locale and optional overrides.
 * Synchronous — only has access to locales already in the cache (always includes "en").
 */
export function resolveLabels(locale?: string, overrides?: Partial<Labels>): Labels {
  const base = cache.get(locale ?? resolveLocale()) ?? en;
  return overrides ? { ...base, ...overrides } : base;
}

/**
 * Returns the full Labels object for the current locale,
 * merged with any partial label overrides from config.
 * Starts with English synchronously, then swaps to the detected locale once loaded.
 */
export function useLabels(): Labels {
  const { locale, labels } = useConfig();
  const resolvedLocale = locale ?? resolveLocale();

  const [translations, setTranslations] = useState<Labels>(() => cache.get(resolvedLocale) ?? en);

  useEffect(() => {
    let cancelled = false;
    loadLocale(resolvedLocale).then((loaded) => {
      if (!cancelled) setTranslations(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [resolvedLocale]);

  return useMemo(
    () => (labels ? { ...translations, ...labels } : translations),
    [translations, labels],
  );
}
