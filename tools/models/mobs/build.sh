#!/bin/sh
# Regenera game/js/glb15.js (zombis, humano y dinosaurios, Quaternius CC0). Requiere: pip install bpy
set -e
D=$(cd "$(dirname "$0")" && pwd)
# Zombie.blend pesa ~19 MB y no se guarda en el repo: se baja del espejo de los modelos de Quaternius.
[ -f "$D/src/Zombie.blend" ] || curl -sSL -o "$D/src/Zombie.blend" "https://raw.githubusercontent.com/beep2bleep/FreeAssetsByKenneyNLandQuaternius/HEAD/FreeModels%20by%20Quaternius%5BPatreon%5D/Characters%20and%20Animals/Zombie%20Animated%20-%20Jan%202018/Blends/Zombie.blend"
OUT=$(mktemp -d)
python "$D/convert.py" "$OUT"
python3 - "$OUT" "$D/../../../game/js/glb15.js" <<'P'
import base64,sys,json
o,out=sys.argv[1],sys.argv[2];ks=['zombie','raptor','hinchado','human','rex','cornudo','acorazado']
d={k:base64.b64encode(open(f'{o}/{k}.glb','rb').read()).decode() for k in ks}
open(out,'w').write('/* modelos CC0 de Quaternius adaptados por tools/models/mobs/convert.py (Blender) */\nconst GLB15='+json.dumps(d)+';\n')
P
