# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · **العربية** · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

إضافة Mod لـ Claude Code تعرض استخدامك لـ Claude في ثلاثة أشرطة تقدّم متدرّجة الألوان فوق حقل الإدخال مباشرةً في **Claude Code Desktop** (وكذلك في VS Code وتطبيق الجوّال):

- **السياق**: مدى امتلاء نافذة السياق الحالية
- **حد 5 ساعات**: استخدامك في الجلسة، مع الوقت المتبقي حتى إعادة التعيين
- **حد 7 أيام**: استخدامك الأسبوعي، مع الوقت المتبقي حتى إعادة التعيين

![معاينة claude-mod-usage](../assets/preview.png)

## الميزات

- أشرطة متدرّجة من الأخضر ← الأصفر ← الأحمر بأطراف مستديرة؛ ويتغيّر لون الأيقونة أيضًا بحسب الاستخدام
- تظهر النسبة المئوية في منتصف كل شريط مع حدّ خارجي يجعلها مقروءة فوق أي لون
- جميع الأشرطة بالطول نفسه، ويشغل الصف دائمًا العرض الكامل
- العدّ التنازلي لإعادة التعيين بخط ثابت العرض
- يتحدّث بعد كل دور، وكلما تغيّر أحد الحدود بنقطة كاملة؛ ويتقدّم العدّ التنازلي كل دقيقة
- 12 لغة، يتم اكتشافها تلقائيًا
- لا يمسّ الطرفية: فواجهة CLI تحتوي أصلًا على سطر حالة لهذا الغرض

![اللغات الـ 12 كلها](../assets/languages.png)

## المتطلبات

- إصدار من Claude Code يدعم Mods (function hooks). تم الاختبار على 2.1.286. واجهة Mods API في مرحلة الوصول المبكر وقد تتغيّر.
- اشتراك في Claude. لا يظهر شريطا «حد 5 ساعات» و«حد 7 أيام» إلا عندما يُبلغ Claude Code عن حدود الاستخدام؛ أما مع مفتاح API فلن يظهر سوى شريط «السياق».

## التثبيت

### تثبيت سريع: دع Claude يتولى الأمر

انسخ هذا الـ prompt والصقه في Claude Code (Desktop أو CLI أو VS Code)، وسيقوم Claude بتنزيل الـ mod وتحديث الإعدادات والتحقق منها:

```text
ثبّت mod الخاص بـ Claude Code المسمى claude-mod-usage: انسخ https://github.com/jack21/claude-mod-usage عبر git clone إلى ~/.claude/mods/claude-mod-usage (وإذا كان المجلد موجودًا فشغّل git pull داخله بدلًا من ذلك). ثم أضف هذا المجلد إلى CLAUDE_CODE_PLUGIN_DIRS داخل كتلة "env" في ~/.claude/settings.json، مع الإبقاء على أي مجلدات موجودة (افصل بينها بـ ":" على macOS/Linux و";" على Windows) ودون تغيير أي إعداد آخر. تأكد أن settings.json ما زال JSON صالحًا، وشغّل `claude plugin validate ~/.claude/mods/claude-mod-usage`، ثم اطلب مني بدء جلسة جديدة.
```

### التثبيت اليدوي

1. احصل على الملفات:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. اطلب من Claude Code تحميله. لا يمكن تمرير خيارات سطر الأوامر إلى Claude Code Desktop، لذا أضف المجلد إلى كتلة `env` في `~/.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   افصل بين المجلدات المتعددة بـ `:` (macOS / Linux) أو `;` (Windows).

3. ابدأ جلسة جديدة. ستظهر الأشرطة بعد أول رد.

لتجربته مرة واحدة في CLI: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

اختياري: أضف `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` إلى كتلة `env` نفسها كي يعيد Desktop تحميل الـ Mod عند تعديل ملفاته.

## اللغة

تُختار لغة العرض بهذا الترتيب:

1. خيار **Language** في قائمة إعدادات الإضافة (القيمة الافتراضية `auto`)
2. إعداد `language` الخاص بـ Claude Code نفسه (مثل `"japanese"` و`"繁體中文"`)
3. `LC_ALL` و`LC_MESSAGES` و`LANG`
4. لغة نظام macOS (التطبيقات التي تُشغَّل من Dock لا تملك عادةً `LANG`)
5. الإنجليزية

لتثبيت لغة معيّنة دون استخدام القائمة، أضف ما يلي إلى `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

الرموز المدعومة: `en` و`zh-CN` و`zh-TW` و`ja` و`hi` و`es` و`ar` و`fr` و`bn` و`pt` و`ru` و`id`.

## آلية العمل

- يرسل `session.measure` أرقام السياق وحدود الاستخدام، بينما يقرأ `session.start` القيم الحالية عبر `$.session.usage()`.
- تُرسم الأشرطة داخل الخانة `AbovePrompt` باستخدام عناصر `Svg`. يتمدّد ملف SVG المعروض كصورة عادية أفقيًا ليملأ إطاره، لذا فإن الشريط عبارة عن خط بأطراف مستديرة مع `vector-effect="non-scaling-stroke"`، مما يُبقي الأطراف دائرية مهما كان العرض. أما النص (النسبة المئوية والعدّ التنازلي) فهو SVG منفصل بحجم ثابت، فلا يتشوّه أبدًا.
- يرسم Desktop إطارات SVG من نوع `isInteractive` على خلفية بيضاء، لذا يُرسم كل شيء هنا كصور عادية.

## التطوير

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` هو وحدة الـ hooks؛ و`hooks/i18n.ts` يضم النصوص والدوال المساعدة لاكتشاف اللغة والمنطقة؛ و`types/index.d.ts` هو عقد الحالة.

لإضافة لغة: أضف رمزها إلى `types/index.d.ts` و`.claude-plugin/plugin.json`، ونصوصها إلى `MESSAGES` و`SUPPORTED_LOCALES` في `hooks/i18n.ts`، وتلميحًا لاسمها إلى `LANGUAGE_NAME_HINTS`.

## الترخيص

[MIT](../LICENSE) © 2026 Jack Chiang
