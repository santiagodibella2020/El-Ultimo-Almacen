'use strict';
/* v0.36: mapa más llano y con más caminos. Líneas de pintura en las rutas, postes de luz con cables, faroles en el pueblo y en la ciudad.
   El terreno y la red de caminos están en world.js (ROADS36) y v6.js (rawMain6). */
let extra36=[],pts36=null,pts36n=null;
// puntos a lo largo de todos los caminos (para pintura, postes y decoración): {x,z,yaw,road}
function roadPts36(){const key=nH;if(pts36&&pts36n===key)return pts36;pts36n=key;pts36=[];
  const step=7;
  const add=(x,z,x2,z2,id)=>{pts36.push({x,z,yaw:Math.atan2(x2-x,z2-z),road:id})};
  // ruta principal
  for(let z=-720;z<450;z+=step)add(roadX(z),z,roadX(z+1),z+1,-1);
  ROADS36.forEach((r,i)=>{
    if(r.t==='h')for(let x=r.u0;x<=r.u1;x+=step){const f=u=>r.c+r.a*Math.sin(u*r.f+r.p);add(x,f(x),x+1,f(x+1),i)}
    else if(r.t==='v')for(let z=r.u0;z<=r.u1;z+=step){const f=u=>r.c+r.a*Math.sin(u*r.f+r.p);add(f(z),z,f(z+1),z+1,i)}
    else if(r.t==='r')for(let z=r.u0;z<=r.u1;z+=step)add(roadX(z)+r.c,z,roadX(z+1)+r.c,z+1,i);
    else for(let a=r.u0;a<=r.u1;a+=step){const x=roadX(r.c)+a;add(x,r.c,x+1,r.c,i)}});
  return pts36}
function inst36(geo,mat,list,shadow){if(!list.length)return null;
  const im=new THREE.InstancedMesh(geo,mat,list.length),dm=new THREE.Object3D();
  list.forEach((p,i)=>{dm.position.set(p.x,p.y,p.z);dm.rotation.set(0,p.ry||0,0);dm.scale.set(p.sx||1,p.sy||1,p.sz||1);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)});
  im.castShadow=!!shadow;im.receiveShadow=true;im.frustumCulled=false;im.instanceMatrix.needsUpdate=true;world.add(im);extra36.push(im);return im}
function wires36(poles,y0){// cables entre postes consecutivos, con la curva de la catenaria
  const P=[];for(let i=0;i+1<poles.length;i++){const a=poles[i],b=poles[i+1];if(Math.hypot(a.x-b.x,a.z-b.z)>48)continue;
    for(const off of [-.9,0,.9]){const cx=Math.cos(a.ry)*off,cz=-Math.sin(a.ry)*off;let px=null;
      for(let k=0;k<=6;k++){const t=k/6,x=a.x+(b.x-a.x)*t+cx,z=a.z+(b.z-a.z)*t+cz,y=a.y+y0+(b.y-a.y)*t-Math.sin(t*Math.PI)*.9;if(px)P.push(px[0],px[1],px[2],x,y,z);px=[x,y,z]}}}
  if(!P.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x1a1a1a}));l.frustumCulled=false;world.add(l);extra36.push(l)}
function build36(){
  for(const m of extra36)if(m.parent)m.parent.remove(m);extra36=[];
  if(!world||LEGACY26)return;
  const pts=roadPts36(),inTownX=(x,z)=>townW(x,z)>.02;
  // ----- pintura: línea de rayas en el centro de cada camino -----
  const dash=[];
  for(const p of pts){
    // en las rutas sacamos las rayas cerca de los cruces y de la plaza del almacén
    if(p.road>=0&&(Math.abs(p.x-roadX(p.z))<7||roadD36(p.x,p.z,p.road)<6))continue;
    if(p.road===-1&&(roadD36(p.x,p.z)<6||Math.hypot(p.x,p.z)<40||p.z>455))continue;
    if(p.road>=0&&ROADS36[p.road].t==='r'||p.road>=0&&ROADS36[p.road].t==='x')continue;
    if(((p.x+p.z)/7|0)%2)continue;
    const y=terrainY(p.x,p.z);if(y<WATER_Y+.4)continue;
    dash.push({x:p.x,y:y+.07,z:p.z,ry:p.yaw,sx:p.road===-1?.28:.2,sy:1,sz:3})}
  const dm=new THREE.MeshLambertMaterial({color:0xd8d2a8,emissive:0x2a2818});
  const dg=new THREE.BoxGeometry(1,.05,1);
  inst36(dg,dm,dash,false);
  // ----- postes de luz y cables -----
  const poles=[],byRoad=new Map();
  for(const p of pts){if(p.road>=0&&(ROADS36[p.road].t==='r'||ROADS36[p.road].t==='x'))continue;
    const idx=(byRoad.get(p.road)||0)+1;byRoad.set(p.road,idx);if(idx%6!==0)continue;
    // al costado del camino
    const nx=Math.cos(p.yaw),nz=-Math.sin(p.yaw),x=p.x+nx*6,z=p.z+nz*6;
    if(inTownX(x,z)||p.z>440&&p.road===-1)continue;
    if(roadD36(x,z,p.road)<5||Math.abs(x-roadX(z))<5&&p.road>=0)continue;
    if(Math.hypot(x,z)<35)continue;
    const y=terrainY(x,z);if(y<WATER_Y+.6)continue;
    poles.push({x,y,z,ry:p.yaw,road:p.road})}
  const pm=new THREE.MeshLambertMaterial({color:0x4a3a2a});
  const trunk=new THREE.CylinderGeometry(.11,.15,1,6).translate(0,.5,0),bar=new THREE.BoxGeometry(2.3,.12,.14).translate(0,0,0);
  inst36(trunk,pm,poles.map(p=>({x:p.x,y:p.y,z:p.z,sx:1,sy:8.6,sz:1})),true);
  inst36(bar,pm,poles.map(p=>({x:p.x,y:p.y+7.7,z:p.z,ry:p.ry})),false);
  const isoMat=new THREE.MeshLambertMaterial({color:0xaab6aa});
  inst36(new THREE.BoxGeometry(.08,.14,.08),isoMat,poles.flatMap(p=>[-.9,0,.9].map(o=>({x:p.x+Math.cos(p.ry)*o,y:p.y+7.78,z:p.z-Math.sin(p.ry)*o}))),false);
  for(const p of poles)solid32(p.x,p.z,.18,.18,p.y,8);
  // los cables van por camino, en el orden de los postes
  const groups=new Map();for(const p of poles){if(!groups.has(p.road))groups.set(p.road,[]);groups.get(p.road).push(p)}
  groups.forEach(g=>wires36(g,7.7));
  // ----- faroles: calles del pueblo y avenidas de la ciudad -----
  const lamps=[];
  for(const p of pts){const r=p.road>=0?ROADS36[p.road]:null;if(!r||(r.t!=='r'&&r.t!=='x'))continue;
    if(((p.x+p.z)/7|0)%4)continue;
    const nx=Math.cos(p.yaw),nz=-Math.sin(p.yaw);for(const s of [-1,1]){const x=p.x+nx*s*3.6,z=p.z+nz*s*3.6;const y=terrainY(x,z);lamps.push({x,y,z,ry:Math.atan2(-nx*s,-nz*s)})}}
  if(typeof C26B!=='undefined'){const zT=486,zB=696;
    for(let i=0;i<=5;i++){const zc=zT+i*C26P+C26P/2;if(zc>zB)break;for(const s of [-1,1]){const x=CITY_RX+s*5.8,y=terrainY(x,zc);lamps.push({x,y,z:zc,ry:s>0?Math.PI/2:-Math.PI/2})}}
    for(let i=0;i<=5;i++){const zc=zT+i*C26P;for(const s of [-1,1]){const x=CITY_RX+s*5.8,y=terrainY(x,zc+C26S/2+1);lamps.push({x,y,z:zc+C26S/2+1,ry:s>0?Math.PI/2:-Math.PI/2})}}}
  const lm=new THREE.MeshLambertMaterial({color:0x3a3d3c});
  inst36(new THREE.CylinderGeometry(.07,.09,1,6).translate(0,.5,0),lm,lamps.map(l=>({x:l.x,y:l.y,z:l.z,sx:1,sy:5,sz:1})),true);
  inst36(new THREE.BoxGeometry(.1,.1,1.1).translate(0,0,.5),lm,lamps.map(l=>({x:l.x,y:l.y+5,z:l.z,ry:l.ry})),false);
  inst36(new THREE.BoxGeometry(.3,.1,.5),new THREE.MeshLambertMaterial({color:0xcfc8a0,emissive:0x3a3418}),lamps.map(l=>({x:l.x+Math.sin(l.ry)*.95,y:l.y+4.92,z:l.z+Math.cos(l.ry)*.95,ry:l.ry})),false);
  for(const l of lamps)solid32(l.x,l.z,.14,.14,l.y,5)}
const _genWorld36=genWorld;genWorld=function(seed){const r=_genWorld36.apply(this,arguments);try{build36()}catch(e){console.error('v36map',e)}return r};
