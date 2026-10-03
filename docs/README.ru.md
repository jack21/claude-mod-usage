# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · **Русский** · [Bahasa Indonesia](README.id.md)

Mod для Claude Code, который показывает расход Claude в виде трёх градиентных индикаторов прямо над полем ввода в **Claude Code Desktop** (а также в VS Code и мобильном приложении):

- **Контекст**: насколько заполнено текущее окно контекста
- **Лимит 5 часов**: расход в текущей сессии и время до сброса
- **Лимит 7 дней**: недельный расход и время до сброса

![Предпросмотр claude-mod-usage](../assets/preview.png)

## Возможности

- Градиентные полосы зелёный → жёлтый → красный со скруглёнными концами; акцентный цвет иконки тоже меняется вместе с расходом
- Процент выводится по центру каждой полосы с обводкой, поэтому он читается на любом цвете
- Все полосы одинаковой длины, а строка всегда занимает всю ширину
- Обратный отсчёт до сброса — моноширинным шрифтом
- Обновляется после каждого хода и всякий раз, когда лимит меняется на целый пункт; отсчёт идёт поминутно
- 12 языков с автоматическим определением
- Не трогает терминал: в CLI для этого уже есть строка состояния
- Уживается с другими mod над полем ввода: всё, что они там рисуют, выводится под полосками, а не перекрывается

![Все 12 языков](../assets/languages.png)

## Требования

- Claude Code с поддержкой Mods (function hooks). Проверено на версии 2.1.286. Mods API находится в раннем доступе и может измениться.
- Подписка Claude. Полосы «Лимит 5 часов» и «Лимит 7 дней» появляются, только если Claude Code сообщает лимиты; с API-ключом отображается лишь полоса «Контекст».

## Установка

### Быстрая установка: пусть это сделает Claude

Скопируйте этот prompt и вставьте его в Claude Code (Desktop, CLI или VS Code). Claude сам скачает mod, обновит настройки и проверит их:

```text
Установи mod для Claude Code под названием claude-mod-usage: склонируй https://github.com/jack21/claude-mod-usage в ~/.claude/mods/claude-mod-usage (если папка уже есть, выполни в ней git pull). Затем добавь эту папку в CLAUDE_CODE_PLUGIN_DIRS в блоке "env" файла ~/.claude/settings.json, сохранив уже указанные папки (через ":" в macOS/Linux и ";" в Windows) и не меняя другие настройки. Убедись, что settings.json по-прежнему корректный JSON, выполни `claude plugin validate ~/.claude/mods/claude-mod-usage` и напомни мне открыть новую сессию.
```

### Ручная установка

1. Скачайте файлы:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Укажите Claude Code, что его нужно загрузить. Claude Code Desktop не принимает флаги командной строки, поэтому добавьте папку в блок `env` файла `~/.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   Несколько папок разделяются символом `:` (macOS / Linux) или `;` (Windows).

3. Начните новую сессию. Полосы появятся после первого ответа.

Чтобы разово попробовать в CLI: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

Дополнительно: добавьте `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` в тот же блок `env`, чтобы Desktop перезагружал mod при изменении его файлов.

## Язык

Язык интерфейса выбирается в таком порядке:

1. Параметр **Language** в меню настроек плагина (по умолчанию `auto`)
2. Собственная настройка `language` в Claude Code (например, `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. Системный язык macOS (у приложений, запущенных из Dock, обычно нет `LANG`)
5. Английский

Чтобы закрепить язык без меню, добавьте в `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

Поддерживаемые коды: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`.

## Как это работает

- `session.measure` передаёт данные о контексте и лимитах; `session.start` считывает текущие значения через `$.session.usage()`.
- Полосы рисуются в слоте `AbovePrompt` с помощью элементов `Svg`. SVG, выводимый как обычное изображение, растягивается по горизонтали под размер контейнера, поэтому полоса — это линия со скруглёнными концами и `vector-effect="non-scaling-stroke"`: так концы остаются круглыми при любой ширине. Текст (процент, отсчёт) — отдельный SVG фиксированного размера, поэтому он никогда не искажается.
- Desktop рисует SVG-фреймы `isInteractive` на белом фоне, поэтому здесь всё отрисовывается как обычные изображения.

## Разработка

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` — модуль хуков; `hooks/i18n.ts` содержит строки и вспомогательные функции для определения локали; `types/index.d.ts` — контракт состояния.

Чтобы добавить язык: внесите его код в `types/index.d.ts` и `.claude-plugin/plugin.json`, строки — в `MESSAGES` и `SUPPORTED_LOCALES` в `hooks/i18n.ts`, а подсказку по названию — в `LANGUAGE_NAME_HINTS`.

## Лицензия

[MIT](../LICENSE) © 2026 Jack Chiang
