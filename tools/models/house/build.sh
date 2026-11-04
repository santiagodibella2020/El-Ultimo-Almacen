#!/bin/sh
# Regenera game/js/glb18.js (muebles y aberturas de las casas, Quaternius CC0).
set -e
D=$(cd "$(dirname "$0")" && pwd)
python3 - "$D/src" "$D/../../../game/js/glb18.js" <<'P'
import base64,sys,os
s,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(s,f),'rb').read()).decode() for f in sorted(os.listdir(s)) if f.endswith('.glb')}
open(out,'w').write('/* muebles CC0 de Quaternius (Ultimate House Interior Pack), ver tools/models/house */\nconst GLB18='+repr(d).replace("'",'"')+';\n')
P
