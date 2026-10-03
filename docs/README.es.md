# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · **Español** · [العربية](README.ar.md) · [Français](README.fr.md) · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

Un Mod de Claude Code que muestra tu uso de Claude con tres barras de progreso en degradado justo encima del prompt en **Claude Code Desktop** (también en VS Code y en la app móvil):

- **Contexto**: cuánto se ha llenado la ventana de contexto actual
- **Límite de 5 horas**: el uso de tu sesión y el tiempo que falta para que se restablezca
- **Límite de 7 días**: tu uso semanal y el tiempo que falta para que se restablezca

![Vista previa de claude-mod-usage](../assets/preview.png)

## Características

- Barras en degradado verde → amarillo → rojo con extremos redondeados; el color de acento del icono también cambia según el uso
- El porcentaje aparece en el centro de cada barra, con contorno para que se lea bien sobre cualquier color
- Todas las barras tienen la misma longitud y la fila siempre ocupa todo el ancho
- Cuenta atrás del restablecimiento en fuente monoespaciada
- Se actualiza después de cada turno y cada vez que un límite cambia un punto entero; la cuenta atrás avanza cada minuto
- 12 idiomas, detectados automáticamente
- No toca la terminal: la CLI ya tiene una línea de estado para esto
- Convive con otros mods sobre el prompt: lo que dibujen ahí se apila debajo de las barras en lugar de quedar tapado

![Los 12 idiomas](../assets/languages.png)

## Requisitos

- Claude Code con soporte para Mods (function hooks). Probado en la versión 2.1.286. La API de Mods está en acceso anticipado y puede cambiar.
- Una suscripción a Claude. Las barras «Límite de 5 horas» y «Límite de 7 días» solo aparecen cuando Claude Code informa de los límites de uso; con una clave de API solo verás la barra «Contexto».

## Instalación

### Instalación rápida: deja que Claude lo haga

Copia este prompt y pégalo en Claude Code (Desktop, CLI o VS Code). Claude descarga el mod, actualiza tu configuración y la comprueba:

```text
Instala el mod de Claude Code claude-mod-usage: clona https://github.com/jack21/claude-mod-usage en ~/.claude/mods/claude-mod-usage (si la carpeta ya existe, ejecuta git pull en ella). Después añade esa carpeta a CLAUDE_CODE_PLUGIN_DIRS dentro del bloque "env" de ~/.claude/settings.json, conservando las carpetas que ya estén (únelas con ":" en macOS/Linux y ";" en Windows) y sin cambiar ningún otro ajuste. Comprueba que settings.json sigue siendo JSON válido, ejecuta `claude plugin validate ~/.claude/mods/claude-mod-usage` y dime que abra una sesión nueva.
```

### Instalación manual

1. Descarga los archivos:

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Indica a Claude Code que lo cargue. Claude Code Desktop no admite opciones de línea de comandos, así que añade la carpeta al bloque `env` de `~/.claude/settings.json`:

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   Si son varias carpetas, sepáralas con `:` (macOS / Linux) o `;` (Windows).

3. Inicia una sesión nueva. Las barras aparecen después de la primera respuesta.

Para probarlo una sola vez en la CLI: `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

Opcional: añade `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` al mismo bloque `env` para que Desktop recargue el mod cuando edites sus archivos.

## Idioma

El idioma de la interfaz se elige en este orden:

1. La opción **Language** del menú de configuración del plugin (`auto` de forma predeterminada)
2. El ajuste `language` del propio Claude Code (p. ej., `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. El idioma del sistema macOS (las apps abiertas desde el Dock no suelen tener `LANG`)
5. Inglés

Para fijar un idioma sin usar el menú, añade esto a `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

Códigos admitidos: `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`.

## Cómo funciona

- `session.measure` envía las cifras de contexto y de límites de uso; `session.start` lee las actuales con `$.session.usage()`.
- Las barras se dibujan en el slot `AbovePrompt` con elementos `Svg`. Un SVG de imagen simple se estira horizontalmente hasta ocupar su caja, así que cada barra es una línea con extremos redondeados y `vector-effect="non-scaling-stroke"`, lo que mantiene los extremos circulares con cualquier ancho. El texto (porcentaje, cuenta atrás) es un SVG aparte de tamaño fijo, por lo que nunca se deforma.
- Desktop dibuja los marcos SVG `isInteractive` sobre un fondo blanco, así que aquí todo se dibuja como imágenes simples.

## Desarrollo

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` es el módulo de hooks; `hooks/i18n.ts` contiene las cadenas y las funciones auxiliares para detectar la configuración regional; `types/index.d.ts` es el contrato del estado.

Para añadir un idioma: agrega su código a `types/index.d.ts` y a `.claude-plugin/plugin.json`, sus cadenas a `MESSAGES` y `SUPPORTED_LOCALES` en `hooks/i18n.ts`, y una pista de nombre a `LANGUAGE_NAME_HINTS`.

## Licencia

[MIT](../LICENSE) © 2026 Jack Chiang
