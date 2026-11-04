# Convierte los modelos CC0 de vehículos (Kenney Car Kit y Quaternius) a GLB con texturas embebidas.
# Uso: python convert.py <carpeta_salida>   (requiere: pip install bpy)
import bpy,sys,os
D=os.path.dirname(os.path.abspath(__file__));SRC=os.path.join(D,'src');OUT=sys.argv[-1]
MAP={'pickup':'truck.glb','furgon':'van.glb','camion':'delivery.glb','tractor':'tractor.glb',
     'sedan':'NormalCar1.blend','jeep':'SUV.blend','ambulancia':'Ambulance.blend','colectivo':'Bus.blend'}
for k,f in MAP.items():
    p=os.path.join(SRC,f)
    if f.endswith('.blend'):bpy.ops.wm.open_mainfile(filepath=p)
    else:
        bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=p)
    for o in list(bpy.context.scene.objects):
        if o.type!='MESH':
            if o.type!='EMPTY':bpy.data.objects.remove(o)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,k+'.glb'),export_format='GLB',export_apply=True,export_image_format='AUTO')
    print('OK',k)
