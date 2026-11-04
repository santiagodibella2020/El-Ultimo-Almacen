# Genera los modelos con esqueleto y animaciones (zombi y raptor) con Blender en modo Python (pip install bpy).
# Uso: python gen_creatures.py <carpeta_salida>
import bpy, bmesh, sys, math, random, os
from mathutils import Vector
OUT=sys.argv[-1] if len(sys.argv)>1 else '.'
R=math.radians

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def skin_mesh(name,verts,edges,radii,root=0,subdiv=2):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,edges,[]);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
    bpy.context.view_layer.objects.active=ob;ob.select_set(True)
    sk=ob.modifiers.new('skin','SKIN');sk.use_smooth_shade=True
    for i,(rx,ry) in enumerate(radii):
        sv=me.skin_vertices[0].data[i];sv.radius=(rx,ry);sv.use_root=(i==root)
    ss=ob.modifiers.new('sub','SUBSURF');ss.levels=subdiv;ss.render_levels=subdiv
    bpy.ops.object.modifier_apply(modifier='skin');bpy.ops.object.modifier_apply(modifier='sub')
    bpy.ops.object.shade_smooth()
    return ob

def make_arm(name,bones):
    ad=bpy.data.armatures.new(name);ao=bpy.data.objects.new(name,ad);bpy.context.collection.objects.link(ao)
    bpy.context.view_layer.objects.active=ao;bpy.ops.object.mode_set(mode='EDIT')
    eb={}
    for bn,h,t,par in bones:
        b=ad.edit_bones.new(bn);b.head=Vector(h);b.tail=Vector(t);b.roll=0
        if par:b.parent=eb[par];b.use_connect=False
        eb[bn]=b
    bpy.ops.object.mode_set(mode='OBJECT');return ao

def bind(mesh,arm):
    bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);arm.select_set(True)
    bpy.context.view_layer.objects.active=arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')

def colorize(ob,fn,mats):
    me=ob.data
    for m in mats:me.materials.append(m)
    ca=me.color_attributes.new('Col','BYTE_COLOR','CORNER')
    for poly in me.polygons:
        c=sum((me.vertices[v].co for v in poly.vertices),Vector())/len(poly.vertices)
        poly.material_index=fn(c,None)[0]
    for poly in me.polygons:
        for li in poly.loop_indices:
            co=me.vertices[me.loops[li].vertex_index].co
            col=fn(co,poly.material_index)[1]
            ca.data[li].color=(col[0],col[1],col[2],1)

def mat(name,rgb,rough=.85):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=(*rgb,1);b.inputs['Roughness'].default_value=rough
    # que el color de vértice multiplique el color base
    vc=m.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Col'
    mix=m.node_tree.nodes.new('ShaderNodeMix');mix.data_type='RGBA';mix.blend_type='MULTIPLY';mix.inputs['Factor'].default_value=1
    mix.inputs['A'].default_value=(*rgb,1)
    m.node_tree.links.new(vc.outputs['Color'],mix.inputs['B']);m.node_tree.links.new(mix.outputs['Result'],b.inputs['Base Color'])
    return m

def key(arm,action,frames,fps=24):
    """frames: list of (t_seconds, {bone:(rx,ry,rz) degrees, 'root_loc':(x,y,z)})"""
    act=bpy.data.actions.new(action);arm.animation_data_create();arm.animation_data.action=act
    for pb in arm.pose.bones:pb.rotation_mode='XYZ'
    for t,pose in frames:
        f=1+round(t*fps)
        for pb in arm.pose.bones:
            r=pose.get(pb.name,(0,0,0));pb.rotation_euler=(R(r[0]),R(r[1]),R(r[2]))
            pb.keyframe_insert('rotation_euler',frame=f)
            if pb.parent is None:
                pb.location=pose.get('root_loc',(0,0,0));pb.keyframe_insert('location',frame=f)
    act.use_fake_user=True
    tr=arm.animation_data.nla_tracks.new();tr.name=action;tr.strips.new(action,1,act);arm.animation_data.action=None
    return act

def export(path):
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_vertex_color='ACTIVE',export_all_vertex_colors=False,export_yup=True)

# ------------------------------------------------------------ ZOMBI
def zombie():
    reset();random.seed(7)
    P={'pelvis':(0,0,.95),'spine':(0,.01,1.18),'chest':(0,.02,1.4),'neck':(0,0,1.56),'head':(0,-.03,1.69),'top':(0,-.02,1.84)}
    for s,sx in (('L',1),('R',-1)):
        P['sh'+s]=(.19*sx,.02,1.44);P['el'+s]=(.27*sx,-.02,1.18);P['wr'+s]=(.3*sx,-.06,.95);P['ha'+s]=(.31*sx,-.08,.84)
        P['hip'+s]=(.1*sx,0,.9);P['kn'+s]=(.11*sx,-.03,.5);P['an'+s]=(.11*sx,.01,.09);P['to'+s]=(.11*sx,-.15,.03)
    names=list(P);idx={n:i for i,n in enumerate(names)}
    E=[('pelvis','spine'),('spine','chest'),('chest','neck'),('neck','head'),('head','top')]
    for s in 'LR':E+= [('chest','sh'+s),('sh'+s,'el'+s),('el'+s,'wr'+s),('wr'+s,'ha'+s),('pelvis','hip'+s),('hip'+s,'kn'+s),('kn'+s,'an'+s),('an'+s,'to'+s)]
    rad={'pelvis':(.15,.11),'spine':(.14,.1),'chest':(.17,.11),'neck':(.055,.055),'head':(.1,.11),'top':(.085,.09)}
    for s in 'LR':rad.update({'sh'+s:(.065,.065),'el'+s:(.045,.045),'wr'+s:(.036,.03),'ha'+s:(.03,.022),'hip'+s:(.085,.085),'kn'+s:(.06,.06),'an'+s:(.045,.045),'to'+s:(.04,.03)})
    ob=skin_mesh('Zombie',[P[n] for n in names],[(idx[a],idx[b]) for a,b in E],[rad[n] for n in names],root=idx['pelvis'])
    skin=mat('skin',(.55,.6,.45),.7);cloth=mat('cloth',(.42,.42,.4),.95);pants=mat('pants',(.3,.32,.36),.95)
    blood=[(Vector((random.uniform(-.15,.15),-.12,random.uniform(1.0,1.45))),random.uniform(.05,.11)) for _ in range(5)]
    def fn(c,mi):
        x,y,z=c
        armx=abs(x)>.2
        if z>1.53 or (armx and z<1.12):i=0
        elif z>.86:i=1
        else:i=2
        if z<.12:i=2
        k=.85+.15*random.random()
        col=[k,k,k]
        if i==0 and z>1.53:  # ojeras y boca
            if y<-.08 and 1.66<z<1.72 and abs(x)>.02:col=[.35,.3,.28]
            if y<-.08 and 1.6<z<1.63:col=[.35,.1,.08]
        for p,r in blood:
            if (Vector(c)-p).length<r:col=[.45,.12,.1]
        if i==1 and random.random()<.08:col=[.6,.55,.5]
        return i,col
    colorize(ob,fn,[skin,cloth,pants])
    B=[('root',P['pelvis'],P['spine'],None),('spine',P['spine'],P['chest'],'root'),('chest',P['chest'],P['neck'],'spine'),('neck',P['neck'],P['head'],'chest'),('head',P['head'],P['top'],'neck')]
    for s in 'LR':B+=[('uarm.'+s,P['sh'+s],P['el'+s],'chest'),('farm.'+s,P['el'+s],P['wr'+s],'uarm.'+s),('hand.'+s,P['wr'+s],P['ha'+s],'farm.'+s),
                      ('thigh.'+s,P['hip'+s],P['kn'+s],'root'),('shin.'+s,P['kn'+s],P['an'+s],'thigh.'+s),('foot.'+s,P['an'+s],P['to'+s],'shin.'+s)]
    arm=make_arm('ZombieRig',B);bind(ob,arm)
    # Ejes: los huesos de piernas/brazos apuntan hacia abajo: X local = eje lateral. +X rota la punta hacia atrás(+Y)... se ajusta con signos.
    A=lambda a:(a,0,0)
    def walk(t,amp,armup,lean,bob):
        s=math.sin(t*2*math.pi);c=math.cos(t*2*math.pi)
        return {'root_loc':(0,abs(s)*bob,0),'root':(lean*.4,0,s*6),'spine':(lean*.6,0,-s*4),'head':(-8,0,s*8),
                'thigh.L':A(-amp*s),'thigh.R':A(amp*s),'shin.L':A(max(0,amp*1.1*c)),'shin.R':A(max(0,-amp*1.1*c)),
                'uarm.L':(-armup+amp*.25*s,0,-6),'uarm.R':(-armup-amp*.25*s,0,6),'farm.L':A(-15),'farm.R':A(-20)}
    def loop(fn,dur,n=8):return [(dur*i/n,fn(i/n)) for i in range(n+1)]
    key(arm,'idle',loop(lambda t:{'spine':(8+3*math.sin(t*6.28),0,0),'head':(-5,4*math.sin(t*6.28),10*math.sin(t*6.28)),'uarm.L':(-20,0,-6),'uarm.R':(-30,0,6),'farm.L':A(-25),'farm.R':A(-30)},2.4))
    key(arm,'walk',loop(lambda t:walk(t,24,70,-18,.03),1.25))
    key(arm,'run',loop(lambda t:walk(t,42,85,-30,.07),.7))
    key(arm,'attack',[(0,walk(0,0,70,-15,0)),(.25,{'spine':(15,0,0),'chest':(10,0,0),'uarm.L':(-150,0,8),'uarm.R':(-150,0,-8),'farm.L':A(-30),'farm.R':A(-30)}),
                      (.45,{'spine':(-25,0,0),'chest':(-12,0,0),'head':(-15,0,0),'uarm.L':(-60,0,-5),'uarm.R':(-55,0,5),'farm.L':A(-5),'farm.R':A(-5)}),(.8,walk(0,0,70,-15,0))])
    key(arm,'die',[(0,{}),(.25,{'root_loc':(0,-.05,0),'root':(18,0,0),'head':(20,0,0),'uarm.L':(-40,0,-30),'uarm.R':(-50,0,30),'thigh.L':A(-20),'shin.L':A(40)}),
                   (.7,{'root_loc':(0,-.72,.3),'root':(-80,0,8),'head':(-10,0,20),'uarm.L':(-40,0,-45),'uarm.R':(-30,0,40),'thigh.L':A(-40),'shin.L':A(50),'thigh.R':A(-10),'shin.R':A(15)}),
                   (1.1,{'root_loc':(0,-.84,.38),'root':(-88,0,10),'head':(-5,0,30),'uarm.L':(-25,0,-50),'uarm.R':(-15,0,45),'thigh.L':A(-35),'shin.L':A(45),'thigh.R':A(-5),'shin.R':A(10)})])
    export(os.path.join(OUT,'zombie.glb'))

# ------------------------------------------------------------ RAPTOR
def raptor():
    reset();random.seed(11)
    P={'tail4':(0,1.65,.95),'tail3':(0,1.2,1.0),'tail2':(0,.8,1.04),'tail1':(0,.42,1.06),'hips':(0,.12,1.04),'chest':(0,-.32,1.12),'neck':(0,-.58,1.32),'head':(0,-.78,1.44),'snout':(0,-1.14,1.36)}
    for s,sx in (('L',1),('R',-1)):
        P['hip'+s]=(.15*sx,.08,.98);P['kn'+s]=(.18*sx,-.12,.64);P['an'+s]=(.17*sx,.2,.3);P['to'+s]=(.17*sx,-.12,.03)
        P['sh'+s]=(.13*sx,-.42,1.06);P['cl'+s]=(.16*sx,-.6,.9)
    names=list(P);idx={n:i for i,n in enumerate(names)}
    E=[('tail4','tail3'),('tail3','tail2'),('tail2','tail1'),('tail1','hips'),('hips','chest'),('chest','neck'),('neck','head'),('head','snout')]
    for s in 'LR':E+=[('hips','hip'+s),('hip'+s,'kn'+s),('kn'+s,'an'+s),('an'+s,'to'+s),('chest','sh'+s),('sh'+s,'cl'+s)]
    rad={'tail4':(.03,.03),'tail3':(.07,.07),'tail2':(.12,.12),'tail1':(.18,.18),'hips':(.22,.24),'chest':(.2,.23),'neck':(.09,.1),'head':(.11,.12),'snout':(.05,.055)}
    for s in 'LR':rad.update({'hip'+s:(.11,.13),'kn'+s:(.07,.07),'an'+s:(.045,.045),'to'+s:(.04,.025),'sh'+s:(.04,.04),'cl'+s:(.025,.02)})
    ob=skin_mesh('Raptor',[P[n] for n in names],[(idx[a],idx[b]) for a,b in E],[rad[n] for n in names],root=idx['hips'])
    hide=mat('hide',(.62,.55,.38),.75);claw=mat('claw',(.85,.82,.72),.5)
    def fn(c,mi):
        x,y,z=c
        i=1 if (z<.06 or (abs(x)>.13 and y<-.55 and z<.95)) else 0
        top=max(0,min(1,(z-1.0)/.3))
        k=.7+.45*(1-top)
        col=[k,k*.95,k*.85]
        if top>.4 and math.sin(y*22)>.55:col=[.35,.3,.22]
        if y<-.78 and z>1.47 and abs(x)>.04:col=[.15,.12,.05]  # ojos
        if y<-.9 and 1.31<z<1.35:col=[.3,.1,.08]
        return i,col
    colorize(ob,fn,[hide,claw])
    B=[('root',P['hips'],P['chest'],None),('neck',P['chest'],P['neck'],'root'),('head',P['neck'],P['head'],'neck'),('jaw',P['head'],P['snout'],'head'),
       ('tail1',P['hips'],P['tail1'],'root'),('tail2',P['tail1'],P['tail2'],'tail1'),('tail3',P['tail2'],P['tail3'],'tail2'),('tail4',P['tail3'],P['tail4'],'tail3')]
    for s in 'LR':B+=[('thigh.'+s,P['hip'+s],P['kn'+s],'root'),('shin.'+s,P['kn'+s],P['an'+s],'thigh.'+s),('foot.'+s,P['an'+s],P['to'+s],'shin.'+s),('arm.'+s,P['sh'+s],P['cl'+s],'root')]
    arm=make_arm('RaptorRig',B);bind(ob,arm)
    A=lambda a:(a,0,0)
    def gait(t,amp,bob,tail):
        s=math.sin(t*2*math.pi);c=math.cos(t*2*math.pi)
        return {'root_loc':(0,0,abs(c)*bob),'thigh.L':A(-amp*s),'thigh.R':A(amp*s),'shin.L':A(amp*.8*max(0,c)),'shin.R':A(amp*.8*max(0,-c)),'foot.L':A(-amp*.5*s),'foot.R':A(amp*.5*s),
                'tail1':(0,0,tail*s),'tail2':(0,0,tail*1.3*s),'tail3':(0,0,tail*1.6*s),'neck':(0,0,-tail*.5*s),'head':(4*c,0,0),'arm.L':A(20),'arm.R':A(20)}
    def loop(fn,dur,n=8):return [(dur*i/n,fn(i/n)) for i in range(n+1)]
    key(arm,'idle',loop(lambda t:{'neck':(6*math.sin(t*6.28),0,12*math.sin(t*6.28)),'head':(-6,0,0),'tail2':(0,0,8*math.sin(t*6.28)),'tail3':(0,0,12*math.sin(t*6.28)),'arm.L':A(20),'arm.R':A(20)},2.0))
    key(arm,'walk',loop(lambda t:gait(t,26,.03,6),.9))
    key(arm,'run',loop(lambda t:gait(t,48,.09,4),.45))
    key(arm,'attack',[(0,gait(0,0,0,0)),(.2,{'root':(-12,0,0),'neck':(-20,0,0),'head':(-20,0,0),'jaw':(25,0,0),'arm.L':A(-40),'arm.R':A(-40),'tail1':(10,0,0)}),
                      (.4,{'root_loc':(0,.25,0),'root':(14,0,0),'neck':(22,0,0),'head':(12,0,0),'jaw':(0,0,0),'arm.L':A(-70),'arm.R':A(-70),'tail1':(-12,0,0)}),(.75,gait(0,0,0,0))])
    key(arm,'die',[(0,{}),(.3,{'root':(0,30,0),'root_loc':(0,0,.2),'neck':(10,0,20),'thigh.L':A(-30)}),(.9,{'root':(0,85,0),'root_loc':(.25,0,.72),'neck':(-15,0,40),'head':(-10,0,10),'jaw':(20,0,0),'thigh.L':A(-40),'shin.L':A(40),'thigh.R':A(20),'tail2':(0,0,25)})])
    export(os.path.join(OUT,'raptor.glb'))

zombie();raptor();print('ok')
