"use client";

import { useEffect } from "react";

import { sfx } from "~/lib/sfx";
import { LOCALES, LOCALE_LABELS, useLocaleStore } from "~/i18n";

export function LanguageToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const hydrate = useLocaleStore((s) => s.hydrate);

  // Apply the persisted choice after mount (avoids hydration mismatch).
  useEffect(() => hydrate(), [hydrate]);

  return (
    <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white/70 p-0.5 shadow-md backdrop-blur dark:bg-zinc-800/70">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => {
            if (l !== locale) {
              setLocale(l);
              sfx.play("click");
            }
          }}
          className={[
            "rounded-full px-3 py-1 text-xs font-bold transition-colors",
            locale === l
              ? "bg-indigo-600 text-white"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100",
          ].join(" ")}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
