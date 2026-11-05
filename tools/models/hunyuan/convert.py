# Baja los GLB de Hunyuan3D (40 000 caras y textura 2048) a modelos livianos para el juego:
# reduce las caras y pasa el color de la textura a color por vértice (el juego usa raw19).
# Uso: python convert.py <carpeta con .glb> <carpeta de salida> [caras]
import bpy,bmesh,sys,os
import numpy as np
src,out=sys.argv[1],sys.argv[2];target=int(sys.argv[3]) if len(sys.argv)>3 else 4000
os.makedirs(out,exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.endswith('.glb'):continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(src,f))
    ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
    bpy.context.view_layer.objects.active=ob
    me=ob.data
    img=bpy.data.images[0];W,H=img.size;px=np.array(img.pixels[:],dtype=np.float32).reshape(H,W,4)
    # soldar y reducir
    m=ob.modifiers.new('d','DECIMATE');m.ratio=min(1,target/len(me.polygons));m.use_collapse_triangulate=True
    bpy.ops.object.modifier_apply(modifier=m.name)
    me=ob.data;uv=me.uv_layers.active.data
    col=me.color_attributes.new('Col','BYTE_COLOR','CORNER')
    for li,l in enumerate(me.loops):
        u,v=uv[li].uv;x=min(W-1,max(0,int(u*(W-1))));y=min(H-1,max(0,int(v*(H-1))))
        # promedio 3x3 para no tomar un píxel suelto
        y0,y1,x0,x1=max(0,y-1),min(H,y+2),max(0,x-1),min(W,x+2)
        c=px[y0:y1,x0:x1,:3].reshape(-1,3).mean(0)
        col.data[li].color=(float(c[0]),float(c[1]),float(c[2]),1.0)
    for mat in list(me.materials):me.materials.pop(index=0)
    bpy.ops.export_scene.gltf(filepath=os.path.join(out,f),export_format='GLB',export_apply=True,export_animations=False,export_skins=False,export_image_format='NONE',export_materials='NONE',export_attributes=True)
    print(f,len(me.polygons),'caras',os.path.getsize(os.path.join(out,f))//1024,'KB')
