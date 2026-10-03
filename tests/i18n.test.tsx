import { test, expect, mock } from 'claude-code/testing'

import { MESSAGES, SUPPORTED_LOCALES, localeFromLanguageName, normalizeLocale } from '../hooks/i18n'

const NOW = Date.parse('2026-10-03T10:00:00Z')
const PROPS = { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 160 } as any

const USAGE = {
  startedAt: NOW,
  context: { tokens: 84000, window: 200000, percent: 42 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 63.5, resetsAt: new Date(NOW + 2 * 3600e3 + 15 * 60e3).toISOString() },
    { kind: 'seven_day', percentUsed: 88, resetsAt: new Date(NOW + 3 * 86400e3 + 5 * 3600e3).toISOString() }
  ]
} as any

// Engine stand-ins: settings.language, environment variables and macOS AppleLanguages are each controllable
const setup = (on: any, world: { language?: string; env?: Record<string, string>; apple?: string }) => {
  const clock = mock.clock(on, { now: NOW })
  mock.env(on, world.env ?? {})
  on('settings.read', () => ({ value: world.language ? { language: world.language } : {} }))
  on('process.run', () => ({ value: world.apple ? { exitCode: 0, stdout: world.apple, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' } }))
  on('session.usage', () => ({ value: USAGE }))
  on('session.start', (_$: any, e: any) => ({ cwd: e.cwd }))
  on('ui.render', ($: any, e: any) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  return clock
}

// Starts a session and returns the countdown texts drawn on desktop
const countdowns = async ($: any, clock: any) => {
  await $.session.start({ cwd: '/tmp', surface: 'desktop', isInteractive: true })
  await clock.settle()
  const ui = await $.ui.mount({ plugin: 'quota-bars', surface: 'desktop', component: 'AbovePrompt', props: PROPS })
  const svgs = await ui.findAll({ type: 'Svg' })
  return svgs.filter((svg: any) => String(svg.props.source).includes('ui-monospace')).map((svg: any) => svg.props.alt)
}

test('every locale has every message and a non-empty countdown format', () => {
  expect(SUPPORTED_LOCALES).toHaveLength(12)
  for (const locale of SUPPORTED_LOCALES) {
    const messages = MESSAGES[locale]
    expect(messages.context.length).toBeGreaterThan(0)
    expect(messages.fiveHour.length).toBeGreaterThan(0)
    expect(messages.sevenDay.length).toBeGreaterThan(0)
    expect(messages.daysHours(3, 5)).toContain('3')
    expect(messages.hoursMinutes(2, 15)).toContain('15')
    expect(messages.minutes(45)).toContain('45')
  }
})

test('locale tags normalize to supported locales', () => {
  expect(normalizeLocale('zh_TW.UTF-8')).toBe('zh-TW')
  expect(normalizeLocale('zh-Hant-HK')).toBe('zh-TW')
  expect(normalizeLocale('zh-Hans-CN')).toBe('zh-CN')
  expect(normalizeLocale('zh_CN.UTF-8')).toBe('zh-CN')
  expect(normalizeLocale('ja_JP.UTF-8')).toBe('ja')
  expect(normalizeLocale('pt-BR')).toBe('pt')
  expect(normalizeLocale('in_ID')).toBe('id')
  expect(normalizeLocale('de_DE.UTF-8')).toBeNull()
  expect(normalizeLocale('C')).toBeNull()
  expect(localeFromLanguageName('繁體中文')).toBe('zh-TW')
  expect(localeFromLanguageName('Japanese')).toBe('ja')
  expect(localeFromLanguageName('español')).toBe('es')
})

test('config menu choice wins over everything', { options: { language: 'ja' } }, async ($, on) => {
  const clock = setup(on, { language: 'french', env: { LANG: 'ru_RU.UTF-8' } })
  expect(await countdowns($, clock)).toEqual(['2時間15分', '3日5時間'])
})

test('auto: Claude Code language setting comes first', async ($, on) => {
  const clock = setup(on, { language: '繁體中文', env: { LANG: 'fr_FR.UTF-8' } })
  expect(await countdowns($, clock)).toEqual(['2時15分', '3天5時'])
})

test('auto: then LC_ALL / LANG', async ($, on) => {
  const clock = setup(on, { env: { LANG: 'fr_FR.UTF-8' } })
  expect(await countdowns($, clock)).toEqual(['2h15min', '3j5h'])
})

test('auto: then macOS AppleLanguages', async ($, on) => {
  const clock = setup(on, { apple: '(\n    "zh-Hans-CN",\n    "en-CN"\n)\n' })
  expect(await countdowns($, clock)).toEqual(['2时15分', '3天5时'])
})

test('auto: English when nothing is known', async ($, on) => {
  const clock = setup(on, { env: { LANG: 'C' } })
  expect(await countdowns($, clock)).toEqual(['2h15m', '3d5h'])
})
