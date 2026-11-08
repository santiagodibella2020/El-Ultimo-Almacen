# Baja los GLB de Tripo (~1 millón de caras, texturas de 2048-4096) a modelos livianos para el juego:
# pasa el color de la textura a color por vértice, suelda, reduce a N caras y exporta sin textura ni UV.
# También deja una miniatura PNG de cada modelo (para reconocerlos).
# Uso: python convert.py <carpeta o .glb ...> <carpeta de salida> [caras]
# Requiere: pip install trimesh pymeshlab pillow numpy
import sys,os,glob
import numpy as np,trimesh,pymeshlab
from PIL import Image,ImageDraw

def load(f):
    s=trimesh.load(f,force='scene')
    V,F,C=[],[],[];off=0
    for node in s.graph.nodes_geometry:
        T,gn=s.graph[node];g=s.geometry[gn]
        v=trimesh.transform_points(g.vertices,T);col=None
        vis=g.visual
        if isinstance(vis,trimesh.visual.texture.TextureVisuals) and vis.uv is not None:
            img=getattr(vis.material,'baseColorTexture',None) or getattr(vis.material,'image',None)
            if img is not None:
                im=np.asarray(img.convert('RGB').resize((512,512),Image.BOX),dtype=np.float32)/255
                uv=np.asarray(vis.uv);x=np.clip((uv[:,0]%1)*511,0,511).astype(int);y=np.clip((1-uv[:,1]%1)*511,0,511).astype(int)
                col=im[y,x]
                bf=getattr(vis.material,'baseColorFactor',None)
                if bf is not None:col=col*(np.asarray(bf[:3],dtype=np.float32)/255 if np.max(bf)>1 else np.asarray(bf[:3]))
        if col is None:
            try:col=np.asarray(vis.to_color().vertex_colors[:,:3],dtype=np.float32)/255
            except Exception:col=np.full((len(v),3),.6,np.float32)
        V.append(v);F.append(g.faces+off);C.append(col);off+=len(v)
    return np.vstack(V),np.vstack(F),np.vstack(C)

def reduce(V,F,C,target):
    ms=pymeshlab.MeshSet()
    ms.add_mesh(pymeshlab.Mesh(vertex_matrix=V.astype(np.float64),face_matrix=F.astype(np.int32),v_color_matrix=np.hstack([C,np.ones((len(C),1))]).astype(np.float64)))
    ms.meshing_merge_close_vertices(threshold=pymeshlab.PercentageValue(0.05))
    ms.meshing_remove_duplicate_faces();ms.meshing_remove_unreferenced_vertices()
    ms.meshing_decimation_quadric_edge_collapse(targetfacenum=target,preservenormal=True,preserveboundary=True,optimalplacement=True,planarquadric=True,autoclean=True)
    m=ms.current_mesh()
    return m.vertex_matrix().astype(np.float32),m.face_matrix().astype(np.int64),m.vertex_color_matrix()[:,:3].astype(np.float32)

def thumb(V,F,C,path,size=256):
    img=Image.new('RGB',(size*2,size),(40,44,52));d=ImageDraw.Draw(img)
    c=(V.max(0)+V.min(0))/2;sc=(size*.9)/max(1e-6,(V.max(0)-V.min(0)).max())
    L=np.array([.4,.8,.45]);L/=np.linalg.norm(L)
    for k,ang in enumerate((.6,2.4)):
        ca,sa=np.cos(ang),np.sin(ang);R=np.array([[ca,0,sa],[0,1,0],[-sa,0,ca]])
        el=.35;Rx=np.array([[1,0,0],[0,np.cos(el),-np.sin(el)],[0,np.sin(el),np.cos(el)]])
        P=(V-c)@R.T@Rx.T;t=P[F];n=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);nl=np.linalg.norm(n,axis=1)+1e-9;n/=nl[:,None]
        sh=np.clip(np.abs(n@L),0,1)*.75+.25;col=C[F].mean(1)*sh[:,None]
        order=np.argsort(t[:,:,2].mean(1))
        for i in order:
            p=t[i];d.polygon([(size*k+size/2+q[0]*sc,size/2-q[1]*sc) for q in p],fill=tuple((np.clip(col[i],0,1)*255).astype(int)))
    img.save(path)

def main():
    args=sys.argv[1:];target=4000
    if len(args)>2 and args[-1].isdigit():target=int(args.pop())
    out=args.pop();files=[]
    for a in args:files+=sorted(glob.glob(os.path.join(a,'*.glb'))) if os.path.isdir(a) else [a]
    os.makedirs(out,exist_ok=True)
    for f in files:
        name=os.path.splitext(os.path.basename(f))[0];dst=os.path.join(out,name+'.glb')
        if os.path.exists(dst):continue
        try:
            V,F,C=load(f);V2,F2,C2=reduce(V,F,C,target)
            m=trimesh.Trimesh(V2,F2,vertex_colors=(np.clip(C2,0,1)*255).astype(np.uint8),process=False)
            m.export(dst,file_type='glb',include_normals=True)
            thumb(V2,F2,C2,os.path.join(out,name+'.png'))
            print(name,len(F),'->',len(F2),'caras',os.path.getsize(dst)//1024,'KB',flush=True)
        except Exception as e:print('ERROR',name,e,flush=True)
main()
