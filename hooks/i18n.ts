import type { Locale } from '../types'

// Per-language strings: bar names (screen-reader alt text) and the reset countdown format
interface IMessages {
  context: string // context window bar
  fiveHour: string // 5-hour limit bar
  sevenDay: string // 7-day limit bar
  daysHours: (days: number, hours: number) => string // countdown over a day
  hoursMinutes: (hours: number, minutes: number) => string // countdown under a day
  minutes: (minutes: number) => string // countdown under an hour
  rtl?: true // right-to-left script (countdown is laid out RTL so digits and units keep their order)
}

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'zh-CN', 'zh-TW', 'ja', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'id']
export const DEFAULT_LOCALE: Locale = 'en'

export const MESSAGES: Record<Locale, IMessages> = {
  en: {
    context: 'Context',
    fiveHour: '5-hour limit',
    sevenDay: '7-day limit',
    daysHours: (d, h) => `${d}d${h}h`,
    hoursMinutes: (h, m) => `${h}h${m}m`,
    minutes: (m) => `${m}m`
  },
  'zh-CN': {
    context: '上下文',
    fiveHour: '5 小时额度',
    sevenDay: '7 天额度',
    daysHours: (d, h) => `${d}天${h}时`,
    hoursMinutes: (h, m) => `${h}时${m}分`,
    minutes: (m) => `${m}分`
  },
  'zh-TW': {
    context: '上下文',
    fiveHour: '5 小時額度',
    sevenDay: '7 天額度',
    daysHours: (d, h) => `${d}天${h}時`,
    hoursMinutes: (h, m) => `${h}時${m}分`,
    minutes: (m) => `${m}分`
  },
  ja: {
    context: 'コンテキスト',
    fiveHour: '5時間の上限',
    sevenDay: '7日間の上限',
    daysHours: (d, h) => `${d}日${h}時間`,
    hoursMinutes: (h, m) => `${h}時間${m}分`,
    minutes: (m) => `${m}分`
  },
  hi: {
    context: 'कॉन्टेक्स्ट',
    fiveHour: '5 घंटे की सीमा',
    sevenDay: '7 दिन की सीमा',
    daysHours: (d, h) => `${d}दि ${h}घं`,
    hoursMinutes: (h, m) => `${h}घं ${m}मि`,
    minutes: (m) => `${m}मि`
  },
  es: {
    context: 'Contexto',
    fiveHour: 'Límite de 5 horas',
    sevenDay: 'Límite de 7 días',
    daysHours: (d, h) => `${d}d${h}h`,
    hoursMinutes: (h, m) => `${h}h${m}min`,
    minutes: (m) => `${m}min`
  },
  ar: {
    context: 'السياق',
    fiveHour: 'حد 5 ساعات',
    sevenDay: 'حد 7 أيام',
    daysHours: (d, h) => `${d}ي ${h}س`,
    hoursMinutes: (h, m) => `${h}س ${m}د`,
    minutes: (m) => `${m}د`,
    rtl: true
  },
  fr: {
    context: 'Contexte',
    fiveHour: 'Limite de 5 heures',
    sevenDay: 'Limite de 7 jours',
    daysHours: (d, h) => `${d}j${h}h`,
    hoursMinutes: (h, m) => `${h}h${m}min`,
    minutes: (m) => `${m}min`
  },
  bn: {
    context: 'কনটেক্সট',
    fiveHour: '৫ ঘণ্টার সীমা',
    sevenDay: '৭ দিনের সীমা',
    daysHours: (d, h) => `${d}দি ${h}ঘ`,
    hoursMinutes: (h, m) => `${h}ঘ ${m}মি`,
    minutes: (m) => `${m}মি`
  },
  pt: {
    context: 'Contexto',
    fiveHour: 'Limite de 5 horas',
    sevenDay: 'Limite de 7 dias',
    daysHours: (d, h) => `${d}d${h}h`,
    hoursMinutes: (h, m) => `${h}h${m}min`,
    minutes: (m) => `${m}min`
  },
  ru: {
    context: 'Контекст',
    fiveHour: 'Лимит 5 часов',
    sevenDay: 'Лимит 7 дней',
    daysHours: (d, h) => `${d}д ${h}ч`,
    hoursMinutes: (h, m) => `${h}ч ${m}м`,
    minutes: (m) => `${m}м`
  },
  id: {
    context: 'Konteks',
    fiveHour: 'Batas 5 jam',
    sevenDay: 'Batas 7 hari',
    daysHours: (d, h) => `${d}h ${h}j`,
    hoursMinutes: (h, m) => `${h}j ${m}m`,
    minutes: (m) => `${m}m`
  }
}

// Free-text language names as Claude Code's `language` setting may hold them ("japanese", "繁體中文", ...)
const LANGUAGE_NAME_HINTS: readonly [RegExp, Locale][] = [
  [/繁體|繁体|traditional|台灣|臺灣|taiwan|香港|hong ?kong/i, 'zh-TW'],
  [/简体|簡體|simplified|中文|chinese|mandarin|普通话/i, 'zh-CN'],
  [/日本|japanese|nihongo/i, 'ja'],
  [/hindi|हिन्दी|हिंदी/i, 'hi'],
  [/spanish|español|espanol|castellano/i, 'es'],
  [/arabic|العربية|عربي/i, 'ar'],
  [/french|français|francais/i, 'fr'],
  [/bengali|bangla|বাংলা/i, 'bn'],
  [/portuguese|português|portugues/i, 'pt'],
  [/russian|русский/i, 'ru'],
  [/indonesian|bahasa indonesia|indonesia/i, 'id'],
  [/english/i, 'en']
]

// Normalizes a locale tag (zh_TW.UTF-8, zh-Hant-HK, ja-JP, pt_BR, in_ID ...) to a supported locale
export const normalizeLocale = (raw: string | undefined): Locale | null => {
  if (!raw) return null

  const tag = raw.trim().toLowerCase().replace(/_/g, '-').split('.')[0] ?? ''
  if (!tag || tag === 'c' || tag === 'posix') return null

  // Chinese: Traditional for Hant / TW / HK / MO, otherwise Simplified
  if (tag.startsWith('zh')) return /hant|-tw|-hk|-mo/.test(tag) ? 'zh-TW' : 'zh-CN'

  // Other languages by their primary subtag (`in` is the legacy code for Indonesian)
  const primary = tag.split('-')[0] ?? ''
  if (primary === 'in') return 'id'
  return SUPPORTED_LOCALES.find((locale) => locale === primary) ?? null
}

// Maps a free-text language name (Claude Code's `language` setting) to a supported locale
export const localeFromLanguageName = (name: string | undefined): Locale | null => {
  if (!name) return null

  const asTag = normalizeLocale(name)
  if (asTag) return asTag

  const hint = LANGUAGE_NAME_HINTS.find(([pattern]) => pattern.test(name))
  return hint ? hint[1] : null
}
