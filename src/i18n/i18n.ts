/**
 * Internationalization (i18n) Service
 * Lightweight, type-safe translation system
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===== TYPES =====

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousand: string;
    currency: string;
  };
}

export type TranslationKey = string;
export type TranslationValue = string | ((params: Record<string, unknown>) => string);
export type Translations = Record<TranslationKey, TranslationValue>;

// ===== LOCALE CONFIGS =====

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    dateFormat: 'YYYY년 MM월 DD일',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      currency: '₩',
    },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MMM DD, YYYY',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      currency: '$',
    },
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      currency: '¥',
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: {
      decimal: '.',
      thousand: ',',
      currency: '¥',
    },
  },
};

// ===== TRANSLATION STORE =====

interface I18nState {
  locale: Locale;
  translations: Record<Locale, Translations>;
  setLocale: (locale: Locale) => void;
  loadTranslations: (locale: Locale, translations: Translations) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      translations: {
        ko: {},
        en: {},
        ja: {},
        zh: {},
      },
      setLocale: (locale) => {
        set({ locale });
        document.documentElement.lang = locale;
        document.documentElement.dir = LOCALE_CONFIGS[locale].direction;
      },
      loadTranslations: (locale, translations) => {
        set((state) => ({
          translations: {
            ...state.translations,
            [locale]: { ...state.translations[locale], ...translations },
          },
        }));
      },
    }),
    {
      name: 'uptime-i18n',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

// ===== DETECT LOCALE =====

function detectLocale(): Locale {
  // Check stored preference
  try {
    const stored = localStorage.getItem('uptime-i18n');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.locale && LOCALE_CONFIGS[state.locale as Locale]) {
        return state.locale;
      }
    }
  } catch {
    // Ignore storage errors
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase().split('-')[0];
  if (browserLang in LOCALE_CONFIGS) {
    return browserLang as Locale;
  }

  // Check navigator.languages
  for (const lang of navigator.languages) {
    const code = lang.toLowerCase().split('-')[0];
    if (code in LOCALE_CONFIGS) {
      return code as Locale;
    }
  }

  // Default to Korean
  return 'ko';
}

// ===== TRANSLATION FUNCTION =====

export function t(key: string, params?: Record<string, unknown>): string {
  const state = useI18nStore.getState();
  const { locale, translations } = state;

  // Try current locale
  let value = translations[locale][key];

  // Fallback to English
  if (value === undefined && locale !== 'en') {
    value = translations.en[key];
  }

  // Fallback to key
  if (value === undefined) {
    console.warn(`Missing translation: ${key}`);
    return key;
  }

  // Handle function translations (for complex pluralization, etc.)
  if (typeof value === 'function') {
    return value(params || {});
  }

  // Simple string interpolation
  if (params) {
    return interpolate(value, params);
  }

  return value;
}

function interpolate(template: string, params: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

// ===== HOOKS =====

export function useTranslation() {
  const { locale, setLocale, translations } = useI18nStore();

  const translate = (key: string, params?: Record<string, unknown>): string => {
    let value = translations[locale][key];

    if (value === undefined && locale !== 'en') {
      value = translations.en[key];
    }

    if (value === undefined) {
      return key;
    }

    if (typeof value === 'function') {
      return value(params || {});
    }

    if (params) {
      return interpolate(value, params);
    }

    return value;
  };

  return {
    t: translate,
    locale,
    setLocale,
    localeConfig: LOCALE_CONFIGS[locale],
  };
}

export function useLocale() {
  const { locale, setLocale } = useI18nStore();
  return { locale, setLocale, config: LOCALE_CONFIGS[locale] };
}

// ===== FORMAT UTILITIES =====

export function formatNumber(
  value: number,
  locale: Locale = useI18nStore.getState().locale
): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(
  value: number,
  locale: Locale = useI18nStore.getState().locale
): string {
  const config = LOCALE_CONFIGS[locale];
  const currencyCode = {
    ko: 'KRW',
    en: 'USD',
    ja: 'JPY',
    zh: 'CNY',
  }[locale];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: locale === 'ko' || locale === 'ja' ? 0 : 2,
  }).format(value);
}

export function formatDate(
  date: Date | number | string,
  locale: Locale = useI18nStore.getState().locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatRelativeTime(
  date: Date | number,
  locale: Locale = useI18nStore.getState().locale
): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

export function formatPercent(
  value: number,
  locale: Locale = useI18nStore.getState().locale
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

// ===== PLURALIZATION =====

export function plural(
  count: number,
  forms: { zero?: string; one: string; other: string },
  locale: Locale = useI18nStore.getState().locale
): string {
  const rules = new Intl.PluralRules(locale);
  const rule = rules.select(count);

  if (count === 0 && forms.zero) {
    return forms.zero.replace('{{count}}', String(count));
  }

  if (rule === 'one' && forms.one) {
    return forms.one.replace('{{count}}', String(count));
  }

  return forms.other.replace('{{count}}', String(count));
}

// ===== LAZY LOADING =====

const loadedLocales = new Set<Locale>(['ko']); // Korean is loaded by default

export async function loadLocale(locale: Locale): Promise<void> {
  if (loadedLocales.has(locale)) {
    return;
  }

  try {
    const translations = await import(`./locales/${locale}.ts`);
    useI18nStore.getState().loadTranslations(locale, translations.default);
    loadedLocales.add(locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
  }
}

// ===== INITIALIZE =====

export async function initI18n(): Promise<void> {
  const locale = useI18nStore.getState().locale;

  // Load Korean translations (default)
  const koTranslations = await import('./locales/ko');
  useI18nStore.getState().loadTranslations('ko', koTranslations.default);

  // Load current locale if different
  if (locale !== 'ko') {
    await loadLocale(locale);
  }

  // Set document attributes
  document.documentElement.lang = locale;
  document.documentElement.dir = LOCALE_CONFIGS[locale].direction;
}

// ===== BACKWARDS COMPATIBILITY =====
// For existing LanguageSelect component

export type Language = Locale;

export const languageInfo: Record<Language, { flag: string; name: string }> = {
  ko: { flag: '🇰🇷', name: '한국어' },
  en: { flag: '🇺🇸', name: 'English' },
  ja: { flag: '🇯🇵', name: '日本語' },
  zh: { flag: '🇨🇳', name: '中文' },
};

export function useI18n() {
  const { locale, setLocale } = useI18nStore();
  return {
    language: locale,
    setLanguage: setLocale,
  };
}
