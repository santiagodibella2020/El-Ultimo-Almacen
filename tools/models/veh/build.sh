#!/bin/sh
# Regenera game/js/glb17.js (vehículos). Requiere: pip install bpy
set -e
D=$(cd "$(dirname "$0")" && pwd);T=$(mktemp -d)
python "$D/convert.py" "$T"
python3 - "$T" "$D/../../../game/js/glb17.js" <<'P'
import base64,sys,os
t,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(t,f),'rb').read()).decode() for f in sorted(os.listdir(t)) if f.endswith('.glb')}
open(out,'w').write('/* vehículos CC0 (Kenney Car Kit y Quaternius), ver tools/models/veh */\nconst GLB17='+repr(d).replace("'",'"')+';\n')
P
