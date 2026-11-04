# Convierte armas largas CC0 de Quaternius (.blend) a .glb con un material por color.
# Uso: python convert.py <src> <out>   (requiere: pip install bpy)
import bpy,sys,os,bmesh
from mathutils import Vector
src,out=sys.argv[-2],sys.argv[-1]
NAMED={'LightWood':(.62,.42,.24),'DarkWood':(.36,.22,.12),'Black':(.10,.10,.10),'Metal':(.42,.44,.46),'Barrels':(.22,.23,.24),'Barrel':(.22,.23,.24),
 'BulletYellow':(.78,.62,.25),'BulletOrange':(.78,.45,.2),'Trigger':(.16,.16,.16),'Green':(.27,.33,.22),'Magazine':(.17,.17,.17)}
def lin(c):return tuple((x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4) for x in c)
def node_color(m):
    if m and m.node_tree:
        for n in m.node_tree.nodes:
            if n.type in('BSDF_DIFFUSE','BSDF_PRINCIPLED'):
                c=n.inputs['Color'].default_value;return (c[0],c[1],c[2])
    return (.5,.5,.5)
def tex_of(m):
    if m and m.node_tree:
        for n in m.node_tree.nodes:
            if n.type=='TEX_IMAGE' and n.image and n.image.size[0]>0:return n.image
    return None
# Ajustes de color para que combinen con el juego (gastados, sin colores de fantasía).
def remap(f,c):
    r,g,b=c[:3];l=.2126*r+.7152*g+.0722*b
    if f.startswith('AK47'):
        if r>.4 and g>.25 and b<.15:return lin((.48,.29,.15))   # madera
        return (l*.55,l*.55,l*.57)
    if f.startswith('P90'):return (l*.95,l*1.05,l*.8)            # verde oliva oscuro
    return c
for f in sorted(os.listdir(src)):
    if not f.endswith('.blend'):continue
    bpy.ops.wm.open_mainfile(filepath=os.path.join(src,f))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    for o in list(bpy.context.scene.objects):
        if o.type!='MESH':bpy.data.objects.remove(o)
    pal={}
    for o in meshes:
        mw=o.matrix_world.copy();o.parent=None;o.matrix_world=mw
        for md in list(o.modifiers):o.modifiers.remove(md)
        me=o.data;cols=[]
        colattr=me.attributes.get('Col') or me.attributes.get('Color')
        if colattr and all(min(d.color[:3])>.99 for d in colattr.data):colattr=None
        uv=me.uv_layers.active
        for p in me.polygons:
            m=me.materials[p.material_index] if me.materials else None
            img=tex_of(m);c=None
            if img and uv:
                u=sum(uv.data[i].uv.x for i in p.loop_indices)/p.loop_total;v=sum(uv.data[i].uv.y for i in p.loop_indices)/p.loop_total
                w,h=img.size;x=min(w-1,max(0,int((u%1)*w)));y=min(h-1,max(0,int((v%1)*h)));px=img.pixels[(y*w+x)*4:(y*w+x)*4+3];c=tuple(px)
            elif colattr:
                acc=[0,0,0]
                for i in p.loop_indices:
                    v_=colattr.data[i if colattr.domain=='CORNER' else me.loops[i].vertex_index].color
                    for k in range(3):acc[k]+=v_[k]
                c=tuple(a/p.loop_total for a in acc)
            elif m and m.name.split('.')[0] in NAMED:c=lin(NAMED[m.name.split('.')[0]])
            else:c=node_color(m)
            c=remap(f,c);cols.append(tuple(round(x*20)/20 for x in c))
        me.materials.clear()
        for p,c in zip(me.polygons,cols):
            if c not in pal:
                mat=bpy.data.materials.new('c%d'%len(pal));mat.use_nodes=True
                b=mat.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(c[0],c[1],c[2],1);pal[c]=mat
            mat=pal[c]
            if mat.name not in me.materials:me.materials.append(mat)
            p.material_index=list(me.materials).index(mat)
    print('GUN',f,len(pal),[tuple(round(v,2) for v in o.dimensions) for o in meshes])
    bpy.ops.export_scene.gltf(filepath=os.path.join(out,f[:-6]+'.glb'),export_format='GLB',export_apply=True,export_animations=False,export_skins=False)
