'use strict';
/* v0.20: armas en primera persona y decoración de la calle y los campamentos con modelos CC0 de Quaternius
   (Survival Pack y Street Pack), ver tools/models/props. Las manos y la lógica de cada arma no cambian. */
const P20={ready:false,geo:{},want:false};
(function(){try{
  const b64=s=>{const bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a.buffer};
  const ld=new THREE.GLTFLoader();const ks=Object.keys(GLB20);let n=0;
  const done=()=>{if(++n<ks.length)return;P20.ready=true;
    try{if(typeof rebuildViewmodels==='function')rebuildViewmodels()}catch(e){console.error('v20 vm',e)}
    if(P20.want)try{apply20()}catch(e){console.error('v20',e)}};
  ks.forEach(k=>ld.parse(b64(GLB20[k]),'',gl=>{try{P20.geo[k]=raw19(gl.scene)}catch(e){console.error('glb20',k,e)}done()},e=>{console.error('glb20',k,e);done()}))}catch(e){console.error('glb20',e)}})();

// Geometría apoyada en y=0, centrada en x/z y con 1 de alto.
function unitH20(k){const g=P20.geo[k].clone();g.computeBoundingBox();const bb=g.boundingBox,s=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  g.translate(-c.x,-bb.min.y,-c.z);g.scale(1/s.y,1/s.y,1/s.y);g.computeBoundingBox();g.computeBoundingSphere();return g}

// ---------- Armas: el modelo ocupa el lugar de las piezas del arma vieja (las manos quedan) ----------
// rot: giro para que el caño o la hoja apunte a -z.
const WPN20={pistola:['Pistol_1',0,Math.PI/2],revolver:['Revolver_1',0,Math.PI/2],escopeta:['Shotgun_1',0,Math.PI/2],escopetac:['Shotgun_ShortStock',0,Math.PI/2],
  cuchillo:['Knife',-Math.PI/2,0,Math.PI/2],hacha:['Axe',-Math.PI/2,0,Math.PI/2],sarten:['Pan',0,Math.PI]};
let wmat20=null;
function swapWeapon20(k,g){const w=WPN20[k];if(!w||!P20.ready||!P20.geo[w[0]])return;
  const parts=g.children.filter(o=>o.isMesh);if(!parts.length)return;
  const bb=new THREE.Box3(),tmp=new THREE.Box3();
  for(const o of parts){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();o.updateMatrix();tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrix);bb.union(tmp)}
  const geo=P20.geo[w[0]].clone();geo.rotateX(w[1]);if(w[3])geo.rotateZ(w[3]);geo.rotateY(w[2]);geo.computeBoundingBox();
  const mb=geo.boundingBox,ms=mb.getSize(new THREE.Vector3()),mc=mb.getCenter(new THREE.Vector3());
  const ts=bb.getSize(new THREE.Vector3()),tc=bb.getCenter(new THREE.Vector3());const s=ts.z/ms.z;
  geo.translate(-mc.x,-mc.y,-mc.z);geo.scale(s,s,s);geo.translate(tc.x,tc.y,tc.z);
  if(!wmat20)wmat20=new THREE.MeshPhongMaterial({vertexColors:true,shininess:40,specular:0x2a2a2a});
  for(const o of parts)g.remove(o);
  const m=new THREE.Mesh(geo,wmat20);m.castShadow=false;m.renderOrder=parts[0].renderOrder;
  g.add(m)}
const _weaponHD20=weaponHD;
weaponHD=function(k,g){const r=_weaponHD20(k,g);try{swapWeapon20(k,g)}catch(e){console.error('v20 weapon',k,e)}return r};

// ---------- Calle y campamentos ----------
let extra20=[],mats20=null;
function inst20(k,list,shadow){if(!list.length||!P20.geo[k])return null;
  if(!mats20)mats20={std:new THREE.MeshLambertMaterial({vertexColors:true})};
  const geo=unitH20(k),im=new THREE.InstancedMesh(geo,mats20.std,list.length),dm=new THREE.Object3D(),col=new THREE.Color();
  list.forEach((p,i)=>{dm.position.set(p.x,p.y,p.z);dm.rotation.set(0,p.ry||0,0);dm.scale.setScalar(p.h);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);const t=p.k||1;im.setColorAt(i,col.setRGB(t,t,t))});
  im.castShadow=shadow!==false;im.receiveShadow=true;im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;world.add(im);extra20.push(im);return im}
const solid20=(x,z,hw,hd,y,h)=>{if(typeof addAABB==='function')addAABB({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,y0:y-1,y1:y+h,kind:'solid'})};
let decor20=null;
// Se anotan las piezas viejas (faroles, tachos, carpas y fogatas) para esconderlas antes de que se unan al mundo.
if(typeof buildDecor9==='function'){const _bd20=buildDecor9;buildDecor9=function(seed){const n0=world.children.length;_bd20(seed);
  try{decor20={lamps:[],bins:[],tents:[],fires:[],cars:[]};
    for(const g of world.children.slice(n0)){if(!g.isGroup)continue;const c=g.children;
      if(c.length===3&&c[0].isMesh&&Math.abs(c[0].scale.y-3.6)<.01&&Math.abs(c[0].scale.x-.12)<.01){decor20.lamps.push(g);continue}
      if(c.length===2&&c[0].isMesh&&Math.abs(c[0].scale.y-1)<.01&&Math.abs(c[0].scale.x-.4)<.01){decor20.bins.push(g);continue}
      if(c.length>=6&&c[0].isMesh&&Math.abs(c[0].scale.x-1.8)<.01&&Math.abs(c[0].scale.z-4.2)<.01){const bus=c.some(o=>o.isMesh&&Math.abs(o.scale.z-6)<.01),pol=c.some(o=>o.isMesh&&Math.abs(o.scale.y-.2)<.01&&Math.abs(o.scale.z-1.4)<.01);
        decor20.cars.push({g,col:'#'+c[0].material.color.getHexString(),kind:bus?'bus':pol?'police':c[1].material.color.getHex()===0x141414?'burnt':'plain'});continue}
      const cones=c.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==='ConeGeometry'&&o.geometry.parameters&&o.geometry.parameters.radialSegments===4);
      if(cones.length){decor20.tents.push(...cones.map(t=>({g,t})));decor20.fires.push({g,parts:c.slice(0,11)})}}
    if(P20.ready)hideOld20()}catch(e){console.error('v20 decor',e)}}}
function hideOld20(){if(!decor20)return;
  for(const g of decor20.lamps)g.children[0].visible=g.children[1].visible=false;
  for(const g of decor20.bins)g.visible=false;
  if(typeof GLB17T!=='undefined'&&GLB17T.ready)for(const c of decor20.cars)c.g.visible=false;
  for(const {t} of decor20.tents)t.visible=false;
  for(const f of decor20.fires)f.parts.forEach(o=>{o.visible=false})}

function apply20(){P20.want=false;if(!world||!P20.ready)return;
  for(const m of extra20)if(m.parent)m.parent.remove(m);extra20=[];
  const R=mulberry32((worldSeed()^0x20b2)>>>0),wp=new THREE.Vector3();
  if(decor20){
    // faroles: el poste nuevo reemplaza poste y brazo; la luz vieja queda como foco encendido
    inst20('Streetlight_Single',decor20.lamps.map(g=>({x:g.position.x,y:g.position.y,z:g.position.z,h:4.3,ry:R()*6.283})));
    for(const g of decor20.lamps){const l=g.children[2];if(l){l.position.set(0,3.78,0);l.scale.set(.2,.18,.2)}}
    inst20('Trashcan',decor20.bins.map(g=>({x:g.position.x,y:g.position.y,z:g.position.z,h:1.1,ry:R()*6.283})));
    const tents=[],fires=[];
    for(const {g,t} of decor20.tents){g.updateMatrixWorld(true);t.getWorldPosition(wp);tents.push({x:wp.x,y:wp.y-.85,z:wp.z,h:1.75,ry:t.rotation.y+g.rotation.y+Math.PI/4,k:.85+R()*.3})}
    for(const f of decor20.fires){const g=f.g;if(fires.some(p=>Math.abs(p.x-g.position.x)<.1&&Math.abs(p.z-g.position.z)<.1))continue;fires.push({x:g.position.x,y:g.position.y,z:g.position.z,h:.55,ry:R()*6.283})}
    inst20('Tent',tents);inst20('Bonfire',fires);
    // autos abandonados del pueblo con los modelos de los vehículos (0.17)
    if(typeof GLB17T!=='undefined'&&GLB17T.ready)for(const c of decor20.cars){try{
      const k=c.kind==='bus'?'colectivo':c.kind==='police'?'sedan':['sedan','sedan','pickup','furgon','jeep'][R()*5|0];
      const col=new THREE.Color(c.col);if(c.kind==='burnt')col.set('#2a2622');col.multiplyScalar(.85);
      const m=car20(k,'#'+col.getHexString(),c.kind==='bus'?6.4:k==='furgon'?4.8:4.3,c.kind==='bus'?2.4:1.85);if(!m)continue;
      m.position.copy(c.g.position);m.rotation.set((R()-.5)*.04,c.g.rotation.y,(R()-.5)*.05);world.add(m);extra20.push(m);c.g.visible=false}catch(e){console.error('v20 car',e)}}}
  // señales de tránsito a la entrada del pueblo y a lo largo de la ruta
  const signs={Sign_Stop:[],Sign_NoParking:[],Sign_Triangle:[]};
  const sgn=(k,x,z,ry)=>{const y=terrainY(x,z);if(y<WATER_Y+.3||insideBuilding(x,z))return;if(typeof circleBlocked==='function'&&circleBlocked(x,z,.6,'t'))return;signs[k].push({x,y,z,h:2.5,ry});solid20(x,z,.08,.08,y,2.5)};
  sgn('Sign_Stop',roadX(98)+4.6,98,Math.PI/2);sgn('Sign_Stop',roadX(254)-4.6,254,-Math.PI/2);
  for(let z=118;z<=236;z+=40)sgn('Sign_NoParking',roadX(z)+(z%80<40?4.8:-4.8),z+3,z%80<40?Math.PI/2:-Math.PI/2);
  for(let z=-SIZE*.42;z<SIZE*.42;z+=110){if(Math.abs(z-TOWN_Z)<110||Math.abs(z)<PAL+15)continue;sgn('Sign_Triangle',roadX(z)+(R()<.5?-4.4:4.4),z,R()*.4-.2+(R()<.5?Math.PI/2:-Math.PI/2))}
  for(const k in signs)inst20(k,signs[k]);
  // bidones y garrafas tirados en el pueblo y al costado de la ruta (sin colisión)
  const cans=[],tanks=[];
  for(let a=0;a<900&&cans.length+tanks.length<70;a++){const inTown=a<500;const z=inTown?TOWN_Z+(R()-.5)*160:(R()-.5)*SIZE*.9;const x=inTown?roadX(z)+(R()-.5)*110:roadX(z)+(R()<.5?-1:1)*(4.4+R()*3);
    if(insideBuilding(x,z)||Math.abs(x-roadX(z))<3.4)continue;if(inTown&&townW(x,z)<.3)continue;const y=terrainY(x,z);if(y<WATER_Y+.4)continue;
    if(R()<.6)cans.push({x,y,z,h:.42,ry:R()*6.283,k:.8+R()*.35});else tanks.push({x,y,z,h:.85,ry:R()*6.283,k:.75+R()*.3})}
  inst20('GasCan',cans);inst20('PropaneTank',tanks)}
function car20(k,col,L,W){const tpl=GLB17T.tpl[k];if(!tpl)return null;const inner=tpl.clone(true);
  if(MAT17[k])paintQuat17(inner,k,col);else bakeKenney17(inner,col);
  inner.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  const rot=new THREE.Group();rot.add(inner);rot.rotation.y=(FIT17[k]&&FIT17[k].rot)||0;const fit=new THREE.Group();fit.add(rot);fit.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(rot),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
  const sx=W/sz.x,sz2=L/sz.z;rot.position.set(-c.x,-bb.min.y,-c.z);fit.scale.set(sx,(sx+sz2)/2,sz2);return fit}
const _genWorld20=genWorld;genWorld=function(seed){_genWorld20(seed);try{if(P20.ready)apply20();else P20.want=true}catch(e){console.error('v20',e)}};
