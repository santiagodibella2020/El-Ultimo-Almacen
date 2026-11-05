#!/bin/sh
# Regenera game/js/glb26.js: el perro (Husky, Quaternius "Ultimate Animated Animals", CC0) y las etapas
# de crecimiento de la huerta (Quaternius "Crops Pack", CC0). Los .glb vienen de
# github.com/trebeljahr/quaternius-showcase (public/glb/animals_pack y public/glb/crops_pack) y se usan tal cual.
set -e
D=$(cd "$(dirname "$0")" && pwd)
python3 - "$D/src" "$D/../../../game/js/glb26.js" <<'P'
import base64,sys,json,os
s,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(s,f),'rb').read()).decode() for f in sorted(os.listdir(s)) if f.endswith('.glb')}
open(out,'w').write('/* perro y cultivos CC0 de Quaternius, ver tools/models/life */\nconst GLB26='+json.dumps(d)+';\n')
P
