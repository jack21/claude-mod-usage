# quota-bars

[English](../README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

一個 Claude Code Mod，在 **Claude Code Desktop**（VS Code 與行動版 App 也適用）的輸入框正上方，以三條漸層進度條顯示你的 Claude 用量：

- **上下文**：目前上下文視窗的使用程度
- **5 小時額度**：本階段的用量，以及距離重設的剩餘時間
- **7 天額度**：本週的用量，以及距離重設的剩餘時間

![quota-bars 預覽](../assets/preview.png)

## 功能

- 綠 → 黃 → 紅的漸層進度條，兩端為圓角；圖示的強調色也會跟著用量變化
- 百分比顯示在每條進度條正中央，並加上描邊，在任何底色上都清晰可讀
- 所有進度條長度一致，整列永遠填滿可用寬度
- 重設倒數使用等寬字型
- 每個回合結束後、以及任一額度變動滿 1 個百分點時更新；倒數每分鐘更新一次
- 支援 12 種語言，自動偵測
- 不干擾終端機：CLI 本來就有狀態列可以顯示這些資訊

![全部 12 種語言](../assets/languages.png)

## 系統需求

- 支援 Mods（function hooks）的 Claude Code。已在 2.1.286 上測試。Mods API 目前仍為搶先體驗版，日後可能變動。
- Claude 訂閱方案。只有在 Claude Code 回報速率限制時，才會出現「5 小時額度」與「7 天額度」進度條；使用 API 金鑰時只會顯示「上下文」進度條。

## 安裝

### 快速安裝：交給 Claude

複製下面這段 prompt，貼進 Claude Code（Desktop、CLI 或 VS Code 都可以），Claude 會自動下載 Mod、修改設定並檢查：

```text
幫我安裝 quota-bars 這個 Claude Code Mod：把 https://github.com/jack21/quota-bars clone 到 ~/.claude/mods/quota-bars（資料夾已存在就改在裡面執行 git pull）。接著把這個資料夾加進 ~/.claude/settings.json 的 "env" 區塊裡的 CLAUDE_CODE_PLUGIN_DIRS，保留原本已有的資料夾（macOS/Linux 用 ":"、Windows 用 ";" 串接），其他設定都不要動。確認 settings.json 仍是有效的 JSON，執行 `claude plugin validate ~/.claude/mods/quota-bars`，最後提醒我開一個新的 session。
```

### 手動安裝

1. 取得檔案：

   ```bash
   git clone https://github.com/jack21/quota-bars ~/.claude/mods/quota-bars
   ```

2. 讓 Claude Code 載入它。Claude Code Desktop 無法傳入命令列參數，因此請把資料夾加到 `~/.claude/settings.json` 的 `env` 區塊：

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/quota-bars"
     }
   }
   ```

   多個資料夾之間以 `:`（macOS / Linux）或 `;`（Windows）分隔。

3. 開啟新的工作階段。收到第一則回覆後，進度條就會出現。

若只想在 CLI 中臨時試用：`claude --plugin-dir ~/.claude/mods/quota-bars`。

選用：在同一個 `env` 區塊加入 `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"`，之後編輯 Mod 的檔案時，Desktop 就會自動重新載入。

## 語言

顯示語言依下列順序決定：

1. 外掛設定選單中的 **Language** 選項（預設為 `auto`）
2. Claude Code 本身的 `language` 設定（例如 `"japanese"`、`"繁體中文"`）
3. `LC_ALL`、`LC_MESSAGES`、`LANG`
4. macOS 系統語言（從 Dock 啟動的 App 通常沒有 `LANG`）
5. 英文

若不想透過選單、要直接固定語言，請在 `~/.claude/settings.json` 中加入：

```json
{
  "pluginConfigs": {
    "quota-bars": { "language": "ja" }
  }
}
```

支援的代碼：`en`、`zh-CN`、`zh-TW`、`ja`、`hi`、`es`、`ar`、`fr`、`bn`、`pt`、`ru`、`id`。

## 運作原理

- `session.measure` 會推送上下文與速率限制的數值；`session.start` 則透過 `$.session.usage()` 讀取目前的數值。
- 進度條以 `Svg` 元素繪製在 `AbovePrompt` 插槽中。純圖片 SVG 會被水平拉伸以填滿容器，所以進度條是一條加上 `vector-effect="non-scaling-stroke"` 的圓頭線段，無論寬度多少，兩端都能維持正圓。文字（百分比、倒數）則是另一個固定尺寸的 SVG，因此永遠不會變形。
- Desktop 會把 `isInteractive` 的 SVG 框架畫在白色背景上，因此這裡的所有內容都以純圖片繪製。

## 開發

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` 是 hooks 模組；`hooks/i18n.ts` 存放字串與語系偵測的輔助函式；`types/index.d.ts` 是狀態的型別契約。

新增語言的方式：將語言代碼加入 `types/index.d.ts` 與 `.claude-plugin/plugin.json`，將字串加入 `hooks/i18n.ts` 的 `MESSAGES` 與 `SUPPORTED_LOCALES`，並在 `LANGUAGE_NAME_HINTS` 加上語言名稱提示。

## 授權

[MIT](../LICENSE) © 2026 Jack Chiang
