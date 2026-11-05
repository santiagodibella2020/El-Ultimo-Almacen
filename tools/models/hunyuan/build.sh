#!/bin/sh
# Regenera game/js/glb32.js: modelos de Hunyuan3D (generados con IA, ver README) aligerados.
# Requiere: pip install bpy numpy
set -e
D=$(cd "$(dirname "$0")" && pwd)
OUT=$(mktemp -d)
${PY:-python} "$D/convert.py" "$D/src" "$OUT" "${1:-4000}"
python3 - "$OUT" "$D/../../../game/js/glb32.js" <<'P'
import base64,sys,json,os
o,out=sys.argv[1],sys.argv[2]
d={f[:-4]:base64.b64encode(open(os.path.join(o,f),'rb').read()).decode() for f in sorted(os.listdir(o)) if f.endswith('.glb')}
open(out,'w').write('/* props generados con Hunyuan3D-2 (IA) en la PC de santiago, ver tools/models/hunyuan */\nconst GLB32='+json.dumps(d)+';\n')
P
