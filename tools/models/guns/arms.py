# Saca antebrazo y mano del humano CC0 de Quaternius (Male_Casual) para los brazos en primera persona.
# Uso: python arms.py <Male_Casual.blend> <out.glb>
import bpy,sys,bmesh,math
src,out=sys.argv[-2],sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=src)
arm=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
body=[o for o in bpy.context.scene.objects if o.type=='MESH'][0]
SIDE='R'
KEEP={'LowerArm.'+SIDE:'sleeve','Palm.'+SIDE:'glove','MiddleHand.'+SIDE:'glove','Fingers.'+SIDE:'glove','Thumb.'+SIDE:'glove','ThumbEnd.'+SIDE:'glove','Thumb1.'+SIDE:'glove','Thumb2.'+SIDE:'glove'}
# mano cerrada (agarre)
bpy.context.view_layer.objects.active=arm;bpy.ops.object.mode_set(mode='POSE')
for b in arm.pose.bones:
    b.rotation_mode='XYZ'
    if b.name in('Fingers.'+SIDE,'MiddleHand.'+SIDE):b.rotation_euler=(math.radians(float(sys.argv[-3]) if len(sys.argv)>4 else 70),0,0)
bpy.ops.object.mode_set(mode='OBJECT')
# aplicar la pose al mesh
bpy.context.view_layer.objects.active=body
for md in body.modifiers:
    if md.type=='ARMATURE':bpy.ops.object.modifier_apply(modifier=md.name)
me=body.data;gi={g.index:g.name for g in body.vertex_groups}
bm=bmesh.new();bm.from_mesh(me);dl=bm.verts.layers.deform.active
kill=[];tag={}
for v in bm.verts:
    w=v[dl];best=max(w.items(),key=lambda t:t[1]) if w else None
    n=gi.get(best[0]) if best else None
    if n not in KEEP:kill.append(v)
    else:tag[v.index]=KEEP[n]
bmesh.ops.delete(bm,geom=kill,context='VERTS')
bm.to_mesh(me);bm.free()
for v in me.vertices:pass
me.materials.clear()
mats={}
for k,c in (('glove',(.06,.05,.035)),('sleeve',(.045,.05,.03))):
    m=bpy.data.materials.new(k);m.use_nodes=True;m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1);me.materials.append(m);mats[k]=len(me.materials)-1
# material por cara: la mayoría de sus vértices
gi={g.index:g.name for g in body.vertex_groups}
for p in me.polygons:
    votes={}
    for vi in p.vertices:
        v=me.vertices[vi];best=max(v.groups,key=lambda g:g.weight) if len(v.groups) else None
        k=KEEP.get(gi.get(best.group) if best else '', 'glove');votes[k]=votes.get(k,0)+1
    p.material_index=mats[max(votes,key=votes.get)]
for o in list(bpy.context.scene.objects):
    if o!=body:bpy.data.objects.remove(o)
body.vertex_groups.clear()
print('ARM',len(me.vertices),tuple(round(v,3) for v in body.dimensions))
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',export_apply=True,export_animations=False,export_skins=False)
