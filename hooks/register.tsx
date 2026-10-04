import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionContextUsage, SessionRateLimit } from 'claude-code'

import type { ExtraQuotaWindow, Locale, QuotaUsage, QuotaWindow } from '../types'
import { DEFAULT_LOCALE, MESSAGES, localeFromLanguageName, normalizeLocale } from './i18n'

// claude-mod-usage: Claude context / 5-hour / 7-day usage as gradient progress bars above the prompt

// Bar keys: React key, SVG id prefix and icon table key
const SegmentKey = {
  CONTEXT: 'context',
  FIVE: 'five',
  WEEK: 'week'
} as const
type TSegmentKey = (typeof SegmentKey)[keyof typeof SegmentKey]

// Kinds with a bar of their own (or, for a gateway's spend limit, deliberately none); anything else is an extra bar
const FIXED_KINDS = ['five_hour', 'seven_day', 'spend_limit']

// What one bar draws
interface ISegmentInput {
  key: TSegmentKey | `extra-${string}` // bar key; extras carry the engine's kind
  letter?: string // calendar-icon letter for an extra bar
  name: string // screen-reader name, localized
  percent: number // percent used, 0-100
  resetsAt?: number // reset time (epoch ms); the context bar has none
}

// Layout
const SEGMENT_GAP = 2 // columns between bars
const MIN_BAR_LEN = 6 // a bar never gets narrower than this many columns (fits "100%")
const CELL_PX_ESTIMATE = 7 // rough px per column (the API has no real value); used to inset round caps and size text slots

// Bar
const BAR_HEIGHT = 8 // bar thickness (CSS px)
const EMPTY_COLOR = '#3c3c3c' // unfilled track

// Percent label on the bar: white text with a dark outline, readable on green, yellow, red and the dark track
const LABEL_FONT_SIZE = 12
const LABEL_HEIGHT = 16
const LABEL_CHAR_PX = 8 // bold digit width, estimated on the generous side so nothing is clipped
const LABEL_FILL_COLOR = '#ffffff'
const LABEL_STROKE_COLOR = '#1e1e1e'

// Reset countdown to the right of the bar: monospace digits
const TIME_FONT_SIZE = 12
const TIME_HEIGHT = 16
const TIME_ASCII_PX = 7.4 // monospace Latin glyph (≈0.6em)
const TIME_WIDE_PX = 12.5 // CJK glyph (≈1em), falls back to the system CJK font
const TIME_OTHER_PX = 9 // other scripts (Devanagari, Bengali, Arabic, Cyrillic) in their fallback font
const TIME_COLOR = '#c8c8c8'
const TIME_FONT = `font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="500"`

// Icons: two-tone line icons, grey outline + an accent colour that follows usage
const ICON_SIZE = 18 // CSS px
const ICON_CELLS = 3 // columns an icon takes (18px ≈ 2.6 columns)
const ICON_LINE_COLOR = '#8a8a8a' // mid grey, visible on dark and light themes
const ICON_FONT = `font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="700"`

// Session state: latest usage and the resolved display language
const usage = atom({ plugin: 'mod-usage', key: 'usage' } as const, null)
const locale = atom({ plugin: 'mod-usage', key: 'locale' } as const, DEFAULT_LOCALE)

// Picks one rate-limit window and converts resetsAt to epoch ms
const _pickWindow = (rateLimits: SessionRateLimit[], kind: string): QuotaWindow | undefined => {
  const found = rateLimits.find((limit) => limit.kind === kind)
  if (!found) return undefined

  const resetsAt = found.resetsAt ? Date.parse(found.resetsAt) : NaN
  return Number.isNaN(resetsAt) ? { percent: found.percentUsed } : { percent: found.percentUsed, resetsAt }
}

// Every window that has no fixed bar (a per-model limit such as Fable's, once the engine reports one)
const _extraWindows = (rateLimits: SessionRateLimit[]): ExtraQuotaWindow[] =>
  rateLimits
    .filter((limit) => !FIXED_KINDS.includes(limit.kind))
    .map((limit) => ({ ...(_pickWindow(rateLimits, limit.kind) as QuotaWindow), kind: limit.kind }))

// The fields session.measure and $.session.usage() share, as this mod's QuotaUsage
const _toQuotaUsage = (context: SessionContextUsage, rateLimits: SessionRateLimit[]): QuotaUsage => ({
  contextPercent: context.percent,
  fiveHour: _pickWindow(rateLimits, 'five_hour'),
  sevenDay: _pickWindow(rateLimits, 'seven_day'),
  extra: _extraWindows(rateLimits)
})

// Display name of an extra window: "seven_day_fable" → "Fable", "five_hour_opus" → "Opus"
const _extraLabel = (kind: string): string => {
  const words = kind.replace(/^(five_hour|seven_day)_?/, '').split('_').filter(Boolean)
  if (words.length === 0) return kind
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Time left until reset, in the display language's format; empty once it has passed
const _formatRemaining = (resetsAt: number | undefined, nowMs: number, messages: (typeof MESSAGES)[keyof typeof MESSAGES]): string => {
  if (!resetsAt) return ''

  const diff = Math.floor((resetsAt - nowMs) / 1000)
  if (diff <= 0) return ''

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  if (days > 0) return messages.daysHours(days, hours)
  if (hours > 0) return messages.hoursMinutes(hours, minutes)
  return messages.minutes(minutes)
}

// Gradient colour at a usage level: green → yellow → red (same stops as the bar)
const _accentColor = (percent: number): string => {
  const pos = Math.min(100, Math.max(0, percent))
  const red = pos <= 50 ? Math.round((pos * 255) / 50) : 255
  const green = pos <= 50 ? 200 : Math.round(200 - ((pos - 50) * 200) / 50)
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(red)}${toHex(green)}00`
}

// Escapes text placed inside SVG markup
const _escapeXml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Shared 18×18 shell of the two-tone icons
const _iconSvg = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="none" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

// Icons: context = speech bubble with three dots, 5-hour = stopwatch "5", 7-day = calendar "7"
const _iconSources: Record<TSegmentKey, (accent: string) => string> = {
  context: (accent) =>
    _iconSvg(
      `<path d="M4.5 3h9A2.5 2.5 0 0 1 16 5.5v5a2.5 2.5 0 0 1-2.5 2.5H8.6L5.2 15.6V13h-.7A2.5 2.5 0 0 1 2 10.5v-5A2.5 2.5 0 0 1 4.5 3z" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
        `<circle cx="5.8" cy="8" r="1.25" fill="${accent}"/><circle cx="9" cy="8" r="1.25" fill="${accent}"/><circle cx="12.2" cy="8" r="1.25" fill="${accent}"/>`
    ),
  five: (accent) =>
    _iconSvg(
      `<circle cx="9" cy="10.4" r="6.3" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
        `<path d="M9 4.1V2.2M7.3 1.6h3.4" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
        `<text x="9" y="10.6" text-anchor="middle" dominant-baseline="central" font-size="9" ${ICON_FONT} fill="${accent}">5</text>`
    ),
  week: (accent) =>
    _iconSvg(
      `<rect x="2.25" y="3.5" width="13.5" height="12.75" rx="2.5" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
        `<path d="M6 1.75V5M12 1.75V5M2.25 7.25h13.5" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
        `<text x="9" y="11.6" text-anchor="middle" dominant-baseline="central" font-size="8.5" ${ICON_FONT} fill="${accent}">7</text>`
    )
}

// Extra bars: the calendar with the model's initial in place of the "7"
const _extraIcon = (letter: string, accent: string): string =>
  _iconSvg(
    `<rect x="2.25" y="3.5" width="13.5" height="12.75" rx="2.5" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
      `<path d="M6 1.75V5M12 1.75V5M2.25 7.25h13.5" stroke="${ICON_LINE_COLOR}" stroke-width="1.5"/>` +
      `<text x="9" y="11.6" text-anchor="middle" dominant-baseline="central" font-size="8.5" ${ICON_FONT} fill="${accent}">${_escapeXml(letter)}</text>`
  )

// The icon of one bar, fixed or extra
const _segmentIcon = ({ key, letter }: ISegmentInput, accent: string): string =>
  key in _iconSources ? _iconSources[key as TSegmentKey](accent) : _extraIcon(letter ?? '?', accent)

// Percent label: outlined SVG text (Text has no outline); a fixed width/height keeps it from being stretched
const _labelSvg = (label: string): { source: string; width: number } => {
  const width = Math.ceil(label.length * LABEL_CHAR_PX + 6)
  const source = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${LABEL_HEIGHT}" width="${width}" height="${LABEL_HEIGHT}">`,
    `<text x="${width / 2}" y="${LABEL_HEIGHT / 2}" text-anchor="middle" dominant-baseline="central" font-size="${LABEL_FONT_SIZE}" ${ICON_FONT}`,
    ` fill="${LABEL_FILL_COLOR}" stroke="${LABEL_STROKE_COLOR}" stroke-width="3" stroke-linejoin="round" paint-order="stroke">${_escapeXml(label)}</text>`,
    '</svg>'
  ].join('')
  return { source, width }
}

// Glyph width of the countdown text, per script
const _timeGlyphPx = (char: string): number => {
  const code = char.codePointAt(0) ?? 0
  if (code < 0x80) return TIME_ASCII_PX
  return code >= 0x2e80 ? TIME_WIDE_PX : TIME_OTHER_PX
}

// Reset countdown: monospace SVG text (Text cannot choose a font), fixed size so it is not stretched.
// Right-to-left scripts are laid out RTL from the right edge, otherwise digits and units swap places
const _timeSvg = (text: string, rtl = false): { source: string; width: number; cells: number } => {
  const textPx = [...text].reduce((sum, char) => sum + _timeGlyphPx(char), 0)
  const width = Math.ceil(textPx + 2)
  const source = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${TIME_HEIGHT}" width="${width}" height="${TIME_HEIGHT}">`,
    rtl
      ? `<text x="${width - 1}" y="${TIME_HEIGHT / 2}" direction="rtl" unicode-bidi="embed" dominant-baseline="central" font-size="${TIME_FONT_SIZE}" ${TIME_FONT} fill="${TIME_COLOR}">${_escapeXml(text)}</text>`
      : `<text x="1" y="${TIME_HEIGHT / 2}" dominant-baseline="central" font-size="${TIME_FONT_SIZE}" ${TIME_FONT} fill="${TIME_COLOR}">${_escapeXml(text)}</text>`,
    '</svg>'
  ].join('')
  return { source, width, cells: Math.ceil(width / CELL_PX_ESTIMATE) }
}

// The bar: dark pill track + green → yellow → red gradient, filled to the usage level.
// Drawn as a plain image (an isInteractive frame paints a white background on Desktop, showing past the round ends).
// The image is stretched to the column width, so the bar is a round-capped line with non-scaling-stroke:
// stroke width and caps are computed in screen space and stay circular. Caps reach half a stroke past the
// endpoints, so the endpoints are inset by an estimated px width to keep the caps inside the image.
const _barSvg = (key: ISegmentInput['key'], percent: number, barCells: number): string => {
  const filled = Math.min(100, Math.max(0, percent))
  const inset = (BAR_HEIGHT / 2 / (barCells * CELL_PX_ESTIMATE)) * 1000
  const trackEnd = 1000 - inset
  const fillEnd = inset + ((trackEnd - inset) * filled) / 100
  const centerY = BAR_HEIGHT / 2
  const lineAttrs = `stroke-width="${BAR_HEIGHT}" stroke-linecap="round" vector-effect="non-scaling-stroke"`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${BAR_HEIGHT}" preserveAspectRatio="none" width="4000" height="${BAR_HEIGHT}">`,
    '<defs>',
    `<linearGradient id="grad-${key}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">`,
    '<stop offset="0" stop-color="#00c800"/><stop offset="0.5" stop-color="#ffc800"/><stop offset="1" stop-color="#ff0000"/>',
    '</linearGradient>',
    '</defs>',
    `<line x1="${inset.toFixed(2)}" y1="${centerY}" x2="${trackEnd.toFixed(2)}" y2="${centerY}" stroke="${EMPTY_COLOR}" ${lineAttrs}/>`,
    `<line x1="${inset.toFixed(2)}" y1="${centerY}" x2="${fillEnd.toFixed(2)}" y2="${centerY}" stroke="url(#grad-${key})" ${lineAttrs}/>`,
    '</svg>'
  ].join('')
}

// Resolves the display language: user option → Claude Code setting → LC_ALL / LC_MESSAGES / LANG → macOS → English
const _resolveLocale = async ($: EngineInterface, option: string | undefined): Promise<Locale> => {
  // 1. explicit choice in the plugin's config menu
  const chosen = option && option !== 'auto' ? normalizeLocale(option) : null
  if (chosen) return chosen

  // 2. Claude Code's own `language` setting
  const settings = await $.settings.read().catch(() => ({}) as Record<string, unknown>)
  const settingName = typeof settings.language === 'string' ? settings.language : undefined
  const fromSetting = localeFromLanguageName(settingName)
  if (fromSetting) return fromSetting

  // 3. POSIX locale variables, most specific first
  const envCandidates = [await $.env.get('LC_ALL'), await $.env.get('LC_MESSAGES'), await $.env.get('LANG')]
  const fromEnv = envCandidates.map(normalizeLocale).find((locale) => locale !== null)
  if (fromEnv) return fromEnv

  // 4. macOS system language (apps launched from Finder usually have no LANG)
  const appleLanguages = await $.process
    .run(['/usr/bin/defaults', 'read', '-g', 'AppleLanguages'], { timeoutMs: 5_000 })
    .catch(() => null)
  const firstAppleLanguage = appleLanguages?.exitCode === 0 ? /"?([A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*)"?/.exec(appleLanguages.stdout)?.[1] : undefined
  const fromMac = normalizeLocale(firstAppleLanguage)
  if (fromMac) return fromMac

  return DEFAULT_LOCALE
}

export const register: Register = (on, options) => {
  const languageOption = typeof options.language === 'string' ? options.language : 'auto'

  // On start (and every hot reload): resolve the display language, read the current figures,
  // and redraw once a minute so the reset countdown moves
  on('session.start', async ($, e, next) => {
    const resolvedLocale = await _resolveLocale($, languageOption)
    await update($, locale, () => resolvedLocale)

    const initial = await $.session.usage()
    await update($, usage, () => _toQuotaUsage(initial.context, initial.rateLimits))

    $.clock.every(60_000, () => $.ui.invalidate('ui.render'))

    return next(e)
  })

  // The engine pushes new figures after each turn and whenever a limit moves a whole point
  on('session.measure', async ($, e, next) => {
    await update($, usage, () => _toQuotaUsage(e.context, e.rateLimits))
    return next(e)
  })

  // Draws the bars above the prompt. The terminal already has a status line, so it is left to the engine there
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface === 'terminal' || e.props.hasSurvey) return next(e)

    const current = await read($, usage)
    if (!current) return next(e)

    const messages = MESSAGES[await read($, locale)] ?? MESSAGES[DEFAULT_LOCALE]
    const nowMs = await $.clock.now()
    const { Box, Svg } = $.ui.resolve(e)

    // Bars that have data
    const segmentCandidates: (ISegmentInput | null)[] = [
      current.contextPercent === undefined ? null : { key: SegmentKey.CONTEXT, name: messages.context, percent: current.contextPercent },
      current.fiveHour ? { key: SegmentKey.FIVE, name: messages.fiveHour, percent: current.fiveHour.percent, resetsAt: current.fiveHour.resetsAt } : null,
      current.sevenDay ? { key: SegmentKey.WEEK, name: messages.sevenDay, percent: current.sevenDay.percent, resetsAt: current.sevenDay.resetsAt } : null,
      ...(current.extra ?? []).map((window): ISegmentInput => {
        const label = _extraLabel(window.kind)
        return { key: `extra-${window.kind}`, name: label, letter: label.charAt(0), percent: window.percent, resetsAt: window.resetsAt }
      })
    ]
    const segmentInputs = segmentCandidates.filter((segment) => segment !== null)
    if (segmentInputs.length === 0) return next(e)

    // Fixed width of each bar's block = icon + gap (+ gap + countdown when there is one); blocks differ in width
    const remainings = segmentInputs.map((segment) => _formatRemaining(segment.resetsAt, nowMs, messages))
    const timeSvgs = remainings.map((remaining) => (remaining ? _timeSvg(remaining, messages.rtl) : null))
    const fixedWidths = timeSvgs.map((timeSvg) => ICON_CELLS + 1 + (timeSvg ? 1 + timeSvg.cells : 0))

    // Equal-length bars filling the row: what is left after gaps and fixed widths is split evenly between the bars;
    // every block also grows by the same flexGrow, absorbing the remainder and real glyph widths, so bars stay equal
    const totalGap = SEGMENT_GAP * (segmentInputs.length - 1)
    const totalFixed = fixedWidths.reduce((sum, width) => sum + width, 0)
    const barLen = Math.max(MIN_BAR_LEN, Math.floor((e.props.bodyColumns - totalGap - totalFixed) / segmentInputs.length))

    // One block: icon (accent follows usage) + bar (outlined percent centred on it) + reset countdown
    const renderSegment = (segment: ISegmentInput, index: number) => {
      const { key, name, percent } = segment
      const percentLabel = `${Math.round(percent)}%`
      const remaining = remainings[index] ?? ''
      const timeSvg = timeSvgs[index] ?? null
      const segmentWidth = (fixedWidths[index] ?? 0) + barLen
      const alt = remaining ? `${name} ${percentLabel} (${remaining})` : `${name} ${percentLabel}`
      const percentSvg = _labelSvg(percentLabel)

      return (
        <Box key={key} flexDirection="row" alignItems="center" gap={1} width={segmentWidth} flexGrow={1} flexShrink={1}>
          <Box width={ICON_CELLS} flexShrink={0} justifyContent="center">
            <Svg source={_segmentIcon(segment, _accentColor(percent))} alt={name} width={ICON_SIZE} height={ICON_SIZE} />
          </Box>
          <Box position="relative" flexDirection="column" justifyContent="center" width={barLen} flexGrow={1} flexShrink={1}>
            <Svg source={_barSvg(key, percent, barLen)} alt={alt} height={BAR_HEIGHT} />
            <Box position="absolute" top={0} bottom={0} left={0} right={0} justifyContent="center" alignItems="center">
              <Svg source={percentSvg.source} alt={percentLabel} width={percentSvg.width} height={LABEL_HEIGHT} />
            </Box>
          </Box>
          {timeSvg ? (
            <Box width={timeSvg.cells} flexShrink={0} justifyContent="center">
              <Svg source={timeSvg.source} alt={remaining} width={timeSvg.width} height={TIME_HEIGHT} />
            </Box>
          ) : null}
        </Box>
      )
    }

    // One row, no wrapping
    const segments = segmentInputs.map(renderSegment)
    const barsRow = (
      <Box flexDirection="row" flexWrap="nowrap" columnGap={SEGMENT_GAP} width={e.props.bodyColumns}>
        {segments}
      </Box>
    )

    // Play well with other band mods: whatever the mods beneath draw is stacked under the bars instead of replaced
    const below = await next(e)
    if (below.type === 'engine') return barsRow
    return (
      <Box flexDirection="column">
        {barsRow}
        {below}
      </Box>
    )
  })
}
