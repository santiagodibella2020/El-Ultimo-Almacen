#!/bin/sh
# Regenera game/js/glb20.js (armas y decoración, Quaternius CC0).
set -e
D=$(cd "$(dirname "$0")" && pwd)
python3 - "$D/src" "$D/../../../game/js/glb20.js" <<'P'
import base64,sys,os,json
s,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(s,f),'rb').read()).decode() for f in sorted(os.listdir(s)) if f.endswith('.glb')}
open(out,'w').write('/* armas y decoración CC0 de Quaternius (Survival Pack y Street Pack), ver tools/models/props */\nconst GLB20='+json.dumps(d)+';\n')
P
