// One rate-limit window
export type QuotaWindow = {
  percent: number // percent used, 0-100
  resetsAt?: number // reset time (epoch ms)
}

// The three bars' data; a missing one is not drawn
export type QuotaUsage = {
  contextPercent?: number // context window usage
  fiveHour?: QuotaWindow // 5-hour session limit
  sevenDay?: QuotaWindow // 7-day weekly limit
}

// Supported display languages
export type Locale = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'hi' | 'es' | 'ar' | 'fr' | 'bn' | 'pt' | 'ru' | 'id'

declare module 'claude-code' {
  interface PluginState {
    'quota-bars': {
      usage: QuotaUsage | null // latest measurement
      locale: Locale // resolved display language
    }
  }
}
