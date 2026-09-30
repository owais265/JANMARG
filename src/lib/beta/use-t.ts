import { translate, type Lang } from "./i18n";
import { useBeta } from "./store";

export function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return Object.entries(vars).reduce((acc, [key, value]) => acc.split(`{${key}}`).join(String(value)), text);
}

export function useT() {
  const language = useBeta((state) => state.language);
  const setLanguage = useBeta((state) => state.setLanguage);
  const t = (key: string, vars?: Record<string, string | number>) => fill(translate(language, key), vars);
  return { t, language, setLanguage };
}

export type { Lang };
