#!/bin/sh
# Regenera game/js/glb15.js a partir del script de Blender. Requiere: pip install bpy
set -e
D=$(cd "$(dirname "$0")" && pwd);T=$(mktemp -d)
python "$D/gen_creatures.py" "$T"
python3 - "$T" "$D/../../game/js/glb15.js" <<'P'
import base64,sys
t,out=sys.argv[1],sys.argv[2]
d={k:base64.b64encode(open(f'{t}/{k}.glb','rb').read()).decode() for k in ['zombie','raptor']}
open(out,'w').write('/* modelos generados por tools/models/gen_creatures.py (Blender) */\nconst GLB15='+repr(d).replace("'",'"')+';\n')
P
