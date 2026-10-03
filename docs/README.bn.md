# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · **বাংলা** · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

একটি Claude Code Mod, যা **Claude Code Desktop**-এ (এবং VS Code ও মোবাইল অ্যাপেও) প্রম্পটের ঠিক উপরে তিনটি গ্রেডিয়েন্ট প্রোগ্রেস বার দিয়ে আপনার Claude ব্যবহার দেখায়:

- **কনটেক্সট**: বর্তমান কনটেক্সট উইন্ডো কতটা ভরে গেছে
- **৫ ঘণ্টার সীমা**: আপনার সেশনের ব্যবহার, আর রিসেট হতে কত সময় বাকি
- **৭ দিনের সীমা**: আপনার সাপ্তাহিক ব্যবহার, আর রিসেট হতে কত সময় বাকি

![claude-mod-usage প্রিভিউ](../assets/preview.png)

## বৈশিষ্ট্য

- সবুজ → হলুদ → লাল গ্রেডিয়েন্টের বার, প্রান্তগুলো গোলাকার; আইকনের অ্যাকসেন্ট রংও ব্যবহারের সঙ্গে বদলায়
- শতাংশটি প্রতিটি বারের মাঝখানে আউটলাইনসহ দেখানো হয়, তাই যেকোনো রঙের উপর পড়তে সুবিধা হয়
- সব বারের দৈর্ঘ্য সমান এবং সারিটি সবসময় পুরো প্রস্থ জুড়ে থাকে
- রিসেটের কাউন্টডাউন মোনোস্পেস ফন্টে
- প্রতিটি টার্নের পরে এবং কোনো সীমা পুরো এক পয়েন্ট বদলালেই আপডেট হয়; কাউন্টডাউন প্রতি মিনিটে এগোয়
- ১২টি ভাষা, স্বয়ংক্রিয়ভাবে শনাক্ত হয়
- টার্মিনালে কোনো পরিবর্তন করে না: CLI-তে এর জন্য আগে থেকেই একটি স্ট্যাটাস লাইন আছে

![সব ১২টি ভাষা](../assets/languages.png)

## প্রয়োজনীয়তা

- Mods (function hooks) সাপোর্টসহ Claude Code। 2.1.286-এ পরীক্ষিত। Mods API এখনো আর্লি অ্যাক্সেসে আছে এবং পরিবর্তিত হতে পারে।
- একটি Claude সাবস্ক্রিপশন। "৫ ঘণ্টার সীমা" ও "৭ দিনের সীমা" বার কেবল তখনই দেখা যায় যখন Claude Code রেট লিমিট রিপোর্ট করে; API key ব্যবহার করলে শুধু "কনটেক্সট" বারটি দেখা যাবে।

## ইনস্টল

### দ্রুত ইনস্টল: Claude-কে দিয়ে করান

এই prompt কপি করে Claude Code-এ (Desktop, CLI বা VS Code) পেস্ট করুন। Claude নিজেই mod ডাউনলোড করবে, সেটিংস বদলাবে এবং যাচাই করবে:

```text
claude-mod-usage নামের Claude Code mod ইনস্টল করো: https://github.com/jack21/claude-mod-usage কে ~/.claude/mods/claude-mod-usage-এ clone করো (ফোল্ডারটি আগে থেকে থাকলে সেখানে git pull চালাও)। তারপর ফোল্ডারটি ~/.claude/settings.json-এর "env" ব্লকের CLAUDE_CODE_PLUGIN_DIRS-এ যোগ করো। আগে থেকে থাকা ফোল্ডারগুলো রেখে দাও (macOS/Linux-এ ":" আর Windows-এ ";" দিয়ে জোড়ো) এবং অন্য কোনো সেটিং বদলাবে না। settings.json এখনও বৈধ JSON কি না নিশ্চিত করো, `claude plugin validate ~/.claude/mods/claude-mod-usage` চালাও, তারপর আমাকে নতুন session শুরু করতে বলো।
```

### ম্যানুয়াল ইনস্টল

1. ফাইলগুলো নিন:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Claude Code-কে এটি লোড করতে বলুন। Claude Code Desktop-এ কমান্ড-লাইন ফ্ল্যাগ দেওয়া যায় না, তাই ফোল্ডারটি `~/.claude/settings.json`-এর `env` ব্লকে যোগ করুন:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   একাধিক ফোল্ডার `:` (macOS / Linux) বা `;` (Windows) দিয়ে আলাদা করুন।

3. একটি নতুন সেশন শুরু করুন। প্রথম উত্তরের পরেই বারগুলো দেখা যাবে।

CLI-তে একবার চালিয়ে দেখতে: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`।

ঐচ্ছিক: একই `env` ব্লকে `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` যোগ করুন, তাহলে mod-এর ফাইল এডিট করলে Desktop সেটি আবার লোড করবে।

## ভাষা

প্রদর্শনের ভাষা এই ক্রমে বেছে নেওয়া হয়:

1. প্লাগইনের কনফিগ মেনুতে **Language** অপশন (ডিফল্ট `auto`)
2. Claude Code-এর নিজস্ব `language` সেটিং (যেমন `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. macOS-এর সিস্টেম ভাষা (Dock থেকে চালু করা অ্যাপে সাধারণত `LANG` থাকে না)
5. ইংরেজি

মেনু ছাড়াই কোনো ভাষা নির্দিষ্ট করতে, `~/.claude/settings.json`-এ এটি যোগ করুন:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

সমর্থিত কোড: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`।

## যেভাবে কাজ করে

- `session.measure` কনটেক্সট ও রেট লিমিটের সংখ্যাগুলো পাঠায়; `session.start` বর্তমান সংখ্যাগুলো `$.session.usage()` দিয়ে পড়ে।
- বারগুলো `Svg` এলিমেন্ট দিয়ে `AbovePrompt` স্লটে আঁকা হয়। সাধারণ ছবি হিসেবে দেখানো SVG তার বক্সের মাপে আনুভূমিকভাবে প্রসারিত হয়, তাই বারটি `vector-effect="non-scaling-stroke"` যুক্ত একটি গোলাকার প্রান্তের লাইন, যা যেকোনো প্রস্থে প্রান্তগুলো গোল রাখে। লেখা (শতাংশ, কাউন্টডাউন) আলাদা একটি নির্দিষ্ট মাপের SVG, তাই সেটি কখনো বিকৃত হয় না।
- Desktop `isInteractive` SVG ফ্রেমগুলো সাদা ব্যাকগ্রাউন্ডের উপর আঁকে, তাই এখানে সবকিছু সাধারণ ছবি হিসেবে আঁকা হয়।

## ডেভেলপমেন্ট

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` হলো hooks মডিউল; `hooks/i18n.ts`-এ স্ট্রিং ও লোকেল শনাক্ত করার হেল্পার রয়েছে; `types/index.d.ts` হলো স্টেটের কন্ট্র্যাক্ট।

নতুন ভাষা যোগ করতে: এর কোড `types/index.d.ts` ও `.claude-plugin/plugin.json`-এ, এর স্ট্রিং `hooks/i18n.ts`-এর `MESSAGES` ও `SUPPORTED_LOCALES`-এ, এবং একটি নামের ইঙ্গিত `LANGUAGE_NAME_HINTS`-এ যোগ করুন।

## লাইসেন্স

[MIT](../LICENSE) © 2026 Jack Chiang
