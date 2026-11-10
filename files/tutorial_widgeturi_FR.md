# Widgets pour le Temps précessionnel humain (TPH) – tutoriel d'installation

Tous les widgets affichent la même chose : le **cadran de 36 heures nouvelles** (10° par heure, 0 en haut, sens horaire), l'heure sous la forme `HN:MN:SN:SS`, la date du **calendrier précessionnel humain** (jour de la semaine, mois sur 13, jour du mois, ère et année de l'ère) et le nouveau fuseau.

**Langue.** Les widgets peuvent s'afficher en roumain, anglais ou français (`ro`, `en`, `fr`). La PWA a un sélecteur de langue (elle démarre avec la langue du navigateur). Pour les autres, on règle `LANG` / `Limba` / le deuxième argument, voir ci-dessous.

**Position.** Le nouveau fuseau se calcule à partir de la longitude (degrés est, négatif à l'ouest). La valeur par défaut, `26.1`, est Bucarest. Chaque widget n'a qu'une valeur à modifier (`LON` ou `Longitude`), indiquée ci-dessous.

**Précision.** L'heure et la date sont des calculs exacts (mêmes formules que le site, vérifiées automatiquement sur des dizaines de milliers d'instants). Les widgets n'affichent pas la phase de la Lune ni le jour lunaire (ils demandent le calcul astronomique complet ; vous les trouverez sur le site). Exception : les skins Rainmeter montre et Terre affichent aussi la phase de la Lune.

| Plateforme | Dossier | Compilation ? |
|---|---|---|
| Tout navigateur / téléphone / ordinateur (PWA) | `pwa/` | non |
| Windows, macOS, Linux (petite fenêtre) | `python/` | non |
| Windows (widget de bureau) | `windows_rainmeter/` | non |
| macOS (widget de bureau) | `macos_ubersicht/` | non |
| iPhone / iPad | `ios_scriptable/` | non (application Scriptable) |
| Linux (petite fenêtre, démarrage auto) | `linux/` + `python/` | non |
| Android | `android/` | **oui** (Android Studio) |

---

## 1. PWA – application web installable (toutes plateformes)

> **L'application est déjà publiée sur ce site :** https://carstian-git.github.io/precessional-time-date-system/widget_tpu_multilingv/pwa/
> Ouvrez l'adresse et passez directement à l'étape 2 (installation).

La solution la plus simple ; elle fonctionne aussi hors ligne après la première visite.

1. L'adresse de l'application est celle ci-dessus. (Pour l'avoir sur votre propre serveur, placez le dossier `pwa/` sur un serveur HTTPS ; l'adresse devient `https://<domaine>/pwa/`.)
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

Le paquet contient quatre skins : l'horloge avec la date, les montres de 36 h et de 18 h et l'Horloge de la Terre. Sous chaque cadran figurent l'heure TPH avec le fuseau, l'heure locale en SI avec son décalage par rapport à UTC, la date du calendrier précessionnel humain, ER, AE et la date locale.

1. Installez Rainmeter (rainmeter.net).
2. Si vous avez une ancienne version, supprimez le dossier `Documents\Rainmeter\Skins\CeasuriTPU` (et tout ancien dossier `CeasTPU`).
3. Copiez le dossier `windows_rainmeter/CeasuriTPU` dans `Documents\Rainmeter\Skins\` (directement là, pas dans `illustro`).
4. Clic droit sur l'icône Rainmeter de la zone de notification → « Refresh all ».
5. Dans la fenêtre Rainmeter, chargez (Load) l'un de : `CeasuriTPU\Ceas\Ceas.ini`, `Mana36\Mana36.ini`, `Mana18\Mana18.ini`, `Pamant\Pamant.ini`.
6. Réglages, dans `[Variables]` de chaque `.ini` (puis « Refresh skin ») : `Longitudine=auto` (d'après le fuseau Windows ; ou un nombre, degrés est), `Limba=auto` (suit la langue de Windows : roumain, anglais ou français ; ou `ro`, `en`, `fr`), `Diacritice=0` (sans diacritiques, par défaut ; mettez 1 si vous en voulez). `Pamant.ini` a aussi `Latitudine` (44.4 par défaut, mettez la vôtre) et `Marime`.

Détails dans `windows_rainmeter/CeasuriTPU/CITESTE.txt` (en roumain). Les skins ont été vérifiés numériquement par rapport au site, mais le dessin n'a pas encore été essayé directement dans Rainmeter.


**Comment lire l'Horloge de la Terre** (pareil dans le skin Rainmeter et sur le site) :

- La carte est vue de dessus le pôle Nord (au centre). Le fuseau 0 est en bas, l'est à droite.
- **L'aiguille bleu clair, avec contour,** indique votre fuseau. Votre heure est le nombre de la case qu'elle désigne.
- **Le Soleil jaune à rayons**, sur l'anneau, montre le fuseau où il est midi maintenant (heure 18). Le Soleil va vers l'ouest.
- **Le petit cercle orange avec un point** est le point subsolaire : là où le Soleil est au zénith. Il se déplace vers l'ouest chaque jour et entre les deux tropiques selon les saisons.
- **Le méridien pointillé** part de là vers le centre : tous les fuseaux de la ligne ont midi solaire en ce moment.
- **Le parallèle pointillé** est le cercle autour du Pôle passant par le même point. Il s'agrandit ou se réduit avec les saisons et montre la distance du Soleil au pôle.
- La partie sombre de la carte est la nuit ; la ligne jour-nuit est à 90° du point subsolaire.
- Sur la montre 18 h, les chiffres de la demi-journée qui n'est pas en cours restent lisibles (brun foncé), et ceux de la moitié en cours sont bleu marine et en gras.


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

## 7. Linux

Deux options, sans compilation.

**Petite fenêtre (Python).** Fonctionne sur tout bureau (GNOME, KDE, Xfce, etc.) sous X11 ; sous Wayland, la fenêtre peut ne pas rester au-dessus des autres.

1. Installez Python 3 avec Tkinter : `sudo apt install python3-tk` (Debian/Ubuntu), `sudo dnf install python3-tkinter` (Fedora) ou `sudo pacman -S tk` (Arch).
2. Lancez : `python3 python/ceas_tpu.py 26.1 fr` (longitude, puis langue `ro`, `en` ou `fr`). Clic gauche et glisser = déplacer ; clic droit = fermer.
3. Démarrage automatique à la connexion : `sh linux/instaleaza.sh 26.1 fr`. Le script place un fichier dans `~/.config/autostart/`. Pour le retirer, supprimez `~/.config/autostart/ceas-tpu.desktop`.

**Application web (PWA).** Ouvrez l'adresse de la PWA dans Chromium, Chrome ou Edge et choisissez « Installer » ; elle apparaît comme application dans le menu.


## Horloges HTML (tout système)

Le dossier `ceasuri_web/` contient les mêmes horloges (Horloge de la Terre, montres 36 h et 18 h) sous forme de pages HTML, avec le vrai code du site. Sous Windows, double-clic sur un fichier `.bat` ; sur tout autre système, ouvrez `pamant_fr.html`, `mana36_fr.html` ou `mana18_fr.html` (`ro`/`en` pour roumain/anglais) dans un navigateur. Lieu : ajoutez `?lon=26.1&lat=44.4` à l'adresse. Le dossier `assets/` doit rester à côté des pages. Détails dans `ceasuri_web/CITESTE.txt` (en roumain).

---
