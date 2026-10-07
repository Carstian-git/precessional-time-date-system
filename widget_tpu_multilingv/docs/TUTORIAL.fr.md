# Widgets pour le Temps précessionnel humain (TPH) – tutoriel d'installation

Tous les widgets affichent la même chose : le **cadran de 36 heures nouvelles** (10° par heure, 0 en haut, sens horaire), l'heure sous la forme `HN:MN:SN:SS`, la date du **calendrier précessionnel humain** (jour de la semaine, mois sur 13, jour du mois, ère et année de l'ère) et le nouveau fuseau.

**Langue.** Les widgets peuvent s'afficher en roumain, anglais ou français (`ro`, `en`, `fr`). La PWA a un sélecteur de langue (elle démarre avec la langue du navigateur). Pour les autres, on règle `LANG` / `Limba` / le deuxième argument, voir ci-dessous.

**Position.** Le nouveau fuseau se calcule à partir de la longitude (degrés est, négatif à l'ouest). La valeur par défaut, `26.1`, est Bucarest. Chaque widget n'a qu'une valeur à modifier (`LON` ou `Longitude`), indiquée ci-dessous.

**Précision.** L'heure et la date sont des calculs exacts (mêmes formules que le site, vérifiées automatiquement sur des dizaines de milliers d'instants). Les widgets n'affichent pas la phase de la Lune ni le jour lunaire (ils demandent le calcul astronomique complet ; vous les trouverez sur le site).

| Plateforme | Dossier | Compilation ? |
|---|---|---|
| Tout navigateur / téléphone / ordinateur (PWA) | `pwa/` | non |
| Windows, macOS, Linux (petite fenêtre) | `python/` | non |
| Windows (widget de bureau) | `windows_rainmeter/` | non |
| macOS (widget de bureau) | `macos_ubersicht/` | non |
| iPhone / iPad | `ios_scriptable/` | non (application Scriptable) |
| Android | `android/` | **oui** (Android Studio) |

---

## 1. PWA – application web installable (toutes plateformes)

La solution la plus simple ; elle fonctionne aussi hors ligne après la première visite.

1. Placez le dossier `pwa/` sur un serveur HTTPS. Le plus simple : GitHub Pages (voir « Publication sur GitHub »). L'adresse devient `https://<utilisateur>.github.io/<dépôt>/pwa/`.
2. Ouvrez l'adresse :
   - **Chrome/Edge (ordinateur, Android) :** l'icône « Installer » dans la barre d'adresse, ou menu ⋮ → « Installer l'application » / « Ajouter à l'écran d'accueil ».
   - **Safari (iPhone/iPad) :** bouton Partager → « Sur l'écran d'accueil ».
   - **Safari (macOS) :** Fichier → « Ajouter au Dock ».
3. Réglez la longitude : ouvrez « Position (nouveau fuseau) » dans l'application et saisissez la valeur, ou appuyez sur « Utiliser ma position ». Elle est mémorisée sur l'appareil. Le même panneau contient le sélecteur de langue.

Remarque : une PWA est une fenêtre d'application, pas un widget d'écran d'accueil (sur ordinateur, vous pouvez la laisser toujours visible). Pour un vrai widget, utilisez les options ci-dessous.

## 2. Python – petite fenêtre toujours au premier plan (Windows / macOS / Linux)

Il suffit de Python 3 avec Tkinter (inclus dans l'installateur officiel de python.org).

```
python python/ceas_tpu.py 26.1 fr
```

Le premier argument est la longitude, le second la langue (`ro`, `en`, `fr`). Clic gauche et glisser = déplacer ; clic droit = fermer.
Sous Windows, pour éviter la console, renommez le fichier en `ceas_tpu.pyw` et double-cliquez. Pour un démarrage automatique, placez un raccourci dans `shell:startup`.
Sous Linux, si Tkinter manque : `sudo apt install python3-tk`.

## 3. Windows – Rainmeter

1. Installez Rainmeter (rainmeter.net).
2. Copiez le dossier `windows_rainmeter/CeasTPU` dans `Documents\Rainmeter\Skins\`.
3. Clic droit sur l'icône Rainmeter de la zone de notification → « Refresh all ».
4. Dans la fenêtre Rainmeter : `CeasTPU` → `CeasTPU.ini` → « Load ».
5. Longitude et langue : modifiez dans `CeasTPU.ini` les lignes `Longitudine=26.1` et `Limba=ro` (ou via « Edit skin » de Rainmeter), puis « Refresh skin ».

## 4. macOS – Übersicht

1. Installez Übersicht (tracesof.net/uebersicht, gratuit).
2. Copiez le dossier `macos_ubersicht/CeasTPU.widget` dans `~/Library/Application Support/Übersicht/widgets/` (menu Übersicht : « Open Widgets Folder »).
3. Le widget apparaît aussitôt sur le bureau. Position : modifiez `left`/`top` dans `className` ; longitude et langue : les constantes `LON` et `LANG` au début de `index.jsx`.

## 5. iPhone / iPad – Scriptable

1. Installez l'application gratuite **Scriptable** depuis l'App Store.
2. Dans Scriptable, appuyez sur **+** (nouveau script), nommez-le « Ceas TPU » et collez tout le contenu de `ios_scriptable/TPU_Ceas.js`. Modifiez `LON` et `LANG` au début si besoin.
3. Appuyez sur ▶ pour tester.
4. Sur l'écran d'accueil : appui long → **+** → Scriptable → petite taille → « Ajouter le widget ». Puis touchez le widget → « Script » : Ceas TPU.

iOS décide lui-même de la fréquence d'actualisation des widgets (en général quelques minutes) ; l'aiguille peut donc prendre du retard entre deux mises à jour. C'est une limite du système, pas du calcul.

## 6. Android – compilation avec Android Studio

Le widget Android natif doit être compilé ; les sources forment donc un projet Gradle.

1. Installez **Android Studio** (developer.android.com/studio).
2. File → Open → choisissez le dossier `android/`. Attendez la synchronisation Gradle (elle télécharge les composants automatiquement).
3. Modifiez la longitude et la langue dans `app/src/main/java/ro/tpu/widget/TpuWidget.kt` (constantes `LON` et `LANG`). Le nom de l'application se traduit selon la langue du téléphone.
4. Branchez le téléphone (Options pour les développeurs → Débogage USB) ou lancez un émulateur, puis appuyez sur ▶ Run. Pour un fichier installable : Build → Build APK(s) ; le fichier apparaît dans `app/build/outputs/apk/debug/`.
5. Sur le téléphone : appui long sur l'écran d'accueil → Widgets → « Horloge TPH ».

Limite : Android peut retarder les mises à jour en mode économie de batterie ; le widget se rafraîchit environ toutes les 30 secondes lorsque le téléphone est actif.

> **État :** le code Android n'a pas été compilé dans l'environnement où il a été écrit (pas de SDK Android). La logique de calcul est la même que dans les autres widgets, qui ont été vérifiés, mais de petits ajustements de versions Gradle/AGP peuvent être nécessaires à la première compilation. En cas d'erreur, envoyez-la et nous la corrigerons.

---

## Publication sur GitHub

Les widgets sont du code ; ils peuvent donc se trouver dans le même dépôt que le site ou dans un dépôt séparé (par ex. `tpu-widgets`).

1. Placez tout le contenu de ce dossier dans le dépôt (y compris `README.md`).
2. Pour la PWA : Settings → Pages → branche `main`, dossier `/ (root)`. L'application se trouve alors à `https://<utilisateur>.github.io/<dépôt>/pwa/`.
3. Si vous le placez dans le dépôt du site, copiez `pwa/` à la racine du site sous `/widget/` et ajoutez un lien depuis la page « Outils ».
4. Pour Android, publiez l'APK dans « Releases » (pas dans le code).

## Mise à jour

Le noyau de calcul est dans `tpu_mini.js` (JavaScript, avec les textes RO/EN/FR) et dans les portages `python/ceas_tpu.py`, `windows_rainmeter/CeasTPU/@Resources/tpu.lua` et `android/.../TpuWidget.kt`. Si une règle du système change, il faut modifier chacun d'eux. La référence complète est `core.js` / `sistem_timp.py` du site.
