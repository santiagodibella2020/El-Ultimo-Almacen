#!/bin/sh
# Regenera game/js/glb29.js: los modelos de las mochilas que se ven de fondo en el inventario (Quaternius, CC0).
set -e
D=$(cd "$(dirname "$0")" && pwd)
python3 - "$D/src" "$D/../../../game/js/glb29.js" <<'P'
import base64,sys,json,os
s,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(s,f),'rb').read()).decode() for f in sorted(os.listdir(s)) if f.endswith('.glb')}
open(out,'w').write('/* mochilas CC0 de Quaternius, ver tools/models/bags */\nconst GLB29='+json.dumps(d)+';\n')
P
