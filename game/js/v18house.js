'use strict';
/* v0.18: casas con muebles, puertas, ventanas y techos de verdad.
   Muebles CC0 de Quaternius (tools/models/house). Las colisiones, los contenedores y el saqueo
   no cambian: cada mueble ocupa la misma caja que antes, solo cambia lo que se ve.
   Se dibujan con InstancedMesh (una llamada por tipo de mueble para todo el mapa). */
const H18={ready:false,geo:{},pending:[]};
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB18);let n=0;
  const done=()=>{if(++n<ks.length)return;H18.ready=true;try{if(H18.pending.length&&world)apply18()}catch(e){console.error('glb18 apply',e)}};
  ks.forEach(k=>ld.parse(b64(GLB18[k]),'',gl=>{try{H18.geo[k]=bake18(gl.scene)}catch(e){console.error('glb18 bake',k,e)}done()},err=>{console.error('glb18',k,err);done()}))}catch(e){console.error('glb18',e)}})();

// Une todas las piezas de un modelo en una sola geometría con colores por vértice, normalizada
// a una caja de 1x1x1 apoyada en el piso (x,z en -0.5..0.5, y en 0..1). El frente queda en +z.
function bake18(root){
  root.updateMatrixWorld(true);const parts=[];
  root.traverse(o=>{if(!o.isMesh)return;let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
    const c=(o.material&&o.material.color?o.material.color.clone():new THREE.Color(.5,.5,.5)).convertLinearToSRGB();parts.push({g,c})});
  let n=0;for(const p of parts)n+=p.g.attributes.position.count;
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const {g,c} of parts){const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++,o++){pos[o*3]=P.getX(i);pos[o*3+1]=P.getY(i);pos[o*3+2]=P.getZ(i);
    if(N){nor[o*3]=N.getX(i);nor[o*3+1]=N.getY(i);nor[o*3+2]=N.getZ(i)}col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.computeBoundingBox();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,-bb.min.y,-c.z);g.scale(1/Math.max(s.x,1e-3),1/Math.max(s.y,1e-3),1/Math.max(s.z,1e-3));
  g.userData.aspect=s.x/Math.max(s.z,1e-3);g.computeBoundingSphere();return g}

// Qué modelo usa cada contenedor. tile: se repite a lo largo de la pared si la caja es larga.
const CONT18={
  heladera:{m:['Kitchen_Fridge'],tile:1},alacena:{m:['Kitchen_2Drawers','Kitchen_Oven','Kitchen_3Drawers'],tile:1},
  armario:{m:['Bookshelf']},botiquin:{m:['NightStand_1']},escritorio:{m:['Drawer_1']},
  gondola:{m:['Shelf_Large'],tile:1},kiosco:{m:['Drawer_3'],tile:1},farmacia:{m:['Shelf_Large'],tile:1},ferreteria:{m:['Shelf_Large'],tile:1},
  herramientas:{m:['Drawer_3'],tile:1},armeria:{m:['Drawer_5'],tile:1},tacho:{m:['Trashcan_Green']},
};

// Durante la generación del mundo se anotan las casas y se esconden las cajas que se reemplazan
// (antes de que v4 las funda en lotes estáticos).
let houses18=[];
const _genWorld18=genWorld;
genWorld=function(seed){houses18=[];H18.pending=[];_genWorld18(seed);try{H18.pending=[1];if(H18.ready)apply18()}catch(e){console.error('v18',e)}};
const _buildBuilding18=buildBuilding;
buildBuilding=function(rng,cx,cz,w,d,store,side){
  const n0=world.children.length;_buildBuilding18(rng,cx,cz,w,d,store,side);
  try{const b=buildings[buildings.length-1];const g=world.children[n0];if(!g||!b)return;
    const h={b,store,side,panes:[],extra:[]};const sc=new THREE.Vector3();
    for(const m of g.children){if(!m.isMesh)continue;sc.copy(m.scale);const hex=m.material&&m.material.color?m.material.color.getHexString():'';
      if(hex==='20282a'){h.panes.push({x:m.position.x,y:m.position.y,z:m.position.z,alongX:sc.x>sc.z});continue}
      if(!store&&Math.abs(sc.x-1.6)<.01&&Math.abs(sc.y-.8)<.01&&Math.abs(sc.z-1)<.01){h.extra.push({k:'table',x:m.position.x,z:m.position.z,w:1.6,hh:.8,d:1});m.visible=false}
      else if(!store&&Math.abs(sc.x-1.6)<.01&&Math.abs(sc.y-.5)<.01&&Math.abs(sc.z-2.1)<.01){h.extra.push({k:'bed',x:m.position.x,z:m.position.z,w:1.6,hh:.5,d:2.1});m.visible=false}}
    h.rng=mulberry32(((cx*73856093)^(cz*19349663))>>>0);houses18.push(h)}catch(e){console.error('v18 house',e)}};

// Hacia dónde mira algo apoyado contra la pared más cercana: devuelve el giro (0, ±π/2, π).
function face18(b,x,z){if(!b)return 0;const dl=x-b.x0,dr=b.x1-x,db=z-b.z0,df=b.z1-z;const m=Math.min(dl,dr,db,df);
  if(m===db)return 0;if(m===df)return Math.PI;if(m===dl)return Math.PI/2;return -Math.PI/2}

let inst18=null;const mat18=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.05});
function apply18(){
  H18.pending=[];if(!world)return;const items={};const add=(k,x,y,z,yaw,sx,sy,sz,c)=>{if(!H18.geo[k])return false;(items[k]||(items[k]=[])).push({x,y,z,yaw,sx,sy,sz,c});return true};
  const emptyGeo=new THREE.BufferGeometry();emptyGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));emptyGeo.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
  // Contenedores: el modelo ocupa la caja de colisión; la caja vieja deja de dibujarse.
  for(const c of conts){const def=CONT18[c.type];const ms=c.mesh;if(!def||!ms||!ms.isMesh||c.car)continue;
    const b=c.bld||insideBuilding(c.x,c.z);const yaw=c.type==='tacho'?0:face18(b,c.x,c.z);
    const bw=ms.scale.x,bh=ms.scale.y,bd=ms.scale.z;const side=Math.abs(Math.sin(yaw))>.5;
    const along=side?bd:bw,depth=side?bw:bd;const k0=def.m[0];if(!H18.geo[k0])continue;
    const asp=H18.geo[k0].userData.aspect;const nt=def.tile?Math.max(1,Math.min(5,Math.round((along/depth)/asp))):1;
    const y0=ms.position.y-bh/2;const ax=side?0:1,az=side?1:0;let ok=false;
    for(let i=0;i<nt;i++){const off=(i+.5)/nt*along-along/2;const k=def.m[i%def.m.length];
      ok=add(k,c.x+ax*off,y0,c.z+az*off,yaw,along/nt,bh,depth,c)||ok}
    if(ok){ms.geometry=emptyGeo;c.m18=true}}
  for(const h of houses18){const b=h.b,R=h.rng;const fl=b.floor;
    for(const e of h.extra){const yaw=face18(b,e.x,e.z);const side=Math.abs(Math.sin(yaw))>.5;
      if(e.k==='bed'){const yb=Math.abs(e.d-e.w)>0?(e.d>e.w?0:Math.PI/2):0;add('Bed_Single',e.x,fl,e.z,yb+(R()<.5?0:Math.PI),e.w,1.05,e.d);
        add('Carpet_1',e.x+(R()-.5)*.4,fl+.01,e.z,yb,2,.03,1.4);add('NightStand_1',e.x+(e.x>b.cx?-1:1)*1.15,fl,e.z+(R()-.5)*.6,yaw,.5,.55,.5)}
      else{add('Table_RoundLarge',e.x,fl,e.z,0,e.w,e.hh,e.d);
        [[-1,0,Math.PI/2],[1,0,-Math.PI/2]].forEach(([sx,sz,ry])=>add('Chair_1',e.x+sx*(e.w/2+.25),fl,e.z+sz,ry,.45,1,.45))}}
    // Ventanas: marco con vidrio sobre cada vidrio oscuro, por fuera.
    for(const p of h.panes){add('Window_Small1',p.x,p.y-.62,p.z,p.alongX?0:Math.PI/2,p.alongX?1.25:.16,1.25,p.alongX?.16:1.25)}
    if(!h.store){
      // Puerta abierta contra la pared, al lado del vano.
      const doorWall=h.side<0?3:2,dz=b.z0+b.d*.3,wx=doorWall===3?b.x1-.2:b.x0+.2,inward=doorWall===3?-1:1;
      add('Door_1',wx+inward*.02,fl,dz-.75-.47,Math.PI/2*inward,.08,2.15,.9);
      // Planta en un rincón y lámpara de techo en cada ambiente.
      if(R()<.7)add(R()<.5?'Houseplant_1':'Houseplant_3',b.cx+(b.cx>wx?1:-1)*(b.w/2-.55),fl,b.z1-.55,0,.5,.9,.5);
      add('Light_Ceiling1',b.cx,fl+2.25,b.cz-b.d/4,0,.35,.75,.35);add('Light_Ceiling1',b.cx,fl+2.25,b.cz+b.d/4,0,.35,.75,.35);
      roof18(h)}
  }
  // Una InstancedMesh por modelo.
  inst18=[];const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S3=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
  for(const k in items){const list=items[k];const im=new THREE.InstancedMesh(H18.geo[k],mat18,list.length);
    list.forEach((it,i)=>{Q.setFromAxisAngle(Y,it.yaw);V.set(it.x,it.y,it.z);
      const side=Math.abs(Math.sin(it.yaw))>.5;S3.set(side?it.sz:it.sx,it.sy,side?it.sx:it.sz);M.compose(V,Q,S3);im.setMatrixAt(i,M);im.setColorAt(i,new THREE.Color(1,1,1))});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
    im.castShadow=k.indexOf('Carpet')<0&&k.indexOf('Window')<0;im.receiveShadow=true;im.frustumCulled=false;world.add(im);
    inst18.push({im,list})}
  seen18=-1}

// Techo a dos aguas para las casas (el techo plano viejo se esconde).
const roofMat18={};
function roof18(h){const b=h.b;const r=b.roof;if(!r)return;let col='#5a3a2e';
  r.children.forEach(m=>{if(m.isMesh){if(m.scale.y<.3)col='#'+m.material.color.getHexString();m.visible=false}});
  const alongX=b.w>=b.d,span=(alongX?b.d:b.w)+.8,len=(alongX?b.w:b.d)+.8,rise=span*.32,y=b.floor+3;
  const hs=span/2,hl=len/2;
  // prisma: dos faldones y dos hastiales
  const v=[-hl,0,-hs, hl,0,-hs, hl,rise,0, -hl,0,-hs, hl,rise,0, -hl,rise,0,
           -hl,0,hs, -hl,rise,0, hl,rise,0, -hl,0,hs, hl,rise,0, hl,0,hs,
           -hl+.4,0,-hs+.4, -hl+.4,rise-.05,0, -hl+.4,0,hs-.4,  hl-.4,0,-hs+.4, hl-.4,0,hs-.4, hl-.4,rise-.05,0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();
  const gTop=new THREE.BufferGeometry();gTop.setAttribute('position',new THREE.Float32BufferAttribute(v.slice(0,36),3));gTop.computeVertexNormals();
  const gEnd=new THREE.BufferGeometry();gEnd.setAttribute('position',new THREE.Float32BufferAttribute(v.slice(36),3));gEnd.computeVertexNormals();
  const top=new THREE.Mesh(gTop,roofMat18[col]||(roofMat18[col]=new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide})));
  const end=new THREE.Mesh(gEnd,roofMat18.gable||(roofMat18.gable=new THREE.MeshLambertMaterial({color:'#6a6258',side:THREE.DoubleSide})));
  for(const m of [top,end]){m.position.set(b.cx,y,b.cz);if(!alongX)m.rotation.y=Math.PI/2;m.castShadow=true;m.receiveShadow=true;r.add(m)}
  // chimenea
  if(h.rng()<.6){const ch=bx(.5,1.3,.5,'#6a5a4e',b.cx+(alongX?hl*.45:0),y+rise*.6,b.cz+(alongX?0:hl*.45),r)}}

// Muebles revisados: se oscurecen como antes las cajas.
let seen18=-1,seenT18=0;const dark18=new THREE.Color(.55,.5,.45),white18=new THREE.Color(1,1,1);
function updateSeen18(dt){if(!inst18)return;seenT18-=dt;if(seenT18>0)return;seenT18=.5;
  for(const {im,list} of inst18){let ch=false;list.forEach((it,i)=>{if(!it.c)return;const s=!!it.c.seen;if(it.s!==s){it.s=s;im.setColorAt(i,s?dark18:white18);ch=true}});if(ch&&im.instanceColor)im.instanceColor.needsUpdate=true}}
const _updateTruck18=updateTruck;updateTruck=function(dt){_updateTruck18(dt);try{updateSeen18(dt)}catch(e){}};
