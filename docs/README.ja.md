# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **日本語** · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

**Claude Code Desktop**（VS Code やモバイルアプリでも動作）のプロンプトのすぐ上に、Claude の使用状況を 3 本のグラデーション付きプログレスバーで表示する Claude Code Mod です。

- **コンテキスト**：現在のコンテキストウィンドウの使用率
- **5時間の上限**：セッションの使用量と、リセットまでの残り時間
- **7日間の上限**：週の使用量と、リセットまでの残り時間

![claude-mod-usage のプレビュー](../assets/preview.png)

## 特長

- 緑 → 黄 → 赤のグラデーションで、両端が丸いバー。アイコンのアクセントカラーも使用量に合わせて変化します
- パーセンテージは各バーの中央に縁取り付きで表示されるため、どの色の上でも読みやすくなっています
- すべてのバーは同じ長さで、行は常に幅いっぱいに広がります
- リセットまでのカウントダウンは等幅フォントで表示
- ターンごと、また上限の使用率が 1 ポイント変わるたびに更新され、カウントダウンは 1 分ごとに進みます
- 12 言語に対応し、自動で判定
- ターミナルには手を加えません。CLI にはすでにこの用途のステータスラインがあります
- ほかの Mod と共存できます：入力欄の上にほかの Mod が描いた内容は、バーの下に並べて表示され、隠れません

![全 12 言語](../assets/languages.png)

## 動作要件

- Mods（function hooks）に対応した Claude Code。2.1.286 で動作確認済みです。Mods API はアーリーアクセス段階のため、今後変更される可能性があります。
- Claude のサブスクリプション。「5時間の上限」と「7日間の上限」のバーは、Claude Code がレート制限を報告した場合にのみ表示されます。API キーを使っている場合は「コンテキスト」のバーだけが表示されます。

## インストール

### クイックインストール：Claude に任せる

次のプロンプトをコピーして Claude Code（Desktop・CLI・VS Code のどれでも可）に貼り付けると、Claude が Mod の取得・設定の変更・確認まで行います：

```text
Claude Code の Mod「claude-mod-usage」をインストールしてください：https://github.com/jack21/claude-mod-usage を ~/.claude/mods/claude-mod-usage に clone します（フォルダーが既にあれば、そこで git pull してください）。次に、そのフォルダーを ~/.claude/settings.json の "env" ブロックにある CLAUDE_CODE_PLUGIN_DIRS に追加します。既に登録されているフォルダーは残し（macOS/Linux は ":"、Windows は ";" で連結）、ほかの設定は変更しないでください。settings.json が有効な JSON であることを確認し、`claude plugin validate ~/.claude/mods/claude-mod-usage` を実行してから、新しいセッションを始めるよう案内してください。
```

### 手動インストール

1. ファイルを取得します。

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Claude Code に読み込ませます。Claude Code Desktop ではコマンドラインフラグを渡せないため、`~/.claude/settings.json` の `env` ブロックにフォルダを追加します。

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   複数のフォルダは `:`（macOS / Linux）または `;`（Windows）で区切ります。

3. 新しいセッションを開始します。最初の応答のあとにバーが表示されます。

CLI で一度だけ試す場合：`claude --plugin-dir ~/.claude/mods/claude-mod-usage`

任意：同じ `env` ブロックに `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` を追加すると、Mod のファイルを編集したときに Desktop が自動で再読み込みします。

## 言語

表示言語は次の順に決まります。

1. プラグインの設定メニューにある **Language** オプション（デフォルトは `auto`）
2. Claude Code 自体の `language` 設定（例：`"japanese"`、`"繁體中文"`）
3. `LC_ALL`、`LC_MESSAGES`、`LANG`
4. macOS のシステム言語（Dock から起動したアプリには通常 `LANG` がありません）
5. 英語

メニューを使わずに言語を固定するには、`~/.claude/settings.json` に次を追加します。

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

対応コード：`en`、`zh-CN`、`zh-TW`、`ja`、`hi`、`es`、`ar`、`fr`、`bn`、`pt`、`ru`、`id`

## 仕組み

- `session.measure` がコンテキストとレート制限の数値を送り、`session.start` は `$.session.usage()` で現在の数値を読み取ります。
- バーは `Svg` 要素で `AbovePrompt` スロットに描画されます。プレーンな画像としての SVG はボックスに合わせて横方向に引き伸ばされるため、バーは `vector-effect="non-scaling-stroke"` を指定した丸い線端の線で描き、どの幅でも両端が円形のまま保たれるようにしています。テキスト（パーセンテージとカウントダウン）は固定サイズの別の SVG なので、歪むことはありません。
- Desktop は `isInteractive` の SVG フレームを白い背景の上に描画するため、ここではすべてをプレーンな画像として描画しています。

## 開発

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` が hooks モジュール、`hooks/i18n.ts` が文字列とロケール判定のヘルパー、`types/index.d.ts` が状態の型定義です。

言語を追加するには、言語コードを `types/index.d.ts` と `.claude-plugin/plugin.json` に、文字列を `hooks/i18n.ts` の `MESSAGES` と `SUPPORTED_LOCALES` に追加し、`LANGUAGE_NAME_HINTS` に言語名のヒントを加えます。

## ライセンス

[MIT](../LICENSE) © 2026 Jack Chiang
