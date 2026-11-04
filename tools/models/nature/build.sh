#!/bin/sh
# Regenera game/js/glb19.js (árboles, rocas y plantas, Quaternius CC0).
set -e
D=$(cd "$(dirname "$0")" && pwd)
python3 - "$D/src" "$D/../../../game/js/glb19.js" <<'P'
import base64,sys,os
s,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(s,f),'rb').read()).decode() for f in sorted(os.listdir(s)) if f.endswith('.glb')}
open(out,'w').write('/* árboles, rocas y plantas CC0 de Quaternius (Ultimate Nature Pack), ver tools/models/nature */\nconst GLB19='+repr(d).replace("'",'"')+';\n')
P
