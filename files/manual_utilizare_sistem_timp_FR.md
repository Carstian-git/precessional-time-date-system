# Temps précessionnel humain et calendrier précessionnel humain

## Manuel d'utilisation pour Excel, Python et la page web

Version : 3 octobre 2026 (traduction française du manuel roumain). Fichiers couverts : `timp_36_ore_rotatie.xlsx`, `sistem_timp.py`, `calendar_13_luni.py`, `conversie_timp.py`, `creare_cadrane.py`, `ora_minute_secunde.xlsx` et les images des cadrans.

> Toutes les dates et heures saisies sont en UTC, sauf indication contraire. L'intervalle testé va de 1900 à 2200.
>
> **Note sur la langue.** Les fichiers eux-mêmes (noms des feuilles du classeur, messages et commentaires des scripts) sont en roumain. Ce manuel garde les noms d'origine entre guillemets et en donne la traduction entre parenthèses à leur première apparition. Quand un script affiche du texte, les exemples reproduisent la sortie exacte du script (en roumain).

## Table des matières

1. Ce qu'est ce système
2. Les fichiers livrés
3. Règles et formules
4. Guide Excel, feuille par feuille
5. Guide Python
6. Exemples détaillés
7. Vérifications, exactitude et limites
8. Dépannage et questions fréquentes
9. Annexes : glossaire, la tradition derrière les unités, tableaux de noms

## 1. Ce qu'est ce système

**Le nom.** Le « temps précessionnel humain » (TPH) est l'horloge de 36 heures (360°), et le « calendrier précessionnel humain » est la date et le calendrier de 13 mois. « Précessionnel » vient de la précession des équinoxes, le lent mouvement (25 772 ans) qui partage le temps en 12 ères ; « humain » signifie à l'échelle de la perception humaine : le système n'emploie que ce que n'importe qui peut observer sur Terre. Un seul cycle de précession, le cycle actuel (23332 av. J.-C. – 2440 apr. J.-C.), contient toute l'histoire connue de l'humanité, de sorte que toute date du passé a un code unique. Après 2440 commence le cycle suivant. On emploie le nom complet, non des abréviations.

Le système mesure le temps comme un angle et ancre l'année et les ères aux mouvements réels du Soleil, de la Lune et de l'axe de la Terre, sans dépendre d'aucune tradition religieuse. Les idées de base sont les suivantes :

- **Le jour compte 36 heures nouvelles et correspond à une rotation complète de 360°.** Une heure nouvelle vaut 10° et 10 minutes nouvelles, une minute nouvelle vaut 1° et 10 secondes nouvelles, une seconde nouvelle vaut 0,1° et 24 sous-secondes. Une sous-seconde est exactement une seconde SI : la conversion avec le temps standard est donc exacte, sans arrondi.
- **Midi solaire est à 18:00:00:00**, comme le « 12 » de l'horloge classique. Minuit est l'heure 0.
- **L'année commence le jour du solstice de décembre.** Une année nouvelle compte 365 jours, ou 366 les années bissextiles (le numéro k de l'année est multiple de 4, mais pas de 128). L'année moyenne est de 365,2421875 jours, très proche de l'année tropique.
- **Le calendrier compte 13 mois de 28 jours**, soit 364 jours et 52 semaines exactes. Chaque mois commence un lundi (jour 1) et finit un dimanche (jour 28). Le jour 365 est le **Jour de l'année**, et les années bissextiles le jour 366 est le **Jour bissextile**. Tous deux sont hors semaine et n'ont pas de jour de la semaine.
- **Le Soleil et la Lune sont traités comme des angles sur un cercle.** L'angle solaire se mesure à partir du solstice de décembre (0°, 90°, 180°, 270° = solstice, équinoxe, solstice, équinoxe). L'angle lunaire est l'élongation par rapport au Soleil (0° nouvelle lune, 90° premier quartier, 180° pleine lune, 270° dernier quartier).
- **Les ères suivent la précession des équinoxes.** L'axe de la Terre décrit un cycle d'environ 25 772 ans, divisé en 12 ères précessionnelles (ER 1–12) de 2147 ou 2148 ans, regroupées en 4 cadrans de 6 443 ans chacun. L'année dans l'ère est AE, sans année zéro. Le repère est l'étoile Spica : ER 1 (Verseau) commence avec la nouvelle année qui débute le 21.12.2440, et l'ère actuelle est ER 12 (Poissons), depuis l'an 293 apr. J.-C. Avec elles on peut aussi dater l'histoire : 785 av. J.-C. = ER 11, AE 1072.
- **Les noms des mois, des jours et des ères** existent en sanskrit, en anglais et en français, avec des numéraux 1–13, pour rester neutres à l'égard de tout dogme.

Les unités de temps nouvelles et leurs équivalents :

| Unité nouvelle | Équivalent en unités nouvelles | Angle de rotation | En temps standard |
|---|---|---|---|
| Jour | 36 heures | 360° | 24 h = 86 400 s |
| Heure nouvelle (HN) | 10 minutes | 10° | 40 min = 2 400 s |
| Minute nouvelle (MN) | 10 secondes | 1° | 4 min = 240 s |
| Seconde nouvelle (SN) | 24 sous-secondes | 0,1° | 24 s |
| Sous-seconde (SS) | – | 0,004167° | 1 s (la seconde SI) |

## 2. Les fichiers livrés

| Fichier | Contenu | Quand l'utiliser |
|---|---|---|
| `timp_36_ore_rotatie.xlsx` | Le classeur principal, de 13 feuilles (section 4) | Conversions, calendriers, ères, code complet, impression |
| `sistem_timp.py` | Conversion exacte UTC ↔ code complet (ER-AE-…), ères et datation historique, positions réelles du Soleil et de la Lune, événements, fuseaux, tests | Calculs exacts pour n'importe quel instant ; l'alternative programmatique aux feuilles « Timp complet » (Temps complet) et « Ere » (Ères) |
| `calendar_13_luni.py` | Conversion grégorien ↔ calendrier de 13 mois, aligné sur le solstice, avec des noms en quatre langues | Conversions de dates, tableau des mois d'une année |
| `conversie_timp.py` | Conversion simple 24 h ↔ 36 h, avec sous-seconde | Seulement l'heure du jour |
| `creare_cadrane.py` | Dessine quatre cadrans (année, ères, horloges de 18 h et de 36 h) pour un instant donné et peut les insérer dans Excel | Images à imprimer, avec la date du jour |
| `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png`, `cadran_36h_zi_intreaga.png` | Les cadrans prêts, pour le 2 octobre 2026, 12:00 UTC, à Bucarest | Affichage, impression |
| `ora_minute_secunde.xlsx` | Tableau simple des 86 400 secondes du jour standard (heure, minutes, secondes) | Référence de base |
| `manual_utilizare_sistem_timp.md` et `.docx` (original roumain ; traductions anglaise et française) | Ce manuel | Lecture |

## 3. Règles et formules

### 3.1 L'heure du jour : conversion 24 h ↔ 36 h

On passe par T, le nombre de secondes SI écoulées depuis minuit :

```
T = h*3600 + m*60 + s                       (h 0-23, m 0-59, s 0-59)

24 h -> 36 h                                36 h -> 24 h
heure (HN)      = T // 2400                 T = HN*2400 + MN*240 + SN*24 + SS
minute (MN)     = (T % 2400) // 240         h = T // 3600
seconde (SN)    = (T % 240) // 24           m = (T % 3600) // 60
sous-seconde    = T % 24                    s = T % 60
angle (degrés)  = T / 240
```

Dans ces formules `//` est le quotient entier et `%` le reste. Exemple : 15:30:45 donne T = 55 845, donc l'heure 23, la minute 2, la seconde 6, la sous-seconde 21 et 232,6875°.

Équivalences rapides : heure standard × 1,5 = heure nouvelle ; 1 heure nouvelle = 40 minutes standard ; 1 minute nouvelle = 4 minutes standard ; 1 seconde nouvelle = 24 secondes standard.

### 3.2 La nouvelle année

```
debut_an(k) = 22.12.2011 + 365*(k-1) + (k-1)//4 - (k-1)//128
bissextile(k) = (k % 4 == 0) et (k % 128 != 0)
N           = jour_calendaire - debut_an(k) + 1        (N = 1..365, ou 366)
```

L'année nouvelle k est un **compteur interne** : k = 1 est la nouvelle année qui commence le 22.12.2011, et k peut aussi être négatif (les années antérieures à cette époque). De k on déduit l'ère et l'année de l'ère (section 3.8), qui sont celles employées dans le code.

**Comment choisir l'année dans une feuille ou un script.** On donne l'année grégorienne qui contient le 1er juillet de la nouvelle année voulue. Par exemple, 2026 signifie k = 15, du 21.12.2025 au 20.12.2026, soit ER 12, AE 1734. Dans `calendar_13_luni.py` on peut aussi donner directement `AN15` (c'est-à-dire k = 15 ; « AN » est le mot roumain pour « année »).

La règle bissextile (4/128) donne une année moyenne de 365,2421875 jours. Le jour supplémentaire s'ajoute à la fin de l'année, après le Jour de l'année. Le Grand Jubilé (un jour de plus tous les 128 000 ans) n'est pas employé, car il augmenterait l'écart par rapport à l'année tropique.

### 3.3 Le calendrier de 13 mois, les arcs et le cadran solaire

```
N <= 364 :  LC = (N-1)//28 + 1       ZN = (N-1)%28 + 1       jour_semaine = (N-1)%7  (0 = lundi ... 6 = dimanche)
N == 365 :  LC = 00, ZN = 01  (Jour de l'année)
N == 366 :  LC = 00, ZN = 02  (Jour bissextile, seulement les années bissextiles)
AS = min(73, (N-1)//5 + 1)           ZA = N - 5*(AS-1)       (l'arc 73 compte 6 jours les années bissextiles)
```

- **LC** est le mois calendaire (01–13, ou 00 pour les jours hors semaine), et **ZN** le jour du mois (01–28). Le jour de la semaine s'en déduit : lundi est ((ZN−1) mod 7) + 1 = 1.
- **AS** est l'arc solaire de 5 jours (01–73), et **ZA** le jour dans l'arc (1–5, ou 6). Les arcs sont un second décompte de l'année, semblable aux 72 pentades de la tradition chinoise.
- **CS** est le cadran solaire 1–4, défini d'après la position réelle du Soleil : le cadran où se trouve le Soleil à la fin du jour. CS 1 commence au solstice de décembre, CS 2 à l'équinoxe de mars, CS 3 au solstice de juin, CS 4 à l'équinoxe de septembre. Les limites sont les instants astronomiques exacts (formules de Meeus, précision inférieure à une minute), non une règle fixe d'arcs.
- Le jour de la semaine du calendrier nouveau diffère en général du jour grégorien. Par exemple, le 29 septembre 2026 est un mardi dans le calendrier grégorien, mais un mercredi (jour 3 du mois 11) dans le nouveau. C'est pourquoi les feuilles affichent souvent les deux jours.

### 3.4 Le Soleil, la Lune et les phénomènes astronomiques

- **L'angle solaire** est la longitude du Soleil à partir du solstice de décembre. Le 29.09.2026, 15:30:45 UTC, il vaut 276,5° (cadran 4).
- **L'angle lunaire** est l'élongation de la Lune par rapport au Soleil. Au même instant il vaut 218,1°, c'est-à-dire entre la pleine lune et le dernier quartier.
- **Les phases de la Lune** se divisent en huit secteurs de 45°, centrés sur 0°, 45°, …, 315° : nouvelle, premier croissant, premier quartier, gibbeuse croissante, pleine, gibbeuse décroissante, dernier quartier, dernier croissant.
- **CL** est le jour lunaire (01–30). Le jour 1 est le jour local où survient la nouvelle lune astronomique ; on compte ensuite jour après jour jusqu'à la nouvelle lune suivante.
- **Les phénomènes** de la feuille « Evenimente » (Événements) et des scripts sont : les quatre instants solaires (solstices et équinoxes), les quatre quartiers de la Lune et les éclipses possibles.
- **Éclipse possible.** On marque une éclipse de Soleil quand la latitude de la Lune à la nouvelle lune est inférieure à 1,58°, et une éclipse de Lune (par l'ombre) quand la distance entre l'axe de l'ombre et le centre de la Lune est inférieure à 1,0128 rayon équatorial terrestre. La marque indique que la Lune est près d'un nœud ; elle ne dit pas où l'éclipse est visible.

### 3.5 Fuseaux et heure locale

Un degré de longitude vaut une minute nouvelle ; l'heure locale moyenne est donc l'UTC plus la longitude en minutes nouvelles.

```
fuseau nouveau = floor(longitude/10 + 0.5)           heures nouvelles entières, de -18 à +18
décalage       = fuseau * 2400 secondes              mode « Fuseau » (roumain : « Fus »)
décalage       = longitude * 240 secondes (arrondi)  mode « Solaire »
```

Les 36 fuseaux sont des bandes de 10° centrées sur les multiples de 10°. L'écart par rapport à l'heure solaire moyenne est au plus de ±5 minutes nouvelles (±20 minutes standard). Exemples :

| Lieu | Longitude | Fuseau nouveau | Décalage (temps standard) |
|---|---|---|---|
| Bucarest | 26,1° E | +3 | +2 h 00 min |
| Londres | −0,1° | 0 | 0 |
| New York | −74,0° | −7 | −4 h 40 min |
| Tokyo | 139,7° E | +14 | +9 h 20 min |

Les fuseaux nouveaux ne coïncident avec les fuseaux actuels qu'un sur trois (+3 = UTC+2, +6 = UTC+4, et ainsi de suite). Il n'y a pas d'heure d'été.

### 3.6 Le code complet

Le format est `ER-AE-CS-AS.ZA-CL-LC-ZN HN:MN:SN:SS suffixe`.

| Champ | Sens | Valeurs |
|---|---|---|
| ER | Ère précessionnelle (précession des équinoxes) | 1–12 (ER 1 = Verseau, ER 12 = Poissons) |
| AE | Année de l'ère, sans année zéro | 0001–2148 |
| CS | Cadran solaire | 1–4 |
| AS.ZA | Arc solaire et jour dans l'arc | 01–73 et 1–5 (6) |
| CL | Jour lunaire | 01–30 |
| LC | Mois calendaire | 00–13 |
| ZN | Jour du mois | 01–28 (pour LC 00 : 01 ou 02) |
| HN:MN:SN:SS | Temps nouveau | 00–35 : 00–09 : 00–09 : 00–23 |
| suffixe | Fuseau ou temps solaire local | `F+03` (fuseau) ou `L+26.1` (solaire, longitude) |

Exemple complet : `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` signifie : ère 12 (Poissons), année 1734 de l'ère ; cadran solaire 4, arc 57 jour 3 ; jour lunaire 19 ; mois 11, jour 3 (mercredi) ; heure nouvelle 26:02:06:21 ; fuseau +3.

**Écriture de l'heure.** L'heure, la minute et la seconde s'écrivent sur deux chiffres (par exemple `19:08:04`), comme sur l'horloge classique, bien que la minute et la seconde n'aillent que de 0 à 9. Les programmes acceptent aussi la forme sans zéro (`19:8:4`).

Un code ER-AE est unique dans un cycle de précession (25 772 ans). Le cycle actuel se termine avec l'an 2440 ; pour d'autres cycles, les fonctions Python et les feuilles Excel ont un paramètre « cycle » (0 = actuel).

**Formes courtes pour l'usage quotidien.** Le code complet est un format d'archive. Pour l'usage courant, on ne garde que la partie utile : `ER 12 · AE 1734 · mois 11 · jour 3 · 26:02:06` (ère, année de l'ère, mois, jour et heure) ; les autres champs sont des ajouts facultatifs.

### 3.7 Les angles en degrés, gon et radians

| Unité | Cercle | Un quart | 1 unité de rotation en secondes SI |
|---|---|---|---|
| Degré décimal | 360° | 90° | 240 (exact) |
| Gon (grade) | 400 | 100 | 216 (exact), mais 0,01 gon = 2,16 s |
| Radian | 2π | π/2 | 13 751 (nombre irrationnel) |

Le degré décimal est l'unité de base, car il garde le lien exact avec la seconde SI. Le script affiche chaque angle en degrés, gon et radians (la commande `unghiuri`, « angles »).

### 3.8 Les ères et la datation historique

**La précession des équinoxes.** L'axe de la Terre tourne lentement (environ 50,29″ par an), et le cycle complet dure environ 25 772 ans. Le système le divise en 12 ères (30° chacune), numérotées ER 1–12, de 2147 ou 2148 ans : les limites sont `floor(j × 25772 / 12)`, soit 0, 2147, 4295, 6443, … 25772. Huit ères ont 2148 ans et quatre en ont 2147 ; chaque groupe de trois ères compte exactement 6 443 ans, donc le cycle a quatre **cadrans** de 6 443 ans.

**Le repère : l'étoile Spica.** Spica (α Virginis) est proche de l'écliptique (latitude −2,05°) ; Hipparque a découvert la précession en comparant sa position. On définit l'ayanāṁśa(t) = longitude écliptique de Spica à la date t, moins 180°. Les Poissons couvrent l'ayanāṁśa de 0° à 30°, et **ER 1 (Verseau) commence quand l'ayanāṁśa atteint 30°**. Le calcul (Spica à 203,841° en J2000, précession IAU 2006) donne l'ayanāṁśa 0° vers l'an 287 apr. J.-C. et 30° vers l'an 2440 apr. J.-C. L'ancrage choisi est donc **AE 1 d'ER 1 = la nouvelle année 2441** (à partir du 21.12.2440). Polaris ne peut pas être le repère : c'est l'étoile polaire d'aujourd'hui, elle n'est pas sur l'écliptique, et le pôle passe près d'autres étoiles (Thuban, Véga, etc.).

```
ayanamsa 0° à 286,8 ; 30° à 2440,5 ; ER 1 commence avec la nouvelle année 2441
```

**Les 12 ères** (le cycle actuel, qui se termine à l'ancrage ; années en numérotation historique) :

| ER | Sanskrit | Anglais | Français | Années | Du | Au |
|---|---|---|---|---|---|---|
| 1 | Kumbha | Aquarius | Verseau | 2147 | 23332 av. J.-C. | 21186 av. J.-C. |
| 2 | Makara | Capricorn | Capricorne | 2148 | 21185 av. J.-C. | 19038 av. J.-C. |
| 3 | Dhanus | Sagittarius | Sagittaire | 2148 | 19037 av. J.-C. | 16890 av. J.-C. |
| 4 | Vṛścika | Scorpio | Scorpion | 2147 | 16889 av. J.-C. | 14743 av. J.-C. |
| 5 | Tulā | Libra | Balance | 2148 | 14742 av. J.-C. | 12595 av. J.-C. |
| 6 | Kanyā | Virgo | Vierge | 2148 | 12594 av. J.-C. | 10447 av. J.-C. |
| 7 | Siṃha | Leo | Lion | 2147 | 10446 av. J.-C. | 8300 av. J.-C. |
| 8 | Karkaṭa | Cancer | Cancer | 2148 | 8299 av. J.-C. | 6152 av. J.-C. |
| 9 | Mithuna | Gemini | Gémeaux | 2148 | 6151 av. J.-C. | 4004 av. J.-C. |
| 10 | Vṛṣabha | Taurus | Taureau | 2147 | 4003 av. J.-C. | 1857 av. J.-C. |
| 11 | Meṣa | Aries | Bélier | 2148 | 1856 av. J.-C. | 292 apr. J.-C. |
| 12 | Mīna | Pisces | Poissons | 2148 | 293 apr. J.-C. | 2440 apr. J.-C. |

**Les formules**, avec k la nouvelle année (section 3.2) et 430 = 2441 − 2011 :

```
p  = (k - 430) % 25772                       position dans le cycle, 0..25771
ER = le plus grand j (1..12) tel que floor((j-1)*25772/12) <= p
AE = p - floor((ER-1)*25772/12) + 1          année de l'ère, sans année zéro
```

**Datation historique.** Pour une année Y en numérotation astronomique (1 av. J.-C. = 0, donc 785 av. J.-C. = −784), k = Y − 2011. L'année grégorienne est celle qui contient le 1er juillet de la nouvelle année. Exemples :

```
$ python sistem_timp.py istoric 785BCE
785 î.e.n. (an astronomic -784)  =  ER 11 (Meṣa · Aries · Bélier), AE 1072
$ python sistem_timp.py istoric-inv 11 1072
ER 11, AE 1072 (ciclul +0)  =  785 î.e.n. (an astronomic -784)
```

(Le script affiche en roumain : « î.e.n. » signifie av. J.-C., « an astronomic » année astronomique, « ciclul » le cycle.)

Dans Excel, les mêmes conversions se trouvent dans la feuille « Ere » (sections « Datare istorică », datation historique). L'année 2026 est ER 12, AE 1734 ; l'an 1 apr. J.-C. est ER 11, AE 1857.

**Limites.**
- Les ères ont des longueurs égales, alors que la précession réelle a changé au cours du temps ; le modèle diffère donc de la position réelle du point vernal d'environ 8 ans à l'an 1 apr. J.-C., 17 ans à 785 av. J.-C. et 31 ans à 1800 av. J.-C.
- Le repère stellaire a une incertitude de quelques années (mouvement propre de Spica, modèle de la précession).
- Un code ER-AE n'est unique que dans un cycle de 25 772 ans.
- Les scripts n'acceptent les jours exacts (avec mois et jour) que pour les années 1–9999 apr. J.-C. ; pour les années av. J.-C., on ne date que l'année entière.

## 4. Guide Excel, feuille par feuille

### 4.1 Règles générales

- Les **cellules jaunes à texte bleu** sont celles à remplir. Les cellules vertes sont des résultats. Les autres sont des formules, qui se recalculent seules.
- Les cellules jaunes ont des **validations** : si vous saisissez une valeur hors des limites, un message apparaît. Les dates valides vont de 1900 à 2200 (exception : la feuille « Ere », qui accepte aussi des années éloignées).
- Tous les instants saisis sont en **UTC**. Pour l'heure locale, on emploie la longitude et le mode « Fus » (Fuseau) ou « Solar » (Solaire) de « Timp complet ».
- Le fichier n'a pas de macros. Si les valeurs semblent périmées, appuyez sur Ctrl+Alt+F9 (recalcul complet).
- Les paramètres de base (époque interne, règle bissextile, longueur du mois, cycle de précession, ancrage des ères, etc.) sont dans la feuille « Timp complet », lignes 45–67. Les feuilles de calendrier et la feuille « Ere » les y prennent.
- Ordre des feuilles : Timp 36h, Conversie, Calendar 13 luni, Calendar an, Calendar perete, Timp complet, Ere, Fusuri noi, Luni noi, Evenimente, Nume sanscrită, Nume EN-FR, Cadrane. En français : Temps 36 h, Conversion, Calendrier 13 mois, Calendrier de l'année, Calendrier mural, Temps complet, Ères, Fuseaux nouveaux, Lunes nouvelles, Événements, Noms sanskrits, Noms EN-FR, Cadrans.

### 4.2 La feuille « Timp 36h » (Temps 36 h)

Le tableau des 3 600 secondes nouvelles du jour. Les colonnes sont l'heure (0–35), la minute (0–9), la seconde (0–9), l'angle de rotation (°) et l'équivalent en temps standard (hh:mm:ss, de 24 en 24 secondes). Les règles sont écrites dans la colonne G. La feuille n'a pas de cellules à remplir ; elle sert seulement de référence.

### 4.3 La feuille « Conversie » (Conversion)

Elle convertit l'heure du jour dans les deux sens, avec sous-seconde.

- **Section 1 (24 h → 36 h).** Saisissez l'heure, les minutes et les secondes standard en B6:D6 (exemple 15:30:45). Le résultat est en B9:F9 : l'heure (0–35), la minute, la seconde, la sous-seconde (0–23) et l'angle. Exemple : 23 h 2 min 6 s 21 sous-secondes, 232,6875°.
- **Section 2 (36 h → 24 h).** Saisissez l'heure, la minute, la seconde et la sous-seconde nouvelles en B14:E14 (exemple 20 h 7 min 5 s 12 sous-secondes). Le résultat est en B17:E17, y compris la forme hh:mm:ss (13:50:12).
- **Le tableau « Unités du système ».** B21 (24 sous-secondes par seconde) et B22 (0,1° par seconde) sont des hypothèses modifiables ; le reste du tableau se calcule. Plus bas, un tableau de points de repère (heure standard → heure nouvelle).
- Les valeurs sont entières : secondes et sous-secondes se saisissent en nombres entiers.

### 4.4 La feuille « Calendar 13 luni » (Calendrier 13 mois)

Le calendrier de 13 mois, aligné sur le solstice, en trois sections.

- **Section 1 (grégorien → 13 mois).** Saisissez la date en B6. La feuille montre la nouvelle année k, le début de l'année, le jour de l'année N, si l'année est bissextile, **l'ère (ER), l'année de l'ère (AE) et le nom de l'ère**, le mois, le jour, le jour de la semaine, la semaine, le type de jour (ordinaire, Jour de l'année ou Jour bissextile), les noms sanskrits, l'arc solaire et le cadran solaire.
- **Section 2 (13 mois → grégorien).** Saisissez l'année grégorienne (qui identifie la nouvelle année), le mois, le jour et, au besoin, « Jour spécial » dans la liste (Non, Jour de l'année, Jour bissextile) en B22:E22. Le résultat est la date grégorienne en B29, avec le jour grégorien et le jour nouveau de la semaine. Pour « Jour bissextile » dans une année non bissextile, le message « An nebisect » (année non bissextile) apparaît.
- **Section 3 (les 13 mois de l'année).** Saisissez l'année grégorienne en B33. Le tableau montre le premier et le dernier jour grégorien de chaque mois (lignes 41–53), puis le Jour de l'année et le Jour bissextile ; B39 montre l'ère et l'année de l'ère (ER-AE). B33 alimente aussi la feuille « Calendar an ».

### 4.5 La feuille « Calendar an » (Calendrier de l'année)

Le tableau jour par jour de la nouvelle année choisie (l'année vient de « Calendar 13 luni », B33). Les colonnes : date grégorienne, jour de l'année, mois, jour du mois, jour de la semaine (nouveau et grégorien), arc solaire, cadran solaire et phénomène astronomique du jour, avec son heure UTC. Le premier jour de chaque mois est coloré en bleu et les jours spéciaux en orange. La feuille n'a pas de cellules à remplir.

### 4.6 La feuille « Calendar perete » (Calendrier mural)

Le générateur de calendrier mural, de 15 pages A4 à l'italienne : 13 mois, une page pour les jours hors semaine et une pour les phénomènes de l'année.

- **Ce que vous remplissez.** L'année grégorienne en B2 et, en G3, le type de noms de jours : « Tradiționale » (Traditionnels) ou « Numerice » (Numériques).
- **Ce que montre chaque page de mois.** Un titre avec le nom du mois en roumain, en sanskrit (IAST et devanagari), en anglais et en français ; ER, AE et le nom de l'ère ; l'intervalle grégorien du mois ; l'en-tête des jours en quatre langues et la grille de 4 semaines. Dans chaque jour, le grand chiffre est le jour du calendrier de 13 mois ; dessous, en petit, la date grégorienne et les symboles des phénomènes.
- **Symboles.** ● nouvelle lune, ◐ premier quartier, ○ pleine lune, ◑ dernier quartier, ☀ solstice ou équinoxe, ⊗ éclipse possible. Les phénomènes sont en UTC. Le premier jour de chaque mois grégorien est en rouge.
- **Impression.** Fichier → Imprimer. La zone d'impression, le format A4 à l'italienne et les sauts de page sont déjà réglés. Pour une autre année, changez B2. La zone de commande (lignes 1–4) n'est pas imprimée.

### 4.7 La feuille « Timp complet » (Temps complet)

La conversion entre l'UTC et le code complet, avec fuseaux.

- **Section 1 (UTC → code).** Saisissez la date en B6, l'heure, la minute et la seconde UTC en C6:E6, la longitude en B8 et le mode en C8 (Fuseau ou Solaire ; dans la feuille, « Fus » ou « Solar »). Les résultats sont sur trois lignes : les champs solaires (ligne 19 : ER, AE, CS, AS, ZA et le nom de l'ère), le mois et le jour (ligne 21 : CL, LC, ZN et le nom du jour) et le temps nouveau (ligne 23 : HN, MN, SN, SS). Le code complet apparaît en B24.
- **Section 2 (code → UTC).** Saisissez ER, AE, LC, ZN et le cycle (0 = actuel) en B29:F29, puis HN, MN, SN, SS, la longitude et le mode en B31:G31. Le résultat est l'instant UTC (B41:E41). En F41 apparaît « OK » ou une explication (par exemple « An nebisect : il n'y a pas de Jour bissextile »).
- **Les paramètres** sont aux lignes 45–67. Ceux des ères sont B50 (le cycle de précession, 25 772), B51 (le nombre d'ères, 12) et B52 (l'ancrage : l'année-étiquette d'AE 1 d'ER 1, 2441). Ne les modifiez que pour tester d'autres règles.
- **La feuille ne calcule pas les angles solaire et lunaire** pour un instant quelconque. Le cadran solaire (CS) et le jour lunaire (CL) s'obtiennent à partir des tables d'événements. Les angles exacts sont en Python (section 5).

### 4.8 La feuille « Fusuri noi » (Fuseaux nouveaux)

Le tableau des 37 valeurs de fuseau (−18 … +18) : la longitude centrale, les limites de la bande, le décalage en heures nouvelles et l'équivalent en heures standard. Dans les colonnes H–K, un tableau de localités ; vous pouvez modifier les longitudes (cellules jaunes) pour voir le fuseau et l'écart par rapport à l'heure solaire.

### 4.9 Les feuilles « Luni noi » (Lunes nouvelles) et « Evenimente » (Événements)

- « Luni noi » liste les nouvelles lunes astronomiques 1899–2201 (UTC), avec une précision d'environ une minute. Elles servent au jour lunaire CL.
- « Evenimente » liste tous les phénomènes astronomiques 1899–2201 : solstices, équinoxes, quartiers de la Lune et éclipses possibles. Les colonnes F–G sont les instants solaires, avec le cadran qui commence à chacun. On en calcule CS et les symboles du calendrier mural.
- Ces feuilles ne se modifient pas à la main. Pour un autre intervalle, les données peuvent être calculées avec les fonctions de `sistem_timp.py` (section 8).

### 4.10 Les feuilles « Nume sanscrită » (Noms sanskrits) et « Nume EN-FR » (Noms EN-FR)

Tableaux de noms employés par les feuilles de calendrier. « Nume sanscrită » contient les numéraux 1–13, les noms des mois, les jours de la semaine (traditionnels et numériques) et les jours spéciaux, en IAST et en devanagari. « Nume EN-FR » contient les mois (First month / Premier mois …), les jours (Monday / lundi et la variante numérique Day 1 / Jour 1) et les jours spéciaux (Year Day / Jour de l'année, Leap Day / Jour bissextile). Les noms des ères sont dans la feuille « Ere ». Pour d'autres noms ou une autre langue, remplacez les textes des tableaux : les formules des feuilles de calendrier les reprennent automatiquement.

### 4.11 La feuille « Cadrane » (Cadrans)

Elle contient les quatre images de cadrans (année, ères, heure de 18 h et heure de 36 h), générées avec `creare_cadrane.py` pour un instant donné (2 octobre 2026, 12:00 UTC, Bucarest). Pour un autre instant, lancez le script avec d'autres valeurs (section 5.5).

### 4.12 La feuille « Ere » (Ères)

Les ères précessionnelles et la datation historique.

- **Le tableau des 12 ères** (lignes 5–16) : les noms en sanskrit, anglais et français, la longueur, la position dans le cycle, les années de début et de fin du cycle actuel (en numérotation historique) et les quatre cadrans de 6 443 ans (lignes 20–23).
- **Datation historique : année → ER, AE.** Saisissez l'année et l'époque (« e.n. » = apr. J.-C. ou « î.e.n. » = av. J.-C.) en B28:C28. Le résultat (B33:D33) est l'ère, l'année de l'ère et le nom de l'ère. Exemple : 785 av. J.-C. donne ER 11, AE 1072 (Meṣa · Aries · Bélier).
- **Datation historique : ER, AE → année.** Saisissez ER, AE et le cycle (0 = cycle actuel, −1 = le précédent, +1 = le suivant) en B38:D38. Le résultat est l'année, en B39 (année astronomique) et B40 (texte apr./av. J.-C.) ; B41 vérifie si AE entre dans l'ère choisie.
- Les paramètres (cycle, nombre d'ères, ancrage) sont dans « Timp complet », lignes 50–52.

## 5. Guide Python

### 5.1 Installation et prérequis

- Python 3.9 ou plus récent (testé avec 3.12).
- `sistem_timp.py`, `calendar_13_luni.py` et `conversie_timp.py` n'emploient que la bibliothèque standard. Rien n'est à installer.
- `creare_cadrane.py` a besoin de `matplotlib`, `numpy` et `openpyxl` (`pip install matplotlib numpy openpyxl`) et du fichier `sistem_timp.py` dans le même dossier.
- Les tests complets de `sistem_timp.py` comparent les résultats à un programme d'astronomie indépendant, s'il est installé : `pip install ephem`. Sans lui, ce test est ignoré.
- Sous Windows, employez `py` à la place de `python`, si nécessaire. Mettez les scripts dans le même dossier.

### 5.2 `sistem_timp.py`

Conversion exacte entre l'UTC et le code complet, ères et datation historique, plus les positions du Soleil et de la Lune. Les commandes sont :

```
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 F      # UTC -> code (longitude 26,1°, mode Fuseau)
python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 L      # même instant, temps solaire local
python sistem_timp.py t2g "12-1734-4-57.3-19-11-03 26:02:06:21 F+03"   # code -> UTC
python sistem_timp.py acum [longitude] [F|L]              # l'instant actuel ("acum" = maintenant)
python sistem_timp.py unghiuri 2026-09-29T15:30:45 26.1 F # rotation quotidienne, angle solaire et lunaire
python sistem_timp.py evenimente 2026                     # les phénomènes de l'année
python sistem_timp.py luni-noi 2026                       # les nouvelles lunes de l'année (UTC)
python sistem_timp.py istoric 785BCE                      # année historique -> ER, AE (aussi : 2026, -784, "785 î.e.n.")
python sistem_timp.py istoric-inv 11 1072 [cycle]         # ER, AE -> année historique
python sistem_timp.py ere                                 # les 12 ères : noms, longueurs, années
python sistem_timp.py ayanamsa [année]                    # l'angle de précession par rapport à Spica
python sistem_timp.py fusuri                              # le tableau des 36 fuseaux
python sistem_timp.py test                                # les vérifications complètes
```

La longitude est en degrés (positive à l'est). Le mode `F` est le fuseau nouveau (« fus »), et `L` le temps solaire local. Exemples de sorties :

```
$ python sistem_timp.py g2t 2026-09-29T15:30:45 26.1 F
2026-09-29 15:30:45 UTC  =  12-1734-4-57.3-19-11-03 26:02:06:21 F+03
ER 12 (Mīna · Pisces · Poissons), AE 1734; ziua 283 din an; cadranul 4, arcul 57; Miercuri (Budhavāra · Wednesday · mercredi); luna calendaristică 11; luna: ziua 19 (gibbă descrescătoare); unghi solar 276.5°, unghi lunar 218.1°

$ python sistem_timp.py unghiuri 2026-09-29T15:30:45 26.1 F
2026-09-29 15:30:45 UTC  (fus +3)
rotația zilnică :  262,69° =  291,88 gon = 4,5848 rad
unghi solar     :  276,51° =  307,23 gon = 4,8260 rad   (cadranul 4)
unghi lunar     :  218,11° =  242,34 gon = 3,8067 rad   (gibbă descrescătoare)

$ python sistem_timp.py evenimente 2026
2026-01-03 10:03 UTC ☾ lună plină
2026-01-10 15:49 UTC ☾ ultimul pătrar
2026-01-18 19:52 UTC ☾ lună nouă
...
```

(Le script affiche en roumain : « ziua 283 din an » = jour 283 de l'année, « cadranul 4, arcul 57 » = cadran 4, arc 57, « Miercuri » = mercredi, « luna calendaristică » = mois calendaire, « luna: ziua 19 (gibbă descrescătoare) » = jour lunaire 19 (gibbeuse décroissante), « unghi solar/lunar » = angle solaire/lunaire, « rotația zilnică » = rotation quotidienne, « lună plină/nouă » = pleine/nouvelle lune, « ultimul pătrar » = dernier quartier.)

Si le code donné à `t2g` contient des valeurs incohérentes (par exemple un CS ou un CL qui ne correspond pas à la date), un **avertissement** s'affiche. Les valeurs qui ne peuvent pas exister, comme l'heure 25, un AE trop grand pour l'ère indiquée ou le Jour bissextile dans une année non bissextile, donnent un message d'erreur. Les commandes `g2t` et `t2g` acceptent les années 1 à 9999 apr. J.-C. (pour les années av. J.-C., on emploie `istoric`).

### 5.3 `calendar_13_luni.py`

Conversion grégorien ↔ calendrier de 13 mois, aligné sur le solstice, avec des noms en roumain, sanskrit, anglais et français.

```
python calendar_13_luni.py g2n 2026-09-29        # grégorien -> 13 mois
python calendar_13_luni.py n2g 2026 11 3         # (année grégorienne, mois, jour) -> date grégorienne
python calendar_13_luni.py n2g AN16 ziua-bisecta # on peut donner directement l'année nouvelle : AN<k> ; ou ziua-anului / ziua-bisecta
python calendar_13_luni.py an 2026               # les 13 mois de l'année nouvelle, avec les dates grégoriennes
python calendar_13_luni.py test                  # vérification de tous les jours 1900-2200
```

(`ziua-anului` est le Jour de l'année et `ziua-bisecta` le Jour bissextile.)

```
$ python calendar_13_luni.py g2n 2026-09-29
2026-09-29  =  ER 12 (Mīna · Pisces · Poissons), AE 1734 (anul nou k = 15): luna 11 (Ekādaśa māsa · Eleventh month · Onzième mois), ziua 3, Miercuri (Budhavāra · Wednesday · mercredi), săptămâna 41; arcul solar 57.3, cadranul 4
```

Dans ce script, le cadran solaire (CS) est calculé d'après la règle des arcs ; la valeur exacte, d'après la position du Soleil, est donnée par `sistem_timp.py` et les feuilles Excel. Pour les jours proches des solstices et des équinoxes, les deux peuvent différer de 2 à 3 jours.

### 5.4 `conversie_timp.py`

Conversion simple de l'heure du jour, avec sous-seconde.

```
python conversie_timp.py 24 15:30:45     # 24 h -> 36 h :  23 h  2 min  6 s  21 sous-secondes  (232,6875°)
python conversie_timp.py 36 23:02:06:21    # 36 h -> 24 h :  15:30:45   (la quatrième valeur, la sous-seconde, est facultative)
python conversie_timp.py test            # vérifie les 86 400 secondes
```

### 5.5 `creare_cadrane.py`

Dessine quatre cadrans pour un instant donné (par défaut maintenant, UTC) : **le cadran de l'année**, **le cadran des ères**, le cadran de l'heure de 18 h et le cadran de l'heure de 36 h. Les cadrans d'heure montrent aussi la date du jour ; celui de l'année montre les arcs solaires, les mois, les phases de la Lune et les cadrans solaires, avec l'aiguille sur la date du jour ; celui des ères montre le cercle de la précession, avec les 12 ères, l'échelle agrandie de l'ère actuelle et l'aiguille sur l'année en cours.

```
python creare_cadrane.py                                        # quatre PNG dans le dossier courant, pour l'instant actuel
python creare_cadrane.py --moment 2026-10-02T12:00:00           # autre instant (UTC)
python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1 --mod F   # avec longitude et mode (F = Fuseau, L = Solaire)
python creare_cadrane.py --out cadrane                          # les enregistre dans un dossier
python creare_cadrane.py --xlsx timp_36_ore_rotatie.xlsx        # les insère aussi dans la feuille « Cadrane »
```

Les fichiers créés sont `cadran_an.png`, `cadran_ere.png`, `cadran_18h_jumatate_zi.png` et `cadran_36h_zi_intreaga.png`. Après l'insertion dans Excel, les formules du fichier doivent être recalculées (ouvrez le fichier dans Excel et enregistrez-le, ou appuyez sur Ctrl+Alt+F9). Les images sont statiques : elles n'indiquent l'heure actuelle qu'au moment où le script est lancé.

### 5.6 Utilisation comme bibliothèque

Les fonctions peuvent être importées dans vos propres programmes :

```python
from datetime import datetime
import sistem_timp as st
import calendar_13_luni as c13
import conversie_timp as ct

# UTC -> code complet
r = st.din_utc(datetime(2026, 9, 29, 15, 30, 45), lon=26.1, mod="F")
print(st.cod(r))                     # 12-1734-4-57.3-19-11-03 26:02:06:21 F+03
print(r["er"], r["ae"], r["lc"], r["zn"], r["cl"], r["faza"])   # 12 1734 11 3 19 gibbă descrescătoare
print(r["unghi_solar"], r["unghi_lunar"])

# code complet -> UTC (et la liste des avertissements de cohérence)
dt, avert = st.din_cod("12-1734-4-57.3-19-11-03 26:02:06:21 F+03")
print(dt, avert)                     # 2026-09-29 15:30:45 []

# ère et année de l'ère pour n'importe quelle année (1 av. J.-C. = 0, 785 av. J.-C. = -784)
print(st.era_din_an(-784))                   # (11, 1072)
print(st.nume_an(st.an_din_era(11, 1072)))   # 785 î.e.n.
print(st.parse_an_istoric("785 î.e.n."))     # -784

# positions et événements
print(st.fmt_unghi(st.unghi_solar(dt)))      # degrés, gon, radians
print(st.evenimente(2026)[:2])               # les premiers événements de l'année
print(st.eveniment_solar(2026, 3))           # le solstice de décembre 2026 (UTC)

# calendrier et heure du jour
print(c13.an_pentru_an_gregorian(2026))      # 15
print(c13.in_gregorian(15, 11, 3))           # 2026-09-29
print(ct.la_36(15, 30, 45), ct.la_24(23, 2, 6, 21))
```

Le dictionnaire renvoyé par `din_utc` contient, entre autres, les clés `k`, `n` (jour de l'année), `er`, `ae`, `cs`, `arc`, `za`, `lc`, `zn`, `hn`, `mn`, `sn`, `ss`, `cl`, `fus` (fuseau), `faza` (phase), `unghi_solar`, `unghi_lunar` et `zi_sapt` (jour de la semaine). Les fonctions `in_utc` et `din_cod` ont un paramètre `ciclu` (cycle) (0 = cycle de précession actuel).

## 6. Exemples détaillés

**Exemple 1 : l'heure de midi.** Le milieu du jour est 18:00:00:00, soit 12:00 en temps standard. En UTC, c'est 12:00 UTC ; dans le fuseau +3 (l'heure du fuseau est UTC+2), cela fait 12:00 à l'heure du fuseau, soit 10:00 UTC.

**Exemple 2 : quelle date est le 29 septembre 2026 ?** Dans « Calendar 13 luni » (B6) on obtient : nouvelle année k = 15, ER 12 (Mīna · Pisces · Poissons), AE 1734, jour 283, mois 11, jour 3, mercredi (Budhavāra · Wednesday · mercredi). La même date est un mardi dans le calendrier grégorien : les deux semaines sont donc décalées d'un jour.

**Exemple 3 : un calendrier pour 2027, avec le Jour bissextile.** Dans « Calendar perete », mettez 2027 en B2. La nouvelle année 16 compte 366 jours (16 est multiple de 4). La page « Jours hors semaine » montre le Jour de l'année (20.12.2027) et le Jour bissextile (21.12.2027).

**Exemple 4 : lire le code.** `12-1734-4-57.3-19-11-03 26:02:06:21 F+03` se lit : ère 12 (Poissons), année 1734 de l'ère ; le Soleil est dans le cadran 4 (après l'équinoxe de septembre), dans l'arc 57, jour 3 ; la Lune est au jour lunaire 19, gibbeuse décroissante ; c'est le mois 11, jour 3 ; heure nouvelle 26 h 2 min 6 s 21 sous-secondes à l'heure du fuseau +3. En temps standard, l'heure du fuseau est 17:30:45, soit 15:30:45 UTC.

**Exemple 5 : la même heure, deux modes de fuseau.** À la longitude 26,1° E, le mode « Fuseau » donne l'heure 26:02:06:21, et le mode « Solaire » donne 25:08:07:21, car le temps solaire local est l'UTC plus 26,1 minutes nouvelles. La différence de 3,9 minutes nouvelles (15,6 minutes standard) est l'écart du lieu par rapport au centre du fuseau (26,1° contre 30°).

**Exemple 6 : une heure et 24 secondes.** 1 h 0 min 1 s nouvelles = 2 400 + 24 = 2 424 s standard = 00:40:24.

**Exemple 7 : datation historique.** L'année 785 av. J.-C. est ER 11 (Meṣa · Aries · Bélier), AE 1072. Dans l'autre sens, ER 11 et AE 1072 donnent 785 av. J.-C. Dans Excel : feuille « Ere », B28:C28. En Python : `python sistem_timp.py istoric 785BCE`.

**Exemple 8 : l'ère actuelle.** L'année 2026 est ER 12 (Poissons), AE 1734 ; l'ère des Poissons a commencé en l'an 293 apr. J.-C. et se termine avec l'an 2440. ER 1 (Verseau) commence avec la nouvelle année qui débute le 21.12.2440. En Python : `python sistem_timp.py ere`.

**Exemple 9 : les cadrans pour un jour.** `python creare_cadrane.py --moment 2026-10-02T12:00:00 --lon 26.1` dessine les cadrans de l'année, des ères et de l'heure pour le 2 octobre 2026, 12:00 UTC, avec le fuseau +3 (heure nouvelle 21:00:00:00).

## 7. Vérifications, exactitude et limites

### 7.1 Ce qui a été vérifié

- **Conversions.** Les 86 400 secondes du jour se convertissent et reviennent exactement (24 h ↔ 36 h). Les 109 938 jours de 1900–2200 se convertissent exactement entre le grégorien et le calendrier de 13 mois, dans les deux sens, et chaque mois commence un lundi et finit un dimanche. `calendar_13_luni.py` et `sistem_timp.py` donnent les mêmes résultats sur tous ces jours.
- **Début de l'année.** Le jour 1 de chaque année tombe le jour UTC du solstice de décembre pour les 21 années vérifiées (2011–2031), y compris 2020, comparé à la bibliothèque d'astronomie ephem.
- **Positions et phénomènes, comparés à un programme d'astronomie indépendant (`ephem`).** La position du Soleil diffère d'au plus 0,015°, la longitude de la Lune d'au plus 0,015° et la latitude d'au plus 0,007°. Les solstices et équinoxes diffèrent d'au plus 54 secondes. Les quartiers de la Lune de 2026 diffèrent d'au plus 66 secondes, et les nouvelles lunes de 2000–2050 d'au plus 32 secondes. Les éclipses de 2024–2026 sont exactement les éclipses réelles (6 de Soleil, 5 de Lune par l'ombre).
- **Les ères.** Les 12 ères ont des longueurs de 2147/2148, les quatre cadrans ont exactement 6 443 ans, l'ancrage calculé à partir de Spica donne l'ayanāṁśa 30° vers l'an 2440, et les conversions année ↔ (ER, AE) reviennent exactement sur tout le cycle actuel. L'écart du modèle par rapport à la précession réelle (IAU 2006) est inférieur à 0,5° (environ 35 ans) sur les 4 000 dernières années.
- **Excel et Python.** Les feuilles « Calendar 13 luni », « Calendar an », « Calendar perete », « Timp complet », « Ere » et « Evenimente » ont été comparées aux scripts sur plusieurs scénarios (années 2026, 2027, 1905, années bissextiles et non bissextiles, modes de fuseau, années av. et apr. J.-C.), sans aucune différence.

### 7.2 Limites et hypothèses

- **La précision des phases de la Lune** est d'environ une minute. Un instant situé à une minute de minuit local peut recevoir un autre jour lunaire que dans la réalité.
- **Les éclipses sont « possibles »** : la marque repose sur la position de la Lune par rapport au nœud et n'indique pas la visibilité. Les éclipses de Lune par la seule pénombre ne sont pas marquées.
- **Les secondes intercalaires sont ignorées**, en Python comme dans Excel.
- **Δt (la différence entre le temps terrestre et l'UTC)** est approché par des formules ; des erreurs de quelques secondes n'affectent pas les résultats quotidiens.
- **L'intervalle** 1900–2200 est celui validé pour les jours exacts. Les scripts acceptent les jours exacts pour les années 1–9999 apr. J.-C. ; pour les années av. J.-C., on ne date que l'année (ER, AE).
- **Excel ne calcule pas les angles solaire et lunaire** pour un instant quelconque ; pour eux, on emploie Python.
- **Les ères sont un modèle.** Elles ont des longueurs égales (2147 ou 2148 ans), alors que la précession réelle a changé au cours du temps : le modèle diffère de la position réelle du point vernal d'environ 8 ans à l'an 1 apr. J.-C., 17 ans à 785 av. J.-C. et 31 ans à 1800 av. J.-C. Le repère stellaire (Spica) a une incertitude de quelques années. Une partie des « dates » des ères sont donc des conventions : le choix de l'étoile de référence et de l'année-étiquette 2441.
- **Un code ER-AE n'est unique que dans un cycle de précession** (25 772 ans) ; le paramètre « cycle » choisit le cycle.
- **Les jours de la semaine** du calendrier nouveau ne coïncident pas avec les jours grégoriens. Les jours hors semaine (Jour de l'année et Jour bissextile) interrompent la continuité de la semaine de 7 jours, comme dans d'autres calendriers fixes.
- **Les noms sanskrits** proviennent des connaissances de l'auteur et n'ont pas été vérifiés dans une source externe ; les noms des jours spéciaux (Varṣa-dina, Adhika-dina) sont des propositions. Les noms anglais et français sont des traductions directes.
- **Les calendriers des versions antérieures** étaient alignés sur le 1er janvier, et le code avait les champs MC, VA et AN. Les feuilles et scripts actuels sont alignés sur le solstice et emploient ER et AE ; les résultats diffèrent des anciens.

### 7.3 Variantes de précession envisagées

La précession réelle s'accélère légèrement ; les limites réelles des ères (l'instant où l'ayanāṁśa par rapport à Spica atteint 30°·j, d'après la précession IAU 2006) ne sont donc pas à distances égales. Les ères réelles durent aujourd'hui environ 2154 ans (ER 12) et 2133 (ER 1), et davantage dans le passé : 2174 il y a environ 4 000 ans et 2240 vers l'an 8500 av. J.-C. Par rapport aux ères égales du modèle, la différence au début d'une ère est :

| Début d'ère | Année réelle | Écart du modèle |
|---|---|---|
| ER 1 (ancrage) | 2441 apr. J.-C. | 0,5 an |
| ER 12 (Poissons) | 287 apr. J.-C. | 6,5 ans |
| ER 11 | 1888 av. J.-C. | 33 ans |
| ER 10 | 4083 av. J.-C. | 81 ans |
| ER 9 | 6301 av. J.-C. | 152 ans |

Trois variantes ont été évaluées :

- **A. Limites réelles, calculées d'après la précession.** La plus exacte (moins de 1 à 2 ans dans l'histoire écrite), mais les ères ont des longueurs différentes, les quatre cadrans n'ont plus exactement 6 443 ans, les formules d'Excel, de Python et de la page web deviennent des tables de limites, et le cycle n'est plus périodique (le polynôme de la précession n'est pas fiable au-delà de quelques milliers d'années).
- **B. Ères égales avec un cycle ajusté.** Avec un cycle d'environ 25 760 ans, l'erreur reste autour de ±180 ans sur un très large intervalle, sans la ramener sous quelques années sur tout le cycle.
- **C. Ères égales, le modèle actuel.** Simple, avec les mêmes formules et cadrans. À l'échelle de l'histoire, la différence est de l'ordre de quelques dizaines d'années.

**Décision : la variante C**, par souci de simplicité. Les variantes A et B restent documentées ici et pourront être adoptées plus tard sans changer la structure du code ER-AE, seulement la table des limites.

## 8. Dépannage et questions fréquentes

**Les valeurs semblent périmées ou manquent.** Appuyez sur Ctrl+Alt+F9 dans Excel. Dans LibreOffice, employez Données → Calculer → Tout recalculer.

**L'écriture devanagari ou les symboles ◐ ◑ ⊗ ☀ ne s'affichent pas.** Ils dépendent des polices du système (par exemple Nirmala UI ou Noto Sans Devanagari pour le devanagari, Segoe UI Symbol pour les symboles). Installez une police qui les contient ou changez la police des cellules. Les translittérations latines s'affichent de toute façon.

**Le message « An nebisect » (année non bissextile).** Vous avez demandé le Jour bissextile dans une année nouvelle sans 366 jours. Les années bissextiles sont celles où k est multiple de 4 et non de 128 (par exemple k = 16, soit l'année grégorienne 2027).

**Le message de validation sur une cellule jaune.** La valeur est hors des limites (par exemple l'heure 24, le mois 14, un AE supérieur à 2148 ou une année hors de l'intervalle 1900–2200). Corrigez la valeur.

**Comment choisir l'année dans les feuilles de calendrier ?** Donnez l'année grégorienne qui contient le 1er juillet de la nouvelle année voulue. Pour l'année qui commence en décembre 2026, saisissez 2027.

**Comment trouver ER et AE pour une année av. J.-C. ?** Dans Excel : feuille « Ere », B28 (l'année) et C28 (« î.e.n. », av. J.-C.). En Python : `python sistem_timp.py istoric 785BCE`.

**Comment choisir un autre ancrage pour les ères ?** Dans Excel : « Timp complet », cellule B52 (l'année-étiquette d'AE 1 d'ER 1, 2441 par défaut). En Python : la constante `ANCORA_ET` de `sistem_timp.py` (et `K_ANCORA` de `calendar_13_luni.py`). Les feuilles « Ere », « Timp complet », « Calendar 13 luni » et « Calendar perete » se mettent à jour seules ; les cadrans se redessinent avec `creare_cadrane.py`.

**Comment changer l'époque interne, la règle bissextile ou la longueur du mois ?** Dans la feuille « Timp complet », lignes 45–67. Le script Python emploie ses propres constantes : modifiez-les aussi (au début des fichiers `sistem_timp.py` et `calendar_13_luni.py`). Les tableaux « Luni noi » et « Evenimente » ne dépendent pas de l'époque.

**Comment calculer les tableaux d'événements pour un autre intervalle ?** Avec les fonctions `evenimente_brute(an)` et `luna_noua(k)` de `sistem_timp.py`, vous pouvez calculer la liste pour n'importe quelle année et la coller dans les feuilles « Evenimente » et « Luni noi » (l'instant comme numéro de série Excel, le symbole, la description et le code). Le script qui a construit les feuilles n'est pas livré séparément.

**Comment imprimer le calendrier mural ?** Fichier → Imprimer, papier A4 à l'italienne. La zone d'impression est déjà définie. Pour exporter en PDF, choisissez « Enregistrer au format PDF » dans la fenêtre d'impression.

**La commande `python` n'est pas reconnue (Windows).** Employez `py sistem_timp.py ...`. Si Python n'est pas installé, téléchargez-le sur python.org (version 3.9 ou plus récente).

**Comment faire marcher l'horloge en temps réel ?** La commande `acum` affiche l'instant actuel une seule fois, et `creare_cadrane.py` dessine les cadrans pour l'instant où il est lancé. Un cadran animé nécessiterait une page web ou une application distincte.

## 9. Annexes

### 9.1 Glossaire

| Terme | Sens |
|---|---|
| UTC | Temps universel coordonné, dans lequel sont donnés tous les instants saisis |
| Seconde SI | La seconde définie par les horloges atomiques ; une sous-seconde est exactement une seconde SI |
| ER, AE | L'ère précessionnelle (1–12) et l'année de l'ère (1–2148, sans année zéro) |
| Précession | La lente rotation de l'axe de la Terre ; un cycle d'environ 25 772 ans |
| Ayanāṁśa | La longitude écliptique de Spica moins 180° ; l'angle de précession par rapport aux étoiles |
| k | Le numéro de la nouvelle année, compteur interne (k = 1 commence le 22.12.2011) |
| N | Le jour de la nouvelle année (1–365 ou 366) |
| CS | Le cadran solaire 1–4, d'après la position réelle du Soleil |
| AS, ZA | L'arc solaire de 5 jours (01–73) et le jour dans l'arc |
| CL | Le jour lunaire (01–30) |
| LC, ZN | Le mois calendaire (00–13) et le jour du mois (01–28) |
| HN, MN, SN, SS | L'heure nouvelle, la minute nouvelle, la seconde nouvelle, la sous-seconde |
| Angle solaire | La position du Soleil à partir du solstice de décembre (0° au solstice) |
| Angle lunaire | L'élongation de la Lune par rapport au Soleil (0° nouvelle lune, 180° pleine lune) |
| Gon | Grade : 1/400 de cercle, 0,9° |
| Jour de l'année, Jour bissextile | Les jours 365 et 366 de la nouvelle année, hors semaine |

### 9.2 La tradition derrière les unités

Le système reprend, à des échelles différentes, des unités qui ont déjà existé dans l'histoire :

- **L'uš babylonien (le degré de temps).** Le jour babylonien comptait 360 uš, de 4 minutes chacun. La minute nouvelle du système est un uš.
- **Les décans égyptiens.** L'écliptique était divisée en 36 décans de 10° chacun. Les 36 heures nouvelles de 10° sont les décans. Les 5 jours épagomènes du calendrier égyptien jouent le rôle du Jour de l'année et du Jour bissextile.
- **Le pala indien.** Une ghaṭī dure environ 24 minutes et compte 60 pala ; un pala dure environ 24 secondes, soit 0,1° de rotation. La seconde nouvelle est un pala.
- **Les périodes solaires chinoises (jiéqì).** L'année est divisée en 24 périodes de 15° de longitude solaire, chacune avec trois pentades de 5 jours (72 par an). Les arcs solaires du système sont des pentades, et l'angle solaire est leur idée de base.
- **Autres unités d'angle.** Le degré sexagésimal (Mésopotamie), le grade ou gon français (400 par cercle), le mil militaire (1/6400 de cercle) et le radian (2π par cercle, nom moderne du XIXe siècle). L'astronome indien Āryabhaṭa a employé le rayon 3438, c'est-à-dire un radian exprimé en minutes d'arc.

### 9.3 Les noms des mois (sanskrit, anglais, français)

| Mois | Sanskrit (IAST) | Anglais | Français |
|---|---|---|---|
| 1 | Prathama māsa | First month | Premier mois |
| 2 | Dvitīya māsa | Second month | Deuxième mois |
| 3 | Tṛtīya māsa | Third month | Troisième mois |
| 4 | Caturtha māsa | Fourth month | Quatrième mois |
| 5 | Pañcama māsa | Fifth month | Cinquième mois |
| 6 | Ṣaṣṭha māsa | Sixth month | Sixième mois |
| 7 | Saptama māsa | Seventh month | Septième mois |
| 8 | Aṣṭama māsa | Eighth month | Huitième mois |
| 9 | Navama māsa | Ninth month | Neuvième mois |
| 10 | Daśama māsa | Tenth month | Dixième mois |
| 11 | Ekādaśa māsa | Eleventh month | Onzième mois |
| 12 | Dvādaśa māsa | Twelfth month | Douzième mois |
| 13 | Trayodaśa māsa | Thirteenth month | Treizième mois |

### 9.4 Les noms des jours de la semaine

| Jour | Sanskrit traditionnel | Sanskrit numérique | Anglais | Français |
|---|---|---|---|---|
| Lundi | Somavāra | Prathama-dina | Monday | lundi |
| Mardi | Maṅgalavāra | Dvitīya-dina | Tuesday | mardi |
| Mercredi | Budhavāra | Tṛtīya-dina | Wednesday | mercredi |
| Jeudi | Guruvāra | Caturtha-dina | Thursday | jeudi |
| Vendredi | Śukravāra | Pañcama-dina | Friday | vendredi |
| Samedi | Śanivāra | Ṣaṣṭha-dina | Saturday | samedi |
| Dimanche | Ravivāra | Saptama-dina | Sunday | dimanche |

Jours spéciaux : le Jour de l'année est Varṣa-dina · Year Day · Jour de l'année ; le Jour bissextile est Adhika-dina · Leap Day · Jour bissextile (les noms sanskrits sont des propositions). Dans la feuille « Calendar perete », la variante numérique emploie Day 1 … Day 7 / Jour 1 … Jour 7.
