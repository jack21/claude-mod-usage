// One rate-limit window
export type QuotaWindow = {
  percent: number // percent used, 0-100
  resetsAt?: number // reset time (epoch ms)
}

// A window beyond the fixed ones (e.g. a per-model weekly limit), keyed by the engine's kind
export type ExtraQuotaWindow = QuotaWindow & {
  kind: string // rate-limit kind as the engine reports it, e.g. "seven_day_fable"
}

// The bars' data; a missing one is not drawn
export type QuotaUsage = {
  contextPercent?: number // context window usage
  fiveHour?: QuotaWindow // 5-hour session limit
  sevenDay?: QuotaWindow // 7-day weekly limit
  extra?: ExtraQuotaWindow[] // any other window the engine reports, drawn after the fixed ones
}

// Supported display languages
export type Locale = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'hi' | 'es' | 'ar' | 'fr' | 'bn' | 'pt' | 'ru' | 'id'

declare module 'claude-code' {
  interface PluginState {
    'mod-usage': {
      usage: QuotaUsage | null // latest measurement
      locale: Locale // resolved display language
    }
  }
}
