# claude-mod-usage

**English** · [简体中文](docs/README.zh-CN.md) · [繁體中文](docs/README.zh-TW.md) · [日本語](docs/README.ja.md) · [हिन्दी](docs/README.hi.md) · [Español](docs/README.es.md) · [العربية](docs/README.ar.md) · [Français](docs/README.fr.md) · [বাংলা](docs/README.bn.md) · [Português](docs/README.pt.md) · [Русский](docs/README.ru.md) · [Bahasa Indonesia](docs/README.id.md)

A Claude Code Mod that shows your Claude usage as three gradient progress bars right above the prompt in **Claude Code Desktop** (also VS Code and the mobile app):

- **Context**: how full the current context window is
- **5-hour limit**: your session usage, with the time left until it resets
- **7-day limit**: your weekly usage, with the time left until it resets

![claude-mod-usage preview](assets/preview.png)

## Features

- Green → yellow → red gradient bars with rounded ends; the icon's accent colour follows the usage too
- The percentage sits in the middle of each bar, outlined so it stays readable on any colour
- All bars have the same length and the row always uses the full width
- Reset countdown in a monospace font
- Updates after every turn and whenever a limit moves by a whole point; the countdown ticks every minute
- 12 languages, detected automatically
- Leaves the terminal alone: the CLI already has a status line for this
- Plays well with other mods above the prompt: whatever they draw there is stacked under the bars instead of being covered

![All 12 languages](assets/languages.png)

## Requirements

- Claude Code with Mods (function hooks) support. Tested on 2.1.286. The Mods API is in early access and may change.
- A Claude subscription. The 5-hour and 7-day bars only appear when Claude Code reports rate limits; with an API key you get the context bar alone.

## Install

### Quick install: let Claude do it

Copy this prompt and paste it into Claude Code (Desktop, CLI or VS Code). Claude clones the mod, updates your settings and checks them:

```text
Install the claude-mod-usage Claude Code mod: clone https://github.com/jack21/claude-mod-usage into ~/.claude/mods/claude-mod-usage (if the folder already exists, run git pull there instead). Then add that folder to CLAUDE_CODE_PLUGIN_DIRS in the "env" block of ~/.claude/settings.json, keeping any folders already listed (join them with ":" on macOS/Linux, ";" on Windows) and changing no other setting. Make sure settings.json is still valid JSON, run `claude plugin validate ~/.claude/mods/claude-mod-usage`, and tell me to start a new session.
```

### Manual install

1. Get the files:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Tell Claude Code to load it. Claude Code Desktop cannot pass command-line flags, so add the folder to the `env` block of `~/.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   Several folders are separated by `:` (macOS / Linux) or `;` (Windows).

3. Start a new session. The bars appear after the first reply.

For a one-off try in the CLI: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

Optional: add `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` to the same `env` block so Desktop reloads the mod when you edit its files.

## Language

The display language is chosen in this order:

1. The **Language** option in the plugin's config menu (`auto` by default)
2. Claude Code's own `language` setting (e.g. `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. The macOS system language (apps launched from the Dock usually have no `LANG`)
5. English

To pin a language without the menu, add this to `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

Supported codes: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`.

## How it works

- `session.measure` pushes the context and rate-limit figures; `session.start` reads the current ones with `$.session.usage()`.
- The bars are drawn into the `AbovePrompt` slot with `Svg` elements. A plain-image SVG is stretched horizontally to its box, so the bar is a round-capped line with `vector-effect="non-scaling-stroke"`, which keeps the ends circular at any width. Text (percent, countdown) is a separate fixed-size SVG so it is never distorted.
- Desktop draws `isInteractive` SVG frames on a white background, so everything here is drawn as plain images.

## Develop

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` is the hooks module; `hooks/i18n.ts` holds the strings and locale detection helpers; `types/index.d.ts` is the state contract.

To add a language: add its code to `types/index.d.ts` and `.claude-plugin/plugin.json`, its strings to `MESSAGES` and `SUPPORTED_LOCALES` in `hooks/i18n.ts`, and a name hint to `LANGUAGE_NAME_HINTS`.

## License

[MIT](LICENSE) © 2026 Jack Chiang
