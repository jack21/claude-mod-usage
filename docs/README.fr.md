# claude-mod-usage

[English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [العربية](README.ar.md) · **Français** · [বাংলা](README.bn.md) · [Português](README.pt.md) · [Русский](README.ru.md) · [Bahasa Indonesia](README.id.md)

Un Mod Claude Code qui affiche votre consommation Claude sous forme de trois barres de progression en dégradé, juste au-dessus du prompt dans **Claude Code Desktop** (ainsi que dans VS Code et l'application mobile) :

- **Contexte** : le taux de remplissage de la fenêtre de contexte actuelle
- **Limite de 5 heures** : la consommation de votre session, avec le temps restant avant sa réinitialisation
- **Limite de 7 jours** : votre consommation hebdomadaire, avec le temps restant avant sa réinitialisation

![Aperçu de claude-mod-usage](../assets/preview.png)

## Fonctionnalités

- Barres en dégradé vert → jaune → rouge aux extrémités arrondies ; la couleur d'accent de l'icône suit aussi la consommation
- Le pourcentage est affiché au centre de chaque barre, avec un contour qui le garde lisible sur n'importe quelle couleur
- Toutes les barres ont la même longueur et la ligne occupe toujours toute la largeur
- Compte à rebours de réinitialisation en police à chasse fixe
- Mise à jour après chaque tour et dès qu'une limite bouge d'un point entier ; le compte à rebours avance chaque minute
- 12 langues, détectées automatiquement
- Ne touche pas au terminal : la CLI dispose déjà d'une ligne d'état pour cela

![Les 12 langues](../assets/languages.png)

## Prérequis

- Claude Code avec la prise en charge des Mods (function hooks). Testé avec la version 2.1.286. L'API Mods est en accès anticipé et peut évoluer.
- Un abonnement Claude. Les barres « Limite de 5 heures » et « Limite de 7 jours » n'apparaissent que lorsque Claude Code remonte les limites d'utilisation ; avec une clé API, seule la barre « Contexte » s'affiche.

## Installation

### Installation rapide : laissez Claude s’en charger

Copiez ce prompt et collez-le dans Claude Code (Desktop, CLI ou VS Code). Claude télécharge le mod, met à jour vos réglages et les vérifie :

```text
Installe le mod Claude Code claude-mod-usage : clone https://github.com/jack21/claude-mod-usage dans ~/.claude/mods/claude-mod-usage (si le dossier existe déjà, lance plutôt git pull dedans). Ajoute ensuite ce dossier à CLAUDE_CODE_PLUGIN_DIRS dans le bloc "env" de ~/.claude/settings.json, en gardant les dossiers déjà présents (séparés par ":" sous macOS/Linux, ";" sous Windows) et sans modifier aucun autre réglage. Vérifie que settings.json est toujours un JSON valide, lance `claude plugin validate ~/.claude/mods/claude-mod-usage`, puis dis-moi d’ouvrir une nouvelle session.
```

### Installation manuelle

1. Récupérez les fichiers :

   ```bash
   git clone https://github.com/jack21/claude-mod-usage ~/.claude/mods/claude-mod-usage
   ```

2. Demandez à Claude Code de le charger. Claude Code Desktop ne permet pas de passer d'options en ligne de commande ; ajoutez donc le dossier au bloc `env` de `~/.claude/settings.json` :

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-mod-usage"
     }
   }
   ```

   Séparez plusieurs dossiers par `:` (macOS / Linux) ou `;` (Windows).

3. Démarrez une nouvelle session. Les barres apparaissent après la première réponse.

Pour un simple essai dans la CLI : `claude --plugin-dir ~/.claude/mods/claude-mod-usage`.

Facultatif : ajoutez `"CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"` dans ce même bloc `env` pour que Desktop recharge le mod lorsque vous modifiez ses fichiers.

## Langue

La langue d'affichage est choisie dans cet ordre :

1. L'option **Language** du menu de configuration du plugin (`auto` par défaut)
2. Le paramètre `language` de Claude Code lui-même (par ex. `"japanese"`, `"繁體中文"`)
3. `LC_ALL`, `LC_MESSAGES`, `LANG`
4. La langue du système macOS (les applications lancées depuis le Dock n'ont généralement pas de `LANG`)
5. L'anglais

Pour fixer une langue sans passer par le menu, ajoutez ceci à `~/.claude/settings.json` :

```json
{
  "pluginConfigs": {
    "mod-usage": { "language": "ja" }
  }
}
```

Codes pris en charge : `en`, `zh-CN`, `zh-TW`, `ja`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`, `ru`, `id`.

## Fonctionnement

- `session.measure` transmet les valeurs de contexte et de limites d'utilisation ; `session.start` lit les valeurs actuelles avec `$.session.usage()`.
- Les barres sont dessinées dans l'emplacement `AbovePrompt` avec des éléments `Svg`. Un SVG affiché comme simple image est étiré horizontalement pour remplir sa boîte ; chaque barre est donc une ligne aux extrémités arrondies avec `vector-effect="non-scaling-stroke"`, ce qui garde les extrémités bien circulaires quelle que soit la largeur. Le texte (pourcentage, compte à rebours) est un SVG distinct de taille fixe, il n'est donc jamais déformé.
- Desktop dessine les cadres SVG `isInteractive` sur un fond blanc ; c'est pourquoi tout est dessiné ici sous forme de simples images.

## Développement

```bash
claude plugin validate .   # checks the manifest and what the module hooks and calls
claude plugin test .       # runs tests/*.test.tsx against the engine
```

`hooks/register.tsx` est le module de hooks ; `hooks/i18n.ts` contient les chaînes et les fonctions utilitaires de détection de la locale ; `types/index.d.ts` définit le contrat de l'état.

Pour ajouter une langue : ajoutez son code à `types/index.d.ts` et à `.claude-plugin/plugin.json`, ses chaînes à `MESSAGES` et `SUPPORTED_LOCALES` dans `hooks/i18n.ts`, ainsi qu'un indice de nom à `LANGUAGE_NAME_HINTS`.

## Licence

[MIT](../LICENSE) © 2026 Jack Chiang
