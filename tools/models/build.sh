#!/bin/sh
# Desde la 0.19 los zombis, el humano y los dinosaurios son modelos CC0 de Quaternius: ver tools/models/mobs.
# (gen_creatures.py queda como referencia de los modelos hechos a mano de la 0.15/0.16.)
exec "$(cd "$(dirname "$0")" && pwd)/mobs/build.sh"
