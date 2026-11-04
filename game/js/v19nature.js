'use strict';
/* v0.19: árboles, rocas, arbustos y troncos con modelos CC0 de Quaternius (Ultimate Nature Pack).
   Los árboles siguen siendo los mismos (posición, colisión, tala): solo cambia la forma que se dibuja. */
const N19={ready:false,geo:{},want:false};
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB19);let n=0;
  const done=()=>{if(++n<ks.length)return;N19.ready=true;if(N19.want)try{apply19()}catch(e){console.error('v19',e)}};
  ks.forEach(k=>ld.parse(b64(GLB19[k]),'',gl=>{try{N19.geo[k]=raw19(gl.scene)}catch(e){console.error('glb19',k,e)}done()},e=>{console.error('glb19',k,e);done()}))}catch(e){console.error('glb19',e)}})();

// Geometría única con colores por vértice (en el mismo espacio de color que el resto del juego).
function raw19(root){root.updateMatrixWorld(true);const parts=[];
  root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
    const c=(o.material&&o.material.color?o.material.color.clone():new THREE.Color(.5,.5,.5)).convertLinearToSRGB();parts.push({g,c})});
  let n=0;for(const p of parts)n+=p.g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const {g,c} of parts){const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++,o++){pos.set([P.getX(i),P.getY(i),P.getZ(i)],o*3);if(N)nor.set([N.getX(i),N.getY(i),N.getZ(i)],o*3);col.set([c.r,c.g,c.b],o*3)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingBox();return g}
// Lleva el modelo a una caja dada (x/z centrados con ancho w, y de y0 a y1).
function fit19(src,w,y0,y1,center){const g=src.clone();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,center?-c.y:-bb.min.y,-c.z);const k=w/Math.max(s.x,s.z);g.scale(k,(y1-y0)/s.y,k);if(!center)g.translate(0,y0,0);g.computeBoundingSphere();g.computeBoundingBox();return g}
let lod19=null;
let tint19={pine:new THREE.Color(1,1,1),broad:new THREE.Color(1,1,1)},mats19=null,extra19=[];

function apply19(){
  N19.want=false;if(!trees||!trees.length||!world)return;const G=N19.geo;
  if(!mats19)mats19={pine:new THREE.MeshLambertMaterial({vertexColors:true}),broad:new THREE.MeshLambertMaterial({vertexColors:true}),rock:new THREE.MeshLambertMaterial({vertexColors:true}),wood:new THREE.MeshLambertMaterial({vertexColors:true}),plant:new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})};
  for(const m of extra19)if(m.parent)m.parent.remove(m);extra19=[];
  // Árboles: la copa de cada uno pasa a ser el árbol entero (tronco incluido) en el marco de la copa vieja.
  // Pino: copa en y+5.4s escalada (2.2s,7s,2.2s). Latifoliado: copa en y+3.6s escalada (2.6s,2.2s,2.6s).
  const pv=['PineTree_1','PineTree_2','PineTree_3'].filter(k=>G[k]),bv=['CommonTree_1','CommonTree_2','CommonTree_3'].filter(k=>G[k]);
  if(!pv.length||!bv.length)return;
  const pg=pv.map(k=>fit19(G[k],4.4/2.2,-5.4/7,(10.2-5.4)/7)),bg=bv.map(k=>fit19(G[k],5.6/2.6,-3.6/2.2,(6.6-3.6)/2.2));
  // Cada árbol guarda sus matrices viejas (tronco y copa de siempre) y la del modelo nuevo.
  // Solo los árboles cercanos usan el modelo (que tiene muchos más triángulos); los lejanos siguen con la forma simple.
  const dm=new THREE.Object3D(),M=new THREE.Matrix4();lod19={meshes:[],trees:[],last:null,t:0};
  const vmesh=[];pg.forEach((g,i)=>vmesh.push({g,pine:true}));bg.forEach((g,i)=>vmesh.push({g,pine:false}));
  const cnt=vmesh.map(()=>0);
  for(const t of trees){const pine=t.type===0;const nv=pine?pg.length:bg.length;const vi=(Math.abs(Math.floor(t.x*13.1+t.z*7.7)))%nv;t.v19=pine?vi:pg.length+vi;cnt[t.v19]++;
    const s=t.s;dm.rotation.set(0,(t.x*3.7+t.z*1.3)%6.283,0);
    if(pine){dm.position.set(t.x,t.y+2.2*s+3.2*s,t.z);dm.scale.set(2.2*s,7*s,2.2*s)}else{dm.position.set(t.x,t.y+2*s+1.6*s,t.z);dm.scale.set(2.6*s,2.2*s,2.6*s)}
    dm.updateMatrix();t.mm19=dm.matrix.clone();t.near19=false;
    t.mt19=new THREE.Matrix4();t3trunk.getMatrixAt(t.ti,t.mt19);t.mc19=new THREE.Matrix4();t.cm.getMatrixAt(t.ci,t.mc19);t.k19=.88+((t.x*7.3+t.z*3.1)%1+1)%1*.24}
  vmesh.forEach((v,i)=>{const im=new THREE.InstancedMesh(v.g,v.pine?mats19.pine:mats19.broad,Math.max(1,cnt[i]));im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;
    im.setColorAt(0,new THREE.Color(1,1,1));im.count=0;world.add(im);extra19.push(im);lod19.meshes.push(im)});
  lod19.trees=trees;
  // Rocas: los dos grupos de rocas (las grandes del mapa y las chicas de v5) usan piedras de verdad.
  const rv=['Rock_1','Rock_2','Rock_3','Rock_Moss_1'].filter(k=>G[k]);
  if(rv.length){const rg=G.Rock_3?fit19(G.Rock_3,2,-1,1,true):null;
    const swap=im=>{if(!im||!rg)return;im.geometry=rg;im.material=mats19.rock;if(!im.instanceColor){const c=new THREE.Color();for(let i=0;i<im.count;i++){const k=.85+((i*0.6180339)%1)*.3;im.setColorAt(i,c.setRGB(k,k,k))}im.instanceColor.needsUpdate=true}};
    world.children.filter(o=>o.isInstancedMesh&&o.count>0&&(o.geometry.type==='DodecahedronGeometry'||(o.material&&o.material.color&&o.material.color.getHex()===0x7a766c))).forEach(swap);
    if(typeof rockInst!=='undefined')swap(rockInst)}
  // Arbustos, plantas, flores y troncos caídos (solo decoración, sin colisión).
  const R=mulberry32((worldSeed()^0xb05c)>>>0);lod19.decor=[];const kinds=[['Bush_1',1.6,1.2],['Bush_2',1.5,1.1],['BushBerries_1',1.5,1.2],['Plant_1',1.1,.5],['Flowers',.5,.8],['TreeStump',1.1,.55],['WoodLog',2.4,.6]].filter(k=>G[k[0]]);
  const spots={};for(const k of kinds)spots[k[0]]=[];
  for(let a=0;a<9000;a++){const x=(R()-.5)*SIZE*.94,z=(R()-.5)*SIZE*.94;const y=terrainY(x,z);if(y<WATER_Y+.4||y>28)continue;if(Math.abs(x-roadX(z))<5||townW(x,z)>.05||insideBuilding(x,z))continue;
    if(ruins.some(r=>x>r.x0-2&&x<r.x1+2&&z>r.z0-2&&z<r.z1+2))continue;if(Math.max(Math.abs(x),Math.abs(z))<40)continue;
    const m=moist(x,z),r=R();const k=r<.42?(m>.45?(R()<.2?'BushBerries_1':R()<.5?'Bush_1':'Bush_2'):'Plant_1'):r<.72?'Flowers':r<.86?'Plant_1':r<.94?'TreeStump':'WoodLog';
    if(!spots[k])continue;if(spots[k].length>(k==='Flowers'?1400:k==='TreeStump'||k==='WoodLog'?160:900))continue;spots[k].push([x,y,z,.7+R()*.6,R()*6.283])}
  for(const [k,w,h] of kinds){const list=spots[k];if(!list.length)continue;const geo=fit19(G[k],w,0,h);const im=new THREE.InstancedMesh(geo,k==='Flowers'||k==='Plant_1'?mats19.plant:k==='TreeStump'||k==='WoodLog'?mats19.wood:mats19.broad,list.length);
    im.castShadow=k!=='Flowers'&&k!=='Plant_1';im.receiveShadow=true;im.frustumCulled=false;im.setColorAt(0,new THREE.Color(1,1,1));im.count=0;world.add(im);extra19.push(im);
    const items=list.map(([x,y,z,s,ry])=>{dm.position.set(x,y-.05,z);dm.rotation.set(0,ry,0);dm.scale.set(s,s,s);dm.updateMatrix();return{x,z,m:dm.matrix.clone(),k:.85+(ry/6.283)*.3}});
    lod19.decor.push({im,items,r:k==='Flowers'||k==='Plant_1'?55:k==='TreeStump'||k==='WoodLog'?90:75})}
  lod19.last=null;lodUpdate19(true);
  season19()}

// Las estaciones tiñen los modelos en proporción a lo que tiñen el pino y el árbol de siempre.
function season19(){if(!mats19||typeof SEASON_FX==='undefined')return;const fx=SEASON_FX[season()];if(!fx)return;
  const base={pine:new THREE.Color(0x2a3a24),broad:new THREE.Color(0x45632f)};
  for(const k of ['pine','broad']){const c=new THREE.Color(fx[k]),b=base[k];const t=new THREE.Color(Math.min(1.6,c.r/b.r),Math.min(1.6,c.g/b.g),Math.min(1.6,c.b/b.b));
    const l=(t.r+t.g+t.b)/3;mats19[k].color.copy(t.multiplyScalar((k==='pine'?.72:.88)/Math.max(.6,l)))}}
const _applySeason19=applySeason;applySeason=function(){_applySeason19.apply(this,arguments);try{season19()}catch(e){}};
const _genWorld19=genWorld;genWorld=function(seed){_genWorld19(seed);try{if(N19.ready)apply19();else N19.want=true}catch(e){console.error('v19',e)}};

// Cambia de forma simple a modelo según la distancia al jugador (cada medio segundo o al moverse).
const TREE_R19=95;
function lodUpdate19(force){if(!lod19||!lod19.meshes.length)return;const px=P.x,pz=P.z;
  if(!force&&lod19.last&&Math.abs(px-lod19.last[0])<5&&Math.abs(pz-lod19.last[1])<5)return;lod19.last=[px,pz];
  const zero=new THREE.Matrix4().makeScale(0,0,0),col=new THREE.Color();let dirtyOld=false;const counts=lod19.meshes.map(()=>0);
  for(const t of lod19.trees){const near=t.alive!==false&&Math.abs(t.x-px)<TREE_R19&&Math.abs(t.z-pz)<TREE_R19&&(t.x-px)**2+(t.z-pz)**2<TREE_R19*TREE_R19;
    if(near!==t.near19){t.near19=near;dirtyOld=true;if(t.alive!==false){t3trunk.setMatrixAt(t.ti,near?zero:t.mt19);t.cm.setMatrixAt(t.ci,near?zero:t.mc19)}}
    if(near){const im=lod19.meshes[t.v19],i=counts[t.v19]++;im.setMatrixAt(i,t.mm19);im.setColorAt(i,col.setRGB(t.k19,t.k19,t.k19*.97))}}
  lod19.meshes.forEach((im,i)=>{im.count=counts[i];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true});
  if(dirtyOld){t3trunk.instanceMatrix.needsUpdate=true;const cms=new Set(lod19.trees.map(t=>t.cm));cms.forEach(m=>m.instanceMatrix.needsUpdate=true)}
  for(const d of lod19.decor){let n=0;const r2=d.r*d.r;for(const it of d.items){const dx=it.x-px,dz=it.z-pz;if(dx*dx+dz*dz<r2){d.im.setMatrixAt(n,it.m);d.im.setColorAt(n,col.setRGB(it.k,it.k,it.k));n++}}
    d.im.count=n;d.im.instanceMatrix.needsUpdate=true;if(d.im.instanceColor)d.im.instanceColor.needsUpdate=true}}
// Un árbol talado deja de dibujarse también como modelo.
const _setTreeVisible19=setTreeVisible;setTreeVisible=function(t,v){_setTreeVisible19(t,v);if(!v&&t.near19&&lod19){t.near19=false;lodUpdate19(true)}};
const _updateTruck19=updateTruck;updateTruck=function(dt){_updateTruck19(dt);try{lodUpdate19(false)}catch(e){console.error('lod19',e);lod19=null}};
