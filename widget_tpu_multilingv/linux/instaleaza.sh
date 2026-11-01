#!/bin/sh
# Pornire automata a ceasului TPU la autentificare (Linux). Folosire: sh instaleaza.sh [longitudine] [ro|en|fr]
LON="${1:-26.1}"; LANGX="${2:-ro}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$HOME/.config/autostart"
sed -e "s|^Exec=.*|Exec=python3 $DIR/python/ceas_tpu.py $LON $LANGX|" "$DIR/linux/ceas-tpu.desktop" > "$HOME/.config/autostart/ceas-tpu.desktop"
echo "Gata. Ceasul porneste la urmatoarea autentificare. Pentru pornire acum: python3 $DIR/python/ceas_tpu.py $LON $LANGX"
