# Adapta los modelos animados CC0 de Quaternius al formato que usa el juego (game/js/v15glb.js):
# frente en +z, pies en y=0, tamaño del modelo viejo, animaciones idle/walk/run/attack/die,
# materiales skin/cloth/pants (humanos) o hide (dinosaurios) y huesos head/chest.
# Uso: python convert.py <carpeta_salida>   (requiere: pip install bpy)
import bpy,sys,os,math
from mathutils import Vector
D=os.path.dirname(os.path.abspath(__file__));SRC=os.path.join(D,'src');OUT=sys.argv[-1]

# clave del juego: (archivo, medida, valor, eje de la medida, renombres de acciones, renombres de materiales, huesos, escala xy extra)
ONLY=os.environ.get('ONLY');JOBS={
 'zombie':('Zombie.blend','h',1.58,{'ZombieIdle':'idle','ZombieWalk':'walk','ZombieRun':'run','ZombieAttack':'attack'},{},{'Head':'head','Spine2':'chest'},1),
 'hinchado':('Zombie.blend','h',1.58,{'ZombieIdle':'idle','ZombieWalk':'walk','ZombieRun':'run','ZombieAttack':'attack'},{},{'Head':'head','Spine2':'chest'},1.32),
 'human':('Male_Casual.blend','h',1.83,{'Man_Idle':'idle','Man_Walk':'walk','Man_Run':'run','Man_Punch':'attack','Man_Death':'die'},{'Shirt':'cloth','Skin':'skin','Pants':'pants'},{'Head':'head','Torso':'chest'},1),
 'raptor':('dinosaurs_pack_Velociraptor.glb','l',2.78,None,None,{'Head':'head'},1),
 'rex':('dinosaurs_pack_Trex.glb','l',3.14,None,None,{'Head':'head'},1),
 'cornudo':('dinosaurs_pack_Triceratops.glb','l',4.93,None,None,{'Head':'head'},1),
 'acorazado':('dinosaurs_pack_Stegosaurus.glb','l',4.5,None,None,{'Head':'head'},1),
}

def fcurves(act):
    if hasattr(act,'fcurves'):return act.fcurves
    out=[]
    for L in act.layers:
        for st in L.strips:
            for cb in st.channelbags:out.extend(cb.fcurves)
    return out
def channelbag(act):
    for L in act.layers:
        for st in L.strips:
            for cb in st.channelbags:return cb
    return None

def world_bbox(objs):
    dg=bpy.context.evaluated_depsgraph_get();mn=Vector((1e9,)*3);mx=Vector((-1e9,)*3)
    for o in objs:
        oe=o.evaluated_get(dg)
        for c in oe.bound_box:
            w=oe.matrix_world@Vector(c);mn=Vector(map(min,mn,w));mx=Vector(map(max,mx,w))
    return mn,mx

for key,(f,meas,val,amap,mmap,bmap,wide) in JOBS.items():
    if ONLY and key not in ONLY.split(','):continue
    p=os.path.join(SRC,f)
    if f.endswith('.blend'):bpy.ops.wm.open_mainfile(filepath=p)
    else:bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=p,guess_original_bind_pose=False)
    arm=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.parent==arm]
    # el armazón cuelga de un nodo raíz con giro/escala: se suelta conservando la posición en el mundo
    bpy.context.view_layer.update();mw=arm.matrix_world.copy();arm.parent=None;arm.matrix_world=mw
    for o in list(bpy.context.scene.objects):
        if o!=arm and o not in meshes:bpy.data.objects.remove(o)
    bpy.context.view_layer.update()
    # acciones
    keep={}
    for a in list(bpy.data.actions):
        n=a.name.split('|')[-1]
        if amap is None:
            low=n.lower();t=None
            for k,v in (('idle','idle'),('walk','walk'),('run','run'),('attack','attack'),('death','die')):
                if low.endswith('_'+k):t=v
            if t and t not in keep:keep[t]=a
        elif n in amap:keep[amap[n]]=a
    for a in list(bpy.data.actions):
        if a not in keep.values():bpy.data.actions.remove(a)
    for t,a in keep.items():a.name=t
    if 'die' not in keep and 'idle' in keep:
        # el zombi no trae animación de muerte: se arma una con la pose de reposo y la cadera cayendo hacia atrás
        d=keep['idle'].copy();d.name='die';hb=[b for b in arm.data.bones if b.parent is None][0].name
        cb=channelbag(d)
        for fc in list(fcurves(d)):
            if fc.data_path==f'pose.bones["{hb}"].rotation_quaternion' or fc.data_path==f'pose.bones["{hb}"].location':
                (cb.fcurves if cb else d.fcurves).remove(fc);continue
            v=fc.evaluate(0);fc.keyframe_points.clear();fc.keyframe_points.insert(0,v);fc.keyframe_points.insert(30,v)
        coll=cb.fcurves if cb else d.fcurves
        ang=math.radians(-88);q=(math.cos(ang/2),math.sin(ang/2),0,0)
        if arm.pose.bones[hb].rotation_mode!='QUATERNION':
            for fc in list(fcurves(d)):
                if fc.data_path==f'pose.bones["{hb}"].rotation_euler':coll_=cb.fcurves if cb else d.fcurves;coll_.remove(fc)
            arm.pose.bones[hb].rotation_mode='QUATERNION'
        for i in range(4):
            fc=coll.new(f'pose.bones["{hb}"].rotation_quaternion',index=i,group_name=hb) if not cb else coll.new(f'pose.bones["{hb}"].rotation_quaternion',index=i)
            fc.keyframe_points.insert(0,(1,0,0,0)[i]);fc.keyframe_points.insert(10,(math.cos(ang/4),math.sin(ang/4),0,0)[i]);fc.keyframe_points.insert(22,q[i]);fc.keyframe_points.insert(30,q[i])
        hl=arm.data.bones[hb].head_local.length*.68
        for i in range(3):
            fc=coll.new(f'pose.bones["{hb}"].location',index=i) if cb else coll.new(f'pose.bones["{hb}"].location',index=i,group_name=hb)
            tgt=(0,-hl,0)[i];fc.keyframe_points.insert(0,0);fc.keyframe_points.insert(22,tgt);fc.keyframe_points.insert(30,tgt)
        keep['die']=d
    # la orientación y el tamaño se miden con la pose de reposo animada (algunos modelos tienen otra pose de enlace)
    if not arm.animation_data:arm.animation_data_create()
    arm.animation_data.action=keep.get('idle')
    try:
        if keep.get('idle') and keep['idle'].slots:arm.animation_data.action_slot=keep['idle'].slots[0]
    except Exception:pass
    bpy.context.scene.frame_set(0)
    # materiales: el exportador no entiende 'Diffuse BSDF'; se reemplaza por Principled con la misma textura
    for m in bpy.data.materials:
        if not m.node_tree:continue
        nt=m.node_tree;dif=[n for n in nt.nodes if n.type=='BSDF_DIFFUSE'];tex=[n for n in nt.nodes if n.type=='TEX_IMAGE'];outn=[n for n in nt.nodes if n.type=='OUTPUT_MATERIAL']
        if dif and outn:
            pb=nt.nodes.new('ShaderNodeBsdfPrincipled');pb.inputs['Roughness'].default_value=.9;pb.inputs['Metallic'].default_value=0
            if tex:
                if tex[0].image and not tex[0].image.has_data:tex[0].image.filepath=os.path.join(SRC,os.path.basename(tex[0].image.filepath));tex[0].image.reload()
                tex[0].interpolation='Closest';nt.links.new(tex[0].outputs['Color'],pb.inputs['Base Color'])
            nt.links.new(pb.outputs['BSDF'],outn[0].inputs['Surface'])
        for n in nt.nodes:
            if n.type=='BSDF_PRINCIPLED':n.inputs['Metallic'].default_value=0
    # materiales
    if mmap:
        for m in bpy.data.materials:
            if m.name in mmap:m.name=mmap[m.name]
    elif amap is None:
        # dinosaurio: el material que cubre más superficie pasa a llamarse 'hide'
        area={}
        for o in meshes:
            for poly in o.data.polygons:
                if o.material_slots:mt=o.material_slots[poly.material_index].material;area[mt]=area.get(mt,0)+poly.area
        if area:max(area,key=area.get).name='hide'
    # huesos
    for b in arm.data.bones:
        if b.name in bmap:b.name=bmap[b.name]
    # los dinosaurios tienen que quedar acostados a lo largo de -Y de Blender (= +z del juego), cabeza adelante
    if amap is None:
        arm.rotation_mode='XYZ';bpy.context.view_layer.update();mn,mx=world_bbox(meshes);sz=mx-mn
        if sz.z>sz.y*1.2:arm.rotation_euler.x+=math.radians(-90);bpy.context.view_layer.update()
        hb_=arm.data.bones.get('head')
        if hb_ is not None:
            hw=arm.matrix_world@hb_.head_local;mn,mx=world_bbox(meshes)
            if hw.y>(mn.y+mx.y)/2:arm.rotation_euler.z+=math.pi;bpy.context.view_layer.update()
    # tamaño y apoyo en el piso (sin aplicar transformaciones, para no romper las animaciones)
    bpy.context.view_layer.update()
    mn,mx=world_bbox(meshes);size=(mx-mn)
    cur=size.z if meas=='h' else size.y
    k=val/cur;arm.scale=arm.scale*k
    if wide!=1:arm.scale.x*=wide;arm.scale.y*=wide
    bpy.context.view_layer.update();mn,mx=world_bbox(meshes)
    arm.location.z-=mn.z;arm.location.x-=(mn.x+mx.x)/2;arm.location.y-=(mn.y+mx.y)/2
    arm.animation_data.action=None
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,key+'.glb'),export_format='GLB',export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_optimize_animation_size=True)
    mn,mx=world_bbox(meshes);hb_=arm.data.bones.get('head');print('BB',key,tuple(round(x,2) for x in mn),tuple(round(x,2) for x in mx),hb_ and tuple(round(x,2) for x in arm.matrix_world@hb_.head_local))
    print('OK',key,sorted(keep),[m.name for m in bpy.data.materials])
