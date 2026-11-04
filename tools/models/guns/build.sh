#!/bin/sh
# Regenera game/js/glb25.js: armas largas (Quaternius "Animated FPS Guns" y "Gun Pack Vol.1", CC0)
# y el antebrazo con mano sacado del humano de Quaternius (tools/models/mobs/src/Male_Casual.blend).
# Requiere: pip install bpy
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(mktemp -d)
python "$D/convert.py" "$D/src" "$OUT"
python "$D/arms.py" 70 "$D/../mobs/src/Male_Casual.blend" "$OUT/Arm.glb"
python3 - "$OUT" "$D/../../../game/js/glb25.js" <<'P'
import base64,sys,json,os
o,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(o,f),'rb').read()).decode() for f in sorted(os.listdir(o)) if f.endswith('.glb')}
open(out,'w').write('/* armas largas y brazos CC0 de Quaternius, ver tools/models/guns */\nconst GLB25='+json.dumps(d)+';\n')
P
