# Rearma game/js/glb32.js:
#  - vuelve a codificar todos los modelos sin UV y con color en bytes (pesa ~40% menos, mismo aspecto)
#  - reemplaza los que tienen versión de Tripo y suma los nuevos (ver REPLACE y NEW)
# Uso: python build.py <carpeta con los .glb livianos de convert.py> [extents]
import sys,os,json,base64,io,re
import numpy as np,trimesh
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..')
JS=os.path.join(ROOT,'game','js','glb32.js')
# clave del juego <- nombre del modelo de Tripo
REPLACE={'pickup_oxidada':'pickup_oxidada','sedan_abandonado':'sedan_abandonado','colectivo_viejo':'colectivo_viejo','casa_chapa':'casa_chapa',
  'torre_vigia':'torre_vigia','empalizada':'empalizada','porton_madera':'porton_madera','pozo_bomba':'pozo_bomba',
  'cama_hierro':'cama_hierro','sofa_roto':'sofa_roto','mesa_sillas':'mesa_sillas','estanteria_madera':'estanteria_madera','archivo_metalico':'archivo_metalico',
  'heladera_oxidada':'heladera_oxidada','mostrador_caja':'mostrador_caja','banco_herramientas':'banco_herramientas','surtidor_nafta':'surtidor_amarillo',
  'tanque_gasolina':'bidon_rojo','escopeta_doble':'escopeta_doble','rifle_caza':'rifle_caza','machete':'machete'}
NEW=['casa_dos_plantas','contenedor_maritimo','antena','garrafa_gas','lapida','altar','fogon','barricada_tablas','caja_fuerte','cartel_poste','pistola','mochila','cajon_verduras']

def load_b64(s):return trimesh.load(io.BytesIO(base64.b64decode(s)),file_type='glb',force='mesh',process=False)
def load_f(p):return trimesh.load(p,force='mesh',process=False)
def horiz(m):e=m.extents;return 'x' if e[0]>=e[2] else 'z'
def enc(m):
    c=m.visual.vertex_colors if m.visual.kind=='vertex' else None
    if c is None:
        try:c=m.visual.to_color().vertex_colors
        except Exception:c=np.full((len(m.vertices),4),160,np.uint8)
    m2=trimesh.Trimesh(np.asarray(m.vertices,np.float32),m.faces,vertex_normals=m.vertex_normals,vertex_colors=np.asarray(c,np.uint8),process=False)
    return base64.b64encode(m2.export(file_type='glb',include_normals=True)).decode()

def main():
    lite=sys.argv[1]
    src=open(JS,encoding='utf8').read();d=json.loads(src[src.index('{'):src.rindex('}')+1])
    out={}
    for k,v in d.items():
        old=load_b64(v)
        if k in REPLACE:
            m=load_f(os.path.join(lite,REPLACE[k]+'.glb'))
            # si el lado largo cae en otro eje que el modelo viejo, se gira 90° para que el código que lo ubica siga valiendo
            if horiz(m)!=horiz(old):m.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2,[0,1,0]))
            out[k]=enc(m);print('tripo',k,np.round(old.extents,2),'->',np.round(m.extents,2))
        else:out[k]=enc(old)
    for k in NEW:out[k]=enc(load_f(os.path.join(lite,k+'.glb')));print('nuevo',k)
    head=src[:src.index('const GLB32')]
    open(JS,'w',encoding='utf8').write(head.replace('Hunyuan3D-2 (IA)','Hunyuan3D-2 y Tripo (IA)')+'const GLB32='+json.dumps(dict(sorted(out.items())))+';\n')
    print(os.path.getsize(JS)//1024,'KB')
main()
