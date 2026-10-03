# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · **Bahasa Indonesia**

Mod Claude Code yang menampilkan penggunaan Claude Anda dalam tiga bilah progres bergradasi tepat di atas prompt di **Claude Code Desktop** (juga di VS Code dan aplikasi seluler):

- **Konteks**: seberapa penuh jendela konteks saat ini
- **Batas 5 jam**: penggunaan sesi Anda, beserta sisa waktu hingga direset
- **Batas 7 hari**: penggunaan mingguan Anda, beserta sisa waktu hingga direset

![Pratinjau claude-mod-usage](../assets/preview.png)

## Fitur

- Bilah bergradasi hijau → kuning → merah dengan ujung membulat; warna aksen ikon juga mengikuti tingkat penggunaan
- Persentase ditampilkan di tengah setiap bilah dengan garis tepi, sehingga tetap terbaca di atas warna apa pun
- Semua bilah sama panjang dan barisnya selalu memenuhi lebar penuh
- Hitung mundur reset menggunakan font monospace
- Diperbarui setiap giliran dan setiap kali suatu batas berubah satu poin penuh; hitung mundur berjalan tiap menit
- 12 bahasa, terdeteksi otomatis
- Tidak mengubah terminal: CLI sudah punya status line untuk keperluan ini

![Semua 12 bahasa](../assets/languages.png)

## Persyaratan

- Claude Code dengan dukungan Mods (function hooks). Diuji pada versi 2.1.286. Mods API masih dalam tahap akses awal dan dapat berubah.
- Langganan Claude. Bilah "Batas 5 jam" dan "Batas 7 hari" hanya muncul jika Claude Code melaporkan batas penggunaan; dengan API key, hanya bilah "Konteks" yang tampil.

## Instalasi

### Instalasi cepat: biarkan Claude yang mengerjakan

Salin prompt ini lalu tempel di Claude Code (Desktop, CLI, atau VS Code). Claude akan mengunduh mod, memperbarui pengaturan, dan memeriksanya:

```text
Pasang mod Claude Code bernama claude-mod-usage: clone https://github.com/jack21/claude-mod-usage ke ~/.claude/mods/claude-mod-usage (kalau foldernya sudah ada, jalankan git pull di sana). Lalu tambahkan folder itu ke CLAUDE_CODE_PLUGIN_DIRS di blok "env" pada ~/.claude/settings.json, pertahankan folder yang sudah ada (gabungkan dengan ":" di macOS/Linux dan ";" di Windows), dan jangan ubah pengaturan lain. Pastikan settings.json tetap JSON yang valid, jalankan `claude plugin validate ~/.claude/mods/claude-mod-usage`, lalu ingatkan saya untuk membuka sesi baru.
```

### Instalasi manual

1. Unduh berkasnya:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Minta Claude Code untuk memuatnya. Claude Code Desktop tidak dapat menerima flag baris perintah, jadi tambahkan foldernya ke blok `env` di `~/.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   Beberapa folder dipisahkan dengan `:` (macOS / Linux) atau `;` (Windows).

3. Mulai sesi baru. Bilah akan muncul setelah balasan pertama.

Untuk mencoba sekali di CLI: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

Opsional: tambahkan `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` ke blok `env` yang sama agar Desktop memuat ulang mod saat Anda mengedit berkasnya.

## Bahasa

Bahasa tampilan dipilih dengan urutan berikut:

1. Opsi **Language** di menu konfigurasi plugin (`auto` secara default)
2. Pengaturan `language` milik Claude Code sendiri (mis. `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. Bahasa sistem macOS (aplikasi yang dibuka dari Dock biasanya tidak memiliki `LANG`)
5. Bahasa Inggris

Untuk mengunci bahasa tanpa lewat menu, tambahkan ini ke `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

Kode yang didukung: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`.

## Cara kerja

- `session.measure` mengirimkan angka konteks dan batas penggunaan; `session.start` membaca nilai saat ini dengan `$.session.usage()`.
- Bilah digambar ke slot `AbovePrompt` dengan elemen `Svg`. SVG yang ditampilkan sebagai gambar biasa akan diregangkan secara horizontal mengikuti kotaknya, jadi setiap bilah berupa garis berujung bulat dengan `vector-effect="non-scaling-stroke"`, yang menjaga ujungnya tetap bulat di lebar berapa pun. Teks (persentase, hitung mundur) adalah SVG terpisah berukuran tetap sehingga tidak pernah terdistorsi.
- Desktop menggambar frame SVG `isInteractive` di atas latar putih, karena itu semua elemen di sini digambar sebagai gambar biasa.

## Pengembangan

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` adalah modul hooks; `hooks/i18n.ts` berisi string dan fungsi bantu deteksi locale; `types/index.d.ts` adalah kontrak state.

Untuk menambahkan bahasa: tambahkan kodenya ke `types/index.d.ts` dan `.claude-plugin/plugin.json`, string-nya ke `MESSAGES` dan `SUPPORTED_LOCALES` di `hooks/i18n.ts`, serta petunjuk nama ke `LANGUAGE_NAME_HINTS`.

## Lisensi

[MIT](../LICENSE) © 2026 Jack Chiang
