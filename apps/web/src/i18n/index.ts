"use client";

import { create } from "zustand";

import { LOCALES, messages, type Locale } from "./messages";

const STORAGE_KEY = "qazquiz:locale";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  hydrate: () => void;
}

/**
 * Locale starts as "en" so server render and first client render match
 * (no hydration mismatch); `hydrate()` then reads the persisted choice.
 */
export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",
  setLocale: (locale) => {
    set({ locale });
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, locale);
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      set({ locale: stored as Locale });
    }
  },
}));

/** Replace {placeholders} in a translated string. */
export function format(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

/**
 * Main translation hook. `m` is the fully-typed message tree for the
 * active locale; `t` formats a string with interpolation params.
 *
 *   const { m, t } = useI18n();
 *   <h1>{m.home.title}</h1>
 *   <p>{t(m.over.you, { rank, score })}</p>
 */
export function useI18n() {
  const locale = useLocaleStore((s) => s.locale);
  return { locale, m: messages[locale], t: format };
}

export { LOCALES, LOCALE_LABELS, type Locale } from "./messages";
