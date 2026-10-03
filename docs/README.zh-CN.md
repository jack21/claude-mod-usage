# claude-mod-usage

[English](../README.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

一个 Claude Code Mod，在 **Claude Code Desktop**（VS Code 和移动端 App 同样适用）的输入框正上方，用三条渐变进度条显示你的 Claude 用量：

- **上下文**：当前上下文窗口的占用程度
- **5 小时额度**：本时段的用量，以及距离重置的剩余时间
- **7 天额度**：本周的用量，以及距离重置的剩余时间

![claude-mod-usage 预览](../assets/preview.png)

## 功能

- 绿 → 黄 → 红的渐变进度条，两端为圆角；图标的强调色也会随用量变化
- 百分比显示在每条进度条正中间，并带描边，在任何底色上都清晰可读
- 所有进度条长度一致，整行始终占满可用宽度
- 重置倒计时使用等宽字体
- 每轮对话结束后、以及任一额度变化满 1 个百分点时刷新；倒计时每分钟更新一次
- 支持 12 种语言，自动检测
- 不打扰终端：CLI 本身已经有状态栏来显示这些信息
- 可与其他 Mod 共存：其他 Mod 在输入框上方绘制的内容会排在进度条下方，不会被覆盖

![全部 12 种语言](../assets/languages.png)

## 环境要求

- 支持 Mods（function hooks）的 Claude Code。已在 2.1.286 上测试。Mods API 目前处于抢先体验阶段，之后可能会变动。
- Claude 订阅。只有当 Claude Code 上报速率限制时，才会显示“5 小时额度”和“7 天额度”进度条；使用 API 密钥时只会显示“上下文”进度条。

## 安装

### 快速安装：交给 Claude

复制下面这段 prompt，粘贴到 Claude Code（Desktop、CLI 或 VS Code 均可），Claude 会自动下载 Mod、修改设置并检查：

```text
帮我安装 claude-mod-usage 这个 Claude Code Mod：把 https://github.com/jack21/claude-mod-usage clone 到 ~/.claude/mods/claude-mod-usage（文件夹已存在就改为在其中执行 git pull）。然后把这个文件夹加入 ~/.claude/settings.json 的 "env" 块中的 CLAUDE_CODE_PLUGIN_DIRS，保留已有的文件夹（macOS/Linux 用 ":"、Windows 用 ";" 连接），其他设置都不要改。确认 settings.json 仍是有效的 JSON，运行 `claude plugin validate ~/.claude/mods/claude-mod-usage`，最后提醒我新开一个 session。
```

### 手动安装

1. 获取文件：

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. 让 Claude Code 加载它。Claude Code Desktop 无法传入命令行参数，因此需要把文件夹添加到 `~/.claude/settings.json` 的 `env` 块中：

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   多个文件夹之间用 `:`（macOS / Linux）或 `;`（Windows）分隔。

3. 新建一个会话。收到第一条回复后，进度条就会出现。

如果只想在 CLI 中临时试用：`claude --plugin-dir ~/.claude/mods/claude-mod-usage`。

可选：在同一个 `env` 块中加入 `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"`，这样编辑 Mod 文件时 Desktop 会自动重新加载。

## 语言

显示语言按以下顺序确定：

1. 插件配置菜单中的 **Language** 选项（默认为 `auto`）
2. Claude Code 自身的 `language` 设置（例如 `"japanese"`、`"繁體中文"`）
3. `LC_ALL`、`LC_MESSAGES`、`LANG`
4. macOS 系统语言（从程序坞启动的 App 通常没有 `LANG`）
5. 英语

如果不想通过菜单、而是直接固定语言，请在 `~/.claude/settings.json` 中加入：

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

支持的代码：`en`、`zh-CN`、`zh-TW`、`ja`、`hi`、`es`、`ar`、`fr`、`bn`、`pt`、`ru`、`id`。

## 工作原理

- `session.measure` 推送上下文和速率限制的数据；`session.start` 通过 `$.session.usage()` 读取当前数据。
- 进度条用 `Svg` 元素绘制在 `AbovePrompt` 插槽中。纯图片 SVG 会被水平拉伸以填满容器，所以进度条是一条带 `vector-effect="non-scaling-stroke"` 的圆头线段，无论宽度多少，两端都保持正圆。文字（百分比、倒计时）是另一个固定尺寸的 SVG，因此永远不会变形。
- Desktop 会把 `isInteractive` 的 SVG 框架绘制在白色背景上，所以这里的所有内容都以纯图片方式绘制。

## 开发

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` 是 hooks 模块；`hooks/i18n.ts` 存放字符串和语言区域检测的辅助函数；`types/index.d.ts` 是状态的类型约定。

添加新语言：把语言代码加到 `types/index.d.ts` 和 `.claude-plugin/plugin.json`，把字符串加到 `hooks/i18n.ts` 的 `MESSAGES` 和 `SUPPORTED_LOCALES`，并在 `LANGUAGE_NAME_HINTS` 中添加语言名称提示。

## 许可证

[MIT](../LICENSE) © 2026 Jack Chiang
