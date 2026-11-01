@echo off
rem Longitudine/latitudine: schimba valorile de mai jos (est = +, nord = +). Limba: ro, en sau fr.
set LIMBA=ro
set LON=26.1
set LAT=44.4
start "" msedge --app="file:///%~dp0pamant_%LIMBA%.html?lon=%LON%&lat=%LAT%" --window-size=440,470
