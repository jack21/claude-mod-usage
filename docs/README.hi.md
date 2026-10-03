# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · **हिन्दी** · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

एक Claude Code Mod जो **Claude Code Desktop** (साथ ही VS Code और मोबाइल ऐप) में प्रॉम्प्ट के ठीक ऊपर आपके Claude उपयोग को तीन ग्रेडिएंट प्रोग्रेस बार के रूप में दिखाता है:

- **कॉन्टेक्स्ट**: मौजूदा कॉन्टेक्स्ट विंडो कितनी भर चुकी है
- **5 घंटे की सीमा**: आपके सेशन का उपयोग, और रीसेट होने में बचा समय
- **7 दिन की सीमा**: आपका साप्ताहिक उपयोग, और रीसेट होने में बचा समय

![claude-mod-usage का प्रीव्यू](../assets/preview.png)

## विशेषताएँ

- हरे → पीले → लाल ग्रेडिएंट वाले बार, जिनके सिरे गोल हैं; आइकन का एक्सेंट रंग भी उपयोग के साथ बदलता है
- प्रतिशत हर बार के बीच में दिखता है और उसके चारों ओर आउटलाइन होती है, ताकि वह किसी भी रंग पर साफ़ पढ़ा जा सके
- सभी बार की लंबाई एक जैसी होती है और पंक्ति हमेशा पूरी चौड़ाई लेती है
- रीसेट का काउंटडाउन मोनोस्पेस फ़ॉन्ट में
- हर टर्न के बाद और जब भी कोई सीमा पूरे एक पॉइंट से बदलती है, तब अपडेट होता है; काउंटडाउन हर मिनट आगे बढ़ता है
- 12 भाषाएँ, अपने-आप पहचानी जाती हैं
- टर्मिनल में कोई बदलाव नहीं करता: CLI में इसके लिए पहले से एक स्टेटस लाइन मौजूद है

![सभी 12 भाषाएँ](../assets/languages.png)

## आवश्यकताएँ

- Mods (function hooks) सपोर्ट वाला Claude Code। 2.1.286 पर टेस्ट किया गया है। Mods API अभी अर्ली एक्सेस में है और इसमें बदलाव हो सकते हैं।
- Claude सब्सक्रिप्शन। "5 घंटे की सीमा" और "7 दिन की सीमा" वाले बार तभी दिखते हैं जब Claude Code रेट लिमिट रिपोर्ट करता है; API key इस्तेमाल करने पर सिर्फ़ "कॉन्टेक्स्ट" बार दिखता है।

## इंस्टॉल करें

### झटपट इंस्टॉल: Claude से करवाएँ

यह prompt कॉपी करके Claude Code (Desktop, CLI या VS Code) में पेस्ट करें। Claude खुद mod डाउनलोड करेगा, सेटिंग्स बदलेगा और उन्हें जाँचेगा:

```text
claude-mod-usage नाम का Claude Code mod इंस्टॉल करो: https://github.com/jack21/claude-mod-usage को ~/.claude/mods/claude-mod-usage में clone करो (अगर फ़ोल्डर पहले से है, तो उसमें git pull चलाओ)। फिर उस फ़ोल्डर को ~/.claude/settings.json के "env" ब्लॉक में CLAUDE_CODE_PLUGIN_DIRS में जोड़ो। पहले से मौजूद फ़ोल्डर रहने दो (macOS/Linux पर ":" और Windows पर ";" से जोड़ो) और कोई दूसरी सेटिंग मत बदलो। पक्का करो कि settings.json अब भी मान्य JSON है, `claude plugin validate ~/.claude/mods/claude-mod-usage` चलाओ, और मुझे नया session शुरू करने को कहो।
```

### मैन्युअल इंस्टॉल

1. फ़ाइलें प्राप्त करें:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Claude Code को इसे लोड करने के लिए कहें। Claude Code Desktop में कमांड-लाइन फ़्लैग नहीं दिए जा सकते, इसलिए फ़ोल्डर को `~/.claude/settings.json` के `env` ब्लॉक में जोड़ें:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   एक से ज़्यादा फ़ोल्डर `:` (macOS / Linux) या `;` (Windows) से अलग किए जाते हैं।

3. नया सेशन शुरू करें। पहले जवाब के बाद बार दिखने लगते हैं।

CLI में एक बार आज़माने के लिए: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`।

वैकल्पिक: उसी `env` ब्लॉक में `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` जोड़ें, ताकि mod की फ़ाइलें एडिट करने पर Desktop उसे दोबारा लोड कर ले।

## भाषा

डिस्प्ले भाषा इस क्रम में चुनी जाती है:

1. प्लगइन के कॉन्फ़िग मेन्यू में **Language** विकल्प (डिफ़ॉल्ट रूप से `auto`)
2. Claude Code की अपनी `language` सेटिंग (जैसे `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. macOS की सिस्टम भाषा (Dock से खोले गए ऐप्स में आमतौर पर `LANG` नहीं होता)
5. अंग्रेज़ी

मेन्यू के बिना कोई भाषा तय करने के लिए, `~/.claude/settings.json` में यह जोड़ें:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

समर्थित कोड: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`।

## यह कैसे काम करता है

- `session.measure` कॉन्टेक्स्ट और रेट लिमिट के आँकड़े भेजता है; `session.start` मौजूदा आँकड़े `$.session.usage()` से पढ़ता है।
- बार `Svg` एलिमेंट के ज़रिए `AbovePrompt` स्लॉट में बनाए जाते हैं। सादी इमेज वाला SVG अपने बॉक्स के अनुसार क्षैतिज रूप से खिंच जाता है, इसलिए बार एक गोल सिरों वाली लाइन है जिस पर `vector-effect="non-scaling-stroke"` लगा है, जिससे किसी भी चौड़ाई पर सिरे गोल बने रहते हैं। टेक्स्ट (प्रतिशत, काउंटडाउन) एक अलग, तय आकार का SVG है, इसलिए वह कभी विकृत नहीं होता।
- Desktop `isInteractive` SVG फ़्रेम को सफ़ेद बैकग्राउंड पर बनाता है, इसलिए यहाँ सब कुछ सादी इमेज के रूप में बनाया जाता है।

## डेवलपमेंट

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` hooks मॉड्यूल है; `hooks/i18n.ts` में स्ट्रिंग्स और लोकेल पहचानने वाले हेल्पर हैं; `types/index.d.ts` स्टेट का कॉन्ट्रैक्ट है।

नई भाषा जोड़ने के लिए: उसका कोड `types/index.d.ts` और `.claude-plugin/plugin.json` में, उसकी स्ट्रिंग्स `hooks/i18n.ts` के `MESSAGES` और `SUPPORTED_LOCALES` में, और एक नाम संकेत `LANGUAGE_NAME_HINTS` में जोड़ें।

## लाइसेंस

[MIT](../LICENSE) © 2026 Jack Chiang
